# @feedback-forge/core

Core AI processing engine for the Feedback Forge ecosystem. Provides a pluggable, provider-agnostic architecture for transforming user feedback into actionable developer prompts using multiple AI platforms.

## Installation

This package is intended to be used as a dependency of other Feedback Forge packages (payload-plugin, nestjs-plugin) and is not typically installed directly.

```bash
npm install @feedback-forge/core
# or
pnpm add @feedback-forge/core
# or
yarn add @feedback-forge/core
```

## Features

- **Multi-Provider AI Support**: Choose between Vercel AI SDK (OpenAI, Anthropic, Google), Google Genkit, or custom providers
- **Provider Abstraction**: Framework-agnostic `AIProvider` interface for easy extensibility
- **Structured Output**: Generates structured developer prompts using Zod schemas
- **Token Usage Tracking**: Monitor AI API usage and costs
- **Customizable System Prompts**: Tailor AI behavior for your specific needs
- **Type-Safe**: Full TypeScript support with comprehensive type exports

## AI Provider System

### Available Providers

#### 1. Vercel AI SDK Provider (Recommended)

The **VercelAIProvider** offers access to multiple AI platforms through a single unified interface:

**Supported Models:**

- **OpenAI**: `openai:gpt-4o`, `openai:gpt-4-turbo`, `openai:gpt-3.5-turbo`
- **Anthropic**: `anthropic:claude-3-5-sonnet-20241022`, `anthropic:claude-3-opus-20240229`
- **Google**: `google:gemini-2.0-flash-exp`, `google:gemini-1.5-pro`

**Model Format**: `"provider:model"` (e.g., `"openai:gpt-4o"`)

**Usage:**

```typescript
import { getFeedbackProcessor } from '@feedback-forge/core';

const processor = getFeedbackProcessor({
  ai: {
    provider: 'vercel',
    model: 'openai:gpt-4o',
    apiKey: process.env.OPENAI_API_KEY, // or ANTHROPIC_API_KEY, GOOGLE_AI_API_KEY
    temperature: 0.8,
    systemPrompt: 'You are an expert software engineer...',
  },
});

const result = await processor({
  feedback: 'The pricing page is confusing. I could not find the enterprise plan.',
  breadcrumbs: 'User was on /pricing page',
});

console.log(result.developerPrompt);
console.log(`Tokens used: ${result.usage.totalTokens}`);
```

#### 2. Google Genkit Provider (Legacy)

The **GenkitProvider** uses Google's Genkit framework for AI generation.

**Supported Models:**

- `gemini-2.5-flash`
- `gemini-2.0-flash-exp`
- `gemini-1.5-pro`

**Model Format**: Model name only (e.g., `"gemini-2.5-flash"`)

**Usage:**

```typescript
import { getFeedbackProcessor } from '@feedback-forge/core';

const processor = getFeedbackProcessor({
  ai: {
    provider: 'genkit',
    model: 'gemini-2.5-flash',
    apiKey: process.env.GOOGLE_AI_API_KEY,
    temperature: 0.8,
  },
});

const result = await processor({
  feedback: 'Login button not working on mobile',
  breadcrumbs: '/login page, iOS Safari',
});
```

#### 3. Custom Provider

Implement your own AI provider by conforming to the `AIProvider` interface:

```typescript
import type { AIProvider, GenerateInput, GenerateOutput } from '@feedback-forge/core';

class MyCustomProvider implements AIProvider {
  constructor(private config: { apiKey: string; model: string }) {}

  async generate(input: GenerateInput): Promise<GenerateOutput> {
    // Your custom AI logic here
    const response = await myAIService.generateText({
      prompt: input.prompt,
      schema: input.schema,
      systemPrompt: input.systemPrompt,
      temperature: input.temperature,
    });

    return {
      text: response.output,
      usage: {
        inputTokens: response.promptTokens,
        outputTokens: response.completionTokens,
        totalTokens: response.totalTokens,
      },
    };
  }
}

// Use it with getFeedbackProcessor
const processor = getFeedbackProcessor({
  ai: {
    provider: 'custom',
    customProvider: new MyCustomProvider({
      apiKey: process.env.MY_AI_API_KEY,
      model: 'my-model-name',
    }),
  },
});
```

