import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const authCookie = request.cookies.get('zaiko_auth');
  const isLoginPage = request.nextUrl.pathname === '/login';

  // Protect all routes except /login and static files
  if (!authCookie && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect to dashboard if already logged in and trying to access login page
  if (authCookie && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // For / route, redirect to dashboard if authenticated, else login
  if (request.nextUrl.pathname === '/') {
    if (authCookie) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
