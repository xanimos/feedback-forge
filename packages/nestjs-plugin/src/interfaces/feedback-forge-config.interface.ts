import type { FeedbackForgePluginConfig } from '@feedback-forge/plugin-common';

/**
 * NestJS-specific configuration extends shared plugin config
 */
export interface NestJSFeedbackForgeConfig extends FeedbackForgePluginConfig {
  /**
   * API route prefix
   * @default 'feedback'
   */
  routePrefix?: string;
}