## Core API

### `getFeedbackProcessor(config)`

Creates a feedback processor function that transforms user feedback into developer prompts.

**Parameters:**

```typescript
interface FeedbackForgeConfig {
  ai: {
    provider?: 'vercel' | 'genkit' | 'custom'; // Defaults to 'genkit' for backward compatibility
    model: string; // Format depends on provider
    apiKey: string; // Not required when using custom provider
    systemPrompt?: string; // Optional custom system prompt
    temperature?: number; // Optional temperature (0-1), defaults to 0.7
    customProvider?: AIProvider; // Required when provider is 'custom'
  };
  feedbackSystemPrompt?: string; // Alias for ai.systemPrompt (deprecated)
}
```

**Returns:**

```typescript
type FeedbackProcessor = (input: { feedback: string; breadcrumbs?: string }) => Promise<{
  developerPrompt: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}>;
```

**Example:**

```typescript
import { getFeedbackProcessor } from '@feedback-forge/core';

const processor = getFeedbackProcessor({
  ai: {
    provider: 'vercel',
    model: 'anthropic:claude-3-5-sonnet-20241022',
    apiKey: process.env.ANTHROPIC_API_KEY,
    temperature: 0.8,
    systemPrompt: `You are an expert software engineer reviewing user feedback.
Transform the feedback into a detailed, actionable prompt that includes:
1. The core issue or request
2. Steps to reproduce (if applicable)
3. Suggested implementation approach
4. Potential edge cases to consider`,
  },
});

const result = await processor({
  feedback: 'The search results are slow and often irrelevant',
  breadcrumbs: 'User searched for "react hooks", viewed 3 results, searched again',
});

console.log(result.developerPrompt);
// Output:
// ## User Feedback: Search Performance and Relevance Issues
//
// **Issue**: Users report slow search response times and irrelevant results
//
// **Reproduction Steps**:
// 1. User navigated to search page
// 2. Entered query "react hooks"
// 3. Experienced delay in results loading
// 4. Found results not matching intent
// 5. Performed secondary search
//
// **Suggested Implementation**:
// 1. Optimize search query performance with database indexing
// 2. Implement relevance scoring algorithm
// 3. Add search analytics to track query patterns
// ...
```

## Type Exports

The package exports comprehensive TypeScript types for building integrations:

```typescript
// Core types
import type {
  AIProvider,
  GenerateInput,
  GenerateOutput,
  TokenUsage,
  ProviderType,
  FeedbackForgeConfig,
  FeedbackProcessor,
} from '@feedback-forge/core';

// Provider classes (for custom implementations)
import { VercelAIProvider, GenkitProvider } from '@feedback-forge/core';
```

### `AIProvider` Interface

All AI providers implement this interface:

```typescript
interface AIProvider {
  generate(input: GenerateInput): Promise<GenerateOutput>;
}

interface GenerateInput {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  schema?: z.ZodSchema; // Zod schema for structured output
}

interface GenerateOutput {
  text: string;
  usage: TokenUsage;
}

interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}
```

## Default System Prompt

The default system prompt optimizes for creating actionable developer tasks:

```typescript
import { defaultFeedbackSystemPrompt } from '@feedback-forge/core';

console.log(defaultFeedbackSystemPrompt);
// "You are an expert software engineer. Your task is to turn user feedback
// into a detailed, actionable prompt for a developer. The prompt should include..."
```

You can override this with your own prompt tailored to your team's workflow.

## Migration Guide

### From Genkit-Only Versions

If you're upgrading from a version that only supported Genkit, your existing configuration will continue to work without changes:

```typescript
// Old configuration (still works)
const processor = getFeedbackProcessor({
  ai: {
    model: 'gemini-2.5-flash',
    apiKey: process.env.GOOGLE_AI_API_KEY,
  },
});

// Explicit Genkit (recommended)
const processor = getFeedbackProcessor({
  ai: {
    provider: 'genkit',
    model: 'gemini-2.5-flash',
    apiKey: process.env.GOOGLE_AI_API_KEY,
  },
});

// Or switch to Vercel AI SDK
const processor = getFeedbackProcessor({
  ai: {
    provider: 'vercel',
    model: 'openai:gpt-4o', // Note: different model format
    apiKey: process.env.OPENAI_API_KEY,
  },
});
```

