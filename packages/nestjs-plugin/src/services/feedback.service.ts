import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  FeedbackService as SharedFeedbackService,
  type Logger as ILogger,
} from '@feedback-forge/plugin-common';
import type { NestJSFeedbackForgeConfig } from '../interfaces/feedback-forge-config.interface.js';

/**
 * NestJS Logger adapter for shared service
 */
class NestJSLoggerAdapter implements ILogger {
  constructor(private readonly logger: Logger) {}

  log(message: string, ...optionalParams: any[]): void {
    this.logger.log(message, ...optionalParams);
  }

  error(message: string, ...optionalParams: any[]): void {
    this.logger.error(message, ...optionalParams);
  }

  warn(message: string, ...optionalParams: any[]): void {
    this.logger.warn(message, ...optionalParams);
  }

  debug(message: string, ...optionalParams: any[]): void {
    this.logger.debug(message, ...optionalParams);
  }
}

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);
  private readonly sharedService: SharedFeedbackService;

  constructor(
    @Inject('FEEDBACK_FORGE_CONFIG')
    private readonly config: NestJSFeedbackForgeConfig,
  ) {
    this.sharedService = new SharedFeedbackService(config, new NestJSLoggerAdapter(this.logger));
  }

  /**
   * Process feedback using AI to generate developer prompt
   */
  async processFeedback(
    feedback: string,
    breadcrumbs?: string,
  ): Promise<{ developerPrompt: string }> {
    return this.sharedService.processFeedback(feedback, breadcrumbs);
  }

  /**
   * Create GitHub issue
   */
  async createGithubIssue(title: string, body: string): Promise<any> {
    return this.sharedService.createGithubIssue(title, body);
  }

  /**
   * Start Jules coding session
   */
  async startJulesSession(title: string, developerPrompt: string): Promise<any> {
    return this.sharedService.startJulesSession(title, developerPrompt);
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
    return this.sharedService.processFeedbackComplete(title, feedback, breadcrumbs);
  }
}
