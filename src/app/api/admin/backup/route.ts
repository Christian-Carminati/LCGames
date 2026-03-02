

import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST() {
  try {
    // Basic security check: ensure this is only callable by admins
    // Note: In a real app, middleware handles this. Assuming route is protected.

    const scriptCommand = 'npm run db:backup';
    const cwd = process.cwd();

    console.log(`Executing backup command: ${scriptCommand} in ${cwd}`);
    
    const { stdout, stderr } = await execAsync(scriptCommand, { cwd });
    
    if (stderr) {
        console.warn('Backup stderr:', stderr);
    }
    
    console.log('Backup stdout:', stdout);

    return NextResponse.json({ 
        success: true, 
        message: 'Database backup initiated successfully',
        details: stdout
    });

  } catch (error: unknown) {
    console.error('Backup API error:', error);
    const message = error instanceof Error ? error.message : 'Backup failed';
    return NextResponse.json({ 
        success: false, 
        error: message 
    }, { status: 500 });
  }
}
