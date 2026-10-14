// Search service - Module 2: Keyword-based retrieval with TF-IDF scoring
// Module 3: Evidence retrieval layer for question-answering (RAG baseline)

import prisma from '../utils/prisma';
import { SearchResult, EvidencePassage } from '../types';
import { logger } from '../utils/logger';

const CONTEXT_CHARS = 300; // Characters of surrounding context to include
const MAX_RESULTS = 20;

/**
 * Tokenize text for matching — lowercase, split on whitespace and punctuation
 */
function tokenize(text: string): string[] {
  return text.toLowerCase().split(/[\s\W]+/).filter((t) => t.length > 1);
}

/**
 * Find all occurrences of a query term in page text and return surrounding context.
 */
function findMatches(
  pageText: string,
  queryTokens: string[]
): { snippet: string; context: string; score: number; matchedTerms: string[] } | null {
  const lowerText = pageText.toLowerCase();
  const matchedTerms: string[] = [];
  let bestMatchIndex = -1;
  let highScore = 0;

  for (const token of queryTokens) {
    const idx = lowerText.indexOf(token);
    if (idx !== -1) {
      matchedTerms.push(token);
      // Simple TF scoring: count occurrences
      const count = (lowerText.match(new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
      if (count > highScore) {
        highScore = count;
        bestMatchIndex = idx;
      }
    }
  }

  if (matchedTerms.length === 0) return null;

  // Extract snippet around best match
  const start = Math.max(0, bestMatchIndex - 50);
  const end = Math.min(pageText.length, bestMatchIndex + 250);
  const snippet = (start > 0 ? '...' : '') + pageText.slice(start, end) + (end < pageText.length ? '...' : '');

  // Extract wider context
  const ctxStart = Math.max(0, bestMatchIndex - CONTEXT_CHARS / 2);
  const ctxEnd = Math.min(pageText.length, bestMatchIndex + CONTEXT_CHARS);
  const context = (ctxStart > 0 ? '...' : '') + pageText.slice(ctxStart, ctxEnd) + (ctxEnd < pageText.length ? '...' : '');

  return {
    snippet,
    context,
    score: matchedTerms.length * highScore, // Simple TF-IDF proxy
    matchedTerms,
  };
}

/**
 * Search document pages for a query string.
 * Returns ranked snippets with page references.
 * Module 2: Retrieval step; Module 3: Evidence sourcing for QA.
 */
export async function searchDocument(
  documentId: string,
  query: string
): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  // Retrieve pages from the authorized document
  const pages = await prisma.documentPage.findMany({
    where: { documentId },
    orderBy: { pageNumber: 'asc' },
    select: {
      pageNumber: true,
      normalizedText: true,
      extractedText: true,
    },
  });

  const results: SearchResult[] = [];

  for (const page of pages) {
    const textToSearch = page.normalizedText || page.extractedText;
    if (!textToSearch) continue;

    const match = findMatches(textToSearch, queryTokens);
    if (match) {
      results.push({
        pageNumber: page.pageNumber,
        snippet: match.snippet,
        matchedTerms: match.matchedTerms,
        score: match.score,
        context: match.context,
      });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, MAX_RESULTS);
}

/**
 * Retrieve evidence passages for question answering.
 * Module 3: RAG retrieval — returns the most relevant passages with page references.
 */
export async function retrieveEvidencePassages(
  documentId: string,
  question: string,
  topK = 5
): Promise<EvidencePassage[]> {
  const queryTokens = tokenize(question);
  if (queryTokens.length === 0) return [];

  const pages = await prisma.documentPage.findMany({
    where: { documentId },
    orderBy: { pageNumber: 'asc' },
    select: {
      pageNumber: true,
      normalizedText: true,
      extractedText: true,
    },
  });

  const scored: EvidencePassage[] = [];

  for (const page of pages) {
    const textToSearch = page.normalizedText || page.extractedText;
    if (!textToSearch) continue;

    const match = findMatches(textToSearch, queryTokens);
    if (match) {
      scored.push({
        pageNumber: page.pageNumber,
        text: match.context,
        relevanceScore: match.score,
        matchedTerms: match.matchedTerms,
      });
    }
  }

  scored.sort((a, b) => b.relevanceScore - a.relevanceScore);
  return scored.slice(0, topK);
}
