import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function runBackup() {
  const scriptCommand = 'npm run db:backup';
  const cwd = process.cwd();
  console.log(`Executing backup command: ${scriptCommand} in ${cwd}`);
  const { stdout, stderr } = await execAsync(scriptCommand, { cwd });
  return { stdout, stderr };
}
