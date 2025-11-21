# @feedback-forge/express-plugin

Express plugin for Feedback Forge - process user feedback with AI, create GitHub issues, and start Jules coding sessions.

## Features

- ✅ **Stateless feedback processing** - No database required
- 🤖 **Multi-provider AI support** - Vercel AI SDK (OpenAI, Anthropic, Google), Genkit, or custom providers
- 🔧 **GitHub integration** - Automatically create issues from feedback
- 🚀 **Jules integration** - Start AI coding sessions
- 📦 **Minimal dependencies** - Only Express as peer dependency
- 🎯 **TypeScript first** - Full type safety

## Installation

```bash
npm install @feedback-forge/express-plugin express
# or
pnpm add @feedback-forge/express-plugin express
```

## Quick Start

### Standard Express

```typescript
import express from 'express';
import { registerFeedbackForge } from '@feedback-forge/express-plugin';

const app = express();
app.use(express.json());

// Register Feedback Forge routes
registerFeedbackForge(app, {
  ai: {
    provider: 'vercel',
    model: 'openai:gpt-4o',
    apiKey: process.env.OPENAI_API_KEY!,
  },
  github: {
    owner: 'my-org',
    repo: 'my-repo',
    token: process.env.GITHUB_TOKEN!,
  },
  routePrefix: '/api/feedback', // optional, defaults to '/feedback'
  autoCreateGithubIssue: true, // optional, defaults to false
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
```

### InversifyJS

```typescript
import 'reflect-metadata';
import { Container } from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';
import express from 'express';
import { registerFeedbackForge } from '@feedback-forge/express-plugin';

const container = new Container();

// Bind your controllers and services
// container.bind<MyService>(TYPES.MyService).to(MyService);

const server = new InversifyExpressServer(container);

server.setConfig((app) => {
  app.use(express.json());

  // Register Feedback Forge routes
  registerFeedbackForge(app, {
    ai: {
      provider: 'vercel',
      model: 'openai:gpt-4o',
      apiKey: process.env.OPENAI_API_KEY!,
    },
    routePrefix: '/api/feedback',
  });
});

const app = server.build();
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
```

## API Endpoints

### POST `/feedback`

Submit feedback and process with AI.

**Request:**

```json
{
  "title": "Login page is broken",
  "feedback": "Cannot login with valid credentials",
  "breadcrumbs": "home > login > error"
}
```

**Response:**

```json
{
  "message": "Feedback processed successfully",
  "data": {
    "developerPrompt": "...",
    "githubIssue": { ... } // if autoCreateGithubIssue is enabled
  }
}
```

### POST `/feedback/github-issue`

Manually create a GitHub issue.

**Request:**

```json
{
  "title": "Issue title",
  "body": "Issue body"
}
```

### POST `/feedback/jules-session`

Start a Jules AI coding session.

**Request:**

```json
{
  "title": "Fix login bug",
  "developerPrompt": "Investigate and fix the login authentication issue..."
}
```

## Configuration

### AI Providers

#### Vercel AI SDK (Recommended)

```typescript
{
  ai: {
    provider: 'vercel',
    model: 'openai:gpt-4o', // or 'anthropic:claude-3-5-sonnet-20241022'
    apiKey: process.env.OPENAI_API_KEY,
    temperature: 0.8, // optional
    systemPrompt: '...' // optional
  }
}
```

#### Genkit

```typescript
{
  ai: {
    provider: 'genkit',
    model: 'gemini-2.0-flash-exp',
    apiKey: process.env.GOOGLE_AI_API_KEY,
  }
}
```

#### Custom Provider

```typescript
import type { AIProvider } from '@feedback-forge/plugin-common';

const myProvider: AIProvider = {
  async generateText(options) {
    // Your custom implementation
    return 'Generated text';
  },
};

registerFeedbackForge(app, {
  ai: {
    provider: 'custom',
    customProvider: myProvider,
    model: 'not-used',
    apiKey: 'not-used',
  },
});
```

## Advanced Usage

### Custom Router

```typescript
import { createFeedbackRouter } from '@feedback-forge/express-plugin';

const feedbackRouter = createFeedbackRouter({
  ai: { ... },
  github: { ... },
});

// Add custom middleware
feedbackRouter.use((req, res, next) => {
  // Your custom logic
  next();
});

app.use('/custom-prefix', feedbackRouter);
```

### Custom Validation

```typescript
import { validateRequiredFields, validateOptionalFields } from '@feedback-forge/express-plugin';

router.post(
  '/my-endpoint',
  validateRequiredFields(['field1', 'field2']),
  validateOptionalFields(['optionalField']),
  async (req, res) => {
    // Handler
  },
);
```

## Architecture

This plugin uses `@feedback-forge/plugin-common` for shared business logic, ensuring consistency with the NestJS plugin and other framework integrations.

## License

MIT
