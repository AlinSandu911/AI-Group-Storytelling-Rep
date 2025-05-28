// app/api/generate-image/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  console.log('=== CHILDREN\'S STORY IMAGE GENERATION API ===');
  
  try {
    const body = await request.json();
    const { 
      storyText = '', 
      prompt = 'A beautiful children\'s story illustration', 
      characters = '', 
      setting = '', 
      mood = 'cheerful' 
    } = body;

    console.log('Request data:', { storyText, prompt, characters, setting, mood });

    // 🎨 CREATE CHILD-FRIENDLY AI PROMPTS (for DALL-E, Midjourney, etc.)
    const enhancedPrompt = createChildFriendlyPrompt({
      storyText,
      prompt, 
      characters,
      setting,
      mood
    });

    // For demonstration, creating elaborate SVGs
    // In production, replace with real AI API call:
    // const realImage = await generateWithDALLE(enhancedPrompt);
    
    const creativeImageUrl = generateCreativeChildrensSVG({
      prompt,
      characters,
      setting,
      mood,
      storyText
    });

    console.log('Creative children\'s image generated successfully');

    const response = {
      imageUrl: creativeImageUrl,
      prompt: enhancedPrompt,
      metadata: {
        model: 'enhanced-children-svg',
        size: '512x512',
        characters: characters,
        setting: setting,
        mood: mood,
        childFriendly: true,
        style: 'children-book-illustration',
        safetyLevel: 'kid-safe'
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('=== IMAGE GENERATION API ERROR ===', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate creative children\'s image',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * 🚀 CREATE OPTIMIZED PROMPTS FOR AI SERVICES
 * Use this function when integrating with DALL-E, Midjourney, Stable Diffusion, etc.
 */
function createChildFriendlyPrompt({ storyText, prompt, characters, setting, mood }) {
  // Extract main story elements
  const mainElements = extractStoryElements(storyText);
  
  // Base style for children
  const baseStyle = "children's book illustration, cartoon style, bright vibrant colors, friendly characters, safe for kids, whimsical, cute";
  
  // Kid-friendly mood mapping
  const kidFriendlyMood = {
    'cheerful': 'happy, joyful, bright and sunny, smiling',
    'exciting': 'fun adventure, energetic, dynamic, playful',
    'magical': 'whimsical, sparkles, fairy tale magic, enchanting',
    'adventurous': 'friendly exploration, discovery, heroic',
    'calm': 'peaceful, gentle, soothing, serene',
    'mysterious': 'curious, wonder, gentle mystery, intriguing',
    'funny': 'silly, playful, humorous, laughing',
    'educational': 'learning, discovery, bright classroom, teaching'
  }[mood] || 'happy and colorful';

  // Build optimized prompt
  let enhancedPrompt = `${baseStyle}, ${kidFriendlyMood}`;
  
  if (characters) {
    enhancedPrompt += `, featuring ${characters} as adorable cartoon characters`;
  }
  
  if (setting) {
    enhancedPrompt += `, set in ${setting} with child-friendly environment`;
  }
  
  if (mainElements.themes.length > 0) {
    enhancedPrompt += `, themes of ${mainElements.themes.join(', ')}`;
  }
  
  enhancedPrompt += `, ${prompt}, no scary elements, appropriate for children ages 3-10, digital art, high quality`;
  
  return enhancedPrompt;
}

/**
 * 🎨 CREATIVE CHILDREN'S SVG GENERATOR
 */
function generateCreativeChildrensSVG({ prompt, characters, setting, mood, storyText }) {
  // Analyze content to choose visual elements
  const analysis = analyzeStoryContent(storyText, prompt, characters, setting);
  
  // Thematic color schemes based on mood
  const colorSchemes = {
    'cheerful': { 
      bg: ['#FFE135', '#FF6B6B', '#4ECDC4'], 
      accent: '#FF9F43',
      text: '#2C3E50',
      secondary: '#F8C471'
    },
    'magical': { 
      bg: ['#A8E6CF', '#B4A7D6', '#D4A5A5'], 
      accent: '#9B59B6',
      text: '#2C3E50',
      secondary: '#E8DAEF'
    },
    'adventurous': { 
      bg: ['#52C41A', '#40A9FF', '#FAAD14'], 
      accent: '#FF4D4F',
      text: '#000000',
      secondary: '#95DE64'
    },
    'calm': { 
      bg: ['#B7E4F9', '#D4F4DD', '#FFF2BA'], 
      accent: '#40A9FF',
      text: '#2C3E50',
      secondary: '#D1F2EB'
    },
    'funny': { 
      bg: ['#FFA726', '#FFCA28', '#AB47BC'], 
      accent: '#E91E63',
      text: '#1A1A1A',
      secondary: '#FFD54F'
    },
    'exciting': {
      bg: ['#FF5722', '#FF9800', '#4CAF50'],
      accent: '#E91E63',
      text: '#1A1A1A',
      secondary: '#FFAB91'
    }
  };

  const colors = colorSchemes[mood] || colorSchemes['cheerful'];
  
  // Visual elements based on setting
  const settingElements = getSettingElements(setting, colors);
  
  // Characters based on story characters
  const characterElements = getCharacterElements(characters, colors);
  
  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
      <defs>
        <!-- Colorful gradients -->
        <radialGradient id="skyGradient" cx="50%" cy="30%" r="70%">
          <stop offset="0%" style="stop-color:${colors.bg[0]};stop-opacity:1" />
          <stop offset="50%" style="stop-color:${colors.bg[1]};stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:${colors.bg[2]};stop-opacity:0.6" />
        </radialGradient>
        
        <!-- Texture patterns -->
        <pattern id="cloudPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="20" r="15" fill="white" opacity="0.4"/>
        </pattern>
        
        <!-- Sparkle pattern for magical stories -->
        <pattern id="sparklePattern" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
          <polygon points="15,5 17,12 24,12 18,17 20,24 15,20 10,24 12,17 6,12 13,12" fill="${colors.accent}" opacity="0.3"/>
        </pattern>
        
        <!-- Drop shadows -->
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="3" dy="3" stdDeviation="4" flood-color="rgba(0,0,0,0.2)"/>
        </filter>
        
        <!-- Glow effect -->
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <!-- Base background -->
      <rect width="512" height="512" fill="url(#skyGradient)"/>
      
      <!-- Magical sparkles for magical stories -->
      ${mood === 'magical' ? '<rect width="512" height="512" fill="url(#sparklePattern)"/>' : ''}
      
      ${settingElements}
      
      <!-- Mood-specific environmental elements -->
      ${getMoodEnvironment(mood, colors)}
      
      <!-- Main characters -->
      ${characterElements}
      
      <!-- Decorative elements -->
      ${getDecorativeElements(colors, analysis)}
      
      <!-- Story title card -->
      <rect x="30" y="380" width="452" height="100" fill="white" opacity="0.95" rx="20" filter="url(#shadow)"/>
      <rect x="35" y="385" width="442" height="90" fill="${colors.secondary}" opacity="0.3" rx="15"/>
      
      <text x="256" y="410" font-size="20" text-anchor="middle" font-family="Comic Sans MS, cursive" fill="${colors.text}" font-weight="bold">
        ${truncateText(prompt, 30)}
      </text>
      
      ${characters ? `<text x="256" y="435" font-size="16" text-anchor="middle" font-family="Comic Sans MS, cursive" fill="${colors.text}">
        Starring: ${truncateText(characters, 35)}
      </text>` : ''}
      
      <text x="256" y="460" font-size="14" text-anchor="middle" font-family="Comic Sans MS, cursive" fill="${colors.accent}" font-style="italic">
        A ${mood} adventure awaits!
      </text>
      
      <!-- Decorative border -->
      <rect x="8" y="8" width="496" height="496" fill="none" stroke="${colors.accent}" stroke-width="6" rx="30"/>
      <rect x="15" y="15" width="482" height="482" fill="none" stroke="white" stroke-width="3" rx="25"/>
    </svg>
  `;

  return `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
}

/**
 * 🏞️ SETTING ELEMENTS
 */
function getSettingElements(setting, colors) {
  const settingLower = (setting || '').toLowerCase();
  
  if (settingLower.includes('forest') || settingLower.includes('woods') || settingLower.includes('jungle')) {
    return `
      <!-- Enchanted forest -->
      <ellipse cx="80" cy="350" rx="45" ry="85" fill="#228B22"/>
      <ellipse cx="80" cy="315" rx="40" ry="65" fill="#32CD32"/>
      <rect x="70" y="350" width="20" height="45" fill="#8B4513"/>
      
      <ellipse cx="430" cy="370" rx="55" ry="95" fill="#228B22"/>
      <ellipse cx="430" cy="325" rx="45" ry="75" fill="#32CD32"/>
      <rect x="420" y="370" width="20" height="55" fill="#8B4513"/>
      
      <!-- Colorful flowers -->
      <circle cx="150" cy="380" r="10" fill="#FF69B4"/>
      <circle cx="360" cy="390" r="8" fill="#FFD700"/>
      <circle cx="200" cy="395" r="9" fill="#FF6347"/>
      <circle cx="320" cy="385" r="7" fill="#9370DB"/>
      
      <!-- Mushrooms -->
      <ellipse cx="180" cy="370" rx="8" ry="15" fill="#DC143C"/>
      <ellipse cx="180" cy="365" rx="12" ry="8" fill="#FF6347"/>
      <rect x="177" y="370" width="6" height="12" fill="#F5DEB3"/>
    `;
  }
  
  if (settingLower.includes('space') || settingLower.includes('galaxy') || settingLower.includes('planet')) {
    return `
      <!-- Starry space -->
      <circle cx="100" cy="80" r="4" fill="#FFD700" filter="url(#glow)"/>
      <circle cx="200" cy="60" r="3" fill="#FFFFFF" filter="url(#glow)"/>
      <circle cx="350" cy="90" r="5" fill="#FFD700" filter="url(#glow)"/>
      <circle cx="450" cy="70" r="3" fill="#FFFFFF" filter="url(#glow)"/>
      <circle cx="80" cy="150" r="3" fill="#FFD700" filter="url(#glow)"/>
      <circle cx="420" cy="180" r="4" fill="#FF69B4" filter="url(#glow)"/>
      
      <!-- Colorful planets -->
      <circle cx="400" cy="120" r="30" fill="#FF6B6B" opacity="0.8"/>
      <ellipse cx="400" cy="115" rx="35" ry="8" fill="#FF4444" opacity="0.6"/>
      <circle cx="120" cy="130" r="20" fill="#4ECDC4" opacity="0.8"/>
      
      <!-- Friendly spaceship -->
      <ellipse cx="256" cy="200" rx="40" ry="20" fill="#C0C0C0" filter="url(#shadow)"/>
      <rect x="241" y="185" width="30" height="15" fill="#FF4444"/>
      <circle cx="246" cy="192" r="4" fill="#00FF00"/>
      <circle cx="266" cy="192" r="4" fill="#00FF00"/>
    `;
  }
  
  if (settingLower.includes('ocean') || settingLower.includes('sea') || settingLower.includes('beach') || settingLower.includes('underwater')) {
    return `
      <!-- Ocean waves -->
      <path d="M 0 350 Q 128 330 256 350 T 512 350 L 512 512 L 0 512 Z" fill="#40A9FF" opacity="0.8"/>
      <path d="M 0 370 Q 100 350 200 370 T 400 370 Q 456 350 512 370 L 512 512 L 0 512 Z" fill="#1890FF" opacity="0.9"/>
      
      <!-- Colorful sea creatures -->
      <ellipse cx="150" cy="400" rx="18" ry="10" fill="#FFD700"/>
      <polygon points="135,400 145,395 145,405" fill="#FFA500"/>
      <circle cx="140" cy="398" r="2" fill="#000000"/>
      
      <ellipse cx="350" cy="420" rx="15" ry="8" fill="#FF69B4"/>
      <polygon points="335,420 345,415 345,425" fill="#FF1493"/>
      <circle cx="340" cy="418" r="2" fill="#000000"/>
      
      <!-- Seaweed -->
      <path d="M 100 450 Q 105 430 95 410 Q 110 390 100 370" stroke="#32CD32" stroke-width="8" fill="none" opacity="0.7"/>
      <path d="M 400 460 Q 395 440 405 420 Q 390 400 400 380" stroke="#228B22" stroke-width="6" fill="none" opacity="0.7"/>
      
      <!-- Sun -->
      <circle cx="400" cy="100" r="35" fill="#FFD700" opacity="0.9"/>
      <!-- Sun rays -->
      <line x1="400" y1="50" x2="400" y2="70" stroke="#FFD700" stroke-width="3"/>
      <line x1="435" y1="85" x2="425" y2="95" stroke="#FFD700" stroke-width="3"/>
      <line x1="450" y1="100" x2="430" y2="100" stroke="#FFD700" stroke-width="3"/>
    `;
  }
  
  if (settingLower.includes('castle') || settingLower.includes('kingdom') || settingLower.includes('palace')) {
    return `
      <!-- Fairy tale castle -->
      <rect x="200" y="200" width="112" height="120" fill="#DDA0DD"/>
      <rect x="180" y="180" width="40" height="140" fill="#DA70D6"/>
      <rect x="292" y="180" width="40" height="140" fill="#DA70D6"/>
      
      <!-- Castle towers -->
      <polygon points="200,200 200,160 230,160 230,200" fill="#9370DB"/>
      <polygon points="282,200 282,160 312,160 312,200" fill="#9370DB"/>
      <polygon points="220,180 220,140 260,140 260,180" fill="#8A2BE2"/>
      
      <!-- Flags -->
      <line x1="210" y1="160" x2="210" y2="130" stroke="#8B4513" stroke-width="3"/>
      <polygon points="210,130 210,145 235,137" fill="#FF6347"/>
      
      <!-- Castle gate -->
      <rect x="225" y="270" width="30" height="50" fill="#654321"/>
      <circle cx="240" cy="295" r="15" fill="#8B4513"/>
    `;
  }
  
  // Default setting (meadow/countryside)
  return `
    <!-- Rolling green hills -->
    <ellipse cx="256" cy="450" rx="350" ry="120" fill="#90EE90" opacity="0.9"/>
    <ellipse cx="100" cy="420" rx="180" ry="100" fill="#98FB98" opacity="0.7"/>
    <ellipse cx="400" cy="430" rx="220" ry="110" fill="#90EE90" opacity="0.8"/>
    
    <!-- Fluffy clouds -->
    <ellipse cx="150" cy="100" rx="45" ry="30" fill="white" opacity="0.9"/>
    <ellipse cx="130" cy="105" rx="35" ry="25" fill="white" opacity="0.8"/>
    <ellipse cx="170" cy="105" rx="30" ry="20" fill="white" opacity="0.8"/>
    
    <ellipse cx="350" cy="120" rx="55" ry="35" fill="white" opacity="0.9"/>
    <ellipse cx="330" cy="125" rx="40" ry="30" fill="white" opacity="0.8"/>
    <ellipse cx="370" cy="125" rx="35" ry="25" fill="white" opacity="0.8"/>
    
    <!-- Sun -->
    <circle cx="80" cy="80" r="30" fill="#FFD700" opacity="0.8"/>
    <!-- Sun rays -->
    <line x1="80" y1="35" x2="80" y2="50" stroke="#FFD700" stroke-width="3"/>
    <line x1="105" y1="55" x2="95" y2="65" stroke="#FFD700" stroke-width="3"/>
    <line x1="125" y1="80" x2="110" y2="80" stroke="#FFD700" stroke-width="3"/>
  `;
}

/**
 * 🎭 CHARACTER ELEMENTS
 */
function getCharacterElements(characters, colors) {
  const charLower = (characters || '').toLowerCase();
  
  if (charLower.includes('dragon')) {
    return `
      <!-- Friendly dragon -->
      <ellipse cx="256" cy="280" rx="70" ry="50" fill="#9B59B6" filter="url(#shadow)"/>
      <circle cx="225" cy="255" r="10" fill="#2C3E50"/>
      <circle cx="287" cy="255" r="10" fill="#2C3E50"/>
      <ellipse cx="256" cy="275" rx="20" ry="12" fill="#E74C3C"/>
      <!-- Wings -->
      <ellipse cx="190" cy="265" rx="30" ry="45" fill="#8E44AD" opacity="0.9"/>
      <ellipse cx="322" cy="265" rx="30" ry="45" fill="#8E44AD" opacity="0.9"/>
      <!-- Friendly smile -->
      <path d="M 240 285 Q 256 295 272 285" stroke="#2C3E50" stroke-width="2" fill="none"/>
      <!-- Crown -->
      <polygon points="235,235 256,215 277,235 270,245 242,245" fill="#FFD700"/>
    `;
  }
  
  if (charLower.includes('cat') || charLower.includes('kitten')) {
    return `
      <!-- Cute cat -->
      <ellipse cx="256" cy="290" rx="50" ry="45" fill="#FF9500" filter="url(#shadow)"/>
      <circle cx="235" cy="275" r="8" fill="#2C3E50"/>
      <circle cx="277" cy="275" r="8" fill="#2C3E50"/>
      <ellipse cx="256" cy="295" rx="12" ry="8" fill="#E74C3C"/>
      <!-- Ears -->
      <polygon points="220,250 240,230 260,250" fill="#FF9500"/>
      <polygon points="252,250 272,230 292,250" fill="#FF9500"/>
      <polygon points="225,245 235,235 250,245" fill="#FFB84D"/>
      <polygon points="262,245 277,235 287,245" fill="#FFB84D"/>
      <!-- Whiskers -->
      <line x1="220" y1="285" x2="200" y2="280" stroke="#2C3E50" stroke-width="2"/>
      <line x1="220" y1="295" x2="200" y2="295" stroke="#2C3E50" stroke-width="2"/>
      <line x1="292" y1="285" x2="312" y2="280" stroke="#2C3E50" stroke-width="2"/>
      <line x1="292" y1="295" x2="312" y2="295" stroke="#2C3E50" stroke-width="2"/>
      <!-- Tail -->
      <ellipse cx="310" cy="320" rx="40" ry="12" fill="#FF9500" transform="rotate(45 310 320)"/>
    `;
  }
  
  if (charLower.includes('princess') || charLower.includes('fairy')) {
    return `
      <!-- Princess -->
      <circle cx="256" cy="250" r="30" fill="#FDBCB4" filter="url(#shadow)"/>
      <ellipse cx="256" cy="220" rx="35" ry="25" fill="#FFD700"/>
      <ellipse cx="256" cy="310" rx="45" ry="65" fill="#FF69B4"/>
      <circle cx="240" cy="240" r="4" fill="#2C3E50"/>
      <circle cx="272" cy="240" r="4" fill="#2C3E50"/>
      <ellipse cx="256" cy="255" rx="8" ry="4" fill="#E74C3C"/>
      <!-- Crown -->
      <polygon points="230,205 256,185 282,205 275,220 237,220" fill="#FFD700"/>
      <circle cx="256" cy="195" r="5" fill="#FF1493"/>
      <!-- Arms -->
      <ellipse cx="200" cy="300" rx="18" ry="40" fill="#FDBCB4"/>
      <ellipse cx="312" cy="300" rx="18" ry="40" fill="#FDBCB4"/>
      <!-- Magic wand -->
      <line x1="330" y1="280" x2="350" y2="260" stroke="#8B4513" stroke-width="4"/>
      <polygon points="345,255 355,250 360,260 350,265" fill="#FFD700"/>
    `;
  }
  
  if (charLower.includes('bear') || charLower.includes('teddy')) {
    return `
      <!-- Friendly bear -->
      <ellipse cx="256" cy="280" rx="55" ry="50" fill="#8B4513" filter="url(#shadow)"/>
      <circle cx="220" cy="240" r="20" fill="#8B4513"/>
      <circle cx="292" cy="240" r="20" fill="#8B4513"/>
      <circle cx="230" cy="255" r="6" fill="#2C3E50"/>
      <circle cx="282" cy="255" r="6" fill="#2C3E50"/>
      <ellipse cx="256" cy="275" rx="10" ry="6" fill="#2C3E50"/>
      <!-- Smile -->
      <path d="M 245 285 Q 256 295 267 285" stroke="#2C3E50" stroke-width="2" fill="none"/>
      <!-- Bow tie -->
      <polygon points="240,320 272,320 268,330 244,330" fill="#FF6347"/>
      <rect x="252" y="318" width="8" height="14" fill="#DC143C"/>
    `;
  }
  
  // Default character (friendly child)
  return `
    <!-- Happy child character -->
    <circle cx="256" cy="260" r="35" fill="#FDBCB4" filter="url(#shadow)"/>
    <ellipse cx="256" cy="330" rx="50" ry="70" fill="#4ECDC4"/>
    <circle cx="240" cy="245" r="5" fill="#2C3E50"/>
    <circle cx="272" cy="245" r="5" fill="#2C3E50"/>
    <ellipse cx="256" cy="265" rx="10" ry="6" fill="#E74C3C"/>
    <!-- Happy smile -->
    <path d="M 245 275 Q 256 285 267 275" stroke="#2C3E50" stroke-width="3" fill="none"/>
    <!-- Hair -->
    <ellipse cx="256" cy="225" rx="40" ry="30" fill="#8B4513"/>
    <!-- Arms -->
    <ellipse cx="195" cy="320" rx="20" ry="45" fill="#FDBCB4"/>
    <ellipse cx="317" cy="320" rx="20" ry="45" fill="#FDBCB4"/>
    <!-- Hands waving -->
    <circle cx="185" cy="290" r="12" fill="#FDBCB4"/>
    <circle cx="327" cy="290" r="12" fill="#FDBCB4"/>
  `;
}

/**
 * 🌟 MOOD-BASED ENVIRONMENTAL ELEMENTS
 */
function getMoodEnvironment(mood, colors) {
  switch (mood) {
    case 'magical':
      return `
        <!-- Magical sparkles -->
        <polygon points="100,150 105,160 115,160 107,167 110,177 100,170 90,177 93,167 85,160 95,160" fill="#FFD700" filter="url(#glow)"/>
        <polygon points="380,180 383,185 388,185 384,188 386,193 380,190 374,193 376,188 372,185 377,185" fill="#FF69B4" filter="url(#glow)"/>
        <polygon points="450,250 453,255 458,255 454,258 456,263 450,260 444,263 446,258 442,255 447,255" fill="#9B59B6" filter="url(#glow)"/>
        
        <!-- Floating magical orbs -->
        <circle cx="150" cy="180" r="6" fill="#FFD700" opacity="0.8" filter="url(#glow)"/>
        <circle cx="350" cy="160" r="4" fill="#FF69B4" opacity="0.8" filter="url(#glow)"/>
        <circle cx="120" cy="220" r="5" fill="#9B59B6" opacity="0.8" filter="url(#glow)"/>
        
        <!-- Magic trails -->
        <path d="M 100 150 Q 120 140 140 160 Q 160 180 180 160" stroke="#FFD700" stroke-width="2" fill="none" opacity="0.6"/>
      `;
      
    case 'adventurous':
      return `
        <!-- Mountain range -->
        <polygon points="50,300 150,200 250,300" fill="#8B7D6B" opacity="0.8"/>
        <polygon points="200,320 300,220 400,320" fill="#A0522D" opacity="0.8"/>
        <polygon points="300,340 400,240 500,340" fill="#8B7D6B" opacity="0.7"/>
        
        <!-- Snow caps -->
        <polygon points="130,220 150,200 170,220" fill="white" opacity="0.9"/>
        <polygon points="280,240 300,220 320,240" fill="white" opacity="0.9"/>
        
        <!-- Flying birds -->
        <path d="M 80 120 Q 85 115 90 120 Q 95 115 100 120" stroke="#2C3E50" stroke-width="3" fill="none"/>
        <path d="M 420 140 Q 425 135 430 140 Q 435 135 440 140" stroke="#2C3E50" stroke-width="3" fill="none"/>
        <path d="M 300 100 Q 305 95 310 100 Q 315 95 320 100" stroke="#2C3E50" stroke-width="3" fill="none"/>
      `;
      
    case 'funny':
      return `
        <!-- Silly bouncing elements -->
        <circle cx="120" cy="180" r="25" fill="#FFD700" opacity="0.8"/>
        <circle cx="115" cy="170" r="4" fill="#2C3E50"/>
        <circle cx="125" cy="170" r="4" fill="#2C3E50"/>
        <ellipse cx="120" cy="185" rx="10" ry="6" fill="#E74C3C"/>
        
        <!-- Thought bubbles -->
        <ellipse cx="350" cy="150" rx="35" ry="25" fill="white" opacity="0.9"/>
        <circle cx="330" cy="175" r="8" fill="white" opacity="0.9"/>
        <circle cx="320" cy="185" r="5" fill="white" opacity="0.9"/>
        <circle cx="315" cy="190" r="3" fill="white" opacity="0.9"/>
        
        <!-- Rainbow -->
        <path d="M 50 200 Q 256 150 462 200" stroke="#FF0000" stroke-width="8" fill="none" opacity="0.7"/>
        <path d="M 50 205 Q 256 155 462 205" stroke="#FF8C00" stroke-width="8" fill="none" opacity="0.7"/>
        <path d="M 50 210 Q 256 160 462 210" stroke="#FFD700" stroke-width="8" fill="none" opacity="0.7"/>
        <path d="M 50 215 Q 256 165 462 215" stroke="#32CD32" stroke-width="8" fill="none" opacity="0.7"/>
        <path d="M 50 220 Q 256 170 462 220" stroke="#1E90FF" stroke-width="8" fill="none" opacity="0.7"/>
        <path d="M 50 225 Q 256 175 462 225" stroke="#9370DB" stroke-width="8" fill="none" opacity="0.7"/>
      `;
      
    case 'exciting':
      return `
        <!-- Action lines and energy -->
        <line x1="50" y1="100" x2="100" y2="50" stroke="${colors.accent}" stroke-width="4" opacity="0.6"/>
        <line x1="150" y1="80" x2="200" y2="30" stroke="${colors.accent}" stroke-width="4" opacity="0.6"/>
        <line x1="450" y1="120" x2="400" y2="70" stroke="${colors.accent}" stroke-width="4" opacity="0.6"/>
        
        <!-- Energy bursts -->
        <circle cx="100" cy="150" r="15" fill="${colors.accent}" opacity="0.5"/>
        <circle cx="400" cy="180" r="20" fill="${colors.bg[0]}" opacity="0.6"/>
        <circle cx="300" cy="120" r="12" fill="${colors.bg[1]}" opacity="0.5"/>
        
        <!-- Lightning bolts -->
        <path d="M 80 80 L 90 100 L 85 100 L 95 120" stroke="#FFD700" stroke-width="4" fill="none"/>
        <path d="M 420 90 L 430 110 L 425 110 L 435 130" stroke="#FFD700" stroke-width="4" fill="none"/>
      `;
      
    case 'calm':
      return `
        <!-- Gentle floating elements -->
        <circle cx="100" cy="150" r="8" fill="white" opacity="0.6"/>
        <circle cx="400" cy="180" r="10" fill="white" opacity="0.5"/>
        <circle cx="300" cy="120" r="6" fill="white" opacity="0.7"/>
        
        <!-- Soft butterflies -->
        <ellipse cx="180" cy="200" rx="8" ry="4" fill="#FFB6C1" opacity="0.8" transform="rotate(20 180 200)"/>
        <ellipse cx="184" cy="196" rx="6" ry="3" fill="#FF69B4" opacity="0.8" transform="rotate(20 184 196)"/>
        
        <ellipse cx="350" cy="170" rx="8" ry="4" fill="#98FB98" opacity="0.8" transform="rotate(-15 350 170)"/>
        <ellipse cx="354" cy="166" rx="6" ry="3" fill="#32CD32" opacity="0.8" transform="rotate(-15 354 166)"/>
        
        <!-- Gentle waves -->
        <path d="M 0 300 Q 128 290 256 300 T 512 300" stroke="#87CEEB" stroke-width="3" fill="none" opacity="0.5"/>
      `;
      
    default:
      return `
        <!-- Default cheerful elements -->
        <circle cx="100" cy="200" r="12" fill="${colors.accent}" opacity="0.6"/>
        <circle cx="400" cy="180" r="15" fill="${colors.bg[1]}" opacity="0.6"/>
        <circle cx="300" cy="150" r="10" fill="${colors.bg[2]}" opacity="0.6"/>
        
        <!-- Cheerful hearts -->
        <path d="M 450 350 C 445 340, 435 340, 435 350 C 435 340, 425 340, 430 350 C 435 360, 450 370, 450 350 Z" fill="#E74C3C" opacity="0.7"/>
        <path d="M 80 320 C 75 310, 65 310, 65 320 C 65 310, 55 310, 60 320 C 65 330, 80 340, 80 320 Z" fill="#FF69B4" opacity="0.7"/>
      `;
  }
}

/**
 * ✨ DECORATIVE ELEMENTS
 */
function getDecorativeElements(colors, analysis) {
  return `
    <!-- Floating decorative elements -->
    <circle cx="80" cy="300" r="15" fill="${colors.accent}" opacity="0.4"/>
    <circle cx="430" cy="280" r="18" fill="${colors.bg[0]}" opacity="0.5"/>
    <circle cx="180" cy="120" r="10" fill="${colors.bg[1]}" opacity="0.4"/>
    
    <!-- Playful geometric shapes -->
    <polygon points="60,250 75,230 90,250 75,270" fill="${colors.secondary}" opacity="0.6"/>
    <polygon points="440,200 455,180 470,200 455,220" fill="${colors.accent}" opacity="0.5"/>
    
    <!-- Friendly butterflies -->
    <ellipse cx="350" cy="200" rx="10" ry="5" fill="#FF69B4" opacity="0.8" transform="rotate(20 350 200)"/>
    <ellipse cx="355" cy="195" rx="8" ry="4" fill="#FF1493" opacity="0.8" transform="rotate(20 355 195)"/>
    <line x1="350" y1="200" x2="350" y2="190" stroke="#2C3E50" stroke-width="1"/>
    
    <!-- Love and friendship hearts -->
    <path d="M 450 350 C 445 340, 435 340, 435 350 C 435 340, 425 340, 430 350 C 435 360, 450 370, 450 350 Z" fill="#E74C3C" opacity="0.6"/>
    
    <!-- Musical notes for happy stories -->
    <ellipse cx="120" cy="160" rx="6" ry="8" fill="#2C3E50" opacity="0.7"/>
    <line x1="126" y1="160" x2="126" y2="140" stroke="#2C3E50" stroke-width="2"/>
    <path d="M 126 140 Q 135 135 140 140" stroke="#2C3E50" stroke-width="2" fill="none"/>
  `;
}

/**
 * 🔍 STORY CONTENT ANALYSIS
 */
function analyzeStoryContent(storyText, prompt, characters, setting) {
  const text = (storyText + ' ' + prompt).toLowerCase();
  
  const themes = [];
  if (text.includes('friend') || text.includes('buddy')) themes.push('friendship');
  if (text.includes('family') || text.includes('parent')) themes.push('family');
  if (text.includes('adventure') || text.includes('journey')) themes.push('adventure');
  if (text.includes('magic') || text.includes('magical')) themes.push('magic');
  if (text.includes('learn') || text.includes('lesson')) themes.push('learning');
  if (text.includes('brave') || text.includes('courage')) themes.push('courage');
  if (text.includes('kind') || text.includes('help')) themes.push('kindness');
  
  return { themes };
}

/**
 * 🛠️ UTILITY FUNCTIONS
 */
function extractStoryElements(storyText) {
  const themes = [];
  const text = storyText.toLowerCase();
  
  // Detect main themes
  if (text.includes('friendship') || text.includes('friend')) themes.push('friendship');
  if (text.includes('adventure') || text.includes('journey')) themes.push('adventure');
  if (text.includes('magic') || text.includes('magical')) themes.push('magic');
  if (text.includes('family')) themes.push('family');
  if (text.includes('learning') || text.includes('lesson')) themes.push('education');
  if (text.includes('brave') || text.includes('courage')) themes.push('bravery');
  if (text.includes('kind') || text.includes('helping')) themes.push('kindness');
  
  return { themes };
}

function truncateText(text, maxLength) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Creative Children\'s Story Image Generation API',
    timestamp: new Date().toISOString(),
    features: [
      'Intelligent story content analysis',
      'Child-friendly optimized images',
      'Multiple visual styles and moods',
      'Interactive story elements',
      'Age-appropriate colors and themes',
      'Safety-first design approach',
      'Customizable character representations',
      'Environmental storytelling elements'
    ],
    supportedMoods: ['cheerful', 'magical', 'adventurous', 'calm', 'funny', 'exciting', 'educational'],
    safetyLevel: 'child-safe-guaranteed'
  });
}