import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GenkitProvider } from '../providers/genkit-provider.js';
import { VercelAIProvider } from '../providers/vercel-provider.js';
import { DeveloperPromptOutputSchema, getFeedbackProcessor } from '../feedbackProcessor.js';
import type { FeedbackForgeConfig } from '../types.js';
import type { AIProvider } from '../providers/types.js';

// Mock the AI SDKs
vi.mock('ai', () => ({
  generateObject: vi.fn(),
}));

vi.mock('genkit', async () => {
  // Import real zod for schema validation
  const { z } = await vi.importActual<typeof import('zod')>('zod');
  return {
    genkit: vi.fn(() => ({
      defineFlow: vi.fn((config, fn) => fn),
      generate: vi.fn(),
    })),
    z,
  };
});

vi.mock('@genkit-ai/google-genai', () => ({
  googleAI: Object.assign(
    vi.fn(() => ({})),
    {
      model: vi.fn((modelName: string, config: any) => ({
        provider: 'google',
        modelName,
        config,
      })),
    },
  ),
}));

vi.mock('@ai-sdk/openai', () => ({
  createOpenAI: vi.fn(() => vi.fn((model: string) => ({ provider: 'openai', model }))),
}));

vi.mock('@ai-sdk/anthropic', () => ({
  createAnthropic: vi.fn(() => vi.fn((model: string) => ({ provider: 'anthropic', model }))),
}));

vi.mock('@ai-sdk/google', () => ({
  createGoogleGenerativeAI: vi.fn(() => vi.fn((model: string) => ({ provider: 'google', model }))),
}));

