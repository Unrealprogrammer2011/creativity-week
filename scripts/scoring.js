// Scoring System for QuizMaster app
// Handles point calculations, bonuses, penalties, and achievements

/**
 * Score Calculator class
 * Manages all scoring logic including bonuses, penalties, and special conditions
 */
class ScoreCalculator {
    constructor() {
        this.pointsConfig = APP_CONFIG.quiz.pointsSystem;
        this.streakMultiplier = 1.0;
        this.timeBonus = 0;
        
        console.log('🎯 Score Calculator initialized');
    }

    /**
     * Calculate points for a single answer
     * @param {Object} question - Question object
     * @param {boolean} isCorrect - Whether answer is correct
     * @param {number} timeSpent - Time spent on question (seconds)
     * @param {number} consecutiveCorrect - Number of consecutive correct answers
     * @param {Object} options - Additional scoring options
     * @returns {Object} Scoring result
     */
    calculateAnswerPoints(question, isCorrect, timeSpent, consecutiveCorrect = 0, options = {}) {
        let basePoints = question.points || this.getBasePoints(question.difficulty);
        let finalPoints = 0;
        let bonuses = [];
        let penalties = [];

        if (isCorrect) {
            finalPoints = basePoints;

            // Consecutive answer bonus
            if (consecutiveCorrect >= 2) {
                const streakBonus = Math.floor(basePoints * this.pointsConfig.bonusMultiplier - basePoints);
                finalPoints += streakBonus;
                bonuses.push({
                    type: 'streak',
                    amount: streakBonus,
                    description: `${consecutiveCorrect + 1} in a row!`
                });
            }

            // Speed bonus (if answered quickly)
            const speedBonus = this.calculateSpeedBonus(basePoints, timeSpent, question.difficulty);
            if (speedBonus > 0) {
                finalPoints += speedBonus;
                bonuses.push({
                    type: 'speed',
                    amount: speedBonus,
                    description: 'Quick answer!'
                });
            }

            // Difficulty bonus
            if (question.difficulty === 'hard') {
                const difficultyBonus = Math.floor(basePoints * 0.2);
                finalPoints += difficultyBonus;
                bonuses.push({
                    type: 'difficulty',
                    amount: difficultyBonus,
                    description: 'Hard question mastery!'
                });
            }

            // Perfect accuracy bonus (if specified)
            if (options.perfectAccuracy) {
                const perfectBonus = Math.floor(basePoints * 0.5);
                finalPoints += perfectBonus;
                bonuses.push({
                    type: 'perfect',
                    amount: perfectBonus,
                    description: 'Perfect accuracy!'
                });
            }

        } else {
            // Incorrect answer penalty
            const penalty = Math.floor(basePoints * this.pointsConfig.penaltyPercentage);
            finalPoints = -penalty;
            penalties.push({
                type: 'incorrect',
                amount: penalty,
                description: 'Incorrect answer'
            });

            // Time penalty for very slow answers
            if (timeSpent > 60) { // More than 1 minute
                const timePenalty = Math.floor(penalty * 0.5);
                finalPoints -= timePenalty;
                penalties.push({
                    type: 'time',
                    amount: timePenalty,
                    description: 'Slow response'
                });
            }
        }

        return {
            basePoints,
            finalPoints: Math.max(finalPoints, isCorrect ? 1 : -Math.floor(basePoints * 0.5)), // Minimum bounds
            bonuses,
            penalties,
            isCorrect,
            breakdown: this.createPointsBreakdown(basePoints, bonuses, penalties)
        };
    }

    /**
     * Calculate speed bonus based on response time
     * @param {number} basePoints - Base points for the question
     * @param {number} timeSpent - Time spent in seconds
     * @param {string} difficulty - Question difficulty
     * @returns {number} Speed bonus points
     */
    calculateSpeedBonus(basePoints, timeSpent, difficulty) {
        const timeThresholds = {
            easy: 10,    // 10 seconds for easy questions
            medium: 15,  // 15 seconds for medium questions
            hard: 20     // 20 seconds for hard questions
        };

        const threshold = timeThresholds[difficulty] || 15;
        
        if (timeSpent <= threshold) {
            const speedRatio = (threshold - timeSpent) / threshold;
            return Math.floor(basePoints * speedRatio * 0.3); // Up to 30% bonus
        }

        return 0;
    }

    /**
     * Get base points for difficulty level
     * @param {string} difficulty - Question difficulty
     * @returns {number} Base points
     */
    getBasePoints(difficulty) {
        return this.pointsConfig[difficulty] || this.pointsConfig.medium;
    }

