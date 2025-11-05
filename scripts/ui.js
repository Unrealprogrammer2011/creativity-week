// UI Manager for QuizMaster app
// Handles all user interface interactions and components

/**
 * UI Manager class
 * Manages all UI components, interactions, and state
 */
class UIManager {
    constructor() {
        this.currentPage = 'login';
        this.theme = 'light';
        this.notifications = [];
        this.modals = [];
        
        // Initialize UI components
        this.initializeUI();
    }

    /**
     * Initialize UI components and event listeners
     */
    initializeUI() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupEventListeners();
                this.initializeTheme();
                this.setupFormValidation();
            });
        } else {
            this.setupEventListeners();
            this.initializeTheme();
            this.setupFormValidation();
        }
    }

    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Authentication form listeners
        this.setupAuthFormListeners();
        
        // Navigation listeners
        this.setupNavigationListeners();
        
        // Theme toggle listener
        this.setupThemeToggle();
        
        // Mobile menu listener
        this.setupMobileMenu();
        
        // Modal listeners
        this.setupModalListeners();
        
        // Form validation listeners
        this.setupFormValidationListeners();
    }

    /**
     * Set up authentication form event listeners
     */
    setupAuthFormListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLoginSubmit.bind(this));
        }

        // Register form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', this.handleRegisterSubmit.bind(this));
        }

        // Show register page
        const showRegisterLink = document.getElementById('show-register');
        if (showRegisterLink) {
            showRegisterLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAuthPage('register');
            });
        }

        // Show login page
        const showLoginLink = document.getElementById('show-login');
        if (showLoginLink) {
            showLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAuthPage('login');
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.handleLogout.bind(this));
        }

        // Quiz interface listeners
        this.setupQuizInterfaceListeners();
    }

    /**
     * Set up navigation event listeners
     */
    setupNavigationListeners() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                if (page) {
                    this.showPage(page);
                }
            });
        });
    }

    /**
     * Set up theme toggle functionality
     */
    setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }

    /**
     * Set up modal event listeners
     */
    setupModalListeners() {
        const modalContainer = document.getElementById('modal-container');
        if (modalContainer) {
            // Close modal when clicking backdrop
            modalContainer.addEventListener('click', (e) => {
                if (e.target === modalContainer || e.target.classList.contains('modal-backdrop')) {
                    this.closeModal();
                }
            });
        }

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    /**
     * Set up form validation listeners
     */
    setupFormValidationListeners() {
        // Real-time email validation
        const emailInputs = document.querySelectorAll('input[type="email"]');
        emailInputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateEmail(input);
            });
            input.addEventListener('input', Utils.debounce(() => {
                this.validateEmail(input);
            }, 500));
        });

        // Real-time password validation
        const passwordInputs = document.querySelectorAll('input[type="password"]');
        passwordInputs.forEach(input => {
            if (input.name === 'password') {
                input.addEventListener('input', Utils.debounce(() => {
                    this.validatePassword(input);
                }, 300));
            }
            if (input.name === 'confirmPassword') {
                input.addEventListener('input', Utils.debounce(() => {
                    this.validatePasswordConfirmation(input);
                }, 300));
            }
        });

        // Username validation
        const usernameInput = document.getElementById('register-username');
        if (usernameInput) {
            usernameInput.addEventListener('input', Utils.debounce(() => {
                this.validateUsername(usernameInput);
            }, 500));
        }
    }

    /**
     * Handle login form submission
     * @param {Event} e - Form submit event
     */
    async handleLoginSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');

        // Show loading state
        this.setFormLoading(form, true);

        try {
            // Attempt login
            const result = await authManager.login(email, password);

            if (result.success) {
                this.showNotification('success', 'Welcome back!', result.message);
                this.clearForm(form);
            } else {
                this.showNotification('error', 'Login Failed', result.message);
                this.setFormError(form, result.message);
            }

        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('error', 'Login Failed', 'An unexpected error occurred');
        } finally {
            this.setFormLoading(form, false);
        }
    }

    /**
     * Handle register form submission
     * @param {Event} e - Form submit event
     */
    async handleRegisterSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const username = formData.get('username');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        // Validate form
        if (!this.validateRegistrationForm(form)) {
            return;
        }

        // Check password confirmation
        if (password !== confirmPassword) {
            this.setFieldError('register-confirm-password', 'Passwords do not match');
            return;
        }

        // Show loading state
        this.setFormLoading(form, true);

        try {
            // Attempt registration
            const result = await authManager.register(email, password, username);

            if (result.success) {
                this.showNotification('success', 'Account Created!', result.message);
                this.clearForm(form);
                // Optionally switch to login page or dashboard
            } else {
                this.showNotification('error', 'Registration Failed', result.message);
                this.setFormError(form, result.message);
            }

        } catch (error) {
            console.error('Registration error:', error);
            this.showNotification('error', 'Registration Failed', 'An unexpected error occurred');
        } finally {
            this.setFormLoading(form, false);
        }
    }

    /**
     * Handle logout
     */
    async handleLogout() {
        try {
            const result = await authManager.logout();
            
            if (result.success) {
                this.showNotification('success', 'Logged Out', result.message);
                this.showAuthPage('login');
            } else {
                this.showNotification('error', 'Logout Failed', result.message);
            }

        } catch (error) {
            console.error('Logout error:', error);
            this.showNotification('error', 'Logout Failed', 'An unexpected error occurred');
        }
    }

    /**
     * Show authentication page (login or register)
     * @param {string} page - Page to show ('login' or 'register')
     */
    showAuthPage(page) {
        const loginPage = document.getElementById('login-page');
        const registerPage = document.getElementById('register-page');

        if (page === 'register') {
            if (loginPage) loginPage.classList.remove('active');
            if (registerPage) registerPage.classList.add('active');
            this.currentPage = 'register';
        } else {
            if (registerPage) registerPage.classList.remove('active');
            if (loginPage) loginPage.classList.add('active');
            this.currentPage = 'login';
        }
    }

    /**
     * Show application page
     * @param {string} page - Page to show
     */
    showPage(page) {
        // Hide all pages
        const pages = document.querySelectorAll('.page');
        pages.forEach(p => p.classList.remove('active'));

        // Show selected page
        const targetPage = document.getElementById(`${page}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = page;
        }

        // Update navigation
        this.updateNavigation(page);
    }

    /**
     * Update navigation active state
     * @param {string} activePage - Currently active page
     */
    updateNavigation(activePage) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const page = link.getAttribute('data-page');
            if (page === activePage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    /**
     * Validate registration form
     * @param {HTMLFormElement} form - Form to validate
     * @returns {boolean} Is form valid
     */
    validateRegistrationForm(form) {
        let isValid = true;

        // Get form fields
        const username = form.querySelector('#register-username');
        const email = form.querySelector('#register-email');
        const password = form.querySelector('#register-password');
        const confirmPassword = form.querySelector('#register-confirm-password');

        // Validate username
        if (!this.validateUsername(username)) {
            isValid = false;
        }

        // Validate email
        if (!this.validateEmail(email)) {
            isValid = false;
        }

        // Validate password
        if (!this.validatePassword(password)) {
            isValid = false;
        }

        // Validate password confirmation
        if (!this.validatePasswordConfirmation(confirmPassword)) {
            isValid = false;
        }

        return isValid;
    }

    /**
     * Validate username field
     * @param {HTMLInputElement} input - Username input
     * @returns {boolean} Is valid
     */
    validateUsername(input) {
        const value = input.value.trim();
        const errorElement = document.getElementById(`${input.id}-error`);

        if (!value) {
            this.setFieldError(input.id, 'Username is required');
            return false;
        }

        if (value.length < 3) {
            this.setFieldError(input.id, 'Username must be at least 3 characters long');
            return false;
        }

        if (value.length > 20) {
            this.setFieldError(input.id, 'Username must be less than 20 characters');
            return false;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(value)) {
            this.setFieldError(input.id, 'Username can only contain letters, numbers, and underscores');
            return false;
        }

        this.clearFieldError(input.id);
        return true;
    }

    /**
     * Validate email field
     * @param {HTMLInputElement} input - Email input
     * @returns {boolean} Is valid
     */
    validateEmail(input) {
        const value = input.value.trim();

        if (!value) {
            this.setFieldError(input.id, 'Email is required');
            return false;
        }

        if (!Utils.isValidEmail(value)) {
            this.setFieldError(input.id, 'Please enter a valid email address');
            return false;
        }

        this.clearFieldError(input.id);
        return true;
    }

    /**
     * Validate password field
     * @param {HTMLInputElement} input - Password input
     * @returns {boolean} Is valid
     */
    validatePassword(input) {
        const value = input.value;
        const validation = Utils.validatePassword(value);

        // Update password strength indicator
        this.updatePasswordStrength(input, validation);

        if (validation.score < 3) {
            this.setFieldError(input.id, validation.feedback.join('. '));
            return false;
        }

        this.clearFieldError(input.id);
        return true;
    }

    /**
     * Validate password confirmation field
     * @param {HTMLInputElement} input - Confirm password input
     * @returns {boolean} Is valid
     */
    validatePasswordConfirmation(input) {
        const value = input.value;
        const passwordInput = document.getElementById('register-password');
        const passwordValue = passwordInput ? passwordInput.value : '';

        if (!value) {
            this.setFieldError(input.id, 'Please confirm your password');
            return false;
        }

        if (value !== passwordValue) {
            this.setFieldError(input.id, 'Passwords do not match');
            return false;
        }

        this.clearFieldError(input.id);
        return true;
    }

    /**
     * Update password strength indicator
     * @param {HTMLInputElement} input - Password input
     * @param {Object} validation - Password validation result
     */
    updatePasswordStrength(input, validation) {
        const strengthBar = input.parentElement.querySelector('.strength-fill');
        const strengthText = input.parentElement.querySelector('.strength-text');

        if (strengthBar && strengthText) {
            // Remove existing strength classes
            strengthBar.classList.remove('weak', 'fair', 'good', 'strong');
            
            // Add new strength class
            strengthBar.classList.add(validation.strength);
            
            // Update text
            strengthText.textContent = `Password strength: ${validation.strength}`;
        }
    }

    /**
     * Set field error
     * @param {string} fieldId - Field ID
     * @param {string} message - Error message
     */
    setFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(`${fieldId}-error`);

        if (field) {
            field.classList.add('error');
        }

        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }

    /**
     * Clear field error
     * @param {string} fieldId - Field ID
     */
    clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(`${fieldId}-error`);

        if (field) {
            field.classList.remove('error');
        }

        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
        }
    }

    /**
     * Set form loading state
     * @param {HTMLFormElement} form - Form element
     * @param {boolean} loading - Loading state
     */
    setFormLoading(form, loading) {
        const submitButton = form.querySelector('button[type="submit"]');
        
        if (submitButton) {
            if (loading) {
                submitButton.classList.add('loading');
                submitButton.disabled = true;
            } else {
                submitButton.classList.remove('loading');
                submitButton.disabled = false;
            }
        }

        // Disable all form inputs during loading
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => {
            input.disabled = loading;
        });
    }

    /**
     * Set form error
     * @param {HTMLFormElement} form - Form element
     * @param {string} message - Error message
     */
    setFormError(form, message) {
        // This could be enhanced to show form-level errors
        console.log('Form error:', message);
    }

    /**
     * Clear form
     * @param {HTMLFormElement} form - Form to clear
     */
    clearForm(form) {
        form.reset();
        
        // Clear all field errors
        const errorElements = form.querySelectorAll('.form-error');
        errorElements.forEach(error => {
            error.textContent = '';
            error.classList.remove('show');
        });

        // Remove error classes from inputs
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => {
            input.classList.remove('error');
        });
    }

    /**
     * Show notification
     * @param {string} type - Notification type ('success', 'error', 'warning', 'info')
     * @param {string} title - Notification title
     * @param {string} message - Notification message
     * @param {number} duration - Duration in milliseconds
     */
    showNotification(type = 'info', title = '', message = '', duration = 4000) {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-icon">
                ${this.getNotificationIcon(type)}
            </div>
            <div class="notification-content">
                ${title ? `<div class="notification-title">${Utils.escapeHTML(title)}</div>` : ''}
                <div class="notification-message">${Utils.escapeHTML(message)}</div>
            </div>
            <button class="notification-close" aria-label="Close notification">
                ×
            </button>
        `;

        // Add close functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.removeNotification(notification);
        });

        // Add to container
        container.appendChild(notification);

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.removeNotification(notification);
            }, duration);
        }

        // Store reference
        this.notifications.push(notification);
    }

    /**
     * Remove notification
     * @param {HTMLElement} notification - Notification element
     */
    removeNotification(notification) {
        if (notification && notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease-in-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                
                // Remove from array
                const index = this.notifications.indexOf(notification);
                if (index > -1) {
                    this.notifications.splice(index, 1);
                }
            }, 300);
        }
    }

    /**
     * Get notification icon
     * @param {string} type - Notification type
     * @returns {string} Icon HTML
     */
    getNotificationIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }

    /**
     * Initialize theme
     */
    initializeTheme() {
        // Get saved theme or default to light
        const savedTheme = Utils.storage.get(STORAGE_KEYS.theme, 'light');
        this.setTheme(savedTheme);
    }

    /**
     * Toggle theme
     */
    toggleTheme() {
        const newTheme = this.theme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    /**
     * Set theme
     * @param {string} theme - Theme name ('light' or 'dark')
     */
    setTheme(theme) {
        this.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update theme toggle button
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('.theme-icon');
            if (icon) {
                icon.textContent = theme === 'light' ? '🌙' : '☀️';
            }
        }

        // Save theme preference
        Utils.storage.set(STORAGE_KEYS.theme, theme);
    }

    /**
     * Show modal
     * @param {string} title - Modal title
     * @param {string} content - Modal content HTML
     * @param {Array} actions - Array of action objects
     */
    showModal(title, content, actions = []) {
        const container = document.getElementById('modal-container');
        if (!container) return;

        const modal = document.createElement('div');
        modal.className = 'modal-content';
        modal.innerHTML = `
            <div class="modal-header">
                <h3 class="modal-title">${Utils.escapeHTML(title)}</h3>
            </div>
            <div class="modal-body">
                ${content}
            </div>
            ${actions.length > 0 ? `
                <div class="modal-footer">
                    ${actions.map(action => `
                        <button class="btn ${action.class || 'btn-primary'}" data-action="${action.action}">
                            ${Utils.escapeHTML(action.text)}
                        </button>
                    `).join('')}
                </div>
            ` : ''}
        `;

        // Add action listeners
        const actionButtons = modal.querySelectorAll('[data-action]');
        actionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.getAttribute('data-action');
                const actionObj = actions.find(a => a.action === action);
                if (actionObj && actionObj.handler) {
                    actionObj.handler();
                }
                this.closeModal();
            });
        });

        // Clear existing modal content and add new
        container.innerHTML = '<div class="modal-backdrop"></div>';
        container.appendChild(modal);
        container.classList.remove('hidden');

        // Store reference
        this.modals.push(modal);
    }

    /**
     * Close modal
     */
    closeModal() {
        const container = document.getElementById('modal-container');
        if (container) {
            container.classList.add('hidden');
            container.innerHTML = '<div class="modal-backdrop"></div><div class="modal-content"></div>';
        }
        this.modals = [];
    }

    /**
     * Set up quiz interface event listeners
     */
    setupQuizInterfaceListeners() {
        // Start quiz button
        const startQuizBtn = document.getElementById('start-quiz-btn');
        if (startQuizBtn) {
            startQuizBtn.addEventListener('click', this.handleStartQuiz.bind(this));
        }

        // Quit quiz button
        const quitQuizBtn = document.getElementById('quit-quiz-btn');
        if (quitQuizBtn) {
            quitQuizBtn.addEventListener('click', this.handleQuitQuiz.bind(this));
        }

        // Quiz results buttons
        const takeAnotherQuizBtn = document.getElementById('take-another-quiz-btn');
        if (takeAnotherQuizBtn) {
            takeAnotherQuizBtn.addEventListener('click', () => {
                this.showQuizSelection();
            });
        }

        const viewLeaderboardBtn = document.getElementById('view-leaderboard-btn');
        if (viewLeaderboardBtn) {
            viewLeaderboardBtn.addEventListener('click', () => {
                this.showPage('leaderboard');
            });
        }

        const reviewAnswersBtn = document.getElementById('review-answers-btn');
        if (reviewAnswersBtn) {
            reviewAnswersBtn.addEventListener('click', this.handleReviewAnswers.bind(this));
        }

        // Quick start buttons
        const quickStartButtons = document.querySelectorAll('.quick-start-buttons .btn');
        quickStartButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const category = e.target.getAttribute('data-category');
                const difficulty = e.target.getAttribute('data-difficulty');
                const count = parseInt(e.target.getAttribute('data-count'));
                
                this.startQuickQuiz(category, difficulty, count);
            });
        });
    }

    /**
     * Handle start quiz button click
     */
    async handleStartQuiz() {
        const categorySelect = document.getElementById('quiz-category');
        const difficultySelect = document.getElementById('quiz-difficulty');
        const countSelect = document.getElementById('quiz-count');

        const category = categorySelect.value;
        const difficulty = difficultySelect.value;
        const questionCount = parseInt(countSelect.value);

        await this.startQuiz(category, difficulty, questionCount);
    }

    /**
     * Start a quiz with given parameters
     * @param {string} category - Quiz category
     * @param {string} difficulty - Quiz difficulty
     * @param {number} questionCount - Number of questions
     */
    async startQuiz(category, difficulty, questionCount) {
        try {
            // Show loading state
            this.showQuizLoading();

            // Start quiz using quiz manager
            if (window.quizManager) {
                const result = await window.quizManager.startQuiz(category, difficulty, questionCount);
                
                if (result.success) {
                    this.showQuizInterface();
                    this.showNotification('success', 'Quiz Started!', result.message);
                } else {
                    this.showNotification('error', 'Failed to Start Quiz', result.message);
                    this.showQuizSelection();
                }
            } else {
                throw new Error('Quiz manager not available');
            }

        } catch (error) {
            console.error('Failed to start quiz:', error);
            this.showNotification('error', 'Quiz Error', 'Failed to start quiz. Please try again.');
            this.showQuizSelection();
        }
    }

    /**
     * Start a quick quiz
     * @param {string} category - Quiz category
     * @param {string} difficulty - Quiz difficulty
     * @param {number} questionCount - Number of questions
     */
    async startQuickQuiz(category, difficulty, questionCount) {
        // Navigate to quiz page first
        this.showPage('quiz');
        
        // Start the quiz
        await this.startQuiz(category, difficulty, questionCount);
    }

    /**
     * Handle quit quiz
     */
    handleQuitQuiz() {
        this.showModal(
            'Quit Quiz',
            'Are you sure you want to quit this quiz? Your progress will be lost.',
            [
                {
                    text: 'Cancel',
                    class: 'btn-outline',
                    action: 'cancel'
                },
                {
                    text: 'Quit Quiz',
                    class: 'btn-error',
                    action: 'quit',
                    handler: () => {
                        if (window.quizManager) {
                            window.quizManager.endQuiz();
                        }
                        this.showQuizSelection();
                        this.showNotification('info', 'Quiz Ended', 'You have quit the quiz.');
                    }
                }
            ]
        );
    }

    /**
     * Handle review answers
     */
    handleReviewAnswers() {
        if (window.quizManager && window.quizManager.userAnswers) {
            this.showAnswerReview(window.quizManager.userAnswers);
        }
    }

    /**
     * Show quiz selection screen
     */
    showQuizSelection() {
        const quizSelection = document.getElementById('quiz-selection');
        const quizInterface = document.getElementById('quiz-interface');
        const quizResults = document.getElementById('quiz-results');

        if (quizSelection) quizSelection.classList.remove('hidden');
        if (quizInterface) quizInterface.classList.add('hidden');
        if (quizResults) quizResults.classList.add('hidden');

        // Reset start button
        const startBtn = document.getElementById('start-quiz-btn');
        if (startBtn) {
            startBtn.textContent = 'Start Quiz';
            startBtn.disabled = false;
        }
    }

    /**
     * Show quiz interface
     */
    showQuizInterface() {
        const quizSelection = document.getElementById('quiz-selection');
        const quizInterface = document.getElementById('quiz-interface');
        const quizResults = document.getElementById('quiz-results');

        if (quizSelection) quizSelection.classList.add('hidden');
        if (quizInterface) quizInterface.classList.remove('hidden');
        if (quizResults) quizResults.classList.add('hidden');
    }

    /**
     * Show quiz results
     * @param {Object} results - Quiz results
     */
    showQuizResults(results) {
        const quizSelection = document.getElementById('quiz-selection');
        const quizInterface = document.getElementById('quiz-interface');
        const quizResults = document.getElementById('quiz-results');

        if (quizSelection) quizSelection.classList.add('hidden');
        if (quizInterface) quizInterface.classList.add('hidden');
        if (quizResults) quizResults.classList.remove('hidden');

        // Update results display
        this.updateResultsDisplay(results);
    }

    /**
     * Show quiz loading state
     */
    showQuizLoading() {
        const startBtn = document.getElementById('start-quiz-btn');
        if (startBtn) {
            startBtn.textContent = 'Starting Quiz...';
            startBtn.disabled = true;
        }
    }

    /**
     * Update results display
     * @param {Object} results - Quiz results
     */
    updateResultsDisplay(results) {
        // Update final score
        const finalScore = document.getElementById('final-score');
        if (finalScore) {
            finalScore.textContent = Utils.formatNumber(results.score);
        }

        // Update correct count
        const correctCount = document.getElementById('correct-count');
        if (correctCount) {
            correctCount.textContent = `${results.correctAnswers}/${results.totalQuestions}`;
        }

        // Update accuracy
        const accuracyPercent = document.getElementById('accuracy-percent');
        if (accuracyPercent) {
            accuracyPercent.textContent = `${results.accuracy}%`;
        }

        // Update time taken
        const timeTaken = document.getElementById('time-taken');
        if (timeTaken) {
            timeTaken.textContent = Utils.formatDuration(results.timeSpent);
        }

        // Update results header with grade
        this.updateResultsHeader(results);

        // Show detailed breakdown if available
        if (results.breakdown || results.completionBonuses) {
            this.showDetailedBreakdown(results);
        }

        // Update results icon based on performance
        const resultsIcon = document.querySelector('.results-icon');
        if (resultsIcon) {
            if (results.grade && results.grade.letter) {
                // Use grade-based icons
                const gradeIcons = {
                    'A+': '🏆', 'A': '🥇', 'A-': '⭐',
                    'B+': '🎉', 'B': '👏', 'B-': '👍',
                    'C+': '📈', 'C': '📊', 'D': '📚', 'F': '💪'
                };
                resultsIcon.textContent = gradeIcons[results.grade.letter] || '🎯';
            } else {
                // Fallback to accuracy-based icons
                if (results.accuracy >= 90) {
                    resultsIcon.textContent = '🏆';
                } else if (results.accuracy >= 70) {
                    resultsIcon.textContent = '🎉';
                } else if (results.accuracy >= 50) {
                    resultsIcon.textContent = '👍';
                } else {
                    resultsIcon.textContent = '📚';
                }
            }
        }
    }

    /**
     * Update results header with grade information
     * @param {Object} results - Quiz results
     */
    updateResultsHeader(results) {
        const resultsHeader = document.querySelector('.results-header h2');
        const resultsSubtext = document.querySelector('.results-header p');

        if (results.grade) {
            if (resultsHeader) {
                resultsHeader.innerHTML = `Quiz Complete! <span style="color: ${results.grade.color}">${results.grade.letter}</span>`;
            }
            if (resultsSubtext) {
                resultsSubtext.textContent = results.grade.description;
            }
        }
    }

    /**
     * Show detailed scoring breakdown
     * @param {Object} results - Quiz results
     */
    showDetailedBreakdown(results) {
        // Find or create breakdown container
        let breakdownContainer = document.querySelector('.results-breakdown');
        if (!breakdownContainer) {
            breakdownContainer = document.createElement('div');
            breakdownContainer.className = 'results-breakdown';
            
            const resultsStats = document.querySelector('.results-stats');
            if (resultsStats) {
                resultsStats.parentNode.insertBefore(breakdownContainer, resultsStats.nextSibling);
            }
        }

        let breakdownHTML = '<div class="breakdown-section"><h3>Score Breakdown</h3>';

        // Base score breakdown
        if (results.breakdown) {
            breakdownHTML += `
                <div class="breakdown-item">
                    <span class="breakdown-label">Base Score:</span>
                    <span class="breakdown-value">${Utils.formatNumber(results.breakdown.baseScore || 0)}</span>
                </div>
            `;

            if (results.breakdown.bonuses > 0) {
                breakdownHTML += `
                    <div class="breakdown-item positive">
                        <span class="breakdown-label">Bonuses:</span>
                        <span class="breakdown-value">+${Utils.formatNumber(results.breakdown.bonuses)}</span>
                    </div>
                `;
            }

            if (results.breakdown.penalties > 0) {
                breakdownHTML += `
                    <div class="breakdown-item negative">
                        <span class="breakdown-label">Penalties:</span>
                        <span class="breakdown-value">-${Utils.formatNumber(results.breakdown.penalties)}</span>
                    </div>
                `;
            }

            if (results.breakdown.completionBonuses > 0) {
                breakdownHTML += `
                    <div class="breakdown-item positive">
                        <span class="breakdown-label">Completion Bonuses:</span>
                        <span class="breakdown-value">+${Utils.formatNumber(results.breakdown.completionBonuses)}</span>
                    </div>
                `;
            }
        }

        breakdownHTML += '</div>';

        // Completion bonuses details
        if (results.completionBonuses && results.completionBonuses.length > 0) {
            breakdownHTML += '<div class="breakdown-section"><h3>Achievement Bonuses</h3>';
            results.completionBonuses.forEach(bonus => {
                breakdownHTML += `
                    <div class="breakdown-item achievement">
                        <span class="breakdown-label">${Utils.escapeHTML(bonus.description)}:</span>
                        <span class="breakdown-value">+${Utils.formatNumber(bonus.amount)}</span>
                    </div>
                `;
            });
            breakdownHTML += '</div>';
        }

        breakdownContainer.innerHTML = breakdownHTML;
    }

    /**
     * Show answer review modal
     * @param {Array} answers - Array of answer objects
     */
    showAnswerReview(answers) {
        let reviewHTML = '<div class="answer-review">';
        
        answers.forEach((answer, index) => {
            reviewHTML += `
                <div class="review-item ${answer.isCorrect ? 'correct' : 'incorrect'}">
                    <div class="review-question">
                        <strong>Q${index + 1}:</strong> ${Utils.escapeHTML(answer.question)}
                    </div>
                    <div class="review-answer">
                        <strong>Your Answer:</strong> ${Utils.escapeHTML(answer.selectedAnswer)}
                        ${answer.isCorrect ? '✓' : '✗'}
                    </div>
                    ${!answer.isCorrect ? `
                        <div class="review-correct">
                            <strong>Correct Answer:</strong> ${Utils.escapeHTML(answer.correctAnswer)}
                        </div>
                    ` : ''}
                    <div class="review-points">
                        Points: ${answer.points > 0 ? '+' : ''}${answer.points}
                    </div>
                </div>
            `;
        });
        
        reviewHTML += '</div>';

        this.showModal('Answer Review', reviewHTML, [
            {
                text: 'Close',
                class: 'btn-primary',
                action: 'close'
            }
        ]);
    }

    /**
     * Set up mobile menu functionality
     */
    setupMobileMenu() {
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileLogoutBtn = document.getElementById('mobile-logout-btn');

        if (mobileMenuToggle && mobileMenu) {
            mobileMenuToggle.addEventListener('click', () => {
                const isOpen = mobileMenu.classList.contains('open');
                
                if (isOpen) {
                    this.closeMobileMenu();
                } else {
                    this.openMobileMenu();
                }
            });

            // Close menu when clicking nav links
            const mobileNavLinks = mobileMenu.querySelectorAll('.nav-link');
            mobileNavLinks.forEach(link => {
                link.addEventListener('click', () => {
                    this.closeMobileMenu();
                });
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!mobileMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                    this.closeMobileMenu();
                }
            });
        }

        // Mobile logout button
        if (mobileLogoutBtn) {
            mobileLogoutBtn.addEventListener('click', () => {
                this.handleLogout();
                this.closeMobileMenu();
            });
        }
    }

    /**
     * Open mobile menu
     */
    openMobileMenu() {
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');

        if (mobileMenu) {
            mobileMenu.classList.add('open');
        }

        if (mobileMenuToggle) {
            mobileMenuToggle.classList.add('open');
        }

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');

        if (mobileMenu) {
            mobileMenu.classList.remove('open');
        }

        if (mobileMenuToggle) {
            mobileMenuToggle.classList.remove('open');
        }

        // Restore body scroll
        document.body.style.overflow = '';
    }
}

// Create global instance
const uiManager = new UIManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}

// Make available globally
window.UIManager = UIManager;
window.uiManager = uiManager;