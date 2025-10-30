import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import QuizIcon from '@mui/icons-material/Quiz';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TimerIcon from '@mui/icons-material/Timer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrophyIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import CodeIcon from '@mui/icons-material/Code';
import WebIcon from '@mui/icons-material/Web';
import StorageIcon from '@mui/icons-material/Storage';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import DataObjectIcon from '@mui/icons-material/DataObject';
import SecurityIcon from '@mui/icons-material/Security';
import CloudIcon from '@mui/icons-material/Cloud';
import SchoolIcon from '@mui/icons-material/School';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import RefreshIcon from '@mui/icons-material/Refresh';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import LinearProgress from '@mui/material/LinearProgress';
import '../styles/Quizzes.css';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  hover: { y: -5, boxShadow: '0 8px 25px rgba(0,0,0,0.15)', transition: { duration: 0.3 } },
};

const buttonVariants = {
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  tap: { scale: 0.95, transition: { duration: 0.1 } },
};

// Mock quiz data with different categories and difficulty levels
const mockQuizzes = [
  {
    id: 1,
    title: 'JavaScript Fundamentals',
    description: 'Test your knowledge of JavaScript basics including variables, functions, loops, and data types.',
    category: 'frontend',
    difficulty: 'Beginner',
    questions: 20,
    timeLimit: 30,
    maxScore: 100,
    completed: true,
    score: 85,
    attempts: 2,
    lastAttempt: '2024-12-20',
    icon: <CodeIcon />,
    color: '#f7df1e',
    tags: ['JavaScript', 'Programming', 'Web Development']
  },
  {
    id: 2,
    title: 'React Components & Props',
    description: 'Master React components, props, state management, and lifecycle methods.',
    category: 'frontend',
    difficulty: 'Intermediate',
    questions: 25,
    timeLimit: 45,
    maxScore: 100,
    completed: true,
    score: 92,
    attempts: 1,
    lastAttempt: '2024-12-18',
    icon: <WebIcon />,
    color: '#61dafb',
    tags: ['React', 'Components', 'Frontend']
  },
  {
    id: 3,
    title: 'Node.js & Express API',
    description: 'Learn backend development with Node.js, Express routing, middleware, and API design.',
    category: 'backend',
    difficulty: 'Intermediate',
    questions: 30,
    timeLimit: 50,
    maxScore: 100,
    completed: false,
    score: 0,
    attempts: 0,
    lastAttempt: null,
    icon: <StorageIcon />,
    color: '#68a063',
    tags: ['Node.js', 'Express', 'Backend', 'API']
  },
  {
    id: 4,
    title: 'Database Design & SQL',
    description: 'Understand database concepts, SQL queries, joins, indexing, and normalization.',
    category: 'database',
    difficulty: 'Intermediate',
    questions: 35,
    timeLimit: 60,
    maxScore: 100,
    completed: true,
    score: 78,
    attempts: 3,
    lastAttempt: '2024-12-15',
    icon: <DataObjectIcon />,
    color: '#336791',
    tags: ['SQL', 'Database', 'PostgreSQL', 'MySQL']
  },
  {
    id: 5,
    title: 'Mobile App Development',
    description: 'Test your React Native skills including navigation, state management, and native modules.',
    category: 'mobile',
    difficulty: 'Advanced',
    questions: 40,
    timeLimit: 75,
    maxScore: 100,
    completed: false,
    score: 0,
    attempts: 0,
    lastAttempt: null,
    icon: <PhoneAndroidIcon />,
    color: '#a4c639',
    tags: ['React Native', 'Mobile', 'iOS', 'Android']
  },
  {
    id: 6,
    title: 'Web Security Best Practices',
    description: 'Learn about HTTPS, authentication, authorization, CORS, and common security vulnerabilities.',
    category: 'security',
    difficulty: 'Advanced',
    questions: 30,
    timeLimit: 55,
    maxScore: 100,
    completed: true,
    score: 88,
    attempts: 1,
    lastAttempt: '2024-12-10',
    icon: <SecurityIcon />,
    color: '#ff5722',
    tags: ['Security', 'HTTPS', 'Authentication', 'OWASP']
  },
  {
    id: 7,
    title: 'Cloud Computing Basics',
    description: 'Understand cloud services, AWS fundamentals, deployment strategies, and scalability.',
    category: 'cloud',
    difficulty: 'Intermediate',
    questions: 25,
    timeLimit: 40,
    maxScore: 100,
    completed: false,
    score: 0,
    attempts: 0,
    lastAttempt: null,
    icon: <CloudIcon />,
    color: '#ff9900',
    tags: ['AWS', 'Cloud', 'DevOps', 'Deployment']
  },
  {
    id: 8,
    title: 'Data Structures & Algorithms',
    description: 'Master fundamental data structures like arrays, linked lists, trees, and sorting algorithms.',
    category: 'algorithms',
    difficulty: 'Advanced',
    questions: 45,
    timeLimit: 90,
    maxScore: 100,
    completed: true,
    score: 95,
    attempts: 2,
    lastAttempt: '2024-12-22',
    icon: <TrendingUpIcon />,
    color: '#9c27b0',
    tags: ['Algorithms', 'Data Structures', 'Computer Science']
  }
];