    /**
     * Calculate total quiz score
     * @param {Array} answers - Array of answer results
     * @param {Object} quizInfo - Quiz information
     * @returns {Object} Total score calculation
     */
    calculateTotalScore(answers, quizInfo = {}) {
        let totalPoints = 0;
        let correctAnswers = 0;
        let totalBonuses = 0;
        let totalPenalties = 0;
        let maxPossiblePoints = 0;

        // Calculate individual answer scores
        answers.forEach((answer, index) => {
            totalPoints += answer.points || 0;
            maxPossiblePoints += answer.basePoints || this.getBasePoints(answer.difficulty || 'medium');
            
            if (answer.isCorrect) {
                correctAnswers++;
            }

            if (answer.bonuses) {
                totalBonuses += answer.bonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
            }

            if (answer.penalties) {
                totalPenalties += answer.penalties.reduce((sum, penalty) => sum + penalty.amount, 0);
            }
        });

        // Calculate completion bonuses
        const completionBonuses = this.calculateCompletionBonuses(
            answers, 
            correctAnswers, 
            quizInfo
        );

        totalPoints += completionBonuses.reduce((sum, bonus) => sum + bonus.amount, 0);

        // Calculate accuracy
        const accuracy = answers.length > 0 ? (correctAnswers / answers.length) * 100 : 0;

        // Calculate performance grade
        const grade = this.calculateGrade(accuracy, totalPoints, maxPossiblePoints);

        return {
            totalPoints: Math.max(0, totalPoints), // Ensure non-negative
            correctAnswers,
            totalQuestions: answers.length,
            accuracy: Math.round(accuracy * 10) / 10,
            maxPossiblePoints,
            totalBonuses,
            totalPenalties,
            completionBonuses,
            grade,
            breakdown: {
                baseScore: totalPoints - totalBonuses + totalPenalties,
                bonuses: totalBonuses,
                penalties: totalPenalties,
                completionBonuses: completionBonuses.reduce((sum, bonus) => sum + bonus.amount, 0)
            }
        };
    }

    /**
     * Calculate completion bonuses
     * @param {Array} answers - Array of answers
     * @param {number} correctAnswers - Number of correct answers
     * @param {Object} quizInfo - Quiz information
     * @returns {Array} Array of completion bonuses
     */
    calculateCompletionBonuses(answers, correctAnswers, quizInfo) {
        const bonuses = [];
        const accuracy = (correctAnswers / answers.length) * 100;

        // Perfect score bonus
        if (accuracy === 100) {
            bonuses.push({
                type: 'perfect_score',
                amount: Math.floor(answers.length * 10),
                description: 'Perfect Score! 🏆'
            });
        }

        // High accuracy bonus
        else if (accuracy >= 90) {
            bonuses.push({
                type: 'high_accuracy',
                amount: Math.floor(answers.length * 5),
                description: 'Excellent Performance! ⭐'
            });
        }

        // Quiz completion bonus
        if (answers.length >= 10) {
            bonuses.push({
                type: 'completion',
                amount: Math.floor(answers.length * 2),
                description: 'Quiz Completion Bonus'
            });
        }

        // Fast completion bonus
        if (quizInfo.timeSpent && quizInfo.timeLimit) {
            const timeRatio = quizInfo.timeSpent / quizInfo.timeLimit;
            if (timeRatio < 0.5 && accuracy >= 70) {
                bonuses.push({
                    type: 'speed_completion',
                    amount: Math.floor(answers.length * 3),
                    description: 'Lightning Fast! ⚡'
                });
            }
        }

        // Category mastery bonus (if all questions in category are correct)
        if (quizInfo.category && quizInfo.category !== 'all' && accuracy === 100) {
            bonuses.push({
                type: 'category_mastery',
                amount: Math.floor(answers.length * 8),
                description: `${quizInfo.category} Master! 🎓`
            });
        }

        return bonuses;
    }

    /**
     * Calculate performance grade
     * @param {number} accuracy - Accuracy percentage
     * @param {number} totalPoints - Total points earned
     * @param {number} maxPoints - Maximum possible points
     * @returns {Object} Grade information
     */
    calculateGrade(accuracy, totalPoints, maxPoints) {
        let letter, description, color;

        if (accuracy >= 95) {
            letter = 'A+';
            description = 'Outstanding!';
            color = '#10b981';
        } else if (accuracy >= 90) {
            letter = 'A';
            description = 'Excellent!';
            color = '#10b981';
        } else if (accuracy >= 85) {
            letter = 'A-';
            description = 'Very Good!';
            color = '#34d399';
        } else if (accuracy >= 80) {
            letter = 'B+';
            description = 'Good!';
            color = '#60a5fa';
        } else if (accuracy >= 75) {
            letter = 'B';
            description = 'Above Average';
            color = '#60a5fa';
        } else if (accuracy >= 70) {
            letter = 'B-';
            description = 'Satisfactory';
            color = '#93c5fd';
        } else if (accuracy >= 65) {
            letter = 'C+';
            description = 'Fair';
            color = '#fbbf24';
        } else if (accuracy >= 60) {
            letter = 'C';
            description = 'Needs Improvement';
            color = '#fbbf24';
        } else if (accuracy >= 50) {
            letter = 'D';
            description = 'Below Average';
            color = '#f87171';
        } else {
            letter = 'F';
            description = 'Keep Practicing!';
            color = '#ef4444';
        }

        return {
            letter,
            description,
            color,
            percentage: accuracy
        };
    }

