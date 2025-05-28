'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useFamily } from '@/contexts/FamilyContext';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

/**
 * Parent dashboard page
 * 
 * @returns {JSX.Element} Dashboard page
 */
export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { children, activeChild, switchActiveChild, loading: familyLoading } = useFamily();
  const router = useRouter();
  
  // Quick actions
  const handleCreateStory = () => {
    router.push('/create-story');
  };
  
  const handleViewStories = () => {
    router.push('/my-stories');
  };
  
  const handleManageChildren = () => {
    router.push('/my-children');
  };
  
  const handleEnterKidMode = (childId) => {
    switchActiveChild(childId);
    router.push(`/kid-mode?childId=${childId}`);
  };
  
  // Show loading state
  if (authLoading || familyLoading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-indigo-800">Welcome, {user?.displayName || 'Parent'}!</h1>
            <p className="text-gray-600 mt-2">Manage stories and child accounts from your dashboard.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main actions */}
            <div className="md:col-span-2">
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold text-indigo-700 mb-4">Quick Actions</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                    <div className="flex items-start mb-4">
                      <div className="flex-shrink-0 h-10 w-10 bg-indigo-600 text-white rounded-md flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-indigo-800">Create a Story</h3>
                        <p className="text-indigo-600 text-sm">Write or generate a new story</p>
                      </div>
                    </div>
                    <Button variant="primary" fullWidth onClick={handleCreateStory}>
                      Create Story
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                    <div className="flex items-start mb-4">
                      <div className="flex-shrink-0 h-10 w-10 bg-purple-600 text-white rounded-md flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-purple-800">My Stories</h3>
                        <p className="text-purple-600 text-sm">View and manage your stories</p>
                      </div>
                    </div>
                    <Button 
                      variant="primary" 
                      fullWidth 
                      onClick={handleViewStories}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      View Stories
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-indigo-700">Child Accounts</h2>
                  <Button variant="secondary" onClick={handleManageChildren}>
                    Manage Children
                  </Button>
                </div>
                
                {children.length === 0 ? (
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-gray-400 mx-auto mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No Child Accounts</h3>
                    <p className="text-gray-500 mb-4">
                      Create child accounts to personalize stories for each child.
                    </p>
                    <Button variant="primary" onClick={handleManageChildren}>
                      Add Child Account
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {children.map((child) => (
                      <div
                        key={child.id}
                        className="border border-indigo-100 rounded-lg overflow-hidden hover:border-indigo-300 transition-colors"
                      >
                        <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100">
                          <h3 className="font-medium text-indigo-800">{child.name}</h3>
                          {child.age && (
                            <p className="text-xs text-indigo-600">Age: {child.age}</p>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="secondary"
                              onClick={() => {
                                switchActiveChild(child.id);
                                router.push('/create-story');
                              }}
                              className="text-sm py-1"
                            >
                              Create Story
                            </Button>
                            <Button
                              variant="secondary"
                              onClick={() => handleEnterKidMode(child.id)}
                              className="text-sm py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                            >
                              Kid Mode
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Stats and tips */}
            <div className="md:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold text-indigo-700 mb-4">Family Stats</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Child Accounts:</span>
                    <span className="font-semibold text-indigo-600">{children.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Child:</span>
                    <span className="font-semibold text-indigo-600">{activeChild?.name || 'None'}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-lg shadow-md text-white">
                <h2 className="text-xl font-semibold mb-3">Story Tips</h2>
                <ul className="space-y-2 list-disc pl-5">
                  <li>Create stories targeted to each child's interests</li>
                  <li>Try the AI generation for quick, personalized stories</li>
                  <li>Switch to "Kid Mode" to let your child browse their stories safely</li>
                  <li>Use different voices for different characters</li>
                </ul>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </ProtectedRoute>
  );
}