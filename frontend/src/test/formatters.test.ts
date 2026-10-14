// Frontend utility tests
import { describe, it, expect } from 'vitest';
import {
  extractionStatusLabel, extractionStatusBadge,
  reviewStatusLabel, detectionStatusLabel, detectionStatusBadge, roleLabel
} from '../utils/formatters';

describe('Status formatters', () => {
  it('maps extraction status EXTRACTED to readable label', () => {
    expect(extractionStatusLabel('EXTRACTED')).toBe('Text Extracted');
  });

  it('maps extraction status OCR_REQUIRED to readable label', () => {
    expect(extractionStatusLabel('OCR_REQUIRED')).toBe('OCR Required');
  });

  it('maps extraction status FAILED to danger badge', () => {
    expect(extractionStatusBadge('FAILED')).toBe('badge-danger');
  });

  it('maps review status REVIEWED to readable label', () => {
    expect(reviewStatusLabel('REVIEWED')).toBe('Reviewed');
  });

  it('maps detection FOUND to success badge', () => {
    expect(detectionStatusBadge('FOUND')).toBe('badge-success');
  });

  it('maps detection NOT_DETECTED to readable label', () => {
    expect(detectionStatusLabel('NOT_DETECTED')).toBe('Not Detected');
  });

  it('maps NEEDS_REVIEW to warning badge', () => {
    expect(detectionStatusBadge('NEEDS_REVIEW')).toBe('badge-warning');
  });

  it('maps ADMIN role to human-readable label', () => {
    expect(roleLabel('ADMIN')).toBe('Administrator');
  });

  it('maps LEGAL_REVIEWER role to human-readable label', () => {
    expect(roleLabel('LEGAL_REVIEWER')).toBe('Legal Reviewer');
  });

  it('returns original string for unknown status', () => {
    expect(extractionStatusLabel('UNKNOWN_STATUS')).toBe('UNKNOWN_STATUS');
  });
});
