# @feedback-forge/angular-widget

Angular component for collecting user feedback in Feedback Forge applications.

## Features

- Standalone Angular component compatible with Angular 18+
- Customizable styles via `@Input()` properties
- Built-in form validation
- HTTP-based API communication
- TypeScript support with full type definitions
- Responsive design with fixed positioning

## Installation

```bash
npm install @feedback-forge/angular-widget
```

Or with pnpm:

```bash
pnpm add @feedback-forge/angular-widget
```

## Usage

### Standalone Component (Angular 18+)

```typescript
import { Component } from '@angular/core';
import { FeedbackWidgetComponent } from '@feedback-forge/angular-widget';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FeedbackWidgetComponent, HttpClientModule],
  template: `
    <div>
      <h1>My Application</h1>
      <ff-feedback-widget
        [feedbackApiUrl]="'http://localhost:3000/api/feedback'"
        [userId]="currentUserId"
      />
    </div>
  `,
})
export class AppComponent {
  currentUserId = 'user-123';
}
```

### Module-Based Component

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FeedbackWidgetModule } from '@feedback-forge/angular-widget';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HttpClientModule, FeedbackWidgetModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

```typescript
// app.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div>
      <h1>My Application</h1>
      <ff-feedback-widget
        [feedbackApiUrl]="'http://localhost:3000/api/feedback'"
        [userId]="currentUserId"
      />
    </div>
  `,
})
export class AppComponent {
  currentUserId = 'user-123';
}
```

## Props

| Prop                 | Type                          | Required | Default     | Description                                                                          |
| -------------------- | ----------------------------- | -------- | ----------- | ------------------------------------------------------------------------------------ |
| `feedbackApiUrl`     | `string`                      | No\*     | -           | The API endpoint to submit feedback to (required if `submitHandler` not provided)    |
| `submitHandler`      | `FeedbackSubmissionHandler`   | No\*     | -           | Custom submission handler function (required if `feedbackApiUrl` not provided)       |
| `userId`             | `string \| number`            | No       | `undefined` | Optional user identifier to associate with feedback                                  |
| `defaultTitle`       | `string`                      | No       | `''`        | Default value for the title field                                                    |
| `defaultFeedback`    | `string`                      | No       | `''`        | Default value for the feedback textarea                                              |
| `defaultBreadcrumbs` | `string`                      | No       | `''`        | Default value for the breadcrumbs field                                              |
| `customStyles`       | `FeedbackWidgetStyles`        | No       | `undefined` | Custom styles to override default appearance                                         |

\* Either `feedbackApiUrl` or `submitHandler` must be provided.

## Custom Styling

You can customize the appearance of the widget using the `customStyles` prop:

```typescript
import { Component } from '@angular/core';
import { FeedbackWidgetComponent, FeedbackWidgetStyles } from '@feedback-forge/angular-widget';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FeedbackWidgetComponent],
  template: `
    <ff-feedback-widget
      [feedbackApiUrl]="'http://localhost:3000/api/feedback'"
      [customStyles]="customStyles"
    />
  `,
})
export class AppComponent {
  customStyles: FeedbackWidgetStyles = {
    button: {
      backgroundColor: '#28a745',
      borderRadius: '8px',
    },
    formContainer: {
      width: '400px',
      padding: '30px',
    },
    input: {
      borderColor: '#28a745',
    },
    textarea: {
      borderColor: '#28a745',
      minHeight: '150px',
    },
  };
}
```

### Available Style Properties

The `FeedbackWidgetStyles` interface accepts the following properties:

- `button`: Styles for the submit and toggle buttons
- `closeButton`: Styles for the close button
- `formContainer`: Styles for the form container
- `input`: Styles for input fields
- `textarea`: Styles for the feedback textarea
- `widgetContainer`: Styles for the outer widget container

Each property accepts a `Partial<CSSStyleDeclaration>`, giving you full control over CSS properties.

## Custom Submission Handler

For applications that need to use a custom HTTP client (e.g., a wrapper around HttpClient with authentication, interceptors, or specific headers), you can provide a custom submission handler using the `submitHandler` prop:

### Basic Example with Custom HTTP Service

```typescript
import { Component, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  FeedbackWidgetComponent,
  FeedbackSubmission,
} from '@feedback-forge/angular-widget';

