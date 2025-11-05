// Configuration file for QuizMaster app
// Environment configuration and constants

// Supabase Configuration
const SUPABASE_CONFIG = {
    url: 'https://pszvnyeagnbzgojrxcwk.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzenZueWVhZ25iemdvanJ4Y3drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODA0MTksImV4cCI6MjA3Nzg1NjQxOX0.yqmyF9e4E8dgPigYnQ90Vjnn5VQjVUQpoRWh-Ki49R8',
};

// App Configuration
const APP_CONFIG = {
    name: 'QuizMaster',
    version: '1.0.0',
    environment: 'development', // 'development' | 'staging' | 'production'
    
    // Quiz Settings
    quiz: {
        questionsPerQuiz: 10,
        timePerQuestion: 30, // seconds
        categories: [
            'General Knowledge',
            'Science',
            'History',
            'Geography',
            'Sports',
            'Entertainment',
            'Technology',
            'Literature',
            'Art',
            'Music'
        ],
        difficulties: ['easy', 'medium', 'hard'],
        pointsSystem: {
            easy: 10,
            medium: 20,
            hard: 30,
            bonusMultiplier: 1.5, // Bonus for consecutive correct answers
            penaltyPercentage: 0.1 // 10% penalty for wrong answers
        }
    },
    
    // UI Settings
    ui: {
        animationDuration: 300,
        toastDuration: 4000,
        themes: ['light', 'dark'],
        defaultTheme: 'light'
    },
    
    // Performance Settings
    performance: {
        maxRetries: 3,
        retryDelay: 1000,
        cacheTimeout: 300000, // 5 minutes
        loadTimeout: 10000 // 10 seconds
    },
    
    // Security Settings
    security: {
        passwordMinLength: 8,
        sessionTimeout: 3600000, // 1 hour in milliseconds
        maxLoginAttempts: 5,
        lockoutDuration: 900000 // 15 minutes
    }
};

// API Endpoints (if using custom endpoints)
const API_ENDPOINTS = {
    auth: {
        login: '/auth/login',
        register: '/auth/register',
        logout: '/auth/logout',
        refresh: '/auth/refresh'
    },
    quiz: {
        questions: '/api/questions',
        submit: '/api/quiz/submit',
        results: '/api/quiz/results'
    },
    leaderboard: {
        global: '/api/leaderboard',
        user: '/api/leaderboard/user'
    },
    profile: {
        get: '/api/profile',
        update: '/api/profile/update',
        stats: '/api/profile/stats'
    }
};

// Error Messages
const ERROR_MESSAGES = {
    auth: {
        invalidCredentials: 'Invalid email or password',
        emailExists: 'An account with this email already exists',
        weakPassword: 'Password must be at least 8 characters long',
        networkError: 'Network error. Please check your connection',
        sessionExpired: 'Your session has expired. Please log in again'
    },
    quiz: {
        loadFailed: 'Failed to load quiz questions',
        submitFailed: 'Failed to submit quiz answers',
        noQuestions: 'No questions available for this category'
    },
    general: {
        unexpectedError: 'An unexpected error occurred',
        serverError: 'Server error. Please try again later',
        validationError: 'Please check your input and try again'
    }
};

// Success Messages
const SUCCESS_MESSAGES = {
    auth: {
        loginSuccess: 'Welcome back!',
        registerSuccess: 'Account created successfully!',
        logoutSuccess: 'Logged out successfully'
    },
    quiz: {
        submitted: 'Quiz submitted successfully!',
        completed: 'Congratulations on completing the quiz!'
    },
    profile: {
        updated: 'Profile updated successfully!'
    }
};

// Local Storage Keys
const STORAGE_KEYS = {
    theme: 'quizmaster_theme',
    user: 'quizmaster_user',
    settings: 'quizmaster_settings',
    cache: 'quizmaster_cache'
};

// Export configuration for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SUPABASE_CONFIG,
        APP_CONFIG,
        API_ENDPOINTS,
        ERROR_MESSAGES,
        SUCCESS_MESSAGES,
        STORAGE_KEYS
    };
}

// Development mode logging
if (APP_CONFIG.environment === 'development') {
    console.log('QuizMaster Config Loaded:', {
        version: APP_CONFIG.version,
        environment: APP_CONFIG.environment,
        supabaseConfigured: !!SUPABASE_CONFIG.url && SUPABASE_CONFIG.url !== 'YOUR_SUPABASE_URL'
    });
}