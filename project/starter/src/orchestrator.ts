import { query } from '@anthropic-ai/claude-agent-sdk';
import { subagents } from './agents';
import { validateEnv } from './config/env';
import { mcpServersConfig } from './config/mcp.config';
import {
  ReviewReportJSONSchema,
  ReviewReportSchema,
  type ReviewReport,
} from './types/report-types';

export interface OrchestratorOptions {
  model?: string;
  maxTurns?: number;
}

export class CodeReviewOrchestrator {
  constructor(private readonly options: OrchestratorOptions = {}) {}

  async reviewPullRequest(
    owner: string,
    repo: string,
    prNumber: number
  ): Promise<ReviewReport> {
    if (!owner.trim() || !repo.trim() || !Number.isSafeInteger(prNumber) || prNumber < 1) {
      throw new Error('Invalid pull request owner, repository, or number.');
    }

    const startedAt = Date.now();
    const env = validateEnv();

    const prompt = `Review pull request ${owner}/${repo}#${prNumber}.

Use the GitHub MCP tools to retrieve the pull request details and changed files.
Delegate code-quality, test-coverage, and refactoring analysis to the matching
subagents using Task, preferably in parallel. Base findings on the actual PR
changes; do not invent issues or line numbers.

Combine the subagent findings into one report matching the required JSON schema.
Include one file review per relevant changed file, calculate the summary and
recommendations, and include metadata.`;

    let rawReport: unknown;

    for await (const message of query({
      prompt,
      options: {
        model: this.options.model ?? env.model,
        maxTurns: this.options.maxTurns ?? 20,
        mcpServers: mcpServersConfig,
        agents: subagents,
        allowedTools: [
          'Task',
          'mcp__github__get_pull_request',
          'mcp__github__get_pull_request_files',
          'mcp__github__get_pull_request_diff',
          'mcp__eslint__lint',
        ],
        outputFormat: {
          type: 'json_schema',
          schema: ReviewReportJSONSchema,
        },
      },
    })) {
      if (message.type !== 'result') continue;

      if (message.subtype !== 'success') {
        throw new Error(`Pull request review failed: ${message.subtype}`);
      }

      rawReport = message.structured_output;
    }

    if (rawReport === undefined) {
      throw new Error('The review completed without structured report output.');
    }

    const report = ReviewReportSchema.parse(rawReport);

    return {
      ...report,
      pullRequest: { owner, repo, number: prNumber },
      metadata: {
        ...report.metadata,
        analyzedAt: new Date().toISOString(),
        duration: Date.now() - startedAt,
      },
    };
  }
}