**Breaking Changes**: None. The provider system is fully backward compatible.

## Provider Selection Guide

**Use Vercel AI SDK Provider when:**

- You want flexibility to switch between OpenAI, Anthropic, and Google models
- You need access to the latest models from multiple providers
- You want a unified API across different AI platforms
- You're starting a new project

**Use Genkit Provider when:**

- You have existing Genkit-based integrations
- You prefer Google's Genkit framework
- You exclusively use Google AI models

**Use Custom Provider when:**

- You have an internal AI service
- You need specialized preprocessing/postprocessing
- You want to implement custom caching or rate limiting
- You're integrating a provider not supported by Vercel AI SDK or Genkit

## Advanced Usage

### Token Usage Tracking

Monitor and log AI API usage:

```typescript
const processor = getFeedbackProcessor({
  ai: {
    provider: 'vercel',
    model: 'openai:gpt-4o',
    apiKey: process.env.OPENAI_API_KEY,
  },
});

const result = await processor({
  feedback: 'Feature request here...',
  breadcrumbs: 'User journey...',
});

console.log(`Input tokens: ${result.usage.inputTokens}`);
console.log(`Output tokens: ${result.usage.outputTokens}`);
console.log(`Total tokens: ${result.usage.totalTokens}`);

// Calculate costs (example: OpenAI GPT-4o pricing)
const inputCost = (result.usage.inputTokens / 1_000_000) * 2.5; // $2.50 per 1M tokens
const outputCost = (result.usage.outputTokens / 1_000_000) * 10.0; // $10.00 per 1M tokens
console.log(`Estimated cost: $${(inputCost + outputCost).toFixed(6)}`);
```

### Custom System Prompts for Different Contexts

```typescript
const bugReportProcessor = getFeedbackProcessor({
  ai: {
    provider: 'vercel',
    model: 'anthropic:claude-3-5-sonnet-20241022',
    apiKey: process.env.ANTHROPIC_API_KEY,
    systemPrompt: `You are analyzing bug reports. Create a detailed bug ticket with:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Severity assessment
- Suggested fix`,
  },
});

const featureRequestProcessor = getFeedbackProcessor({
  ai: {
    provider: 'vercel',
    model: 'openai:gpt-4o',
    apiKey: process.env.OPENAI_API_KEY,
    systemPrompt: `You are a product manager analyzing feature requests. Create:
- User story format
- Acceptance criteria
- Technical considerations
- Priority recommendation
- Similar existing features`,
  },
});
```

### Error Handling

```typescript
import { getFeedbackProcessor } from '@feedback-forge/core';

try {
  const processor = getFeedbackProcessor({
    ai: {
      provider: 'vercel',
      model: 'openai:gpt-4o',
      apiKey: process.env.OPENAI_API_KEY,
    },
  });

  const result = await processor({
    feedback: 'User feedback here',
    breadcrumbs: 'User journey',
  });

  console.log(result.developerPrompt);
} catch (error) {
  if (error.message.includes('API key')) {
    console.error('Invalid API key. Check your environment variables.');
  } else if (error.message.includes('rate limit')) {
    console.error('Rate limit exceeded. Implement retry logic or backoff.');
  } else {
    console.error('AI processing failed:', error);
  }
}
```

## Framework Integrations

This package is used by:

- **[@feedback-forge/payload-plugin](../payload-plugin)**: Payload CMS plugin with admin UI and background jobs
- **[@feedback-forge/nestjs-plugin](../nestjs-plugin)**: NestJS module for stateless feedback processing

For most use cases, you should use one of these framework integrations rather than using `@feedback-forge/core` directly.

## Related Packages

- [@feedback-forge/react-widget](../react-widget): React feedback collection component
- [@feedback-forge/angular-widget](../angular-widget): Angular feedback collection component
- [@feedback-forge/integration-github](../integration-github): GitHub API client
- [@feedback-forge/integration-jules](../integration-jules): Jules API client

---

[Back to root README](../../README.md)
