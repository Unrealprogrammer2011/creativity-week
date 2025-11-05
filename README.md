# QuizMaster - Ultimate Quiz Experience

A beautiful, competitive quiz application built with HTML, CSS, JavaScript, and Supabase. Features user authentication, 500+ questions, real-time leaderboards, and a sophisticated point system.

## 🚀 Features

- **Beautiful UI/UX**: Modern, responsive design with smooth animations
- **User Authentication**: Secure login/registration with Supabase
- **500+ Questions**: Diverse question database across multiple categories
- **Real-time Leaderboards**: Competitive rankings with live updates
- **Smart Point System**: Dynamic scoring with bonuses and penalties
- **Mobile Responsive**: Optimized for all devices
- **Dark/Light Theme**: User preference support
- **Performance Optimized**: Fast loading and smooth interactions

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **Styling**: Custom CSS with CSS Variables
- **Deployment**: Static hosting (Netlify/Vercel)

## 📋 Prerequisites

- Modern web browser
- Supabase account
- Node.js (for development tools, optional)

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/quizmaster.git
cd quizmaster
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Update `scripts/config.js` with your Supabase credentials:

```javascript
const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY',
};
```

### 3. Set up Database Schema

Run the following SQL commands in your Supabase SQL editor:

```sql
-- Create profiles table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    total_points INTEGER DEFAULT 0,
    quizzes_completed INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create questions table
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) DEFAULT 'multiple_choice',
    category VARCHAR(50) NOT NULL,
    difficulty VARCHAR(20) DEFAULT 'medium',
    correct_answer TEXT NOT NULL,
    options JSONB,
    explanation TEXT,
    points_value INTEGER DEFAULT 10,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create quiz_results table
CREATE TABLE quiz_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    questions_answered INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    total_points INTEGER NOT NULL,
    time_spent INTEGER,
    quiz_category VARCHAR(50),
    completed_at TIMESTAMP DEFAULT NOW()
);

-- Create leaderboard view
CREATE VIEW leaderboard AS
SELECT 
    p.id,
    p.username,
    p.total_points,
    p.quizzes_completed,
    p.average_score,
    ROW_NUMBER() OVER (ORDER BY p.total_points DESC) as rank
FROM profiles p
WHERE p.total_points > 0
ORDER BY p.total_points DESC;
```

### 4. Enable Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view all questions" ON questions FOR SELECT USING (true);
CREATE POLICY "Users can view own quiz results" ON quiz_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quiz results" ON quiz_results FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 5. Deploy

#### Option 1: Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build` (if using build tools)
3. Set publish directory: `./` (root directory)
4. Deploy!

#### Option 2: Vercel
1. Connect your GitHub repository to Vercel
2. Configure build settings if needed
3. Deploy!

#### Option 3: GitHub Pages
1. Enable GitHub Pages in repository settings
2. Select source branch (main/master)
3. Your app will be available at `https://yourusername.github.io/quizmaster`

## 🎮 Usage

1. **Registration**: Create a new account with email and password
2. **Login**: Sign in to access the quiz platform
3. **Take Quiz**: Select a category and start answering questions
4. **View Results**: See your score and correct answers
5. **Leaderboard**: Check your ranking against other users
6. **Profile**: View your statistics and quiz history

## 🏗️ Project Structure

```
quizmaster/
├── index.html              # Main HTML file
├── scripts/
│   ├── config.js           # Configuration and constants
│   ├── utils.js            # Utility functions
│   ├── auth.js             # Authentication logic
│   ├── quiz.js             # Quiz functionality
│   ├── leaderboard.js      # Leaderboard management
│   ├── ui.js               # UI components and interactions
│   └── app.js              # Main application logic
├── styles/
│   ├── reset.css           # CSS reset
│   ├── variables.css       # CSS custom properties
│   ├── components.css      # Reusable components
│   ├── main.css            # Main application styles
│   └── responsive.css      # Responsive design
├── assets/
│   └── images/
│       └── logo.svg        # Application logo
└── README.md               # This file
```

## 🎨 Customization

### Themes
The app supports light and dark themes. You can customize colors in `styles/variables.css`:

```css
:root {
    --color-primary: #6366f1;
    --color-secondary: #8b5cf6;
    /* Add your custom colors */
}
```

### Questions
Add new questions by inserting into the `questions` table:

```sql
INSERT INTO questions (question_text, category, difficulty, correct_answer, options) 
VALUES (
    'What is the capital of France?',
    'Geography',
    'easy',
    'Paris',
    '["Paris", "London", "Berlin", "Madrid"]'
);
```

## 🔒 Security Features

- Secure authentication with Supabase
- Row Level Security (RLS) policies
- Input validation and sanitization
- XSS protection
- CSRF protection
- Secure session management

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the backend infrastructure
- [Inter Font](https://rsms.me/inter/) for typography
- [Heroicons](https://heroicons.com) for icons (if used)

## 📞 Support

If you have any questions or need help, please:
1. Check the [Issues](https://github.com/yourusername/quizmaster/issues) page
2. Create a new issue if your problem isn't already reported
3. Contact the maintainers

---

Made with ❤️ for quiz enthusiasts everywhere!