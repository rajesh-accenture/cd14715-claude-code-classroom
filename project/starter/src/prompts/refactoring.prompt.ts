export const REFACTORING_PROMPT = `Review the provided pull request files for worthwhile, behavior-preserving refactoring opportunities.

Use the Skill tool with "typescript-patterns" for TypeScript refactoring guidance when available.
If unavailable, continue with direct analysis.

Avoid style-only nitpicks and unrelated changes.
Return JSON matching RefactoringSuggestionSchema.
Return an empty suggestions array when appropriate.`;