import { useState } from 'react';

const useImageGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 🎨 GENERATE CREATIVE CHILDREN'S STORY IMAGE
   * Now with intelligent analysis and optimized prompts
   */
  const generateStoryImage = async ({ storyText, prompt, characters, setting, mood }) => {
    console.log('🎨 === STARTING CREATIVE CHILDREN\'S IMAGE GENERATION ===');
    console.log('Parameters:', { storyText, prompt, characters, setting, mood });

    try {
      setLoading(true);
      setError(null);

      // 🧠 INTELLIGENT CONTENT ANALYSIS
      const enhancedData = analyzeAndEnhancePrompt({
        storyText,
        prompt,
        characters,
        setting,
        mood
      });

      console.log('📝 Analyzed and enhanced data:', enhancedData);

      // 📡 API REQUEST TO ENHANCED ENDPOINT
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enhancedData),
      });

      console.log('🔄 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Creative children\'s image generated successfully:', data);
      
      if (!data.imageUrl) {
        throw new Error('Image URL not found in response');
      }

      return data.imageUrl;

    } catch (err) {
      console.error('❌ Error generating creative image:', err);
      const errorMessage = err.message || 'Unknown error generating image';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🎯 QUICK GENERATION BASED ON TITLE/PROMPT ONLY
   */
  const generateQuickImage = async (prompt, mood = 'cheerful') => {
    return generateStoryImage({
      storyText: '',
      prompt,
      characters: '',
      setting: '',
      mood
    });
  };

  /**
   * 🔄 REGENERATE IMAGE WITH DIFFERENT STYLE
   */
  const regenerateWithStyle = async (originalData, newMood) => {
    const enhancedData = {
      ...originalData,
      mood: newMood,
      regenerate: true
    };

    return generateStoryImage(enhancedData);
  };

  /**
   * 🎨 GENERATE MULTIPLE VARIATIONS
   */
  const generateVariations = async (baseData, variations = ['cheerful', 'magical', 'adventurous']) => {
    const results = [];
    
    for (const mood of variations) {
      try {
        const imageUrl = await generateStoryImage({
          ...baseData,
          mood
        });
        results.push({ mood, imageUrl });
      } catch (error) {
        console.error(`Failed to generate ${mood} variation:`, error);
        results.push({ mood, error: error.message });
      }
    }
    
    return results;
  };

  const clearError = () => {
    setError(null);
  };

  return {
    generateStoryImage,
    generateQuickImage,
    regenerateWithStyle,
    generateVariations,
    clearError,
    loading,
    error,
  };
};

/**
 * 🧠 INTELLIGENT ANALYSIS AND PROMPT ENHANCEMENT
 */
function analyzeAndEnhancePrompt({ storyText, prompt, characters, setting, mood }) {
  console.log('🔍 Analyzing story content for children...');

  // 📚 EXTRACT STORY ELEMENTS
  const storyElements = extractStoryElements(storyText);
  
  // 🎭 ANALYZE CHARACTERS
  const characterAnalysis = analyzeCharacters(characters, storyText);
  
  // 🏞️ ANALYZE SETTING
  const settingAnalysis = analyzeSetting(setting, storyText);
  
  // 🎨 DETERMINE VISUAL STYLE
  const visualStyle = determineChildFriendlyStyle(mood, storyElements);
  
  // 🌈 COLOR PALETTE
  const colorPalette = getChildSafeColorPalette(mood, storyElements.themes);

  console.log('📊 Complete analysis:', {
    storyElements,
    characterAnalysis,
    settingAnalysis,
    visualStyle,
    colorPalette
  });

  return {
    // Original data
    storyText,
    prompt: prompt || 'A beautiful children\'s story illustration',
    characters: formatCharacters(characterAnalysis),
    setting: formatSetting(settingAnalysis),
    mood,
    
    // Enhanced data
    enhancedPrompt: createChildFriendlyPrompt({
      prompt,
      storyElements,
      characterAnalysis,
      settingAnalysis,
      mood
    }),
    
    visualStyle,
    colorPalette,
    safetyLevel: 'child-safe',
    artStyle: visualStyle.artStyle,
    themes: storyElements.themes,
    ageAppropriate: true
  };
}

