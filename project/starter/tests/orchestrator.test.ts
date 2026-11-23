import { describe, expect, it } from 'vitest';
import { ReviewReportSchema } from '../src/types/report-types';
import { withRetry } from '../src/utils/error-handler';

it('retries once and returns the successful result', async () => {
  let attempts = 0;

  const result = await withRetry(async () => {
    attempts++;
    if (attempts === 1) throw new Error('temporary failure');
    return 'ok';
  }, 1, 0);

  expect(result).toBe('ok');
  expect(attempts).toBe(2);
});

const validReport = {
  pullRequest: {
    owner: 'acme',
    repo: 'sample',
    number: 42
  },
  fileReviews: [{
    file: 'src/example.ts',
    codeQuality: {
      file: 'src/example.ts',
      issues: [],
      overallScore: 95,
      summary: 'No issues found.'
    },
    testCoverage: {
      file: 'src/example.ts',
      hasTests: true,
      testFiles: ['tests/example.test.ts'],
      untestedPaths: [],
      coverageEstimate: 90,
      summary: 'Core behavior is covered.'
    },
    refactorings: {
      file: 'src/example.ts',
      suggestions: [],
      summary: 'No focused refactoring needed.'
    }
  }],
  summary: {
    totalFiles: 1,
    overallScore: 95,
    criticalIssues: 0,
    highPriorityTests: 0,
    refactoringOpportunities: 0
  },
  recommendations: [],
  metadata: {
    analyzedAt: '2026-11-23T10:00:00.000Z',
    duration: 100,
    agentVersions: {
      codeQualityAnalyzer: 'sonnet'
    }
  }
};

describe('ReviewReportSchema', () => {
  it('accepts a valid report', () => {
    expect(ReviewReportSchema.safeParse(validReport).success).toBe(true);
  });

  it('rejects invalid pull request numbers', () => {
    const result = ReviewReportSchema.safeParse({
      ...validReport,
      pullRequest: {
        ...validReport.pullRequest,
        number: -1
      }
    });

    expect(result.success).toBe(false);
  });

  it('rejects scores outside the allowed range', () => {
    const invalid = structuredClone(validReport);
    invalid.fileReviews[0].codeQuality.overallScore = 101;

    expect(ReviewReportSchema.safeParse(invalid).success).toBe(false);
  });

  it('rejects invalid finding severity values', () => {
    const invalid = structuredClone(validReport);
    invalid.fileReviews[0].codeQuality.issues = [{
      line: 10,
      severity: 'unknown',
      category: 'bug-risk',
      description: 'Invalid finding',
      suggestion: 'Fix it'
    }] as never[];

    expect(ReviewReportSchema.safeParse(invalid).success).toBe(false);
  });
});