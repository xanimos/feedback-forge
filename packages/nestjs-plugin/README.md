# @feedback-forge/nestjs-plugin

NestJS plugin for Feedback Forge - process feedback with AI, create GitHub issues, and start Jules coding sessions.

## Features

- Process user feedback using Google's Genkit AI
- Transform feedback into actionable developer prompts
- Create GitHub issues automatically or on-demand
- Start Jules AI coding sessions with context
- Full TypeScript support with decorators and dependency injection
- Flexible configuration with static and async options
- Built-in validation with class-validator
- Comprehensive error handling and logging

## Installation

```bash
npm install @feedback-forge/nestjs-plugin
# or
pnpm add @feedback-forge/nestjs-plugin
# or
yarn add @feedback-forge/nestjs-plugin
```

## Quick Start

### 1. Static Configuration

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { FeedbackForgeModule } from '@feedback-forge/nestjs-plugin';

@Module({
  imports: [
    FeedbackForgeModule.forRoot({
      ai: {
        model: 'gemini-2.5-flash',
        apiKey: process.env.GOOGLE_AI_API_KEY,
        temperature: 0.8,
      },
      github: {
        owner: 'your-org',
        repo: 'your-repo',
        token: process.env.GITHUB_TOKEN,
      },
      jules: {
        apiKey: process.env.JULES_API_KEY,
        githubRepo: 'your-org/your-repo',
        githubStartingBranch: 'main',
      },
      autoCreateGithubIssue: false,
    }),
  ],
})
export class AppModule {}
```

### 2. Async Configuration (Recommended)

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FeedbackForgeModule } from '@feedback-forge/nestjs-plugin';

@Module({
  imports: [
    ConfigModule.forRoot(),
    FeedbackForgeModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        ai: {
          model: configService.get('GENKIT_MODEL', 'gemini-2.5-flash'),
          apiKey: configService.get('GOOGLE_AI_API_KEY'),
          temperature: 0.8,
        },
        github: {
          owner: configService.get('GITHUB_OWNER'),
          repo: configService.get('GITHUB_REPO'),
          token: configService.get('GITHUB_TOKEN'),
        },
        jules: {
          apiKey: configService.get('JULES_API_KEY'),
          githubRepo: configService.get('JULES_GITHUB_REPO'),
          githubStartingBranch: configService.get('JULES_GITHUB_BRANCH', 'main'),
        },
        autoCreateGithubIssue: configService.get('AUTO_CREATE_GITHUB_ISSUE') === 'true',
        feedbackSystemPrompt: configService.get('FEEDBACK_SYSTEM_PROMPT'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

## API Endpoints

The plugin automatically registers the following endpoints:

### POST /feedback

Submit feedback for AI processing.

**Request Body:**

```typescript
{
  title: string;
  feedback: string;
  breadcrumbs?: string;
  userId?: string | number;
}
```

**Response:**

```typescript
{
  message: 'Feedback processed successfully',
  data: {
    developerPrompt: string;
    githubIssue?: {
      id: number;
      html_url: string;
      // ... other GitHub issue fields
    }
  }
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Login button not working",
    "feedback": "When I click the login button, nothing happens. Console shows a 404 error.",
    "breadcrumbs": "HomePage > LoginForm",
    "userId": "user-123"
  }'
```

### POST /feedback/github-issue

Create a GitHub issue directly.

**Request Body:**

```typescript
{
  title: string;
  body: string;
}
```

**Response:**

```typescript
{
  message: 'GitHub issue created successfully',
  data: {
    id: number;
    html_url: string;
    number: number;
    title: string;
    state: string;
    // ... other GitHub issue fields
  }
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/feedback/github-issue \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Fix login button",
    "body": "The login button is not responding to clicks..."
  }'
```

### POST /feedback/jules-session

Start a Jules AI coding session.

**Request Body:**

```typescript
{
  title: string;
  developerPrompt: string;
}
```

**Response:**

```typescript
{
  message: 'Jules session started successfully',
  data: {
    id: string;
    name: string;
    state: string;
    // ... other Jules session fields
  }
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/feedback/jules-session \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Fix login button issue",
    "developerPrompt": "Investigate and fix the login button that is not responding to clicks..."
  }'
