import React, { JSX, useState } from 'react';

type Story = {
  id: string;
  title: string;
  createdAt: Date | { seconds: number; nanoseconds: number };
  coverImage?: string;
  coverImageUrl?: string; // ✅ Campo adicional comum
  imageUrl?: string; // ✅ Outro campo possível
  audioUrl?: string;
};

type KidStoryCardProps = {
  story: Story;
  onClick: () => void;
};

/**
 * Kid-friendly story card component with improved image handling
 * 
 * @param {Object} props - Component props
 * @param {Story} props.story - Story data to display
 * @param {Function} props.onClick - Click handler for the card
 * @returns {JSX.Element} Kid-friendly story card component
 */
const KidStoryCard = ({ story, onClick }: KidStoryCardProps): JSX.Element => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // ✅ MELHORADO: Verificar múltiplos campos possíveis para imagem
  const getImageUrl = (): string | null => {
    // Tentar diferentes campos onde a imagem pode estar
    const possibleFields = [
      story.coverImage,
      story.coverImageUrl, 
      story.imageUrl
    ];
    
    for (const field of possibleFields) {
      if (field && typeof field === 'string' && field.trim() !== '') {
        return field.trim();
      }
    }
    
    return null;
  };
  
  const imageUrl = getImageUrl();
  
  // ✅ DEBUG: Log da imagem (remover depois)
  React.useEffect(() => {
    console.log('🖼️ KidStoryCard Debug:', {
      title: story.title,
      coverImage: story.coverImage,
      coverImageUrl: story.coverImageUrl,
      imageUrl: story.imageUrl,
      finalImageUrl: imageUrl,
      hasImage: !!imageUrl
    });
  }, [story, imageUrl]);
  
  // ✅ Handle image load error
  const handleImageError = () => {
    console.warn('🖼️ Image failed to load:', imageUrl);
    setImageError(true);
  };
  
  // ✅ Handle image load success
  const handleImageLoad = () => {
    console.log('🖼️ Image loaded successfully:', imageUrl);
    setImageLoaded(true);
  };
  
  // ✅ Determine if we should show image or fallback
  const shouldShowImage = imageUrl && !imageError;
  
  return (
    <div 
      className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-indigo-300 hover:border-indigo-500 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
      onClick={onClick}
    >
      {/* Cover image or default image with improved handling */}
      <div className="relative h-48 bg-indigo-100">
        {shouldShowImage ? (
          <>
            {/* ✅ Loading spinner while image loads */}
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-indigo-200">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
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
              loading="lazy" // ✅ Lazy loading para performance
            />
          </>
        ) : (
          // ✅ MELHORADO: Fallback mais bonito e informativo
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-r from-indigo-400 to-purple-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-white mb-2"
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
            <p className="text-white text-sm opacity-75">Story Image</p>
            {/* ✅ DEBUG: Mostrar por que não tem imagem (remover depois) */}
            {process.env.NODE_ENV === 'development' && (
              <p className="text-white text-xs mt-1 opacity-50">
                {imageError ? 'Image failed' : 'No image URL'}
              </p>
            )}
          </div>
        )}
        
        {/* Play button overlay - só mostra se tem áudio */}
        {story.audioUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 opacity-0 hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white rounded-full p-3 shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-indigo-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        )}
        
        {/* ✅ NOVO: Indicador de áudio no canto */}
        {story.audioUrl && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.776l-4.146-3.32a1 1 0 00-.632-.224H2a1 1 0 01-1-1V7.5a1 1 0 011-1h1.605a1 1 0 00.632-.224l4.146-3.32a1 1 0 011.617.776zM14.657 5.343a1 1 0 011.414 0 9.972 9.972 0 010 14.314 1 1 0 11-1.414-1.414 7.971 7.971 0 000-11.486 1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span>🎧</span>
          </div>
        )}
      </div>
      
      {/* Story title with fun styling */}
      <div className="p-4 text-center">
        <h3 className="text-xl font-bold text-indigo-700 mb-1 line-clamp-2">
          {story.title}
        </h3>
        <p className="text-indigo-500 text-sm">
          {story.audioUrl ? 'Click to listen!' : 'Click to read!'}
        </p>
      </div>
    </div>
  );
};

export default KidStoryCard;