/**
 * Framework-agnostic Jules API client for creating coding sessions
 */

export interface CreateJulesSessionParams {
  /**
   * Title of the Jules session
   */
  title: string;

  /**
   * AI-generated developer prompt describing the work to be done
   */
  developerPrompt: string;

  /**
   * Jules API key for authentication
   */
  julesApiKey: string;

  /**
   * Jules API URL (optional, defaults to Google's Jules API endpoint)
   * @default 'https://jules.googleapis.com/v1alpha/sessions'
   */
  julesApiUrl?: string;

  /**
   * GitHub repository in format 'owner/repo'
   * Example: 'facebook/react'
   */
  githubRepo: string;

  /**
   * Starting branch for the Jules session
   * @default 'main'
   */
  githubStartingBranch?: string;
}

export interface JulesSession {
  /**
   * Unique identifier for the Jules session
   */
  id: string;

  /**
   * Name/title of the session
   */
  name: string;

  /**
   * Current state of the session
   */
  state?: string;

  /**
   * Additional properties from Jules API response
   */
  [key: string]: any;
}

/**
 * Error thrown when Jules API request fails
 */
export class JulesApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public responseBody?: string,
  ) {
    super(message);
    this.name = 'JulesApiError';
  }
}

/**
 * Creates a new Jules coding session
 *
 * @param params - Parameters for creating the Jules session
 * @returns Promise resolving to the created Jules session
 * @throws {JulesApiError} If the API request fails
 *
 * @example
 * ```typescript
 * const session = await createJulesSession({
 *   title: 'Fix login bug',
 *   developerPrompt: 'Fix the authentication issue where users cannot log in...',
 *   julesApiKey: process.env.JULES_API_KEY,
 *   githubRepo: 'my-org/my-repo',
 *   githubStartingBranch: 'main',
 * });
 *
 * console.log(`Session created with ID: ${session.id}`);
 * ```
 */
export const createJulesSession = async ({
  title,
  developerPrompt,
  julesApiKey,
  julesApiUrl = 'https://jules.googleapis.com/v1alpha/sessions',
  githubRepo,
  githubStartingBranch = 'main',
}: CreateJulesSessionParams): Promise<JulesSession> => {
  if (!title || !developerPrompt || !julesApiKey || !githubRepo) {
    throw new Error(
      'Missing required parameters: title, developerPrompt, julesApiKey, and githubRepo are required',
    );
  }

  try {
    const response = await fetch(julesApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': julesApiKey,
      },
      body: JSON.stringify({
        title,
        prompt: developerPrompt,
        sourceContext: {
          source: `sources/github/${githubRepo}`,
          githubRepoContext: {
            startingBranch: githubStartingBranch,
          },
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new JulesApiError(
        `Jules API request failed: ${response.statusText}`,
        response.status,
        errorText,
      );
    }

    const session: JulesSession = await response.json();
    return session;
  } catch (error) {
    if (error instanceof JulesApiError) {
      throw error;
    }

    // Handle network errors or other unexpected errors
    throw new JulesApiError(
      `Failed to create Jules session: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};
