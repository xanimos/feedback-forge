import type { Endpoint } from 'payload';

export const getFeedbackSettingsEndpoint: Endpoint = {
  path: '/feedback-settings',
  method: 'get',
  handler: async (req) => {
    try {
      const feedbackSettings = await req.payload.findGlobal({
        slug: 'feedback-settings',
      });
      return Response.json(feedbackSettings, { status: 200 });
    } catch (error: any) {
      req.payload.logger.error(`Error fetching feedback settings: ${error}`);
      return Response.json({ error: 'Failed to fetch feedback settings' }, { status: 500 });
    }
  },
};
