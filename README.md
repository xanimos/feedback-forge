# Feedback Forge

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Feedback Forge is a powerful, open-source toolkit for collecting, processing, and acting on user feedback within your applications. It's designed to be modular and extensible, with a primary integration for [Payload CMS](https://payloadcms.com).

## Overview

At its core, Feedback Forge provides a seamless way to gather feedback through a customizable React widget. This feedback can then be processed by AI to generate actionable developer prompts, create issues in project management tools like GitHub, and even initiate AI-powered coding sessions with services like Jules.

## Packages

This is a monorepo containing the following packages:

- **[`@feedback-forge/payload-plugin`](./packages/payload-plugin/README.md):** The main plugin for Payload CMS. This is the primary entry point for integrating Feedback Forge into your Payload project.
- **[`@feedback-forge/react-widget`](./packages/react-widget/README.md):** A customizable React component for collecting user feedback.
- **[`@feedback-forge/core`](./packages/core/README.md):** Contains the core types, utilities, and the main feedback processing logic.
- **[`@feedback-forge/integration-github`](./packages/integration-github/README.md):** An integration for creating GitHub issues from feedback.
- **[`@feedback-forge/integration-jules`](./packages/integration-jules/README.md):** An integration for starting Jules AI coding sessions.

## Getting Started

To get started with Feedback Forge, head over to the [`@feedback-forge/payload-plugin` README](./packages/payload-plugin/README.md) for detailed installation and configuration instructions.

## Contributing

We welcome contributions from the community! Please read our [Contributing Guide](./CONTRIBUTING.md) for more information on how to get involved.

## License

Feedback Forge is licensed under the [MIT License](./LICENSE).
