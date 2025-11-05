// Quiz Manager for QuizMaster app
// Handles quiz functionality, questions, scoring, and results

/**
 * Quiz Manager class
 * Manages quiz state, questions, scoring, and user interactions
 */
class QuizManager {
    constructor() {
        this.currentQuiz = null;
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.score = 0;
        this.timeRemaining = 0;
        this.timer = null;
        this.isQuizActive = false;
        
        console.log('🧩 Quiz Manager initialized');
    }

    /**
     * Start a new quiz
     * @param {string} category - Quiz category
     * @param {string} difficulty - Quiz difficulty
     * @param {number} questionCount - Number of questions
     * @returns {Promise<Object>} Quiz start result
     */
    async startQuiz(category = 'General Knowledge', difficulty = 'medium', questionCount = 10) {
        try {
            console.log(`🎯 Starting quiz: ${category} (${difficulty}) - ${questionCount} questions`);
            
            // Reset quiz state
            this.resetQuizState();
            
            // Load questions
            this.questions = await this.loadQuestions(questionCount, category, difficulty);
            
            // Initialize quiz
            this.currentQuiz = {
                id: Utils.generateUUID(),
                category,
                difficulty,
                questionCount,
                startTime: new Date(),
                timeLimit: questionCount * 30 // 30 seconds per question
            };

            // Create quiz session in database
            this.currentQuiz.sessionId = await this.createQuizSession();
            
            this.isQuizActive = true;
            this.timeRemaining = this.currentQuiz.timeLimit;
            
            // Start timer
            this.startTimer();
            
            // Show first question
            this.showCurrentQuestion();
            
            return {
                success: true,
                quiz: this.currentQuiz,
                message: 'Quiz started successfully!'
            };
            
        } catch (error) {
            console.error('❌ Failed to start quiz:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to start quiz'
            };
        }
    }

    /**
     * Load questions from database or generate placeholder questions
     * @param {number} count - Number of questions
     * @param {string} category - Question category
     * @param {string} difficulty - Question difficulty
     * @returns {Promise<Array>} Array of question objects
     */
    async loadQuestions(count, category, difficulty) {
        try {
            // Try to load from Supabase first
            if (authManager.supabase && authManager.isInitialized) {
                return await this.loadQuestionsFromDatabase(count, category, difficulty);
            } else {
                // Fallback to placeholder questions
                return this.generatePlaceholderQuestions(count, category, difficulty);
            }
        } catch (error) {
            console.warn('Failed to load questions from database, using placeholder questions:', error);
            return this.generatePlaceholderQuestions(count, category, difficulty);
        }
    }

    /**
     * Load questions from Supabase database
     * @param {number} count - Number of questions
     * @param {string} category - Question category
     * @param {string} difficulty - Question difficulty
     * @returns {Promise<Array>} Array of question objects
     */
    async loadQuestionsFromDatabase(count, category, difficulty) {
        try {
            // Check cache first
            const cacheKey = `questions_${category}_${difficulty}_${count}`;
            if (window.performanceManager) {
                const cached = window.performanceManager.getCache(cacheKey);
                if (cached) {
                    console.log('📦 Using cached questions');
                    return cached;
                }
            }

            let query = authManager.supabase
                .from('questions')
                .select('*')
                .eq('is_active', true);

            // Apply filters
            if (category && category !== 'all') {
                query = query.eq('category', category);
            }
            
            if (difficulty && difficulty !== 'all') {
                query = query.eq('difficulty', difficulty);
            }

            // Get random questions by ordering randomly and limiting
            const { data, error } = await query
                .order('created_at', { ascending: false })
                .limit(count * 3); // Get more than needed for better randomization

            if (error) {
                throw error;
            }

            if (!data || data.length === 0) {
                throw new Error('No questions found matching criteria');
            }

            // Randomize and limit to requested count
            const shuffled = Utils.shuffleArray(data);
            const selectedQuestions = shuffled.slice(0, Math.min(count, shuffled.length));

            // Transform database format to internal format
            const transformedQuestions = selectedQuestions.map(q => ({
                id: q.id,
                question: q.question_text,
                type: q.question_type,
                options: q.options || [],
                correctAnswer: q.correct_answer,
                explanation: q.explanation,
                category: q.category,
                difficulty: q.difficulty,
                points: q.points_value || this.getPointsForDifficulty(q.difficulty)
            }));

            // Cache the results
            if (window.performanceManager) {
                window.performanceManager.setCache(cacheKey, transformedQuestions, 600000); // 10 minutes
            }

            return transformedQuestions;

        } catch (error) {
            console.error('Error loading questions from database:', error);
            
            if (window.errorHandler) {
                window.errorHandler.handleDatabaseError(error, 'load_questions');
            }
            
            throw error;
        }
    }

