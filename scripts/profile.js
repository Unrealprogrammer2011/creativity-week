// Profile Manager for QuizMaster app
// Handles user profile functionality, settings, and history

/**
 * Profile Manager class
 * Manages user profile data, settings, and quiz history
 */
class ProfileManager {
    constructor() {
        this.userProfile = null;
        this.quizHistory = [];
        this.categoryPerformance = {};
        this.userSettings = {
            theme: 'light',
            notifications: true,
            soundEffects: true
        };
        
        console.log('👤 Profile Manager initialized');
        
        // Initialize profile
        this.initializeProfile();
    }

    /**
     * Initialize profile components
     */
    initializeProfile() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupEventListeners();
                this.loadUserSettings();
                this.loadProfileData();
            });
        } else {
            this.setupEventListeners();
            this.loadUserSettings();
            this.loadProfileData();
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Edit profile button
        const editProfileBtn = document.getElementById('edit-profile-btn');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => {
                this.showEditProfileModal();
            });
        }

        // Refresh profile button
        const refreshProfileBtn = document.getElementById('refresh-profile-btn');
        if (refreshProfileBtn) {
            refreshProfileBtn.addEventListener('click', () => {
                this.refreshProfile();
            });
        }

        // Clear history button
        const clearHistoryBtn = document.getElementById('clear-history-btn');
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', () => {
                this.clearQuizHistory();
            });
        }

        // Settings listeners
        this.setupSettingsListeners();

        // Listen for authentication state changes
        if (window.authManager) {
            window.authManager.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_IN' && session) {
                    this.loadProfileData();
                } else if (event === 'SIGNED_OUT') {
                    this.clearProfileData();
                }
            });
        }
    }

    /**
     * Set up settings event listeners
     */
    setupSettingsListeners() {
        // Theme preference
        const themeSelect = document.getElementById('theme-preference');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.updateSetting('theme', e.target.value);
            });
        }

        // Notifications
        const notificationsCheckbox = document.getElementById('notifications-enabled');
        if (notificationsCheckbox) {
            notificationsCheckbox.addEventListener('change', (e) => {
                this.updateSetting('notifications', e.target.checked);
            });
        }

        // Sound effects
        const soundEffectsCheckbox = document.getElementById('sound-effects');
        if (soundEffectsCheckbox) {
            soundEffectsCheckbox.addEventListener('change', (e) => {
                this.updateSetting('soundEffects', e.target.checked);
            });
        }
    }

    /**
     * Load user profile data
     */
    async loadProfileData() {
        const user = authManager.getCurrentUser();
        if (!user) return;

        try {
            // Load profile information
            await this.loadUserProfile();
            
            // Load quiz history
            await this.loadQuizHistory();
            
            // Load category performance
            await this.loadCategoryPerformance();
            
            // Update UI
            this.updateProfileUI();

        } catch (error) {
            console.error('Failed to load profile data:', error);
        }
    }

    /**
     * Load user profile information
     */
    async loadUserProfile() {
        const user = authManager.getCurrentUser();
        if (!user) return;

        try {
            // Try to get from database first
            if (authManager.supabase && authManager.isInitialized) {
                const { data: profile, error } = await authManager.supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    throw error;
                }

                if (profile) {
                    this.userProfile = {
                        id: profile.id,
                        username: profile.username,
                        email: profile.email,
                        fullName: profile.full_name,
                        avatarUrl: profile.avatar_url,
                        totalPoints: profile.total_points || 0,
                        quizzesCompleted: profile.quizzes_completed || 0,
                        averageScore: profile.average_score || 0,
                        bestScore: profile.best_score || 0,
                        favoriteCategory: profile.favorite_category,
                        streakCount: profile.streak_count || 0,
                        lastQuizDate: profile.last_quiz_date,
                        joinedDate: profile.created_at
                    };

                    // Get user rank
                    if (window.leaderboardManager) {
                        const rankResult = await window.leaderboardManager.getUserRank(user.id);
                        if (rankResult.success) {
                            this.userProfile.rank = rankResult.rank;
                        }
                    }

                    return;
                }
            }

            // Fallback to basic user info
            this.userProfile = {
                id: user.id,
                username: user.user_metadata?.username || 'User',
                email: user.email,
                fullName: user.user_metadata?.full_name || '',
                totalPoints: 0,
                quizzesCompleted: 0,
                averageScore: 0,
                bestScore: 0,
                rank: null
            };

        } catch (error) {
            console.error('Failed to load user profile:', error);
        }
    }

    /**
     * Load quiz history
     */
    async loadQuizHistory() {
        const user = authManager.getCurrentUser();
        if (!user) return;

        try {
            // Try to get from database first
            if (authManager.supabase && authManager.isInitialized) {
                const { data, error } = await authManager.supabase
                    .from('quiz_results')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('completed_at', { ascending: false })
                    .limit(20);

                if (error) {
                    throw error;
                }

                this.quizHistory = (data || []).map(result => ({
                    id: result.id,
                    category: result.category,
                    difficulty: result.difficulty,
                    score: result.total_points,
                    accuracy: result.accuracy,
                    questionsAnswered: result.questions_answered,
                    correctAnswers: result.correct_answers,
                    timeSpent: result.time_spent,
                    completedAt: result.completed_at
                }));

                return;
            }

            // Fallback to local storage
            const savedResults = Utils.storage.get('quiz_results', []);
            this.quizHistory = savedResults
                .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
                .slice(0, 20);

        } catch (error) {
            console.error('Failed to load quiz history:', error);
            this.quizHistory = [];
        }
    }

    /**
     * Load category performance data
     */
    async loadCategoryPerformance() {
        if (this.quizHistory.length === 0) {
            this.categoryPerformance = {};
            return;
        }

        // Calculate performance by category
        const categoryStats = {};

        this.quizHistory.forEach(quiz => {
            if (!categoryStats[quiz.category]) {
                categoryStats[quiz.category] = {
                    totalQuizzes: 0,
                    totalScore: 0,
                    totalAccuracy: 0,
                    bestScore: 0,
                    averageScore: 0,
                    averageAccuracy: 0
                };
            }

            const stats = categoryStats[quiz.category];
            stats.totalQuizzes++;
            stats.totalScore += quiz.score;
            stats.totalAccuracy += quiz.accuracy;
            stats.bestScore = Math.max(stats.bestScore, quiz.score);
        });

        // Calculate averages
        Object.keys(categoryStats).forEach(category => {
            const stats = categoryStats[category];
            stats.averageScore = Math.round(stats.totalScore / stats.totalQuizzes);
            stats.averageAccuracy = Math.round(stats.totalAccuracy / stats.totalQuizzes * 10) / 10;
        });

        this.categoryPerformance = categoryStats;
    }

    /**
     * Update profile UI
     */
    updateProfileUI() {
        if (!this.userProfile) return;

        // Update profile header
        this.updateProfileHeader();
        
        // Update quiz history display
        this.updateQuizHistoryDisplay();
        
        // Update category performance display
        this.updateCategoryPerformanceDisplay();
        
        // Update achievements count
        this.updateAchievementsCount();
    }

    /**
     * Update profile header
     */
    updateProfileHeader() {
        const avatar = document.getElementById('profile-avatar');
        const name = document.getElementById('profile-name');
        const email = document.getElementById('profile-email');
        const totalPoints = document.getElementById('profile-total-points');
        const quizzes = document.getElementById('profile-quizzes');
        const accuracy = document.getElementById('profile-accuracy');
        const rank = document.getElementById('profile-rank');

        if (avatar) {
            avatar.textContent = this.userProfile.username.charAt(0).toUpperCase();
        }

        if (name) {
            name.textContent = this.userProfile.fullName || this.userProfile.username;
        }

        if (email) {
            email.textContent = this.userProfile.email;
        }

        if (totalPoints) {
            totalPoints.textContent = Utils.formatNumber(this.userProfile.totalPoints);
        }

        if (quizzes) {
            quizzes.textContent = this.userProfile.quizzesCompleted;
        }

        if (accuracy) {
            accuracy.textContent = `${Math.round(this.userProfile.averageScore || 0)}%`;
        }

        if (rank) {
            rank.textContent = this.userProfile.rank ? `#${this.userProfile.rank}` : '#-';
        }
    }

    /**
     * Update quiz history display
     */
    updateQuizHistoryDisplay() {
        const container = document.getElementById('quiz-history');
        if (!container) return;

        if (this.quizHistory.length === 0) {
            container.innerHTML = '<p>No quiz history available</p>';
            return;
        }

        let html = '<div class="history-list">';
        this.quizHistory.forEach(quiz => {
            html += `
                <div class="history-item">
                    <div class="history-info">
                        <div class="history-category">${Utils.escapeHTML(quiz.category)}</div>
                        <div class="history-details">
                            ${quiz.difficulty} • ${quiz.correctAnswers}/${quiz.questionsAnswered} correct
                        </div>
                    </div>
                    <div class="history-score">
                        <div class="score-value">${quiz.score}</div>
                        <div class="score-accuracy">${quiz.accuracy}%</div>
                    </div>
                    <div class="history-date">
                        ${Utils.formatDate(quiz.completedAt, { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </div>
                </div>
            `;
        });
        html += '</div>';

        container.innerHTML = html;
    }

    /**
     * Update category performance display
     */
    updateCategoryPerformanceDisplay() {
        const container = document.getElementById('category-performance');
        if (!container) return;

        if (Object.keys(this.categoryPerformance).length === 0) {
            container.innerHTML = '<p>Take quizzes in different categories to see your performance!</p>';
            return;
        }

        let html = '<div class="performance-grid">';
        Object.entries(this.categoryPerformance).forEach(([category, stats]) => {
            html += `
                <div class="performance-card">
                    <div class="performance-category">${Utils.escapeHTML(category)}</div>
                    <div class="performance-stats">
                        <div class="performance-stat">
                            <span class="stat-value">${stats.totalQuizzes}</span>
                            <span class="stat-label">Quizzes</span>
                        </div>
                        <div class="performance-stat">
                            <span class="stat-value">${stats.averageScore}</span>
                            <span class="stat-label">Avg Score</span>
                        </div>
                        <div class="performance-stat">
                            <span class="stat-value">${stats.averageAccuracy}%</span>
                            <span class="stat-label">Accuracy</span>
                        </div>
                        <div class="performance-stat">
                            <span class="stat-value">${stats.bestScore}</span>
                            <span class="stat-label">Best</span>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';

        container.innerHTML = html;
    }

    /**
     * Update achievements count
     */
    updateAchievementsCount() {
        const countElement = document.getElementById('achievements-count');
        if (countElement && window.dashboardManager) {
            const achievements = window.dashboardManager.achievements || [];
            countElement.textContent = achievements.length;
        }
    }

    /**
     * Show edit profile modal
     */
    showEditProfileModal() {
        if (!window.uiManager || !this.userProfile) return;

        const modalContent = `
            <form id="edit-profile-form" class="edit-profile-form">
                <div class="form-group">
                    <label for="edit-username">Username</label>
                    <input type="text" id="edit-username" name="username" value="${Utils.escapeHTML(this.userProfile.username)}" required>
                </div>
                <div class="form-group">
                    <label for="edit-full-name">Full Name</label>
                    <input type="text" id="edit-full-name" name="fullName" value="${Utils.escapeHTML(this.userProfile.fullName || '')}">
                </div>
                <div class="form-group">
                    <label for="edit-email">Email</label>
                    <input type="email" id="edit-email" name="email" value="${Utils.escapeHTML(this.userProfile.email)}" readonly>
                    <small>Email cannot be changed</small>
                </div>
            </form>
        `;

        window.uiManager.showModal('Edit Profile', modalContent, [
            {
                text: 'Cancel',
                class: 'btn-outline',
                action: 'cancel'
            },
            {
                text: 'Save Changes',
                class: 'btn-primary',
                action: 'save',
                handler: () => this.saveProfileChanges()
            }
        ]);
    }

    /**
     * Save profile changes
     */
    async saveProfileChanges() {
        const form = document.getElementById('edit-profile-form');
        if (!form) return;

        const formData = new FormData(form);
        const username = formData.get('username');
        const fullName = formData.get('fullName');

        try {
            // Update in database if available
            if (authManager.supabase && authManager.isInitialized) {
                const { error } = await authManager.supabase
                    .from('profiles')
                    .update({
                        username: username,
                        full_name: fullName,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', this.userProfile.id);

                if (error) {
                    throw error;
                }
            }

            // Update local profile
            this.userProfile.username = username;
            this.userProfile.fullName = fullName;

            // Update UI
            this.updateProfileHeader();

            if (window.uiManager) {
                window.uiManager.showNotification(
                    'success',
                    'Profile Updated',
                    'Your profile has been updated successfully!',
                    3000
                );
            }

        } catch (error) {
            console.error('Failed to save profile changes:', error);
            if (window.uiManager) {
                window.uiManager.showNotification(
                    'error',
                    'Update Failed',
                    'Failed to update profile. Please try again.',
                    5000
                );
            }
        }
    }

    /**
     * Clear quiz history
     */
    clearQuizHistory() {
        if (!window.uiManager) return;

        window.uiManager.showModal(
            'Clear Quiz History',
            'Are you sure you want to clear your quiz history? This action cannot be undone.',
            [
                {
                    text: 'Cancel',
                    class: 'btn-outline',
                    action: 'cancel'
                },
                {
                    text: 'Clear History',
                    class: 'btn-error',
                    action: 'clear',
                    handler: () => this.performClearHistory()
                }
            ]
        );
    }

    /**
     * Perform clear history action
     */
    async performClearHistory() {
        try {
            // Clear from local storage
            Utils.storage.remove('quiz_results');

            // Clear local data
            this.quizHistory = [];
            this.categoryPerformance = {};

            // Update UI
            this.updateQuizHistoryDisplay();
            this.updateCategoryPerformanceDisplay();

            if (window.uiManager) {
                window.uiManager.showNotification(
                    'success',
                    'History Cleared',
                    'Your quiz history has been cleared.',
                    3000
                );
            }

        } catch (error) {
            console.error('Failed to clear history:', error);
            if (window.uiManager) {
                window.uiManager.showNotification(
                    'error',
                    'Clear Failed',
                    'Failed to clear history. Please try again.',
                    5000
                );
            }
        }
    }

    /**
     * Update user setting
     * @param {string} key - Setting key
     * @param {*} value - Setting value
     */
    updateSetting(key, value) {
        this.userSettings[key] = value;
        
        // Save to localStorage
        Utils.storage.set('user_settings', this.userSettings);
        
        // Apply setting
        this.applySetting(key, value);
        
        console.log(`Setting updated: ${key} = ${value}`);
    }

    /**
     * Apply setting change
     * @param {string} key - Setting key
     * @param {*} value - Setting value
     */
    applySetting(key, value) {
        switch (key) {
            case 'theme':
                if (window.uiManager) {
                    window.uiManager.setTheme(value);
                }
                break;
            case 'notifications':
                // Handle notification preference
                break;
            case 'soundEffects':
                // Handle sound effects preference
                break;
        }
    }

    /**
     * Load user settings
     */
    loadUserSettings() {
        const savedSettings = Utils.storage.get('user_settings', {});
        this.userSettings = { ...this.userSettings, ...savedSettings };
        
        // Apply settings to UI
        const themeSelect = document.getElementById('theme-preference');
        if (themeSelect) {
            themeSelect.value = this.userSettings.theme;
        }
        
        const notificationsCheckbox = document.getElementById('notifications-enabled');
        if (notificationsCheckbox) {
            notificationsCheckbox.checked = this.userSettings.notifications;
        }
        
        const soundEffectsCheckbox = document.getElementById('sound-effects');
        if (soundEffectsCheckbox) {
            soundEffectsCheckbox.checked = this.userSettings.soundEffects;
        }
    }

    /**
     * Refresh profile data
     */
    async refreshProfile() {
        const refreshBtn = document.getElementById('refresh-profile-btn');
        if (refreshBtn) {
            refreshBtn.classList.add('loading');
            refreshBtn.disabled = true;
        }

        await this.loadProfileData();

        if (refreshBtn) {
            refreshBtn.classList.remove('loading');
            refreshBtn.disabled = false;
        }

        if (window.uiManager) {
            window.uiManager.showNotification(
                'success',
                'Profile Refreshed',
                'Your profile data has been updated!',
                2000
            );
        }
    }

    /**
     * Clear profile data
     */
    clearProfileData() {
        this.userProfile = null;
        this.quizHistory = [];
        this.categoryPerformance = {};
        
        // Reset UI to default state
        const defaultProfile = {
            username: 'User',
            email: '',
            totalPoints: 0,
            quizzesCompleted: 0,
            averageScore: 0,
            rank: null
        };
        
        this.userProfile = defaultProfile;
        this.updateProfileUI();
    }

    /**
     * Get profile statistics
     * @returns {Object} Profile statistics
     */
    getProfileStats() {
        return {
            profile: this.userProfile,
            historyCount: this.quizHistory.length,
            categoriesPlayed: Object.keys(this.categoryPerformance).length,
            settings: this.userSettings
        };
    }
}

// Create global instance
const profileManager = new ProfileManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProfileManager;
}

// Make available globally
window.ProfileManager = ProfileManager;
window.profileManager = profileManager;