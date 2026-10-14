// PDF extraction service - Module 2: Data Engineering / ETL pipeline
// Uses pdfjs-dist to extract text page-by-page from text-based PDFs
// Scanned PDFs are detected and flagged as requiring OCR

import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import { ExtractionStatus, ExtractionResult } from '../types';
import { logger } from '../utils/logger';
import { config } from '../config';

// PDF.js - use the legacy build for Node.js CommonJS compatibility
// pdfjs-dist v4+ ships both ESM and legacy CJS builds
// eslint-disable-next-line @typescript-eslint/no-var-requires
let pdfjsLib: any;
try {
  pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
} catch {
  // Fallback for newer pdfjs-dist versions
  try {
    pdfjsLib = require('pdfjs-dist');
  } catch (e2) {
    throw new Error('pdfjs-dist is not installed. Run npm install in the backend folder.');
  }
}

// Minimum meaningful characters per page to decide if text extraction succeeded
const MIN_TEXT_LENGTH_PER_PAGE = 20;
const MIN_TOTAL_TEXT_RATIO = 0.3; // 30% of pages must have text for EXTRACTED status

/**
 * Normalize whitespace while preserving the original text structure.
 * Module 2: Text cleaning step in the ingestion pipeline.
 */
function normalizeText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Compute SHA-256 hash of a file for integrity and deduplication.
 * Module 4: File integrity verification.
 */
export function computeFileHash(filePath: string): string {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Validate PDF file signature (magic bytes).
 * Module 4: File type verification beyond extension and MIME type.
 */
export function validatePdfSignature(filePath: string): boolean {
  try {
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(5);
    fs.readSync(fd, buffer, 0, 5, 0);
    fs.closeSync(fd);
    // PDF magic bytes: %PDF-
    return buffer.toString('ascii', 0, 5) === '%PDF-';
  } catch {
    return false;
  }
}

/**
 * Extract text from a PDF file page by page.
 * Module 2: Core ETL — extract and normalize document text.
 * 
 * Returns ExtractionResult with per-page text and overall status.
 * Never fabricates text: if extraction yields nothing, marks OCR_REQUIRED.
 */
export async function extractPdfText(filePath: string): Promise<ExtractionResult> {
  // Validate file signature before processing
  if (!validatePdfSignature(filePath)) {
    logger.warn('File failed PDF signature check', { filePath: path.basename(filePath) });
    return {
      pageCount: 0,
      pages: [],
      status: ExtractionStatus.FAILED,
      error: 'File does not appear to be a valid PDF (invalid file signature)',
    };
  }

  let fileBuffer: Buffer;
  try {
    fileBuffer = fs.readFileSync(filePath);
  } catch (err) {
    return {
      pageCount: 0,
      pages: [],
      status: ExtractionStatus.FAILED,
      error: 'Could not read the uploaded file',
    };
  }

  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(fileBuffer),
      // Disable password prompts and dangerous features
      disableFontFace: true,
      ignoreErrors: false,
    });

    const pdf = await loadingTask.promise;
    const totalPages = pdf.numPages;

    // Enforce page count limit
    if (totalPages > config.maxPageCount) {
      return {
        pageCount: totalPages,
        pages: [],
        status: ExtractionStatus.FAILED,
        error: `PDF has ${totalPages} pages, which exceeds the maximum of ${config.maxPageCount} pages`,
      };
    }

    const pages: ExtractionResult['pages'] = [];
    let pagesWithText = 0;

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        // Concatenate text items into a single string
        const rawText = textContent.items
          .map((item: any) => ('str' in item ? item.str : ''))
          .join(' ');

        const normalizedText = normalizeText(rawText);

        if (normalizedText.length >= MIN_TEXT_LENGTH_PER_PAGE) {
          pagesWithText++;
        }

        pages.push({
          pageNumber: pageNum,
          text: rawText.trim(),
          normalizedText,
        });
      } catch (pageErr) {
        logger.warn('Failed to extract page text', {
          pageNumber: pageNum,
          error: (pageErr as Error).message,
        });
        pages.push({
          pageNumber: pageNum,
          text: '',
          normalizedText: '',
        });
      }
    }

    // Determine overall extraction status
    let status: ExtractionStatus;
    if (totalPages === 0) {
      status = ExtractionStatus.FAILED;
    } else if (pagesWithText === 0) {
      // No text extracted from any page — likely a scanned PDF
      status = ExtractionStatus.OCR_REQUIRED;
    } else if (pagesWithText / totalPages < MIN_TOTAL_TEXT_RATIO) {
      // Only a small fraction of pages have text — partial scan or mixed PDF
      status = ExtractionStatus.OCR_REQUIRED;
    } else {
      status = ExtractionStatus.EXTRACTED;
    }

    logger.info('PDF extraction complete', {
      pageCount: totalPages,
      pagesWithText,
      status,
    });

    return { pageCount: totalPages, pages, status };
  } catch (err) {
    const message = (err as Error).message || 'Unknown extraction error';
    logger.error('PDF extraction failed', { error: message });
    return {
      pageCount: 0,
      pages: [],
      status: ExtractionStatus.FAILED,
      error: `Failed to parse PDF: ${message}`,
    };
  }
}
