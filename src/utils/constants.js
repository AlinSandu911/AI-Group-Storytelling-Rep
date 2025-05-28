/**
 * Application constants
 */

//User roles
export const USER_ROLES = {
    PARENT: 'parent',
    CHILD: 'child',
};

//Sgtory Lewngths
export const STORY_LENGTHS = {
    SHORT: 'short', // 3-5 minutes to read
    MEDIUM: 'medium', // 5-10 minutes to read
    LONG: 'long' // 10-15 minutes to read
};

//Age groups
export const AGE_GROUPS = {
    TODDLER: '2-4 years',
    PRESCHOOL: '4-6 years',
    EARLY_READER: '6-8 years',
    MIDDLE_GRADE: '8-12 years'
};

//Voice options for text-to-speech
export const VOICE_OPTIONS = [
    { id: 'en-US-Wavenet-A', label: 'Female (US)', gender: 'female', languageCode: 'en-US' },
    { id: 'en-US-Wavenet-D', label: 'Male (US)', gender: 'male', languageCode: 'en-US' },
    { id: 'en-GB-Wavenet-A', label: 'Female (UK)', gender: 'female', languageCode: 'en-GB' },
    { id: 'en-GB-Wavenet-D', label: 'Male (UK)', gender: 'male', languageCode: 'en-GB' },
    { id: 'en-AU-Wavenet-A', label: 'Female (Australian)', gender: 'female', languageCode: 'en-AU' },
    { id: 'en-AU-Wavenet-D', label: 'Male (Australian)', gender: 'male', languageCode: 'en-AU' }
];


//Story themes/categories
export const STORY_THEMES = [
    'Adventure',
    'Fantasy',
    'Animals',
    'Friendship',
    'Space',
    'Ocean',
    'Nature',
    'Magic',
    'Family',
    'Holidays',
    'Superheroes',
    'Fairy Tales',
    'Dinosaurs',
    'Science',
    'Sports'
];

//Mood options for story generation
export const STORY_MOODS = [
    'Happy',
    'Exciting',
    'Calm',
    'Mysterious',
    'Funny',
    'Educational',
    'Magical',
    'Adventurous'
];

///API configuration (these would typically come from enviroment variables)
export const API_CONFIGS = {
    AI_STORY: {
        // For OpenAI
        ENDPOINT: '/api/generate-story',
        KEY: '',
    },
    TTS: {
        // For Google Cloud TTS - now using our internal API route instead of direct API access
        ENDPOINT: '/api/tts',
        KEY: '' // No need to expose API key on client since we're using a server route
    }
};

//Rout paths
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    DASHBOARD_PARENT: '/dashboard',
    DASHBOARD_CHILD: '/kid-dashboard',
    CREATE_STORY: '/create-story',
    EDIT_STORY: '/edit-story',
    MY_STORIES: '/my-stories',
    PLAY_STORY: '/play-story',
    PROFILE: '/profile',
    SETTINGS: '/settings',
    ABOUT: '/about',
    CONTACT: '/contact',
    FORGOT_PASSWORD: '/forgot-password'
};

//Local storage keys
export const STORAGE_KEYS = {
    THEME: 'ai-bedtime-theme',
    RECENT_STORIES: 'ai-bedtime-recent-stories',
    DRAFT_STORY: 'ai-bedtime-draft-story'
};