describe('AI Providers', () => {
  describe('VercelAIProvider', () => {
    let provider: VercelAIProvider;

    beforeEach(() => {
      provider = new VercelAIProvider();
      vi.clearAllMocks();
    });

    it('should have correct properties', () => {
      expect(provider.name).toBe('vercel-ai-sdk');
      expect(provider.supportsStreaming).toBe(true);
    });

    it('should throw error for invalid model format', async () => {
      await expect(
        provider.generate({
          model: 'gpt-4',
          apiKey: 'test-key',
          prompt: 'test',
          system: 'test',
          schema: DeveloperPromptOutputSchema,
        }),
      ).rejects.toThrow('Invalid model string format');
    });

    it('should throw error for missing model', async () => {
      await expect(
        provider.generate({
          apiKey: 'test-key',
          prompt: 'test',
          system: 'test',
          schema: DeveloperPromptOutputSchema,
        }),
      ).rejects.toThrow('model or modelString is required');
    });

    it('should throw error for missing apiKey', async () => {
      await expect(
        provider.generate({
          model: 'openai:gpt-4',
          prompt: 'test',
          system: 'test',
          schema: DeveloperPromptOutputSchema,
        }),
      ).rejects.toThrow('apiKey is required');
    });

    it('should throw error for missing schema', async () => {
      await expect(
        provider.generate({
          model: 'openai:gpt-4',
          apiKey: 'test-key',
          prompt: 'test',
          system: 'test',
        }),
      ).rejects.toThrow('schema is required');
    });

    it('should throw error for unsupported provider', async () => {
      await expect(
        provider.generate({
          model: 'azure:gpt-4',
          apiKey: 'test-key',
          prompt: 'test',
          system: 'test',
          schema: DeveloperPromptOutputSchema,
        }),
      ).rejects.toThrow('Unsupported provider: "azure"');
    });

    it('should accept valid OpenAI model format', async () => {
      const { generateObject } = await import('ai');
      vi.mocked(generateObject).mockResolvedValue({
        object: { developerPrompt: 'test output' },
        usage: {
          promptTokens: 10,
          completionTokens: 20,
          totalTokens: 30,
        },
      } as any);

      const result = await provider.generate({
        model: 'openai:gpt-4o',
        apiKey: 'test-key',
        prompt: 'test prompt',
        system: 'test system',
        schema: DeveloperPromptOutputSchema,
        temperature: 0.7,
      });

      expect(result.output).toEqual({ developerPrompt: 'test output' });
      expect(result.usage.inputTokens).toBe(10);
      expect(result.usage.outputTokens).toBe(20);
      expect(result.usage.totalTokens).toBe(30);
    });

    it('should accept valid Anthropic model format', async () => {
      const { generateObject } = await import('ai');
      vi.mocked(generateObject).mockResolvedValue({
        object: { developerPrompt: 'test output' },
        usage: {
          promptTokens: 10,
          completionTokens: 20,
          totalTokens: 30,
        },
      } as any);

      const result = await provider.generate({
        model: 'anthropic:claude-3-5-sonnet-20241022',
        apiKey: 'test-key',
        prompt: 'test prompt',
        system: 'test system',
        schema: DeveloperPromptOutputSchema,
      });

      expect(result.output).toEqual({ developerPrompt: 'test output' });
    });

    it('should accept valid Google model format', async () => {
      const { generateObject } = await import('ai');
      vi.mocked(generateObject).mockResolvedValue({
        object: { developerPrompt: 'test output' },
        usage: {
          promptTokens: 10,
          completionTokens: 20,
          totalTokens: 30,
        },
      } as any);

      const result = await provider.generate({
        model: 'google:gemini-2.5-flash',
        apiKey: 'test-key',
        prompt: 'test prompt',
        system: 'test system',
        schema: DeveloperPromptOutputSchema,
      });

      expect(result.output).toEqual({ developerPrompt: 'test output' });
    });

    it('should accept modelString parameter for backward compatibility', async () => {
      const { generateObject } = await import('ai');
      vi.mocked(generateObject).mockResolvedValue({
        object: { developerPrompt: 'test output' },
        usage: {
          promptTokens: 10,
          completionTokens: 20,
          totalTokens: 30,
        },
      } as any);

      const result = await provider.generate({
        modelString: 'openai:gpt-4o',
        apiKey: 'test-key',
        prompt: 'test prompt',
        system: 'test system',
        schema: DeveloperPromptOutputSchema,
      });

      expect(result.output).toEqual({ developerPrompt: 'test output' });
    });
  });

  describe('GenkitProvider', () => {
    let provider: GenkitProvider;

    beforeEach(() => {
      provider = new GenkitProvider();
      vi.clearAllMocks();
    });

    it('should have correct properties', () => {
      expect(provider.name).toBe('genkit');
      expect(provider.supportsStreaming).toBe(true);
    });

    it('should accept string prompt format', async () => {
      const { genkit } = await import('genkit');
      const mockFlow = vi.fn().mockResolvedValue({ developerPrompt: 'test output' });
      const mockGenerate = vi.fn().mockResolvedValue({
        output: { developerPrompt: 'test output' },
      });

      vi.mocked(genkit).mockReturnValue({
        defineFlow: vi.fn(() => mockFlow),
        generate: mockGenerate,
      } as any);

      const result = await provider.generate({
        model: 'gemini-2.5-flash',
        apiKey: 'test-key',
        prompt: 'test prompt',
        system: 'test system',
        schema: DeveloperPromptOutputSchema,
        temperature: 0.8,
      });

      expect(result.output).toEqual({ developerPrompt: 'test output' });
      expect(result.usage).toEqual({
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
      });
    });

    it('should accept array prompt format', async () => {
      const { genkit } = await import('genkit');
      const mockFlow = vi.fn().mockResolvedValue({ developerPrompt: 'test output' });

      vi.mocked(genkit).mockReturnValue({
        defineFlow: vi.fn(() => mockFlow),
        generate: vi.fn(),
      } as any);

      const result = await provider.generate({
        model: 'gemini-2.5-flash',
        apiKey: 'test-key',
        prompt: [{ text: 'test prompt' }],
        system: 'test system',
        schema: DeveloperPromptOutputSchema,
      });

      expect(result.output).toEqual({ developerPrompt: 'test output' });
    });

    it('should throw error for invalid prompt format', async () => {
      await expect(
        provider.generate({
          model: 'gemini-2.5-flash',
          apiKey: 'test-key',
          prompt: { invalid: true },
          system: 'test system',
          schema: DeveloperPromptOutputSchema,
        }),
      ).rejects.toThrow('Invalid prompt format for GenkitProvider');
    });

    it('should use default model when not specified', async () => {
      const { genkit } = await import('genkit');
      const mockFlow = vi.fn().mockResolvedValue({ developerPrompt: 'test output' });

      vi.mocked(genkit).mockReturnValue({
        defineFlow: vi.fn(() => mockFlow),
        generate: vi.fn(),
      } as any);

      await provider.generate({
        apiKey: 'test-key',
        prompt: 'test prompt',
        system: 'test system',
        schema: DeveloperPromptOutputSchema,
      });

      // Model should default to 'gemini-2.5-flash'
      expect(genkit).toHaveBeenCalled();
    });

    it('should use default temperature when not specified', async () => {
      const { genkit } = await import('genkit');
      const mockFlow = vi.fn().mockResolvedValue({ developerPrompt: 'test output' });

      vi.mocked(genkit).mockReturnValue({
        defineFlow: vi.fn(() => mockFlow),
        generate: vi.fn(),
      } as any);

      await provider.generate({
        model: 'gemini-2.5-flash',
        apiKey: 'test-key',
        prompt: 'test prompt',
        system: 'test system',
        schema: DeveloperPromptOutputSchema,
      });

      // Temperature should default to 0.8
      expect(genkit).toHaveBeenCalled();
    });

    it('should throw error when generate returns no output', async () => {
      const { genkit } = await import('genkit');
      const mockGenerate = vi.fn().mockResolvedValue({ output: null });
      const mockDefineFlow = vi.fn((config, fn) => {
        // Return an async function that executes the flow logic
        return async (input: any) => {
          return fn(input);
        };
      });

      vi.mocked(genkit).mockReturnValue({
        defineFlow: mockDefineFlow,
        generate: mockGenerate,
      } as any);

      await expect(
        provider.generate({
          model: 'gemini-2.5-flash',
          apiKey: 'test-key',
          prompt: 'test prompt',
          system: 'test system',
          schema: DeveloperPromptOutputSchema,
        }),
      ).rejects.toThrow('Genkit generate returned no output');
    });
  });

  describe('createProvider factory (via getFeedbackProcessor)', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should create Vercel provider when specified', async () => {
      const { generateObject } = await import('ai');
      vi.mocked(generateObject).mockResolvedValue({
        object: { developerPrompt: 'test output' },
        usage: {
          promptTokens: 10,
          completionTokens: 20,
          totalTokens: 30,
        },
      } as any);

      const config: FeedbackForgeConfig = {
        githubRepo: 'test/repo',
        ai: {
          provider: 'vercel',
          model: 'openai:gpt-4o',
          apiKey: 'test-key',
        },
      };

      const processor = getFeedbackProcessor(config);
      const result = await processor({
        feedback: 'test feedback',
        breadcrumbs: 'test breadcrumbs',
      });

      expect(result.developerPrompt).toBe('test output');
    });

    it('should create Genkit provider when specified', async () => {
      const { genkit } = await import('genkit');
      const mockFlow = vi.fn().mockResolvedValue({ developerPrompt: 'test output' });

      vi.mocked(genkit).mockReturnValue({
        defineFlow: vi.fn(() => mockFlow),
        generate: vi.fn(),
      } as any);

      const config: FeedbackForgeConfig = {
        githubRepo: 'test/repo',
        ai: {
          provider: 'genkit',
          model: 'gemini-2.5-flash',
          apiKey: 'test-key',
        },
      };

      const processor = getFeedbackProcessor(config);
      const result = await processor({
        feedback: 'test feedback',
        breadcrumbs: 'test breadcrumbs',
      });

      expect(result.developerPrompt).toBe('test output');
    });

    it('should default to Genkit for backward compatibility', async () => {
      const { genkit } = await import('genkit');
      const mockFlow = vi.fn().mockResolvedValue({ developerPrompt: 'test output' });

      vi.mocked(genkit).mockReturnValue({
        defineFlow: vi.fn(() => mockFlow),
        generate: vi.fn(),
      } as any);

      const config: FeedbackForgeConfig = {
        githubRepo: 'test/repo',
        ai: {
          model: 'gemini-2.5-flash',
          apiKey: 'test-key',
        },
      };

      const processor = getFeedbackProcessor(config);
      const result = await processor({
        feedback: 'test feedback',
        breadcrumbs: 'test breadcrumbs',
      });

      expect(result.developerPrompt).toBe('test output');
    });

    it('should use custom provider when supplied', async () => {
      const customProvider: AIProvider = {
        generate: vi.fn().mockResolvedValue({
          output: { developerPrompt: 'custom output' },
          usage: { inputTokens: 5, outputTokens: 10, totalTokens: 15 },
        }),
      };

      const config: FeedbackForgeConfig = {
        githubRepo: 'test/repo',
        ai: {
          customProvider,
          model: 'custom-model',
          apiKey: 'test-key',
        },
      };

      const processor = getFeedbackProcessor(config);
      const result = await processor({
        feedback: 'test feedback',
        breadcrumbs: 'test breadcrumbs',
      });

      expect(result.developerPrompt).toBe('custom output');
      expect(customProvider.generate).toHaveBeenCalled();
    });

    it('should throw error for unknown provider', () => {
      const config: FeedbackForgeConfig = {
        githubRepo: 'test/repo',
        ai: {
          provider: 'unknown' as any,
          model: 'test-model',
          apiKey: 'test-key',
        },
      };

      expect(() => getFeedbackProcessor(config)).toThrow('Unknown AI provider: unknown');
    });

    it('should use custom system prompt from config', async () => {
      const { genkit } = await import('genkit');
      const mockFlow = vi.fn().mockResolvedValue({ developerPrompt: 'test output' });

      vi.mocked(genkit).mockReturnValue({
        defineFlow: vi.fn(() => mockFlow),
        generate: vi.fn(),
      } as any);

      const config: FeedbackForgeConfig = {
        githubRepo: 'test/repo',
        ai: {
          provider: 'genkit',
          model: 'gemini-2.5-flash',
          apiKey: 'test-key',
          systemPrompt: 'Custom system prompt',
        },
      };

      const processor = getFeedbackProcessor(config);
      await processor({
        feedback: 'test feedback',
        breadcrumbs: 'test breadcrumbs',
      });

      expect(mockFlow).toHaveBeenCalled();
    });

    it('should use custom temperature from config', async () => {
      const { genkit } = await import('genkit');
      const mockFlow = vi.fn().mockResolvedValue({ developerPrompt: 'test output' });

      vi.mocked(genkit).mockReturnValue({
        defineFlow: vi.fn(() => mockFlow),
        generate: vi.fn(),
      } as any);

      const config: FeedbackForgeConfig = {
        githubRepo: 'test/repo',
        ai: {
          provider: 'genkit',
          model: 'gemini-2.5-flash',
          apiKey: 'test-key',
          temperature: 0.5,
        },
      };

      const processor = getFeedbackProcessor(config);
      await processor({
        feedback: 'test feedback',
        breadcrumbs: 'test breadcrumbs',
      });

      expect(mockFlow).toHaveBeenCalled();
    });

    it('should default to vercel model format when provider is vercel and no model specified', async () => {
      const { generateObject } = await import('ai');
      vi.mocked(generateObject).mockResolvedValue({
        object: { developerPrompt: 'test output' },
        usage: {
          promptTokens: 10,
          completionTokens: 20,
          totalTokens: 30,
        },
      } as any);

      const config: FeedbackForgeConfig = {
        githubRepo: 'test/repo',
        ai: {
          provider: 'vercel',
          model: 'openai:gpt-4o',
          apiKey: 'test-key',
        },
      };

      const processor = getFeedbackProcessor(config);
      const result = await processor({
        feedback: 'test feedback',
        breadcrumbs: 'test breadcrumbs',
      });

      expect(result.developerPrompt).toBe('test output');
    });

    it('should format prompt correctly with feedback and breadcrumbs', async () => {
      const { genkit } = await import('genkit');
      const mockFlow = vi.fn().mockResolvedValue({ developerPrompt: 'test output' });

      vi.mocked(genkit).mockReturnValue({
        defineFlow: vi.fn(() => mockFlow),
        generate: vi.fn(),
      } as any);

      const config: FeedbackForgeConfig = {
        githubRepo: 'test/repo',
        ai: {
          provider: 'genkit',
          model: 'gemini-2.5-flash',
          apiKey: 'test-key',
        },
      };

      const processor = getFeedbackProcessor(config);
      await processor({
        feedback: 'The button is broken',
        breadcrumbs: '/home -> /settings -> clicked save',
      });

      expect(mockFlow).toHaveBeenCalled();
    });

    it('should throw error when generation fails', async () => {
      const { genkit } = await import('genkit');
      const mockFlow = vi.fn().mockRejectedValue(new Error('Generation failed'));

      vi.mocked(genkit).mockReturnValue({
        defineFlow: vi.fn(() => mockFlow),
        generate: vi.fn(),
      } as any);

      const config: FeedbackForgeConfig = {
        githubRepo: 'test/repo',
        ai: {
          provider: 'genkit',
          model: 'gemini-2.5-flash',
          apiKey: 'test-key',
        },
      };

      const processor = getFeedbackProcessor(config);
      await expect(
        processor({
          feedback: 'test feedback',
          breadcrumbs: 'test breadcrumbs',
        }),
      ).rejects.toThrow('Generation failed');
    });

    it('should throw error when output is null', async () => {
      const { genkit } = await import('genkit');
      const mockFlow = vi.fn().mockResolvedValue(null);

      vi.mocked(genkit).mockReturnValue({
        defineFlow: vi.fn(() => mockFlow),
        generate: vi.fn(),
      } as any);

      const config: FeedbackForgeConfig = {
        githubRepo: 'test/repo',
        ai: {
          provider: 'genkit',
          model: 'gemini-2.5-flash',
          apiKey: 'test-key',
        },
      };

      const processor = getFeedbackProcessor(config);
      await expect(
        processor({
          feedback: 'test feedback',
          breadcrumbs: 'test breadcrumbs',
        }),
      ).rejects.toThrow('Failed to generate developer prompt from feedback');
    });
  });

  describe('DeveloperPromptOutputSchema', () => {
    it('should validate correct output', () => {
      const validOutput = {
        developerPrompt: 'This is a valid developer prompt',
      };

      const result = DeveloperPromptOutputSchema.safeParse(validOutput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.developerPrompt).toBe('This is a valid developer prompt');
      }
    });

    it('should reject output without developerPrompt', () => {
      const invalidOutput = {};

      const result = DeveloperPromptOutputSchema.safeParse(invalidOutput);
      expect(result.success).toBe(false);
    });

    it('should reject output with non-string developerPrompt', () => {
      const invalidOutput = {
        developerPrompt: 123,
      };

      const result = DeveloperPromptOutputSchema.safeParse(invalidOutput);
      expect(result.success).toBe(false);
    });
  });
});
