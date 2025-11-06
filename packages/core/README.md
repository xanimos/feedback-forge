# @feedback-forge/core

This package contains the core types, utilities, and the main feedback processing logic for the Feedback Forge ecosystem.

## Installation

This package is intended to be used as a dependency of other Feedback Forge packages and is not meant to be installed directly.

## Features

- **`getFeedbackProcessor`**: A function that returns a Genkit flow for processing feedback. It takes the feedback and breadcrumbs as input and generates a developer prompt.
- **`PayloadFeedbackForgeConfig`**: The main type definition for the plugin's configuration.
- **`Feedback`**: The type definition for a feedback document.

## Usage

The `getFeedbackProcessor` is used by the `@feedback-forge/payload-plugin` to process feedback submissions. It can be configured with a custom system prompt to tailor the AI's behavior.

```typescript
import { getFeedbackProcessor } from '@feedback-forge/core';

const feedbackProcessor = getFeedbackProcessor({
  feedbackSystemPrompt:
    'You are an expert software engineer. Your task is to turn user feedback into a detailed, actionable prompt for a developer...',
});

const result = await feedbackProcessor({
  breadcrumbs: 'User was on /pricing page',
  feedback: 'The pricing page is confusing. I could not find the enterprise plan.',
});

console.log(result.developerPrompt);
```

---

[Back to root README](../../README.md)