    /**
     * Create detailed points breakdown
     * @param {number} basePoints - Base points
     * @param {Array} bonuses - Array of bonuses
     * @param {Array} penalties - Array of penalties
     * @returns {Object} Points breakdown
     */
    createPointsBreakdown(basePoints, bonuses, penalties) {
        return {
            base: basePoints,
            bonuses: bonuses.reduce((sum, bonus) => sum + bonus.amount, 0),
            penalties: penalties.reduce((sum, penalty) => sum + penalty.amount, 0),
            total: basePoints + 
                   bonuses.reduce((sum, bonus) => sum + bonus.amount, 0) - 
                   penalties.reduce((sum, penalty) => sum + penalty.amount, 0)
        };
    }

    /**
     * Calculate streak multiplier
     * @param {number} streakLength - Length of current streak
     * @returns {number} Multiplier value
     */
    calculateStreakMultiplier(streakLength) {
        if (streakLength < 2) return 1.0;
        if (streakLength < 5) return 1.2;
        if (streakLength < 10) return 1.5;
        return 2.0; // Maximum multiplier
    }

    /**
     * Get scoring statistics
     * @param {Array} quizResults - Array of quiz results
     * @returns {Object} Scoring statistics
     */
    getScoringStatistics(quizResults) {
        if (!quizResults || quizResults.length === 0) {
            return {
                averageScore: 0,
                bestScore: 0,
                totalPoints: 0,
                averageAccuracy: 0,
                bestAccuracy: 0,
                totalQuizzes: 0
            };
        }

        const totalPoints = quizResults.reduce((sum, result) => sum + (result.score || 0), 0);
        const averageScore = Math.round(totalPoints / quizResults.length);
        const bestScore = Math.max(...quizResults.map(result => result.score || 0));
        const averageAccuracy = Math.round(
            quizResults.reduce((sum, result) => sum + (result.accuracy || 0), 0) / quizResults.length * 10
        ) / 10;
        const bestAccuracy = Math.max(...quizResults.map(result => result.accuracy || 0));

        return {
            averageScore,
            bestScore,
            totalPoints,
            averageAccuracy,
            bestAccuracy,
            totalQuizzes: quizResults.length
        };
    }

    /**
     * Format points for display
     * @param {number} points - Points to format
     * @param {boolean} showSign - Whether to show + sign for positive points
     * @returns {string} Formatted points string
     */
    formatPoints(points, showSign = false) {
        const sign = showSign && points > 0 ? '+' : '';
        return `${sign}${Utils.formatNumber(points)}`;
    }

    /**
     * Get achievement progress
     * @param {Object} userStats - User statistics
     * @returns {Array} Array of achievement progress
     */
    getAchievementProgress(userStats) {
        const achievements = [
            {
                name: 'First Steps',
                description: 'Complete your first quiz',
                target: 1,
                current: userStats.quizzesCompleted || 0,
                type: 'quizzes'
            },
            {
                name: 'Quiz Enthusiast',
                description: 'Complete 25 quizzes',
                target: 25,
                current: userStats.quizzesCompleted || 0,
                type: 'quizzes'
            },
            {
                name: 'Point Collector',
                description: 'Earn 1000 total points',
                target: 1000,
                current: userStats.totalPoints || 0,
                type: 'points'
            },
            {
                name: 'Perfect Score',
                description: 'Get 100% accuracy in a quiz',
                target: 100,
                current: userStats.bestAccuracy || 0,
                type: 'accuracy'
            }
        ];

        return achievements.map(achievement => ({
            ...achievement,
            progress: Math.min((achievement.current / achievement.target) * 100, 100),
            completed: achievement.current >= achievement.target
        }));
    }
}

// Create global instance
const scoreCalculator = new ScoreCalculator();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScoreCalculator;
}

// Make available globally
window.ScoreCalculator = ScoreCalculator;
window.scoreCalculator = scoreCalculator;