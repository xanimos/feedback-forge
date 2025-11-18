import { beforeAll } from 'vitest';
import { unlinkSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = join(filename, '..');

// Clean up database before tests
beforeAll(() => {
  const dbPath = join(dirname, 'sqlite.db');
  try {
    unlinkSync(dbPath);
    unlinkSync(`${dbPath}-shm`);
    unlinkSync(`${dbPath}-wal`);
  } catch (error) {
    // Files might not exist, that's fine
  }

  // Set env vars to avoid interactive prompts
  process.env.PAYLOAD_DROP_DATABASE = 'true';
  // Use in-memory database for tests to avoid migration issues
  process.env.DATABASE_URI = ':memory:';
});
