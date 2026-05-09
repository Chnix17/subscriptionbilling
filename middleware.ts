import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Paths that don't require authentication
const PUBLIC_PATHS = ['/auth/login', '/auth/register', '/']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionToken = request.cookies.get('session_token')?.value

  // Allow public paths
  if (PUBLIC_PATHS.includes(pathname)) {
    // If user is logged in and tries to access login/register, redirect to dashboard
    if (sessionToken && (pathname === '/auth/login' || pathname === '/auth/register')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // Check for session token on protected routes
  if (!sessionToken) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}