    /**
     * Get points value based on difficulty
     * @param {string} difficulty - Question difficulty
     * @returns {number} Points value
     */
    getPointsForDifficulty(difficulty) {
        const pointsMap = {
            easy: APP_CONFIG.quiz.pointsSystem.easy,
            medium: APP_CONFIG.quiz.pointsSystem.medium,
            hard: APP_CONFIG.quiz.pointsSystem.hard
        };
        return pointsMap[difficulty] || 10;
    }

    /**
     * Generate placeholder questions for development
     * @param {number} count - Number of questions
     * @param {string} category - Question category
     * @param {string} difficulty - Question difficulty
     * @returns {Array} Array of question objects
     */
    generatePlaceholderQuestions(count, category, difficulty) {
        const placeholderQuestions = [
            {
                id: '1',
                question: 'What is the capital of France?',
                type: 'multiple_choice',
                options: ['London', 'Berlin', 'Paris', 'Madrid'],
                correctAnswer: 'Paris',
                explanation: 'Paris is the capital and most populous city of France.',
                category: 'Geography',
                difficulty: 'easy',
                points: 10
            },
            {
                id: '2',
                question: 'Which planet is known as the Red Planet?',
                type: 'multiple_choice',
                options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
                correctAnswer: 'Mars',
                explanation: 'Mars is called the Red Planet due to its reddish appearance.',
                category: 'Science',
                difficulty: 'easy',
                points: 10
            },
            {
                id: '3',
                question: 'Who painted the Mona Lisa?',
                type: 'multiple_choice',
                options: ['Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci', 'Michelangelo'],
                correctAnswer: 'Leonardo da Vinci',
                explanation: 'The Mona Lisa was painted by Leonardo da Vinci between 1503 and 1519.',
                category: 'Art',
                difficulty: 'medium',
                points: 20
            },
            {
                id: '4',
                question: 'What is the largest ocean on Earth?',
                type: 'multiple_choice',
                options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
                correctAnswer: 'Pacific Ocean',
                explanation: 'The Pacific Ocean is the largest and deepest ocean on Earth.',
                category: 'Geography',
                difficulty: 'easy',
                points: 10
            },
            {
                id: '5',
                question: 'In which year did World War II end?',
                type: 'multiple_choice',
                options: ['1944', '1945', '1946', '1947'],
                correctAnswer: '1945',
                explanation: 'World War II ended in 1945 with the surrender of Japan.',
                category: 'History',
                difficulty: 'medium',
                points: 20
            },
            {
                id: '6',
                question: 'The Great Wall of China is visible from space.',
                type: 'true_false',
                options: ['True', 'False'],
                correctAnswer: 'False',
                explanation: 'This is a common myth. The Great Wall is not visible from space with the naked eye.',
                category: 'General Knowledge',
                difficulty: 'medium',
                points: 20
            },
            {
                id: '7',
                question: 'What gas do plants absorb from the atmosphere?',
                type: 'multiple_choice',
                options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'],
                correctAnswer: 'Carbon Dioxide',
                explanation: 'Plants absorb carbon dioxide from the atmosphere during photosynthesis.',
                category: 'Science',
                difficulty: 'easy',
                points: 10
            },
            {
                id: '8',
                question: 'How many players are on a basketball team on the court at one time?',
                type: 'multiple_choice',
                options: ['4', '5', '6', '7'],
                correctAnswer: '5',
                explanation: 'Each basketball team has 5 players on the court at one time.',
                category: 'Sports',
                difficulty: 'easy',
                points: 10
            },
            {
                id: '9',
                question: 'Which movie features the song "Let It Go"?',
                type: 'multiple_choice',
                options: ['Moana', 'Frozen', 'Tangled', 'The Little Mermaid'],
                correctAnswer: 'Frozen',
                explanation: '"Let It Go" is the famous song from Disney\'s Frozen, sung by Elsa.',
                category: 'Entertainment',
                difficulty: 'easy',
                points: 10
            },
            {
                id: '10',
                question: 'What does "WWW" stand for?',
                type: 'multiple_choice',
                options: ['World Wide Web', 'World Web Wide', 'Wide World Web', 'Web World Wide'],
                correctAnswer: 'World Wide Web',
                explanation: 'WWW stands for World Wide Web, the information system on the Internet.',
                category: 'Technology',
                difficulty: 'easy',
                points: 10
            }
        ];

        // Filter by category if specified
        let filteredQuestions = placeholderQuestions;
        if (category && category !== 'all') {
            filteredQuestions = placeholderQuestions.filter(q => 
                q.category.toLowerCase() === category.toLowerCase()
            );
        }

        // Filter by difficulty if specified
        if (difficulty && difficulty !== 'all') {
            filteredQuestions = filteredQuestions.filter(q => 
                q.difficulty.toLowerCase() === difficulty.toLowerCase()
            );
        }

        // If no questions match filters, return all questions
        if (filteredQuestions.length === 0) {
            filteredQuestions = placeholderQuestions;
        }

        // Shuffle and return requested number of questions
        const shuffled = Utils.shuffleArray(filteredQuestions);
        return shuffled.slice(0, Math.min(count, shuffled.length));
    }

