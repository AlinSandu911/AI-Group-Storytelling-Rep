'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useFamily } from '@/contexts/FamilyContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

/**
 * Kid Mode page - Child-friendly interface
 */
export default function KidMode() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { children, activeChild, switchActiveChild } = useFamily();
  
  const childId = searchParams.get('childId');
  
  useEffect(() => {
    const setupKidMode = async () => {
      try {
        if (childId && children.length > 0) {
          // Find child by ID
          const child = children.find(c => c.id === childId);
          if (child && activeChild?.id !== childId) {
            await switchActiveChild(childId);
          }
        }
      } catch (error) {
        console.error('Error setting up Kid Mode:', error);
      } finally {
        setLoading(false);
      }
    };

    if (children.length > 0) {
      setupKidMode();
    } else {
      setLoading(false);
    }
  }, [childId, children, activeChild, switchActiveChild]);

  if (loading) {
    return <LoadingSpinner fullScreen message="Setting up Kid Mode..." />;
  }

  if (!activeChild) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Oops! No child selected
          </h1>
          <p className="text-gray-600 mb-6">
            We need to select a child to enter Kid Mode.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
        {/* Header Kid Mode */}
        <header className="bg-white/20 backdrop-blur-sm shadow-lg">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-white/30 p-2 rounded-full">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Hello, {activeChild.name}! 👋
                </h1>
                <p className="text-white/80 text-sm">Your stories are here!</p>
              </div>
            </div>
            
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors flex items-center space-x-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span>Exit Kid Mode</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Stories Section */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <div className="flex items-center mb-4">
                <div className="bg-purple-500 p-3 rounded-full mr-4">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800">My Stories</h2>
              </div>
              <p className="text-gray-600 mb-4">
                See all your favorite stories!
              </p>
              <button
                onClick={() => router.push('/my-stories')}
                className="w-full bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600 transition-colors font-semibold"
              >
                View Stories 📚
              </button>
            </div>

            {/* Favorites Section */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <div className="flex items-center mb-4">
                <div className="bg-yellow-500 p-3 rounded-full mr-4">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800">Favorites</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Your stories with ⭐ are here!
              </p>
              <button
                onClick={() => router.push('/my-stories?filter=favorites')}
                className="w-full bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600 transition-colors font-semibold"
              >
                View Favorites ⭐
              </button>
            </div>

            {/* Recent Stories */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <div className="flex items-center mb-4">
                <div className="bg-green-500 p-3 rounded-full mr-4">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800">Recent</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Continue where you left off!
              </p>
              <button
                onClick={() => router.push('/my-stories?filter=recent')}
                className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors font-semibold"
              >
                View Recent 🕒
              </button>
            </div>
          </div>

          {/* Fun Section */}
          <div className="mt-8 bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              🎉 Extra Fun! 🎉
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => router.push('/create-story')}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all transform hover:scale-105"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">✨</div>
                  <div className="font-semibold">Create New Story</div>
                  <div className="text-sm opacity-90">Let's make one together!</div>
                </div>
              </button>
              
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-4 rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all transform hover:scale-105"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">👨‍👩‍👧‍👦</div>
                  <div className="font-semibold">Back to Parents</div>
                  <div className="text-sm opacity-90">Exit Kid Mode</div>
                </div>
              </button>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}