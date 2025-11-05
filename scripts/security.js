// Security Manager for QuizMaster app
// Handles input validation, sanitization, and security measures

/**
 * Security Manager class
 * Manages application security, input validation, and protection measures
 */
class SecurityManager {
    constructor() {
        this.rateLimits = new Map();
        this.blockedIPs = new Set();
        this.sessionTimeout = APP_CONFIG.security.sessionTimeout;
        this.maxLoginAttempts = APP_CONFIG.security.maxLoginAttempts;
        this.loginAttempts = new Map();
        
        console.log('🔒 Security Manager initialized');
        
        // Set up security measures
        this.setupSecurityMeasures();
    }

    /**
     * Set up security measures
     */
    setupSecurityMeasures() {
        // Set up CSP headers (Content Security Policy)
        this.setupCSP();
        
        // Set up session timeout
        this.setupSessionTimeout();
        
        // Set up input sanitization
        this.setupInputSanitization();
        
        // Monitor for suspicious activity
        this.setupSecurityMonitoring();
    }

    /**
     * Set up Content Security Policy
     */
    setupCSP() {
        // Add CSP meta tag if not present
        if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
            const cspMeta = document.createElement('meta');
            cspMeta.setAttribute('http-equiv', 'Content-Security-Policy');
            cspMeta.setAttribute('content', 
                "default-src 'self'; " +
                "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
                "font-src 'self' https://fonts.gstatic.com; " +
                "img-src 'self' data: https:; " +
                "connect-src 'self' https://*.supabase.co; " +
                "frame-ancestors 'none';"
            );
            document.head.appendChild(cspMeta);
        }
    }

    /**
     * Set up session timeout monitoring
     */
    setupSessionTimeout() {
        let lastActivity = Date.now();
        
        // Track user activity
        const updateActivity = () => {
            lastActivity = Date.now();
        };
        
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
            document.addEventListener(event, updateActivity, { passive: true });
        });
        
        // Check for session timeout
        setInterval(() => {
            if (authManager.getCurrentUser() && Date.now() - lastActivity > this.sessionTimeout) {
                this.handleSessionTimeout();
            }
        }, 60000); // Check every minute
    }

    /**
     * Handle session timeout
     */
    handleSessionTimeout() {
        console.warn('Session timeout detected');
        
        if (window.uiManager) {
            window.uiManager.showNotification(
                'warning',
                'Session Expired',
                'Your session has expired for security reasons. Please log in again.',
                8000
            );
        }
        
        // Auto logout
        if (authManager.logout) {
            authManager.logout();
        }
    }

    /**
     * Set up input sanitization
     */
    setupInputSanitization() {
        // Sanitize all form inputs on submit
        document.addEventListener('submit', (event) => {
            const form = event.target;
            if (form.tagName === 'FORM') {
                this.sanitizeFormInputs(form);
            }
        });
    }

    /**
     * Set up security monitoring
     */
    setupSecurityMonitoring() {
        // Monitor for rapid requests (potential DoS)
        this.monitorRateLimit();
        
        // Monitor for XSS attempts
        this.monitorXSSAttempts();
        
        // Monitor for suspicious patterns
        this.monitorSuspiciousActivity();
    }

    /**
     * Validate and sanitize user input
     * @param {string} input - User input to validate
     * @param {string} type - Type of validation (email, username, etc.)
     * @returns {Object} Validation result
     */
    validateInput(input, type) {
        const result = {
            isValid: false,
            sanitized: '',
            errors: []
        };

        if (!input || typeof input !== 'string') {
            result.errors.push('Input is required');
            return result;
        }

        // Basic sanitization
        let sanitized = this.sanitizeString(input);

        switch (type) {
            case 'email':
                return this.validateEmail(sanitized);
            case 'username':
                return this.validateUsername(sanitized);
            case 'password':
                return this.validatePassword(input); // Don't sanitize passwords
            case 'text':
                return this.validateText(sanitized);
            case 'number':
                return this.validateNumber(sanitized);
            default:
                result.sanitized = sanitized;
                result.isValid = true;
                return result;
        }
    }

    /**
     * Validate email address
     * @param {string} email - Email to validate
     * @returns {Object} Validation result
     */
    validateEmail(email) {
        const result = { isValid: false, sanitized: email.toLowerCase().trim(), errors: [] };
        
        // Check format
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        
        if (!emailRegex.test(result.sanitized)) {
            result.errors.push('Please enter a valid email address');
            return result;
        }
        
        // Check length
        if (result.sanitized.length > 254) {
            result.errors.push('Email address is too long');
            return result;
        }
        
        // Check for suspicious patterns
        if (this.containsSuspiciousPatterns(result.sanitized)) {
            result.errors.push('Email contains invalid characters');
            return result;
        }
        
        result.isValid = true;
        return result;
    }

    /**
     * Validate username
     * @param {string} username - Username to validate
     * @returns {Object} Validation result
     */
    validateUsername(username) {
        const result = { isValid: false, sanitized: username.trim(), errors: [] };
        
        // Check length
        if (result.sanitized.length < 3) {
            result.errors.push('Username must be at least 3 characters long');
        }
        
        if (result.sanitized.length > 20) {
            result.errors.push('Username must be less than 20 characters long');
        }
        
        // Check format (alphanumeric and underscores only)
        if (!/^[a-zA-Z0-9_]+$/.test(result.sanitized)) {
            result.errors.push('Username can only contain letters, numbers, and underscores');
        }
        
        // Check for reserved words
        const reservedWords = ['admin', 'root', 'user', 'test', 'null', 'undefined', 'system'];
        if (reservedWords.includes(result.sanitized.toLowerCase())) {
            result.errors.push('This username is not allowed');
        }
        
        // Check for suspicious patterns
        if (this.containsSuspiciousPatterns(result.sanitized)) {
            result.errors.push('Username contains invalid patterns');
        }
        
        result.isValid = result.errors.length === 0;
        return result;
    }

    /**
     * Validate password
     * @param {string} password - Password to validate
     * @returns {Object} Validation result
     */
    validatePassword(password) {
        const result = { isValid: false, sanitized: password, errors: [] };
        
        // Check length
        if (password.length < APP_CONFIG.security.passwordMinLength) {
            result.errors.push(`Password must be at least ${APP_CONFIG.security.passwordMinLength} characters long`);
        }
        
        // Check complexity
        const hasLowercase = /[a-z]/.test(password);
        const hasUppercase = /[A-Z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        if (!hasLowercase) {
            result.errors.push('Password must contain lowercase letters');
        }
        
        if (!hasUppercase) {
            result.errors.push('Password must contain uppercase letters');
        }
        
        if (!hasNumbers) {
            result.errors.push('Password must contain numbers');
        }
        
        if (!hasSpecialChars) {
            result.errors.push('Password must contain special characters');
        }
        
        // Check for common weak passwords
        const weakPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
        if (weakPasswords.includes(password.toLowerCase())) {
            result.errors.push('This password is too common and weak');
        }
        
        result.isValid = result.errors.length === 0;
        return result;
    }

    /**
     * Validate text input
     * @param {string} text - Text to validate
     * @returns {Object} Validation result
     */
    validateText(text) {
        const result = { isValid: false, sanitized: text.trim(), errors: [] };
        
        // Check for XSS patterns
        if (this.containsXSSPatterns(result.sanitized)) {
            result.errors.push('Text contains invalid content');
            return result;
        }
        
        // Check for SQL injection patterns
        if (this.containsSQLInjectionPatterns(result.sanitized)) {
            result.errors.push('Text contains invalid content');
            return result;
        }
        
        result.isValid = true;
        return result;
    }

    /**
     * Validate number input
     * @param {string} input - Number input to validate
     * @returns {Object} Validation result
     */
    validateNumber(input) {
        const result = { isValid: false, sanitized: input.trim(), errors: [] };
        
        const number = parseFloat(result.sanitized);
        
        if (isNaN(number)) {
            result.errors.push('Please enter a valid number');
            return result;
        }
        
        result.sanitized = number.toString();
        result.isValid = true;
        return result;
    }

    /**
     * Sanitize string input
     * @param {string} input - Input to sanitize
     * @returns {string} Sanitized input
     */
    sanitizeString(input) {
        if (typeof input !== 'string') return '';
        
        return input
            .trim()
            .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
            .replace(/\s+/g, ' ') // Normalize whitespace
            .substring(0, 1000); // Limit length
    }

    /**
     * Sanitize HTML content
     * @param {string} html - HTML to sanitize
     * @returns {string} Sanitized HTML
     */
    sanitizeHTML(html) {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    }

    /**
     * Check for XSS patterns
     * @param {string} input - Input to check
     * @returns {boolean} Contains XSS patterns
     */
    containsXSSPatterns(input) {
        const xssPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<iframe/gi,
            /<object/gi,
            /<embed/gi,
            /eval\s*\(/gi,
            /expression\s*\(/gi
        ];
        
        return xssPatterns.some(pattern => pattern.test(input));
    }

    /**
     * Check for SQL injection patterns
     * @param {string} input - Input to check
     * @returns {boolean} Contains SQL injection patterns
     */
    containsSQLInjectionPatterns(input) {
        const sqlPatterns = [
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
            /(--|#|\/\*|\*\/)/g,
            /(\b(OR|AND)\b.*=.*)/gi,
            /('|(\\')|(;)|(\\))/g
        ];
        
        return sqlPatterns.some(pattern => pattern.test(input));
    }

    /**
     * Check for suspicious patterns
     * @param {string} input - Input to check
     * @returns {boolean} Contains suspicious patterns
     */
    containsSuspiciousPatterns(input) {
        const suspiciousPatterns = [
            /\.\./g, // Directory traversal
            /[<>]/g, // HTML tags
            /\${/g,  // Template injection
            /%[0-9a-f]{2}/gi, // URL encoding
            /\\x[0-9a-f]{2}/gi // Hex encoding
        ];
        
        return suspiciousPatterns.some(pattern => pattern.test(input));
    }

    /**
     * Sanitize form inputs
     * @param {HTMLFormElement} form - Form to sanitize
     */
    sanitizeFormInputs(form) {
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            if (input.type === 'password') return; // Don't sanitize passwords
            
            const validation = this.validateInput(input.value, input.type);
            if (validation.isValid) {
                input.value = validation.sanitized;
            }
        });
    }

    /**
     * Rate limiting check
     * @param {string} key - Rate limit key (e.g., user ID, IP)
     * @param {number} limit - Request limit
     * @param {number} window - Time window in milliseconds
     * @returns {boolean} Request allowed
     */
    checkRateLimit(key, limit = 10, window = 60000) {
        const now = Date.now();
        const requests = this.rateLimits.get(key) || [];
        
        // Remove old requests outside the window
        const validRequests = requests.filter(time => now - time < window);
        
        // Check if limit exceeded
        if (validRequests.length >= limit) {
            return false;
        }
        
        // Add current request
        validRequests.push(now);
        this.rateLimits.set(key, validRequests);
        
        return true;
    }

    /**
     * Monitor rate limiting
     */
    monitorRateLimit() {
        // Clean up old rate limit entries periodically
        setInterval(() => {
            const now = Date.now();
            for (const [key, requests] of this.rateLimits.entries()) {
                const validRequests = requests.filter(time => now - time < 300000); // 5 minutes
                if (validRequests.length === 0) {
                    this.rateLimits.delete(key);
                } else {
                    this.rateLimits.set(key, validRequests);
                }
            }
        }, 300000); // Clean every 5 minutes
    }

    /**
     * Monitor XSS attempts
     */
    monitorXSSAttempts() {
        document.addEventListener('input', (event) => {
            const input = event.target;
            if (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA') {
                if (this.containsXSSPatterns(input.value)) {
                    console.warn('XSS attempt detected:', input.value);
                    this.logSecurityEvent('xss_attempt', { input: input.value });
                    
                    // Clear the input
                    input.value = '';
                    
                    if (window.uiManager) {
                        window.uiManager.showNotification(
                            'warning',
                            'Invalid Input',
                            'The input contains invalid content and has been cleared.',
                            5000
                        );
                    }
                }
            }
        });
    }

    /**
     * Monitor suspicious activity
     */
    monitorSuspiciousActivity() {
        // Monitor rapid form submissions
        let lastSubmission = 0;
        document.addEventListener('submit', () => {
            const now = Date.now();
            if (now - lastSubmission < 1000) { // Less than 1 second
                this.logSecurityEvent('rapid_submission', { interval: now - lastSubmission });
            }
            lastSubmission = now;
        });
        
        // Monitor console access (potential developer tools usage)
        let devtools = { open: false, orientation: null };
        const threshold = 160;
        
        setInterval(() => {
            if (window.outerHeight - window.innerHeight > threshold || 
                window.outerWidth - window.innerWidth > threshold) {
                if (!devtools.open) {
                    devtools.open = true;
                    this.logSecurityEvent('devtools_opened');
                }
            } else {
                devtools.open = false;
            }
        }, 500);
    }

    /**
     * Track login attempts
     * @param {string} identifier - User identifier (email/username)
     * @returns {boolean} Login attempt allowed
     */
    trackLoginAttempt(identifier) {
        const attempts = this.loginAttempts.get(identifier) || { count: 0, lastAttempt: 0 };
        const now = Date.now();
        
        // Reset count if enough time has passed
        if (now - attempts.lastAttempt > APP_CONFIG.security.lockoutDuration) {
            attempts.count = 0;
        }
        
        attempts.count++;
        attempts.lastAttempt = now;
        this.loginAttempts.set(identifier, attempts);
        
        if (attempts.count > this.maxLoginAttempts) {
            this.logSecurityEvent('login_lockout', { identifier, attempts: attempts.count });
            return false;
        }
        
        return true;
    }

    /**
     * Reset login attempts for successful login
     * @param {string} identifier - User identifier
     */
    resetLoginAttempts(identifier) {
        this.loginAttempts.delete(identifier);
    }

    /**
     * Log security event
     * @param {string} type - Event type
     * @param {Object} data - Event data
     */
    logSecurityEvent(type, data = {}) {
        const event = {
            type,
            data,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        console.warn('Security event:', event);
        
        // In production, send to security monitoring service
        if (APP_CONFIG.environment === 'production') {
            this.reportSecurityEvent(event);
        }
    }

    /**
     * Report security event to external service
     * @param {Object} event - Security event
     */
    reportSecurityEvent(event) {
        // In a real application, send to security monitoring service
        console.log('Would report security event:', event);
    }

    /**
     * Get security statistics
     * @returns {Object} Security statistics
     */
    getSecurityStats() {
        return {
            rateLimitEntries: this.rateLimits.size,
            loginAttempts: this.loginAttempts.size,
            blockedIPs: this.blockedIPs.size,
            sessionTimeout: this.sessionTimeout,
            maxLoginAttempts: this.maxLoginAttempts
        };
    }

    /**
     * Clean up security data
     */
    cleanup() {
        this.rateLimits.clear();
        this.loginAttempts.clear();
        this.blockedIPs.clear();
        console.log('Security Manager cleaned up');
    }
}

// Create global instance
const securityManager = new SecurityManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityManager;
}

// Make available globally
window.SecurityManager = SecurityManager;
window.securityManager = securityManager;