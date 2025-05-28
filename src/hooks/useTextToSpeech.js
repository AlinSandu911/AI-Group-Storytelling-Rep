import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/firebase/firebaseConfig';
import { VOICE_OPTIONS } from '@/utils/constants';

/**
 * Hook for text-to-speech conversion
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.apiKey - API key for the TTS service
 * @param {string} options.apiEndpoint - Endpoint URL for the TTS service
 * @returns {Object} Text-to-speech methods and state
 */
const useTextToSpeech = ({ apiKey, apiEndpoint }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  /**
   * Clean and normalize text for TTS (avoid special characters, emoji, limit length)
   * 
   * @param {string} text - Original story text
   * @returns {string} Sanitized and limited text
   */
  const cleanText = (text) => {
    return text
      .replace(/[\u2018\u2019\u201A\u201B]/g, "'") // aspas simples
      .replace(/[\u201C\u201D\u201E\u201F]/g, '"') // aspas duplas
      .replace(/[^\x00-\x7F]/g, '')               // remove emojis e caracteres especiais
      .slice(0, 4500);                            // limite seguro para Google TTS
  };

  /**
   * Convert story text to audio using Google Cloud TTS or similar service
   * 
   * @param {Object} params - TTS parameters
   * @param {string} params.text - Story text to convert
   * @param {string} params.voice - Voice type (e.g., 'en-US-Wavenet-D')
   * @param {string} params.storyId - ID of the story for file naming
   * @param {string} params.userId - ID of the user who owns the story
   * @returns {Promise<string>} URL to the generated audio file
   */
  const convertTextToSpeech = async ({ text, voice, storyId, userId }) => {
    setLoading(true);
    setError(null);
    setProgress(10);

    try {
      if (!text || !voice || !storyId || !userId) {
        throw new Error("Missing required parameters (text, voice, storyId, userId)");
      }

      const voiceMeta = VOICE_OPTIONS.find(v => v.id === voice);
      if (!voiceMeta) throw new Error(`Invalid voice ID: ${voice}`);

      const cleaned = cleanText(text);

      // Instead of using the external API directly, use our API route 
      // This will handle the API key and credentials securely on the server side
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: cleaned,
          voice: voice,
          languageCode: voiceMeta.languageCode
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.error("TTS API error detail:", errData);
        throw new Error(`TTS API error: ${response.status}`);
      }

      setProgress(50);

      const data = await response.json();
      
      // If our API route returns a signed URL directly (recommended approach)
      if (data.audioUrl) {
        setProgress(100);
        setLoading(false);
        return data.audioUrl;
      }
      
      // If our API returns base64 audio content that needs to be uploaded to Firebase
      const audioContent = data.audioContent;

      if (!audioContent) {
        throw new Error("No audio content returned by TTS API");
      }

      const byteCharacters = atob(audioContent);
      const byteArray = new Uint8Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArray[i] = byteCharacters.charCodeAt(i);
      }
      const blob = new Blob([byteArray], { type: 'audio/mp3' });

      setProgress(70);

      try {
        // Make sure the user is authenticated before trying to upload
        if (!userId) {
          throw new Error("User must be authenticated to upload audio files");
        }

        // Create a reference to the specific path in Firebase Storage
        const storageRef = ref(storage, `audio/${userId}/${storyId}.mp3`);
        
        // Log the storage path for debugging
        console.log(`Uploading to storage path: audio/${userId}/${storyId}.mp3`);
        
        // Upload the file with metadata that includes the user's ID
        await uploadBytes(storageRef, blob, {
          customMetadata: {
            userId: userId,
            storyId: storyId
          }
        });

        setProgress(90);

        // Get the download URL
        const downloadURL = await getDownloadURL(storageRef);
        
        console.log('Successfully uploaded and got download URL:', downloadURL);

        setProgress(100);

        return downloadURL;
      } catch (storageError) {
        console.error('Storage error:', storageError);
        
        // If we have storage permission issues, try to use the server API again
        // This is a fallback approach
        try {
          console.log('Attempting fallback to server-side storage...');
          
          // Call a server endpoint that can write to Firebase with admin privileges
          const serverResponse = await fetch('/api/upload-audio', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              audioContent: audioContent,
              userId: userId,
              storyId: storyId
            })
          });
          
          if (!serverResponse.ok) {
            throw new Error(`Server upload failed: ${serverResponse.status}`);
          }
          
          const data = await serverResponse.json();
          console.log('Successfully uploaded via server side:', data.downloadURL);
          return data.downloadURL;
        } catch (serverError) {
          console.error('Server upload fallback error:', serverError);
          throw new Error('Failed to upload audio after multiple attempts');
        }
      }
    } catch (err) {
      console.error('Error converting text to speech:', err);
      setError(err.message || 'Failed to convert text to speech. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Break long text into smaller chunks for TTS processing
   * (Some TTS services have character limits)
   * 
   * @param {string} text - Full story text
   * @returns {Array<string>} Array of text chunks
   */
  const splitTextIntoChunks = (text) => {
    // Maximum size for each chunk (Google limit is 5000 characters)
    const MAX_CHUNK_SIZE = 4500;
    const chunks = [];

    // Split by paragraphs first to maintain natural breaks
    const paragraphs = text.split(/\n+/);
    let currentChunk = '';

    for (const paragraph of paragraphs) {
      if (currentChunk.length + paragraph.length > MAX_CHUNK_SIZE) {
        chunks.push(currentChunk);
        currentChunk = paragraph + '\n';
      } else {
        currentChunk += paragraph + '\n';
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk);
    }

    return chunks;
  };

  /**
   * Process longer texts by breaking them into chunks and converting each
   * 
   * @param {Object} params - TTS parameters
   * @param {string} params.text - Story text to convert
   * @param {string} params.voice - Voice type
   * @param {string} params.storyId - ID of the story
   * @param {string} params.userId - ID of the user
   * @returns {Promise<string>} URL to the final combined audio file
   */
  const processLongText = async ({ text, voice, storyId, userId }) => {
    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      const chunks = splitTextIntoChunks(text);
      const audioUrl = await convertTextToSpeech({
        text: chunks[0],
        voice,
        storyId,
        userId
      });
      return audioUrl;
    } catch (err) {
      console.error('Error processing long text:', err);
      setError(err.message || 'Failed to process text.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    convertTextToSpeech,
    processLongText,
    loading,
    error,
    progress
  };
};

export default useTextToSpeech;