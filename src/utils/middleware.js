import { NextResponse } from 'next/server';

/**
 * Middleware for route protection based on authentication state and user role
 * 
 * This is designed to work with Next.js middleware system.
 * It should be imported and used in the middleware.js file at the root of the project.
 * 
 * @param {Request} request - Next.js request object
 * @param {Object} options - Middleware options
 * @param {Function} options.getUser - Function to get the current user
 * @returns {NextResponse} NextResponse object
 */
export function authMiddleware(request, { getUser }) {
    const user = getUser();
    const { pathname } = request.nextUrl;
    
    // Public routes that don't require authentication
    const publicRoutes = [
        '/',
        '/login',
        '/register',
        '/forgot-password',
        '/reset-password',
        '/about',
        '/contact'
    ];
    
    // Check if the requested path matches any public route
    if (publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
        // If user is already logged in and tries to access login/register pages, redirect to dashboard
        if (user && (pathname === '/login' || pathname === '/register')) {
            return NextResponse.redirect(new URL(getUserDashboard(user), request.url));
        }
        
        // Allow access to public routes
        return NextResponse.next();
    }
    
    // Protected routes
    if (!user) {
        // Redirect to login if not authenticated
        return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Role-specific route protection
    if (user.role === 'parent') {
        // Child-only routes that parents shouldn't access
        if (pathname === '/kid-dashboard' || pathname.startsWith('/kid-dashboard/')) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    } else if (user.role === 'child') {
        // Parent-only routes that children shouldn't access
        const parentOnlyRoutes = [
            '/dashboard',
            '/create-story',
            '/edit-story',
            '/my-stories',
            '/profile',
            '/settings'
        ];
        
        if (parentOnlyRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
            return NextResponse.redirect(new URL('/kid-dashboard', request.url));
        }
    }
    
    // Allow access to protected routes for authenticated users
    return NextResponse.next();
}

/**
 * Determine the appropriate dashboard route based on user role
 * 
 * @param {Object} user - User object
 * @returns {string} Dashboard route
 */
function getUserDashboard(user) {
    if (!user) return '/login';
    
    return user.role === 'parent' ? '/dashboard' : '/kid-dashboard';
}