// Audit logging service - Module 4: Governance and audit trail
// Records security-relevant events: logins, uploads, searches, admin actions
// Never logs passwords, tokens, or full document text

import prisma from '../utils/prisma';
import { logger } from '../utils/logger';

export interface AuditEventData {
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  outcome?: 'SUCCESS' | 'FAILURE' | 'DENIED';
  requestId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Write an audit event to the database.
 * Failures are logged but never thrown — audit logging must not break the main flow.
 */
export async function recordAuditEvent(data: AuditEventData): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: data.userId ?? null,
        action: data.action,
        entityType: data.entityType ?? null,
        entityId: data.entityId ?? null,
        outcome: data.outcome ?? 'SUCCESS',
        requestId: data.requestId ?? null,
        // Serialize metadata — exclude sensitive fields before calling this
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
    });
  } catch (err) {
    // Audit log failure should not crash the application
    logger.error('Failed to write audit log', {
      action: data.action,
      error: (err as Error).message,
    });
  }
}

// Common audit action constants
export const AuditActions = {
  // Authentication
  LOGIN_SUCCESS: 'AUTH_LOGIN_SUCCESS',
  LOGIN_FAILURE: 'AUTH_LOGIN_FAILURE',
  LOGOUT: 'AUTH_LOGOUT',
  
  // Documents
  DOCUMENT_UPLOAD: 'DOCUMENT_UPLOAD',
  DOCUMENT_DELETE: 'DOCUMENT_DELETE',
  DOCUMENT_VIEW: 'DOCUMENT_VIEW',
  DOCUMENT_EXTRACTION: 'DOCUMENT_EXTRACTION',
  
  // Search and QA
  DOCUMENT_SEARCH: 'DOCUMENT_SEARCH',
  DOCUMENT_QUESTION: 'DOCUMENT_QUESTION',
  
  // Checklist
  CHECKLIST_RUN: 'CHECKLIST_RUN',
  CHECKLIST_REVIEW: 'CHECKLIST_REVIEW',
  
  // Administration
  USER_CREATE: 'ADMIN_USER_CREATE',
  USER_UPDATE: 'ADMIN_USER_UPDATE',
  AUDIT_LOG_VIEW: 'ADMIN_AUDIT_LOG_VIEW',
  
  // Access control
  ACCESS_DENIED: 'ACCESS_DENIED',
} as const;
