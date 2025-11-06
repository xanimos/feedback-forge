import type { CollectionAfterChangeHook } from 'payload';

export const dispatchFeedbackJob: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  // Only trigger on create or update operations
  if (operation === 'create' || operation === 'update') {
    // If a developer prompt already exists, don't re-process.
    if (doc.developerPrompt) {
      req.payload.logger.info(
        `Developer prompt already exists for feedback ID: ${doc.id}. Skipping job dispatch.`,
      );
      return;
    }

    req.payload.logger.info(`Dispatching feedback processing job for feedback ID: ${doc.id}`);

    try {
      await req.payload.jobs.queue({
        input: {
          feedbackId: doc.id,
        },
        queue: 'feedbackForge', // Use a dedicated queue
        task: 'feedbackForge_processFeedback', // Use type assertion to bypass strict type check
      });
      req.payload.logger.info(`Successfully queued job for feedback ID: ${doc.id}`);
    } catch (error) {
      req.payload.logger.error(`Error dispatching feedback job for ID ${doc.id}: ${error}`);
    }
  }
};
