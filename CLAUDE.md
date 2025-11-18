# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Feedback Forge is a modular, open-source toolkit for collecting, processing, and acting on user feedback. It uses AI (via multiple provider options including Vercel AI SDK and Google's Genkit) to transform user feedback into actionable developer prompts and can automatically create GitHub issues or initiate Jules AI coding sessions.

This is a **pnpm monorepo** with the following packages:

**Framework Integrations:**

- `@feedback-forge/payload-plugin` - Payload CMS plugin with admin UI and background jobs
- `@feedback-forge/nestjs-plugin` - NestJS module for stateless feedback processing
- `@feedback-forge/angular-widget` - Angular standalone component (Angular 18+)
- `@feedback-forge/react-widget` - React feedback collection component

**Core & Integrations:**

- `@feedback-forge/core` - Framework-agnostic AI processing (multi-provider support)
- `@feedback-forge/integration-github` - Framework-agnostic GitHub API client
- `@feedback-forge/integration-jules` - Framework-agnostic Jules API client

## Development Commands

### Setup

```bash
pnpm install              # Install all dependencies
```

### Building

```bash
pnpm build                # Build all packages (runs build in each package)
pnpm -r build             # Equivalent to above
pnpm clean                # Clean all build artifacts
```

### Development

```bash
pnpm dev                  # Start payload-plugin dev server (Next.js)
```

### Testing

```bash
pnpm test                 # Run all tests (runs test in each package)
pnpm --filter @feedback-forge/payload-plugin test:int    # Run integration tests
pnpm --filter @feedback-forge/payload-plugin test:e2e    # Run E2E tests (Playwright)
```

### Linting

```bash
pnpm lint                 # Lint and format entire codebase
```

### Package-specific commands

Navigate to a package directory or use pnpm filters:

```bash
pnpm --filter @feedback-forge/payload-plugin dev          # Dev server
pnpm --filter @feedback-forge/payload-plugin generate:types    # Generate Payload types
pnpm --filter @feedback-forge/payload-plugin generate:importmap # Generate import map
```

## Architecture

### Core Feedback Flow

1. **Collection**: User submits feedback via `@feedback-forge/react-widget` or `@feedback-forge/angular-widget`
2. **Storage**: Feedback stored in Payload's `feedback` collection with status "received"
3. **Processing**: Background job (`feedbackForge_processFeedback`) triggers AI processing
4. **AI Generation**: AI provider (`getFeedbackProcessor` in `packages/core/src/feedbackProcessor.ts:14`) transforms feedback + breadcrumbs into a structured developer prompt using configured provider (Vercel AI SDK, Genkit, or custom)
5. **Integration Actions**:
   - GitHub: Automatically create issue (if configured in FeedbackSettings global)
   - Jules: Admin manually triggers Jules session from Payload admin UI

### Key Components

**Payload Plugin** (`packages/payload-plugin/src/index.ts`)

- Extends Payload config by adding:
  - `feedback` collection with fields: title, feedback, breadcrumbs, user, developerPrompt, status, julesSessionId, githubIssueUrl
  - `feedback-settings` global for integration configuration
  - Three custom endpoints: `/api/feedback`, `/api/create-github-issue`, `/api/feedback-forge/start-jules-session`
  - Background job: `feedbackForge_processFeedback` (auto-runs every 5 minutes via cron)
- Hooks: `dispatchFeedbackJob` (afterChange), `allowAnonymous` (beforeValidate, conditional)

**AI Processing (Multi-Provider)** (`packages/core/src/feedbackProcessor.ts`)

- Uses pluggable AI provider system with abstraction layer
- Default provider: Vercel AI SDK with model `openai:gpt-4o` and temperature 0.8
- Supported providers:
  - **VercelAIProvider** (default): Supports OpenAI, Anthropic, Google, and other Vercel AI SDK models
  - **GenkitProvider**: Google's Genkit framework (maintained for backward compatibility)
  - Custom providers implementing the `AIProvider` interface
- Input: `{ feedback: string, breadcrumbs: string }`
- Output: `{ developerPrompt: string }` (structured via Zod schema)
- System prompt configurable via `feedbackSystemPrompt` in config or FeedbackSettings global
- Provider implementation details: `packages/core/src/providers/`

**Job Processing** (`packages/payload-plugin/src/jobs/processFeedback.ts`)

- Triggered by `afterChange` hook on feedback collection
- Fetches FeedbackSettings global for AI config (`feedbackSettings.ai` object containing provider, model, apiKey, systemPrompt, temperature)
- Provider field determines which AI provider to use (defaults to `vercel` for Vercel AI SDK)
- Calls `getFeedbackProcessor` with appropriate provider and updates feedback document with `developerPrompt`

**Integration Endpoints**

