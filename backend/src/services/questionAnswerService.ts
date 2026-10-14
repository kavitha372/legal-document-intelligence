// Question-answering service - Module 3: RAG pipeline (baseline: template-based)
// Answers questions using ONLY retrieved document evidence
// Never invents clauses, dates, page numbers, or legal conclusions

import { retrieveEvidencePassages } from './searchService';
import { QuestionAnswerResult, EvidencePassage } from '../types';
import { config } from '../config';
import { logger } from '../utils/logger';

const INSUFFICIENT_EVIDENCE_THRESHOLD = 1; // Minimum passages required
const MIN_RELEVANCE_SCORE = 1;

/**
 * Generate a structured answer from retrieved evidence.
 * This is the baseline template approach — no LLM required.
 * Module 3: Source-aware response with page citations.
 */
function buildTemplateAnswer(
  question: string,
  evidence: EvidencePassage[],
  documentTitle: string
): string {
  if (evidence.length === 0) {
    return 'I could not find sufficient evidence in the uploaded document to answer this question.';
  }

  const pageRefs = evidence
    .map((e) => `page ${e.pageNumber}`)
    .join(', ');

  const topPassage = evidence[0];
  const matchedTermsList = [...new Set(evidence.flatMap((e) => e.matchedTerms))].slice(0, 5).join(', ');

  return (
    `Based on the document "${documentTitle}", the following relevant passage(s) were found ` +
    `on ${pageRefs}:\n\n` +
    `The document contains text related to your query about "${question}". ` +
    `Key terms detected: ${matchedTermsList || 'see evidence below'}.\n\n` +
    `Please review the evidence passages below to verify the specific clause content. ` +
    `This is a preliminary retrieval result and requires human verification.\n\n` +
    `${config.disclaimer}`
  );
}

/**
 * Answer a question using document evidence only.
 * Module 3: Implements the retrieve-then-generate RAG pattern.
 * 
 * Baseline: keyword retrieval + structured template response.
 * Optional extension: Ollama local LLM (not implemented here).
 */
export async function answerQuestion(
  documentId: string,
  documentTitle: string,
  question: string
): Promise<QuestionAnswerResult> {
  logger.debug('Processing question', { documentId, questionLength: question.length });

  // Step 1: Retrieve relevant passages from the document
  const allEvidence = await retrieveEvidencePassages(documentId, question, 5);

  // Step 2: Filter to sufficiently relevant passages
  const evidence = allEvidence.filter(
    (e) => e.relevanceScore >= MIN_RELEVANCE_SCORE
  );

  const hasEvidence = evidence.length >= INSUFFICIENT_EVIDENCE_THRESHOLD;

  // Step 3: Build answer from evidence only
  const answer = buildTemplateAnswer(question, hasEvidence ? evidence : [], documentTitle);

  return {
    question,
    answer,
    evidence: hasEvidence ? evidence : [],
    hasEvidence,
    retrievalMethod: 'keyword-tfidf',
    documentId,
    disclaimer: config.disclaimer,
  };
}
