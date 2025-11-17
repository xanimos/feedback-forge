import type { Config } from 'payload';

import type { PayloadFeedbackForgeConfig } from './types.js';

import { createGithubIssueEndpoint } from './endpoints/createGithubIssue.js';
import { getFeedbackSettingsEndpoint } from './endpoints/getFeedbackSettings.js';
import { startJulesSessionHandler } from './endpoints/startJulesSession.js';
import { allowAnonymous } from './hooks/beforeValidate.js';
import { dispatchFeedbackJob } from './hooks/dispatchFeedbackJob.js';
import { FeedbackSettings } from './globals/FeedbackSettings.js';
import { getProcessFeedbackJob } from './jobs/processFeedback.js';

export const payloadFeedbackForge =
  (pluginOptions: PayloadFeedbackForgeConfig) =>
  (config: Config): Config => {
    if (!config.collections) {
      config.collections = [];
    }

    if (!config.globals) {
      config.globals = [];
    }

    config.globals.push(FeedbackSettings);

    const { access, allowAnonymousSubmissions, julesManagedStatuses } = pluginOptions;
    config.collections.push({
      slug: 'feedback',
      access: {
        create: access?.create,
        delete: access?.delete,
        read: access?.read,
        update: access?.update,
      },
      admin: {
        useAsTitle: 'title',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'feedback',
          type: 'textarea',
          required: true,
        },
        {
          name: 'breadcrumbs',
          type: 'textarea',
          required: true,
        },
        {
          name: 'user',
          type: 'relationship',
          relationTo: 'users',
          required: false,
        },
        {
          name: 'developerPrompt',
          type: 'textarea',
          admin: {
            position: 'sidebar',
            readOnly: true,
          },
        },
        {
          name: 'githubIssueManagement',
          type: 'ui',
          admin: {
            position: 'sidebar',
            components: {
              Field: `@feedback-forge/payload-plugin/client#GithubIssueManagement`,
            },
            condition: (data) => data.developerPrompt,
          },
        },
        {
          name: 'githubIssueUrl',
          type: 'text',
          admin: {
            position: 'sidebar',
            readOnly: true,
          },
          label: 'GitHub Issue URL',
        },
        {
          name: 'julesSessionManagement',
          type: 'ui',
          admin: {
            position: 'sidebar',
            components: {
              Field: `@feedback-forge/payload-plugin/client#JulesSessionManagement`,
            },
            condition: (data) => data.developerPrompt,
          },
        },
        {
          name: 'julesSessionId',
          type: 'text',
          admin: {
            position: 'sidebar',
            readOnly: true,
          },
          label: 'Jules Session ID',
        },
        {
          name: 'status',
          type: 'select',
          admin: {
            description: 'Set to "Completed" manually after the PR has been reviewed and merged.',
            position: 'sidebar',
          },
          defaultValue: julesManagedStatuses?.received || 'received',
          options: [
            {
              label: 'Received',
              value: julesManagedStatuses?.received || 'received',
            },
            {
              label: 'In Progress',
              value: julesManagedStatuses?.inProgress || 'in-progress',
            },
            {
              label: 'Completed',
              value: 'completed',
            },
          ],
        },
      ],
      hooks: {
        afterChange: [dispatchFeedbackJob],
        beforeValidate: allowAnonymousSubmissions ? [allowAnonymous] : [],
      },
    });

    /**
     * If the plugin is disabled, we still want to keep added collections/fields so the database schema is consistent which is important for migrations.
     * If your plugin heavily modifies the database schema, you may want to remove this property.
     */
    if (pluginOptions.disabled) {
      return config;
    }

    if (!config.endpoints) {
      config.endpoints = [];
    }

    config.endpoints.push(createGithubIssueEndpoint);
    config.endpoints.push(getFeedbackSettingsEndpoint);
    config.endpoints.push({
      handler: startJulesSessionHandler,
      method: 'post',
      path: '/feedback-forge/start-jules-session',
    });

    if (!config.jobs) {
      config.jobs = {};
    }

    if (!config.jobs.tasks) {
      config.jobs.tasks = [];
    }

    config.jobs.tasks.push(getProcessFeedbackJob(pluginOptions));

    if (!config.jobs.autoRun) {
      config.jobs.autoRun = [];
    }

    const arunConf = {
      cron: '*/5 * * * *',
      queue: 'feedbackForge',
    };

    if (typeof config.jobs.autoRun == 'function') {
      const currentAutoRun = config.jobs.autoRun;
      config.jobs.autoRun = async (payload) => {
        return [...(await currentAutoRun(payload)), arunConf];
      };
    } else {
      config.jobs.autoRun.push(arunConf);
    }
    return config;
  };
