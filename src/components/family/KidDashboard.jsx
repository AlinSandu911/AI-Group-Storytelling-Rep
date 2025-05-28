'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getStoriesByChildId } from '@/firebase/firestore';
import KidStoryCard from '@/components/common/KidStoryCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';

/**
 * Kid-friendly dashboard component
 * 
 * @param {Object} props
 * @param {string} props.childId - Child ID to show stories for
 * @returns {JSX.Element} Kid dashboard component
 */
export default function KidDashboard({ childId }) {
  const { user } = useAuth();
  const router = useRouter();
  
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch stories for this child
  useEffect(() => {
    async function fetchStories() {
      if (!childId) return;
      
      try {
        setLoading(true);
        const childStories = await getStoriesByChildId(childId);
        setStories(childStories);
      } catch (err) {
        console.error('Error fetching stories:', err);
        setError('Could not load your stories. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchStories();
  }, [childId]);
  
  // Handle story click
  const handleStoryClick = (storyId) => {
    router.push(`/kid/story/${storyId}`);
  };
  
  if (loading) {
    return <LoadingSpinner message="Loading your stories..." />;
  }
  
  return (
    <div className="py-6">
      <h1 className="text-3xl font-bold text-center text-indigo-600 mb-8">
        Your Stories
      </h1>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {stories.length === 0 ? (
        <div className="text-center p-10 bg-indigo-50 rounded-xl shadow-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-indigo-400 mx-auto mb-4"
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
          <h2 className="text-2xl font-bold text-indigo-700 mb-2">No Stories Yet</h2>
          <p className="text-indigo-600">
            Ask your parents to create some amazing stories for you!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <KidStoryCard
              key={story.id}
              story={story}
              onClick={() => handleStoryClick(story.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}