```

## Configuration Options

### NestJSFeedbackForgeConfig

| Property                     | Type      | Required | Description                                                            |
| ---------------------------- | --------- | -------- | ---------------------------------------------------------------------- |
| `ai`                         | `object`  | Yes      | Genkit AI configuration                                                |
| `ai.model`                   | `string`  | Yes      | Genkit model name (e.g., 'gemini-2.5-flash')                           |
| `ai.apiKey`                  | `string`  | Yes      | Google AI API key                                                      |
| `ai.systemPrompt`            | `string`  | No       | Custom system prompt for AI                                            |
| `ai.temperature`             | `number`  | No       | AI temperature (0-1)                                                   |
| `github`                     | `object`  | No       | GitHub integration configuration                                       |
| `github.owner`               | `string`  | Yes\*    | GitHub repository owner                                                |
| `github.repo`                | `string`  | Yes\*    | GitHub repository name                                                 |
| `github.token`               | `string`  | Yes\*    | GitHub personal access token                                           |
| `jules`                      | `object`  | No       | Jules integration configuration                                        |
| `jules.apiKey`               | `string`  | Yes\*    | Jules API key                                                          |
| `jules.apiUrl`               | `string`  | No       | Jules API URL (default: https://jules.googleapis.com/v1alpha/sessions) |
| `jules.githubRepo`           | `string`  | Yes\*    | GitHub repo for Jules (format: owner/repo)                             |
| `jules.githubStartingBranch` | `string`  | No       | Starting branch for Jules (default: 'main')                            |
| `routePrefix`                | `string`  | No       | API route prefix (default: 'feedback')                                 |
| `autoCreateGithubIssue`      | `boolean` | No       | Auto-create GitHub issues (default: false)                             |
| `feedbackSystemPrompt`       | `string`  | No       | Custom system prompt for feedback processing                           |

\* Required if the parent object is provided

## Using the FeedbackService

You can inject the `FeedbackService` into your own controllers or services:

```typescript
import { Injectable } from '@nestjs/common';
import { FeedbackService } from '@feedback-forge/nestjs-plugin';

@Injectable()
export class MyService {
  constructor(private readonly feedbackService: FeedbackService) {}

  async handleFeedback() {
    // Process feedback with AI
    const result = await this.feedbackService.processFeedback(
      'Bug: Login not working',
      'Detailed description of the issue...',
      'HomePage > LoginForm',
    );

    console.log('Developer prompt:', result.developerPrompt);

    // Create GitHub issue
    if (result.developerPrompt) {
      const issue = await this.feedbackService.createGithubIssue(
        'Bug: Login not working',
        result.developerPrompt,
      );
      console.log('GitHub issue:', issue.html_url);
    }

    // Start Jules session
    const session = await this.feedbackService.startJulesSession(
      'Bug: Login not working',
      result.developerPrompt,
    );
    console.log('Jules session:', session.id);
  }
}
```

## Environment Variables

Create a `.env` file in your NestJS project:

```env
# Required - Google AI API Key for Genkit
GOOGLE_AI_API_KEY=your-google-ai-api-key

# Optional - Genkit model (default: gemini-2.5-flash)
GENKIT_MODEL=gemini-2.5-flash

# Optional - GitHub Integration
GITHUB_OWNER=your-org
GITHUB_REPO=your-repo
GITHUB_TOKEN=your-github-token

# Optional - Jules Integration
JULES_API_KEY=your-jules-api-key
JULES_GITHUB_REPO=your-org/your-repo
JULES_GITHUB_BRANCH=main

# Optional - Auto-create GitHub issues
AUTO_CREATE_GITHUB_ISSUE=false

