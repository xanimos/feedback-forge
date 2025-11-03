import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { payloadFeedbackForge } from '@xanimos/payload-feedback-forge'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { testEmailAdapter } from './helpers/testEmailAdapter.js'
import { seed } from './seed.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

if (!process.env.ROOT_DIR) {
  process.env.ROOT_DIR = dirname
}

const buildConfigWithMemoryDB = async () => {
  return buildConfig({
    admin: {
      importMap: {
        baseDir: path.resolve(dirname),
      },
    },
    collections: [
      {
        slug: 'posts',
        fields: [],
      },
      {
        slug: 'media',
        fields: [],
        upload: {
          staticDir: path.resolve(dirname, 'media'),
        },
      },
    ],
    db: sqliteAdapter({
      client: {
        url: process.env.DATABASE_URI || '',
      },
    }),
    editor: lexicalEditor(),
    email: testEmailAdapter,
    jobs: {
      access: {
        run: ({ req }) => {
          if (req.user) {return true}

          const authHeader = req.headers.get('authorization')
          return authHeader === `Bearer ${process.env.CRON_SECRET}`
        },
      },
      jobsCollectionOverrides: ({ defaultJobsCollection }) => {
        if (!defaultJobsCollection.admin) {
          defaultJobsCollection.admin = {}
        }

        defaultJobsCollection.admin.hidden = false
        return defaultJobsCollection
      },
      tasks: [],
    },
    onInit: async (payload) => {
      await seed(payload)
    },
    plugins: [
      payloadFeedbackForge({
        access: {
          create: () => true,
          delete: () => true,
          read: () => true,
          update: () => true,
        },
        allowAnonymousSubmissions: false,
        cron: '*/5 * * * *',
        githubRepo: 'xanimos/RightBinApp',
      }),
    ],
    secret: process.env.PAYLOAD_SECRET || 'test-secret_key',
    sharp,
    typescript: {
      outputFile: path.resolve(dirname, 'payload-types.ts'),
    },
  })
}

export default buildConfigWithMemoryDB()