// Your custom HTTP service
@Injectable({ providedIn: 'root' })
export class MyCustomHttpService {
  constructor(private http: HttpClient) {}

  submitFeedback(payload: FeedbackSubmission): Observable<any> {
    // Add custom headers, authentication, etc.
    return this.http.post('/api/feedback', payload, {
      headers: {
        'X-Custom-Header': 'value',
        Authorization: `Bearer ${this.getToken()}`,
      },
    });
  }

  private getToken(): string {
    // Your token retrieval logic
    return 'your-auth-token';
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FeedbackWidgetComponent],
  template: `
    <ff-feedback-widget
      [submitHandler]="handleSubmit"
      [userId]="currentUserId"
    />
  `,
})
export class AppComponent {
  currentUserId = 'user-123';

  constructor(private customHttp: MyCustomHttpService) {}

  // Bind the custom submission handler
  handleSubmit = (payload: FeedbackSubmission) => {
    return this.customHttp.submitFeedback(payload);
  };
}
```

### Example with Request Wrapper

If you have a request wrapper service that handles authentication, retries, and error handling:

```typescript
import { Component, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  FeedbackWidgetComponent,
  FeedbackSubmission,
} from '@feedback-forge/angular-widget';

// Your request wrapper service
@Injectable({ providedIn: 'root' })
export class ApiRequestService {
  post<T>(endpoint: string, data: any): Observable<T> {
    // Your custom request logic with authentication, retries, etc.
    // This is just an example structure
    return new Observable((observer) => {
      // Your implementation here
      observer.next({} as T);
      observer.complete();
    });
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FeedbackWidgetComponent],
  template: `
    <ff-feedback-widget [submitHandler]="customSubmitHandler" />
  `,
})
export class AppComponent {
  constructor(private apiService: ApiRequestService) {}

  customSubmitHandler = (payload: FeedbackSubmission) => {
    return this.apiService.post('/feedback', payload);
  };
}
```

### Handler Type Definition

```typescript
export type FeedbackSubmissionHandler = (
  payload: FeedbackSubmission,
) => Observable<any>;
```

The handler must:
- Accept a `FeedbackSubmission` object as the parameter
- Return an `Observable` that completes on success
- Throw/error on failure (the widget will catch errors and display them)

## API Contract

The widget expects the API endpoint to accept POST requests with the following JSON payload:

```typescript
interface FeedbackSubmission {
  title: string;
  feedback: string;
  breadcrumbs?: string;
  userId?: string | number;
}
```

Example API response on success:

```json
{
  "message": "Feedback submitted successfully",
  "data": {
    "id": "feedback-123",
    "status": "received"
  }
}
```

Example API response on error:

```json
{
  "message": "Validation error: title is required",
  "statusCode": 400
}
```

## Integration with NestJS

This widget is designed to work seamlessly with the `@feedback-forge/nestjs-plugin` package:

```typescript
// Backend (NestJS)
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

```typescript
// Frontend (Angular)
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

## TypeScript Support

The package includes full TypeScript definitions:

```typescript
import {
  FeedbackWidgetComponent,
  FeedbackSubmission,
  FeedbackWidgetStyles,
} from '@feedback-forge/angular-widget';

// Type-safe props
const styles: FeedbackWidgetStyles = {
  button: {
    backgroundColor: '#007bff',
    padding: '12px 24px',
  },
};

// Type-safe submission data
const submission: FeedbackSubmission = {
  title: 'Bug Report',
  feedback: 'The login button is not working',
  breadcrumbs: 'Home > Login',
  userId: 'user-123',
};
```

## Development

### Build the library

```bash
pnpm build
```

### Clean build artifacts

```bash
pnpm clean
```

## Requirements

- Angular 18.0.0 or higher
- `@angular/common`
- `@angular/core`
- `@angular/forms`
- HttpClient module for API communication

## License

MIT

## Related Packages

- [@feedback-forge/nestjs-plugin](../nestjs-plugin) - NestJS backend integration
- [@feedback-forge/core](../core) - Core AI processing logic
- [@feedback-forge/react-widget](../react-widget) - React version of this widget
- [@feedback-forge/payload-plugin](../payload-plugin) - Payload CMS integration

## Support

For issues, questions, or contributions, please visit the [GitHub repository](https://github.com/xanimos/feedback-forge).
