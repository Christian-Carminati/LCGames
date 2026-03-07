

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

  // We use dynamic import of a separate file to hide Node.js modules from the Edge compiler
  try {
    const { runBackup } = await import('@/lib/backup-node');
    const { stdout, stderr } = await runBackup();
    
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
