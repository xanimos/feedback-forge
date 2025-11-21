import type { FeedbackForgePluginConfig } from '@feedback-forge/plugin-common';

/**
 * Express-specific configuration extends shared plugin config
 */
export interface ExpressFeedbackForgeConfig extends FeedbackForgePluginConfig {
  /**
   * API route prefix
   * @default '/feedback'
   */
  routePrefix?: string;
}
