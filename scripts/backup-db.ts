
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

async function backupDatabase() {
  const date = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'backups');
  const backupFile = path.join(backupDir, `backup-${date}.sql`);

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }

  // Load env vars
  // Assuming .env or .env.local is loaded by the environment running this script
  // or we need to rely on the system environment variables.
  // In a Next.js context with `npm run`, .env might not be loaded into the shell automatically 
  // unless we use `dotenv` or similar, but let's assume standard postgres env vars or a connection string.
  
  // Actually, for consistency, let's look for DATABASE_URL.
  // If running via `npm run ...` we might need `dotenv-cli` or just `require('dotenv').config()`.
  
  // Let's try to assume the environment is set up or use dotenv.
  try {
      // Create a minimal validation
      if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
          console.warn('DATABASE_URL or POSTGRES_URL not found. Attempting to load .env...');
          const dotenv = await import('dotenv');
          dotenv.config();
          dotenv.config({ path: '.env.local' });
      }

      console.log('Starting backup...');
      // Use pg_dump. Using DATABASE_URL should work if it's in the standard format.
      // We need to ensure we don't expose the password in the logs.
      
      const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
      if (!dbUrl) {
          throw new Error('No database URL found in environment.');
      }

      await execAsync(`pg_dump "${dbUrl}" > "${backupFile}"`);
      console.log(`Backup created at: ${backupFile}`);

  } catch (error) {
      console.error('Backup failed:', error);
      process.exit(1);
  }
}

backupDatabase();