/**
 * 📖 EXTRACT STORY ELEMENTS
 */
function extractStoryElements(storyText) {
  const text = storyText.toLowerCase();
  const themes = [];
  const objects = [];
  const emotions = [];

  // 🎯 DETECT THEMES
  const themeKeywords = {
    'friendship': ['friend', 'buddy', 'pal', 'together', 'help each other'],
    'adventure': ['adventure', 'journey', 'explore', 'discover', 'quest'],
    'family': ['family', 'mom', 'dad', 'sister', 'brother', 'parent'],
    'magic': ['magic', 'wizard', 'fairy', 'spell', 'enchanted'],
    'learning': ['learn', 'school', 'teach', 'lesson', 'smart'],
    'courage': ['brave', 'courage', 'hero', 'strong', 'fearless'],
    'kindness': ['kind', 'nice', 'help', 'care', 'gentle'],
    'nature': ['forest', 'ocean', 'animals', 'trees', 'flowers'],
    'creativity': ['art', 'music', 'paint', 'draw', 'create']
  };

  for (const [theme, keywords] of Object.entries(themeKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      themes.push(theme);
    }
  }

  // 🎭 DETECT EMOTIONS
  const emotionKeywords = {
    'happy': ['happy', 'joy', 'laugh', 'smile', 'cheerful'],
    'excited': ['excited', 'thrilled', 'amazing', 'wonderful'],
    'curious': ['wonder', 'curious', 'question', 'mystery'],
    'peaceful': ['calm', 'quiet', 'peaceful', 'gentle'],
    'proud': ['proud', 'accomplished', 'success', 'achievement']
  };

  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      emotions.push(emotion);
    }
  }

  // 🏠 DETECT OBJECTS/SETTINGS
  const objectKeywords = [
    'castle', 'house', 'tree', 'flower', 'star', 'moon', 'sun',
    'boat', 'car', 'train', 'airplane', 'bicycle',
    'book', 'toy', 'ball', 'game'
  ];

  for (const obj of objectKeywords) {
    if (text.includes(obj)) {
      objects.push(obj);
    }
  }

  return { themes, emotions, objects };
}

/**
 * 🎭 ANALYZE CHARACTERS
 */
function analyzeCharacters(characters, storyText) {
  const text = (characters + ' ' + storyText).toLowerCase();
  
  const characterTypes = [];
  const personalities = [];

  // Detect character types
  const typeKeywords = {
    'animal': ['cat', 'dog', 'bear', 'rabbit', 'lion', 'elephant', 'bird'],
    'human': ['boy', 'girl', 'child', 'kid', 'person', 'prince', 'princess'],
    'fantasy': ['dragon', 'fairy', 'wizard', 'unicorn', 'elf', 'giant'],
    'robot': ['robot', 'android', 'machine', 'ai']
  };

  for (const [type, keywords] of Object.entries(typeKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      characterTypes.push(type);
    }
  }

  // Detect personalities
  const personalityKeywords = {
    'friendly': ['friendly', 'nice', 'kind', 'gentle'],
    'brave': ['brave', 'courageous', 'hero', 'strong'],
    'funny': ['funny', 'silly', 'hilarious', 'joke'],
    'smart': ['smart', 'clever', 'wise', 'intelligent'],
    'curious': ['curious', 'explorer', 'investigator']
  };

  for (const [personality, keywords] of Object.entries(personalityKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      personalities.push(personality);
    }
  }

  return { characterTypes, personalities, original: characters };
}

/**
 * 🏞️ ANALYZE SETTING
 */
function analyzeSetting(setting, storyText) {
  const text = (setting + ' ' + storyText).toLowerCase();
  
  const environments = [];
  const timeOfDay = [];
  const weather = [];

  // Detect environments
  const envKeywords = {
    'nature': ['forest', 'woods', 'jungle', 'mountain', 'hill'],
    'water': ['ocean', 'sea', 'lake', 'river', 'beach'],
    'urban': ['city', 'town', 'street', 'building', 'school'],
    'fantasy': ['castle', 'kingdom', 'magical land', 'enchanted'],
    'space': ['space', 'planet', 'galaxy', 'stars', 'moon'],
    'home': ['house', 'room', 'bedroom', 'kitchen', 'garden']
  };

  for (const [env, keywords] of Object.entries(envKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      environments.push(env);
    }
  }

  // Detect time of day
  const timeKeywords = {
    'day': ['day', 'morning', 'afternoon', 'sunny'],
    'night': ['night', 'evening', 'dark', 'stars'],
    'sunset': ['sunset', 'dusk', 'twilight'],
    'sunrise': ['sunrise', 'dawn']
  };

  for (const [time, keywords] of Object.entries(timeKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      timeOfDay.push(time);
    }
  }

  return { environments, timeOfDay, weather, original: setting };
}

