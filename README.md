# Feedback Forge

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Feedback Forge is a powerful, open-source toolkit for collecting, processing, and acting on user feedback within your applications. It's designed to be modular and extensible, with integrations for multiple frameworks including **Payload CMS**, **Angular**, and **NestJS**.

## Overview

At its core, Feedback Forge provides a seamless way to gather feedback through customizable widgets (React & Angular). This feedback can then be processed by AI to generate actionable developer prompts, create issues in project management tools like GitHub, and even initiate AI-powered coding sessions with services like Jules. Feedback Forge supports multiple AI providers including OpenAI, Anthropic, and Google through the Vercel AI SDK, as well as direct Google Genkit integration.

## Packages

This is a monorepo containing the following packages:

### Framework Integrations

- **[`@feedback-forge/payload-plugin`](./packages/payload-plugin/README.md):** Complete Payload CMS integration with admin UI, background jobs, and API endpoints.
- **[`@feedback-forge/nestjs-plugin`](./packages/nestjs-plugin/README.md):** 🆕 NestJS module for processing feedback, creating GitHub issues, and starting Jules sessions (stateless, no database required).
- **[`@feedback-forge/angular-widget`](./packages/angular-widget/README.md):** 🆕 Standalone Angular component for collecting user feedback (Angular 18+).
- **[`@feedback-forge/react-widget`](./packages/react-widget/README.md):** Customizable React component for collecting user feedback.

### Core & Integrations

- **[`@feedback-forge/core`](./packages/core/README.md):** Framework-agnostic AI processing logic with support for multiple providers (Vercel AI SDK and Google Genkit).
- **[`@feedback-forge/integration-github`](./packages/integration-github/README.md):** Framework-agnostic GitHub API client for creating issues.
- **[`@feedback-forge/integration-jules`](./packages/integration-jules/README.md):** Framework-agnostic Jules AI API client for starting coding sessions.

## Getting Started

Choose your framework to get started:

- **Payload CMS**: [`@feedback-forge/payload-plugin` README](./packages/payload-plugin/README.md)
- **NestJS + Angular**: [`@feedback-forge/nestjs-plugin`](./packages/nestjs-plugin/README.md) + [`@feedback-forge/angular-widget`](./packages/angular-widget/README.md)
- **React**: [`@feedback-forge/react-widget` README](./packages/react-widget/README.md)

### Quick Start: Angular + NestJS

**Install packages:**

```bash
# Frontend
npm install @feedback-forge/angular-widget

# Backend
npm install @feedback-forge/nestjs-plugin
```

**Frontend (Angular):**

```typescript
import { Component } from '@angular/core';
import { FeedbackWidgetComponent } from '@feedback-forge/angular-widget';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FeedbackWidgetComponent],
  template: ` <ff-feedback-widget [feedbackApiUrl]="'http://localhost:3000/feedback'" /> `,
})
export class AppComponent {}
```

**Backend (NestJS):**

```typescript
import { Module } from '@nestjs/common';
import { FeedbackForgeModule } from '@feedback-forge/nestjs-plugin';

@Module({
  imports: [
    FeedbackForgeModule.forRoot({
      ai: {
        model: 'gemini-2.5-flash',
        apiKey: process.env.GOOGLE_AI_API_KEY,
      },
      github: {
        owner: 'your-org',
        repo: 'your-repo',
        token: process.env.GITHUB_TOKEN,
      },
      autoCreateGithubIssue: true,
    }),
  ],
})
export class AppModule {}
```

## Architecture

Feedback Forge uses a modular architecture with framework-agnostic core packages:

```
User → Widget (React/Angular) → API (Payload/NestJS)
                                    ↓
                              Core AI Processing (Genkit)
                                    ↓
                              ┌─────────────┐
                              ↓             ↓
                         GitHub Issues   Jules Sessions
```

**Key Features:**

- 🤖 **Multi-Provider AI**: Support for OpenAI (GPT-4), Anthropic (Claude), and Google (Gemini) models to transform feedback into actionable developer prompts
- 🔧 **Framework Agnostic**: Core packages work with any backend (NestJS, Payload, Express, etc.)
- 📦 **Modular**: Use only the packages you need
- 🎨 **Customizable**: Full control over UI styling and AI behavior
- 🚀 **Stateless Option**: NestJS plugin requires no database (processes feedback immediately)

