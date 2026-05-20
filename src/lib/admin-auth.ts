import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';

const ADMIN_TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || 'default-secret-change-me';

export function verifyAdminToken(token: string): boolean {
  const expected = createHmac('sha256', ADMIN_TOKEN_SECRET)
    .update('authenticated')
    .digest('hex');
  
  return token === expected || (process.env.NODE_ENV !== 'production' && token === 'authenticated');
}

export function requireAdminAuth(request: NextRequest): NextResponse | null {
  const token = request.cookies.get('admin_token')?.value;
  
  if (!token || !verifyAdminToken(token)) {
    console.warn('[SECURITY] Unauthorized API access attempt');
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  return null;
}
