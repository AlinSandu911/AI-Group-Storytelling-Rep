/*import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a bedtime story writer for children aged 3-7." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1200
    });

    const story = response.data.choices[0].message.content;

    return new Response(JSON.stringify({ story }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error("OpenAI error:", err);
    return new Response(JSON.stringify({ error: 'Failed to generate story' }), {
      status: 500,
    });
  }
};
*/



import { NextResponse } from 'next/server';

// Using Grop (free)
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function POST(request) {
  try {
    console.log('=== DEBUG: Iniciando geração de história ===');
    console.log('GROQ_API_KEY exists:', !!GROQ_API_KEY);
    console.log('GROQ_API_KEY length:', GROQ_API_KEY?.length || 0);

    //Check if th API key is configurated
    if (!GROQ_API_KEY) {
      console.error('GROQ_API_KEY não está configurada');
      return NextResponse.json(
        { error: 'API key não configurada' },
        { status: 500 }
      );
    }

    const body = await request.json();
    console.log('=== DEBUG: Dados recebidos ===');
    console.log('Body:', JSON.stringify(body, null, 2));
    
    const { prompt, age, length, characters, setting, mood } = body;

    // Validate mandatory fields
    if (!prompt) {
      console.error('Prompt não fornecido');
      return NextResponse.json(
        { error: 'Prompt é obrigatório' },
        { status: 400 }
      );
    }

    // Building the prompt for the AI
    const systemPrompt = `You are a storyteller specialized in creating charming children's stories. 
Create a story appropriate for the specified age, with appropriate language and positive messages.
The story should be engaging, educational and suitable for bedtime.`;

    const userPrompt = `
Create a children's story with the following characteristics:
- Theme/Prompt: ${prompt}
- Target age: ${age}
- Duration: ${length}
- Main characters: ${characters || 'age-appropriate characters'}
- Setting: ${setting || 'a magical and cozy place'}
- Tone/Mood: ${mood || 'cheerful and comforting'}

The story should:
1. Be appropriate for the specified age
2. Have a positive message or life lesson
3. Be suitable for bedtime
4. Be between 200-800 words depending on duration
5. Include dialogue when appropriate
6. Have a happy and comforting ending

Please write a complete story following these guidelines.`;

    console.log('=== DEBUG: Prompt construído ===');
    console.log('System Prompt length:', systemPrompt.length);
    console.log('User Prompt length:', userPrompt.length);

    const requestBody = {
      model: 'llama-3.3-70b-versatile', //Updated model
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
      top_p: 1,
      stream: false
    };

    console.log('=== DEBUG: Enviando para Groq ===');
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    // Make a request to the Groq API
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('=== DEBUG: Resposta da Groq ===');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);

    // Check if the response was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error('=== DEBUG: Erro da API Groq ===');
      console.error('Status:', response.status);
      console.error('Error text:', errorText);
      
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Chave da API inválida' },
          { status: 401 }
        );
      }
      
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Limite de rate atingido. Tente novamente em alguns segundos.' },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        { error: 'Erro na API externa: ' + errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('=== DEBUG: Dados da Groq ===');
    console.log('Data keys:', Object.keys(data));
    console.log('Choices length:', data.choices?.length || 0);
    
    // Check if the response contains the expected content
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('=== DEBUG: Resposta inesperada ===');
      console.error('Data:', JSON.stringify(data, null, 2));
      return NextResponse.json(
        { error: 'Resposta inválida da API' },
        { status: 500 }
      );
    }

    const story = data.choices[0].message.content.trim();
    
    console.log('=== DEBUG: História gerada ===');
    console.log('Story length:', story.length);
    console.log('Story preview:', story.slice(0, 100) + '...');
    
    return NextResponse.json({
      story: story,
      metadata: {
        model: 'llama-3.3-70b-versatile', //updated model
        prompt_tokens: data.usage?.prompt_tokens || 0,
        completion_tokens: data.usage?.completion_tokens || 0,
        total_tokens: data.usage?.total_tokens || 0
      }
    });

  } catch (error) {
    console.error('=== DEBUG: Erro interno ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}