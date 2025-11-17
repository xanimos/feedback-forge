import { googleAI } from '@genkit-ai/google-genai';
import { genkit, z } from 'genkit';

import type { FeedbackForgeConfig } from './types.js';

import { defaultFeedbackSystemPrompt } from './defaultFeedbackSystemPrompt.js';

// Define the output schema for the developer prompt
export const DeveloperPromptOutputSchema = z.object({
  developerPrompt: z.string().describe('The generated prompt for the developer.'),
});

// Factory function to create the feedbackProcessor flow
export const getFeedbackProcessor = (options: FeedbackForgeConfig) => {
  const { ai: aiConfig, feedbackSystemPrompt: configSystemPrompt } = options;

  // Initialize Genkit with the Google AI plugin
  const ai = genkit({
    model: googleAI.model(aiConfig?.model || 'gemini-2.5-flash', {
      temperature: aiConfig?.temperature || 0.8,
      apiKey: aiConfig?.apiKey,
    }),
    plugins: [googleAI()],
  });

  const feedbackSystemPrompt =
    aiConfig?.systemPrompt || configSystemPrompt || defaultFeedbackSystemPrompt;

  return ai.defineFlow(
    {
      name: 'feedbackForge_feedbackProcessor', // Unique flow name
      inputSchema: z.object({ breadcrumbs: z.string(), feedback: z.string() }),
      outputSchema: DeveloperPromptOutputSchema,
    },
    async (input) => {
      const { output } = await ai.generate({
        output: {
          schema: DeveloperPromptOutputSchema,
        },
        prompt: [
          { text: `Feedback: ${input.feedback}` },
          { text: `Breadcrumbs: ${input.breadcrumbs}` },
        ],
        system: feedbackSystemPrompt,
      });

      if (!output) {
        throw new Error('Failed to generate developer prompt from feedback.');
      }

      return output;
    },
  );
};
