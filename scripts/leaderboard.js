// Leaderboard Manager for QuizMaster app
// Handles leaderboard functionality, rankings, and real-time updates

/**
 * Leaderboard Manager class
 * Manages leaderboard data, rankings, and real-time updates
 */
class LeaderboardManager {
    constructor() {
        this.leaderboardData = [];
        this.currentUserRank = null;
        this.isLoading = false;
        this.updateInterval = null;
        this.subscribers = [];
        this.realtimeSubscription = null;
        this.supabase = null;
        
        console.log('🏆 Leaderboard Manager initialized');
        
        // Initialize Supabase connection
        this.initializeSupabase();
        
        // Initialize with placeholder data
        this.initializePlaceholderData();
        
        // Set up real-time subscriptions
        this.setupRealTimeSubscriptions();
    }

    /**
     * Initialize Supabase connection
     */
    initializeSupabase() {
        // Get Supabase instance from auth manager
        if (window.authManager && window.authManager.supabase) {
            this.supabase = window.authManager.supabase;
            console.log('✅ Supabase connection established for leaderboard');
        } else {
            console.warn('⚠️ Supabase not available, using mock data');
        }
    }

    /**
     * Initialize with placeholder leaderboard data
     */
    initializePlaceholderData() {
        this.leaderboardData = [
            {
                id: '1',
                username: 'QuizMaster2024',
                totalPoints: 15420,
                quizzesCompleted: 87,
                averageScore: 177.2,
                rank: 1,
                avatar: 'Q',
                joinedDate: '2024-01-15'
            },
            {
                id: '2',
                username: 'BrainiacBob',
                totalPoints: 14850,
                quizzesCompleted: 92,
                averageScore: 161.4,
                rank: 2,
                avatar: 'B',
                joinedDate: '2024-01-20'
            },
            {
                id: '3',
                username: 'SmartSarah',
                totalPoints: 13990,
                quizzesCompleted: 78,
                averageScore: 179.4,
                rank: 3,
                avatar: 'S',
                joinedDate: '2024-02-01'
            },
            {
                id: '4',
                username: 'TriviaKing',
                totalPoints: 12750,
                quizzesCompleted: 65,
                averageScore: 196.2,
                rank: 4,
                avatar: 'T',
                joinedDate: '2024-02-10'
            },
            {
                id: '5',
                username: 'KnowledgeNinja',
                totalPoints: 11980,
                quizzesCompleted: 71,
                averageScore: 168.7,
                rank: 5,
                avatar: 'K',
                joinedDate: '2024-02-15'
            },
            {
                id: '6',
                username: 'QuizWhiz',
                totalPoints: 10850,
                quizzesCompleted: 58,
                averageScore: 187.1,
                rank: 6,
                avatar: 'Q',
                joinedDate: '2024-03-01'
            },
            {
                id: '7',
                username: 'FactFinder',
                totalPoints: 9720,
                quizzesCompleted: 54,
                averageScore: 180.0,
                rank: 7,
                avatar: 'F',
                joinedDate: '2024-03-05'
            },
            {
                id: '8',
                username: 'DataDragon',
                totalPoints: 8950,
                quizzesCompleted: 49,
                averageScore: 182.7,
                rank: 8,
                avatar: 'D',
                joinedDate: '2024-03-10'
            },
            {
                id: '9',
                username: 'InfoImpact',
                totalPoints: 8200,
                quizzesCompleted: 46,
                averageScore: 178.3,
                rank: 9,
                avatar: 'I',
                joinedDate: '2024-03-15'
            },
            {
                id: '10',
                username: 'WisdomWolf',
                totalPoints: 7650,
                quizzesCompleted: 42,
                averageScore: 182.1,
                rank: 10,
                avatar: 'W',
                joinedDate: '2024-03-20'
            }
        ];
    }

