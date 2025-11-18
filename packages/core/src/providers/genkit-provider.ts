import type { AIProvider, GenerateInput, GenerateOutput } from './types.js';
import { googleAI } from '@genkit-ai/google-genai';
import { genkit, z } from 'genkit';

export class GenkitProvider implements AIProvider {
  name = 'genkit';
  supportsStreaming = true;

  async generate<T>(input: any): Promise<GenerateOutput<T>> {
    try {
      // Extract required fields
      const model = input.model || 'gemini-2.5-flash';
      const apiKey = input.apiKey;
      const temperature = input.temperature || 0.8;
      const schema = input.schema;
      const system = input.system;

      // Convert prompt to array format if it's a string
      let promptArray: Array<{ text: string }>;
      if (typeof input.prompt === 'string') {
        promptArray = [{ text: input.prompt }];
      } else if (Array.isArray(input.prompt)) {
        // Already in array format
        promptArray = input.prompt;
      } else {
        throw new Error('Invalid prompt format for GenkitProvider');
      }

      const ai = genkit({
        model: googleAI.model(model, {
          temperature,
          apiKey,
        }),
        plugins: [googleAI()],
      });

      // Create input schema for the flow
      const flowInputSchema = z.object({
        prompts: z.array(z.string()),
        system: z.string(),
      });

      // Define a flow for this generation
      const flow = ai.defineFlow(
        {
          name: 'feedbackForge_genkitProvider_tempFlow',
          inputSchema: flowInputSchema,
          outputSchema: schema,
        },
        async (flowInput) => {
          const { output } = await ai.generate({
            output: {
              schema,
            },
            prompt: flowInput.prompts.map((text) => ({ text })),
            system: flowInput.system,
          });

          if (!output) {
            throw new Error('Genkit generate returned no output');
          }

          return output;
        },
      );

      // Execute the flow
      const result = await flow({
        prompts: promptArray.map((p) => p.text),
        system,
      });

      return {
        output: result as T,
        // Genkit doesn't expose usage stats, so return zero values
        usage: {
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`GenkitProvider generate failed for model "${input.model}": ${errorMessage}`);
    }
  }
}
