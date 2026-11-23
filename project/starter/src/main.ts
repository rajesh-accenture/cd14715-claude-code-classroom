import { mkdir, writeFile } from 'node:fs/promises';
import { validateEnv } from './config/env';
import { CodeReviewOrchestrator } from './orchestrator';
import { ReportGenerator } from './utils/report-generator';

async function main(): Promise<void> {
  validateEnv();

  const [owner, repo, rawPr] = process.argv.slice(2);
  const prNumber = Number(rawPr);

  if (
    !owner ||
    !repo ||
    !rawPr ||
    !/^\d+$/.test(rawPr) ||
    !Number.isSafeInteger(prNumber) ||
    prNumber < 1
  ) {
    throw new Error('Usage: npm run dev -- <owner> <repo> <positive-pr-number>');
  }

  const report = await new CodeReviewOrchestrator().reviewPullRequest(
    owner,
    repo,
    prNumber
  );

  const generator = new ReportGenerator();
  const reportBase = `reports/${owner}-${repo}-pr-${prNumber}`;
  await mkdir('reports', { recursive: true });

  await Promise.all([
    writeFile(`${reportBase}.md`, generator.generateMarkdownReport(report)),
    writeFile(`${reportBase}.html`, generator.generateHTMLReport(report)),
    writeFile(`${reportBase}.json`, generator.generateJSONReport(report)),
  ]);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
