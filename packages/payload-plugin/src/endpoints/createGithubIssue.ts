import type { Endpoint } from 'payload';

import { addDataAndFileToRequest } from 'payload';

import { createIssue } from '@feedback-forge/integration-github';

type CreateIssueBody = {
  feedbackId: number;
};

export const createGithubIssueEndpoint: Endpoint = {
  path: '/create-github-issue',
  method: 'post',
  handler: async (req) => {
    await addDataAndFileToRequest(req);
    const { data, payload, user } = req;

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { feedbackId } = data as CreateIssueBody;
    if (!feedbackId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
      const feedbackSettings = await req.payload.findGlobal({
        slug: 'feedback-settings',
      });

      if (!feedbackSettings.github?.enabled) {
        return Response.json({ error: 'GitHub integration is not enabled' }, { status: 403 });
      }

      const feedbackDoc = await req.payload.findByID({
        id: feedbackId,
        collection: 'feedback',
      });

      if (!feedbackDoc) {
        return Response.json({ error: 'Feedback not found' }, { status: 404 });
      }

      const { title, developerPrompt } = feedbackDoc;

      if (!developerPrompt) {
        return Response.json({ error: 'Developer prompt not generated yet' }, { status: 500 });
      }

      const issue = await createIssue({
        title,
        body: developerPrompt,
        repo: feedbackSettings.github.repo,
        owner: feedbackSettings.github.owner,
        token: feedbackSettings.github.token,
        baseUrl: feedbackSettings.github.baseUrl,
      });

      await req.payload.update({
        id: feedbackId,
        collection: 'feedback',
        data: {
          githubIssueUrl: issue.html_url,
        },
      });

      return Response.json({ success: true, issueUrl: issue.html_url }, { status: 200 });
    } catch (error) {
      req.payload.logger.error(`Error creating GitHub issue: ${error}`);
      return Response.json({ error: 'Failed to create GitHub issue' }, { status: 500 });
    }
  },
};
