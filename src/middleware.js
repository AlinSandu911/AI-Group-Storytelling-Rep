import { NextResponse } from 'next/server';

/**
 * Next.js middleware function - FIXED for child home access
 * 
 * @param {Request} request - Next.js request object
 * @returns {NextResponse} NextResponse object
 */
export function middleware(request) {
    // Get the pathname from the URL
    const { pathname } = request.nextUrl;
    
    // Skip middleware for static files and API routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.includes('.') // static files like images, etc.
    ) {
        return NextResponse.next();
    }
    
    // Get user from cookies
    const getUser = () => {
        try {
            const userCookie = request.cookies.get('user')?.value;
            if (!userCookie) return null;
            return JSON.parse(userCookie);
        } catch (error) {
            console.error('Error parsing user cookie:', error);
            return null;
        }
    };
    
    const user = getUser();
    
    // FIXED: Public routes that EVERYONE can access (including children)
    const publicRoutes = [
        '/',           // ← CRITICAL: Home page is public for children
        '/login',
        '/register',
        '/forgot-password',
        '/reset-password',
        '/about',
        '/contact'
    ];
    
    // Check if the requested path is a public route
    if (publicRoutes.includes(pathname) || publicRoutes.some(route => pathname.startsWith(`${route}/`))) {
        // FIXED: If user is logged in and tries to access login/register, redirect appropriately
        if (user && (pathname === '/login' || pathname === '/register')) {
            if (user.role === 'child') {
                // Children go to home, not dashboard
                return NextResponse.redirect(new URL('/', request.url));
            } else {
                // Parents go to dashboard
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
        }
        
        // Allow access to public routes for everyone
        return NextResponse.next();
    }
    
    // AUTHENTICATION CHECK: Redirect to login if not authenticated
    if (!user) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // ROLE-SPECIFIC ROUTE PROTECTION
    if (user.role === 'parent') {
        // Child-only routes that parents shouldn't access
        if (pathname === '/kid-dashboard' || pathname.startsWith('/kid-dashboard/')) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    } else if (user.role === 'child') {
        // FIXED: Parent-only routes that children shouldn't access
        const parentOnlyRoutes = [
            '/dashboard',
            '/create-story',
            '/edit-story', 
            '/my-stories',
            '/profile',
            '/settings'
        ];
        
        if (parentOnlyRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
            // FIXED: Redirect children to HOME, not kid-dashboard
            console.log('🔄 Middleware: Redirecting child from parent route to home');
            return NextResponse.redirect(new URL('/', request.url));
        }
    }
    
    // Allow access to other routes for authenticated users
    return NextResponse.next();
}

// Configure middleware to run on specific paths
export const config = {
    matcher: [
        /*
        * Match all request paths except for:
        * - _next/static (static files)
        * - _next/image (image optimization files)
        * - favicon.ico (favicon file)
        * - public folder files
        * - api routes
        */
        '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
    ],
};