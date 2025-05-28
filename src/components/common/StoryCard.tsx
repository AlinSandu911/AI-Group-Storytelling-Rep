import React, { JSX, useState } from 'react';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';

type Story = {
  id: string;
  title: string;
  createdAt: Date | { seconds: number; nanoseconds: number };
  coverImage?: string;
  coverImageUrl?: string;
  imageUrl?: string;
  audioUrl?: string;
  isFavorite?: boolean;
  excerpt?: string;
};

type StoryCardProps = {
  story: Story;
  showControls?: boolean;
  onEdit?: () => void;
  onPlay?: () => void;
  onDelete?: () => void;
  onFavorite?: () => void;
};

/**
 * Story card component with improved image handling
 */
const StoryCard = ({
  story,
  showControls = false,
  onEdit,
  onPlay,
  onDelete,
  onFavorite,
}: StoryCardProps): JSX.Element => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Get image URL from multiple possible fields
  const getImageUrl = (): string | null => {
    const possibleFields = [
      story.coverImage,
      story.coverImageUrl,
      story.imageUrl,
    ];
    
    for (const field of possibleFields) {
      if (field && typeof field === 'string' && field.trim() !== '') {
        return field.trim();
      }
    }
    
    return null;
  };

  const imageUrl = getImageUrl();

  // Format creation date
  const getFormattedDate = () => {
    try {
      // Handle Firestore timestamp object
      if (typeof story.createdAt === 'object' && 'seconds' in story.createdAt) {
        return formatDistanceToNow(new Date(story.createdAt.seconds * 1000), { addSuffix: true });
      }
      // Handle Date object
      return formatDistanceToNow(new Date(story.createdAt), { addSuffix: true });
    } catch (error) {
      return 'Date unknown';
    }
  };

  // Handle image errors
  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const shouldShowImage = imageUrl && !imageError;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300">
      {/* Cover image with improved handling */}
      <div className="relative h-40 bg-indigo-100">
        {shouldShowImage ? (
          <>
            {/* Loading indicator */}
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-indigo-50">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              </div>
            )}
            
            <img
              src={imageUrl}
              alt={story.title}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onError={handleImageError}
              onLoad={handleImageLoad}
              loading="lazy"
            />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-indigo-300 mb-2"
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
            <p className="text-indigo-400 text-xs">No Image</p>
          </div>
        )}
        
        {/* Favorite badge */}
        {story.isFavorite && (
          <div className="absolute top-2 right-2">
            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
              ⭐ Favorite
            </span>
          </div>
        )}

        {/* Audio indicator */}
        {story.audioUrl && (
          <div className="absolute top-2 left-2">
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.776l-4.146-3.32a1 1 0 00-.632-.224H2a1 1 0 01-1-1V7.5a1 1 0 011-1h1.605a1 1 0 00.632-.224l4.146-3.32a1 1 0 011.617.776zM14.657 5.343a1 1 0 011.414 0 9.972 9.972 0 010 14.314 1 1 0 11-1.414-1.414 7.971 7.971 0 000-11.486 1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span>🎧</span>
            </span>
          </div>
        )}
      </div>
      
      {/* Story details */}
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-1 truncate">
          {story.title}
        </h3>
        <p className="text-sm text-gray-500 mb-2">
          Created {getFormattedDate()}
        </p>
        
        {story.excerpt && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {story.excerpt}
          </p>
        )}
        
        {/* Action buttons */}
        {showControls && (
          <div className="flex items-center justify-between mt-3">
            <div className="flex space-x-2">
              {onPlay && (
                <button
                  onClick={onPlay}
                  className="flex items-center justify-center bg-indigo-100 text-indigo-700 p-2 rounded-full hover:bg-indigo-200 transition-colors"
                  title="Play story"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
              )}
              
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="flex items-center justify-center bg-gray-100 text-gray-700 p-2 rounded-full hover:bg-gray-200 transition-colors"
                  title="Edit story"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
              )}
              
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="flex items-center justify-center bg-gray-100 text-gray-700 p-2 rounded-full hover:bg-red-100 hover:text-red-700 transition-colors"
                  title="Delete story"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
            
            {onFavorite && (
              <button
                onClick={onFavorite}
                className={`flex items-center justify-center p-2 rounded-full transition-colors ${
                  story.isFavorite
                    ? 'text-yellow-500 hover:text-yellow-600'
                    : 'text-gray-400 hover:text-yellow-500'
                }`}
                title={story.isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryCard;