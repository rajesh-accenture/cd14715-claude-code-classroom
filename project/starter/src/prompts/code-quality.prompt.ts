export const CODE_QUALITY_PROMPT = `Review the provided pull request files for correctness, security, performance, maintainability, and style.

For .ts/.tsx files, use the Skill tool with "typescript-patterns" when available.
Use "security-analysis" when security-sensitive code is present.
If a skill is unavailable, continue with direct analysis.

Report only actionable issues with accurate line numbers.
Return JSON matching CodeQualityResultSchema.
Do not invent findings.`;