export const TEST_COVERAGE_PROMPT = `Review the provided pull request files for meaningful test gaps.

Use the Skill tool with "test-generation" when available.
If unavailable, continue with direct analysis.

Identify untested functions, classes, branches, and edge cases.
Return JSON matching TestCoverageResultSchema.
Do not claim measured coverage unless evidence is provided.`;