# Optional - Custom system prompt
FEEDBACK_SYSTEM_PROMPT="You are an expert developer..."
```

## Custom System Prompt

You can customize the AI system prompt to match your team's needs:

```typescript
FeedbackForgeModule.forRoot({
  ai: {
    model: 'gemini-2.5-flash',
    apiKey: process.env.GOOGLE_AI_API_KEY,
  },
  feedbackSystemPrompt: `
    You are an expert software engineer analyzing user feedback.

    Your task:
    1. Identify the core issue or feature request
    2. Suggest concrete implementation steps
    3. Consider edge cases and testing requirements
    4. Format output as actionable developer tasks

    Be specific, technical, and actionable.
  `,
});
```

## Error Handling

The plugin includes comprehensive error handling:

```typescript
try {
  const result = await feedbackService.processFeedback(title, feedback);
} catch (error) {
  if (error.message === 'GitHub integration not configured') {
    // Handle missing GitHub config
  } else if (error.message === 'Jules integration not configured') {
    // Handle missing Jules config
  } else {
    // Handle other errors
  }
}
```

## Integration with Angular Widget

This plugin works seamlessly with the `@feedback-forge/angular-widget`:

```typescript
// Angular Component
import { Component } from '@angular/core';
import { FeedbackWidgetComponent } from '@feedback-forge/angular-widget';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FeedbackWidgetComponent],
  template: `
    <ff-feedback-widget
      [feedbackApiUrl]="'http://localhost:3000/feedback'"
      [userId]="currentUserId"
    />
  `,
})
export class AppComponent {
  currentUserId = 'user-123';
}
```

## Architecture

The plugin follows NestJS best practices:

- **Dynamic Module Pattern**: Supports both `forRoot()` and `forRootAsync()` configuration
- **Dependency Injection**: All services use NestJS DI container
- **DTOs with Validation**: Request validation using `class-validator`
- **Logger Integration**: Built-in logging with NestJS Logger
- **Framework-Agnostic Core**: Uses `@feedback-forge/core` for AI processing
- **Modular Integrations**: GitHub and Jules integrations are separate, optional packages

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import type {
  NestJSFeedbackForgeConfig,
  SubmitFeedbackDto,
  CreateGithubIssueDto,
  StartJulesSessionDto,
} from '@feedback-forge/nestjs-plugin';
```

## Testing

Mock the `FeedbackService` in your tests:

```typescript
import { Test } from '@nestjs/testing';
import { FeedbackService } from '@feedback-forge/nestjs-plugin';

describe('MyController', () => {
  let service: FeedbackService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: FeedbackService,
          useValue: {
            processFeedback: jest.fn(),
            createGithubIssue: jest.fn(),
            startJulesSession: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FeedbackService>(FeedbackService);
  });

  it('should process feedback', async () => {
    jest.spyOn(service, 'processFeedback').mockResolvedValue({
      developerPrompt: 'Test prompt',
    });

    const result = await service.processFeedback('Test', 'Feedback');
    expect(result.developerPrompt).toBe('Test prompt');
  });
});
```

## Security Considerations

1. **API Keys**: Never commit API keys to version control. Use environment variables.
2. **Authentication**: Add NestJS guards to protect endpoints:

```typescript
import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('feedback')
@UseGuards(AuthGuard('jwt'))
export class FeedbackController {
  // Your endpoints here
}
```

3. **Rate Limiting**: Consider adding rate limiting to prevent abuse:

```typescript
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
  ],
})
export class AppModule {}
```

## Troubleshooting

### Issue: "GitHub integration not configured"

**Solution**: Ensure `github` config is provided in `forRoot()` or `forRootAsync()`

### Issue: "Jules integration not configured"

**Solution**: Ensure `jules` config is provided in `forRoot()` or `forRootAsync()`

### Issue: "GOOGLE_AI_API_KEY is undefined"

**Solution**: Set the environment variable or pass it directly in the config

### Issue: Module not found errors

**Solution**: Ensure all peer dependencies are installed:

```bash
npm install @nestjs/common @nestjs/core class-validator class-transformer reflect-metadata rxjs
```

## License

MIT

## Support

For issues and questions, please visit:

- GitHub Issues: https://github.com/xanimos/feedback-forge/issues
- Documentation: https://github.com/xanimos/feedback-forge

## Related Packages

- `@feedback-forge/core` - Framework-agnostic AI processing
- `@feedback-forge/angular-widget` - Angular feedback widget
- `@feedback-forge/integration-github` - GitHub API client
- `@feedback-forge/integration-jules` - Jules API client
- `@feedback-forge/payload-plugin` - Payload CMS plugin
