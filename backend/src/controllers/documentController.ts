// Document controller - Module 1: API endpoints, Module 2: Data pipeline
// Handles upload, extraction, listing, details, search, QA, and checklist

import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { handleUpload } from '../middleware/upload';
import { extractPdfText, computeFileHash } from '../services/pdfExtractor';
import { searchDocument } from '../services/searchService';
import { answerQuestion } from '../services/questionAnswerService';
import { runChecklist } from '../services/checklistService';
import { recordAuditEvent, AuditActions } from '../services/auditService';
import { config } from '../config';
import { UserRole, ExtractionStatus } from '../types';
import { logger } from '../utils/logger';

/**
 * POST /api/documents
 * Upload and extract a PDF. Module 2: Ingestion pipeline.
 */
export async function uploadDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await handleUpload(req as any, res as any);

    const file = req.file;
    if (!file) {
      throw new AppError(400, 'No file uploaded');
    }

    const { title, description } = req.body;
    if (!title?.trim()) {
      // Clean up the uploaded file if validation fails
      fs.unlinkSync(file.path);
      throw new AppError(400, 'Document title is required');
    }

    const storedFilename = file.filename;
    const storedPath = file.path;

    // Compute file hash for integrity
    const fileHash = computeFileHash(storedPath);

    // Create initial document record
    const document = await prisma.document.create({
      data: {
        ownerId: req.user!.userId,
        title: title.trim(),
        description: description?.trim() || null,
        originalFilename: file.originalname,
        storedFilename,
        fileHash,
        extractionStatus: 'PROCESSING',
        reviewStatus: 'PENDING',
      },
    });

    await recordAuditEvent({
      userId: req.user?.userId,
      action: AuditActions.DOCUMENT_UPLOAD,
      entityType: 'Document',
      entityId: document.id,
      requestId: req.requestId,
      metadata: { originalFilename: file.originalname, fileSize: file.size },
    });

    // Run extraction asynchronously but await here for immediate status
    try {
      const extraction = await extractPdfText(storedPath);

      // Store page text in database
      if (extraction.pages.length > 0) {
        await prisma.documentPage.createMany({
          data: extraction.pages.map((p) => ({
            documentId: document.id,
            pageNumber: p.pageNumber,
            extractedText: p.text,
            normalizedText: p.normalizedText,
          })),
        });
      }

      // Update document with extraction results
      const updated = await prisma.document.update({
        where: { id: document.id },
        data: {
          pageCount: extraction.pageCount,
          extractionStatus: extraction.status,
        },
        include: {
          owner: { select: { username: true } },
          _count: { select: { pages: true } },
        },
      });

      await recordAuditEvent({
        userId: req.user?.userId,
        action: AuditActions.DOCUMENT_EXTRACTION,
        entityType: 'Document',
        entityId: document.id,
        outcome: extraction.status === ExtractionStatus.FAILED ? 'FAILURE' : 'SUCCESS',
        requestId: req.requestId,
        metadata: { status: extraction.status, pageCount: extraction.pageCount },
      });

      res.status(201).json({
        success: true,
        data: {
          document: updated,
          extraction: {
            status: extraction.status,
            pageCount: extraction.pageCount,
            error: extraction.error,
          },
        },
        message: getExtractionMessage(extraction.status),
      });
    } catch (extractErr) {
      await prisma.document.update({
        where: { id: document.id },
        data: { extractionStatus: 'FAILED' },
      });
      throw extractErr;
    }
  } catch (err) {
    next(err);
  }
}

function getExtractionMessage(status: ExtractionStatus | string): string {
  switch (status) {
    case 'EXTRACTED': return 'PDF text extracted successfully';
    case 'OCR_REQUIRED': return 'Scanned PDF detected — OCR required for text extraction';
    case 'FAILED': return 'PDF text extraction failed';
    default: return 'Document uploaded';
  }
}

/**
 * GET /api/documents
 * List documents accessible to the current user with filtering and pagination.
 * Module 4: IDOR prevention — users only see their own documents (or all for admin).
 */
