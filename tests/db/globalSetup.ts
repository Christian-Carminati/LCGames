import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const URL_FILE = path.join(__dirname, '.test-db-url');
let container: StartedPostgreSqlContainer;

export async function setup() {
  container = await new PostgreSqlContainer('postgres:16-alpine').start();
  const connectionUri = container.getConnectionUri();

  // Write URL so test workers can find it
  fs.writeFileSync(URL_FILE, connectionUri);

  // Run migrations against the test container
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: connectionUri },
    cwd: path.join(__dirname, '../..'),
    stdio: 'inherit',
  });
}

export async function teardown() {
  await container?.stop();
  if (fs.existsSync(URL_FILE)) {
    fs.unlinkSync(URL_FILE);
  }
}
