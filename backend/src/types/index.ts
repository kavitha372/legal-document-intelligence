// Core type definitions for the Legal Document Intelligence Platform
// SQLite stores these as strings — values are validated in application code

export enum UserRole {
  ADMIN = 'ADMIN',
  LEGAL_REVIEWER = 'LEGAL_REVIEWER',
  READ_ONLY = 'READ_ONLY',
}

export enum ExtractionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  EXTRACTED = 'EXTRACTED',
  OCR_REQUIRED = 'OCR_REQUIRED',
  FAILED = 'FAILED',
}

export enum ReviewStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  REVIEWED = 'REVIEWED',
  NEEDS_MORE_INFO = 'NEEDS_MORE_INFO',
}

export enum DetectionStatus {
  FOUND = 'FOUND',
  NOT_DETECTED = 'NOT_DETECTED',
  NEEDS_REVIEW = 'NEEDS_REVIEW',
}

export interface JwtPayload {
  userId: string;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ExtractionResult {
  pageCount: number;
  pages: Array<{
    pageNumber: number;
    text: string;
    normalizedText: string;
  }>;
  status: ExtractionStatus;
  error?: string;
}

export interface SearchResult {
  pageNumber: number;
  snippet: string;
  matchedTerms: string[];
  score: number;
  context: string;
}

export interface EvidencePassage {
  pageNumber: number;
  text: string;
  relevanceScore: number;
  matchedTerms: string[];
}

export interface QuestionAnswerResult {
  question: string;
  answer: string;
  evidence: EvidencePassage[];
  hasEvidence: boolean;
  retrievalMethod: string;
  documentId: string;
  disclaimer: string;
}

export interface ChecklistPattern {
  key: string;
  label: string;
  patterns: string[];
  description: string;
}

export interface ChecklistResult {
  itemKey: string;
  itemLabel: string;
  detectionStatus: DetectionStatus;
  matchedText?: string;
  pageNumber?: number;
  patterns: string[];
}
