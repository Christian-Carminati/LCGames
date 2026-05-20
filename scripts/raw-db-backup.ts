import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function backupTable(tableName: string) {
  try {
    console.log(`Backing up table: ${tableName}`);
    // Use raw query to avoid Prisma schema mismatch errors
    const data = await prisma.$queryRawUnsafe(`SELECT * FROM "${tableName}"`);
    return data;
  } catch (error) {
    console.warn(`Could not backup table ${tableName}:`, error);
    return null;
  }
}

async function main() {
  const backupDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `json-backup-${timestamp}.json`);

  console.log("Starting custom JSON-based raw database backup...");

  // Let's get a list of all tables in the public schema
  let tables: string[] = [];
  try {
    const rawTables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public'
    `;
    tables = rawTables.map(t => t.tablename);
    console.log("Found tables in public schema:", tables);
  } catch (error) {
    console.error("Failed to query list of tables:", error);
    // Fallback list of tables we want to save
    tables = ['User', 'Account', 'Session', 'VerificationToken', 'Game', 'Score', 'AuditLog', 'GameConfig'];
  }

  const backupData: Record<string, any> = {};

  for (const table of tables) {
    const data = await backupTable(table);
    if (data !== null) {
      backupData[table] = data;
    }
  }

  fs.writeFileSync(
    backupFile, 
    JSON.stringify(backupData, (key, value) => 
      typeof value === 'bigint' ? Number(value) : value, 
      2
    ), 
    'utf-8'
  );
  console.log(`Backup completed successfully! Saved to ${backupFile}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
