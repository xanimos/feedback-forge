/**
 * Input for submitting feedback
 */
export interface SubmitFeedbackInput {
  title: string;
  feedback: string;
  breadcrumbs?: string;
  userId?: string | number;
}

/**
 * Input for creating a GitHub issue
 */
export interface CreateGithubIssueInput {
  title: string;
  body: string;
}

/**
 * Input for starting a Jules session
 */
export interface StartJulesSessionInput {
  title: string;
  developerPrompt: string;
}

/**
 * Result of processing feedback
 */
export interface ProcessFeedbackResult {
  developerPrompt: string;
}

/**
 * Result of complete feedback processing flow
 */
export interface ProcessFeedbackCompleteResult {
  developerPrompt: string;
  githubIssue?: any;
}
