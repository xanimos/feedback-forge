# Angular/NestJS Integration Plan for Feedback Forge

## Executive Summary

This document outlines a comprehensive plan to create Angular and NestJS integrations for Feedback Forge. The integration will provide:

1. **Angular Widget Component** - Standalone Angular component for collecting feedback
2. **NestJS API Module** - Backend APIs for processing feedback, creating GitHub issues, and starting Jules sessions
3. **No Storage** - Initial integration will NOT persist feedback (stateless processing)

## Current Architecture Analysis

### Existing Packages

1. **@feedback-forge/core** - Framework-agnostic AI processing (Genkit + Google AI)
2. **@feedback-forge/integration-github** - Pure GitHub API client (Octokit)
3. **@feedback-forge/integration-jules** - Empty (Jules API calls currently in payload-plugin)
4. **@feedback-forge/react-widget** - React feedback collection component
5. **@feedback-forge/payload-plugin** - Payload CMS-specific implementation

### Key Technologies

- **AI Processing**: Google Genkit with Gemini models
- **GitHub Integration**: Octokit (REST API)
- **Jules Integration**: Direct HTTPS API calls
- **React Widget**: Vanilla React with inline styles

---

## Phase 1: Extract Jules Integration Logic

### Goal

Create a framework-agnostic Jules API client in `@feedback-forge/integration-jules`

### Tasks

#### 1.1 Create Jules API Client

**File**: `packages/integration-jules/src/createJulesSession.ts`

