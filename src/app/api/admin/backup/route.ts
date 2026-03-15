import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  if (process.env.NEXT_RUNTIME === 'edge') {
      return NextResponse.json({ 
          success: false, 
          error: 'Database backup is only supported on Node.js runtime. This environment is running on Edge.' 
      }, { status: 501 });
  }

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
