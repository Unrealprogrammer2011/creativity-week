-- QuizMaster Database Schema
-- Run these commands in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table for user data
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    avatar_url TEXT,
    total_points INTEGER DEFAULT 0,
    quizzes_completed INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0,
    best_score INTEGER DEFAULT 0,
    favorite_category VARCHAR(50),
    streak_count INTEGER DEFAULT 0,
    last_quiz_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create questions table with categories and difficulty levels
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'fill_blank')),
    category VARCHAR(50) NOT NULL,
    difficulty VARCHAR(20) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    correct_answer TEXT NOT NULL,
    options JSONB, -- For multiple choice options: ["option1", "option2", "option3", "option4"]
    explanation TEXT,
    points_value INTEGER DEFAULT 10,
    times_answered INTEGER DEFAULT 0,
    times_correct INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create quiz_sessions table for tracking quiz attempts
CREATE TABLE IF NOT EXISTS quiz_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    category VARCHAR(50),
    difficulty VARCHAR(20),
    total_questions INTEGER NOT NULL,
    questions_answered INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    time_limit INTEGER, -- in seconds
    time_spent INTEGER, -- in seconds
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create quiz_answers table for storing individual answers
CREATE TABLE IF NOT EXISTS quiz_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_session_id UUID REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id),
    user_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    points_earned INTEGER DEFAULT 0,
    time_taken INTEGER, -- in seconds
    answered_at TIMESTAMP DEFAULT NOW()
);

-- Create quiz_results table for completed quiz summaries
CREATE TABLE IF NOT EXISTS quiz_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    quiz_session_id UUID REFERENCES quiz_sessions(id),
    category VARCHAR(50),
    difficulty VARCHAR(20),
    questions_answered INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    total_points INTEGER NOT NULL,
    accuracy DECIMAL(5,2) NOT NULL,
    time_spent INTEGER, -- in seconds
    rank_at_completion INTEGER,
    completed_at TIMESTAMP DEFAULT NOW()
);

-- Create achievements table for user accomplishments
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon VARCHAR(50),
    category VARCHAR(50),
    requirement_type VARCHAR(50) NOT NULL, -- 'points', 'quizzes', 'streak', 'accuracy', etc.
    requirement_value INTEGER NOT NULL,
    points_reward INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create user_achievements table for tracking earned achievements
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    achievement_id UUID REFERENCES achievements(id) NOT NULL,
    earned_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Create categories table for quiz categories
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7), -- hex color code
    is_active BOOLEAN DEFAULT true,
    question_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create leaderboard view for rankings
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.total_points,
    p.quizzes_completed,
    p.average_score,
    p.best_score,
    p.favorite_category,
    p.streak_count,
    p.last_quiz_date,
    ROW_NUMBER() OVER (ORDER BY p.total_points DESC, p.quizzes_completed DESC) as rank,
    p.created_at
FROM profiles p
WHERE p.total_points > 0
ORDER BY p.total_points DESC, p.quizzes_completed DESC;

-- Create category leaderboard view
CREATE OR REPLACE VIEW category_leaderboard AS
SELECT 
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    qr.category,
    SUM(qr.total_points) as category_points,
    COUNT(qr.id) as category_quizzes,
    AVG(qr.accuracy) as category_accuracy,
    MAX(qr.total_points) as best_category_score,
    ROW_NUMBER() OVER (PARTITION BY qr.category ORDER BY SUM(qr.total_points) DESC) as category_rank
FROM profiles p
JOIN quiz_results qr ON p.id = qr.user_id
GROUP BY p.id, p.username, p.full_name, p.avatar_url, qr.category
ORDER BY qr.category, SUM(qr.total_points) DESC;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_total_points ON profiles(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_active ON questions(is_active);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id ON quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_status ON quiz_sessions(status);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_category ON quiz_results(category);
CREATE INDEX IF NOT EXISTS idx_quiz_results_completed_at ON quiz_results(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_session_id ON quiz_answers(quiz_session_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for questions
CREATE POLICY "Anyone can view active questions" ON questions FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can view all questions" ON questions FOR SELECT USING (auth.role() = 'authenticated');

-- Create RLS policies for quiz_sessions
CREATE POLICY "Users can view own quiz sessions" ON quiz_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quiz sessions" ON quiz_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own quiz sessions" ON quiz_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for quiz_answers
CREATE POLICY "Users can view own quiz answers" ON quiz_answers 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM quiz_sessions 
        WHERE quiz_sessions.id = quiz_answers.quiz_session_id 
        AND quiz_sessions.user_id = auth.uid()
    )
);
CREATE POLICY "Users can insert own quiz answers" ON quiz_answers 
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM quiz_sessions 
        WHERE quiz_sessions.id = quiz_answers.quiz_session_id 
        AND quiz_sessions.user_id = auth.uid()
    )
);

-- Create RLS policies for quiz_results
CREATE POLICY "Users can view all quiz results" ON quiz_results FOR SELECT USING (true);
CREATE POLICY "Users can insert own quiz results" ON quiz_results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for achievements
CREATE POLICY "Anyone can view achievements" ON achievements FOR SELECT USING (is_active = true);

