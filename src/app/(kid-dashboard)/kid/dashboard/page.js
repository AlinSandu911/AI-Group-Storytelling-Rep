'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile } from '@/firebase/firestore';
import KidDashboard from '@/components/family/KidDashboard';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// 📚 SVG ICONS INLINE
const BookOpenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const LogOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

// FIXED: Changed from ArrowLeftIcon to generic HomeIcon for "Home" navigation
const BackHomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

export default function KidDashboardPage() {
  const { user, userProfile, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  
  const [childProfile, setChildProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Load child profile
  useEffect(() => {
    async function loadChildProfile() {
      if (!user) return;
      
      try {
        // If we already have userProfile from context, use it
        if (userProfile && userProfile.role === 'child') {
          setChildProfile(userProfile);
          setLoading(false);
          return;
        }
        
        // Otherwise, fetch from Firestore
        const profile = await getUserProfile(user.uid);
        
        // Redirect if not a child account
        if (profile?.role !== 'child') {
          router.push('/dashboard');
          return;
        }
        
        setChildProfile(profile);
      } catch (err) {
        console.error('Error loading child profile:', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    
    if (!authLoading) {
      loadChildProfile();
    }
  }, [user, userProfile, authLoading, router]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // FIXED: Handle navigation to home page only
  const handleGoHome = () => {
    router.push('/');
  };

  // Show loading state
  if (authLoading || loading) {
    return <LoadingSpinner fullScreen message="Loading your stories..." />;
  }

  // Show kid dashboard if child profile is loaded
  if (childProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-purple-50">
        {/* 🎨 KID-FRIENDLY HEADER */}
        <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              {/* Logo and Title */}
              <div className="flex items-center space-x-3">
                <BookOpenIcon />
                <h1 className="text-2xl font-bold">StoryTime</h1>
              </div>

              {/* Kid Info and Actions */}
              <div className="flex items-center space-x-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm text-indigo-200">Welcome back!</p>
                  <p className="font-semibold">
                    {childProfile.displayName || childProfile.name || 'Little Reader'}
                  </p>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-indigo-500 hover:bg-indigo-400 px-3 py-2 rounded-lg transition-colors"
                  title="Switch Account"
                >
                  <LogOutIcon />
                  <span className="hidden sm:inline">Switch</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* 🧭 KID NAVIGATION - FIXED: Only show relevant navigation for kids */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex space-x-8">
              <button className="flex items-center space-x-2 py-4 px-2 border-b-2 border-indigo-500 text-indigo-600 font-medium">
                <HomeIcon />
                <span>My Stories</span>
              </button>
              
              {/* FIXED: Changed to go to home page instead of family dashboard */}
              <button 
                onClick={handleGoHome}
                className="flex items-center space-x-2 py-4 px-2 text-gray-500 hover:text-gray-700 font-medium transition-colors"
                title="Go to main website"
              >
                <BackHomeIcon />
                <span>Home</span>
              </button>
            </div>
          </div>
        </nav>

        {/* 📚 MAIN CONTENT */}
        <main className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to Your Story World! 📚
            </h2>
            <p className="text-gray-600 text-lg">
              Ready for your next adventure, {childProfile.displayName || childProfile.name}?
            </p>
          </div>

          {/* Kid Dashboard Component */}
          <KidDashboard childId={childProfile.id || user.uid} />
        </main>

        {/* 🎨 KID-FRIENDLY FOOTER */}
        <footer className="bg-indigo-800 text-white py-6 mt-12">
          <div className="container mx-auto px-4 text-center">
            <div className="mb-4">
              <BookOpenIcon className="h-12 w-12 mx-auto mb-2 text-indigo-300" />
              <p className="text-xl font-semibold mb-1">Keep Reading, Keep Growing! 🌟</p>
              <p className="text-indigo-200">
                Made with ❤️ for amazing kids like you
              </p>
            </div>
            
            <div className="flex justify-center space-x-6 text-sm text-indigo-300">
              <span>📖 Stories</span>
              <span>🎨 Imagination</span>
              <span>🌟 Adventure</span>
              <span>💖 Fun</span>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Redirect to login if no profile
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600">Redirecting to login...</p>
      </div>
    </div>
  );
}