## AI Provider Configuration

Feedback Forge supports multiple AI providers through a flexible abstraction layer, giving you the freedom to choose the best model for your needs.

### Supported Providers

#### Vercel AI SDK (Recommended)

The Vercel AI SDK provides unified access to multiple AI platforms with a consistent interface:

- **OpenAI**: GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo
- **Anthropic**: Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku
- **Google**: Gemini 2.0 Flash, Gemini 2.5 Flash, Gemini Pro

**Model format**: `provider:model`

**Examples**:

- `openai:gpt-4o`
- `anthropic:claude-3-5-sonnet-20241022`
- `google:gemini-2.0-flash`

#### Google Genkit (Legacy)

Direct integration with Google's Genkit framework for Google AI models only.

**Model format**: `model-name`

**Examples**:

- `gemini-2.5-flash`
- `gemini-2.0-flash-lite`

**Note**: Existing configurations without a `provider` field automatically default to Genkit for backward compatibility.

### Configuration Examples

#### Payload Plugin with OpenAI

```typescript
import { buildConfig } from 'payload';
import { payloadFeedbackForge } from '@feedback-forge/payload-plugin';

export default buildConfig({
  plugins: [
    payloadFeedbackForge({
      ai: {
        provider: 'vercel',
        model: 'openai:gpt-4o',
        apiKey: process.env.OPENAI_API_KEY,
        temperature: 0.7,
      },
    }),
  ],
});
```

#### NestJS Plugin with Anthropic

```typescript
import { Module } from '@nestjs/common';
import { FeedbackForgeModule } from '@feedback-forge/nestjs-plugin';

@Module({
  imports: [
    FeedbackForgeModule.forRoot({
      ai: {
        provider: 'vercel',
        model: 'anthropic:claude-3-5-sonnet-20241022',
        apiKey: process.env.ANTHROPIC_API_KEY,
        temperature: 0.8,
      },
      github: {
        owner: 'your-org',
        repo: 'your-repo',
        token: process.env.GITHUB_TOKEN,
      },
    }),
  ],
})
export class AppModule {}
```

#### Using Google Gemini with Vercel AI SDK

```typescript
payloadFeedbackForge({
  ai: {
    provider: 'vercel',
    model: 'google:gemini-2.0-flash',
    apiKey: process.env.GOOGLE_AI_API_KEY,
    temperature: 0.8,
  },
});
```

#### Backward Compatible Configuration (Genkit)

```typescript
// Existing configs without 'provider' field default to Genkit
payloadFeedbackForge({
  ai: {
    model: 'gemini-2.5-flash',
    apiKey: process.env.GOOGLE_AI_API_KEY,
  },
});
```

### Custom Providers

Advanced users can implement custom AI providers by implementing the `AIProvider` interface:

```typescript
import type { AIProvider } from '@feedback-forge/core';

class MyCustomProvider implements AIProvider {
  name = 'my-custom-provider';
  supportsStreaming = false;

  async generate(input: {
    prompt: string;
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<{ text: string }> {
    // Your custom implementation
    const response = await yourCustomAIService.generate(input);
    return { text: response };
  }
}

// Use in Payload plugin
payloadFeedbackForge({
  ai: {
    provider: 'custom',
    customProvider: new MyCustomProvider(),
    apiKey: process.env.MY_API_KEY,
  },
});

// Use in NestJS plugin
FeedbackForgeModule.forRoot({
  ai: {
    provider: 'custom',
    customProvider: new MyCustomProvider(),
  },
});
```

### Provider-Specific API Keys

Each provider requires its own API key:

- **OpenAI**: Get your API key from [platform.openai.com](https://platform.openai.com/api-keys)
- **Anthropic**: Get your API key from [console.anthropic.com](https://console.anthropic.com/)
- **Google**: Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Configuration Priority

For the Payload plugin, AI configuration can be set at multiple levels (in order of priority):

1. **Runtime Settings**: FeedbackSettings global in Payload admin UI (highest priority)
2. **Plugin Options**: Static configuration in `payload.config.ts`
3. **Environment Variables**: Fallback values

For the NestJS plugin, configuration is set once at module initialization.

## Contributing

We welcome contributions from the community! Please read our [Contributing Guide](./CONTRIBUTING.md) for more information on how to get involved.

## License

Feedback Forge is licensed under the [MIT License](./LICENSE).
