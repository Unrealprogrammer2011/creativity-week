// Error Handler for QuizMaster app
// Comprehensive error handling, logging, and user feedback system

/**
 * Error Handler class
 * Manages application errors, logging, and user-friendly error messages
 */
class ErrorHandler {
    constructor() {
        this.errorLog = [];
        this.maxLogSize = 100;
        this.retryAttempts = new Map();
        this.maxRetries = 3;
        
        console.log('🛡️ Error Handler initialized');
        
        // Set up global error handling
        this.setupGlobalErrorHandling();
    }

    /**
     * Set up global error handling
     */
    setupGlobalErrorHandling() {
        // Handle uncaught JavaScript errors
        window.addEventListener('error', (event) => {
            this.handleGlobalError({
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error,
                stack: event.error?.stack
            });
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleGlobalError({
                type: 'promise',
                message: event.reason?.message || 'Unhandled promise rejection',
                reason: event.reason,
                stack: event.reason?.stack
            });
        });

        // Handle network errors
        window.addEventListener('offline', () => {
            this.handleNetworkError('offline');
        });

        window.addEventListener('online', () => {
            this.handleNetworkError('online');
        });
    }

    /**
     * Handle global application errors
     * @param {Object} errorInfo - Error information
     */
    handleGlobalError(errorInfo) {
        // Log the error
        this.logError(errorInfo);

        // Show user-friendly message
        this.showUserFriendlyError(errorInfo);

        // Report to external service in production
        if (APP_CONFIG.environment === 'production') {
            this.reportError(errorInfo);
        }
    }

    /**
     * Handle authentication errors
     * @param {Error} error - Authentication error
     * @returns {string} User-friendly error message
     */
    handleAuthError(error) {
        const errorInfo = {
            type: 'authentication',
            originalError: error,
            message: error.message,
            code: error.code,
            timestamp: new Date().toISOString()
        };

        this.logError(errorInfo);

        // Map Supabase auth errors to user-friendly messages
        const authErrorMap = {
            'invalid_credentials': 'Invalid email or password. Please check your credentials and try again.',
            'email_not_confirmed': 'Please check your email and click the confirmation link before signing in.',
            'too_many_requests': 'Too many login attempts. Please wait a few minutes before trying again.',
            'user_not_found': 'No account found with this email address.',
            'email_address_invalid': 'Please enter a valid email address.',
            'password_too_short': 'Password must be at least 8 characters long.',
            'signup_disabled': 'New registrations are currently disabled.',
            'email_address_not_authorized': 'This email address is not authorized to access the application.'
        };

        const userMessage = authErrorMap[error.message] || 
                           authErrorMap[error.code] || 
                           'Authentication failed. Please try again.';

        this.showErrorNotification('Authentication Error', userMessage);
        return userMessage;
    }

    /**
     * Handle network errors
     * @param {string|Error} error - Network error or status
     */
    handleNetworkError(error) {
        const errorInfo = {
            type: 'network',
            originalError: error,
            message: typeof error === 'string' ? error : error.message,
            timestamp: new Date().toISOString(),
            isOnline: navigator.onLine
        };

        this.logError(errorInfo);

        if (typeof error === 'string') {
            if (error === 'offline') {
                this.showErrorNotification(
                    'Connection Lost', 
                    'You are currently offline. Some features may not work properly.',
                    'warning'
                );
            } else if (error === 'online') {
                this.showSuccessNotification(
                    'Connection Restored', 
                    'You are back online!'
                );
            }
        } else {
            this.showErrorNotification(
                'Network Error',
                'Unable to connect to the server. Please check your internet connection and try again.'
            );
        }
    }

    /**
     * Handle database errors
     * @param {Error} error - Database error
     * @returns {string} User-friendly error message
     */
    handleDatabaseError(error) {
        const errorInfo = {
            type: 'database',
            originalError: error,
            message: error.message,
            code: error.code,
            details: error.details,
            timestamp: new Date().toISOString()
        };

        this.logError(errorInfo);

        // Map common database errors
        const dbErrorMap = {
            'PGRST116': 'No data found.',
            'PGRST301': 'Insufficient permissions to access this data.',
            '23505': 'This data already exists.',
            '23503': 'Cannot delete this item because it is referenced by other data.',
            '42P01': 'Database table not found.',
            'connection_error': 'Unable to connect to the database.'
        };

        const userMessage = dbErrorMap[error.code] || 
                           'A database error occurred. Please try again later.';

        this.showErrorNotification('Data Error', userMessage);
        return userMessage;
    }

