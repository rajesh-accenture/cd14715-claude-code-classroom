import 'dotenv/config';

export interface AppEnv {
  anthropicApiKey: string;
  githubToken: string;
  model: string;
}

export function validateEnv(env: NodeJS.ProcessEnv = process.env): AppEnv {
  const values = {
    anthropicApiKey: env.ANTHROPIC_API_KEY?.trim(),
    githubToken: env.GITHUB_TOKEN?.trim(),
    model: env.ANTHROPIC_MODEL?.trim(),
  };

  const missing = Object.entries(values)
    .filter(([, value]) => !value)
    .map(([key]) => ({
      anthropicApiKey: 'ANTHROPIC_API_KEY',
      githubToken: 'GITHUB_TOKEN',
      model: 'ANTHROPIC_MODEL',
    })[key]);

  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    anthropicApiKey: values.anthropicApiKey!,
    githubToken: values.githubToken!,
    model: values.model!,
  };
}
