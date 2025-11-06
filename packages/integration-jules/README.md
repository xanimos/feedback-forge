# @feedback-forge/integration-jules

This package provides components and utilities for integrating Feedback Forge with [Jules](https://jules.ai/), an AI-powered coding assistant.

## Installation

This package is a dependency of the [`@feedback-forge/payload-plugin`](../payload-plugin/README.md) and is installed automatically.

## Features

*   **`JulesSessionManagement`**: A React component that renders a button in the Payload admin panel to start a new Jules session.
*   **`startJulesSessionHandler`**: A Payload endpoint handler that communicates with the Jules API to initiate a new coding session.

## Usage

The `JulesSessionManagement` component is automatically rendered in the "Feedback" collection's edit view. When a user clicks the "Start Jules Session" button, it calls the `startJulesSessionHandler` endpoint.

All configuration for the Jules integration, including the API key, target GitHub repository, and managed statuses, is handled in the "Feedback Settings" global within the Payload admin panel.

---

[Back to root README](../../../README.md)