```typescript
interface CreateJulesSessionParams {
  title: string;
  developerPrompt: string;
  julesApiKey: string;
  julesApiUrl?: string;
  githubRepo: string;
  githubStartingBranch?: string;
}

interface JulesSession {
  id: string;
  name: string;
  state?: string;
  // Add other fields from Jules API response
}

export const createJulesSession = async ({
  title,
  developerPrompt,
  julesApiKey,
  julesApiUrl = 'https://jules.googleapis.com/v1alpha/sessions',
  githubRepo,
  githubStartingBranch = 'main',
}: CreateJulesSessionParams): Promise<JulesSession> => {
  const response = await fetch(julesApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': julesApiKey,
    },
    body: JSON.stringify({
      title,
      prompt: developerPrompt,
      sourceContext: {
        source: `sources/github/${githubRepo}`,
        githubRepoContext: {
          startingBranch: githubStartingBranch,
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Jules API Error: ${errorText}`);
  }

  return await response.json();
};
```

#### 1.2 Update integration-jules exports

**File**: `packages/integration-jules/src/index.ts`

```typescript
export * from './createJulesSession.js';
export type { CreateJulesSessionParams, JulesSession } from './createJulesSession.js';
```

#### 1.3 Refactor payload-plugin to use jules integration

Update `packages/payload-plugin/src/endpoints/startJulesSession.ts` to use `createJulesSession` from `@feedback-forge/integration-jules`

---

## Phase 2: Create Angular Widget Package

### Goal

Create `@feedback-forge/angular-widget` - Standalone Angular component for feedback collection

### Package Structure

```
packages/angular-widget/
├── src/
│   ├── lib/
│   │   ├── feedback-widget.component.ts
│   │   ├── feedback-widget.component.html
│   │   ├── feedback-widget.component.scss
│   │   └── feedback-widget.module.ts
│   ├── public-api.ts
│   └── index.ts
├── package.json
├── tsconfig.json
├── ng-package.json
└── README.md
```

### Implementation Details

#### 2.1 Create Angular Component

**File**: `packages/angular-widget/src/lib/feedback-widget.component.ts`

```typescript
import { Component, Input, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface FeedbackSubmission {
  title: string;
  feedback: string;
  breadcrumbs?: string;
  userId?: string | number;
}

export interface FeedbackWidgetStyles {
  button?: Partial<CSSStyleDeclaration>;
  formContainer?: Partial<CSSStyleDeclaration>;
  input?: Partial<CSSStyleDeclaration>;
  textarea?: Partial<CSSStyleDeclaration>;
  widgetContainer?: Partial<CSSStyleDeclaration>;
  closeButton?: Partial<CSSStyleDeclaration>;
}

@Component({
  selector: 'ff-feedback-widget',
  templateUrl: './feedback-widget.component.html',
  styleUrls: ['./feedback-widget.component.scss'],
  standalone: true,
})
export class FeedbackWidgetComponent implements OnInit {
  @Input() feedbackApiUrl!: string;
  @Input() userId?: string | number;
  @Input() defaultTitle?: string = '';
  @Input() defaultFeedback?: string = '';
  @Input() defaultBreadcrumbs?: string = '';
  @Input() customStyles?: FeedbackWidgetStyles;

  isOpen = false;
  title = '';
  feedback = '';
  breadcrumbs = '';
  isSubmitting = false;
  error: string | null = null;
  success = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.title = this.defaultTitle || '';
    this.feedback = this.defaultFeedback || '';
    this.breadcrumbs = this.defaultBreadcrumbs || '';
  }

  toggleWidget(): void {
    this.isOpen = !this.isOpen;
    if (!this.isOpen) {
      this.resetForm();
    }
  }

  submitFeedback(): void {
    if (!this.title || !this.feedback) {
      return;
    }

    this.isSubmitting = true;
    this.error = null;
    this.success = false;

    const payload: FeedbackSubmission = {
      title: this.title,
      feedback: this.feedback,
      breadcrumbs: this.breadcrumbs || 'Submitted via Angular widget',
      userId: this.userId,
    };

    this.http
      .post(this.feedbackApiUrl, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.error = error.error?.message || 'Failed to submit feedback';
          this.isSubmitting = false;
          return throwError(() => error);
        }),
      )
      .subscribe({
        next: () => {
          this.success = true;
          this.isSubmitting = false;
          this.resetForm();
          setTimeout(() => {
            this.isOpen = false;
            this.success = false;
          }, 2000);
        },
        error: () => {
          this.isSubmitting = false;
        },
      });
  }

  private resetForm(): void {
    this.title = '';
    this.feedback = '';
    this.breadcrumbs = '';
    this.error = null;
  }
}
```

#### 2.2 Create Component Template

**File**: `packages/angular-widget/src/lib/feedback-widget.component.html`

```html
<div class="feedback-widget-container" [ngStyle]="customStyles?.widgetContainer">
  <div *ngIf="isOpen" class="feedback-form-container" [ngStyle]="customStyles?.formContainer">
    <form (ngSubmit)="submitFeedback()">
      <h3>Submit Feedback</h3>

      <input
        type="text"
        [(ngModel)]="title"
        name="title"
        placeholder="Title"
        required
        [ngStyle]="customStyles?.input"
        class="feedback-input"
      />

      <textarea
        [(ngModel)]="feedback"
        name="feedback"
        placeholder="Describe your issue or idea..."
        required
        [ngStyle]="customStyles?.textarea"
        class="feedback-textarea"
      ></textarea>

      <input
        type="text"
        [(ngModel)]="breadcrumbs"
        name="breadcrumbs"
        placeholder="Breadcrumbs (optional)"
        [ngStyle]="customStyles?.input"
        class="feedback-input"
      />

      <div class="button-group">
        <button
          type="submit"
          [disabled]="isSubmitting"
          [ngStyle]="customStyles?.button"
          class="feedback-button"
        >
          {{ isSubmitting ? 'Submitting...' : 'Submit' }}
        </button>

        <button
          type="button"
          (click)="toggleWidget()"
          [ngStyle]="customStyles?.closeButton"
          class="feedback-button close-button"
        >
          Close
        </button>
      </div>

      <p *ngIf="error" class="error-message">{{ error }}</p>
      <p *ngIf="success" class="success-message">Feedback submitted successfully!</p>
    </form>
  </div>

  <button
    *ngIf="!isOpen"
    (click)="toggleWidget()"
    [ngStyle]="customStyles?.button"
    class="feedback-button toggle-button"
  >
    Feedback
  </button>
</div>
```

#### 2.3 Create Component Styles

**File**: `packages/angular-widget/src/lib/feedback-widget.component.scss`

```scss
.feedback-widget-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.feedback-form-container {
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  width: 300px;
}

