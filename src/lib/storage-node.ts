import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

export async function saveToLocal(file: File, safeName: string): Promise<string> {
  const romsDir = join(process.cwd(), 'public/roms');
  if (!existsSync(romsDir)) {
    await mkdir(romsDir, { recursive: true });
  }
  
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const localPath = join(romsDir, safeName);
  await writeFile(localPath, buffer);
  return `/roms/${safeName}`;
}