    /**
     * Handle API errors with retry logic
     * @param {Error} error - API error
     * @param {Function} retryFunction - Function to retry
     * @param {string} operationKey - Unique key for the operation
     * @returns {Promise<any>} Retry result or error
     */
    async handleApiError(error, retryFunction = null, operationKey = null) {
        const errorInfo = {
            type: 'api',
            originalError: error,
            message: error.message,
            status: error.status,
            statusText: error.statusText,
            timestamp: new Date().toISOString()
        };

        this.logError(errorInfo);

        // Check if we should retry
        if (retryFunction && operationKey && this.shouldRetry(error, operationKey)) {
            return await this.retryOperation(retryFunction, operationKey);
        }

        // Map HTTP status codes to user messages
        const statusMessages = {
            400: 'Invalid request. Please check your input and try again.',
            401: 'You are not authorized to perform this action.',
            403: 'Access denied. You do not have permission to access this resource.',
            404: 'The requested resource was not found.',
            408: 'Request timeout. Please try again.',
            429: 'Too many requests. Please wait a moment before trying again.',
            500: 'Server error. Please try again later.',
            502: 'Service temporarily unavailable. Please try again later.',
            503: 'Service unavailable. Please try again later.',
            504: 'Request timeout. Please try again later.'
        };

        const userMessage = statusMessages[error.status] || 
                           'An unexpected error occurred. Please try again.';

        this.showErrorNotification('Request Failed', userMessage);
        return Promise.reject(error);
    }

    /**
     * Handle validation errors
     * @param {Object} validationErrors - Validation error object
     */
    handleValidationErrors(validationErrors) {
        const errorInfo = {
            type: 'validation',
            errors: validationErrors,
            timestamp: new Date().toISOString()
        };

        this.logError(errorInfo);

        // Show validation errors in form
        Object.entries(validationErrors).forEach(([field, message]) => {
            this.showFieldError(field, message);
        });
    }

    /**
     * Show field-specific error
     * @param {string} fieldId - Field ID
     * @param {string} message - Error message
     */
    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(`${fieldId}-error`);