-- Create RLS policies for user_achievements
CREATE POLICY "Users can view all user achievements" ON user_achievements FOR SELECT USING (true);
CREATE POLICY "Users can insert own achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for categories
CREATE POLICY "Anyone can view active categories" ON categories FOR SELECT USING (is_active = true);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update user statistics
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user profile statistics when a quiz is completed
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE profiles SET
            total_points = total_points + NEW.total_points,
            quizzes_completed = quizzes_completed + 1,
            average_score = (
                SELECT AVG(total_points) 
                FROM quiz_results 
                WHERE user_id = NEW.user_id
            ),
            best_score = GREATEST(
                COALESCE(best_score, 0), 
                NEW.total_points
            ),
            last_quiz_date = NEW.completed_at,
            updated_at = NOW()
        WHERE id = NEW.user_id;
        
        -- Update question statistics
        UPDATE questions SET
            times_answered = times_answered + 1,
            times_correct = times_correct + (
                SELECT COUNT(*) 
                FROM quiz_answers qa 
                WHERE qa.quiz_session_id = NEW.id 
                AND qa.question_id = questions.id 
                AND qa.is_correct = true
            )
        WHERE id IN (
            SELECT question_id 
            FROM quiz_answers 
            WHERE quiz_session_id = NEW.id
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating user statistics
CREATE TRIGGER update_user_stats_trigger 
    AFTER UPDATE ON quiz_sessions
    FOR EACH ROW 
    EXECUTE FUNCTION update_user_stats();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, username, email, full_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Insert default categories
INSERT INTO categories (name, description, icon, color) VALUES
('General Knowledge', 'Mixed topics and general trivia', '🧠', '#6366f1'),
('Science', 'Physics, Chemistry, Biology, and more', '🔬', '#10b981'),
('History', 'World history and historical events', '📚', '#f59e0b'),
('Geography', 'Countries, capitals, and world facts', '🌍', '#3b82f6'),
('Sports', 'Sports trivia and athletic knowledge', '⚽', '#ef4444'),
('Entertainment', 'Movies, music, and pop culture', '🎬', '#8b5cf6'),
('Technology', 'Computers, internet, and tech trends', '💻', '#06b6d4'),
('Literature', 'Books, authors, and literary works', '📖', '#84cc16'),
('Art', 'Paintings, sculptures, and artists', '🎨', '#f97316'),
('Music', 'Musical knowledge and trivia', '🎵', '#ec4899')
ON CONFLICT (name) DO NOTHING;

-- Insert sample achievements
INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value, points_reward) VALUES
('First Steps', 'Complete your first quiz', '🎯', 'milestone', 'quizzes', 1, 50),
('Quiz Novice', 'Complete 5 quizzes', '📝', 'milestone', 'quizzes', 5, 100),
('Quiz Enthusiast', 'Complete 25 quizzes', '🎓', 'milestone', 'quizzes', 25, 250),
('Quiz Master', 'Complete 100 quizzes', '👑', 'milestone', 'quizzes', 100, 500),
('Point Collector', 'Earn 1000 total points', '💎', 'points', 'points', 1000, 100),
('High Scorer', 'Earn 5000 total points', '⭐', 'points', 'points', 5000, 300),
('Perfect Score', 'Get 100% accuracy in a quiz', '💯', 'accuracy', 'accuracy', 100, 200),
('Speed Demon', 'Complete a quiz in under 2 minutes', '⚡', 'speed', 'time', 120, 150),
('Streak Starter', 'Get 5 questions correct in a row', '🔥', 'streak', 'streak', 5, 100),
('Knowledge Seeker', 'Try all quiz categories', '🌟', 'variety', 'categories', 10, 300)
ON CONFLICT (name) DO NOTHING;

-- Create function to check and award achievements
CREATE OR REPLACE FUNCTION check_achievements(user_uuid UUID)
RETURNS void AS $$
DECLARE
    achievement_record RECORD;
    user_stats RECORD;
BEGIN
    -- Get user statistics
    SELECT 
        total_points,
        quizzes_completed,
        (SELECT COUNT(DISTINCT category) FROM quiz_results WHERE user_id = user_uuid) as categories_tried,
        (SELECT MAX(accuracy) FROM quiz_results WHERE user_id = user_uuid) as best_accuracy
    INTO user_stats
    FROM profiles 
    WHERE id = user_uuid;
    
    -- Check each achievement
    FOR achievement_record IN 
        SELECT * FROM achievements 
        WHERE is_active = true 
        AND id NOT IN (
            SELECT achievement_id 
            FROM user_achievements 
            WHERE user_id = user_uuid
        )
    LOOP
        -- Check if user meets achievement requirements
        IF (achievement_record.requirement_type = 'quizzes' AND user_stats.quizzes_completed >= achievement_record.requirement_value) OR
           (achievement_record.requirement_type = 'points' AND user_stats.total_points >= achievement_record.requirement_value) OR
           (achievement_record.requirement_type = 'categories' AND user_stats.categories_tried >= achievement_record.requirement_value) OR
           (achievement_record.requirement_type = 'accuracy' AND user_stats.best_accuracy >= achievement_record.requirement_value) THEN
            
            -- Award achievement
            INSERT INTO user_achievements (user_id, achievement_id)
            VALUES (user_uuid, achievement_record.id);
            
            -- Award bonus points
            IF achievement_record.points_reward > 0 THEN
                UPDATE profiles 
                SET total_points = total_points + achievement_record.points_reward
                WHERE id = user_uuid;
            END IF;
        END IF;
    END LOOP;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create function to get user leaderboard position
CREATE OR REPLACE FUNCTION get_user_rank(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    user_rank INTEGER;
BEGIN
    SELECT rank INTO user_rank
    FROM leaderboard
    WHERE id = user_uuid;
    
    RETURN COALESCE(user_rank, 0);
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Update category question counts
UPDATE categories SET question_count = (
    SELECT COUNT(*) 
    FROM questions 
    WHERE questions.category = categories.name 
    AND questions.is_active = true
);

COMMIT;