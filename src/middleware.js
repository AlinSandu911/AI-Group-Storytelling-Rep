// middleware.ts or middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const getUser = () => {
    try {
      const userCookie = request.cookies.get('user')?.value;
      if (!userCookie) return null;
      return JSON.parse(decodeURIComponent(userCookie));
    } catch (error) {
      console.error('Invalid user cookie:', error);
      return null;
    }
  };

  const user = getUser();

  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/about',
    '/contact',
  ];

  if (publicRoutes.includes(pathname) || publicRoutes.some(route => pathname.startsWith(`${route}/`))) {
    if (user && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL(user.role === 'child' ? '/' : '/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (user.role === 'parent') {
    if (pathname === '/kid-dashboard' || pathname.startsWith('/kid-dashboard/')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  } else if (user.role === 'child') {
    const parentOnlyRoutes = [
      '/dashboard',
      '/create-story',
      '/edit-story',
      '/my-stories',
      '/profile',
      '/settings',
    ];
    if (parentOnlyRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};