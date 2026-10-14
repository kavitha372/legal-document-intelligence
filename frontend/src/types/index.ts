// Shared TypeScript types for the frontend

export type UserRole = 'ADMIN' | 'LEGAL_REVIEWER' | 'READ_ONLY';

export type ExtractionStatus = 'PENDING' | 'PROCESSING' | 'EXTRACTED' | 'OCR_REQUIRED' | 'FAILED';
export type ReviewStatus = 'PENDING' | 'UNDER_REVIEW' | 'REVIEWED' | 'NEEDS_MORE_INFO';
export type DetectionStatus = 'FOUND' | 'NOT_DETECTED' | 'NEEDS_REVIEW';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface Document {
  id: string;
  ownerId: string;
  title: string;
  description?: string;
  originalFilename: string;
  storedFilename: string;
  fileHash: string;
  pageCount: number;
  extractionStatus: ExtractionStatus;
  reviewStatus: ReviewStatus;
  createdAt: string;
  updatedAt: string;
  owner?: { username: string };
  _count?: { pages: number; checklistItems: number };
}

export interface DocumentPage {
  id: string;
  pageNumber: number;
  extractedText: string;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  documentId: string;
  itemKey: string;
  itemLabel: string;
  detectionStatus: DetectionStatus;
  matchedText?: string;
  pageNumber?: number;
  reviewerNotes?: string;
  reviewedById?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  reviewedBy?: { username: string };
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  outcome: string;
  requestId?: string;
  metadata?: string;
  createdAt: string;
  user?: { username: string; role: UserRole };
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

export interface DashboardStats {
  stats: {
    total: number;
    pendingReview: number;
    extracted: number;
    ocrRequired: number;
  };
  recentDocuments: Partial<Document>[];
  recentActivity: AuditLog[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