/**
 * 🎨 DETERMINE CHILD-FRIENDLY VISUAL STYLE
 */
function determineChildFriendlyStyle(mood, storyElements) {
  const baseStyle = {
    artStyle: 'children-book-illustration',
    colorIntensity: 'bright-and-cheerful',
    complexity: 'simple-and-clear',
    safety: 'child-safe'
  };

  const moodStyles = {
    'cheerful': { colorIntensity: 'vibrant', complexity: 'playful' },
    'magical': { artStyle: 'whimsical-fantasy', colorIntensity: 'sparkly' },
    'adventurous': { complexity: 'dynamic', colorIntensity: 'bold' },
    'calm': { colorIntensity: 'soft-pastels', complexity: 'gentle' },
    'funny': { artStyle: 'cartoon-comedy', complexity: 'exaggerated' },
    'exciting': { complexity: 'energetic', colorIntensity: 'high-contrast' }
  };

  return { ...baseStyle, ...moodStyles[mood] };
}

/**
 * 🌈 GET CHILD-SAFE COLOR PALETTE
 */
function getChildSafeColorPalette(mood, themes) {
  const basePalette = {
    primary: '#4ECDC4',
    secondary: '#FFE135',
    accent: '#FF6B6B',
    background: '#F8F9FA'
  };

  const moodPalettes = {
    'cheerful': { primary: '#FFD700', secondary: '#FF6B6B', accent: '#4ECDC4' },
    'magical': { primary: '#9B59B6', secondary: '#E8DAEF', accent: '#FFD700' },
    'adventurous': { primary: '#52C41A', secondary: '#40A9FF', accent: '#FAAD14' },
    'calm': { primary: '#87CEEB', secondary: '#D4F4DD', accent: '#B7E4F9' },
    'funny': { primary: '#FFA726', secondary: '#FFCA28', accent: '#AB47BC' },
    'exciting': { primary: '#FF5722', secondary: '#FF9800', accent: '#4CAF50' }
  };

  return { ...basePalette, ...moodPalettes[mood] };
}

/**
 * 🔧 FORMAT HELPER FUNCTIONS
 */
function formatCharacters(characterAnalysis) {
  if (!characterAnalysis.original) return '';
  
  let formatted = characterAnalysis.original;
  
  if (characterAnalysis.personalities.length > 0) {
    formatted += ` (${characterAnalysis.personalities.join(', ')})`;
  }
  
  return formatted;
}

function formatSetting(settingAnalysis) {
  if (!settingAnalysis.original) return '';
  
  let formatted = settingAnalysis.original;
  
  if (settingAnalysis.timeOfDay.length > 0) {
    formatted += ` during ${settingAnalysis.timeOfDay[0]}`;
  }
  
  return formatted;
}

/**
 * 📝 CREATE CHILD-FRIENDLY PROMPT
 */
function createChildFriendlyPrompt({ prompt, storyElements, characterAnalysis, settingAnalysis, mood }) {
  let enhancedPrompt = `children's book illustration, ${mood} mood`;
  
  if (characterAnalysis.characterTypes.length > 0) {
    enhancedPrompt += `, featuring ${characterAnalysis.characterTypes.join(' and ')} characters`;
  }
  
  if (settingAnalysis.environments.length > 0) {
    enhancedPrompt += `, set in ${settingAnalysis.environments[0]} environment`;
  }
  
  if (storyElements.themes.length > 0) {
    enhancedPrompt += `, themes of ${storyElements.themes.slice(0, 2).join(' and ')}`;
  }
  
  enhancedPrompt += `, ${prompt}, bright colors, safe for children, no scary elements`;
  
  return enhancedPrompt;
}

export default useImageGeneration;