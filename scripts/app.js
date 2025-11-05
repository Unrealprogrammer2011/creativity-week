// Main Application Entry Point for QuizMaster

/**
 * Main Application class
 * Coordinates all app components and manages application lifecycle
 */
class QuizMasterApp {
    constructor() {
        this.isInitialized = false;
        this.components = {
            auth: null,
            ui: null,
            quiz: null,
            leaderboard: null
        };
        
        // Initialize the application
        this.initialize();
    }

    /**
     * Initialize the application
     */
    async initialize() {
        try {
            console.log('🚀 Initializing QuizMaster App...');
            
            // Wait for DOM to be ready
            await this.waitForDOM();
            
            // Initialize components
            await this.initializeComponents();
            
            // Set up global error handling
            this.setupErrorHandling();
            
            // Set up performance monitoring
            this.setupPerformanceMonitoring();
            
            // Initialize authentication
            await this.initializeAuth();
            
            // Mark as initialized
            this.isInitialized = true;
            
            console.log('✅ QuizMaster App initialized successfully');
            
            // Dispatch ready event
            this.dispatchReadyEvent();
            
        } catch (error) {
            console.error('❌ Failed to initialize QuizMaster App:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Wait for DOM to be ready
     * @returns {Promise} Promise that resolves when DOM is ready
     */
    waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }

    /**
     * Initialize all application components
     */
    async initializeComponents() {
        console.log('🔧 Initializing components...');
        
        // Components are already initialized globally
        // Just store references
        this.components.auth = window.authManager;
        this.components.ui = window.uiManager;
        
        // Quiz and leaderboard components will be initialized later
        // when their respective modules are loaded
        
        console.log('✅ Components initialized');
    }

    /**
     * Set up global error handling
     */
    setupErrorHandling() {
        // Handle uncaught errors
        window.addEventListener('error', (event) => {
            console.error('Uncaught error:', event.error);
            this.handleGlobalError(event.error);
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.handleGlobalError(event.reason);
        });
    }

    /**
     * Set up performance monitoring
     */
    setupPerformanceMonitoring() {
        // Monitor page load performance
        window.addEventListener('load', () => {
            if (window.performance && window.performance.timing) {
                const timing = window.performance.timing;
                const loadTime = timing.loadEventEnd - timing.navigationStart;
                console.log(`📊 Page load time: ${loadTime}ms`);
                
                // Log performance metrics
                this.logPerformanceMetrics(timing);
            }
        });

        // Monitor resource loading
        if (window.performance && window.performance.getEntriesByType) {
            const resources = window.performance.getEntriesByType('resource');
            resources.forEach(resource => {
                if (resource.duration > 1000) {
                    console.warn(`⚠️ Slow resource: ${resource.name} (${resource.duration}ms)`);
                }
            });
        }
    }

    /**
     * Initialize authentication
     */
    async initializeAuth() {
        console.log('🔐 Initializing authentication...');
        
        if (this.components.auth) {
            await this.components.auth.initialize();
        }
        
        console.log('✅ Authentication initialized');
    }

    /**
     * Handle global errors
     * @param {Error} error - Error object
     */
    handleGlobalError(error) {
        // Log error details
        console.error('Global error handler:', {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });

        // Show user-friendly error message
        if (this.components.ui) {
            this.components.ui.showNotification(
                'error',
                'Something went wrong',
                'An unexpected error occurred. Please refresh the page and try again.',
                8000
            );
        }

        // In production, you might want to send error reports to a service
        if (APP_CONFIG.environment === 'production') {
            this.reportError(error);
        }
    }

    /**
     * Handle initialization errors
     * @param {Error} error - Initialization error
     */
    handleInitializationError(error) {
        // Show critical error message
        const errorContainer = document.createElement('div');
        errorContainer.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: #f8fafc;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            ">
                <div style="
                    background: white;
                    padding: 2rem;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    max-width: 400px;
                    text-align: center;
                ">
                    <h2 style="color: #ef4444; margin-bottom: 1rem;">
                        ⚠️ Initialization Failed
                    </h2>
                    <p style="color: #6b7280; margin-bottom: 1.5rem;">
                        QuizMaster failed to initialize properly. Please refresh the page and try again.
                    </p>
                    <button onclick="window.location.reload()" style="
                        background: #6366f1;
                        color: white;
                        border: none;
                        padding: 0.75rem 1.5rem;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 1rem;
                    ">
                        Refresh Page
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(errorContainer);
    }

    /**
     * Log performance metrics
     * @param {PerformanceTiming} timing - Performance timing object
     */
    logPerformanceMetrics(timing) {
        const metrics = {
            dns: timing.domainLookupEnd - timing.domainLookupStart,
            connection: timing.connectEnd - timing.connectStart,
            request: timing.responseStart - timing.requestStart,
            response: timing.responseEnd - timing.responseStart,
            domProcessing: timing.domComplete - timing.domLoading,
            totalLoad: timing.loadEventEnd - timing.navigationStart
        };

        console.log('📊 Performance Metrics:', metrics);

        // Warn about slow metrics
        if (metrics.totalLoad > 3000) {
            console.warn('⚠️ Slow page load detected');
        }
        if (metrics.dns > 1000) {
            console.warn('⚠️ Slow DNS lookup detected');
        }
        if (metrics.request > 2000) {
            console.warn('⚠️ Slow server response detected');
        }
    }

    /**
     * Report error to external service (placeholder)
     * @param {Error} error - Error to report
     */
    reportError(error) {
        // In a real application, you would send this to an error reporting service
        // like Sentry, LogRocket, or a custom endpoint
        console.log('📤 Would report error to external service:', {
            message: error.message,
            stack: error.stack,
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Dispatch application ready event
     */
    dispatchReadyEvent() {
        const event = new CustomEvent('quizmasterReady', {
            detail: {
                app: this,
                components: this.components,
                version: APP_CONFIG.version
            }
        });
        
        window.dispatchEvent(event);
    }

    /**
     * Get application status
     * @returns {Object} Application status
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            components: Object.keys(this.components).reduce((status, key) => {
                status[key] = !!this.components[key];
                return status;
            }, {}),
            version: APP_CONFIG.version,
            environment: APP_CONFIG.environment
        };
    }

    /**
     * Restart application
     */
    restart() {
        console.log('🔄 Restarting QuizMaster App...');
        window.location.reload();
    }

    /**
     * Clean up application resources
     */
    cleanup() {
        console.log('🧹 Cleaning up QuizMaster App...');
        
        // Clean up components
        Object.values(this.components).forEach(component => {
            if (component && typeof component.cleanup === 'function') {
                component.cleanup();
            }
        });
        
        // Remove event listeners
        window.removeEventListener('error', this.handleGlobalError);
        window.removeEventListener('unhandledrejection', this.handleGlobalError);
        
        this.isInitialized = false;
    }
}

// Initialize the application when the script loads
const quizMasterApp = new QuizMasterApp();

// Make app instance available globally for debugging
window.quizMasterApp = quizMasterApp;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuizMasterApp;
}

// Add some helpful global functions for development
if (APP_CONFIG.environment === 'development') {
    window.debugQuizMaster = {
        getStatus: () => quizMasterApp.getStatus(),
        restart: () => quizMasterApp.restart(),
        cleanup: () => quizMasterApp.cleanup(),
        showNotification: (type, title, message) => {
            if (window.uiManager) {
                window.uiManager.showNotification(type, title, message);
            }
        },
        toggleTheme: () => {
            if (window.uiManager) {
                window.uiManager.toggleTheme();
            }
        }
    };
    
    console.log('🛠️ Development mode: debugQuizMaster object available in console');
}

// Log successful script load
console.log('📜 QuizMaster App script loaded successfully');