    /**
     * Reset quiz state
     */
    resetQuizState() {
        this.currentQuiz = null;
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.score = 0;
        this.timeRemaining = 0;
        this.isQuizActive = false;
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    /**
     * Start quiz timer
     */
    startTimer() {
        this.timer = setInterval(() => {
            this.timeRemaining--;
            
            // Update timer display
            this.updateTimerDisplay();
            
            // Check if time is up
            if (this.timeRemaining <= 0) {
                this.endQuiz();
            }
        }, 1000);
    }

    /**
     * Update timer display
     */
    updateTimerDisplay() {
        const timerElement = document.querySelector('.quiz-timer');
        if (timerElement) {
            const minutes = Math.floor(this.timeRemaining / 60);
            const seconds = this.timeRemaining % 60;
            timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            // Add warning classes
            if (this.timeRemaining <= 60) {
                timerElement.classList.add('danger');
            } else if (this.timeRemaining <= 120) {
                timerElement.classList.add('warning');
            }
        }
    }

    /**
     * Show current question
     */
    showCurrentQuestion() {
        if (!this.isQuizActive || this.currentQuestionIndex >= this.questions.length) {
            return;
        }

        const question = this.questions[this.currentQuestionIndex];
        console.log(`📝 Showing question ${this.currentQuestionIndex + 1}:`, question.question);
        
        // This would update the UI with the current question
        // For now, we'll just log it
        this.renderQuestion(question);
    }

    /**
     * Render question in UI
     * @param {Object} question - Question object
     */
    renderQuestion(question) {
        console.log('🎨 Rendering question:', {
            number: this.currentQuestionIndex + 1,
            total: this.questions.length,
            question: question.question,
            options: question.options
        });
        
        // Update quiz progress
        this.updateQuizProgress();
        
        // Update question display
        this.updateQuestionDisplay(question);
        
        // Show quiz page if not already visible
        if (window.uiManager) {
            window.uiManager.showPage('quiz');
        }
    }

    /**
     * Update quiz progress indicators
     */
    updateQuizProgress() {
        const progressText = document.querySelector('.quiz-progress-text');
        const progressBar = document.querySelector('.progress-fill');
        
        if (progressText) {
            progressText.textContent = `Question ${this.currentQuestionIndex + 1} of ${this.questions.length}`;
        }
        
        if (progressBar) {
            const progress = ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
            progressBar.style.width = `${progress}%`;
        }
    }

    /**
     * Update question display in the UI
     * @param {Object} question - Question object
     */
    updateQuestionDisplay(question) {
        // Update question number
        const questionNumber = document.querySelector('.question-number');
        if (questionNumber) {
            questionNumber.textContent = `Question ${this.currentQuestionIndex + 1}`;
        }

        // Update question text
        const questionText = document.querySelector('.question-text');
        if (questionText) {
            questionText.textContent = question.question;
        }

        // Update options
        this.renderQuestionOptions(question);
    }

    /**
     * Render question options
     * @param {Object} question - Question object
     */
    renderQuestionOptions(question) {
        const optionsContainer = document.querySelector('.question-options');
        if (!optionsContainer) return;

        // Clear existing options
        optionsContainer.innerHTML = '';

        // Create option buttons
        question.options.forEach((option, index) => {
            const optionButton = document.createElement('button');
            optionButton.className = 'option-button';
            optionButton.setAttribute('data-answer', option);
            optionButton.innerHTML = `
                <span class="option-text">${Utils.escapeHTML(option)}</span>
            `;

            // Add click handler
            optionButton.addEventListener('click', () => {
                this.selectAnswer(option, optionButton);
            });

            optionsContainer.appendChild(optionButton);
        });
    }

    /**
     * Handle answer selection
     * @param {string} answer - Selected answer
     * @param {HTMLElement} buttonElement - Button element that was clicked
     */
    selectAnswer(answer, buttonElement) {
        if (!this.isQuizActive) return;

        // Remove previous selections
        const allOptions = document.querySelectorAll('.option-button');
        allOptions.forEach(btn => {
            btn.classList.remove('selected');
            btn.disabled = false;
        });

        // Mark selected option with animation
        buttonElement.classList.add('selected');
        buttonElement.classList.add('micro-bounce');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            buttonElement.classList.remove('micro-bounce');
        }, 300);

