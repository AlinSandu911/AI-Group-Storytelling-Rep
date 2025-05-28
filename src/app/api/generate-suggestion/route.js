
import { NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function POST(request) {
  try {
    if (!GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { currentText } = body;

    if (!currentText?.trim()) {
      return NextResponse.json(
        { error: 'Current text is required' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a creative storyteller specialized in children's stories. 
Continue the provided story with one or two paragraphs that maintain the tone and style of the original story.
The continuation should be appropriate for children and flow naturally with the existing text.`;

    const userPrompt = `
Continue this children's story with a few more paragraphs:

${currentText.slice(-800)} ${currentText.length > 800 ? '...' : ''}

The continuation should:
1. Maintain the same tone and style
2. Be appropriate for children
3. Advance the narrative in an interesting way
4. Be between 100-200 words
5. Flow naturally with the existing text

Write only the continuation, without repeating the original text.`;

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', //updated model
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 300,
        temperature: 0.8,
        top_p: 1,
        stream: false
      })
    });

    if (!response.ok) {
      console.error('Groq API Error:', response.status);
      return NextResponse.json(
        { error: 'External API error' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      return NextResponse.json(
        { error: 'Invalid API response' },
        { status: 500 }
      );
    }

    const suggestion = data.choices[0].message.content.trim();
    
    return NextResponse.json({ suggestion });

  } catch (error) {
    console.error('Internal error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}