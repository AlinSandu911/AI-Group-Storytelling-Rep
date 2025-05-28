'use client';

import { use } from 'react';
import StoryPlayer from '@/components/story/StoryPlayer';

/**
 * Story Player page component (App Router, Next.js 15+)
 * 
 * @param {Object} props
 * @param {Promise<{ id: string }>} props.params - Async route params
 * @returns {JSX.Element}
 */
export default function StoryPlayerPage({ params }) {
  const { id } = use(params); // ✅ unwrap o Promise do params
  return <StoryPlayer storyId={id} />;
}
