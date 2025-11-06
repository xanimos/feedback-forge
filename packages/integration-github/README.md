# @feedback-forge/integration-github

This package provides a function to create GitHub issues, intended for use within the Feedback Forge ecosystem.

## Installation

This package is a dependency of the [`@feedback-forge/payload-plugin`](../payload-plugin/README.md) and is installed automatically.

## Features

*   **`createIssue`**: An asynchronous function that creates a GitHub issue using the Octokit SDK.

## Usage

This function is called from the `processFeedback` job in the main payload plugin after a developer prompt has been successfully generated. The configuration for this function (owner, repo, token) is managed in the "Feedback Settings" global within the Payload admin panel.

### Parameters

The `createIssue` function accepts an object with the following properties:

*   `title` (string): The title of the GitHub issue.
*   `body` (string): The body content of the issue (typically the developer prompt).
*   `repo` (string): The name of the repository.
*   `owner` (string): The owner of the repository.
*   `token` (string): A GitHub Personal Access Token with `repo` scope.

### Example

```typescript
import { createIssue } from '@feedback-forge/integration-github';

await createIssue({
  title: 'Improve clarity on pricing page',
  body: 'The user found the pricing page confusing and was unable to locate the enterprise plan. Update the layout to make the enterprise option more prominent.',
  repo: 'my-awesome-app',
  owner: 'my-org',
  token: 'ghp_xxxxxxxxxxxxxxxxxxxx'
});
```

---

[Back to root README](../../../README.md)
