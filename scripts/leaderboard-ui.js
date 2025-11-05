// Leaderboard UI Manager for QuizMaster app
// Handles leaderboard interface, interactions, and real-time updates

/**
 * Leaderboard UI Manager class
 * Manages leaderboard display, filtering, and user interactions
 */
class LeaderboardUI {
    constructor() {
        this.currentCategory = 'all';
        this.currentLimit = 25;
        this.searchQuery = '';
        this.isLoading = false;
        this.leaderboardData = [];
        this.userRankData = null;
        
        console.log('🏆 Leaderboard UI initialized');
        
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
                this.loadLeaderboard();
                this.loadUserRank();
            });
        } else {
            this.setupEventListeners();
            this.loadLeaderboard();
            this.loadUserRank();
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Category filter buttons
        const filterButtons = document.querySelectorAll('.filter-button');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const category = e.target.getAttribute('data-category');
                this.setCategory(category);
            });
        });

        // Search input
        const searchInput = document.getElementById('leaderboard-search');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.setSearchQuery(e.target.value);
            }, 500));
        }

        // Limit selector
        const limitSelect = document.getElementById('leaderboard-limit');
        if (limitSelect) {
            limitSelect.addEventListener('change', (e) => {
                this.setLimit(parseInt(e.target.value));
            });
        }

        // Refresh buttons
        const refreshBtn = document.getElementById('refresh-leaderboard-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshLeaderboard();
            });
        }

        const refreshRankBtn = document.getElementById('refresh-rank-btn');
        if (refreshRankBtn) {
            refreshRankBtn.addEventListener('click', () => {
                this.refreshUserRank();
            });
        }

        // Load more button
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreUsers();
            });
        }

        // Subscribe to leaderboard updates
        if (window.leaderboardManager) {
            window.leaderboardManager.subscribeToUpdates((data) => {
                this.handleLeaderboardUpdate(data);
            });
        }
    }

    /**
     * Set category filter
     * @param {string} category - Category to filter by
     */
    setCategory(category) {
        if (this.currentCategory === category) return;

        this.currentCategory = category;
        
        // Update active filter button
        const filterButtons = document.querySelectorAll('.filter-button');
        filterButtons.forEach(button => {
            if (button.getAttribute('data-category') === category) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });

        // Reload leaderboard
        this.loadLeaderboard();
    }

    /**
     * Set search query
     * @param {string} query - Search query
     */
    setSearchQuery(query) {
        this.searchQuery = query.trim();
        this.filterLeaderboard();
    }

    /**
     * Set result limit
     * @param {number} limit - Number of results to show
     */
    setLimit(limit) {
        if (this.currentLimit === limit) return;

        this.currentLimit = limit;
        this.loadLeaderboard();
    }

    /**
     * Load leaderboard data
     */
    async loadLeaderboard() {
        try {
            this.setLoadingState(true);
            
            if (!window.leaderboardManager) {
                throw new Error('Leaderboard manager not available');
            }

            const result = await window.leaderboardManager.getTopUsers(
                this.currentLimit, 
                this.currentCategory
            );

            if (result.success) {
                this.leaderboardData = result.users;
                this.renderLeaderboard(this.leaderboardData);
                this.showLeaderboardList();
            } else {
                this.showLeaderboardError(result.error || 'Failed to load leaderboard');
            }

        } catch (error) {
            console.error('Failed to load leaderboard:', error);
            this.showLeaderboardError(error.message);
        } finally {
            this.setLoadingState(false);
        }
    }

    /**
     * Load user rank data
     */
    async loadUserRank() {
        try {
            if (!window.leaderboardManager || !authManager.getCurrentUser()) {
                return;
            }

            const user = authManager.getCurrentUser();
            const result = await window.leaderboardManager.getUserRank(user.id, this.currentCategory);

            if (result.success) {
                this.userRankData = result;
                this.renderUserRank(result);
                this.showUserRankCard();
            }

        } catch (error) {
            console.error('Failed to load user rank:', error);
        }
    }

    /**
     * Refresh leaderboard
     */
    async refreshLeaderboard() {
        const refreshBtn = document.getElementById('refresh-leaderboard-btn');
        if (refreshBtn) {
            refreshBtn.classList.add('loading');
            refreshBtn.disabled = true;
        }

        await this.loadLeaderboard();

        if (refreshBtn) {
            refreshBtn.classList.remove('loading');
            refreshBtn.disabled = false;
        }

        if (window.uiManager) {
            window.uiManager.showNotification('success', 'Refreshed', 'Leaderboard updated!', 2000);
        }
    }

    /**
     * Refresh user rank
     */
    async refreshUserRank() {
        const refreshBtn = document.getElementById('refresh-rank-btn');
        if (refreshBtn) {
            refreshBtn.classList.add('loading');
            refreshBtn.disabled = true;
        }

        await this.loadUserRank();

        if (refreshBtn) {
            refreshBtn.classList.remove('loading');
            refreshBtn.disabled = false;
        }
    }

    /**
     * Filter leaderboard based on search query
     */
    filterLeaderboard() {
        if (!this.searchQuery) {
            this.renderLeaderboard(this.leaderboardData);
            return;
        }

        const filteredData = this.leaderboardData.filter(user => 
            user.username.toLowerCase().includes(this.searchQuery.toLowerCase())
        );

        this.renderLeaderboard(filteredData);

        if (filteredData.length === 0) {
            this.showLeaderboardEmpty();
        }
    }

    /**
     * Render leaderboard list
     * @param {Array} users - Array of user data
     */
    renderLeaderboard(users) {
        const container = document.getElementById('leaderboard-list');
        if (!container) return;

        if (users.length === 0) {
            this.showLeaderboardEmpty();
            return;
        }

        let html = '';
        users.forEach((user, index) => {
            const isCurrentUser = authManager.getCurrentUser()?.id === user.id;
            
            html += `
                <div class="leaderboard-item ${isCurrentUser ? 'current-user' : ''}" data-user-id="${user.id}">
                    <div class="leaderboard-rank ${user.rank <= 3 ? 'top-3' : ''}">${user.rank}</div>
                    <div class="leaderboard-avatar" style="background-color: ${this.getAvatarColor(user.username)}">
                        ${user.avatar || user.username.charAt(0).toUpperCase()}
                    </div>
                    <div class="leaderboard-info">
                        <div class="leaderboard-name">
                            ${Utils.escapeHTML(user.username)}
                            ${isCurrentUser ? '<span class="current-user-badge">You</span>' : ''}
                        </div>
                        <div class="leaderboard-stats">
                            ${user.quizzesCompleted} quizzes • ${Math.round(user.averageScore || 0)} avg score
                        </div>
                    </div>
                    <div class="leaderboard-points">
                        ${Utils.formatNumber(user.totalPoints)}
                        <span class="points-label">pts</span>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    /**
     * Render user rank card
     * @param {Object} rankData - User rank data
     */
    renderUserRank(rankData) {
        const rankNumber = document.querySelector('.rank-number');
        const userRankPoints = document.getElementById('user-rank-points');
        const userRankQuizzes = document.getElementById('user-rank-quizzes');

        if (rankNumber) {
            rankNumber.textContent = `#${rankData.rank || '-'}`;
        }

        if (userRankPoints) {
            userRankPoints.textContent = Utils.formatNumber(rankData.user?.totalPoints || 0);
        }

        if (userRankQuizzes) {
            userRankQuizzes.textContent = rankData.user?.quizzesCompleted || 0;
        }
    }

    /**
     * Handle leaderboard update from real-time subscription
     * @param {Array} data - Updated leaderboard data
     */
    handleLeaderboardUpdate(data) {
        console.log('📡 Received leaderboard update');
        
        // Update local data
        this.leaderboardData = data;
        
        // Re-render if not searching
        if (!this.searchQuery) {
            this.renderLeaderboard(this.leaderboardData);
        }
        
        // Refresh user rank
        this.loadUserRank();
        
        // Show update notification
        if (window.uiManager) {
            window.uiManager.showNotification('info', 'Updated', 'Leaderboard refreshed!', 2000);
        }
    }

    /**
     * Load more users (pagination)
     */
    async loadMoreUsers() {
        // Increase limit and reload
        this.currentLimit += 25;
        await this.loadLeaderboard();
    }

    /**
     * Set loading state
     * @param {boolean} loading - Loading state
     */
    setLoadingState(loading) {
        this.isLoading = loading;
        
        const loadingElement = document.getElementById('leaderboard-loading');
        const listElement = document.getElementById('leaderboard-list');
        
        if (loading) {
            if (loadingElement) loadingElement.classList.remove('hidden');
            if (listElement) listElement.classList.add('hidden');
        } else {
            if (loadingElement) loadingElement.classList.add('hidden');
        }
    }

    /**
     * Show leaderboard list
     */
    showLeaderboardList() {
        const listElement = document.getElementById('leaderboard-list');
        const emptyElement = document.getElementById('leaderboard-empty');
        const errorElement = document.getElementById('leaderboard-error');
        
        if (listElement) listElement.classList.remove('hidden');
        if (emptyElement) emptyElement.classList.add('hidden');
        if (errorElement) errorElement.classList.add('hidden');
    }

    /**
     * Show empty state
     */
    showLeaderboardEmpty() {
        const listElement = document.getElementById('leaderboard-list');
        const emptyElement = document.getElementById('leaderboard-empty');
        const errorElement = document.getElementById('leaderboard-error');
        
        if (listElement) listElement.classList.add('hidden');
        if (emptyElement) emptyElement.classList.remove('hidden');
        if (errorElement) errorElement.classList.add('hidden');
    }

    /**
     * Show error state
     * @param {string} message - Error message
     */
    showLeaderboardError(message) {
        const listElement = document.getElementById('leaderboard-list');
        const emptyElement = document.getElementById('leaderboard-empty');
        const errorElement = document.getElementById('leaderboard-error');
        
        if (listElement) listElement.classList.add('hidden');
        if (emptyElement) emptyElement.classList.add('hidden');
        if (errorElement) {
            errorElement.classList.remove('hidden');
            const errorText = errorElement.querySelector('p');
            if (errorText) {
                errorText.textContent = message;
            }
        }
    }

    /**
     * Show user rank card
     */
    showUserRankCard() {
        const rankCard = document.getElementById('user-rank-card');
        if (rankCard) {
            rankCard.classList.remove('hidden');
        }
    }

    /**
     * Get avatar color based on username
     * @param {string} username - Username
     * @returns {string} Color hex code
     */
    getAvatarColor(username) {
        const colors = [
            '#6366f1', '#8b5cf6', '#10b981', '#f59e0b', 
            '#ef4444', '#3b82f6', '#06b6d4', '#84cc16',
            '#f97316', '#ec4899'
        ];
        
        const hash = username.split('').reduce((acc, char) => {
            return char.charCodeAt(0) + ((acc << 5) - acc);
        }, 0);
        
        return colors[Math.abs(hash) % colors.length];
    }

    /**
     * Get current state
     * @returns {Object} Current UI state
     */
    getCurrentState() {
        return {
            category: this.currentCategory,
            limit: this.currentLimit,
            searchQuery: this.searchQuery,
            isLoading: this.isLoading,
            userCount: this.leaderboardData.length
        };
    }
}

// Create global instance
const leaderboardUI = new LeaderboardUI();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LeaderboardUI;
}

// Make available globally
window.LeaderboardUI = LeaderboardUI;
window.leaderboardUI = leaderboardUI;