# Feedback Forge

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Feedback Forge is a powerful, open-source toolkit for collecting, processing, and acting on user feedback within your applications. It's designed to be modular and extensible, with integrations for multiple frameworks including **Payload CMS**, **Angular**, and **NestJS**.

## Overview

At its core, Feedback Forge provides a seamless way to gather feedback through customizable widgets (React & Angular). This feedback can then be processed by AI (Google Genkit) to generate actionable developer prompts, create issues in project management tools like GitHub, and even initiate AI-powered coding sessions with services like Jules.

## Packages

This is a monorepo containing the following packages:

### Framework Integrations

- **[`@feedback-forge/payload-plugin`](./packages/payload-plugin/README.md):** Complete Payload CMS integration with admin UI, background jobs, and API endpoints.
- **[`@feedback-forge/nestjs-plugin`](./packages/nestjs-plugin/README.md):** 🆕 NestJS module for processing feedback, creating GitHub issues, and starting Jules sessions (stateless, no database required).
- **[`@feedback-forge/angular-widget`](./packages/angular-widget/README.md):** 🆕 Standalone Angular component for collecting user feedback (Angular 18+).
- **[`@feedback-forge/react-widget`](./packages/react-widget/README.md):** Customizable React component for collecting user feedback.

### Core & Integrations

- **[`@feedback-forge/core`](./packages/core/README.md):** Framework-agnostic AI processing logic using Google Genkit.
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
  template: `
    <ff-feedback-widget
      [feedbackApiUrl]="'http://localhost:3000/feedback'"
    />
  `
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
- 🤖 **AI-Powered**: Uses Google Genkit with Gemini models to transform feedback into actionable developer prompts
- 🔧 **Framework Agnostic**: Core packages work with any backend (NestJS, Payload, Express, etc.)
- 📦 **Modular**: Use only the packages you need
- 🎨 **Customizable**: Full control over UI styling and AI behavior
- 🚀 **Stateless Option**: NestJS plugin requires no database (processes feedback immediately)

## Contributing

We welcome contributions from the community! Please read our [Contributing Guide](./CONTRIBUTING.md) for more information on how to get involved.

## License

Feedback Forge is licensed under the [MIT License](./LICENSE).
