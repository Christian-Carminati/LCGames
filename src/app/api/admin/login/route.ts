import { NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { checkRateLimit } from '@/lib/rate-limit';

const ADMIN_TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || 'default-secret-change-me';

function generateAdminToken(): string {
  return createHmac('sha256', ADMIN_TOKEN_SECRET)
    .update('authenticated')
    .digest('hex');
}

function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return 'unknown';
}

export async function POST(request: Request) {
  try {
    const clientIP = getClientIP(request);
    
    const allowed = await checkRateLimit(clientIP);
    if (!allowed) {
      console.warn(`[SECURITY] Rate limit exceeded for IP: ${clientIP}`);
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

    if (password === adminPassword) {
      const token = generateAdminToken();
      const response = NextResponse.json({ success: true });
      
      response.cookies.set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24,
      });
      
      return response;
    }

    console.warn(`[SECURITY] Failed login attempt from IP: ${clientIP}`);
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  } catch (_) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
