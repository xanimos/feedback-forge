import type { PayloadHandler } from 'payload'

import { addDataAndFileToRequest } from 'payload';

export type StartSessionArgs = {
  developerPrompt: string
  feedbackId: number
  title: string
}

export const startJulesSessionHandler: PayloadHandler =
  async (req) => {
  await addDataAndFileToRequest(req);
  const { data, payload, user } = req

  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { developerPrompt, feedbackId, title } = data as StartSessionArgs;

  if (!feedbackId || !developerPrompt || !title) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const julesApiKey = process.env.JULES_API_KEY;
    const julesApiUrl = 'https://jules.googleapis.com/v1alpha/sessions';

    if (!julesApiKey) {
      throw new Error('JULES_API_KEY environment variable not set.');
    }

    const response = await fetch(julesApiUrl, {
      body: JSON.stringify({
        prompt: developerPrompt,
        sourceContext: {
          githubRepoContext: {
            startingBranch: 'main',
          },
          source: 'sources/github/xanimos/RightBinApp',
        },
        title,
      }),
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': julesApiKey,
      },
      method: 'POST',
    });

    if (response.ok) {
      const julesSession = await response.json();
      const julesSessionId = julesSession.id;

      await payload.update({
        id: feedbackId,
        collection: 'feedback',
        data: {
          julesSessionId,
          status: 'in-progress',
        },
      });

      return Response.json({ message: 'Jules session started successfully.' }, { status: 200 });
    } else {
      const errorData = await response.text();
      payload.logger.error(`Jules API Error: ${errorData}`);
      await payload.update({
        id: feedbackId,
        collection: 'feedback',
        data: {
          status: 'received',
        },
      });
      return Response.json({ error: 'Failed to start Jules session.' }, { status: response.status });
    }
  } catch (error) {
    payload.logger.error(`Error starting Jules session: ${error}`);
    try {
      await payload.update({
        id: feedbackId,
        collection: 'feedback',
        data: {
          status: 'received',
        },
      });
    } catch (resetError) {
      payload.logger.error(`Failed to reset feedback status: ${resetError}`);
    }
    return Response.json({ error: 'An internal error occurred.' }, { status: 500 });
  }
}