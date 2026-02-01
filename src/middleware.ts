import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Only check /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    
    // Allow access to login page and api routes (api routes checking handled inside logic if needed, but for now allow login api)
    if (request.nextUrl.pathname === '/admin/login' || request.nextUrl.pathname.startsWith('/api/admin/login')) {
      return NextResponse.next();
    }

    const token = request.cookies.get('admin_token');

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // TODO: Add User Auth check for other routes later if needed
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
