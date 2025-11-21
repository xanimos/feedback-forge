import { getFeedbackProcessor } from '@feedback-forge/core';
import { createIssue } from '@feedback-forge/integration-github';
import { createJulesSession } from '@feedback-forge/integration-jules';
import type { FeedbackForgePluginConfig } from '../interfaces/plugin-config.interface.js';
import type { Logger } from '../interfaces/logger.interface.js';
import { ConsoleLogger } from '../interfaces/logger.interface.js';
import type {
  ProcessFeedbackResult,
  ProcessFeedbackCompleteResult,
} from '../types/feedback.types.js';

/**
 * Framework-agnostic feedback service with shared business logic
 */
export class FeedbackService {
  private readonly logger: Logger;

  constructor(
    private readonly config: FeedbackForgePluginConfig,
    logger?: Logger,
  ) {
    this.logger = logger || new ConsoleLogger('FeedbackService');
  }

  /**
   * Process feedback using AI to generate developer prompt
   */
  async processFeedback(feedback: string, breadcrumbs?: string): Promise<ProcessFeedbackResult> {
    this.logger.log('Processing feedback with AI');

    const feedbackProcessor = getFeedbackProcessor({
      ai: {
        provider: this.config.ai.provider || 'genkit', // backward compatibility
        model: this.config.ai.model,
        apiKey: this.config.ai.apiKey,
        systemPrompt: this.config.ai.systemPrompt,
        temperature: this.config.ai.temperature,
        customProvider: this.config.ai.customProvider,
      },
      feedbackSystemPrompt: this.config.feedbackSystemPrompt,
      githubRepo: this.config.jules?.githubRepo || 'default/repo', // Required by core, but not used in processing
    });

    const result = await feedbackProcessor({
      feedback,
      breadcrumbs: breadcrumbs || 'Submitted via API',
    });

    return { developerPrompt: result.developerPrompt };
  }

  /**
   * Create GitHub issue
   */
  async createGithubIssue(title: string, body: string): Promise<any> {
    if (!this.config.github) {
      throw new Error('GitHub integration not configured');
    }

    this.logger.log(`Creating GitHub issue: ${title}`);

    return await createIssue({
      title,
      body,
      owner: this.config.github.owner,
      repo: this.config.github.repo,
      token: this.config.github.token,
      baseUrl: this.config.github.baseUrl,
    });
  }

  /**
   * Start Jules coding session
   */
  async startJulesSession(title: string, developerPrompt: string): Promise<any> {
    if (!this.config.jules) {
      throw new Error('Jules integration not configured');
    }

    this.logger.log(`Starting Jules session: ${title}`);

    return await createJulesSession({
      title,
      developerPrompt,
      julesApiKey: this.config.jules.apiKey,
      julesApiUrl: this.config.jules.apiUrl,
      githubRepo: this.config.jules.githubRepo,
      githubStartingBranch: this.config.jules.githubStartingBranch,
    });
  }

  /**
   * Complete flow: Process feedback and optionally create GitHub issue
   */
  async processFeedbackComplete(
    title: string,
    feedback: string,
    breadcrumbs?: string,
  ): Promise<ProcessFeedbackCompleteResult> {
    // Process with AI
    const { developerPrompt } = await this.processFeedback(feedback, breadcrumbs);

    // Optionally create GitHub issue
    let githubIssue;
    if (this.config.autoCreateGithubIssue && this.config.github) {
      try {
        githubIssue = await this.createGithubIssue(title, developerPrompt);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Failed to create GitHub issue: ${errorMessage}`);
      }
    }

    return { developerPrompt, githubIssue };
  }
}