        if (field) {
            field.classList.add('error');
            field.classList.add('feedback-error');
        }

        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }

        // Auto-clear error after user interaction
        if (field) {
            const clearError = () => {
                field.classList.remove('error', 'feedback-error');
                if (errorElement) {
                    errorElement.classList.remove('show');
                }
                field.removeEventListener('input', clearError);
                field.removeEventListener('focus', clearError);
            };

            field.addEventListener('input', clearError);
            field.addEventListener('focus', clearError);
        }
    }

    /**
     * Check if operation should be retried
     * @param {Error} error - Error object
     * @param {string} operationKey - Operation key
     * @returns {boolean} Should retry
     */
    shouldRetry(error, operationKey) {
        // Don't retry client errors (4xx)
        if (error.status >= 400 && error.status < 500) {
            return false;
        }

        // Check retry count
        const attempts = this.retryAttempts.get(operationKey) || 0;
        return attempts < this.maxRetries;
    }

    /**
     * Retry operation with exponential backoff
     * @param {Function} operation - Operation to retry
     * @param {string} operationKey - Operation key
     * @returns {Promise<any>} Operation result
     */
    async retryOperation(operation, operationKey) {
        const attempts = this.retryAttempts.get(operationKey) || 0;
        this.retryAttempts.set(operationKey, attempts + 1);

        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempts) * 1000;
        
        await new Promise(resolve => setTimeout(resolve, delay));

        try {
            const result = await operation();
            // Clear retry count on success
            this.retryAttempts.delete(operationKey);
            return result;
        } catch (error) {
            // If max retries reached, clear count and throw
            if (attempts >= this.maxRetries - 1) {
                this.retryAttempts.delete(operationKey);
                throw error;
            }
            // Otherwise, let it retry
            throw error;
        }
    }

    /**
     * Show error notification to user
     * @param {string} title - Error title
     * @param {string} message - Error message
     * @param {string} type - Notification type
     */
    showErrorNotification(title, message, type = 'error') {
        if (window.uiManager) {
            window.uiManager.showNotification(type, title, message, 6000);
        }
    }

    /**
     * Show success notification to user
     * @param {string} title - Success title
     * @param {string} message - Success message
     */
    showSuccessNotification(title, message) {
        if (window.uiManager) {
            window.uiManager.showNotification('success', title, message, 4000);
        }
    }

    /**
     * Show user-friendly error message
     * @param {Object} errorInfo - Error information
     */
    showUserFriendlyError(errorInfo) {
        let title = 'Something went wrong';
        let message = 'An unexpected error occurred. Please try refreshing the page.';

        switch (errorInfo.type) {
            case 'javascript':
                title = 'Application Error';
                message = 'A technical error occurred. Please refresh the page and try again.';
                break;
            case 'promise':
                title = 'Operation Failed';
                message = 'An operation failed to complete. Please try again.';
                break;
            case 'network':
                title = 'Connection Error';
                message = 'Unable to connect to the server. Please check your internet connection.';
                break;
        }

        this.showErrorNotification(title, message);
    }

    /**
     * Log error to internal log
     * @param {Object} errorInfo - Error information
     */
    logError(errorInfo) {
        // Add to internal log
        this.errorLog.unshift({
            ...errorInfo,
            id: Utils.generateUUID(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: errorInfo.timestamp || new Date().toISOString()
        });

        // Limit log size
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog = this.errorLog.slice(0, this.maxLogSize);
        }

        // Console log in development
        if (APP_CONFIG.environment === 'development') {
            console.error('Error logged:', errorInfo);
        }
    }

    /**
     * Report error to external service
     * @param {Object} errorInfo - Error information
     */
    reportError(errorInfo) {
        // In a real application, send to error reporting service
        // like Sentry, LogRocket, or custom endpoint
        console.log('Would report error to external service:', errorInfo);
    }

    /**
     * Get error statistics
     * @returns {Object} Error statistics
     */
    getErrorStats() {
        const typeCount = {};
        this.errorLog.forEach(error => {
            typeCount[error.type] = (typeCount[error.type] || 0) + 1;
        });

        return {
            totalErrors: this.errorLog.length,
            errorsByType: typeCount,
            recentErrors: this.errorLog.slice(0, 5),
            retryOperations: this.retryAttempts.size
        };
    }

    /**
     * Clear error log
     */
    clearErrorLog() {
        this.errorLog = [];
        this.retryAttempts.clear();
        console.log('Error log cleared');
    }

    /**
     * Create error boundary for components
     * @param {Function} component - Component function
     * @param {string} componentName - Component name
     * @returns {Function} Wrapped component
     */
    createErrorBoundary(component, componentName) {
        return (...args) => {
            try {
                return component(...args);
            } catch (error) {
                this.handleGlobalError({
                    type: 'component',
                    component: componentName,
                    message: error.message,
                    stack: error.stack,
                    args: args
                });
                
                // Return fallback UI
                return this.createFallbackUI(componentName);
            }
        };
    }

    /**
     * Create fallback UI for failed components
     * @param {string} componentName - Component name
     * @returns {string} Fallback HTML
     */
    createFallbackUI(componentName) {
        return `
            <div class="error-fallback">
                <div class="error-icon">⚠️</div>
                <h3>Component Error</h3>
                <p>The ${componentName} component failed to load.</p>
                <button onclick="window.location.reload()" class="btn btn-primary">
                    Refresh Page
                </button>
            </div>
        `;
    }

    /**
     * Wrap async functions with error handling
     * @param {Function} asyncFunction - Async function to wrap
     * @param {string} operationName - Operation name
     * @returns {Function} Wrapped function
     */
    wrapAsync(asyncFunction, operationName) {
        return async (...args) => {
            try {
                return await asyncFunction(...args);
            } catch (error) {
                return await this.handleApiError(error, null, operationName);
            }
        };
    }

    /**
     * Safe execution wrapper
     * @param {Function} fn - Function to execute safely
     * @param {*} fallback - Fallback value on error
     * @returns {*} Function result or fallback
     */
    safeExecute(fn, fallback = null) {
        try {
            return fn();
        } catch (error) {
            this.logError({
                type: 'safe_execute',
                message: error.message,
                stack: error.stack
            });
            return fallback;
        }
    }
}

// Create global instance
const errorHandler = new ErrorHandler();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorHandler;
}

// Make available globally
window.ErrorHandler = ErrorHandler;
window.errorHandler = errorHandler;