const categoryIcons = {
  frontend: <WebIcon />,
  backend: <StorageIcon />,
  mobile: <PhoneAndroidIcon />,
  database: <DataObjectIcon />,
  security: <SecurityIcon />,
  cloud: <CloudIcon />,
  algorithms: <TrendingUpIcon />
};

const difficultyColors = {
  'Beginner': '#10b981',
  'Intermediate': '#f59e0b',
  'Advanced': '#ef4444'
};

function Quizzes() {
  const [user, setUser] = useState(null);
  const [quizzes, setQuizzes] = useState(mockQuizzes);
  const [filteredQuizzes, setFilteredQuizzes] = useState(mockQuizzes);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [showCompleted, setShowCompleted] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let filtered = quizzes;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(quiz =>
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(quiz => quiz.category === selectedCategory);
    }

    // Filter by difficulty
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(quiz => quiz.difficulty === selectedDifficulty);
    }

    // Filter by completion status
    if (showCompleted !== 'all') {
      filtered = filtered.filter(quiz => 
        showCompleted === 'completed' ? quiz.completed : !quiz.completed
      );
    }

    setFilteredQuizzes(filtered);
  }, [quizzes, searchTerm, selectedCategory, selectedDifficulty, showCompleted]);

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#10b981';
    if (score >= 80) return '#f59e0b';
    if (score >= 70) return '#f97316';
    return '#ef4444';
  };

  const totalQuizzes = quizzes.length;
  const completedQuizzes = quizzes.filter(q => q.completed).length;
  const averageScore = quizzes.filter(q => q.completed).reduce((sum, q) => sum + q.score, 0) / completedQuizzes || 0;
  const totalAttempts = quizzes.reduce((sum, q) => sum + q.attempts, 0);

  if (!user) {
    return (
      <div className="loading-container">
        <motion.div 
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <RefreshIcon fontSize="large" />
        </motion.div>
        <p>Loading your quizzes...</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="quizzes-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="quizzes-header">
        <div className="quizzes-title-section">
          <QuizIcon className="quizzes-icon" />
          <div>
            <h1>Knowledge Quizzes</h1>
            <p>Test your programming skills and track your progress</p>
          </div>
        </div>
      </div>

      <div className="quizzes-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <SchoolIcon />
          </div>
          <div className="stat-content">
            <div className="stat-number">{totalQuizzes}</div>
            <div className="stat-label">Total Quizzes</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <CheckCircleIcon />
          </div>
          <div className="stat-content">
            <div className="stat-number">{completedQuizzes}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <TrophyIcon />
          </div>
          <div className="stat-content">
            <div className="stat-number">{Math.round(averageScore)}%</div>
            <div className="stat-label">Average Score</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <RestartAltIcon />
          </div>
          <div className="stat-content">
            <div className="stat-number">{totalAttempts}</div>
            <div className="stat-label">Total Attempts</div>
          </div>
        </div>
      </div>

      <div className="quizzes-controls">
        <div className="search-filter-section">
          <div className="search-box">
            <SearchIcon className="search-icon" />
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-controls">
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
              <option value="mobile">Mobile</option>
              <option value="database">Database</option>
              <option value="security">Security</option>
              <option value="cloud">Cloud</option>
              <option value="algorithms">Algorithms</option>
            </select>

            <select 
              value={selectedDifficulty} 
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            <select 
              value={showCompleted} 
              onChange={(e) => setShowCompleted(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="not-completed">Not Completed</option>
            </select>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={filteredQuizzes.length}
          className="quizzes-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {filteredQuizzes.map((quiz, index) => (
            <motion.div
              key={quiz.id}
              className="quiz-card"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              transition={{ delay: index * 0.1 }}
            >
              <div className="quiz-card-header">
                <div className="quiz-icon" style={{ color: quiz.color }}>
                  {quiz.icon}
                </div>
                <div className="quiz-difficulty">
                  <Chip 
                    size="small" 
                    label={quiz.difficulty}
                    style={{ 
                      backgroundColor: difficultyColors[quiz.difficulty] + '20',
                      color: difficultyColors[quiz.difficulty],
                      fontWeight: 'bold'
                    }}
                  />
                </div>
              </div>

              <div className="quiz-content">
                <h3 className="quiz-title">{quiz.title}</h3>
                <p className="quiz-description">{quiz.description}</p>
                
                <div className="quiz-meta">
                  <div className="quiz-info">
                    <span className="quiz-questions">{quiz.questions} Questions</span>
                    <span className="quiz-time">
                      <TimerIcon fontSize="small" />
                      {quiz.timeLimit} min
                    </span>
                  </div>
                </div>

                <div className="quiz-tags">
                  {quiz.tags.slice(0, 3).map((tag, idx) => (
                    <Chip key={idx} size="small" label={tag} variant="outlined" />
                  ))}
                  {quiz.tags.length > 3 && (
                    <span className="tags-more">+{quiz.tags.length - 3} more</span>
                  )}
                </div>

                {quiz.completed && (
                  <div className="quiz-score-section">
                    <div className="score-header">
                      <span>Best Score</span>
                      <span style={{ color: getScoreColor(quiz.score), fontWeight: 'bold' }}>
                        {quiz.score}%
                      </span>
                    </div>
                    <LinearProgress 
                      variant="determinate" 
                      value={quiz.score} 
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: '#e2e8f0',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getScoreColor(quiz.score),
                          borderRadius: 3,
                        }
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="quiz-footer">
                <div className="quiz-stats">
                  <div className="stat">
                    <span>Attempts: {quiz.attempts}</span>
                  </div>
                  <div className="stat">
                    <span>Last: {getTimeAgo(quiz.lastAttempt)}</span>
                  </div>
                </div>
                
                <motion.button 
                  className={`quiz-action-btn ${quiz.completed ? 'retake' : 'start'}`}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <PlayArrowIcon />
                  {quiz.completed ? 'Retake Quiz' : 'Start Quiz'}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {filteredQuizzes.length === 0 && (
        <motion.div 
          className="no-quizzes"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <QuizIcon className="no-quizzes-icon" />
          <h3>No quizzes found</h3>
          <p>Try adjusting your search filters to find more quizzes!</p>
        </motion.div>
      )}

      <div className="quiz-achievements">
        <h2>Your Achievements</h2>
        <div className="achievements-grid">
          <div className={`achievement-badge ${completedQuizzes >= 1 ? 'unlocked' : 'locked'}`}>
            <TrophyIcon />
            <span>First Quiz</span>
            <small>Complete your first quiz</small>
          </div>
          <div className={`achievement-badge ${completedQuizzes >= 5 ? 'unlocked' : 'locked'}`}>
            <StarIcon />
            <span>Quiz Master</span>
            <small>Complete 5 quizzes</small>
          </div>
          <div className={`achievement-badge ${averageScore >= 80 ? 'unlocked' : 'locked'}`}>
            <BarChartIcon />
            <span>High Scorer</span>
            <small>Maintain 80% average</small>
          </div>
          <div className={`achievement-badge ${averageScore >= 90 ? 'unlocked' : 'locked'}`}>
            <TrendingUpIcon />
            <span>Perfectionist</span>
            <small>Maintain 90% average</small>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Quizzes;