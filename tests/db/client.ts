import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const URL_FILE = path.join(__dirname, '.test-db-url');

function getDbUrl(): string {
  if (fs.existsSync(URL_FILE)) {
    return fs.readFileSync(URL_FILE, 'utf-8').trim();
  }
  // Fallback: if running without globalSetup (e.g. in worker), read from env
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  throw new Error(
    'Test database URL not found. Run tests via `npm run test:db` which starts Testcontainers.'
  );
}

const dbUrl = getDbUrl();
// Override so @/lib/db (used by service modules) also connects to the test container
process.env.DATABASE_URL = dbUrl;

export const prisma = new PrismaClient({
  datasources: { db: { url: dbUrl } },
});
