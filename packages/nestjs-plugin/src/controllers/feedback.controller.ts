import { Controller, Post, Body, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { FeedbackService } from '../services/feedback.service.js';
import { SubmitFeedbackDto } from '../dto/submit-feedback.dto.js';
import { CreateGithubIssueDto } from '../dto/create-github-issue.dto.js';
import { StartJulesSessionDto } from '../dto/start-jules-session.dto.js';

@Controller('feedback')
export class FeedbackController {
  private readonly logger = new Logger(FeedbackController.name);

  constructor(private readonly feedbackService: FeedbackService) {}

  /**
   * Submit feedback and process with AI
   * POST /feedback
   */
  @Post()
  async submitFeedback(@Body() dto: SubmitFeedbackDto) {
    try {
      const result = await this.feedbackService.processFeedbackComplete(
        dto.title,
        dto.feedback,
        dto.breadcrumbs,
      );

      return {
        message: 'Feedback processed successfully',
        data: result,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error processing feedback: ${errorMessage}`);
      throw new HttpException('Failed to process feedback', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Create GitHub issue
   * POST /feedback/github-issue
   */
  @Post('github-issue')
  async createGithubIssue(@Body() dto: CreateGithubIssueDto) {
    try {
      const issue = await this.feedbackService.createGithubIssue(dto.title, dto.body);

      return {
        message: 'GitHub issue created successfully',
        data: issue,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error creating GitHub issue: ${errorMessage}`);
      throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Start Jules session
   * POST /feedback/jules-session
   */
  @Post('jules-session')
  async startJulesSession(@Body() dto: StartJulesSessionDto) {
    try {
      const session = await this.feedbackService.startJulesSession(dto.title, dto.developerPrompt);

      return {
        message: 'Jules session started successfully',
        data: session,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error starting Jules session: ${errorMessage}`);
      throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
