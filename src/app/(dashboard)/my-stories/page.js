"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useFamily } from '@/contexts/FamilyContext';
import { 
  getStoriesByUserId, 
  getDraftStories,
  getPublishedStories,
  getStoriesByChildId, 
  deleteStory, 
  toggleStoryFavorite 
} from '@/firebase/firestore';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Button from '@/components/common/Button';
import StoryCard from '@/components/common/StoryCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

/**
 * My Stories page component with proper user filtering
 * 
 * @returns {JSX.Element} My Stories page
 */
export default function MyStories() {
  // Auth and family state
  const { user, loading: authLoading } = useAuth();
  const { children, activeChild, switchActiveChild } = useFamily();
  const router = useRouter();
  
  // Stories state
  const [stories, setStories] = useState([]);
  const [filteredStories, setFilteredStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Filter state
  const [childFilter, setChildFilter] = useState('all'); // 'all', 'general', or specific child ID
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'favorites', 'published', 'drafts'
  const [searchTerm, setSearchTerm] = useState('');
  
  // FIXED: Fetch stories with proper user filtering
  useEffect(() => {
    async function fetchStories() {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        let fetchedStories = [];
        
        if (childFilter === 'all') {
          // FIXED: Get all stories created by current user only
          fetchedStories = await getStoriesByUserId(user.uid);
          
        } else if (childFilter === 'general') {
          // Get stories based on status filter for better performance
          if (statusFilter === 'drafts') {
            fetchedStories = await getDraftStories(user.uid);
          } else if (statusFilter === 'published') {
            fetchedStories = await getPublishedStories(user.uid);
          } else {
            // For 'all' and 'favorites', get all user stories
            fetchedStories = await getStoriesByUserId(user.uid);
          }
          
          // Filter to exclude stories with specific childId (general stories only)
          fetchedStories = fetchedStories.filter(story => !story.childId);
          
        } else {
          // Fetch stories for specific child
          fetchedStories = await getStoriesByChildId(childFilter);
          
          // FIXED: Filter to show only stories created by current user
          fetchedStories = fetchedStories.filter(story => story.userId === user.uid);
        }
        
        setStories(fetchedStories);
      } catch (err) {
        console.error('Error fetching stories:', err);
        setError('Failed to load stories. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    if (user?.uid) {
      fetchStories();
    }
  }, [user, childFilter, statusFilter]);
  
  // Apply filters and search to stories
  useEffect(() => {
    if (!stories.length) {
      setFilteredStories([]);
      return;
    }
    
    let result = [...stories];
    
    // Apply status filter (only if not already filtered at fetch level)
    if (childFilter === 'general' && (statusFilter === 'drafts' || statusFilter === 'published')) {
      // Already filtered at fetch level, no need to filter again
    } else {
      // Apply client-side filtering
      if (statusFilter === 'favorites') {
        result = result.filter(story => story.isFavorite);
      } else if (statusFilter === 'published') {
        result = result.filter(story => story.isPublished);
      } else if (statusFilter === 'drafts') {
        result = result.filter(story => !story.isPublished);
      }
    }
    
    // Apply search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        story => 
          story.title?.toLowerCase().includes(term) || 
          story.content?.toLowerCase().includes(term) ||
          story.excerpt?.toLowerCase().includes(term)
      );
    }
    
    // Sort by creation date (most recent first)
    result.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
      return dateB - dateA;
    });
    
    setFilteredStories(result);
  }, [stories, statusFilter, searchTerm, childFilter]);
  
  // Redirect if not authenticated or not a parent
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'parent')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);
  
  /**
   * Handle child filter change
   * 
   * @param {string} value - Child filter value
   */
  const handleChildFilterChange = (value) => {
    setChildFilter(value);
    
    // If selecting a child, also set as active child
    if (value !== 'all' && value !== 'general' && children) {
      const selectedChild = children.find(child => child.id === value);
      if (selectedChild) {
        switchActiveChild(value);
      }
    }
  };
  
  /**
   * Handle status filter change
   * 
   * @param {string} value - Status filter value
   */
  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
  };
  
  /**
   * Handle edit story
   * 
   * @param {string} storyId - ID of story to edit
   */
  const handleEditStory = (storyId) => {
    router.push(`/edit-story/${storyId}`);
  };
  
  /**
   * Handle play story
   * 
   * @param {string} storyId - ID of story to play
   */
  const handlePlayStory = (storyId) => {
    router.push(`/play-story/${storyId}`);
  };
  
  /**
   * Handle delete story
   * 
   * @param {string} storyId - ID of story to delete
   */
  const handleDeleteStory = async (storyId) => {
    if (!storyId || isDeleting) return;
    
    if (window.confirm('Are you sure you want to delete this story? This action cannot be undone.')) {
      try {
        setIsDeleting(true);
        setError(null);
        
        await deleteStory(storyId);
        
        // Update local state
        setStories(prevStories => prevStories.filter(story => story.id !== storyId));
        
      } catch (err) {
        console.error('Error deleting story:', err);
        setError('Failed to delete the story. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };
  
  /**
   * Handle favorite toggle
   * 
   * @param {string} storyId - ID of story to toggle favorite
   * @param {boolean} isFavorite - Current favorite status
   */
  const handleToggleFavorite = async (storyId, isFavorite) => {
    if (!storyId) return;
    
    try {
      setError(null);
      
      await toggleStoryFavorite(storyId, !isFavorite);
      
      // Update local state
      setStories(prevStories => 
        prevStories.map(story => 
          story.id === storyId ? { ...story, isFavorite: !isFavorite } : story
        )
      );
      
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setError('Failed to update favorite status. Please try again.');
    }
  };
  
  /**
   * Handle create new story
   */
  const handleCreateStory = () => {
    router.push('/create-story');
  };
  
  /**
   * Clear all filters
   */
  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setChildFilter('all');
  };
  
  // Show loading state while checking authentication
  if (authLoading || loading) {
    return <LoadingSpinner fullScreen message="Loading your stories..." />;
  }
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h1 className="text-3xl font-bold text-indigo-800 mb-4 md:mb-0">My Stories</h1>
            
            <Button variant="primary" onClick={handleCreateStory}>
              Create New Story
            </Button>
          </div>
          
          {/* FIXED: Child filter options with proper labels */}
          <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Show stories:
              </label>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleChildFilterChange('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                  ${childFilter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
              >
                All My Stories
              </button>
              
              <button
                onClick={() => handleChildFilterChange('general')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                  ${childFilter === 'general'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
              >
                General Stories
              </button>
              
              {children && children.length > 0 && children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => handleChildFilterChange(child.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                    ${childFilter === child.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                >
                  For {child.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Search and filter section */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-grow">
                <input
                  type="text"
                  placeholder="Search your stories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="flex-shrink-0 flex space-x-2">
                <button
                  onClick={() => handleStatusFilterChange('all')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => handleStatusFilterChange('favorites')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    statusFilter === 'favorites'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Favourites
                </button>
                <button
                  onClick={() => handleStatusFilterChange('published')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    statusFilter === 'published'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Published
                </button>
                <button
                  onClick={() => handleStatusFilterChange('drafts')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    statusFilter === 'drafts'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Drafts
                </button>
              </div>
            </div>
          </div>
          
          {/* Error message */}
          {error && (
            <ErrorMessage message={error} />
          )}
          
          {/* Loading indicator for delete operation */}
          {isDeleting && (
            <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
              Deleting story...
            </div>
          )}
          
          {/* Story grid */}
          {filteredStories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStories.map((story) => {
                if (!story || !story.id) return null;
                
                return (
                  <StoryCard
                    key={story.id}
                    story={story}
                    showControls={true}
                    onEdit={() => handleEditStory(story.id)}
                    onPlay={() => handlePlayStory(story.id)}
                    onDelete={() => handleDeleteStory(story.id)}
                    onFavorite={() => handleToggleFavorite(story.id, story.isFavorite)}
                    childName={story.childId && children ? children.find(c => c.id === story.childId)?.name : null}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center p-12 bg-white rounded-lg shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-indigo-300 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              
              {searchTerm || statusFilter !== 'all' || childFilter !== 'all' ? (
                <>
                  <h2 className="text-2xl font-bold text-gray-700 mb-2">No Stories Found</h2>
                  <p className="text-gray-600 mb-6">
                    {childFilter === 'all'
                      ? "Try adjusting your search or filters to find what you're looking for."
                      : childFilter === 'general'
                      ? `You haven't created any ${statusFilter === 'drafts' ? 'draft' : statusFilter === 'published' ? 'published' : ''} general stories matching these filters yet.`
                      : `No stories found for ${children?.find(c => c.id === childFilter)?.name || 'this child'} matching these filters.`}
                  </p>
                  <Button
                    variant="secondary"
                    onClick={handleClearFilters}
                  >
                    Clear All Filters
                  </Button>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-700 mb-2">No Stories Found</h2>
                  <p className="text-gray-600 mb-6">
                    {childFilter === 'all'
                      ? "You haven't created any stories yet."
                      : childFilter === 'general'
                      ? "You haven't created any general stories yet."
                      : `No stories found for ${children?.find(c => c.id === childFilter)?.name || 'this child'}.`}
                  </p>
                  <Button variant="primary" onClick={handleCreateStory}>
                    Create Your First Story
                  </Button>
                </>
              )}
            </div>
          )}
        </main>
        
        <Footer />
      </div>
    </ProtectedRoute>
  );
}