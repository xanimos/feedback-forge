import type { Access } from 'payload';
import type { FeedbackForgeConfig } from '@feedback-forge/core';

/**
 * Payload-specific configuration that extends the framework-agnostic core config.
 * Maps generic access control to Payload's Access type.
 */
export type PayloadFeedbackForgeConfig = Omit<FeedbackForgeConfig<any>, 'access'> & {
  /**
   * Access control for the Feedback collection using Payload's Access type.
   * @default isAdmin
   */
  access?: {
    create?: Access;
    delete?: Access;
    read?: Access;
    update?: Access;
  };
};
