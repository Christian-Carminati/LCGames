

export const runtime = 'edge';

import { NextResponse } from 'next/server';

export async function POST() {
  // Edge Runtime check
  if (process.env.NEXT_RUNTIME === 'edge') {
     // child_process is not available on edge. 
     // We return a message instead of crashing the build/runtime.
     return NextResponse.json({ 
         success: false, 
         error: 'Database backup is only supported on Node.js runtime. This environment is running on Edge.' 
     }, { status: 501 });
  }

  // We use dynamic require to avoid bundling issues on edge if possible, 
  // though Next.js usually handles this if we are careful.
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

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
