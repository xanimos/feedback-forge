import type { TaskConfig } from 'payload';

import type { PayloadFeedbackForgeConfig } from '@feedback-forge/core';

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

          // Get the configured Genkit flow
          const feedbackProcessor = getFeedbackProcessor({
            ...options,
            ai: {
              model: feedbackSettings.genkit.model,
              apiKey: feedbackSettings.genkit.apiKey,
              systemPrompt: feedbackSettings.genkit.systemPrompt,
              temperature: feedbackSettings.genkit.temperature,
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
