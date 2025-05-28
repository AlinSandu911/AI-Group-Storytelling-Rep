// app/api/generate-image/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  console.log('=== API GENERATE IMAGE CHAMADA ===');
  
  try {
    let body;
    try {
      body = await request.json();
      console.log('Body parseado com sucesso:', body);
    } catch (parseError) {
      console.error('Erro ao parsear body:', parseError);
      return NextResponse.json(
        { error: 'Erro ao parsear JSON do body' },
        { status: 400 }
      );
    }

    const { 
      storyText = '', 
      prompt = 'A beautiful children\'s story illustration', 
      characters = '', 
      setting = '', 
      mood = 'cheerful' 
    } = body;

    console.log('Dados extraídos:', { storyText, prompt, characters, setting, mood });

    // Criar uma imagem SVG customizada baseada nos dados da história
    const colors = {
      'cheerful': '#FFD700',
      'exciting': '#FF6347', 
      'magical': '#9370DB',
      'adventurous': '#32CD32',
      'calm': '#87CEEB',
      'mysterious': '#4B0082',
      'funny': '#FFA500',
      'educational': '#20B2AA'
    };

    const bgColor = colors[mood.toLowerCase()] || '#FFD700';
    const textColor = '#2C3E50';
    
    // Criar emoji baseado no tema
    const themeEmojis = {
      'space': '🚀',
      'ocean': '🌊', 
      'forest': '🌲',
      'adventure': '⚡',
      'magic': '✨',
      'animals': '🦁',
      'friendship': '👫',
      'family': '👨‍👩‍👧‍👦'
    };
    
    const emoji = themeEmojis[prompt.toLowerCase()] || '📚';
    
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
        <!-- Background -->
        <rect width="512" height="512" fill="${bgColor}" opacity="0.8"/>
        
        <!-- Gradient overlay -->
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:white;stop-opacity:0.5" />
          </linearGradient>
        </defs>
        <rect width="512" height="512" fill="url(#bg)"/>
        
        <!-- Main emoji -->
        <text x="256" y="200" font-size="120" text-anchor="middle" font-family="Arial">${emoji}</text>
        
        <!-- Title -->
        <text x="256" y="280" font-size="24" text-anchor="middle" font-family="Arial" fill="${textColor}" font-weight="bold">
          ${prompt.substring(0, 20)}
        </text>
        
        <!-- Characters -->
        ${characters ? `<text x="256" y="320" font-size="18" text-anchor="middle" font-family="Arial" fill="${textColor}">
          Characters: ${characters.substring(0, 25)}
        </text>` : ''}
        
        <!-- Setting -->
        ${setting ? `<text x="256" y="350" font-size="16" text-anchor="middle" font-family="Arial" fill="${textColor}">
          Setting: ${setting.substring(0, 30)}
        </text>` : ''}
        
        <!-- Mood -->
        <text x="256" y="400" font-size="16" text-anchor="middle" font-family="Arial" fill="${textColor}" font-style="italic">
          Mood: ${mood}
        </text>
        
        <!-- Decorative elements -->
        <circle cx="100" cy="100" r="30" fill="white" opacity="0.3"/>
        <circle cx="412" cy="120" r="25" fill="white" opacity="0.3"/>
        <circle cx="80" cy="400" r="20" fill="white" opacity="0.3"/>
        <circle cx="430" cy="380" r="35" fill="white" opacity="0.3"/>
        
        <!-- Border -->
        <rect x="10" y="10" width="492" height="492" fill="none" stroke="${textColor}" stroke-width="3" rx="20"/>
      </svg>
    `;

    // Converter SVG para Data URL
    const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
    
    console.log('SVG customizado criado com sucesso');

    const response = {
      imageUrl: svgDataUrl,
      prompt: prompt,
      metadata: {
        model: 'custom-svg',
        size: '512x512',
        characters: characters,
        setting: setting,
        mood: mood,
        emoji: emoji,
        bgColor: bgColor
      }
    };

    console.log('=== API GENERATE IMAGE SUCESSO ===');
    return NextResponse.json(response);

  } catch (error) {
    console.error('=== ERRO NA API GENERATE IMAGE ===');
    console.error('Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor de imagem',
        details: error?.message || 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'API de geração de imagem funcionando',
    timestamp: new Date().toISOString()
  });
}