export async function listDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string || '20', 10)));
    const skip = (page - 1) * limit;
    const search = (req.query.search as string) || '';
    const extractionStatus = req.query.extractionStatus as string | undefined;
    const reviewStatus = req.query.reviewStatus as string | undefined;

    // Build where clause — admins see all, others see only their documents
    const where: any = {
      AND: [
        req.user!.role === UserRole.ADMIN ? {} : { ownerId: req.user!.userId },
        search
          ? {
              OR: [
                { title: { contains: search } },
                { originalFilename: { contains: search } },
              ],
            }
          : {},
        extractionStatus ? { extractionStatus } : {},
        reviewStatus ? { reviewStatus } : {},
      ],
    };

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: { select: { username: true } },
          _count: { select: { pages: true, checklistItems: true } },
        },
      }),
      prisma.document.count({ where }),
    ]);

    res.json({
      success: true,
      data: { documents },
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/documents/:id
 * Get document details. Verifies ownership.
 */
export async function getDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const document = await getAuthorizedDocument(req.params.id, req.user!.userId, req.user!.role);

    await recordAuditEvent({
      userId: req.user?.userId,
      action: AuditActions.DOCUMENT_VIEW,
      entityType: 'Document',
      entityId: document.id,
      requestId: req.requestId,
    });

    res.json({ success: true, data: { document } });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/documents/:id/pages
 * Get all page text for a document.
 */
export async function getDocumentPages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await getAuthorizedDocument(req.params.id, req.user!.userId, req.user!.role);

    const pages = await prisma.documentPage.findMany({
      where: { documentId: req.params.id },
      orderBy: { pageNumber: 'asc' },
      select: { id: true, pageNumber: true, extractedText: true, createdAt: true },
    });

    res.json({ success: true, data: { pages } });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/documents/:id/status
 * Get extraction status only.
 */
export async function getDocumentStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const doc = await getAuthorizedDocument(req.params.id, req.user!.userId, req.user!.role);
    res.json({
      success: true,
      data: { extractionStatus: doc.extractionStatus, reviewStatus: doc.reviewStatus, pageCount: doc.pageCount },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/documents/:id
 * Admin or owner can delete. Removes file and all associated data.
 */
export async function deleteDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const document = await getAuthorizedDocument(req.params.id, req.user!.userId, req.user!.role);

    // Only admin or owner can delete
    if (req.user!.role !== UserRole.ADMIN && document.ownerId !== req.user!.userId) {
      throw new AppError(403, 'You do not have permission to delete this document');
    }

    // Remove the stored file
    const filePath = path.join(config.uploadDir, document.storedFilename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Cascade delete handles pages, checklist items via Prisma
    await prisma.document.delete({ where: { id: document.id } });

    await recordAuditEvent({
      userId: req.user?.userId,
      action: AuditActions.DOCUMENT_DELETE,
      entityType: 'Document',
      entityId: document.id,
      requestId: req.requestId,
    });

    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/documents/:id/search?q=...
 * Keyword search within document pages.
 * Module 2: Retrieval; Module 3: Evidence sourcing.
 */
export async function searchDocumentHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = (req.query.q as string) || '';
    if (!query.trim()) {
      res.status(400).json({ success: false, error: 'Search query is required' });
      return;
    }

    await getAuthorizedDocument(req.params.id, req.user!.userId, req.user!.role);

    const results = await searchDocument(req.params.id, query);

    await recordAuditEvent({
      userId: req.user?.userId,
      action: AuditActions.DOCUMENT_SEARCH,
      entityType: 'Document',
      entityId: req.params.id,
      requestId: req.requestId,
      // Do not log the query content to avoid storing sensitive search terms
      metadata: { resultCount: results.length },
    });

    res.json({
      success: true,
      data: {
        query,
        results,
        resultCount: results.length,
        documentId: req.params.id,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/documents/:id/ask
 * Evidence-grounded question answering.
 * Module 3: RAG pipeline.
 */
export async function askQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { question } = req.body;
    if (!question?.trim()) {
      throw new AppError(400, 'Question is required');
    }

    const document = await getAuthorizedDocument(req.params.id, req.user!.userId, req.user!.role);

    const result = await answerQuestion(document.id, document.title, question.trim());

    await recordAuditEvent({
      userId: req.user?.userId,
      action: AuditActions.DOCUMENT_QUESTION,
      entityType: 'Document',
      entityId: document.id,
      requestId: req.requestId,
      metadata: { hasEvidence: result.hasEvidence },
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/documents/:id/checklist
 * Run checklist analysis. Module 2: Rule-based classification.
 */
export async function runChecklistHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const document = await getAuthorizedDocument(req.params.id, req.user!.userId, req.user!.role);

    if (document.extractionStatus !== 'EXTRACTED') {
      throw new AppError(400, 'Checklist can only be run on documents with successfully extracted text');
    }

    const results = await runChecklist(document.id);

    await recordAuditEvent({
      userId: req.user?.userId,
      action: AuditActions.CHECKLIST_RUN,
      entityType: 'Document',
      entityId: document.id,
      requestId: req.requestId,
    });

    res.json({
      success: true,
      data: {
        results,
        documentId: document.id,
        disclaimer: config.disclaimer,
        note: 'These are keyword-based preliminary flags only. They cannot determine whether a contract is legally valid or enforceable.',
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/documents/:id/checklist
 * Get saved checklist results.
 */
export async function getChecklistResults(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await getAuthorizedDocument(req.params.id, req.user!.userId, req.user!.role);

    const items = await prisma.checklistItem.findMany({
      where: { documentId: req.params.id },
      orderBy: { itemKey: 'asc' },
      include: {
        reviewedBy: { select: { username: true } },
      },
    });

    res.json({ success: true, data: { items } });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/documents/:id/checklist/:itemId
 * Reviewer updates a checklist item. Module 4: Reviewer action recorded.
 */
export async function updateChecklistItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await getAuthorizedDocument(req.params.id, req.user!.userId, req.user!.role);

    const { reviewerNotes, detectionStatus } = req.body;

    const item = await prisma.checklistItem.update({
      where: { id: req.params.itemId },
      data: {
        reviewerNotes: reviewerNotes !== undefined ? reviewerNotes : undefined,
        detectionStatus: detectionStatus || undefined,
        reviewedById: req.user!.userId,
        reviewedAt: new Date(),
      },
      include: { reviewedBy: { select: { username: true } } },
    });

    await recordAuditEvent({
      userId: req.user?.userId,
      action: AuditActions.CHECKLIST_REVIEW,
      entityType: 'ChecklistItem',
      entityId: item.id,
      requestId: req.requestId,
    });

    res.json({ success: true, data: { item } });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/dashboard/stats
 * Returns document statistics for the current user.
 */
export async function getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const isAdmin = req.user!.role === UserRole.ADMIN;
    const userFilter = isAdmin ? {} : { ownerId: req.user!.userId };

    const [total, pendingReview, extracted, ocrRequired, recentDocs, recentActivity] = await Promise.all([
      prisma.document.count({ where: userFilter }),
      prisma.document.count({ where: { ...userFilter, reviewStatus: 'PENDING' } }),
      prisma.document.count({ where: { ...userFilter, extractionStatus: 'EXTRACTED' } }),
      prisma.document.count({ where: { ...userFilter, extractionStatus: 'OCR_REQUIRED' } }),
      prisma.document.findMany({
        where: userFilter,
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, title: true, extractionStatus: true, reviewStatus: true, createdAt: true },
      }),
      isAdmin
        ? prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: { user: { select: { username: true } } },
          })
        : [],
    ]);

    res.json({
      success: true,
      data: {
        stats: { total, pendingReview, extracted, ocrRequired },
        recentDocuments: recentDocs,
        recentActivity,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// Helper: verify document ownership or admin access (IDOR prevention)
// Module 4: Access control enforced at service/controller level
// ---------------------------------------------------------------------------
async function getAuthorizedDocument(documentId: string, userId: string, role: string) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      owner: { select: { username: true } },
      _count: { select: { pages: true, checklistItems: true } },
    },
  });

  if (!document) {
    throw new AppError(404, 'Document not found');
  }

  // Admin can access any document; others must be the owner
  if (role !== UserRole.ADMIN && document.ownerId !== userId) {
    throw new AppError(403, 'You do not have permission to access this document');
  }

  return document;
}
