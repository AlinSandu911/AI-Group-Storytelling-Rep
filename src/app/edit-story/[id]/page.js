"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import useTextToSpeech from '@/hooks/useTextToSpeech';
import { getStoryById, updateStory } from '@/firebase/firestore';
import { VOICE_OPTIONS, API_CONFIGS } from '@/utils/constants';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import SuccessMessage from '@/components/common/SuccessMessage';


import { useParams } from 'next/navigation';

export default function EditStoryPage() {
  const { id } = useParams();




  // State
  const [story, setStory] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    voice: '',
    isPublished: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regenerateAudio, setRegenerateAudio] = useState(false);
  
  // Hooks
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // TTS hook
  const {
    convertTextToSpeech,
    loading: ttsLoading,
    error: ttsError,
    progress: ttsProgress
  } = useTextToSpeech({
    apiKey: API_CONFIGS.TTS.KEY,
    apiEndpoint: API_CONFIGS.TTS.ENDPOINT
  });
  
  // Fetch story data
  useEffect(() => {
    const fetchStory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const storyData = await getStoryById(id);
        
        if (!storyData) {
          setError('Story not found.');
          setLoading(false);
          return;
        }
        
        // Check if user is the owner of the story
        if (storyData.userId !== user?.uid) {
          setError('You do not have permission to edit this story.');
          setLoading(false);
          return;
        }
        
        setStory(storyData);
        setFormData({
          title: storyData.title || '',
          content: storyData.content || '',
          voice: storyData.voice || VOICE_OPTIONS[0].id,
          isPublished: storyData.isPublished !== undefined ? storyData.isPublished : true,
        });
      } catch (err) {
        console.error('Error fetching story:', err);
        setError('Failed to load the story. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id && user) {
      fetchStory();
    }
  }, [id, user]);
  
  // Check auth
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'parent')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);
  
  /**
   * Handle input changes
   * 
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // If voice is changed, set regenerateAudio to true
    if (name === 'voice' && value !== story.voice) {
      setRegenerateAudio(true);
    }
    
    // If content is changed and is significantly different, set regenerateAudio to true
    if (name === 'content' && story && Math.abs(value.length - story.content.length) > 50) {
      setRegenerateAudio(true);
    }
    
    // Clear any errors when user makes changes
    setError(null);
    setSaveSuccess(false);
  };
  
  /**
   * Handle checkbox changes
   * 
   * @param {Event} e - Checkbox change event
   */
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
    
    // Clear any errors when user makes changes
    setError(null);
    setSaveSuccess(false);
  };
  
  /**
   * Handle form submission
   * 
   * @param {Event} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setSaveSuccess(false);
      setError(null);
      
      // Validate form data
      if (!formData.title.trim()) {
        setError('Please enter a title for your story.');
        setIsSubmitting(false);
        return;
      }
      
      if (!formData.content.trim()) {
        setError('Please enter content for your story.');
        setIsSubmitting(false);
        return;
      }
      
      // Prepare update data
      const updateData = {
        title: formData.title,
        content: formData.content,
        voice: formData.voice,
        isPublished: formData.isPublished,
      };
      
      // Generate new audio if needed
      if (regenerateAudio) {
        try {
          const audioUrl = await convertTextToSpeech({
            text: formData.content,
            voice: formData.voice,
            storyId: id,
            userId: user.uid
          });
          
          updateData.audioUrl = audioUrl;
        } catch (err) {
          console.error('Error converting text to speech:', err);
          // Continue without audio if TTS fails
        }
      }
      
      // Update story
      await updateStory(id, updateData);
      
      // Show success message
      setSaveSuccess(true);
      setRegenerateAudio(false);
      
      // Update local story state
      setStory(prev => ({
        ...prev,
        ...updateData
      }));
      
      // Navigate back to stories after a delay
      setTimeout(() => {
        router.push('/my-stories');
      }, 1500);
    } catch (err) {
      console.error('Error updating story:', err);
      setError('Failed to update the story. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Show loading state
  if (loading || authLoading) {
    return <LoadingSpinner fullScreen message="Loading story..." />;
  }
  
  // Show error message if story not found or user doesn't have permission
  if (error && !story) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="max-w-md w-full">
            <ErrorMessage message={error} />
            <div className="mt-4 text-center">
              <Link href="/my-stories" className="text-indigo-600 hover:text-indigo-500">
                Go back to my stories
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/my-stories" className="inline-flex items-center text-indigo-600 hover:text-indigo-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to My Stories
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-indigo-800 mb-6">Edit Story</h1>
        
        {/* Error and success messages */}
        {error && <ErrorMessage message={error} />}
        {ttsError && <ErrorMessage message={ttsError} />}
        {saveSuccess && <SuccessMessage message="Story updated successfully!" />}
        
        {regenerateAudio && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-700 text-sm">
              You've made significant changes to the story or changed the voice. A new audio file will be generated when you save.
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Story Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter a title for your story"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Story Content
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="12"
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Write your story here..."
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label htmlFor="voice" className="block text-sm font-medium text-gray-700 mb-1">
              Text-to-Speech Voice
            </label>
            <select
              id="voice"
              name="voice"
              value={formData.voice}
              onChange={handleChange}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              {VOICE_OPTIONS.map(voice => (
                <option key={voice.id} value={voice.id}>
                  {voice.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              This voice will be used when converting your story to audio.
            </p>
          </div>
          
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Publish this story (visible to children)
              </span>
            </label>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Link href="/my-stories">
              <Button variant="secondary" type="button">
                Cancel
              </Button>
            </Link>
            <Button
              variant="primary"
              type="submit"
              disabled={isSubmitting || ttsLoading}
            >
              {isSubmitting || ttsLoading ? (
                <>
                  <span className="mr-2">Saving{regenerateAudio && ttsLoading ? ' & Converting to Audio' : ''}</span>
                  {regenerateAudio && ttsLoading && <span>{ttsProgress}%</span>}
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </main>
      
      <Footer />
    </div>
  );
}