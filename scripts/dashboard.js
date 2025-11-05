// Dashboard Manager for QuizMaster app
// Handles dashboard functionality, user statistics, and recent activity

/**
 * Dashboard Manager class
 * Manages dashboard data, user statistics, and activity tracking
 */
class DashboardManager {
    constructor() {
        this.userStats = null;
        this.recentActivity = [];
        this.achievements = [];
        this.isLoading = false;
        
        console.log('📊 Dashboard Manager initialized');
        
        // Initialize dashboard
        this.initializeDashboard();
    }

    /**
     * Initialize dashboard components
     */
    initializeDashboard() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupEventListeners();
                this.loadDashboardData();
            });
        } else {
            this.setupEventListeners();
            this.loadDashboardData();
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
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

        // Listen for authentication state changes
        if (window.authManager) {
            window.authManager.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_IN' && session) {
                    this.loadDashboardData();
                } else if (event === 'SIGNED_OUT') {
                    this.clearDashboardData();
                }
            });
        }
    }

    /**
     * Load all dashboard data
     */
    async loadDashboardData() {
        if (!authManager.getCurrentUser()) {
            return;
        }

        this.setLoadingState(true);

        try {
            // Load data in parallel
            await Promise.all([
                this.loadUserStatistics(),
                this.loadRecentActivity(),
                this.loadUserAchievements(),
                this.loadLeaderboardPreview()
            ]);

            // Update dashboard UI
            this.updateDashboardUI();

        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            this.showDashboardError(error.message);
        } finally {
            this.setLoadingState(false);
        }
    }

    /**
     * Load user statistics
     */
    async loadUserStatistics() {
        try {
            const user = authManager.getCurrentUser();
            if (!user) return;

            // Try to get from database first
            if (authManager.supabase && authManager.isInitialized) {
                const { data: profile, error } = await authManager.supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error && error.code !== 'PGRST116') { // Not found error
                    throw error;
                }

                if (profile) {
                    this.userStats = {
                        totalPoints: profile.total_points || 0,
                        quizzesCompleted: profile.quizzes_completed || 0,
                        averageScore: profile.average_score || 0,
                        bestScore: profile.best_score || 0,
                        favoriteCategory: profile.favorite_category || 'General Knowledge',
                        streakCount: profile.streak_count || 0,
                        lastQuizDate: profile.last_quiz_date,
                        joinedDate: profile.created_at
                    };

                    // Get user rank
                    if (window.leaderboardManager) {
                        const rankResult = await window.leaderboardManager.getUserRank(user.id);
                        if (rankResult.success) {
                            this.userStats.rank = rankResult.rank;
                        }
                    }

                    return;
                }
            }

            // Fallback to local storage
            const savedResults = Utils.storage.get('quiz_results', []);
            if (window.scoreCalculator) {
                this.userStats = window.scoreCalculator.getScoringStatistics(savedResults);
                this.userStats.rank = null;
            } else {
                this.userStats = {
                    totalPoints: 0,
                    quizzesCompleted: 0,
                    averageScore: 0,
                    bestScore: 0,
                    rank: null
                };
            }

        } catch (error) {
            console.error('Failed to load user statistics:', error);
            this.userStats = {
                totalPoints: 0,
                quizzesCompleted: 0,
                averageScore: 0,
                bestScore: 0,
                rank: null
            };
        }
    }

    /**
     * Load recent quiz activity
     */
    async loadRecentActivity() {
        try {
            const user = authManager.getCurrentUser();
            if (!user) return;

            // Try to get from database first
            if (authManager.supabase && authManager.isInitialized) {
                const { data, error } = await authManager.supabase
                    .from('quiz_results')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('completed_at', { ascending: false })
                    .limit(5);

                if (error) {
                    throw error;
                }

                this.recentActivity = (data || []).map(result => ({
                    id: result.id,
                    category: result.category,
                    difficulty: result.difficulty,
                    score: result.total_points,
                    accuracy: result.accuracy,
                    questionsAnswered: result.questions_answered,
                    correctAnswers: result.correct_answers,
                    completedAt: result.completed_at
                }));

                return;
            }

            // Fallback to local storage
            const savedResults = Utils.storage.get('quiz_results', []);
            this.recentActivity = savedResults
                .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
                .slice(0, 5);

        } catch (error) {
            console.error('Failed to load recent activity:', error);
            this.recentActivity = [];
        }
    }

    /**
     * Load user achievements
     */
    async loadUserAchievements() {
        try {
            const user = authManager.getCurrentUser();
            if (!user) return;

            // Try to get from database first
            if (authManager.supabase && authManager.isInitialized) {
                const { data, error } = await authManager.supabase
                    .from('user_achievements')
                    .select(`
                        *,
                        achievements (
                            name,
                            description,
                            icon,
                            points_reward
                        )
                    `)
                    .eq('user_id', user.id)
                    .order('earned_at', { ascending: false })
                    .limit(5);

                if (error) {
                    throw error;
                }

                this.achievements = (data || []).map(userAchievement => ({
                    id: userAchievement.achievement_id,
                    name: userAchievement.achievements.name,
                    description: userAchievement.achievements.description,
                    icon: userAchievement.achievements.icon,
                    pointsReward: userAchievement.achievements.points_reward,
                    earnedAt: userAchievement.earned_at
                }));

                return;
            }

            // Fallback - generate achievement progress based on stats
            if (window.scoreCalculator && this.userStats) {
                this.achievements = window.scoreCalculator.getAchievementProgress(this.userStats)
                    .filter(achievement => achievement.completed)
                    .slice(0, 5);
            } else {
                this.achievements = [];
            }

        } catch (error) {
            console.error('Failed to load user achievements:', error);
            this.achievements = [];
        }
    }

    /**
     * Load leaderboard preview
     */
    async loadLeaderboardPreview() {
        try {
            if (window.leaderboardManager) {
                const result = await window.leaderboardManager.getTopUsers(3);
                if (result.success && window.uiManager) {
                    window.uiManager.updateLeaderboardPreview(result.users);
                }
            }
        } catch (error) {
            console.error('Failed to load leaderboard preview:', error);
        }
    }

    /**
     * Update dashboard UI with loaded data
     */
    updateDashboardUI() {
        // Update user statistics
        if (this.userStats && window.uiManager) {
            window.uiManager.updateDashboardStats(this.userStats);
        }

        // Update recent activity
        if (window.uiManager) {
            window.uiManager.updateRecentActivity(this.recentActivity);
        }

        // Update achievements
        this.updateAchievementsDisplay();

        // Update welcome message
        this.updateWelcomeMessage();
    }

    /**
     * Update achievements display
     */
    updateAchievementsDisplay() {
        const container = document.getElementById('user-achievements');
        if (!container) return;

        if (!this.achievements || this.achievements.length === 0) {
            container.innerHTML = '<p>Complete your first quiz to earn achievements!</p>';
            return;
        }

        let html = '<div class="achievements-list">';
        this.achievements.forEach(achievement => {
            html += `
                <div class="achievement-item">
                    <div class="achievement-icon">${achievement.icon || '🏆'}</div>
                    <div class="achievement-info">
                        <div class="achievement-name">${Utils.escapeHTML(achievement.name)}</div>
                        <div class="achievement-description">${Utils.escapeHTML(achievement.description)}</div>
                        ${achievement.earnedAt ? `
                            <div class="achievement-date">
                                Earned ${Utils.formatDate(achievement.earnedAt, { 
                                    month: 'short', 
                                    day: 'numeric' 
                                })}
                            </div>
                        ` : ''}
                    </div>
                    ${achievement.pointsReward ? `
                        <div class="achievement-points">+${achievement.pointsReward}</div>
                    ` : ''}
                </div>
            `;
        });
        html += '</div>';

        container.innerHTML = html;
    }

    /**
     * Update welcome message based on user activity
     */
    updateWelcomeMessage() {
        const headerElement = document.querySelector('#dashboard-page .page-header p');
        if (!headerElement || !this.userStats) return;

        let message = 'Welcome back! Ready for your next challenge?';

        if (this.userStats.quizzesCompleted === 0) {
            message = 'Welcome to QuizMaster! Take your first quiz to get started.';
        } else if (this.userStats.quizzesCompleted < 5) {
            message = 'Great start! Keep taking quizzes to improve your ranking.';
        } else if (this.userStats.streakCount > 0) {
            message = `You're on fire! ${this.userStats.streakCount} correct answers in a row!`;
        } else if (this.userStats.rank && this.userStats.rank <= 10) {
            message = `Amazing! You're ranked #${this.userStats.rank} on the leaderboard!`;
        }

        headerElement.textContent = message;
    }

    /**
     * Start a quick quiz
     * @param {string} category - Quiz category
     * @param {string} difficulty - Quiz difficulty
     * @param {number} count - Number of questions
     */
    async startQuickQuiz(category, difficulty, count) {
        if (window.uiManager) {
            await window.uiManager.startQuickQuiz(category, difficulty, count);
        }
    }

    /**
     * Refresh dashboard data
     */
    async refreshDashboard() {
        await this.loadDashboardData();
        
        if (window.uiManager) {
            window.uiManager.showNotification(
                'success',
                'Refreshed',
                'Dashboard updated with latest data!',
                2000
            );
        }
    }

    /**
     * Set loading state
     * @param {boolean} loading - Loading state
     */
    setLoadingState(loading) {
        this.isLoading = loading;
        
        const dashboardContent = document.querySelector('.dashboard-content');
        if (dashboardContent) {
            if (loading) {
                dashboardContent.classList.add('loading');
            } else {
                dashboardContent.classList.remove('loading');
            }
        }
    }

    /**
     * Show dashboard error
     * @param {string} message - Error message
     */
    showDashboardError(message) {
        if (window.uiManager) {
            window.uiManager.showNotification(
                'error',
                'Dashboard Error',
                message,
                5000
            );
        }
    }

    /**
     * Clear dashboard data
     */
    clearDashboardData() {
        this.userStats = null;
        this.recentActivity = [];
        this.achievements = [];
        
        // Reset UI to default state
        const defaultStats = {
            totalPoints: 0,
            quizzesCompleted: 0,
            averageScore: 0,
            bestScore: 0,
            rank: null
        };
        
        if (window.uiManager) {
            window.uiManager.updateDashboardStats(defaultStats);
            window.uiManager.updateRecentActivity([]);
        }
        
        this.updateAchievementsDisplay();
    }

    /**
     * Get dashboard statistics
     * @returns {Object} Dashboard statistics
     */
    getDashboardStats() {
        return {
            userStats: this.userStats,
            recentActivityCount: this.recentActivity.length,
            achievementsCount: this.achievements.length,
            isLoading: this.isLoading
        };
    }
}

// Create global instance
const dashboardManager = new DashboardManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardManager;
}

// Make available globally
window.DashboardManager = DashboardManager;
window.dashboardManager = dashboardManager;