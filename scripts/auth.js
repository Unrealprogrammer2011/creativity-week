// Authentication Manager for QuizMaster app

/**
 * Authentication Manager class
 * Handles all authentication-related operations using Supabase
 */
class AuthManager {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.authListeners = [];
        this.isInitialized = false;
        
        // Initialize Supabase client
        this.initializeSupabase();
        
        // Set up authentication state listener
        this.setupAuthListener();
    }

    /**
     * Initialize Supabase client
     */
    initializeSupabase() {
        try {
            if (typeof supabase === 'undefined') {
                throw new Error('Supabase library not loaded');
            }

            if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
                throw new Error('Supabase configuration missing. Please update config.js with your Supabase credentials.');
            }

            if (SUPABASE_CONFIG.url === 'YOUR_SUPABASE_URL' || SUPABASE_CONFIG.anonKey === 'YOUR_SUPABASE_ANON_KEY') {
                console.warn('⚠️ Please update SUPABASE_CONFIG in config.js with your actual Supabase credentials');
                // For development, we'll create a mock client
                this.createMockClient();
                return;
            }

            this.supabase = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
            this.isInitialized = true;
            
            console.log('✅ Supabase client initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Supabase client:', error);
            this.createMockClient();
        }
    }

    /**
     * Create mock client for development/demo purposes
     */
    createMockClient() {
        console.log('🔧 Creating mock Supabase client for development');
        this.supabase = {
            auth: {
                signUp: async (credentials) => {
                    console.log('Mock signUp:', credentials);
                    return {
                        data: {
                            user: {
                                id: Utils.generateUUID(),
                                email: credentials.email,
                                user_metadata: { username: credentials.username }
                            }
                        },
                        error: null
                    };
                },
                signInWithPassword: async (credentials) => {
                    console.log('Mock signIn:', credentials);
                    return {
                        data: {
                            user: {
                                id: Utils.generateUUID(),
                                email: credentials.email,
                                user_metadata: { username: 'demo_user' }
                            }
                        },
                        error: null
                    };
                },
                signOut: async () => {
                    console.log('Mock signOut');
                    return { error: null };
                },
                getUser: async () => {
                    return { data: { user: this.currentUser }, error: null };
                },
                onAuthStateChange: (callback) => {
                    console.log('Mock auth state change listener set up');
                    return { data: { subscription: { unsubscribe: () => {} } } };
                }
            }
        };
    }

    /**
     * Set up authentication state listener
     */
    setupAuthListener() {
        if (this.supabase && this.supabase.auth) {
            this.supabase.auth.onAuthStateChange((event, session) => {
                console.log('Auth state changed:', event, session?.user?.email);
                
                this.currentUser = session?.user || null;
                
                // Notify all listeners
                this.authListeners.forEach(listener => {
                    try {
                        listener(event, session);
                    } catch (error) {
                        console.error('Error in auth listener:', error);
                    }
                });

                // Update UI based on auth state
                this.updateUIForAuthState(event, session);
            });
        }
    }

    /**
     * Add authentication state change listener
     * @param {Function} callback - Callback function to execute on auth state change
     * @returns {Function} Unsubscribe function
     */
    onAuthStateChange(callback) {
        this.authListeners.push(callback);
        
        // Return unsubscribe function
        return () => {
            const index = this.authListeners.indexOf(callback);
            if (index > -1) {
                this.authListeners.splice(index, 1);
            }
        };
    }

    /**
     * Register a new user
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {string} username - User username
     * @returns {Promise<Object>} Registration result
     */
    async register(email, password, username) {
        try {
            // Validate input using security manager
            if (window.securityManager) {
                const emailValidation = window.securityManager.validateInput(email, 'email');
                if (!emailValidation.isValid) {
                    throw new Error(emailValidation.errors[0]);
                }

                const usernameValidation = window.securityManager.validateInput(username, 'username');
                if (!usernameValidation.isValid) {
                    throw new Error(usernameValidation.errors[0]);
                }

                const passwordValidation = window.securityManager.validateInput(password, 'password');
                if (!passwordValidation.isValid) {
                    throw new Error(passwordValidation.errors[0]);
                }

                // Use sanitized values
                email = emailValidation.sanitized;
                username = usernameValidation.sanitized;
            } else {
                // Fallback validation
                if (!this.isValidEmail(email)) {
                    throw new Error('Please enter a valid email address');
                }

                if (!this.isValidPassword(password)) {
                    throw new Error('Password must be at least 8 characters long and contain uppercase, lowercase, and numbers');
                }

                if (!username || username.trim().length < 3) {
                    throw new Error('Username must be at least 3 characters long');
                }
            }

            // Attempt registration
            const { data, error } = await this.supabase.auth.signUp({
                email: email.trim().toLowerCase(),
                password: password,
                options: {
                    data: {
                        username: username.trim()
                    }
                }
            });

            if (error) {
                throw error;
            }

            // Create user profile
            if (data.user) {
                await this.createUserProfile(data.user, username.trim());
            }

            console.log('✅ User registered successfully:', data.user?.email);
            
            return {
                success: true,
                user: data.user,
                message: SUCCESS_MESSAGES.auth.registerSuccess
            };

        } catch (error) {
            console.error('❌ Registration failed:', error);
            
            const errorMessage = window.errorHandler ? 
                window.errorHandler.handleAuthError(error) : 
                this.getErrorMessage(error);
            
            return {
                success: false,
                error: errorMessage,
                message: errorMessage
            };
        }
    }

    /**
     * Sign in user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} Login result
     */
    async login(email, password) {
        try {
            // Check rate limiting
            if (window.securityManager) {
                const rateLimitOk = window.securityManager.checkRateLimit('login', email, 5);
                if (!rateLimitOk) {
                    throw new Error('Too many login attempts. Please wait a moment and try again.');
                }
            }

            // Validate input
            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            if (window.securityManager) {
                const emailValidation = window.securityManager.validateInput(email, 'email');
                if (!emailValidation.isValid) {
                    throw new Error(emailValidation.errors[0]);
                }
                email = emailValidation.sanitized;
            } else if (!this.isValidEmail(email)) {
                throw new Error('Please enter a valid email address');
            }

            // Attempt login
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: email.trim().toLowerCase(),
                password: password
            });

            if (error) {
                throw error;
            }

            console.log('✅ User logged in successfully:', data.user?.email);
            
            return {
                success: true,
                user: data.user,
                message: SUCCESS_MESSAGES.auth.loginSuccess
            };

        } catch (error) {
            console.error('❌ Login failed:', error);
            
            const errorMessage = window.errorHandler ? 
                window.errorHandler.handleAuthError(error) : 
                this.getErrorMessage(error);
            
            return {
                success: false,
                error: errorMessage,
                message: errorMessage
            };
        }
    }

    /**
     * Sign out user
     * @returns {Promise<Object>} Logout result
     */
    async logout() {
        try {
            const { error } = await this.supabase.auth.signOut();
            
            if (error) {
                throw error;
            }

            console.log('✅ User logged out successfully');
            
            return {
                success: true,
                message: SUCCESS_MESSAGES.auth.logoutSuccess
            };

        } catch (error) {
            console.error('❌ Logout failed:', error);
            
            return {
                success: false,
                error: this.getErrorMessage(error),
                message: this.getErrorMessage(error)
            };
        }
    }

    /**
     * Get current user
     * @returns {Object|null} Current user or null
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} Is authenticated
     */
    isAuthenticated() {
        return !!this.currentUser;
    }

    /**
     * Get current user session
     * @returns {Promise<Object>} Session data
     */
    async getSession() {
        try {
            const { data, error } = await this.supabase.auth.getSession();
            
            if (error) {
                throw error;
            }

            return {
                success: true,
                session: data.session
            };

        } catch (error) {
            console.error('❌ Failed to get session:', error);
            
            return {
                success: false,
                error: this.getErrorMessage(error)
            };
        }
    }

    /**
     * Create user profile in database
     * @param {Object} user - User object from Supabase
     * @param {string} username - Username
     */
    async createUserProfile(user, username) {
        try {
            // This would normally insert into the profiles table
            // For now, we'll just log it
            console.log('Creating user profile:', {
                id: user.id,
                email: user.email,
                username: username
            });

            // TODO: Implement actual database insertion when database is set up
            
        } catch (error) {
            console.error('❌ Failed to create user profile:', error);
        }
    }

    /**
     * Update UI based on authentication state
     * @param {string} event - Auth event type
     * @param {Object} session - Session object
     */
    updateUIForAuthState(event, session) {
        const authContainer = document.getElementById('auth-container');
        const appPages = document.getElementById('app-pages');
        const navbar = document.getElementById('navbar');
        const loadingScreen = document.getElementById('loading-screen');

        if (session?.user) {
            // User is authenticated
            if (authContainer) authContainer.classList.add('hidden');
            if (appPages) appPages.classList.remove('hidden');
            if (navbar) navbar.classList.remove('hidden');
            if (loadingScreen) loadingScreen.classList.add('fade-out');
            
            // Update navbar with user info
            this.updateNavbarUserInfo(session.user);
            
        } else {
            // User is not authenticated
            if (authContainer) authContainer.classList.remove('hidden');
            if (appPages) appPages.classList.add('hidden');
            if (navbar) navbar.classList.add('hidden');
            if (loadingScreen) loadingScreen.classList.add('fade-out');
        }
    }

    /**
     * Update navbar with user information
     * @param {Object} user - User object
     */
    updateNavbarUserInfo(user) {
        // This will be implemented when we have the navbar UI ready
        console.log('Updating navbar for user:', user.email);
    }

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} Is valid email
     */
    isValidEmail(email) {
        return Utils.isValidEmail(email);
    }

    /**
     * Validate password strength
     * @param {string} password - Password to validate
     * @returns {boolean} Is valid password
     */
    isValidPassword(password) {
        const validation = Utils.validatePassword(password);
        return validation.score >= 3; // Require at least 'good' strength
    }

    /**
     * Get user-friendly error message
     * @param {Error|Object} error - Error object
     * @returns {string} User-friendly error message
     */
    getErrorMessage(error) {
        if (typeof error === 'string') {
            return error;
        }

        if (error.message) {
            // Map common Supabase errors to user-friendly messages
            const message = error.message.toLowerCase();
            
            if (message.includes('invalid login credentials')) {
                return ERROR_MESSAGES.auth.invalidCredentials;
            }
            
            if (message.includes('user already registered')) {
                return ERROR_MESSAGES.auth.emailExists;
            }
            
            if (message.includes('password')) {
                return ERROR_MESSAGES.auth.weakPassword;
            }
            
            if (message.includes('network') || message.includes('fetch')) {
                return ERROR_MESSAGES.auth.networkError;
            }
            
            return error.message;
        }

        return ERROR_MESSAGES.general.unexpectedError;
    }

    /**
     * Initialize authentication on page load
     */
    async initialize() {
        try {
            // Check for existing session
            const { session } = await this.getSession();
            
            if (session) {
                this.currentUser = session.user;
                console.log('✅ Existing session found:', session.user.email);
            } else {
                console.log('ℹ️ No existing session found');
            }

            // Hide loading screen after a short delay
            setTimeout(() => {
                const loadingScreen = document.getElementById('loading-screen');
                if (loadingScreen) {
                    loadingScreen.classList.add('fade-out');
                    setTimeout(() => {
                        loadingScreen.style.display = 'none';
                    }, 300);
                }
            }, 1000);

        } catch (error) {
            console.error('❌ Failed to initialize authentication:', error);
        }
    }
}

// Create global instance
const authManager = new AuthManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}

// Make available globally
window.AuthManager = AuthManager;
window.authManager = authManager;