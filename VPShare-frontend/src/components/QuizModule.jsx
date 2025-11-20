import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  LinearProgress,
  Typography,
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tooltip,
  Grid
} from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import RefreshIcon from '@mui/icons-material/Refresh';
import '../styles/QuizModule.css';

const QuizModule = ({ courseId, onQuizComplete, courseProgress }) => {
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(null);
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [previousScores, setPreviousScores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sample quiz questions - in production, fetch from backend
  const quizQuestions = [
    {
      id: 1,
      question: 'What are the main learning objectives you achieved in this course?',
      options: [
        'I learned the fundamentals covered in the course modules',
        'I understood advanced concepts and applications',
        'I can apply the knowledge to real-world projects',
        'All of the above'
      ],
      correctAnswer: 3,
      explanation: 'Completing the course modules should give you comprehensive knowledge from basics to applications.'
    },
    {
      id: 2,
      question: 'How confident are you in applying the concepts learned?',
      options: [
        'Not very confident',
        'Somewhat confident',
        'Confident',
        'Very confident'
      ],
      correctAnswer: 3,
      explanation: 'After completing all modules, you should feel confident applying what you learned.'
    },
    {
      id: 3,
      question: 'Which resource was most helpful in your learning?',
      options: [
        'Video lessons',
        'Code examples',
        'Interactive exercises',
        'Combination of all resources'
      ],
      correctAnswer: 3,
      explanation: 'A mix of different learning materials helps reinforce concepts better.'
    },
    {
      id: 4,
      question: 'Would you recommend this course to others?',
      options: [
        'Not likely',
        'Maybe',
        'Likely',
        'Definitely'
      ],
      correctAnswer: 3,
      explanation: 'A well-structured course with clear modules and practical examples is highly recommendable.'
    },
    {
      id: 5,
      question: 'What area would you like to explore further?',
      options: [
        'Advanced topics in this field',
        'Related technologies',
        'Practical projects',
        'I need more time on basics'
      ],
      correctAnswer: 0,
      explanation: 'Advancing to more specialized topics helps you develop expertise in your chosen field.'
    },
    {
      id: 6,
      question: 'How would you rate the overall course structure?',
      options: [
        'Could be improved significantly',
        'Decent but with some issues',
        'Good with minor improvements needed',
        'Excellent and well-organized'
      ],
      correctAnswer: 3,
      explanation: 'Good course structure with clear progression makes learning effective.'
    },
    {
      id: 7,
      question: 'Did the modules build on each other effectively?',
      options: [
        'Not at all, content was scattered',
        'Somewhat, but with gaps',
        'Yes, mostly well-sequenced',
        'Yes, perfectly sequenced with each module building on the previous'
      ],
      correctAnswer: 3,
      explanation: 'A well-designed curriculum builds progressively, reinforcing previous concepts.'
    },
    {
      id: 8,
      question: 'Would you like more practice exercises?',
      options: [
        'No, exercises were sufficient',
        'A few more would help',
        'Yes, definitely more needed',
        'An extensive practice section is essential'
      ],
      correctAnswer: 2,
      explanation: 'Additional practice helps solidify your understanding and build muscle memory.'
    }
  ];

  useEffect(() => {
    // Simulate loading previous quiz scores from Firebase
    setTimeout(() => {
      setPreviousScores([]);
      setLoading(false);
    }, 500);
  }, [courseId]);

  const handleQuizStart = () => {
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setQuizScore(null);
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = () => {
    // Calculate score
    let correctCount = 0;
    quizQuestions.forEach(question => {
      if (userAnswers[question.id] === question.correctAnswer) {
        correctCount++;
      }
    });

    const finalScore = Math.round((correctCount / quizQuestions.length) * 100);
    setQuizScore(finalScore);
    setShowResultsDialog(true);

    // Save to Firebase in production
    if (onQuizComplete) {
      onQuizComplete({
        score: finalScore,
        attempts: previousScores.length + 1,
        correctAnswers: correctCount,
        totalQuestions: quizQuestions.length,
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleRestartQuiz = () => {
    setQuizStarted(false);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowResultsDialog(false);
  };

  const handleRetakeQuiz = () => {
    setPreviousScores(prev => [...prev, quizScore]);
    handleRestartQuiz();
  };

  if (loading) {
    return (
      <Card className="quiz-module-card">
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <QuizIcon sx={{ fontSize: 48, color: '#3b82f6' }} />
          </motion.div>
          <Typography sx={{ mt: 2 }}>Loading quiz...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!quizStarted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="quiz-module-card">
          <CardHeader
            avatar={<QuizIcon sx={{ color: '#3b82f6', fontSize: 32 }} />}
            title="Final Assessment Quiz"
            subtitle={`Test your knowledge of the course content`}
            sx={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}
          />
          <CardContent sx={{ py: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                You've completed all the course modules! 🎉
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                Now take the final assessment quiz to test your understanding of the concepts you've learned.
              </Typography>

              <Box sx={{ 
                backgroundColor: '#f0f9ff', 
                border: '2px solid #3b82f6',
                borderRadius: '12px',
                p: 3,
                mb: 4,
                textAlign: 'left'
              }}>
                <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 2 }}>
                  Quiz Details:
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ color: '#3b82f6', fontWeight: 700 }}>
                        {quizQuestions.length}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Questions
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ color: '#3b82f6', fontWeight: 700 }}>
                        {Math.ceil(quizQuestions.length * 2)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Minutes
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ color: '#3b82f6', fontWeight: 700 }}>
                        100
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Max Score
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ color: '#10b981', fontWeight: 700 }}>
                        70%
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Pass Score
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Course Progress: {courseProgress || 85}% Complete
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={courseProgress || 85}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#e2e8f0',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: 'linear-gradient(90deg, #3b82f6, #1e40af)'
                    }
                  }}
                />
              </Box>

              {previousScores.length > 0 && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  You've taken this quiz {previousScores.length} time(s) before. Your best score was {Math.max(...previousScores)}%
                </Alert>
              )}

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PlayIcon />}
                  onClick={handleQuizStart}
                  sx={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '1rem',
                    px: 4,
                    py: 1.5,
                    borderRadius: '8px',
                    '&:hover': {
                      backgroundColor: '#1e40af'
                    }
                  }}
                >
                  Start Quiz
                </Button>
              </motion.div>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Quiz Question View
  const currentQuestion = quizQuestions[currentQuestionIndex];
  const selectedAnswer = userAnswers[currentQuestion.id];
  const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="quiz-module-card">
        <CardHeader
          title={`Question ${currentQuestionIndex + 1} of ${quizQuestions.length}`}
          sx={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}
        />
        <CardContent sx={{ py: 4 }}>
          {/* Progress Bar */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" fontWeight="600">
                Progress
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {Math.round(progress)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: '#e2e8f0',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  background: 'linear-gradient(90deg, #3b82f6, #1e40af)'
                }
              }}
            />
          </Box>

          {/* Question */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            key={currentQuestion.id}
          >
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, fontSize: '1.1rem' }}>
              {currentQuestion.question}
            </Typography>

            {/* Answer Options */}
            <RadioGroup
              value={selectedAnswer !== undefined ? selectedAnswer : ''}
              onChange={(e) => handleAnswerSelect(currentQuestion.id, parseInt(e.target.value))}
            >
              {currentQuestion.options.map((option, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="quiz-option-wrapper"
                >
                  <FormControlLabel
                    value={index}
                    control={<Radio sx={{ color: '#3b82f6' }} />}
                    label={
                      <Box sx={{ ml: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {option}
                        </Typography>
                      </Box>
                    }
                    sx={{
                      width: '100%',
                      border: '2px solid transparent',
                      borderRadius: '8px',
                      padding: '12px',
                      marginBottom: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      backgroundColor: selectedAnswer === index ? '#f0f9ff' : 'transparent',
                      borderColor: selectedAnswer === index ? '#3b82f6' : '#e2e8f0',
                      '&:hover': {
                        backgroundColor: '#f8fafc',
                        borderColor: '#3b82f6'
                      }
                    }}
                  />
                </motion.div>
              ))}
            </RadioGroup>
          </motion.div>

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderColor: '#d1d5db',
                color: '#6b7280'
              }}
            >
              Previous
            </Button>

            {currentQuestionIndex === quizQuestions.length - 1 ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="contained"
                  onClick={handleSubmitQuiz}
                  disabled={selectedAnswer === undefined}
                  sx={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:disabled': {
                      backgroundColor: '#d1d5db',
                      color: '#9ca3af'
                    }
                  }}
                >
                  Submit Quiz
                </Button>
              </motion.div>
            ) : (
              <Button
                variant="contained"
                onClick={handleNextQuestion}
                disabled={selectedAnswer === undefined}
                sx={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:disabled': {
                    backgroundColor: '#d1d5db',
                    color: '#9ca3af'
                  }
                }}
              >
                Next
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Results Dialog */}
      <Dialog
        open={showResultsDialog}
        onClose={() => setShowResultsDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
          Quiz Results
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            style={{ textAlign: 'center' }}
          >
            {quizScore >= 70 ? (
              <>
                <EmojiEventsIcon sx={{ fontSize: 64, color: '#10b981', mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#10b981' }}>
                  Excellent! You Passed! 🎉
                </Typography>
              </>
            ) : (
              <>
                <CancelIcon sx={{ fontSize: 64, color: '#ef4444', mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#ef4444' }}>
                  Keep Practicing
                </Typography>
              </>
            )}

            <Box sx={{
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              p: 3,
              mb: 3,
              border: '2px solid #e2e8f0'
            }}>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                Your Score
              </Typography>
              <Typography variant="h2" sx={{
                fontWeight: 700,
                color: quizScore >= 70 ? '#10b981' : '#ef4444'
              }}>
                {quizScore}%
              </Typography>
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#3b82f6' }}>
                    {Object.keys(userAnswers).filter(qid => userAnswers[qid] === quizQuestions.find(q => q.id == qid)?.correctAnswer).length}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Correct
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#ef4444' }}>
                    {quizQuestions.length - Object.keys(userAnswers).filter(qid => userAnswers[qid] === quizQuestions.find(q => q.id == qid)?.correctAnswer).length}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Incorrect
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {quizScore < 70 && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                You need a score of 70% to pass. Review the course materials and try again!
              </Alert>
            )}

            {quizScore >= 70 && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Congratulations! You've successfully completed this course! 🏆
              </Alert>
            )}
          </motion.div>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={handleRetakeQuiz}
            startIcon={<RefreshIcon />}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Retake Quiz
          </Button>
          <Button
            variant="contained"
            onClick={() => setShowResultsDialog(false)}
            sx={{
              backgroundColor: '#3b82f6',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#1e40af' }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

// Icon component that was missing
const PlayIcon = () => <span>▶</span>;

export default QuizModule;
