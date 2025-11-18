import { z } from 'genkit';

import type { FeedbackForgeConfig } from './types.js';
import type { AIProvider } from './providers/index.js';
import { GenkitProvider } from './providers/genkit-provider.js';
import { VercelAIProvider } from './providers/vercel-provider.js';

import { defaultFeedbackSystemPrompt } from './defaultFeedbackSystemPrompt.js';

// Define the output schema for the developer prompt
export const DeveloperPromptOutputSchema = z.object({
  developerPrompt: z.string().describe('The generated prompt for the developer.'),
});

/**
 * Factory function to create an AI provider instance based on configuration.
 * @param config - The AI configuration from FeedbackForgeConfig
 * @returns An AIProvider instance
 */
function createProvider(config: FeedbackForgeConfig['ai']): AIProvider {
  // If custom provider supplied, use it
  if (config?.customProvider) {
    return config.customProvider;
  }

  // Default to 'genkit' for backward compatibility if provider not specified
  const provider = config?.provider || 'genkit';

  switch (provider) {
    case 'vercel':
      return new VercelAIProvider();
    case 'genkit':
      return new GenkitProvider();
    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
}

// Factory function to create the feedbackProcessor flow
export const getFeedbackProcessor = (options: FeedbackForgeConfig) => {
  const { ai: aiConfig, feedbackSystemPrompt: configSystemPrompt } = options;

  // Create the AI provider instance
  const provider = createProvider(aiConfig);
  const providerType = aiConfig?.provider || 'genkit';

  const feedbackSystemPrompt =
    aiConfig?.systemPrompt || configSystemPrompt || defaultFeedbackSystemPrompt;

  // Return a function that matches the original signature
  return async (input: { breadcrumbs: string; feedback: string }) => {
    // Prepare the prompt text
    const promptText = `Feedback: ${input.feedback}\n\nBreadcrumbs: ${input.breadcrumbs}`;

    // Build generate input - providers will handle format conversion internally
    const generateInput: any = {
      model:
        aiConfig?.model ||
        (providerType === 'vercel' ? 'google:gemini-2.5-flash' : 'gemini-2.5-flash'),
      apiKey: aiConfig?.apiKey || '',
      prompt: promptText,
      system: feedbackSystemPrompt,
      schema: DeveloperPromptOutputSchema,
      temperature: aiConfig?.temperature || 0.8,
    };

    // Call the provider's generate method
    const result = await provider.generate(generateInput);

    if (!result.output) {
      throw new Error('Failed to generate developer prompt from feedback.');
    }

    return result.output;
  };
};
