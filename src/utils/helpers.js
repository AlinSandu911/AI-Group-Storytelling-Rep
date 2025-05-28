/**
 * General utility helper functions
 */

/**
 * Format a timestamp into a readable date/time
 * 
 * @param {Date|Object} timestamp - Date object or Firestore timestamp
 * @param {Object} options - Formatting options
 * @param {boolean} [options.includeTime=false] - Whether to include time
 * @returns {string} Formatted date string
 */
export const formatDate = (timestamp, { includeTime = false } = {}) => {
    if (!timestamp) return 'Unknown date';
    
    try {
        let date;
        
        // Handle Firestore timestamp
        if (typeof timestamp === 'object' && 'seconds' in timestamp) {
            date = new Date(timestamp.seconds * 1000);
        } else {
            date = new Date(timestamp);
        }
        
        // Format options
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        
        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }
        
        return date.toLocaleDateString(undefined, options);
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid date';
    }
};

/**
 * Generate an excerpt from a longer text
 * 
 * @param {string} text - Full text
 * @param {number} [maxLength=150] - Maximum length of the excerpt
 * @returns {string} Text excerpt with ellipsis if truncated
 */
export const generateExcerpt = (text, maxLength = 150) => {
    if (!text) return '';
    
    if (text.length <= maxLength) {
        return text;
    }
    
    // Try to find a good break point (end of sentence or space)
    let breakPoint = text.lastIndexOf('.', maxLength);
    if (breakPoint === -1 || breakPoint < maxLength - 30) {
        breakPoint = text.lastIndexOf(' ', maxLength);
    }
    
    if (breakPoint === -1) {
        breakPoint = maxLength;
    }
    
    return text.substring(0, breakPoint) + '...';
};

/**
 * Calculate estimated reading time
 * 
 * @param {string} text - Text content
 * @param {number} [wordsPerMinute=200] - Average reading speed
 * @returns {string} Formatted reading time
 */
export const calculateReadingTime = (text, wordsPerMinute = 200) => {
    if (!text) return '0 min read';
    
    const wordCount = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    
    return `${minutes} min read`;
};

/**
 * Extract a title from story text (if not explicitly provided)
 * 
 * @param {string} text - Story text
 * @returns {Object} Object with title and content separated
 */
export const extractTitleFromText = (text) => {
    if (!text) return { title: '', content: '' };
    
    // Look for a title in the first line
    const lines = text.trim().split('\n');
    const firstLine = lines[0].trim();
    
    // Check if first line looks like a title (shorter than 60 chars, no period at end)
    if (firstLine.length < 60 && !firstLine.endsWith('.')) {
        return {
            title: firstLine,
            content: lines.slice(1).join('\n').trim()
        };
    }
    
    // No obvious title found
    return {
        title: '',
        content: text
    };
};

/**
 * Safely parse JSON with error handling
 * 
 * @param {string} json - JSON string to parse
 * @param {*} fallback - Fallback value if parsing fails
 * @returns {*} Parsed object or fallback value
 */
export const safeJsonParse = (json, fallback = null) => {
    try {
        return JSON.parse(json);
    } catch (error) {
        console.error('Error parsing JSON:', error);
        return fallback;
    }
};

/**
 * Generate a random ID (for temporary IDs before saving to database)
 * 
 * @param {number} [length=8] - Length of the ID
 * @returns {string} Random ID string
 */
export const generateRandomId = (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
};

/**
 * Validate email format
 * 
 * @param {string} email - Email to validate
 * @returns {boolean} Whether the email is valid
 */
export const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};

/**
 * Validate password strength
 * 
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid flag and message
 */
export const validatePassword = (password) => {
    if (!password || password.length < 8) {
        return {
            isValid: false,
            message: 'Password must be at least 8 characters long'
        };
    }
  
    // Check for at least one number and one letter
    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    
    if (!hasNumber || !hasLetter) {
        return {
            isValid: false,
            message: 'Password must contain at least one letter and one number'
        };
    }
    
    return {
        isValid: true,
        message: 'Password is strong'
    };
};

/**
 * Convert milliseconds to a formatted time string
 * 
 * @param {number} ms - Time in milliseconds
 * @returns {string} Formatted time string (MM:SS)
 */
export const formatTime = (ms) => {
    if (!ms) return '00:00';
    
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Save data to local storage with error handling
 * 
 * @param {string} key - Storage key
 * @param {*} data - Data to store (will be stringified)
 * @returns {boolean} Success status
 */
export const saveToLocalStorage = (key, data) => {
    try {
        const serialized = JSON.stringify(data);
        localStorage.setItem(key, serialized);
        return true;
    } catch (error) {
        console.error(`Error saving to localStorage (${key}):`, error);
        return false;
    }
};

/**
 * Load data from local storage with error handling
 * 
 * @param {string} key - Storage key
 * @param {*} fallback - Fallback value if loading fails
 * @returns {*} Parsed data or fallback value
 */
export const loadFromLocalStorage = (key, fallback = null) => {
    try {
        const serialized = localStorage.getItem(key);
        if (serialized === null) return fallback;
        return JSON.parse(serialized);
    } catch (error) {
        console.error(`Error loading from localStorage (${key}):`, error);
        return fallback;
    }
};