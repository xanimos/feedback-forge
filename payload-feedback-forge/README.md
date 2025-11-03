# Payload Feedback Forge Plugin

This plugin for Payload CMS provides a robust framework for collecting, managing, and processing user feedback. It allows you to easily integrate feedback mechanisms into your Payload projects and provides tools for forging (generating/processing) payloads based on this feedback.

## Features

-   **Feedback Collection**: Define custom feedback forms and integrate them seamlessly into your Payload collections.
-   **Feedback Management**: A dedicated admin view for reviewing, categorizing, and responding to feedback.
-   **Payload Forging**: Tools to process and transform feedback data into actionable payloads for other systems or internal use.
-   **Customizable**: Easily extendable to fit your specific feedback and payload generation needs.

## Installation

1.  **Install the package**:

    ```bash
    npm install payload-feedback-forge
    # or
    yarn add payload-feedback-forge
    # or
    pnpm add payload-feedback-forge
    ```

2.  **Add the plugin to your `payload.config.ts`**:

    ```typescript
    import { buildConfig } from 'payload/config';
    import { feedbackForge } from 'payload-feedback-forge';

    export default buildConfig({
      // ... other config
      plugins: [
        feedbackForge({
          // Plugin options (see Configuration section)
          collections: ['users', 'products'], // Example: Link feedback to users and products
        }),
      ],
      // ...
    });
    ```

## Configuration

The `feedbackForge` plugin accepts the following options:

-   `collections` (optional): An array of collection slugs to which feedback can be linked. This will add a relationship field to the feedback collection.
-   `enabled` (optional): A boolean to enable or disable the plugin. Defaults to `true`.
-   `formFields` (optional): An array of Payload field configurations to customize the feedback form. If not provided, a default set of fields (e.g., `message`, `email`, `rating`) will be used.

Example with custom fields:

```typescript
feedbackForge({
  collections: ['users'],
  formFields: [
    {
      name: 'subject',
      type: 'text',
      required: true,
    },
    {
      name: 'feedbackType',
      type: 'select',
      options: ['bug', 'feature_request', 'general_inquiry'],
      defaultValue: 'general_inquiry',
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
    },
  ],
}),
```

## Usage

Once installed and configured, the plugin will:

1.  Create a new `feedback` collection in your Payload CMS, accessible via the admin panel.
2.  Provide an API endpoint (e.g., `/api/feedback`) for submitting feedback programmatically.

### Submitting Feedback via API

You can submit feedback using a `POST` request to `/api/feedback`. The request body should match the `formFields` configuration.

Example using `fetch`:

```javascript
fetch('/api/feedback', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    subject: 'Bug Report: Login Issue',
    feedbackType: 'bug',
    message: 'I am unable to log in after updating my password.',
    // If 'users' collection is linked:
    // user: 'USER_ID_HERE',
  }),
})
  .then(response => response.json())
  .then(data => console.log('Feedback submitted:', data))
  .catch(error => console.error('Error submitting feedback:', error));
```

### Managing Feedback in Admin Panel

Navigate to the 'Feedback' collection in your Payload admin panel to view, edit, and manage submitted feedback entries.

## Development

For local development and testing, refer to the `dev` directory within this plugin's repository.

## Contributing

We welcome contributions! Please see our `CONTRIBUTING.md` for more details.

## License

[MIT License](LICENSE)
