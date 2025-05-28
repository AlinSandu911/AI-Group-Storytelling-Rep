"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';

/**
 * Login page component
 * 
 * @returns {JSX.Element} Login page
 */
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  /**
   * 🎯 QUICK LOGIN FUNCTION for test buttons
   */
  const quickLogin = async (userType) => {
    const credentials = {
      child: { email: 'bertie-kid@gmail.com', password: 'password123' },
      parent: { email: 'john@gmail.com', password: 'password123' }
    };
    
    const cred = credentials[userType];
    if (cred) {
      setEmail(cred.email);
      setPassword(cred.password);
      
      // Auto-submit after setting credentials
      setTimeout(async () => {
        await handleLogin(cred.email, cred.password);
      }, 100);
    }
  };

  /**
   * 🔧 EXTRACTED LOGIN LOGIC for reuse - FIXED redirection
   */
  const handleLogin = async (emailToUse, passwordToUse) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔐 STARTING LOGIN for:', emailToUse);
      
      // Attempt to log in
      const user = await login(emailToUse, passwordToUse);
      
      // 🔍 SUPER DETAILED DEBUG LOGS
      console.log('🔍 LOGIN COMPLETE - DETAILED DEBUG:');
      console.log('- Raw user object:', user);
      console.log('- User UID:', user?.uid);
      console.log('- User email:', user?.email);
      console.log('- User displayName:', user?.displayName);
      console.log('- User role:', user?.role);
      console.log('- User familyId:', user?.familyId);
      console.log('- Should redirect to:', user?.role === 'child' ? '/ (Home)' : '/dashboard');
      
      // ✅ FIXED: REDIRECTION BASED ON ROLE
      setTimeout(() => {
        if (user?.role === 'child') {
          console.log('✅ Redirecting CHILD to HOME page');
          router.push('/');
        } else {
          console.log('✅ Redirecting PARENT to dashboard');
          router.push('/dashboard');
        }
      }, 100);
      
    } catch (err) {
      console.error('❌ Login error:', err);
      
      // Display user-friendly error message
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Invalid email or password. Please try again.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later or reset your password.');
      } else {
        setError('An error occurred during login. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle form submission
   * 
   * @param {Event} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic form validation
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    
    await handleLogin(email, password);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
          <div>
            <h1 className="text-3xl font-bold text-center text-indigo-800">Welcome Back</h1>
            <p className="mt-2 text-center text-gray-600">
              Sign in to continue to your account
            </p>
          </div>
          
          {error && <ErrorMessage message={error} />}
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="your@email.com"
                />
              </div>
              
              <div>
                <div className="flex justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500">
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <div>
              <Button 
                type="submit" 
                variant="primary" 
                disabled={isLoading} 
                fullWidth
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign up
              </Link>
            </p>
          </div>
          
          {/* 🧪 DEMO CREDENTIALS with functional buttons - UPDATED descriptions */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-center text-gray-600 mb-4">
              🧪 Quick Test Logins:
            </p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => quickLogin('parent')}
                disabled={isLoading}
                className="bg-blue-50 hover:bg-blue-100 border border-blue-200 p-3 rounded-md transition-colors disabled:opacity-50"
                title="Login as parent - redirects to dashboard"
              >
                <p className="text-xs font-medium text-blue-600 mb-1">👨‍👩‍👧‍👦 Parent Login</p>
                <p className="text-sm text-blue-800">john@gmail.com</p>
                <p className="text-xs text-blue-600">→ Dashboard</p>
              </button>
              <button
                onClick={() => quickLogin('child')}
                disabled={isLoading}
                className="bg-green-50 hover:bg-green-100 border border-green-200 p-3 rounded-md transition-colors disabled:opacity-50"
                title="Login as child - redirects to home page"
              >
                <p className="text-xs font-medium text-green-600 mb-1">👶 Child Login</p>
                <p className="text-sm text-green-800">bertie-kid@gmail.com</p>
                <p className="text-xs text-green-600">→ Home</p>
              </button>
            </div>
            
            {/* Static info updated with redirect destinations */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-xs font-medium text-gray-500 mb-1">Parent Account</p>
                <p className="text-sm text-gray-800">parent@example.com</p>
                <p className="text-sm text-gray-800">password123</p>
                <p className="text-xs text-gray-500 mt-1">Goes to Dashboard</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-xs font-medium text-gray-500 mb-1">Child Account</p>
                <p className="text-sm text-gray-800">child@example.com</p>
                <p className="text-sm text-gray-800">password123</p>
                <p className="text-xs text-gray-500 mt-1">Goes to Home</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}