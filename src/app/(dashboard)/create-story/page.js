'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useFamily } from '@/contexts/FamilyContext';
import useAIStoryGeneration from '@/hooks/useAIStoryGeneration';
import useTextToSpeech from '@/hooks/useTextToSpeech';
import useImageGeneration from '@/hooks/useImageGeneration';
import { createStoryForChild } from '@/firebase/firestore';
import { extractTitleFromText, generateExcerpt } from '@/utils/helpers';
import { STORY_THEMES, STORY_MOODS, AGE_GROUPS, STORY_LENGTHS, VOICE_OPTIONS, API_CONFIGS } from '@/utils/constants';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import SuccessMessage from '@/components/common/SuccessMessage';
import ChildSelector from '@/components/family/ChildSelector';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

/**
 * FIXED: User-specific localStorage functions
 */
const getUserSpecificKey = (userId, baseKey) => {
  return userId ? `${baseKey}_${userId}` : baseKey;
};

const loadUserDraft = (userId) => {
  if (!userId) return null;
  try {
    const key = getUserSpecificKey(userId, 'draft_story');
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Error loading user draft:', error);
    return null;
  }
};

const saveUserDraft = (userId, draftData) => {
  if (!userId) return;
  try {
    const key = getUserSpecificKey(userId, 'draft_story');
    localStorage.setItem(key, JSON.stringify(draftData));
  } catch (error) {
    console.error('Error saving user draft:', error);
  }
};

const removeUserDraft = (userId) => {
  if (!userId) return;
  try {
    const key = getUserSpecificKey(userId, 'draft_story');
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing user draft:', error);
  }
};

/**
 * Create Story page component with user-specific draft handling
 * 
 * @returns {JSX.Element} Create Story page
 */
