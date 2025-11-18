import type { AIProvider } from '@feedback-forge/core';

export interface NestJSFeedbackForgeConfig {
  /**
   * AI configuration for processing feedback
   */
  ai: {
    provider?: 'vercel' | 'genkit' | 'custom';
    model: string;
    apiKey: string;
    systemPrompt?: string;
    temperature?: number;
    customProvider?: AIProvider;
  };

  /**
   * GitHub integration configuration (optional)
   */
  github?: {
    owner: string;
    repo: string;
    token: string;
  };

  /**
   * Jules integration configuration (optional)
   */
  jules?: {
    apiKey: string;
    apiUrl?: string;
    githubRepo: string;
    githubStartingBranch?: string;
  };

  /**
   * API route prefix
   * @default 'feedback'
   */
  routePrefix?: string;

  /**
   * Enable/disable automatic GitHub issue creation after AI processing
   * @default false
   */
  autoCreateGithubIssue?: boolean;

  /**
   * Custom system prompt for AI processing
   */
  feedbackSystemPrompt?: string;
}
