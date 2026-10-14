import { format, formatDistanceToNow } from 'date-fns';
import { ExtractionStatus, ReviewStatus, DetectionStatus } from '../types';

export function formatDate(dateStr: string): string {
  try { return format(new Date(dateStr), 'MMM d, yyyy'); } catch { return dateStr; }
}
export function formatDateTime(dateStr: string): string {
  try { return format(new Date(dateStr), 'MMM d, yyyy HH:mm'); } catch { return dateStr; }
}
export function formatRelative(dateStr: string): string {
  try { return formatDistanceToNow(new Date(dateStr), { addSuffix: true }); } catch { return dateStr; }
}

export function extractionStatusLabel(s: ExtractionStatus | string): string {
  const map: Record<string, string> = {
    PENDING: 'Pending', PROCESSING: 'Processing', EXTRACTED: 'Text Extracted',
    OCR_REQUIRED: 'OCR Required', FAILED: 'Failed',
  };
  return map[s] || s;
}
export function extractionStatusBadge(s: ExtractionStatus | string): string {
  const map: Record<string, string> = {
    PENDING: 'badge-gray', PROCESSING: 'badge-info', EXTRACTED: 'badge-success',
    OCR_REQUIRED: 'badge-warning', FAILED: 'badge-danger',
  };
  return map[s] || 'badge-gray';
}

export function reviewStatusLabel(s: ReviewStatus | string): string {
  const map: Record<string, string> = {
    PENDING: 'Pending', UNDER_REVIEW: 'Under Review', REVIEWED: 'Reviewed',
    NEEDS_MORE_INFO: 'Needs More Info',
  };
  return map[s] || s;
}
export function reviewStatusBadge(s: ReviewStatus | string): string {
  const map: Record<string, string> = {
    PENDING: 'badge-gray', UNDER_REVIEW: 'badge-info', REVIEWED: 'badge-success',
    NEEDS_MORE_INFO: 'badge-warning',
  };
  return map[s] || 'badge-gray';
}

export function detectionStatusLabel(s: DetectionStatus | string): string {
  const map: Record<string, string> = {
    FOUND: 'Found', NOT_DETECTED: 'Not Detected', NEEDS_REVIEW: 'Needs Review',
  };
  return map[s] || s;
}
export function detectionStatusBadge(s: DetectionStatus | string): string {
  const map: Record<string, string> = {
    FOUND: 'badge-success', NOT_DETECTED: 'badge-gray', NEEDS_REVIEW: 'badge-warning',
  };
  return map[s] || 'badge-gray';
}

export function roleLabel(role: string): string {
  const map: Record<string, string> = {
    ADMIN: 'Administrator', LEGAL_REVIEWER: 'Legal Reviewer', READ_ONLY: 'Read Only',
  };
  return map[role] || role;
}
export function roleBadge(role: string): string {
  const map: Record<string, string> = {
    ADMIN: 'badge-danger', LEGAL_REVIEWER: 'badge-primary', READ_ONLY: 'badge-gray',
  };
  return map[role] || 'badge-gray';
}