export default function CreateStory() {
  // Auth state
  const { user, loading: authLoading } = useAuth();
  const { children, activeChild } = useFamily();
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    prompt: '',
    age: AGE_GROUPS.PRESCHOOL,
    length: STORY_LENGTHS.MEDIUM,
    characters: '',
    setting: '',
    mood: STORY_MOODS[0],
    voice: VOICE_OPTIONS[0].id,
    isPublished: true,
    childId: null,
    imageUrl: null,
  });
  
  // UI state
  const [activeTab, setActiveTab] = useState('write');
  const [isDraft, setIsDraft] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Hooks for AI and TTS functionality
  const { 
    generateStory, 
    generateTitle, 
    generateSuggestion,
    loading: aiLoading, 
    error: aiError 
  } = useAIStoryGeneration();
  
  const {
    convertTextToSpeech,
    loading: ttsLoading,
    error: ttsError,
    progress: ttsProgress
  } = useTextToSpeech({
    apiKey: API_CONFIGS.TTS.KEY,
    apiEndpoint: API_CONFIGS.TTS.ENDPOINT
  });

  const {
    generateStoryImage,
    loading: imageLoading,
    error: imageError
  } = useImageGeneration();

  // FIXED: Load draft specific to current user when user changes
  useEffect(() => {
    if (!user?.uid) return;
    
    // Clear previous draft state
    setIsDraft(false);
    
    // Load draft for current user
    const savedDraft = loadUserDraft(user.uid);
    if (savedDraft) {
      console.log('Loading draft for user:', user.uid);
      setFormData(prevData => ({
        ...prevData,
        ...savedDraft
      }));
      setIsDraft(true);
    } else {
      // Reset form to defaults if no draft exists
      setFormData({
        title: '',
        content: '',
        prompt: '',
        age: AGE_GROUPS.PRESCHOOL,
        length: STORY_LENGTHS.MEDIUM,
        characters: '',
        setting: '',
        mood: STORY_MOODS[0],
        voice: VOICE_OPTIONS[0].id,
        isPublished: true,
        childId: null,
        imageUrl: null,
      });
    }
  }, [user?.uid]);
  
  // Set active child when available
  useEffect(() => {
    if (activeChild && user?.uid) {
      setFormData(prevData => ({
        ...prevData,
        childId: activeChild.id,
        age: activeChild.age && AGE_GROUPS[activeChild.age.toUpperCase()] 
          ? AGE_GROUPS[activeChild.age.toUpperCase()] 
          : prevData.age
      }));
    }
  }, [activeChild, user?.uid]);
  
  // Redirect if not authenticated or not a parent
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'parent')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);
  
  /**
   * FIXED: Handle input changes with user-specific storage
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    
    setFormData(updatedData);
    setFormError(null);
    
    // Save to user-specific localStorage
    if (user?.uid) {
      saveUserDraft(user.uid, updatedData);
      setIsDraft(true);
    }
  };
  
  /**
   * FIXED: Handle child selection with user-specific storage
   */
  const handleChildSelect = (childId) => {
    const updatedData = { ...formData, childId };
    
    setFormData(updatedData);
    
    // Save to user-specific localStorage
    if (user?.uid) {
      saveUserDraft(user.uid, updatedData);
      setIsDraft(true);
    }
  };
  
  /**
   * Handle story generation
   */
  const handleGenerateStory = async () => {
    try {
      setFormError(null);
      
      if (!formData.prompt.trim()) {
        setFormError('Please enter a prompt for the story.');
        return;
      }
      
      const generatedStory = await generateStory({
        prompt: formData.prompt,
        age: formData.age,
        length: formData.length,
        characters: formData.characters ? formData.characters.split(',').map(c => c.trim()) : [],
        setting: formData.setting,
        mood: formData.mood
      });
      
      const { title, content } = extractTitleFromText(generatedStory);
      
      const updatedData = {
        ...formData,
        title: title || formData.title,
        content: content || generatedStory
      };
      
      setFormData(updatedData);
      
      // Save to user-specific localStorage
      if (user?.uid) {
        saveUserDraft(user.uid, updatedData);
        setIsDraft(true);
      }
      
      setActiveTab('preview');
    } catch (error) {
      console.error('Error generating story:', error);
      setFormError('Failed to generate story. Please try again.');
    }
  };
  
  /**
   * Handle title generation
   */
  const handleGenerateTitle = async () => {
    try {
      setFormError(null);
      
      if (!formData.content.trim()) {
        setFormError('Please write or generate a story first.');
        return;
      }
      
      const title = await generateTitle(formData.content);
      
      const updatedData = { ...formData, title };
      setFormData(updatedData);
      
      // Save to user-specific localStorage
      if (user?.uid) {
        saveUserDraft(user.uid, updatedData);
        setIsDraft(true);
      }
    } catch (error) {
      console.error('Error generating title:', error);
      setFormError('Failed to generate title. Please try again.');
    }
  };

  /**
   * Handle story suggestion/continuation
   */
  const handleGenerateSuggestion = async () => {
    try {
      setFormError(null);
      
      if (!formData.content.trim()) {
        setFormError('Please write some story content first to get a suggestion.');
        return;
      }
      
      const suggestion = await generateSuggestion(formData.content);
      const updatedContent = formData.content + '\n\n' + suggestion;
      
      const updatedData = { ...formData, content: updatedContent };
      setFormData(updatedData);
      
      // Save to user-specific localStorage
      if (user?.uid) {
        saveUserDraft(user.uid, updatedData);
        setIsDraft(true);
      }
    } catch (error) {
      console.error('Error generating suggestion:', error);
      setFormError('Failed to generate suggestion. Please try again.');
    }
  };

  /**
   * Handle image generation for story
   */
  const handleGenerateImage = async () => {
    try {
      setFormError(null);
      
      if (!formData.content.trim() && !formData.prompt.trim()) {
        setFormError('Please write story content or enter a prompt first.');
        return;
      }
      
      const imageUrl = await generateStoryImage({
        storyText: formData.content,
        prompt: formData.prompt || "Main scene from the story",
        characters: formData.characters,
        setting: formData.setting,
        mood: formData.mood
      });
      
      const updatedData = { ...formData, imageUrl };
      setFormData(updatedData);
      
      // Save to user-specific localStorage
      if (user?.uid) {
        saveUserDraft(user.uid, updatedData);
        setIsDraft(true);
      }
    } catch (error) {
      console.error('Error generating image:', error);
      setFormError('Failed to generate image. Please try again.');
    }
  };
  
  /**
   * FIXED: Handle story submission with user-specific cleanup
   */
  const handleSubmit = async (publish = true) => {
    try {
      setIsSubmitting(true);
      setSaveSuccess(false);
      setFormError(null);
  
      if (!formData.title.trim()) {
        setFormError('Please enter a title for your story.');
        return;
      }
  
      if (!formData.content.trim()) {
        setFormError('Please write or generate story content.');
        return;
      }
  
      // Generate audio if needed
      let audioUrl = null;
      if (!ttsLoading) {
        try {
          const selectedVoice = VOICE_OPTIONS.find(v => v.id === formData.voice);
          if (!selectedVoice) {
            throw new Error(`Voice "${formData.voice}" not found in VOICE_OPTIONS`);
          }
  
          audioUrl = await convertTextToSpeech({
            text: formData.content,
            voice: formData.voice,
            storyId: Date.now().toString(),
            userId: user.uid
          });
        } catch (ttsError) {
          console.error('TTS conversion failed:', ttsError.message || ttsError);
          setFormError('Text-to-Speech failed. Story will be saved without audio.');
        }
      }
  
      // Create story data object
      const storyData = {
        title: formData.title,
        content: formData.content,
        excerpt: generateExcerpt(formData.content, 150),
        userId: user.uid,
        familyId: user.familyId,
        audioUrl: audioUrl || null,
        imageUrl: formData.imageUrl || null,
        isPublished: publish,
        age: formData.age,
        length: formData.length,
        theme: formData.prompt,
        characters: formData.characters ? formData.characters.split(',').map(c => c.trim()) : [],
        setting: formData.setting,
        mood: formData.mood,
        voice: formData.voice,
        isFavorite: false
      };
  
      // Save with child ID if selected
      await createStoryForChild(storyData, formData.childId);
  
      // FIXED: Clear user-specific draft
      if (user?.uid) {
        removeUserDraft(user.uid);
      }
      
      setIsDraft(false);
      setSaveSuccess(true);
  
      // Redirect after success
      if (publish) {
        setTimeout(() => {
          router.push('/my-stories');
        }, 1500);
      }
    } catch (error) {
      console.error('Error saving story:', error);
      setFormError('Failed to save story. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Show loading state while checking authentication
  if (authLoading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-indigo-800 mb-6">Create a New Story</h1>
          
          {/* Child Selector */}
          {children && children.length > 0 && (
            <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
              <ChildSelector onSelect={handleChildSelect} />
            </div>
          )}
          
          {/* Tab navigation */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex -mb-px">
              <button
                className={`mr-1 py-2 px-4 text-center ${
                  activeTab === 'write'
                    ? 'border-b-2 border-indigo-500 text-indigo-600 font-medium'
                    : 'text-gray-600 hover:text-gray-800 hover:border-gray-300 border-b-2 border-transparent'
                }`}
                onClick={() => setActiveTab('write')}
              >
                Write a Story
              </button>
              <button
                className={`mr-1 py-2 px-4 text-center ${
                  activeTab === 'generate'
                    ? 'border-b-2 border-indigo-500 text-indigo-600 font-medium'
                    : 'text-gray-600 hover:text-gray-800 hover:border-gray-300 border-b-2 border-transparent'
                }`}
                onClick={() => setActiveTab('generate')}
              >
                AI Generate
              </button>
              {(formData.content || formData.title) && (
                <button
                  className={`mr-1 py-2 px-4 text-center ${
                    activeTab === 'preview'
                      ? 'border-b-2 border-indigo-500 text-indigo-600 font-medium'
                      : 'text-gray-600 hover:text-gray-800 hover:border-gray-300 border-b-2 border-transparent'
                  }`}
                  onClick={() => setActiveTab('preview')}
                >
                  Preview
                </button>
              )}
            </div>
          </div>
          
          {/* Error and success messages */}
          {formError && <ErrorMessage message={formError} />}
          {aiError && <ErrorMessage message={aiError} />}
          {ttsError && <ErrorMessage message={ttsError} />}
          {imageError && <ErrorMessage message={imageError} />}
          {saveSuccess && <SuccessMessage message="Story saved successfully!" />}
          {isDraft && (
            <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
              You have a draft story saved. Continue editing or save it when ready.
            </div>
          )}
          
          {activeChild && (
            <div className="mb-4 p-2 bg-indigo-50 border border-indigo-200 rounded text-sm text-indigo-700">
              Creating story for: <span className="font-semibold">{activeChild.name}</span>
            </div>
          )}
          
          {/* Write story tab */}
          {activeTab === 'write' && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Story Title
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Once Upon a Time..."
                  />
                  <button
                    type="button"
                    onClick={handleGenerateTitle}
                    disabled={!formData.content || aiLoading}
                    className="ml-2 px-3 py-2 border border-indigo-300 text-indigo-700 rounded-md hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {aiLoading ? 'Generating...' : 'Generate Title'}
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  Story Content
                </label>
                <div className="relative">
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    rows="12"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Write your story here..."
                  ></textarea>
                  
                  {/* Suggestion button inside textarea area */}
                  {formData.content.trim() && (
                    <div className="absolute bottom-2 right-2">
                      <button
                        type="button"
                        onClick={handleGenerateSuggestion}
                        disabled={aiLoading || !formData.content.trim()}
                        className="px-3 py-1 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        title="Generate continuation for your story"
                      >
                        {aiLoading ? '...' : '+ Suggest More'}
                      </button>
                    </div>
                  )}
                </div>
                
                {/* AI Helper buttons below textarea */}
                <div className="flex justify-start space-x-2 mt-2">
                  <button
                    type="button"
                    onClick={handleGenerateSuggestion}
                    disabled={aiLoading || !formData.content.trim()}
                    className="px-3 py-1 text-xs border border-indigo-300 text-indigo-700 rounded-md hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {aiLoading ? 'Generating...' : '✨ Continue Story'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleGenerateImage}
                    disabled={imageLoading || (!formData.content.trim() && !formData.prompt.trim())}
                    className="px-3 py-1 text-xs border border-green-300 text-green-700 rounded-md hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {imageLoading ? 'Generating...' : '🎨 Generate Image'}
                  </button>
                  
                  <span className="text-xs text-gray-500 self-center">
                    AI can help continue your story and create illustrations
                  </span>
                </div>
              </div>

              {/* Generated Image Preview */}
              {formData.imageUrl && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Generated Illustration
                  </label>
                  <div className="relative">
                    <img 
                      src={formData.imageUrl} 
                      alt="Generated story illustration" 
                      className="w-full max-w-md rounded-lg shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updatedData = { ...formData, imageUrl: null };
                        setFormData(updatedData);
                        if (user?.uid) {
                          saveUserDraft(user.uid, updatedData);
                        }
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
              
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
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="secondary"
                  onClick={() => handleSubmit(false)}
                  disabled={isSubmitting || ttsLoading}
                >
                  Save as Draft
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleSubmit(true)}
                  disabled={isSubmitting || ttsLoading}
                >
                  {isSubmitting || ttsLoading ? (
                    <>
                      <span className="mr-2">Saving{ttsLoading ? ' & Converting to Audio' : ''}</span>
                      {ttsLoading && <span>{ttsProgress}%</span>}
                    </>
                  ) : (
                    'Publish Story'
                  )}
                </Button>
              </div>
            </div>
          )}
          
          {/* AI Generate tab */}
          {activeTab === 'generate' && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="mb-4">
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
                  Story Prompt or Theme
                </label>
                <textarea
                  id="prompt"
                  name="prompt"
                  value={formData.prompt}
                  onChange={handleChange}
                  rows="3"
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter a brief description of what your story should be about..."
                ></textarea>
                <p className="mt-1 text-xs text-gray-500">
                  Be specific about the theme, lessons, or elements you want to include.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                    Target Age Group
                  </label>
                  <select
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {Object.entries(AGE_GROUPS).map(([key, value]) => (
                      <option key={key} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="length" className="block text-sm font-medium text-gray-700 mb-1">
                    Story Length
                  </label>
                  <select
                    id="length"
                    name="length"
                    value={formData.length}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {Object.entries(STORY_LENGTHS).map(([key, value]) => (
                      <option key={key} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="characters" className="block text-sm font-medium text-gray-700 mb-1">
                    Main Characters (optional)
                  </label>
                  <input
                    type="text"
                    id="characters"
                    name="characters"
                    value={formData.characters}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="E.g., A brave mouse, friendly dragon"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Separate multiple characters with commas.
                  </p>
                </div>
                
                <div>
                  <label htmlFor="setting" className="block text-sm font-medium text-gray-700 mb-1">
                    Story Setting (optional)
                  </label>
                  <input
                    type="text"
                    id="setting"
                    name="setting"
                    value={formData.setting}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="E.g., Enchanted forest, space station"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="mood" className="block text-sm font-medium text-gray-700 mb-1">
                  Story Mood/Tone
                </label>
                <select
                  id="mood"
                  name="mood"
                  value={formData.mood}
                  onChange={handleChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {STORY_MOODS.map(mood => (
                    <option key={mood} value={mood}>
                      {mood}
                    </option>
                  ))}
                </select>
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
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="secondary"
                  onClick={handleGenerateImage}
                  disabled={imageLoading || !formData.prompt.trim()}
                >
                  {imageLoading ? 'Generating Image...' : '🎨 Generate Image'}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleGenerateStory}
                  disabled={aiLoading || !formData.prompt}
                >
                  {aiLoading ? 'Generating Story...' : 'Generate Story'}
                </Button>
              </div>
            </div>
          )}
          
          {/* Preview tab */}
          {activeTab === 'preview' && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="mb-6 border-b border-gray-200 pb-4">
                <h2 className="text-2xl font-bold text-indigo-800">{formData.title || 'Untitled Story'}</h2>
                
                {activeChild && (
                  <p className="text-sm text-indigo-600 mt-2">
                    For: {activeChild.name}
                  </p>
                )}
              </div>

              {/* Story Image */}
              {formData.imageUrl && (
                <div className="mb-6">
                  <img 
                    src={formData.imageUrl} 
                    alt="Story illustration" 
                    className="w-full max-w-lg mx-auto rounded-lg shadow-md"
                  />
                </div>
              )}
              
              <div className="prose max-w-none mb-8">
                {formData.content.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              
              <div className="flex justify-between mt-6">
                <Button
                  variant="secondary"
                  onClick={() => setActiveTab(activeTab === 'generate' ? 'generate' : 'write')}
                >
                  Edit Story
                </Button>
                <div className="space-x-3">
                  <Button
                    variant="secondary"
                    onClick={() => handleSubmit(false)}
                    disabled={isSubmitting || ttsLoading}
                  >
                    Save as Draft
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => handleSubmit(true)}
                    disabled={isSubmitting || ttsLoading}
                  >
                    {isSubmitting || ttsLoading ? (
                      <>
                        <span className="mr-2">Saving{ttsLoading ? ' & Converting to Audio' : ''}</span>
                        {ttsLoading && <span>{ttsProgress}%</span>}
                      </>
                    ) : (
                      'Publish Story'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
        
        <Footer />
      </div>
    </ProtectedRoute>
  );
}