- `createGithubIssue` (`packages/payload-plugin/src/endpoints/createGithubIssue.ts:11`): Admin-only POST endpoint that creates GitHub issue using developer prompt
- `startJulesSession` (`packages/payload-plugin/src/endpoints/startJulesSession.ts:11`): Admin-only POST endpoint that initiates Jules session with source context (GitHub repo + branch)

### Configuration Architecture

Plugin configuration happens at two levels:

1. **Plugin Options** (in `payload.config.ts`): Static config like `access`, `allowAnonymousSubmissions`, `cron`, `disabled`
2. **FeedbackSettings Global** (Payload admin UI): Runtime config for AI settings (`ai` object with provider, model, apiKey, systemPrompt, temperature), GitHub integration (repo, owner, token), Jules integration (API key, repo, branch)

The job and endpoints dynamically fetch settings from the global at runtime, allowing configuration changes without code deployment.

**AI Configuration Structure:**

```typescript
feedbackSettings.ai = {
  provider: 'vercel' | 'genkit', // defaults to 'vercel'
  model: 'openai:gpt-4o', // provider-specific model string
  apiKey: 'sk-...', // provider-specific API key
  systemPrompt: '...', // optional custom system prompt
  temperature: 0.8, // optional temperature (0-1)
};
```

### Provider System

Feedback Forge uses a pluggable provider architecture for AI processing, allowing seamless switching between different AI services.

**Provider Abstraction:**

- All providers implement the `AIProvider` interface (`packages/core/src/providers/types.ts`)
- Interface defines a single method: `generateText(options: GenerateTextOptions): Promise<string>`
- Provider-agnostic implementation in `packages/core/src/feedbackProcessor.ts`

**Available Providers:**

1. **VercelAIProvider** (`packages/core/src/providers/vercel.ts`)
   - Default provider for the system
   - Built on Vercel AI SDK
   - Supports multiple model providers: OpenAI, Anthropic, Google, etc.
   - Model format: `provider:model` (e.g., `openai:gpt-4o`, `anthropic:claude-3-5-sonnet-20241022`)
   - Default model: `openai:gpt-4o`

2. **GenkitProvider** (`packages/core/src/providers/genkit.ts`)
   - Google's Genkit framework
   - Maintained for backward compatibility with existing configurations
   - Supports Google AI models (Gemini)
   - Model format: `gemini-2.5-flash`, `gemini-2.0-flash-exp`, etc.

**Provider Factory Pattern:**

- `createProvider(config)` function in `packages/core/src/providers/factory.ts`
- Automatically instantiates correct provider based on config.provider field
- Falls back to VercelAIProvider if provider not specified
- Extensible: custom providers can be added by implementing `AIProvider` interface

**File Locations:**

- `packages/core/src/providers/types.ts` - Provider interface definition
- `packages/core/src/providers/factory.ts` - Provider factory and creation logic
- `packages/core/src/providers/vercel.ts` - Vercel AI SDK provider
- `packages/core/src/providers/genkit.ts` - Genkit provider

### Status Management

The `status` field on feedback documents tracks workflow state:

- `received` (default): Feedback submitted, not yet processed
- `in-progress`: Jules session successfully started
- `completed`: Manually set after PR merged

Jules integration manages status transitions automatically based on session start success/failure.

## Important Development Notes

### Monorepo Structure

- Uses pnpm workspaces with `workspace:*` protocol for internal dependencies
- Each package has its own build process (TypeScript for core/integrations, SWC for payload-plugin)
- payload-plugin has a `dev` directory with a full Next.js + Payload test app

### TypeScript & Building

- All packages use ES modules (`"type": "module"`)
- payload-plugin uses SWC for transpilation + separate TypeScript for types
- Core and integrations use plain `tsc`
- Run `pnpm build` from root to build all packages in dependency order

### Payload Plugin Development

- Dev environment: `packages/payload-plugin/dev/` contains full Payload + Next.js app
- Config: `packages/payload-plugin/dev/payload.config.ts` shows plugin usage example
- Uses SQLite adapter for local development
- Seeding: `seed.ts` creates test user and initial data
- Access control: Dev config has permissive access for testing

### Client Components

- React widget and Payload UI components (GitHub/Jules management) are client components
- Export paths: Main plugin exports from `/`, client components from `/client`, RSC utilities from `/rsc`

### Conventional Commits

This project uses Conventional Commits for changelog generation. Format: `feat:`, `fix:`, `docs:`, etc.

## Testing

- Integration tests: Vitest (`packages/payload-plugin/dev/int.spec.ts`)
- E2E tests: Playwright (`packages/payload-plugin/dev/e2e.spec.ts`)
- Dev credentials helper: `packages/payload-plugin/dev/helpers/credentials.ts`
- Test email adapter: `packages/payload-plugin/dev/helpers/testEmailAdapter.ts`
