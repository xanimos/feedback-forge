/**
 * Generic access control function that can be used with any framework.
 * Takes a context object and returns whether access is allowed.
 */
export type AccessControlFunction<TContext = any> = (
  context: TContext,
) => boolean | Promise<boolean>;

/**
 * Access control configuration for the Feedback collection.
 * Optional and framework-agnostic.
 */
export type AccessControl<TContext = any> = {
  create?: AccessControlFunction<TContext>;
  delete?: AccessControlFunction<TContext>;
  read?: AccessControlFunction<TContext>;
  update?: AccessControlFunction<TContext>;
};

/**
 * Framework-agnostic configuration for Feedback Forge.
 * This can be used with any backend framework (Payload, NestJS, Express, etc.)
 */
export type FeedbackForgeConfig<TContext = any> = {
  /**
   * Access control for the Feedback collection.
   * Optional - if not provided, framework defaults will be used.
   */
  access?: AccessControl<TContext>;

  /**
   * Allow anonymous users to submit feedback via the REST API.
   * @default true
   */
  allowAnonymousSubmissions?: boolean;

  /**
   * The cron schedule for the feedback processing job.
   * If not provided, the job will not be scheduled to run automatically.
   * E.g., '*\/5 * * * *'
   */
  cron?: string;

  /**
   * Disable the plugin.
   * @default false
   */
  disabled?: boolean;

  /**
   * Enable or disable the plugin.
   * @default true
   */
  enabled?: boolean;

  /**
   * The system prompt used by the Genkit flow to generate the developer prompt.
   * This allows for customization of the AI's behavior.
   */
  feedbackSystemPrompt?: string;

  ai?: {
    model: string;
    apiKey: string;
    systemPrompt?: string;
    temperature?: number;
  };

  github?: {
    repo: string;
    owner: string;
    token: string;
  };

  /**
   * The full URL of the GitHub repository to be used in the Jules session source context.
   * E.g., 'your-org/your-repo'
   */
  githubRepo: string;

  /**
   * The starting branch for the Jules session.
   * @default 'main'
   */
  githubStartingBranch?: string;

  /**
   * The base URL for the Jules API.
   * @default 'https://jules.googleapis.com/v1alpha/sessions'
   */
  julesApiUrl?: string;

  /**
   * An object to define which feedback statuses are managed by the Jules integration.
   */
  julesManagedStatuses?: {
    /**
     * The status to set when a Jules session is successfully initiated.
     * @default 'in-progress'
     */
    inProgress: string;
    /**
     * The status to set (or reset to) when a Jules session fails to start or if the feedback is first created.
     * @default 'received'
     */
    received: string;
  };
};

export type Feedback = {
  breadcrumbs: string;
  developerPrompt?: null | string | undefined;
  feedback: string;
  id: number;
  julesSessionId?: null | string | undefined;
  status: string;
  title: string;
  user?:
    | {
        id: number;
      }
    | null
    | undefined;
};
