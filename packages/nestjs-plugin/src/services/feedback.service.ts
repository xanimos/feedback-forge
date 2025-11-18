import { Injectable, Inject, Logger } from '@nestjs/common';
import { getFeedbackProcessor } from '@feedback-forge/core';
import { createIssue } from '@feedback-forge/integration-github';
import { createJulesSession } from '@feedback-forge/integration-jules';
import type { NestJSFeedbackForgeConfig } from '../interfaces/feedback-forge-config.interface.js';

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(
    @Inject('FEEDBACK_FORGE_CONFIG')
    private readonly config: NestJSFeedbackForgeConfig,
  ) {}

  /**
   * Process feedback using AI to generate developer prompt
   */
  async processFeedback(
    feedback: string,
    breadcrumbs?: string,
  ): Promise<{ developerPrompt: string }> {
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
      breadcrumbs: breadcrumbs || 'Submitted via NestJS API',
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
  ): Promise<{
    developerPrompt: string;
    githubIssue?: any;
  }> {
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
