import { Geist, Geist_Mono, Inter } from "next/font/google";
import { AuthProvider } from '@/contexts/AuthContext';
import { FamilyProvider } from '@/contexts/FamilyContext';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { Analytics } from '@vercel/analytics/react'; // ✅ Import Vercel Analytics
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import "@/styles/globals.css";

// Configure font with optional subsets
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

/**
 * Root layout component that wraps all pages
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Root layout component
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <title>AI Bedtime Story</title>
        <meta name="description" content="Create magical bedtime stories for your children using AI" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <AuthProvider>
          <FamilyProvider>
            {children}
          </FamilyProvider>
        </AuthProvider>
        <Analytics /> {/* ✅ Added to track usage */}
      </body>
    </html>
  );
}

/**
 * Metadata for the app
 * Used by Next.js for SEO and other purposes
 */
export const metadata = {
  title: 'AI Bedtime Story',
  description: 'Create magical bedtime stories for your children using AI',
  keywords: 'bedtime story, children stories, AI stories, text to speech, bedtime, kids',
  authors: [{ name: 'AI Bedtime Story Team' }],
  creator: 'AI Bedtime Story',
  publisher: 'AI Bedtime Story',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'AI Bedtime Story',
    description: 'Create magical bedtime stories for your children using AI',
    url: 'https://aibedtimestory.com',
    siteName: 'AI Bedtime Story',
    images: [
      {
        url: 'https://aibedtimestory.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AI Bedtime Story',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Bedtime Story',
    description: 'Create magical bedtime stories for your children using AI',
    images: ['https://aibedtimestory.com/twitter-image.jpg'],
  },
};

export const viewport = {
  colorScheme: 'light',
};