.feedback-input,
.feedback-textarea {
  width: 100%;
  box-sizing: border-box;
  margin: 5px 0 10px 0;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.feedback-textarea {
  min-height: 100px;
  resize: vertical;
}

.button-group {
  display: flex;
  gap: 10px;
}

.feedback-button {
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  padding: 10px 20px;

  &:hover:not(:disabled) {
    background-color: #0056b3;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.close-button {
  background-color: #6c757d;

  &:hover {
    background-color: #545b62;
  }
}

.error-message {
  color: red;
  margin-top: 10px;
}

.success-message {
  color: green;
  margin-top: 10px;
}
```

#### 2.4 Create Module

**File**: `packages/angular-widget/src/lib/feedback-widget.module.ts`

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FeedbackWidgetComponent } from './feedback-widget.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    FeedbackWidgetComponent, // Standalone component
  ],
  exports: [FeedbackWidgetComponent],
})
export class FeedbackWidgetModule {}
```

#### 2.5 Create Public API

**File**: `packages/angular-widget/src/public-api.ts`

```typescript
export * from './lib/feedback-widget.component';
export * from './lib/feedback-widget.module';
```

#### 2.6 Create package.json

**File**: `packages/angular-widget/package.json`

```json
{
  "name": "@feedback-forge/angular-widget",
  "version": "0.1.0",
  "description": "Angular component for collecting user feedback in Feedback Forge",
  "author": "Feedback Forge",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/xanimos/feedback-forge.git",
    "directory": "packages/angular-widget"
  },
  "keywords": ["feedback-forge", "angular", "widget", "feedback", "component"],
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "ng-packagr -p ng-package.json",
    "clean": "rimraf dist"
  },
  "peerDependencies": {
    "@angular/common": "^18.0.0 || ^19.0.0",
    "@angular/core": "^18.0.0 || ^19.0.0",
    "@angular/forms": "^18.0.0 || ^19.0.0"
  },
  "devDependencies": {
    "@angular/common": "^19.0.0",
    "@angular/compiler": "^19.0.0",
    "@angular/compiler-cli": "^19.0.0",
    "@angular/core": "^19.0.0",
    "@angular/forms": "^19.0.0",
    "ng-packagr": "^18.0.0",
    "rimraf": "^6.1.0",
    "typescript": "~5.7.3"
  }
}
```

---

## Phase 3: Create NestJS API Package

### Goal

Create `@feedback-forge/nestjs-plugin` - NestJS module for processing feedback without storage

### Package Structure

```
packages/nestjs-plugin/
├── src/
│   ├── controllers/
│   │   └── feedback.controller.ts
│   ├── services/
│   │   └── feedback.service.ts
│   ├── dto/
│   │   ├── submit-feedback.dto.ts
│   │   ├── create-github-issue.dto.ts
│   │   └── start-jules-session.dto.ts
│   ├── interfaces/
│   │   └── feedback-forge-config.interface.ts
│   ├── feedback-forge.module.ts
│   └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

### Implementation Details

#### 3.1 Create Configuration Interface

**File**: `packages/nestjs-plugin/src/interfaces/feedback-forge-config.interface.ts`

```typescript
export interface NestJSFeedbackForgeConfig {
  /**
   * Genkit AI configuration for processing feedback
   */
  ai: {
    model: string;
    apiKey: string;
    systemPrompt?: string;
    temperature?: number;
  };

  /**
   * GitHub integration configuration (optional)
   */
  github?: {
    owner: string;
    repo: string;
    token: string;
  };

  /**
   * Jules integration configuration (optional)
   */
  jules?: {
    apiKey: string;
    apiUrl?: string;
    githubRepo: string;
    githubStartingBranch?: string;
  };

  /**
   * API route prefix
   * @default 'feedback'
   */
  routePrefix?: string;

  /**
   * Enable/disable automatic GitHub issue creation after AI processing
   * @default false
   */
  autoCreateGithubIssue?: boolean;

  /**
   * Custom system prompt for AI processing
   */
  feedbackSystemPrompt?: string;
}
```

#### 3.2 Create DTOs

**File**: `packages/nestjs-plugin/src/dto/submit-feedback.dto.ts`

```typescript
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class SubmitFeedbackDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  feedback: string;

  @IsString()
  @IsOptional()
  breadcrumbs?: string;

  @IsOptional()
  userId?: string | number;
}
```

**File**: `packages/nestjs-plugin/src/dto/create-github-issue.dto.ts`

```typescript
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateGithubIssueDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;
}
```

**File**: `packages/nestjs-plugin/src/dto/start-jules-session.dto.ts`

```typescript
import { IsString, IsNotEmpty } from 'class-validator';

