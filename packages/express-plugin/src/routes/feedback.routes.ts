import { Router, type Request, type Response } from 'express';
import { FeedbackService } from '@feedback-forge/plugin-common';
import type { ExpressFeedbackForgeConfig } from '../interfaces/express-config.interface.js';
import {
  validateRequiredFields,
  validateOptionalFields,
} from '../middleware/validation.middleware.js';

/**
 * Create Express router for feedback endpoints
 */
export function createFeedbackRouter(config: ExpressFeedbackForgeConfig): Router {
  const router = Router();
  const feedbackService = new FeedbackService(config);

  /**
   * POST /feedback
   * Submit feedback and process with AI
   */
  router.post(
    '/',
    validateRequiredFields(['title', 'feedback']),
    validateOptionalFields(['breadcrumbs', 'userId']),
    async (req: Request, res: Response) => {
      try {
        const { title, feedback, breadcrumbs } = req.body;

        const result = await feedbackService.processFeedbackComplete(title, feedback, breadcrumbs);

        res.status(200).json({
          message: 'Feedback processed successfully',
          data: result,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error processing feedback: ${errorMessage}`);
        res.status(500).json({
          error: 'Failed to process feedback',
          message: errorMessage,
        });
      }
    },
  );

  /**
   * POST /feedback/github-issue
   * Create GitHub issue
   */
  router.post(
    '/github-issue',
    validateRequiredFields(['title', 'body']),
    async (req: Request, res: Response) => {
      try {
        const { title, body } = req.body;

        const issue = await feedbackService.createGithubIssue(title, body);

        res.status(200).json({
          message: 'GitHub issue created successfully',
          data: issue,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error creating GitHub issue: ${errorMessage}`);
        res.status(500).json({
          error: 'Failed to create GitHub issue',
          message: errorMessage,
        });
      }
    },
  );

  /**
   * POST /feedback/jules-session
   * Start Jules session
   */
  router.post(
    '/jules-session',
    validateRequiredFields(['title', 'developerPrompt']),
    async (req: Request, res: Response) => {
      try {
        const { title, developerPrompt } = req.body;

        const session = await feedbackService.startJulesSession(title, developerPrompt);

        res.status(200).json({
          message: 'Jules session started successfully',
          data: session,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error starting Jules session: ${errorMessage}`);
        res.status(500).json({
          error: 'Failed to start Jules session',
          message: errorMessage,
        });
      }
    },
  );

  return router;
}
