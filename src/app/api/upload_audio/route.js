import { NextResponse } from "next/server";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin if it hasn't been already
let app;
if (!getApps().length) {
  const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString('utf-8')
);


  app = initializeApp({
    credential: cert(serviceAccount),
storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
} else {
  app = getApps()[0];
}

const bucket = getStorage().bucket();
const db = getFirestore();

export async function POST(req) {
  try {
    const { audioContent, userId, storyId } = await req.json();

    if (!audioContent || !userId || !storyId) {
      return NextResponse.json(
        { error: "Missing required parameters" }, 
        { status: 400 }
      );
    }

    const buffer = Buffer.from(audioContent, 'base64');
    const filePath = `audio/${userId}/${storyId}.mp3`;
    const file = bucket.file(filePath);

    await file.save(buffer, {
      metadata: {
        contentType: 'audio/mp3',
        metadata: { userId, storyId }
      }
    });

    await file.makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    await db.collection('audios').add({
      userId,
      storyId,
      audioUrl: publicUrl,
      createdAt: new Date(),
      filename: `${storyId}.mp3`
    });

    return NextResponse.json({ 
      success: true, 
      downloadURL: publicUrl 
    });
  } catch (error) {
    console.error("Server-side audio upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload audio", message: error.message }, 
      { status: 500 }
    );
  }
}
