This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# AI Bedtime Story Teller

AI Bedtime Story Teller is a web application designed to help parents create engaging bedtime stories for their children using AI-generated content. The system allows parents to write or generate stories, convert them to audio (via text-to-speech), and save both the text and the audio files for future playback. Children have their own restricted access, where they can only play and listen to the saved stories without the ability to create or modify them.

## Features

- **Secure User Authentication:** Separate parent and child accounts with role-specific permissions
- **Story Creation & Management:** Simple interface to compose or generate AI-powered stories
- **Text-to-Speech Integration:** Convert stories into audio for an immersive experience
- **User-Friendly Playback:** Child-friendly interface for browsing and playing audio stories
- **Scalability & Reliability:** Built with Firebase and Next.js for a responsive, secure platform

## Technology Stack

- **Frontend:** React + Next.js
- **Backend:** Firebase (Authentication, Firestore, Storage)
- **AI Integration:** OpenAI API for content generation
- **Text-to-Speech:** Google Cloud Text-to-Speech API
- **Styling:** Tailwind CSS

## Project Structure

```
AI-BEDTIME-STORY/
├── .next/                 # Next.js build output
├── node_modules/          # Project dependencies
├── public/                # Static assets
├── src/                   # Source code
│   ├── app/               # Next.js app directory
│   │   ├── about/         # About page
│   │   ├── contact/       # Contact page
│   │   ├── create-story/  # Story creation page
│   │   ├── dashboard/     # Parent dashboard
│   │   ├── edit-story/    # Story editing page
│   │   ├── kid-dashboard/ # Child dashboard
│   │   ├── login/         # Login page
│   │   ├── my-stories/    # Story management page
│   │   ├── play-story/    # Story player page
│   │   ├── profile/       # User profile page
│   │   ├── register/      # Registration page
│   │   ├── settings/      # Settings page
│   │   ├── globals.css    # Global CSS styles
│   │   ├── layout.js      # Root layout component
│   │   └── page.js        # Home page
│   ├── components/        # Reusable components
│   │   ├── auth/          # Authentication components
│   │   └── common/        # Common UI components
│   ├── contexts/          # React contexts
│   │   └── AuthContext.js # Authentication context
│   ├── firebase/          # Firebase configuration and utilities
│   │   ├── auth.js        # Authentication functions
│   │   ├── firebaseConfig.js # Firebase initialization
│   │   └── firestore.js   # Firestore database functions
│   ├── hooks/             # Custom React hooks
│   │   ├── useAIStoryGeneration.js # AI story generation hook
│   │   └── useTextToSpeech.js # Text-to-speech hook
│   └── utils/             # Utility functions and constants
│       ├── constants.js   # Application constants
│       ├── helpers.js     # Helper functions
│       └── middleware.js  # Authentication middleware
├── .env.local             # Environment variables (not in repo)
├── .gitignore             # Git ignore file
├── middleware.js          # Root middleware for route protection
├── next.config.js         # Next.js configuration
├── package.json           # Project dependencies and scripts
├── README.md              # Project documentation
└── tailwind.config.js     # Tailwind CSS configuration
```

## Getting Started

### Prerequisites

- Node.js (v14.x or later)
- npm or yarn
- Firebase account
- OpenAI API key
- Google Cloud account with Text-to-Speech API enabled

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/ai-bedtime-story.git
   cd ai-bedtime-story
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following:
   ```
   # Firebase
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

   # OpenAI
   NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
   NEXT_PUBLIC_OPENAI_API_ENDPOINT=https://api.openai.com/v1/chat/completions

   # Google Cloud TTS
   NEXT_PUBLIC_GOOGLE_TTS_API_KEY=your_google_tts_api_key
   NEXT_PUBLIC_GOOGLE_TTS_API_ENDPOINT=https://texttospeech.googleapis.com/v1/text:synthesize
   ```

4. Run the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password provider
3. Create a Firestore database
4. Set up Storage for audio files
5. Add the Firebase configuration to your environment variables

## Usage

### Parent Account

1. **Register**: Create a parent account
2. **Dashboard**: View story statistics and quick actions
3. **Create Story**: 
   - Write a story manually
   - Generate a story using AI by providing a prompt, age group, and other parameters
   - Convert the story to audio using Text-to-Speech
4. **Manage Stories**: View, edit, play, or delete your stories
5. **Settings**: Update your profile and preferences

### Child Account

1. **Register**: A parent creates a child account linked to their family
2. **Dashboard**: View available stories
3. **Play Story**: Listen to stories with a child-friendly audio player

## Contributing

We welcome contributions to improve the AI Bedtime Story Teller! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Firebase](https://firebase.google.com/) - Backend services
- [OpenAI](https://openai.com/) - AI text generation
- [Google Cloud Text-to-Speech](https://cloud.google.com/text-to-speech) - Text-to-speech conversion
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework"# AI-Group-Storytelling-Rep" 
