# Contributing to Feedback Forge

First off, thank you for considering contributing to Feedback Forge! It's people like you that make open source such a great community.

## Where do I go from here?

If you've noticed a bug or have a feature request, [make one](https://github.com/xanimos/feedback-forge/issues/new)! It's generally best if you get confirmation of your bug or approval for your feature request this way before starting to code.

If you have a general question, feel free to ask in the [Discussions](https://github.com/xanimos/feedback-forge/discussions) section.

## Fork & create a branch

If you're ready to contribute, fork the repository and create a new branch from `main`. A good branch name would be something like `feat/add-new-integration` or `fix/feedback-widget-style-bug`.

## Get the project running

This is a monorepo using pnpm workspaces. To get started:

1.  Install `pnpm`: `npm install -g pnpm`
2.  Install dependencies from the root: `pnpm install`
3.  Each package has its own build and test scripts. Refer to the `package.json` in each directory.

## Make your changes

Make your changes, and please be sure to follow the existing code style. Add tests for any new functionality.

## Commit your changes

We use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for our commit messages. This allows for automated changelog generation.

Examples:
*   `feat: Add support for GitLab integration`
*   `fix: Correctly handle API errors in the feedback widget`
*   `docs: Update payload-plugin README with new configuration options`

## Submitting a Pull Request

When you're ready, submit a pull request to the `main` branch. Please provide a clear description of the changes and link to any relevant issues.

Thank you for your contribution!
