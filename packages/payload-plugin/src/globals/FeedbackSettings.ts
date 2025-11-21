import type { GlobalConfig } from 'payload';
import { defaultFeedbackSystemPrompt } from '@feedback-forge/core';

export const FeedbackSettings: GlobalConfig = {
  slug: 'feedback-settings',
  label: 'Feedback Settings',
  access: {
    read: () => true,
    update: () => true,
  },
  fields: [
    {
      name: 'github',
      type: 'group',
      label: 'GitHub Integration',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          label: 'Enable GitHub Integration',
          defaultValue: false,
        },
        {
          name: 'owner',
          type: 'text',
          label: 'Repository Owner',
          required: true,
          defaultValue: '',
          admin: {
            placeholder: 'e.g., your-org',
            condition: (_, siblingData) => siblingData.enabled,
          },
        },
        {
          name: 'repo',
          type: 'text',
          label: 'Repository Name',
          required: true,
          defaultValue: '',
          admin: {
            placeholder: 'e.g., your-repo',
            condition: (_, siblingData) => siblingData.enabled,
          },
        },
        {
          name: 'token',
          type: 'text',
          label: 'Personal Access Token',
          required: true,
          defaultValue: '',
          admin: {
            placeholder: 'ghp_...',
            condition: (_, siblingData) => siblingData.enabled,
          },
        },
        {
          name: 'baseUrl',
          type: 'text',
          label: 'GitHub Base URL (Optional)',
          admin: {
            placeholder: 'https://github.enterprise.com/api/v3',
            description: 'Custom base URL for GitHub Enterprise Server. Leave empty for github.com',
            condition: (_, siblingData) => siblingData.enabled,
          },
        },
      ],
    },
    {
      name: 'jules',
      type: 'group',
      label: 'Jules Integration',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          label: 'Enable Jules Integration',
          defaultValue: false,
        },
        {
          name: 'githubRepo',
          type: 'text',
          label: 'GitHub Repository',
          required: true,
          defaultValue: '',
          admin: {
            placeholder: 'e.g., your-org/your-repo',
            condition: (_, siblingData) => siblingData.enabled,
          },
        },
        {
          name: 'githubStartingBranch',
          type: 'text',
          label: 'GitHub Starting Branch',
          defaultValue: 'main',
          admin: {
            condition: (_, siblingData) => siblingData.enabled,
          },
        },
        {
          name: 'julesApiUrl',
          type: 'text',
          label: 'Jules API URL',
          defaultValue: 'https://jules.googleapis.com/v1alpha/sessions',
          admin: {
            condition: (_, siblingData) => siblingData.enabled,
          },
        },
        {
          name: 'julesApiKey',
          type: 'text',
          label: 'Jules API Key',
          required: true,
          defaultValue: '',
          admin: {
            placeholder: 'your-jules-api-key',
            condition: (_, siblingData) => siblingData.enabled,
          },
        },
        {
          name: 'julesManagedStatuses',
          type: 'group',
          label: 'Jules Managed Statuses',
          admin: {
            condition: (_, siblingData) => siblingData.enabled,
          },
          fields: [
            {
              name: 'inProgress',
              type: 'text',
              label: 'In Progress Status',
              defaultValue: 'in-progress',
            },
            {
              name: 'received',
              type: 'text',
              label: 'Received Status',
              defaultValue: 'received',
            },
          ],
        },
      ],
    },
    {
      name: 'ai',
      type: 'group',
      label: 'AI Configuration',
      fields: [
        {
          name: 'provider',
          type: 'select',
          label: 'AI Provider',
          required: true,
          defaultValue: 'vercel',
          options: [
            { label: 'Vercel AI SDK (OpenAI, Anthropic, Google)', value: 'vercel' },
            { label: 'Google Genkit (Legacy)', value: 'genkit' },
          ],
        },
        {
          name: 'model',
          type: 'text',
          label: 'AI Model',
          required: true,
          defaultValue: 'openai:gpt-4o',
          admin: {
            description:
              'Model format depends on provider. Vercel: "provider:model" (e.g., "openai:gpt-4o", "anthropic:claude-3-5-sonnet-20241022", "google:gemini-2.0-flash"). Genkit: model name only (e.g., "gemini-2.5-flash").',
            placeholder: 'e.g., openai:gpt-4o',
          },
        },
        {
          name: 'apiKey',
          type: 'text',
          label: 'API Key',
          required: true,
          defaultValue: '',
          admin: {
            placeholder: 'your-google-ai-api-key',
          },
        },
        {
          name: 'systemPrompt',
          type: 'textarea',
          label: 'System Prompt',
          defaultValue: defaultFeedbackSystemPrompt,
          admin: {
            placeholder:
              'You are a helpful assistant that generates developer prompts from user feedback.',
          },
        },
        {
          name: 'temperature',
          type: 'number',
          label: 'Temperature',
          defaultValue: 0.7,
        },
      ],
    },
  ],
};