        // Add visual feedback
        this.addSelectionFeedback(buttonElement);

        // Enable submit button or auto-submit after delay
        setTimeout(() => {
            this.submitAnswer(answer);
        }, 800);
    }

    /**
     * Add visual feedback for answer selection
     * @param {HTMLElement} buttonElement - Selected button element
     */
    addSelectionFeedback(buttonElement) {
        // Add ripple effect
        const ripple = document.createElement('span');
        ripple.className = 'selection-ripple';
        buttonElement.appendChild(ripple);

        // Remove ripple after animation
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);

        // Add glow effect
        buttonElement.classList.add('animate-glow');
        setTimeout(() => {
            buttonElement.classList.remove('animate-glow');
        }, 1000);
    }

    /**
     * Create quiz session in database
     * @returns {Promise<string>} Session ID
     */
    async createQuizSession() {
        try {
            if (!authManager.supabase || !authManager.isInitialized) {
                return Utils.generateUUID(); // Return mock ID for development
            }

            const user = authManager.getCurrentUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            const { data, error } = await authManager.supabase
                .from('quiz_sessions')
                .insert({
                    user_id: user.id,
                    category: this.currentQuiz.category,
                    difficulty: this.currentQuiz.difficulty,
                    total_questions: this.currentQuiz.questionCount,
                    time_limit: this.currentQuiz.timeLimit,
                    status: 'active'
                })
                .select()
                .single();

            if (error) {
                throw error;
            }

            return data.id;

        } catch (error) {
            console.error('Failed to create quiz session:', error);
            return Utils.generateUUID(); // Fallback to mock ID
        }
    }

    /**
     * Save answer to database
     * @param {Object} answerRecord - Answer record
     */
    async saveAnswerToDatabase(answerRecord) {
        try {
            if (!authManager.supabase || !authManager.isInitialized) {
                return; // Skip database save in development mode
            }

            const { error } = await authManager.supabase
                .from('quiz_answers')
                .insert({
                    quiz_session_id: this.currentQuiz.sessionId,
                    question_id: answerRecord.questionId,
                    user_answer: answerRecord.selectedAnswer,
                    is_correct: answerRecord.isCorrect,
                    points_earned: answerRecord.points,
                    time_taken: answerRecord.timeSpent
                });

            if (error) {
                console.error('Failed to save answer:', error);
            }

        } catch (error) {
            console.error('Error saving answer to database:', error);
        }
    }

    /**
     * Update quiz session in database
     * @param {Object} updates - Updates to apply
     */
    async updateQuizSession(updates) {
        try {
            if (!authManager.supabase || !authManager.isInitialized || !this.currentQuiz.sessionId) {
                return;
            }

            const { error } = await authManager.supabase
                .from('quiz_sessions')
                .update(updates)
                .eq('id', this.currentQuiz.sessionId);

            if (error) {
                console.error('Failed to update quiz session:', error);
            }

        } catch (error) {
            console.error('Error updating quiz session:', error);
        }
    }

    /**
     * Get available categories
     * @returns {Promise<Array>} Array of categories
     */
    async getCategories() {
        try {
            if (!authManager.supabase || !authManager.isInitialized) {
                return APP_CONFIG.quiz.categories;
            }

            const { data, error } = await authManager.supabase
                .from('categories')
                .select('*')
                .eq('is_active', true)
                .order('name');

            if (error) {
                throw error;
            }

            return data.map(cat => cat.name);

        } catch (error) {
            console.error('Failed to load categories:', error);
            return APP_CONFIG.quiz.categories;
        }
    }

    /**
     * Get question statistics
     * @returns {Promise<Object>} Question statistics
     */
    async getQuestionStatistics() {
        try {
            if (!authManager.supabase || !authManager.isInitialized) {
                return {
                    totalQuestions: 500,
                    categoryCounts: {},
                    difficultyCounts: {}
                };
            }

            const { data, error } = await authManager.supabase
                .from('questions')
                .select('category, difficulty')
                .eq('is_active', true);

            if (error) {
                throw error;
            }

            const categoryCounts = {};
            const difficultyCounts = {};

            data.forEach(question => {
                categoryCounts[question.category] = (categoryCounts[question.category] || 0) + 1;
                difficultyCounts[question.difficulty] = (difficultyCounts[question.difficulty] || 0) + 1;
            });

            return {
                totalQuestions: data.length,
                categoryCounts,
                difficultyCounts
            };

        } catch (error) {
            console.error('Failed to get question statistics:', error);
            return {
                totalQuestions: 0,
                categoryCounts: {},
                difficultyCounts: {}
            };
        }
    }

    /**
     * Submit answer for current question
     * @param {string} answer - Selected answer
     * @returns {Object} Answer result
     */
    async submitAnswer(answer) {
        if (!this.isQuizActive || this.currentQuestionIndex >= this.questions.length) {
            return { success: false, message: 'No active question' };
        }

        const question = this.questions[this.currentQuestionIndex];
        const isCorrect = answer === question.correctAnswer;
        
        // Calculate points using scoring system
        const consecutiveCorrect = this.getConsecutiveCorrectCount();
        const timeSpentOnQuestion = (this.currentQuiz.timeLimit - this.timeRemaining) - 
            (this.userAnswers.length > 0 ? this.userAnswers[this.userAnswers.length - 1].timeSpent : 0);
        
        const scoringResult = window.scoreCalculator ? 
            window.scoreCalculator.calculateAnswerPoints(
                question, 
                isCorrect, 
                timeSpentOnQuestion, 
                consecutiveCorrect
            ) : {
                finalPoints: isCorrect ? (question.points || 10) : -Math.floor((question.points || 10) * 0.1),
                bonuses: [],
                penalties: [],
                breakdown: {}
            };

        const points = scoringResult.finalPoints;

        // Store answer
        const answerRecord = {
            questionId: question.id,
            question: question.question,
            selectedAnswer: answer,
            correctAnswer: question.correctAnswer,
            isCorrect,
            points,
            basePoints: scoringResult.basePoints || question.points || 10,
            bonuses: scoringResult.bonuses || [],
            penalties: scoringResult.penalties || [],
            breakdown: scoringResult.breakdown || {},
            timeSpent: this.currentQuiz.timeLimit - this.timeRemaining,
            timeSpentOnQuestion: timeSpentOnQuestion,
            difficulty: question.difficulty,
            category: question.category,
            explanation: question.explanation,
            timestamp: new Date()
        };

        this.userAnswers.push(answerRecord);
        this.score += points;

        // Save answer to database
        await this.saveAnswerToDatabase(answerRecord);

        // Update quiz session
        await this.updateQuizSession({
            questions_answered: this.userAnswers.length,
            correct_answers: this.userAnswers.filter(a => a.isCorrect).length,
            total_points: this.score
        });

        console.log(`✅ Answer submitted:`, {
            correct: isCorrect,
            points,
            totalScore: this.score
        });

        // Show answer feedback
        this.showAnswerFeedback(answerRecord);

        // Move to next question or end quiz after delay
        setTimeout(() => {
            this.currentQuestionIndex++;
            
            if (this.currentQuestionIndex >= this.questions.length) {
                this.endQuiz();
            } else {
                this.showCurrentQuestion();
            }
        }, 2000);

        return {
            success: true,
            isCorrect,
            points,
            totalScore: this.score,
            explanation: question.explanation
        };
    }

    /**
     * Get consecutive correct answer count
     * @returns {number} Number of consecutive correct answers
     */
    getConsecutiveCorrectCount() {
        let count = 0;
        for (let i = this.userAnswers.length - 1; i >= 0; i--) {
            if (this.userAnswers[i].isCorrect) {
                count++;
            } else {
                break;
            }
        }
        return count;
    }

    /**
     * End the current quiz
     * @returns {Object} Quiz results
     */
    endQuiz() {
        if (!this.isQuizActive) {
            return null;
        }

        console.log('🏁 Ending quiz...');

        // Stop timer
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        this.isQuizActive = false;

        // Calculate final results
        const results = this.calculateResults();
        
        // Save results (placeholder)
        this.saveQuizResults(results);
        
        // Show results
        this.showResults(results);

        return results;
    }

    /**
     * Show answer feedback
     * @param {Object} answerRecord - Answer record
     */
    showAnswerFeedback(answerRecord) {
        const allOptions = document.querySelectorAll('.option-button');
        
        allOptions.forEach(button => {
            const buttonAnswer = button.getAttribute('data-answer');
            button.disabled = true;
            
            if (buttonAnswer === answerRecord.correctAnswer) {
                button.classList.add('correct');
                button.classList.add('animate-correctAnswer');
                
                // Add success icon
                const icon = document.createElement('span');
                icon.className = 'answer-icon correct-icon';
                icon.textContent = '✓';
                button.appendChild(icon);
                
            } else if (buttonAnswer === answerRecord.selectedAnswer && !answerRecord.isCorrect) {
                button.classList.add('incorrect');
                button.classList.add('animate-incorrectAnswer');
                
                // Add error icon
                const icon = document.createElement('span');
                icon.className = 'answer-icon incorrect-icon';
                icon.textContent = '✗';
                button.appendChild(icon);
            }
        });

        // Show explanation if available
        if (answerRecord.explanation) {
            this.showExplanation(answerRecord.explanation, answerRecord.isCorrect);
        }

        // Show points earned
        this.showPointsFeedback(answerRecord);
    }

    /**
     * Show explanation for the answer
     * @param {string} explanation - Answer explanation
     * @param {boolean} isCorrect - Whether answer was correct
     */
    showExplanation(explanation, isCorrect) {
        // Remove existing explanation
        const existingExplanation = document.querySelector('.answer-explanation');
        if (existingExplanation) {
            existingExplanation.remove();
        }

        // Create explanation element
        const explanationDiv = document.createElement('div');
        explanationDiv.className = `answer-explanation ${isCorrect ? 'correct' : 'incorrect'}`;
        explanationDiv.innerHTML = `
            <div class="explanation-header">
                <span class="explanation-icon">${isCorrect ? '✓' : '✗'}</span>
                <span class="explanation-status">${isCorrect ? 'Correct!' : 'Incorrect'}</span>
            </div>
            <div class="explanation-text">${Utils.escapeHTML(explanation)}</div>
        `;

        // Insert after question options
        const optionsContainer = document.querySelector('.question-options');
        if (optionsContainer) {
            optionsContainer.parentNode.insertBefore(explanationDiv, optionsContainer.nextSibling);
        }
    }

    /**
     * Show points feedback
     * @param {Object} answerRecord - Complete answer record with scoring details
     */
    showPointsFeedback(answerRecord) {
        const pointsText = answerRecord.points > 0 ? `+${answerRecord.points}` : `${answerRecord.points}`;
        const color = answerRecord.points > 0 ? 'success' : 'error';
        
        // Create detailed feedback message
        let message = `${pointsText} points`;
        
        // Add bonus information
        if (answerRecord.bonuses && answerRecord.bonuses.length > 0) {
            const bonusText = answerRecord.bonuses.map(bonus => bonus.description).join(', ');
            message += ` (${bonusText})`;
        }
        
        // Show animated score popup
        this.showScorePopup(pointsText, answerRecord.isCorrect);
        
        // Update current score display
        this.updateScoreDisplay();
        
        if (window.uiManager) {
            window.uiManager.showNotification(
                color,
                answerRecord.isCorrect ? 'Correct!' : 'Incorrect',
                message,
                2000
            );
        }
    }

    /**
     * Show animated score popup
     * @param {string} pointsText - Points text to display
     * @param {boolean} isCorrect - Whether answer was correct
     */
    showScorePopup(pointsText, isCorrect) {
        const popup = document.createElement('div');
        popup.className = `score-popup ${isCorrect ? 'correct' : 'incorrect'}`;
        popup.textContent = pointsText;
        
        if (!isCorrect) {
            popup.style.background = 'var(--color-error)';
        }
        
        document.body.appendChild(popup);
        
        // Remove popup after animation
        setTimeout(() => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        }, 1500);
    }

    /**
     * Update score display in real-time
     */
    updateScoreDisplay() {
        const scoreElement = document.getElementById('current-score');
        if (scoreElement) {
            scoreElement.textContent = this.score;
            
            // Add animation effect
            scoreElement.style.transform = 'scale(1.2)';
            scoreElement.style.color = 'var(--color-primary)';
            
            setTimeout(() => {
                scoreElement.style.transform = 'scale(1)';
                scoreElement.style.color = '';
            }, 300);
        }
    }

    /**
     * Calculate quiz results
     * @returns {Object} Quiz results
     */
    calculateResults() {
        const correctAnswers = this.userAnswers.filter(answer => answer.isCorrect).length;
        const totalQuestions = this.questions.length;
        const timeSpent = this.currentQuiz.timeLimit - this.timeRemaining;

        // Use scoring system for comprehensive results
        const scoringResults = window.scoreCalculator ? 
            window.scoreCalculator.calculateTotalScore(this.userAnswers, {
                category: this.currentQuiz.category,
                difficulty: this.currentQuiz.difficulty,
                timeSpent: timeSpent,
                timeLimit: this.currentQuiz.timeLimit
            }) : {
                totalPoints: this.score,
                accuracy: totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0,
                grade: { letter: 'N/A', description: 'Not calculated' },
                breakdown: {},
                completionBonuses: []
            };

        return {
            quizId: this.currentQuiz.id,
            sessionId: this.currentQuiz.sessionId,
            category: this.currentQuiz.category,
            difficulty: this.currentQuiz.difficulty,
            totalQuestions,
            correctAnswers,
            incorrectAnswers: totalQuestions - correctAnswers,
            accuracy: scoringResults.accuracy,
            score: scoringResults.totalPoints,
            maxPossiblePoints: scoringResults.maxPossiblePoints,
            grade: scoringResults.grade,
            breakdown: scoringResults.breakdown,
            completionBonuses: scoringResults.completionBonuses,
            timeSpent,
            timeLimit: this.currentQuiz.timeLimit,
            answers: this.userAnswers,
            startTime: this.currentQuiz.startTime,
            completedAt: new Date()
        };
    }

    /**
     * Save quiz results to database and local storage
     * @param {Object} results - Quiz results
     */
    async saveQuizResults(results) {
        try {
            console.log('💾 Saving quiz results:', results);
            
            // Save to Supabase if available
            if (authManager.supabase && authManager.isInitialized) {
                await this.saveResultsToDatabase(results);
            }
            
            // Always save to localStorage as backup
            const savedResults = Utils.storage.get('quiz_results', []);
            savedResults.push(results);
            Utils.storage.set('quiz_results', savedResults);
            
            // Update user statistics
            await this.updateUserStatistics(results);
            
            // Check for new achievements
            await this.checkAchievements(results);
            
            console.log('✅ Quiz results saved successfully');
            
        } catch (error) {
            console.error('❌ Failed to save quiz results:', error);
        }
    }

    /**
     * Save results to Supabase database
     * @param {Object} results - Quiz results
     */
    async saveResultsToDatabase(results) {
        try {
            const user = authManager.getCurrentUser();
            if (!user) return;

            // Update quiz session status
            await this.updateQuizSession({
                status: 'completed',
                questions_answered: results.totalQuestions,
                correct_answers: results.correctAnswers,
                total_points: results.score,
                time_spent: results.timeSpent,
                completed_at: results.completedAt.toISOString()
            });

            // Insert quiz result record
            const { error } = await authManager.supabase
                .from('quiz_results')
                .insert({
                    user_id: user.id,
                    quiz_session_id: results.sessionId,
                    category: results.category,
                    difficulty: results.difficulty,
                    questions_answered: results.totalQuestions,
                    correct_answers: results.correctAnswers,
                    total_points: results.score,
                    accuracy: results.accuracy,
                    time_spent: results.timeSpent,
                    completed_at: results.completedAt.toISOString()
                });

            if (error) {
                console.error('Database save error:', error);
            }

        } catch (error) {
            console.error('Failed to save to database:', error);
        }
    }

    /**
     * Update user statistics after quiz completion
     * @param {Object} results - Quiz results
     */
    async updateUserStatistics(results) {
        try {
            if (!authManager.supabase || !authManager.isInitialized) return;

            const user = authManager.getCurrentUser();
            if (!user) return;

            // Get current user stats
            const { data: profile } = await authManager.supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profile) {
                const newTotalPoints = (profile.total_points || 0) + results.score;
                const newQuizzesCompleted = (profile.quizzes_completed || 0) + 1;
                const newAverageScore = newTotalPoints / newQuizzesCompleted;
                const newBestScore = Math.max(profile.best_score || 0, results.score);

                // Update profile
                await authManager.supabase
                    .from('profiles')
                    .update({
                        total_points: newTotalPoints,
                        quizzes_completed: newQuizzesCompleted,
                        average_score: Math.round(newAverageScore * 100) / 100,
                        best_score: newBestScore,
                        last_quiz_date: results.completedAt.toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', user.id);

                // Update leaderboard manager if available
                if (window.leaderboardManager) {
                    await window.leaderboardManager.updateUserScore(user.id, results.score);
                }
            }

        } catch (error) {
            console.error('Failed to update user statistics:', error);
        }
    }

    /**
     * Check for new achievements
     * @param {Object} results - Quiz results
     */
    async checkAchievements(results) {
        try {
            if (!authManager.supabase || !authManager.isInitialized) return;

            const user = authManager.getCurrentUser();
            if (!user) return;

            // Call the achievement checking function
            await authManager.supabase.rpc('check_achievements', {
                user_uuid: user.id
            });

            console.log('✅ Achievements checked');

        } catch (error) {
            console.error('Failed to check achievements:', error);
        }
    }

    /**
     * Show quiz results
     * @param {Object} results - Quiz results
     */
    showResults(results) {
        console.log('🎉 Quiz completed!', results);
        
        // Show results screen using UI manager
        if (window.uiManager) {
            window.uiManager.showQuizResults(results);
            
            // Also show a notification
            window.uiManager.showNotification(
                'success',
                'Quiz Completed!',
                `You scored ${results.score} points with ${results.accuracy}% accuracy!`,
                5000
            );
        }
    }

    /**
     * Get quiz statistics
     * @returns {Object} Quiz statistics
     */
    getStatistics() {
        const savedResults = Utils.storage.get('quiz_results', []);
        
        if (savedResults.length === 0) {
            return {
                totalQuizzes: 0,
                totalScore: 0,
                averageScore: 0,
                averageAccuracy: 0,
                bestScore: 0,
                favoriteCategory: 'None'
            };
        }

        const totalQuizzes = savedResults.length;
        const totalScore = savedResults.reduce((sum, result) => sum + result.score, 0);
        const averageScore = Math.round(totalScore / totalQuizzes);
        const averageAccuracy = Math.round(
            savedResults.reduce((sum, result) => sum + result.accuracy, 0) / totalQuizzes * 10
        ) / 10;
        const bestScore = Math.max(...savedResults.map(result => result.score));
        
        // Find favorite category
        const categoryCount = {};
        savedResults.forEach(result => {
            categoryCount[result.category] = (categoryCount[result.category] || 0) + 1;
        });
        const favoriteCategory = Object.keys(categoryCount).reduce((a, b) => 
            categoryCount[a] > categoryCount[b] ? a : b, 'None'
        );

        return {
            totalQuizzes,
            totalScore,
            averageScore,
            averageAccuracy,
            bestScore,
            favoriteCategory
        };
    }

    /**
     * Get current quiz state
     * @returns {Object} Current quiz state
     */
    getCurrentState() {
        return {
            isActive: this.isQuizActive,
            currentQuestion: this.currentQuestionIndex + 1,
            totalQuestions: this.questions.length,
            score: this.score,
            timeRemaining: this.timeRemaining,
            quiz: this.currentQuiz
        };
    }
}

// Create global instance
const quizManager = new QuizManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuizManager;
}

// Make available globally
window.QuizManager = QuizManager;
window.quizManager = quizManager;