export class StartJulesSessionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  developerPrompt: string;
}
```

#### 3.3 Create Feedback Service

**File**: `packages/nestjs-plugin/src/services/feedback.service.ts`

```typescript
import { Injectable, Inject, Logger } from '@nestjs/common';
import { getFeedbackProcessor } from '@feedback-forge/core';
import { createIssue } from '@feedback-forge/integration-github';
import { createJulesSession } from '@feedback-forge/integration-jules';
import type { NestJSFeedbackForgeConfig } from '../interfaces/feedback-forge-config.interface';

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(
    @Inject('FEEDBACK_FORGE_CONFIG')
    private readonly config: NestJSFeedbackForgeConfig,
  ) {}

  /**
   * Process feedback using AI to generate developer prompt
   */
  async processFeedback(
    title: string,
    feedback: string,
    breadcrumbs?: string,
  ): Promise<{ developerPrompt: string }> {
    this.logger.log('Processing feedback with AI');

    const feedbackProcessor = getFeedbackProcessor({
      ai: this.config.ai,
      feedbackSystemPrompt: this.config.feedbackSystemPrompt,
    });

    const result = await feedbackProcessor({
      feedback,
      breadcrumbs: breadcrumbs || 'Submitted via NestJS API',
    });

    return { developerPrompt: result.developerPrompt };
  }

  /**
   * Create GitHub issue
   */
  async createGithubIssue(title: string, body: string): Promise<any> {
    if (!this.config.github) {
      throw new Error('GitHub integration not configured');
    }

    this.logger.log(`Creating GitHub issue: ${title}`);

    return await createIssue({
      title,
      body,
      owner: this.config.github.owner,
      repo: this.config.github.repo,
      token: this.config.github.token,
    });
  }

  /**
   * Start Jules coding session
   */
  async startJulesSession(title: string, developerPrompt: string): Promise<any> {
    if (!this.config.jules) {
      throw new Error('Jules integration not configured');
    }

    this.logger.log(`Starting Jules session: ${title}`);

    return await createJulesSession({
      title,
      developerPrompt,
      julesApiKey: this.config.jules.apiKey,
      julesApiUrl: this.config.jules.apiUrl,
      githubRepo: this.config.jules.githubRepo,
      githubStartingBranch: this.config.jules.githubStartingBranch,
    });
  }

  /**
   * Complete flow: Process feedback and optionally create GitHub issue
   */
  async processFeedbackComplete(
    title: string,
    feedback: string,
    breadcrumbs?: string,
  ): Promise<{
    developerPrompt: string;
    githubIssue?: any;
  }> {
    // Process with AI
    const { developerPrompt } = await this.processFeedback(title, feedback, breadcrumbs);

    // Optionally create GitHub issue
    let githubIssue;
    if (this.config.autoCreateGithubIssue && this.config.github) {
      try {
        githubIssue = await this.createGithubIssue(title, developerPrompt);
      } catch (error) {
        this.logger.error(`Failed to create GitHub issue: ${error.message}`);
      }
    }

    return { developerPrompt, githubIssue };
  }
}
```

#### 3.4 Create Feedback Controller

**File**: `packages/nestjs-plugin/src/controllers/feedback.controller.ts`

```typescript
import { Controller, Post, Body, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { FeedbackService } from '../services/feedback.service';
import { SubmitFeedbackDto } from '../dto/submit-feedback.dto';
import { CreateGithubIssueDto } from '../dto/create-github-issue.dto';
import { StartJulesSessionDto } from '../dto/start-jules-session.dto';

@Controller('feedback')
export class FeedbackController {
  private readonly logger = new Logger(FeedbackController.name);

  constructor(private readonly feedbackService: FeedbackService) {}

  /**
   * Submit feedback and process with AI
   * POST /feedback
   */
  @Post()
  async submitFeedback(@Body() dto: SubmitFeedbackDto) {
    try {
      const result = await this.feedbackService.processFeedbackComplete(
        dto.title,
        dto.feedback,
        dto.breadcrumbs,
      );

      return {
        message: 'Feedback processed successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error(`Error processing feedback: ${error.message}`);
      throw new HttpException('Failed to process feedback', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Create GitHub issue
   * POST /feedback/github-issue
   */
  @Post('github-issue')
  async createGithubIssue(@Body() dto: CreateGithubIssueDto) {
    try {
      const issue = await this.feedbackService.createGithubIssue(dto.title, dto.body);

      return {
        message: 'GitHub issue created successfully',
        data: issue,
      };
    } catch (error) {
      this.logger.error(`Error creating GitHub issue: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Start Jules session
   * POST /feedback/jules-session
   */
  @Post('jules-session')
  async startJulesSession(@Body() dto: StartJulesSessionDto) {
    try {
      const session = await this.feedbackService.startJulesSession(dto.title, dto.developerPrompt);

      return {
        message: 'Jules session started successfully',
        data: session,
      };
    } catch (error) {
      this.logger.error(`Error starting Jules session: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
```

#### 3.5 Create Dynamic Module

**File**: `packages/nestjs-plugin/src/feedback-forge.module.ts`

```typescript
import { DynamicModule, Module } from '@nestjs/common';
import { FeedbackController } from './controllers/feedback.controller';
import { FeedbackService } from './services/feedback.service';
import type { NestJSFeedbackForgeConfig } from './interfaces/feedback-forge-config.interface';

@Module({})
export class FeedbackForgeModule {
  static forRoot(config: NestJSFeedbackForgeConfig): DynamicModule {
    return {
      module: FeedbackForgeModule,
      controllers: [FeedbackController],
      providers: [
        {
          provide: 'FEEDBACK_FORGE_CONFIG',
          useValue: config,
        },
        FeedbackService,
      ],
      exports: [FeedbackService],
      global: false,
    };
  }

  static forRootAsync(options: {
    useFactory: (...args: any[]) => Promise<NestJSFeedbackForgeConfig> | NestJSFeedbackForgeConfig;
    inject?: any[];
  }): DynamicModule {
    return {
      module: FeedbackForgeModule,
      controllers: [FeedbackController],
      providers: [
        {
          provide: 'FEEDBACK_FORGE_CONFIG',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        FeedbackService,
      ],
      exports: [FeedbackService],
      global: false,
    };
  }
}
```

#### 3.6 Create Index Exports

**File**: `packages/nestjs-plugin/src/index.ts`

```typescript
export * from './feedback-forge.module';
export * from './services/feedback.service';
export * from './controllers/feedback.controller';
export * from './dto/submit-feedback.dto';
export * from './dto/create-github-issue.dto';
export * from './dto/start-jules-session.dto';
export * from './interfaces/feedback-forge-config.interface';
```

#### 3.7 Create package.json

**File**: `packages/nestjs-plugin/package.json`

```json
{
  "name": "@feedback-forge/nestjs-plugin",
  "version": "0.1.0",
  "description": "NestJS plugin for Feedback Forge - process feedback, create GitHub issues, and start Jules sessions",
  "author": "Feedback Forge",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/xanimos/feedback-forge.git",
    "directory": "packages/nestjs-plugin"
  },
  "keywords": ["feedback-forge", "nestjs", "api", "feedback", "plugin"],
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "rimraf dist && tsc",
    "clean": "rimraf dist"
  },
  "dependencies": {
    "@feedback-forge/core": "workspace:*",
    "@feedback-forge/integration-github": "workspace:*",
    "@feedback-forge/integration-jules": "workspace:*"
  },
  "peerDependencies": {
    "@nestjs/common": "^10.0.0 || ^11.0.0",
    "@nestjs/core": "^10.0.0 || ^11.0.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.0",
    "reflect-metadata": "^0.1.13 || ^0.2.0",
    "rxjs": "^7.0.0"
  },
  "devDependencies": {
    "@nestjs/common": "^11.0.0",
    "@nestjs/core": "^11.0.0",
    "@types/node": "^22.0.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.0",
    "rimraf": "^6.1.0",
    "typescript": "~5.7.3"
  }
}
```

---

## Phase 4: Usage Examples

### Angular Usage

```typescript
// app.module.ts or standalone component
import { Component } from '@angular/core';
import { FeedbackWidgetComponent } from '@feedback-forge/angular-widget';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FeedbackWidgetComponent, HttpClientModule],
  template: `
    <ff-feedback-widget
      [feedbackApiUrl]="'http://localhost:3000/api/feedback'"
      [userId]="currentUserId"
    />
  `,
})
export class AppComponent {
  currentUserId = 'user-123';
}
```

### NestJS Usage

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
          model: 'gemini-2.5-flash',
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
          githubRepo: 'your-org/your-repo',
          githubStartingBranch: 'main',
        },
        autoCreateGithubIssue: false, // Set to true to auto-create issues
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

---

## Phase 5: Implementation Roadmap

### Step 1: Extract Jules Integration (1-2 hours)

- [ ] Create `createJulesSession` function in integration-jules
- [ ] Update integration-jules exports
- [ ] Refactor payload-plugin to use new jules client
- [ ] Test jules integration still works in payload-plugin

### Step 2: Create Angular Widget (4-6 hours)

- [ ] Set up angular-widget package structure
- [ ] Create FeedbackWidgetComponent
- [ ] Create component template and styles
- [ ] Create module and public API
- [ ] Build and test component
- [ ] Create demo Angular app for testing

### Step 3: Create NestJS Plugin (4-6 hours)

- [ ] Set up nestjs-plugin package structure
- [ ] Create configuration interface
- [ ] Create DTOs
- [ ] Create FeedbackService
- [ ] Create FeedbackController
- [ ] Create FeedbackForgeModule
- [ ] Build and test module
- [ ] Create demo NestJS app for testing

### Step 4: Integration Testing (2-3 hours)

- [ ] Test Angular widget → NestJS API flow
- [ ] Test AI processing pipeline
- [ ] Test GitHub issue creation
- [ ] Test Jules session creation
- [ ] Test error handling

### Step 5: Documentation (2-3 hours)

- [ ] Create README for angular-widget
- [ ] Create README for nestjs-plugin
- [ ] Update main project README
- [ ] Create usage examples
- [ ] Document configuration options

**Total Estimated Time: 13-20 hours**

---

## Key Design Decisions

### 1. **No Storage in Initial Integration**

- Feedback is processed immediately (stateless)
- Developer prompt generated via AI
- GitHub issue/Jules session created directly
- No persistence layer required

### 2. **Standalone Packages**

- Angular widget is framework-specific but reusable
- NestJS plugin is framework-specific but reusable
- Core/integration packages remain framework-agnostic

### 3. **API Flow (Stateless)**

```
User → Angular Widget → POST /api/feedback
↓
NestJS Controller receives feedback
↓
FeedbackService processes with AI (Genkit)
↓
Generate developer prompt
↓
[Optional] Auto-create GitHub issue
↓
Return response to Angular widget
```

### 4. **Manual Jules/GitHub Triggers**

- User can call separate endpoints to create GitHub issues
- User can call separate endpoints to start Jules sessions
- Provides flexibility for custom workflows

### 5. **Configuration Strategy**

- Environment variables for API keys
- Config service injection for NestJS
- Input properties for Angular widget

---

## Benefits of This Approach

1. **Framework Agnostic Core**: AI processing logic stays in `@feedback-forge/core`
2. **Reusable Integration Packages**: GitHub and Jules clients work with any framework
3. **Flexible Architecture**: Can add storage later without breaking changes
4. **Independent Deployments**: Angular and NestJS packages can be used separately
5. **Type Safety**: Full TypeScript support across all packages
6. **Scalable**: Easy to add new features (e.g., storage, webhooks, notifications)

---

## Future Enhancements (Post-Initial Release)

1. **Add Optional Storage Layer**
   - Create `@feedback-forge/storage` package
   - Support multiple backends (PostgreSQL, MongoDB, etc.)
   - Add feedback history/status tracking

2. **Add Webhook Support**
   - Notify external services when feedback is processed
   - Track GitHub issue updates
   - Monitor Jules session progress

3. **Add Analytics Dashboard**
   - Create Angular admin dashboard
   - View feedback trends
   - Track GitHub issue resolution

4. **Add Authentication/Authorization**
   - Integrate with NestJS guards
   - Protect endpoints
   - Track user feedback history

---

## Testing Strategy

### Unit Tests

- Test FeedbackService in isolation
- Mock Genkit AI calls
- Mock GitHub/Jules API calls
- Test DTOs validation

### Integration Tests

- Test complete flow: widget → API → AI → GitHub
- Test error scenarios
- Test configuration options
- Test custom styling

### E2E Tests

- Deploy demo Angular + NestJS apps
- Test real API calls (with test credentials)
- Verify GitHub issues are created
- Verify Jules sessions start correctly

---

## Conclusion

This plan provides a comprehensive roadmap for integrating Feedback Forge with Angular and NestJS. The architecture maintains framework-agnostic core packages while providing framework-specific implementations that are easy to use and maintain. The stateless initial approach allows for rapid deployment without requiring a database, while the modular design makes it easy to add storage and other features in the future.
