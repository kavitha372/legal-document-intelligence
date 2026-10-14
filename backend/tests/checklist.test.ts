// Checklist service tests - Module 2: Rule-based classification testing
// Tests detection of legal clauses from synthetic text

import { describe, it, expect } from 'vitest';
import { DEFAULT_CHECKLIST_PATTERNS } from '../src/services/checklistService';
import { DetectionStatus } from '../src/types';

// Helper: Simulate single-page text check (extracted from checklistService logic)
function checkPatterns(text: string, patterns: string[]): boolean {
  const lowerText = text.toLowerCase();
  return patterns.some((p) => lowerText.includes(p.toLowerCase()));
}

describe('Checklist Pattern Detection', () => {
  const terminationPattern = DEFAULT_CHECKLIST_PATTERNS.find((p) => p.key === 'TERMINATION')!;
  const confidentialityPattern = DEFAULT_CHECKLIST_PATTERNS.find((p) => p.key === 'CONFIDENTIALITY')!;
  const partiesPattern = DEFAULT_CHECKLIST_PATTERNS.find((p) => p.key === 'PARTIES')!;
  const governingLawPattern = DEFAULT_CHECKLIST_PATTERNS.find((p) => p.key === 'GOVERNING_LAW')!;

  // Test 12: Detection of a likely termination clause
  it('should detect termination language in document text', () => {
    const text = 'Either party may terminate this agreement by providing 30 days written notice of termination.';
    const found = checkPatterns(text, terminationPattern.patterns);
    expect(found).toBe(true);
  });

  // Test 13: Detection of a likely confidentiality clause
  it('should detect confidentiality language in document text', () => {
    const text = 'Each party agrees to keep confidential all information disclosed by the other party.';
    const found = checkPatterns(text, confidentialityPattern.patterns);
    expect(found).toBe(true);
  });

  // Test 14: Checklist item marked NOT_DETECTED for missing clause
  it('should not detect termination language in text without termination terms', () => {
    const text = 'The client agrees to pay the service fee within 30 days of invoice.';
    const found = checkPatterns(text, terminationPattern.patterns);
    expect(found).toBe(false);
  });

  // Test 15: Ambiguous case
  it('should have patterns for governing law detection', () => {
    const text = 'This agreement shall be governed by the laws of the State of New York.';
    const found = checkPatterns(text, governingLawPattern.patterns);
    expect(found).toBe(true);
  });

  it('should detect parties language', () => {
    const text = 'This agreement is entered into between TechCorp Inc. (Provider) and Acme Ltd (Client).';
    const found = checkPatterns(text, partiesPattern.patterns);
    expect(found).toBe(true);
  });

  it('should not fabricate a detection when text is completely unrelated', () => {
    const text = 'The weather forecast shows rain tomorrow morning.';
    const found = checkPatterns(text, terminationPattern.patterns);
    expect(found).toBe(false);
  });

  it('should be case-insensitive in detection', () => {
    const text = 'TERMINATION OF THIS AGREEMENT SHALL REQUIRE 60 DAYS WRITTEN NOTICE.';
    const found = checkPatterns(text, terminationPattern.patterns);
    expect(found).toBe(true);
  });

  it('should have all required default checklist keys', () => {
    const requiredKeys = ['PARTIES', 'EFFECTIVE_DATE', 'TERM', 'TERMINATION', 'CONFIDENTIALITY', 'GOVERNING_LAW', 'SIGNATURES'];
    const actualKeys = DEFAULT_CHECKLIST_PATTERNS.map((p) => p.key);
    for (const key of requiredKeys) {
      expect(actualKeys).toContain(key);
    }
  });
});
