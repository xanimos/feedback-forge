import type { z } from 'zod';

/**
 * Supported AI provider types for Feedback Forge.
 * - 'vercel': Vercel AI SDK (@vercel/ai)
 * - 'genkit': Google Genkit SDK (@genkit-ai/google-genai)
 * - 'custom': Custom provider implementation
 */
export type ProviderType = 'vercel' | 'genkit' | 'custom';

/**
 * Token usage statistics returned by AI providers.
 */
export interface TokenUsage {
  /**
   * Number of tokens in the input prompt.
   */
  inputTokens: number;

  /**
   * Number of tokens in the generated output.
   */
  outputTokens: number;

  /**
   * Total tokens used (inputTokens + outputTokens).
   */
  totalTokens: number;
}

/**
 * Input parameters for the AI provider's generate method.
 */
export interface GenerateInput {
  /**
   * The main prompt text to send to the AI model.
   */
  prompt: string;

  /**
   * System prompt that defines the AI's role and behavior.
   */
  system: string;

  /**
   * Optional Zod schema for structured output validation.
   * When provided, the AI will generate output conforming to this schema.
   */
  schema?: z.ZodType<any>;

  /**
   * Temperature for randomness in generation (0.0 - 1.0).
   * Lower values are more deterministic, higher values are more creative.
   * @default 0.8
   */
  temperature?: number;

  /**
   * Maximum number of tokens to generate in the response.
   */
  maxTokens?: number;
}

/**
 * Output returned by the AI provider's generate method.
 */
export interface GenerateOutput<T = any> {
  /**
   * The generated output from the AI model.
   * If a schema was provided, this will be validated against it.
   */
  output: T;

  /**
   * Token usage statistics for the generation.
   */
  usage: TokenUsage;
}

/**
 * Interface that all AI providers must implement.
 * This abstraction allows Feedback Forge to work with different AI SDKs
 * (Vercel AI, Genkit, or custom implementations) through a unified interface.
 */
export interface AIProvider {
  /**
   * Generate AI output based on the provided input.
   *
   * @param input - The generation input parameters
   * @returns Promise resolving to the generated output and usage statistics
   * @throws Error if generation fails
   *
   * @example
   * ```typescript
   * const result = await provider.generate({
   *   prompt: "Analyze this user feedback",
   *   system: "You are a helpful developer assistant",
   *   schema: z.object({ summary: z.string() }),
   *   temperature: 0.7
   * });
   * console.log(result.output); // { summary: "..." }
   * console.log(result.usage); // { inputTokens: 50, outputTokens: 100, totalTokens: 150 }
   * ```
   */
  generate<T = any>(input: GenerateInput): Promise<GenerateOutput<T>>;
}
