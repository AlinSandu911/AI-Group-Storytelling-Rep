import { useState } from 'react';

/**
 * Hook for generating AI stories
 * 
 * @param {Object} options - Configuration options (não usado mais, pois será local)
 * @returns {Object} AI story generation methods and state
 */
const useAIStoryGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

    /**
     * Generate a complete story using AI
     * 
     * @param {Object} params - Story generation parameters
     * @param {string} params.prompt - Story prompt or theme
     * @param {string} params.age - Target age group
     * @param {string} params.length - Desired story length
     * @param {Array<string>} params.characters - Main characters
     * @param {string} params.setting - Story setting
     * @param {string} params.mood - Story mood
     * @returns {Promise<string>} Generated story text
     */
    const generateStory = async ({ prompt, age, length, characters, setting, mood }) => {
        setLoading(true);
        setError(null);
        
        try {
            // Validação básica
            if (!prompt?.trim()) {
                throw new Error('Prompt é obrigatório para gerar a história');
            }

            console.log('Gerando história com parâmetros:', { prompt, age, length, characters, setting, mood });

            // Fazer requisição para nossa API local (que conecta com Groq)
            const response = await fetch('/api/generate-story', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: prompt.trim(),
                    age: age || '4-6 years',
                    length: length || 'medium',
                    characters: Array.isArray(characters) ? characters : [],
                    setting: setting?.trim() || '',
                    mood: mood || 'cheerful'
                }),
            });
        
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                
                // Tratar diferentes tipos de erro
                if (response.status === 400) {
                    throw new Error(errorData.error || 'Parâmetros inválidos');
                } else if (response.status === 401) {
                    throw new Error('Erro de autenticação. Verifique a configuração da API.');
                } else if (response.status === 429) {
                    throw new Error('Muitas requisições. Tente novamente em alguns segundos.');
                } else if (response.status >= 500) {
                    throw new Error('Erro do servidor. Tente novamente mais tarde.');
                }
                
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Adaptação: o Groq retorna no formato { story: "..." }
            // em vez de { choices: [{ message: { content: "..." } }] }
            const storyText = data.story || data.choices?.[0]?.message?.content;
            
            if (!storyText) {
                throw new Error('Resposta inválida da API - história não encontrada');
            }
            
            return storyText;
        } catch (err) {
            console.error('Error generating story:', err);
            const errorMessage = err.message || 'Failed to generate story. Please try again.';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };
  
    /**
     * Generate a title for an existing story
     * 
     * @param {string} storyText - Story content
     * @returns {Promise<string>} Generated title
     */
    const generateTitle = async (storyText) => {
        setLoading(true);
        setError(null);
        
        try {
            if (!storyText?.trim()) {
                throw new Error('Conteúdo da história é obrigatório para gerar o título');
            }

            console.log('Gerando título para a história...');

            // Fazer requisição para nossa API local de título
            const response = await fetch('/api/generate-title', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    storyContent: storyText.trim()
                })
            });
        
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                
                if (response.status === 400) {
                    throw new Error(errorData.error || 'Conteúdo da história inválido');
                } else if (response.status >= 500) {
                    throw new Error('Erro do servidor. Tente novamente mais tarde.');
                }
                
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Adaptação: nosso endpoint retorna { title: "..." }
            const title = data.title || data.choices?.[0]?.message?.content;
            
            if (!title) {
                throw new Error('Resposta inválida da API - título não encontrado');
            }
            
            // Limpar aspas e espaços extras
            const cleanTitle = title.replace(/"/g, '').trim();
            
            return cleanTitle;
        } catch (err) {
            console.error('Error generating title:', err);
            const errorMessage = err.message || 'Failed to generate title. Please try again.';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };
  
    /**
     * Generate a story suggestion or continuation
     * 
     * @param {string} currentText - Current story text
     * @returns {Promise<string>} Suggested continuation
     */
    const generateSuggestion = async (currentText) => {
        setLoading(true);
        setError(null);
        
        try {
            if (!currentText?.trim()) {
                throw new Error('Texto atual é obrigatório para gerar sugestão');
            }

            // Fazer requisição para nossa API local de sugestão
            const response = await fetch('/api/generate-suggestion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentText: currentText.trim()
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API error: ${response.status} - ${errorData.error || 'Erro desconhecido'}`);
            }
            
            const data = await response.json();
            const suggestion = data.suggestion || data.choices?.[0]?.message?.content;
            
            if (!suggestion) {
                throw new Error('Resposta inválida da API - sugestão não encontrada');
            }
            
            return suggestion;
        } catch (err) {
            console.error('Error generating suggestion:', err);
            const errorMessage = err.message || 'Failed to generate suggestion. Please try again.';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Clear any existing errors
     */
    const clearError = () => {
        setError(null);
    };

    return {
        generateStory,
        generateTitle,
        generateSuggestion,
        clearError,
        loading,
        error
    };
};

export default useAIStoryGeneration;