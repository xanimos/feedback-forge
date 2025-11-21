import type { Application } from 'express';
import { createFeedbackRouter } from './routes/feedback.routes.js';
import type { ExpressFeedbackForgeConfig } from './interfaces/express-config.interface.js';

export * from './interfaces/express-config.interface.js';
export * from './routes/feedback.routes.js';
export * from './middleware/validation.middleware.js';

/**
 * Register Feedback Forge routes with an Express app or InversifyJS application
 *
 * @example Standard Express
 * ```typescript
 * import express from 'express';
 * import { registerFeedbackForge } from '@feedback-forge/express-plugin';
 *
 * const app = express();
 * app.use(express.json());
 *
 * registerFeedbackForge(app, {
 *   ai: {
 *     provider: 'vercel',
 *     model: 'openai:gpt-4o',
 *     apiKey: process.env.OPENAI_API_KEY,
 *   },
 *   github: {
 *     owner: 'my-org',
 *     repo: 'my-repo',
 *     token: process.env.GITHUB_TOKEN,
 *   },
 *   routePrefix: '/api/feedback',
 * });
 *
 * app.listen(3000);
 * ```
 *
 * @example InversifyJS
 * ```typescript
 * import { InversifyExpressServer } from 'inversify-express-utils';
 * import { registerFeedbackForge } from '@feedback-forge/express-plugin';
 *
 * const server = new InversifyExpressServer(container);
 *
 * server.setConfig((app) => {
 *   app.use(express.json());
 *
 *   registerFeedbackForge(app, {
 *     ai: {
 *       provider: 'vercel',
 *       model: 'openai:gpt-4o',
 *       apiKey: process.env.OPENAI_API_KEY,
 *     },
 *     routePrefix: '/api/feedback',
 *   });
 * });
 *
 * const app = server.build();
 * ```
 */
export function registerFeedbackForge(app: Application, config: ExpressFeedbackForgeConfig): void {
  const routePrefix = config.routePrefix || '/feedback';
  const router = createFeedbackRouter(config);
  app.use(routePrefix, router);
}
