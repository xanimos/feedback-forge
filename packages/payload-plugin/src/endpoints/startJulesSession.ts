import type { PayloadHandler } from 'payload';

import { addDataAndFileToRequest } from 'payload';
import { createJulesSession, JulesApiError } from '@feedback-forge/integration-jules';

export type StartSessionArgs = {
  developerPrompt: string;
  feedbackId: number;
  title: string;
};

export const startJulesSessionHandler: PayloadHandler = async (req) => {
  await addDataAndFileToRequest(req);
  const { data, payload, user } = req;

  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { developerPrompt, feedbackId, title } = data as StartSessionArgs;

  if (!feedbackId || !developerPrompt || !title) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const feedbackSettings = await payload.findGlobal({
      slug: 'feedback-settings',
    });

    const julesApiKey = feedbackSettings.jules?.julesApiKey;
    const julesApiUrl = feedbackSettings.jules?.julesApiUrl;
    const githubRepo = feedbackSettings.jules?.githubRepo;
    const githubStartingBranch = feedbackSettings.jules?.githubStartingBranch || 'main';

    if (!julesApiKey) {
      throw new Error('Jules API Key not set in Feedback Settings.');
    }

    if (!githubRepo) {
      throw new Error('GitHub repository not set in Feedback Settings.');
    }

    // Use the framework-agnostic createJulesSession function
    const julesSession = await createJulesSession({
      title,
      developerPrompt,
      julesApiKey,
      julesApiUrl,
      githubRepo,
      githubStartingBranch,
    });

    // Update feedback with session ID and status
    await payload.update({
      id: feedbackId,
      collection: 'feedback',
      data: {
        julesSessionId: julesSession.id,
        status: feedbackSettings.jules?.julesManagedStatuses?.inProgress || 'in-progress',
      },
    });

    return Response.json({ message: 'Jules session started successfully.' }, { status: 200 });
  } catch (error) {
    // Log the error
    const errorMessage = error instanceof Error ? error.message : String(error);
    payload.logger.error(`Error starting Jules session: ${errorMessage}`);

    // If it's a Jules API error, log additional details
    if (error instanceof JulesApiError) {
      payload.logger.error(
        `Jules API Error Details - Status: ${error.statusCode}, Body: ${error.responseBody}`,
      );
    }

    // Reset feedback status on error
    try {
      const feedbackSettings = await payload.findGlobal({
        slug: 'feedback-settings',
      });
      await payload.update({
        id: feedbackId,
        collection: 'feedback',
        data: {
          status: feedbackSettings.jules?.julesManagedStatuses?.received || 'received',
        },
      });
    } catch (resetError) {
      payload.logger.error(`Failed to reset feedback status: ${resetError}`);
    }

    // Return appropriate error response
    if (error instanceof JulesApiError && error.statusCode) {
      return Response.json(
        { error: 'Failed to start Jules session.' },
        { status: error.statusCode },
      );
    }

    return Response.json({ error: 'An internal error occurred.' }, { status: 500 });
  }
};
