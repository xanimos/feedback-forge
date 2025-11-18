import type { AIProvider, GenerateInput, GenerateOutput } from './types.js';
import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

/**
 * Vercel AI SDK provider implementation for Feedback Forge.
 * Supports OpenAI, Anthropic, and Google AI models through the Vercel AI SDK.
 *
 * @example
 * ```typescript
 * const provider = new VercelAIProvider();
 * const result = await provider.generate({
 *   modelString: 'openai:gpt-4o',
 *   apiKey: process.env.OPENAI_API_KEY,
 *   prompt: 'Analyze this feedback',
 *   system: 'You are a helpful assistant',
 *   schema: z.object({ summary: z.string() }),
 *   temperature: 0.7
 * });
 * ```
 */
export class VercelAIProvider implements AIProvider {
  /**
   * Provider name identifier.
   */
  readonly name = 'vercel-ai-sdk';

  /**
   * Indicates whether this provider supports streaming responses.
   */
  readonly supportsStreaming = true;

  /**
   * Parse model string and return the appropriate SDK instance.
   *
   * @param modelString - Model string in format "provider:model" (e.g., "openai:gpt-4o")
   * @param apiKey - API key for the provider
   * @returns The configured model instance
   * @throws Error if provider is unsupported or format is invalid
   *
   * @private
   */
  private getModelInstance(modelString: string, apiKey: string) {
    // Parse provider and model from string
    const parts = modelString.split(':');
    if (parts.length !== 2) {
      throw new Error(
        `Invalid model string format: "${modelString}". Expected format: "provider:model" (e.g., "openai:gpt-4o")`,
      );
    }

    const [provider, model] = parts;

    // Return appropriate SDK instance based on provider
    switch (provider.toLowerCase()) {
      case 'openai': {
        const openai = createOpenAI({ apiKey });
        return openai(model);
      }

      case 'anthropic': {
        const anthropic = createAnthropic({ apiKey });
        return anthropic(model);
      }

      case 'google': {
        const google = createGoogleGenerativeAI({ apiKey });
        return google(model);
      }

      default:
        throw new Error(
          `Unsupported provider: "${provider}". Supported providers: openai, anthropic, google`,
        );
    }
  }

  /**
   * Generate AI output using the Vercel AI SDK.
   *
   * @param input - The generation input parameters including model/modelString and apiKey
   * @returns Promise resolving to the generated output and usage statistics
   * @throws Error if generation fails or configuration is invalid
   */
  async generate<T = any>(input: any): Promise<GenerateOutput<T>> {
    try {
      // Accept either 'model' or 'modelString' for flexibility
      const modelString = input.modelString || input.model;
      const apiKey = input.apiKey;

      // Validate required parameters
      if (!modelString) {
        throw new Error('model or modelString is required for VercelAIProvider');
      }
      if (!apiKey) {
        throw new Error('apiKey is required for VercelAIProvider');
      }
      if (!input.schema) {
        throw new Error('schema is required for generateObject');
      }

      // Get model instance
      const model = this.getModelInstance(modelString, apiKey);

      // Call generateObject with the configured model
      // Note: Cast to any to handle V1/V2 compatibility
      // Note: maxTokens is not a standard parameter for generateObject
      const result = await generateObject({
        model: model as any,
        schema: input.schema,
        system: input.system,
        prompt: input.prompt,
        temperature: input.temperature,
        // maxTokens is handled via the model configuration, not generateObject
      });

      // Return standardized output
      // Note: LanguageModelV2Usage properties are different from V1
      const usage = result.usage;
      return {
        output: result.object as T,
        usage: {
          // LanguageModelV2Usage uses different property names
          inputTokens: (usage as any).promptTokens ?? 0,
          outputTokens: (usage as any).completionTokens ?? 0,
          totalTokens: (usage as any).totalTokens ?? 0,
        },
      };
    } catch (error) {
      // Enhance error message with context
      const errorMessage = error instanceof Error ? error.message : String(error);
      const provider = input.modelString?.split(':')[0] || 'unknown';
      const model = input.modelString?.split(':')[1] || 'unknown';

      throw new Error(
        `VercelAIProvider generation failed for ${provider}:${model}: ${errorMessage}`,
      );
    }
  }
}