    /**
     * Get top users from leaderboard
     * @param {number} limit - Number of users to return
     * @param {string} category - Optional category filter
     * @returns {Promise<Object>} Leaderboard data
     */
    async getTopUsers(limit = 10, category = null) {
        try {
            this.isLoading = true;
            console.log(`🔍 Fetching top ${limit} users${category ? ` for ${category}` : ''}`);
            
            // Try to get from database first
            if (authManager.supabase && authManager.isInitialized) {
                return await this.getTopUsersFromDatabase(limit, category);
            } else {
                // Fallback to placeholder data
                return await this.getTopUsersFromPlaceholder(limit, category);
            }
            
        } catch (error) {
            console.error('❌ Failed to get top users:', error);
            // Fallback to placeholder data on error
            return await this.getTopUsersFromPlaceholder(limit, category);
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Get top users from database
     * @param {number} limit - Number of users to return
     * @param {string} category - Optional category filter
     * @returns {Promise<Object>} Leaderboard data
     */
    async getTopUsersFromDatabase(limit, category) {
        try {
            // Check cache first
            const cacheKey = `leaderboard_${category || 'all'}_${limit}`;
            if (window.performanceManager) {
                const cached = window.performanceManager.getCache(cacheKey);
                if (cached) {
                    console.log('📦 Using cached leaderboard data');
                    return cached;
                }
            }

            let query;
            
            if (category && category !== 'all') {
                // Get category-specific leaderboard
                query = authManager.supabase
                    .from('category_leaderboard')
                    .select('*')
                    .eq('category', category)
                    .order('category_points', { ascending: false })
                    .limit(limit);
            } else {
                // Get global leaderboard
                query = authManager.supabase
                    .from('leaderboard')
                    .select('*')
                    .order('total_points', { ascending: false })
                    .limit(limit);
            }

            const { data, error } = await query;

            if (error) {
                throw error;
            }

            // Transform database format to internal format
            const users = (data || []).map((user, index) => ({
                id: user.id,
                username: user.username,
                fullName: user.full_name,
                avatarUrl: user.avatar_url,
                totalPoints: category && category !== 'all' ? user.category_points : user.total_points,
                quizzesCompleted: category && category !== 'all' ? user.category_quizzes : user.quizzes_completed,
                averageScore: category && category !== 'all' ? user.category_accuracy : user.average_score,
                bestScore: category && category !== 'all' ? user.best_category_score : user.best_score,
                rank: category && category !== 'all' ? user.category_rank : user.rank,
                avatar: user.username ? user.username.charAt(0).toUpperCase() : 'U',
                joinedDate: user.created_at
            }));

            // Update local cache
            this.leaderboardData = users;

            const result = {
                success: true,
                users,
                total: users.length,
                category: category || 'all'
            };

            // Cache the results
            if (window.performanceManager) {
                window.performanceManager.setCache(cacheKey, result, 120000); // 2 minutes
            }

            console.log(`✅ Retrieved ${users.length} top users from database`);

            return result;

        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    }

    /**
     * Get top users from placeholder data
     * @param {number} limit - Number of users to return
     * @param {string} category - Optional category filter
     * @returns {Promise<Object>} Leaderboard data
     */
    async getTopUsersFromPlaceholder(limit, category) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Filter by category if specified (placeholder logic)
        let filteredData = [...this.leaderboardData];
        if (category && category !== 'all') {
            // In placeholder mode, just use all data
            console.log(`Filtering by category: ${category} (placeholder mode)`);
        }
        
        // Sort by total points (already sorted in placeholder data)
        filteredData.sort((a, b) => b.totalPoints - a.totalPoints);
        
        // Update ranks
        filteredData.forEach((user, index) => {
            user.rank = index + 1;
        });
        
        // Limit results
        const topUsers = filteredData.slice(0, limit);
        
        console.log(`✅ Retrieved ${topUsers.length} top users from placeholder`);
        
        return {
            success: true,
            users: topUsers,
            total: filteredData.length,
            category: category || 'all'
        };
    }

    /**
     * Get user's rank and position
     * @param {string} userId - User ID
     * @param {string} category - Optional category filter
     * @returns {Promise<Object>} User rank data
     */
    async getUserRank(userId, category = null) {
        try {
            console.log(`🔍 Getting rank for user: ${userId}`);
            
            // Try to get from database first
            if (authManager.supabase && authManager.isInitialized) {
                return await this.getUserRankFromDatabase(userId, category);
            } else {
                // Fallback to placeholder data
                return await this.getUserRankFromPlaceholder(userId);
            }
            
        } catch (error) {
            console.error('❌ Failed to get user rank:', error);
            return await this.getUserRankFromPlaceholder(userId);
        }
    }

    /**
     * Get user rank from database
     * @param {string} userId - User ID
     * @param {string} category - Optional category filter
     * @returns {Promise<Object>} User rank data
     */
    async getUserRankFromDatabase(userId, category) {
        try {
            // Use the database function to get user rank
            const { data, error } = await authManager.supabase.rpc('get_user_rank', {
                user_uuid: userId
            });

            if (error) {
                throw error;
            }

            const rank = data || 0;

            // Get user profile
            const { data: profile, error: profileError } = await authManager.supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (profileError) {
                throw profileError;
            }

            // Get context users (users around this rank)
            const contextStart = Math.max(1, rank - 2);
            const contextEnd = rank + 2;

            const { data: contextUsers } = await authManager.supabase
                .from('leaderboard')
                .select('*')
                .gte('rank', contextStart)
                .lte('rank', contextEnd)
                .order('rank');

            const user = {
                id: profile.id,
                username: profile.username,
                totalPoints: profile.total_points,
                quizzesCompleted: profile.quizzes_completed,
                averageScore: profile.average_score,
                rank: rank
            };

            this.currentUserRank = user;

            console.log(`✅ User rank from database: ${rank}`);

            return {
                success: true,
                user,
                rank,
                totalUsers: null, // Would need separate query
                context: contextUsers || []
            };

        } catch (error) {
            console.error('Database rank query error:', error);
            throw error;
        }
    }

    /**
     * Get user rank from placeholder data
     * @param {string} userId - User ID
     * @returns {Promise<Object>} User rank data
     */
    async getUserRankFromPlaceholder(userId) {
        // Find user in leaderboard
        const userIndex = this.leaderboardData.findIndex(user => user.id === userId);
        
        if (userIndex === -1) {
            return {
                success: false,
                message: 'User not found in leaderboard',
                rank: null
            };
        }
        
        const user = this.leaderboardData[userIndex];
        const rank = userIndex + 1;
        
        // Get users around this user (for context)
        const contextStart = Math.max(0, userIndex - 2);
        const contextEnd = Math.min(this.leaderboardData.length, userIndex + 3);
        const context = this.leaderboardData.slice(contextStart, contextEnd);
        
        this.currentUserRank = {
            ...user,
            rank,
            context
        };
        
        console.log(`✅ User rank from placeholder: ${rank}`);
        
        return {
            success: true,
            user: this.currentUserRank,
            rank,
            totalUsers: this.leaderboardData.length,
            context
        };
    }

    /**
     * Update user score
     * @param {string} userId - User ID
     * @param {number} newScore - New score to add
     * @returns {Promise<Object>} Update result
     */
    async updateUserScore(userId, newScore) {
        try {
            console.log(`📈 Updating score for user ${userId}: +${newScore}`);
            
            // Database update is handled by the quiz manager
            // This method is mainly for local cache updates and notifications
            
            // Update local cache if using placeholder data
            if (!authManager.supabase || !authManager.isInitialized) {
                await this.updatePlaceholderUserScore(userId, newScore);
            }
            
            // Refresh leaderboard data
            await this.refreshLeaderboard();
            
            // Notify subscribers of update
            this.notifySubscribers();
            
            return {
                success: true,
                message: 'Score updated successfully'
            };
            
        } catch (error) {
            console.error('❌ Failed to update user score:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Update placeholder user score
     * @param {string} userId - User ID
     * @param {number} newScore - New score to add
     */
    async updatePlaceholderUserScore(userId, newScore) {
        // Find user in leaderboard
        const userIndex = this.leaderboardData.findIndex(user => user.id === userId);
        
        if (userIndex === -1) {
            // Create new user entry
            const newUser = {
                id: userId,
                username: `User${userId.slice(-4)}`,
                totalPoints: newScore,
                quizzesCompleted: 1,
                averageScore: newScore,
                avatar: userId.charAt(0).toUpperCase(),
                joinedDate: new Date().toISOString().split('T')[0]
            };
            
            this.leaderboardData.push(newUser);
            console.log('✅ Created new user entry in placeholder');
        } else {
            // Update existing user
            const user = this.leaderboardData[userIndex];
            user.totalPoints += newScore;
            user.quizzesCompleted += 1;
            user.averageScore = Math.round(user.totalPoints / user.quizzesCompleted);
            
            console.log('✅ Updated existing user in placeholder');
        }
        
        // Re-sort leaderboard
        this.leaderboardData.sort((a, b) => b.totalPoints - a.totalPoints);
        
        // Update ranks
        this.leaderboardData.forEach((user, index) => {
            user.rank = index + 1;
        });
    }

    /**
     * Refresh leaderboard data
     */
    async refreshLeaderboard() {
        try {
            const result = await this.getTopUsers(50); // Get top 50 for cache
            if (result.success) {
                this.leaderboardData = result.users;
            }
        } catch (error) {
            console.error('Failed to refresh leaderboard:', error);
        }
    }

    /**
     * Subscribe to leaderboard updates
     * @param {Function} callback - Callback function for updates
     * @returns {Function} Unsubscribe function
     */
    subscribeToUpdates(callback) {
        if (!this.subscribers) {
            this.subscribers = [];
        }
        
        this.subscribers.push(callback);
        console.log('📡 Subscribed to leaderboard updates');
        
        // Set up real-time subscription if using Supabase
        if (authManager.supabase && authManager.isInitialized && !this.realtimeSubscription) {
            this.setupRealtimeSubscription();
        }
        
        // Return unsubscribe function
        return () => {
            const index = this.subscribers.indexOf(callback);
            if (index > -1) {
                this.subscribers.splice(index, 1);
                console.log('📡 Unsubscribed from leaderboard updates');
            }
        };
    }

    /**
     * Set up real-time subscription for leaderboard updates
     */
    setupRealtimeSubscription() {
        try {
            this.realtimeSubscription = authManager.supabase
                .channel('leaderboard-changes')
                .on('postgres_changes', 
                    { 
                        event: '*', 
                        schema: 'public', 
                        table: 'profiles' 
                    }, 
                    (payload) => {
                        console.log('📡 Real-time leaderboard update:', payload);
                        this.handleRealtimeUpdate(payload);
                    }
                )
                .subscribe();

            console.log('📡 Real-time leaderboard subscription established');

        } catch (error) {
            console.error('Failed to set up real-time subscription:', error);
        }
    }

    /**
     * Handle real-time update from Supabase
     * @param {Object} payload - Update payload
     */
    async handleRealtimeUpdate(payload) {
        try {
            // Refresh leaderboard data
            await this.refreshLeaderboard();
            
            // Notify all subscribers
            this.notifySubscribers();
            
        } catch (error) {
            console.error('Error handling real-time update:', error);
        }
    }

    /**
     * Notify all subscribers of updates
     */
    notifySubscribers() {
        if (this.subscribers) {
            this.subscribers.forEach(callback => {
                try {
                    callback(this.leaderboardData);
                } catch (error) {
                    console.error('Error in leaderboard subscriber:', error);
                }
            });
        }
    }

    /**
     * Start real-time updates
     * @param {number} interval - Update interval in milliseconds
     */
    startRealTimeUpdates(interval = 30000) {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        this.updateInterval = setInterval(async () => {
            console.log('🔄 Refreshing leaderboard data...');
            
            // In a real implementation, this would fetch fresh data from the server
            // For now, we'll just simulate small changes
            this.simulateLeaderboardChanges();
            
        }, interval);
        
        console.log(`📡 Started real-time updates (${interval}ms interval)`);
    }

    /**
     * Stop real-time updates
     */
    stopRealTimeUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
            console.log('📡 Stopped real-time updates');
        }
    }

    /**
     * Simulate leaderboard changes for development
     */
    simulateLeaderboardChanges() {
        // Randomly update a few users' scores
        const usersToUpdate = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < usersToUpdate; i++) {
            const randomIndex = Math.floor(Math.random() * this.leaderboardData.length);
            const user = this.leaderboardData[randomIndex];
            const scoreChange = Math.floor(Math.random() * 100) + 10;
            
            user.totalPoints += scoreChange;
            user.quizzesCompleted += 1;
            user.averageScore = user.totalPoints / user.quizzesCompleted;
        }
        
        // Re-sort and update ranks
        this.leaderboardData.sort((a, b) => b.totalPoints - a.totalPoints);
        this.leaderboardData.forEach((user, index) => {
            user.rank = index + 1;
        });
        
        // Notify subscribers
        this.notifySubscribers();
        
        console.log('🎲 Simulated leaderboard changes');
    }

    /**
     * Get leaderboard statistics
     * @returns {Object} Leaderboard statistics
     */
    getStatistics() {
        if (this.leaderboardData.length === 0) {
            return {
                totalUsers: 0,
                totalQuizzes: 0,
                averageScore: 0,
                topScore: 0,
                mostActiveUser: null
            };
        }
        
        const totalUsers = this.leaderboardData.length;
        const totalQuizzes = this.leaderboardData.reduce((sum, user) => sum + user.quizzesCompleted, 0);
        const averageScore = Math.round(
            this.leaderboardData.reduce((sum, user) => sum + user.averageScore, 0) / totalUsers
        );
        const topScore = Math.max(...this.leaderboardData.map(user => user.totalPoints));
        const mostActiveUser = this.leaderboardData.reduce((most, user) => 
            user.quizzesCompleted > (most?.quizzesCompleted || 0) ? user : most, null
        );
        
        return {
            totalUsers,
            totalQuizzes,
            averageScore,
            topScore,
            mostActiveUser: mostActiveUser?.username || 'None'
        };
    }

    /**
     * Search users in leaderboard
     * @param {string} query - Search query
     * @returns {Array} Matching users
     */
    searchUsers(query) {
        if (!query || query.trim().length === 0) {
            return [];
        }
        
        const searchTerm = query.toLowerCase().trim();
        
        return this.leaderboardData.filter(user => 
            user.username.toLowerCase().includes(searchTerm)
        ).slice(0, 10); // Limit to 10 results
    }

    /**
     * Get current leaderboard state
     * @returns {Object} Current state
     */
    getCurrentState() {
        return {
            isLoading: this.isLoading,
            totalUsers: this.leaderboardData.length,
            currentUserRank: this.currentUserRank,
            hasRealTimeUpdates: !!this.updateInterval,
            lastUpdated: new Date()
        };
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        this.stopRealTimeUpdates();
        
        if (this.subscribers) {
            this.subscribers = [];
        }
        
        console.log('🧹 Leaderboard Manager cleaned up');
    }
}

// Create global instance
const leaderboardManager = new LeaderboardManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LeaderboardManager;
}

// Make available globally
window.LeaderboardManager = LeaderboardManager;
window.leaderboardManager = leaderboardManager;