
import { NextResponse } from "next/server";

/**
 * Server-side API route handler for Text-to-Speech conversion
 * This approach keeps API keys secure on the server side
 */
export async function POST(req) {
  try {
    const { text, voice, languageCode } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Use environment variables securely on the server side
    const apiKey = process.env.GOOGLE_TTS_API_KEY;
    const apiEndpoint = process.env.NEXT_PUBLIC_GOOGLE_TTS_API_ENDPOINT || 
                        'https://texttospeech.googleapis.com/v1/text:synthesize';

    if (!apiKey) {
      console.error("Missing Google TTS API key in environment variables");
      return NextResponse.json(
        { error: "Server configuration error" }, 
        { status: 500 }
      );
    }

    // Prepare the request payload
    const requestPayload = {
      input: { text },
      voice: {
        languageCode: languageCode || 'en-US',
        name: voice || 'en-US-Wavenet-D'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 1.0,
        pitch: 0.0
      }
    };

    console.log("Server-side TTS request payload:", requestPayload);

    // Make the API call with the server's API key
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey
      },
      body: JSON.stringify(requestPayload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Google TTS API error:", errorData);
      return NextResponse.json(
        { error: `TTS API error: ${response.status}`, details: errorData }, 
        { status: response.status }
      );
    }

    // Return the audio content to the client
    const data = await response.json();
    
    return NextResponse.json({ 
      audioContent: data.audioContent 
    });
  } catch (error) {
    console.error("TTS processing error:", error);
    return NextResponse.json(
      { error: "Failed to process TTS request", message: error.message }, 
      { status: 500 }
    );
  }
}