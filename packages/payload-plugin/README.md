# @feedback-forge/payload-plugin

This is the primary plugin for integrating the Feedback Forge toolkit into a [Payload CMS](https://payloadcms.com) application. It sets up the "Feedback" collection, configures API endpoints, and manages the feedback processing jobs.

## Installation

```bash
npm install @feedback-forge/payload-plugin
# or
pnpm install @feedback-forge/payload-plugin
# or
yarn add @feedback-forge/payload-plugin
```

## Configuration

Add the plugin to your `payload.config.ts`:

```typescript
import { buildConfig } from 'payload';
import { payloadFeedbackForge } from '@feedback-forge/payload-plugin';
// ... other imports

export default buildConfig({
  // ... your config
  plugins: [
    payloadFeedbackForge({
      // Plugin options go here
      access: {
        // Payload access control for the Feedback collection
        create: () => true,
        read: () => true,
        update: ({ req: { user } }) => user?.role === 'admin',
        delete: ({ req: { user } }) => user?.role === 'admin',
      },
      allowAnonymousSubmissions: true,
      cron: '*/5 * * * *', // Optional: cron schedule to process feedback
    }),
  ],
  // ... rest of your config
});
```

## Plugin Options

| Option                      | Type      | Default     | Description                                                                                                                      |
| --------------------------- | --------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `access`                    | `object`  | `isAdmin`   | Payload [Access Control](https://payloadcms.com/docs/access-control/overview) functions for the `feedback` collection.           |
| `allowAnonymousSubmissions` | `boolean` | `true`      | If `true`, allows feedback submissions from unauthenticated users via the API endpoint.                                          |
| `cron`                      | `string`  | `undefined` | A cron string (e.g., `'*/5 * * * *'`) to schedule the feedback processing job. If undefined, the job must be triggered manually. |
| `disabled`                  | `boolean` | `false`     | Disables the plugin's functionality (endpoints, jobs) while keeping the collection in the schema.                                |

## Features

This plugin automatically adds the following to your Payload project:

- **`feedback` Collection**: A new collection to store all user feedback submissions.
- **`feedback-settings` Global**: A global singleton in your admin panel to configure integrations and AI settings.
- **`/api/feedback` Endpoint**: A public API endpoint for submitting feedback, typically used by the [`@feedback-forge/react-widget`](../react-widget/README.md).
- **Feedback Processing Job**: A background job that uses AI to process new feedback, generate a developer prompt, and create issues in external services.

## Integrations Setup

All integrations and AI settings are configured from the **Feedback Settings** global in your Payload admin panel.

### Genkit AI Integration

1.  Navigate to `Admin -> Globals -> Feedback Settings`.
2.  Fill in the "Genkit" fields:
    - **Feedback System Prompt**: A custom system prompt for the Genkit AI flow to tailor how it generates developer prompts from user feedback.

### GitHub Integration

1.  Navigate to `Admin -> Globals -> Feedback Settings`.
2.  Fill in the "GitHub Integration" fields:
    - **Repository Owner**: Your GitHub username or organization name.
    - **Repository Name**: The name of the repository where issues should be created.
    - **Personal Access Token**: A GitHub PAT with `repo` scope.

Once configured, a GitHub issue will be automatically created after a new feedback submission is processed by the AI.

### Jules Integration

1.  Navigate to `Admin -> Globals -> Feedback Settings`.
2.  Fill in the "Jules Integration" fields:
    - **GitHub Repository**: The full repository name (e.g., `owner/repo`) that Jules will use as its source context.
    - **Jules API Key**: Your API key for the Jules service.
    - Other fields like "Starting Branch" and "API URL" can be left as default unless you have a specific need.

After configuration, you will see a "Start Jules Session" button in the admin view for each feedback document, allowing you to initiate an AI coding session to address the feedback.

---

[Back to root README](../../../README.md)
