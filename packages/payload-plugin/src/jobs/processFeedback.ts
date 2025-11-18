import type { TaskConfig } from 'payload';

import type { PayloadFeedbackForgeConfig } from '../types.js';

import { getFeedbackProcessor } from '@feedback-forge/core';
import { createIssue } from '@feedback-forge/integration-github';

export const getProcessFeedbackJob = (
  options: PayloadFeedbackForgeConfig,
): TaskConfig<'feedbackForge_processFeedback'> => {
  return {
    slug: 'feedbackForge_processFeedback',
    handler: async ({ input, job: _, req }) => {
      const { feedbackId } = input ?? { feedbackId: 0 };
      const logger = req.payload.logger;

      logger.info(`Processing feedback job for ID ${feedbackId}`);
      try {
        const feedbackSettings = await req.payload.findGlobal({
          slug: 'feedback-settings',
        });

        const feedbackDoc = await req.payload.findByID({
          id: feedbackId,
          collection: 'feedback',
        });

        if (feedbackDoc) {
          const { breadcrumbs, feedback, title } = feedbackDoc;

          // Get the configured AI flow
          // Destructure to exclude Payload-specific 'access' property
          const { access: _, ...coreOptions } = options;
          const feedbackProcessor = getFeedbackProcessor({
            ...coreOptions,
            ai: {
              provider: feedbackSettings.ai.provider || 'genkit', // default for backward compat
              model: feedbackSettings.ai.model,
              apiKey: feedbackSettings.ai.apiKey,
              systemPrompt: feedbackSettings.ai.systemPrompt,
              temperature: feedbackSettings.ai.temperature,
            },
          });

          const result = await feedbackProcessor({
            breadcrumbs,
            feedback,
          });

          if (result.developerPrompt) {
            await req.payload.update({
              id: feedbackId,
              collection: 'feedback',
              data: {
                developerPrompt: result.developerPrompt,
              },
            });
            logger.info(`Successfully generated developer prompt for feedback ID: ${feedbackId}`);

            return {
              output: {
                developerPrompt: result.developerPrompt,
              },
            };
          }
        } else {
          logger.warn(`Feedback document with ID ${feedbackId} not found.`);
        }
      } catch (error) {
        logger.error(`Error processing feedback job for ID ${feedbackId}: ${error}`);
      }
      return { output: {} };
    },
    inputSchema: [
      {
        name: 'feedbackId',
        type: 'number',
        required: true,
      },
    ],
    outputSchema: [
      {
        name: 'developerPrompt',
        type: 'text',
      },
    ],
  };
};
