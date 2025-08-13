import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware for protected routes
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't need authentication
  const publicRoutes = [
    '/', 
    '/login', 
    '/register', 
    '/forgot-password', 
    '/reset-password',
    '/features',
    '/docs',
    '/about',
    '/contact',
    '/privacy',
    '/terms'
  ];

  // API routes should be handled by Next.js rewrites, not middleware
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Static files and Next.js internal routes should pass through
  if (pathname.startsWith('/_next/') || 
      pathname.startsWith('/favicon.ico') ||
      pathname.startsWith('/robots.txt') ||
      pathname.startsWith('/sitemap.xml')) {
    return NextResponse.next();
  }

  // Check if the route is public (exact match or starts with route + /)
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  // Get token from cookies
  const token = request.cookies.get('ja-cms-token')?.value;

  // Debug logging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('Middleware - Pathname:', pathname);
    console.log('Middleware - Is Public Route:', isPublicRoute);
    console.log('Middleware - Has Token:', !!token);
  }

  // If accessing protected route without token, redirect to login
  if (!isPublicRoute && !token) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Middleware - Redirecting to login (no token)');
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If accessing login/register with token, redirect to dashboard
  // But only for specific auth pages to avoid infinite loops
  if ((pathname === '/login' || pathname === '/register') && token) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Middleware - Redirecting authenticated user to dashboard');
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Allow all other requests to pass through
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
     * - robots.txt, sitemap.xml (SEO files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
