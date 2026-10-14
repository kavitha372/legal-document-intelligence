// Checklist service - Module 2: Rule-based classification
// Applies configurable keyword patterns to detect likely clause presence
// Never claims legal correctness — results are preliminary flags only

import prisma from '../utils/prisma';
import { DetectionStatus, ChecklistPattern, ChecklistResult } from '../types';
import { logger } from '../utils/logger';

/**
 * Default checklist patterns — configurable, transparent, editable.
 * Each pattern is a keyword set; detection does NOT prove legal sufficiency.
 */
export const DEFAULT_CHECKLIST_PATTERNS: ChecklistPattern[] = [
  {
    key: 'PARTIES',
    label: 'Parties',
    patterns: ['between', 'party', 'parties', 'client', 'provider', 'vendor', 'contractor', 'customer', 'licensor', 'licensee'],
    description: 'Identifies language describing the contracting parties',
  },
  {
    key: 'EFFECTIVE_DATE',
    label: 'Effective Date',
    patterns: ['effective date', 'entered into', 'dated', 'as of', 'commence', 'commencement'],
    description: 'Identifies language indicating when the agreement becomes effective',
  },
  {
    key: 'TERM',
    label: 'Contract Term / Duration',
    patterns: ['term', 'duration', 'period', 'commencement date', 'renewal', 'expires', 'expiration', 'initial term'],
    description: 'Identifies language describing the agreement duration',
  },
  {
    key: 'TERMINATION',
    label: 'Termination Clause',
    patterns: ['termination', 'terminate', 'notice period', 'notice of termination', 'right to terminate', 'early termination'],
    description: 'Identifies language related to agreement termination',
  },
  {
    key: 'CONFIDENTIALITY',
    label: 'Confidentiality Clause',
    patterns: ['confidential', 'non-disclosure', 'nda', 'proprietary information', 'confidentiality', 'trade secret'],
    description: 'Identifies language related to confidential information handling',
  },
  {
    key: 'GOVERNING_LAW',
    label: 'Governing Law',
    patterns: ['governing law', 'jurisdiction', 'applicable law', 'governed by', 'choice of law', 'venue'],
    description: 'Identifies language specifying the applicable legal framework',
  },
  {
    key: 'SIGNATURES',
    label: 'Signature Section',
    patterns: ['signature', 'signed by', 'witness', 'in witness whereof', 'duly authorized', 'executed by', 'sign below'],
    description: 'Identifies language or sections for signatures',
  },
];

/**
 * Check a single page of text against all patterns for a checklist item.
 */
function checkPatterns(
  text: string,
  patterns: string[]
): { found: boolean; matchedPattern: string | null; excerpt: string | null } {
  const lowerText = text.toLowerCase();

  for (const pattern of patterns) {
    const idx = lowerText.indexOf(pattern.toLowerCase());
    if (idx !== -1) {
      // Extract a short excerpt around the match
      const start = Math.max(0, idx - 30);
      const end = Math.min(text.length, idx + pattern.length + 100);
      const excerpt = (start > 0 ? '...' : '') + text.slice(start, end).trim() + (end < text.length ? '...' : '');
      return { found: true, matchedPattern: pattern, excerpt };
    }
  }
  return { found: false, matchedPattern: null, excerpt: null };
}

/**
 * Run the checklist against all pages of a document.
 * Module 2: Rule-based document classification.
 * 
 * Returns FOUND, NOT_DETECTED, or NEEDS_REVIEW for each item.
 * Saves results to the database.
 */
export async function runChecklist(
  documentId: string,
  patterns: ChecklistPattern[] = DEFAULT_CHECKLIST_PATTERNS
): Promise<ChecklistResult[]> {
  // Retrieve all document pages
  const pages = await prisma.documentPage.findMany({
    where: { documentId },
    orderBy: { pageNumber: 'asc' },
    select: { pageNumber: true, normalizedText: true, extractedText: true },
  });

  if (pages.length === 0) {
    logger.warn('No pages found for checklist', { documentId });
    return patterns.map((p) => ({
      itemKey: p.key,
      itemLabel: p.label,
      detectionStatus: DetectionStatus.NEEDS_REVIEW,
      matchedText: undefined,
      pageNumber: undefined,
      patterns: p.patterns,
    }));
  }

  const results: ChecklistResult[] = [];

  for (const pattern of patterns) {
    let found = false;
    let matchedText: string | undefined;
    let matchedPage: number | undefined;
    let lowConfidence = false;

    // Search each page for the pattern
    for (const page of pages) {
      const textToSearch = page.normalizedText || page.extractedText;
      if (!textToSearch) continue;

      const check = checkPatterns(textToSearch, pattern.patterns);
      if (check.found) {
        found = true;
        matchedText = check.excerpt ?? undefined;
        matchedPage = page.pageNumber;
        break;
      }
    }

    // Determine detection status
    let detectionStatus: DetectionStatus;
    if (found) {
      detectionStatus = DetectionStatus.FOUND;
    } else {
      // If total extracted text is very short, result is ambiguous
      const totalText = pages.reduce((acc, p) => acc + (p.normalizedText?.length || 0), 0);
      if (totalText < 100) {
        detectionStatus = DetectionStatus.NEEDS_REVIEW;
        lowConfidence = true;
      } else {
        detectionStatus = DetectionStatus.NOT_DETECTED;
      }
    }

    results.push({
      itemKey: pattern.key,
      itemLabel: pattern.label,
      detectionStatus,
      matchedText,
      pageNumber: matchedPage,
      patterns: pattern.patterns,
    });
  }

  // Persist results to database (upsert)
  await Promise.all(
    results.map((result) =>
      prisma.checklistItem.upsert({
        where: {
          documentId_itemKey: {
            documentId,
            itemKey: result.itemKey,
          },
        },
        update: {
          detectionStatus: result.detectionStatus,
          matchedText: result.matchedText ?? null,
          pageNumber: result.pageNumber ?? null,
          updatedAt: new Date(),
        },
        create: {
          documentId,
          itemKey: result.itemKey,
          itemLabel: result.itemLabel,
          detectionStatus: result.detectionStatus,
          matchedText: result.matchedText ?? null,
          pageNumber: result.pageNumber ?? null,
        },
      })
    )
  );

  logger.info('Checklist run complete', {
    documentId,
    found: results.filter((r) => r.detectionStatus === DetectionStatus.FOUND).length,
    notDetected: results.filter((r) => r.detectionStatus === DetectionStatus.NOT_DETECTED).length,
    needsReview: results.filter((r) => r.detectionStatus === DetectionStatus.NEEDS_REVIEW).length,
  });

  return results;
}
