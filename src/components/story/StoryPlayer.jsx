"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getStoryById, toggleStoryFavorite, getStoryWithAudioById } from "@/firebase/firestore";
import { formatTime } from "@/utils/helpers";
import Button from "@/components/common/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";

/**
 * Component responsible for playing a story with audio controls.
 * 
 * @param {Object} props
 * @param {string} props.storyId - The ID of the story to fetch and play
 */
export default function StoryPlayer({ storyId }) {
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playerState, setPlayerState] = useState({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
  });
  const [isFavorite, setIsFavorite] = useState(false);
  const [audioError, setAudioError] = useState(null);

  const audioRef = useRef(null);
  const progressIntervalRef = useRef(null);

  const { user } = useAuth();
  const router = useRouter();

  // Setup audio
  useEffect(() => {
    console.log("Audio URL:", story?.audioUrl);

    if (!story?.audioUrl) {
      console.log("No audio URL provided");
      return;
    }

    // Clean up any previous audio instance
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current.load();
    }

    // Create new audio instance
    audioRef.current = new Audio(story.audioUrl);

    // Event listeners
    const handleLoadedMetadata = () => {
      console.log("Audio loaded, duration:", audioRef.current.duration);
      setPlayerState((prev) => ({
        ...prev,
        duration: audioRef.current.duration || 0,
      }));
      setAudioError(null); // Clear previous error if audio loads
    };

    const handleEnded = () => {
      setPlayerState((prev) => ({
        ...prev,
        isPlaying: false,
        currentTime: 0,
      }));
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };

    const handleError = (e) => {
      const errorInfo = {
        type: e.type,
        target: {
          error: audioRef.current?.error ? {
            code: audioRef.current.error.code,
            message: audioRef.current.error.message
          } : null,
          readyState: audioRef.current?.readyState,
          networkState: audioRef.current?.networkState,
          src: audioRef.current?.src
        }
      };

      console.error("Error loading audio:", errorInfo);

      let errorMessage = "Unable to load audio for this story.";

      if (audioRef.current?.error) {
        switch (audioRef.current.error.code) {
          case 1:
            errorMessage = "Audio loading was aborted.";
            break;
          case 2:
            errorMessage = "Network error while loading audio. Check your connection.";
            break;
          case 3:
            errorMessage = "Error decoding audio file.";
            break;
          case 4:
            errorMessage = "Unsupported audio format or file not found.";
            break;
          default:
            errorMessage = "Unknown error loading audio.";
        }
      }

      setAudioError(errorMessage);
    };

    audioRef.current.addEventListener("loadedmetadata", handleLoadedMetadata);
    audioRef.current.addEventListener("ended", handleEnded);
    audioRef.current.addEventListener("error", handleError);

    audioRef.current.load();

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("loadedmetadata", handleLoadedMetadata);
        audioRef.current.removeEventListener("ended", handleEnded);
        audioRef.current.removeEventListener("error", handleError);
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [story?.audioUrl]);

  useEffect(() => {
    console.log("story loaded:", story);
  }, [story]);

  // Load story data
  useEffect(() => {
    const fetchStory = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!storyId) {
          throw new Error("Story ID not provided");
        }

        const storyData = await getStoryWithAudioById(storyId);

        if (!storyData) {
          throw new Error("Story not found.");
        }

        console.log("story loaded:", storyData);
        setStory(storyData);
        setIsFavorite(storyData.isFavorite || false);
      } catch (err) {
        console.error("Error loading story:", err);
        setError(err.message || "Failed to load the story.");
      } finally {
        setLoading(false);
      }
    };

    if (storyId) fetchStory();
  }, [storyId]);

  const togglePlayPause = () => {
    if (!audioRef.current || audioError) return;

    if (playerState.isPlaying) {
      audioRef.current.pause();
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      setPlayerState((prev) => ({ ...prev, isPlaying: false }));
    } else {
      const playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setPlayerState((prev) => ({ ...prev, isPlaying: true }));
            progressIntervalRef.current = setInterval(() => {
              if (audioRef.current) {
                setPlayerState((prev) => ({
                  ...prev,
                  currentTime: audioRef.current.currentTime
                }));
              }
            }, 100);
          })
          .catch((error) => {
            console.error("Error playing audio:", error.message);
            setAudioError("Unable to play audio. Please try again.");
            setPlayerState((prev) => ({ ...prev, isPlaying: false }));
          });
      }
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current && !isNaN(newTime)) {
      audioRef.current.currentTime = newTime;
      setPlayerState((prev) => ({ ...prev, currentTime: newTime }));
    }
  };

  const handleToggleFavorite = async () => {
    try {
      await toggleStoryFavorite(storyId, !isFavorite);
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  if (loading) return <LoadingSpinner fullScreen message="Loading story..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Back button */}
      <button
        onClick={() => router.push('/my-stories')}
        className="mb-4 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 mr-2" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to My Stories
      </button>

      <h1 className="text-3xl font-bold mb-4">{story.title}</h1>
      <button
        onClick={handleToggleFavorite}
        className={`mb-4 ${isFavorite ? "text-yellow-500" : "text-gray-400"}`}
      >
        {isFavorite ? "★ Remove from Favorites" : "☆ Add to Favorites"}
      </button>

      {story.audioUrl ? (
        <div className="mb-6">
          {audioError ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-4">
              {audioError}
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Button onClick={togglePlayPause}>
                {playerState.isPlaying ? "Pause" : "Play"}
              </Button>
              <input
                type="range"
                min="0"
                max={playerState.duration || 0}
                value={playerState.currentTime || 0}
                onChange={handleSeek}
                className="flex-1"
                disabled={!playerState.duration}
              />
              <span className="text-sm">
                {formatTime((playerState.currentTime || 0) * 1000)} / {formatTime((playerState.duration || 0) * 1000)}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-3 rounded-md mb-6">
          This story does not have audio narration.
        </div>
      )}

      <article className="prose prose-lg max-w-none">
        {story.content.split('\n\n').map((p, idx) => (
          <p key={idx}>{p}</p>
        ))}
      </article>
    </div>
  );
}
