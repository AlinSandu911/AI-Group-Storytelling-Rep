"use client";

import { useState, useEffect, useRef } from 'react';
import { formatTime } from '@/utils/helpers';

/**
 * Componente de player de áudio personalizado
 * 
 * @param {Object} props
 * @param {string} props.src - URL do arquivo de áudio
 * @param {string} [props.className] - Classes CSS opcionais
 * @returns {JSX.Element}
 */
export default function AudioPlayer({ src, className = '' }) {
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const audioRef = useRef(null);
  const progressIntervalRef = useRef(null);
  
  // Inicializa o áudio e configura os event listeners
  useEffect(() => {
    if (!src) {
      setError('URL de áudio não fornecida');
      setIsLoading(false);
      return;
    }
    
    // Limpar qualquer instância anterior
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current.load();
    }
    
    // Criar nova instância
    audioRef.current = new Audio(src);
    
    // Event listeners
    const onLoadedMetadata = () => {
      setDuration(audioRef.current.duration);
      setIsLoading(false);
    };
    
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      audioRef.current.currentTime = 0;
      clearInterval(progressIntervalRef.current);
    };
    
    const onError = (e) => {
      console.error('Erro ao carregar áudio:', e);
      setError('Não foi possível carregar o áudio. Verifique sua conexão e tente novamente.');
      setIsLoading(false);
    };
    
    // Adicionar listeners
    audioRef.current.addEventListener('loadedmetadata', onLoadedMetadata);
    audioRef.current.addEventListener('ended', onEnded);
    audioRef.current.addEventListener('error', onError);
    
    // Forçar carregamento
    audioRef.current.load();
    
    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('loadedmetadata', onLoadedMetadata);
        audioRef.current.removeEventListener('ended', onEnded);
        audioRef.current.removeEventListener('error', onError);
        audioRef.current.src = '';
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [src]);
  
  // Função para alternar entre play e pause
  const togglePlayPause = () => {
    if (!audioRef.current || error) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      clearInterval(progressIntervalRef.current);
    } else {
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            progressIntervalRef.current = setInterval(() => {
              setCurrentTime(audioRef.current.currentTime);
            }, 100);
          })
          .catch((error) => {
            console.error('Erro ao iniciar reprodução:', error);
            setError('Não foi possível reproduzir o áudio. Tente novamente.');
          });
      }
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // Controle de seekbar
  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };
  
  // Se não houver URL de áudio
  if (!src) {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 text-yellow-700 p-3 rounded-md ${className}`}>
        Áudio não disponível para esta história.
      </div>
    );
  }
  
  return (
    <div className={`bg-gray-50 p-4 rounded-lg shadow-sm ${className}`}>
      {isLoading ? (
        <div className="text-center py-2">
          <div className="animate-pulse flex space-x-2 justify-center">
            <div className="rounded-full bg-gray-300 h-2 w-2"></div>
            <div className="rounded-full bg-gray-300 h-2 w-2"></div>
            <div className="rounded-full bg-gray-300 h-2 w-2"></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Carregando áudio...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md">
          {error}
        </div>
      ) : (
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-4">
            <button
              onClick={togglePlayPause}
              className="bg-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
            >
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            
            <div className="flex-grow">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-gray-200 rounded-md appearance-none cursor-pointer"
              />
            </div>
            
            <div className="text-sm text-gray-600 w-24 text-right">
              {formatTime(currentTime * 1000)} / {formatTime(duration * 1000)}
            </div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500">
            <div>Narração</div>
            <div>Velocidade: 1.0x</div>
          </div>
        </div>
      )}
    </div>
  );
}