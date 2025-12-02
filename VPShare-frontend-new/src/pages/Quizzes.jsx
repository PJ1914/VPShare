import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BrainCircuit, Clock, Award, CheckCircle, XCircle,
    Play, ChevronRight, RefreshCw, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';

const Quizzes = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [quizzes, setQuizzes] = useState([]);
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [quizState, setQuizState] = useState('intro'); // intro, playing, result
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);

    // Mock Data
    const MOCK_QUIZZES = [
        {
            id: '1',
            title: 'JavaScript Fundamentals',
            description: 'Test your knowledge of JS basics, variables, loops, and functions.',
            questionsCount: 5,
            timeLimit: 300, // seconds
            difficulty: 'Easy',
            questions: [
                {
                    id: 1,
                    text: 'Which keyword is used to declare a constant variable?',
                    options: ['var', 'let', 'const', 'final'],
                    correct: 2
                },
                {
                    id: 2,
                    text: 'What is the result of "2" + 2 in JavaScript?',
                    options: ['4', '"22"', 'NaN', 'Error'],
                    correct: 1
                },
                {
                    id: 3,
                    text: 'Which method adds an element to the end of an array?',
                    options: ['push()', 'pop()', 'shift()', 'unshift()'],
                    correct: 0
                },
                {
                    id: 4,
                    text: 'What does DOM stand for?',
                    options: ['Data Object Model', 'Document Object Model', 'Digital Object Model', 'Dynamic Object Model'],
                    correct: 1
                },
                {
                    id: 5,
                    text: 'How do you write a comment in JavaScript?',
                    options: ['<!-- Comment -->', '# Comment', '// Comment', '** Comment **'],
                    correct: 2
                }
            ]
        },
        {
            id: '2',
            title: 'React Hooks Mastery',
            description: 'Deep dive into useState, useEffect, and custom hooks.',
            questionsCount: 5,
            timeLimit: 450,
            difficulty: 'Hard',
            questions: [
                { id: 1, text: 'Which hook is used for side effects?', options: ['useState', 'useEffect', 'useContext', 'useReducer'], correct: 1 },
                { id: 2, text: 'What is the return value of useState?', options: ['Current state', 'Setter function', 'Array of [state, setter]', 'Object {state, setter}'], correct: 2 },
                { id: 3, text: 'Can hooks be used in class components?', options: ['Yes', 'No', 'Only with HOCs', 'Sometimes'], correct: 1 },
                { id: 4, text: 'Which hook is best for complex state logic?', options: ['useState', 'useReducer', 'useMemo', 'useCallback'], correct: 1 },
                { id: 5, text: 'What does useRef return?', options: ['A mutable object', 'A function', 'A DOM node', 'A state value'], correct: 0 }
            ]
        },
        {
            id: '3',
            title: 'CSS Flexbox & Grid',
            description: 'Challenge your layout skills with modern CSS techniques.',
            questionsCount: 5,
            timeLimit: 300,
            difficulty: 'Medium',
            questions: [
                { id: 1, text: 'Which property defines the direction of flex items?', options: ['flex-flow', 'flex-direction', 'justify-content', 'align-items'], correct: 1 },
                { id: 2, text: 'What is the default value of flex-direction?', options: ['column', 'row', 'row-reverse', 'column-reverse'], correct: 1 },
                { id: 3, text: 'Which property is used to create a grid container?', options: ['display: flex', 'display: grid', 'display: block', 'display: inline-grid'], correct: 1 },
                { id: 4, text: 'How do you center an item horizontally in Flexbox?', options: ['align-items: center', 'justify-content: center', 'text-align: center', 'margin: auto'], correct: 1 },
                { id: 5, text: 'Which unit is specific to CSS Grid?', options: ['px', 'em', 'fr', '%'], correct: 2 }
            ]
        }
    ];

    useEffect(() => {
        setTimeout(() => {
            setQuizzes(MOCK_QUIZZES);
            setLoading(false);
        }, 1000);
    }, []);

    useEffect(() => {
        let timer;
        if (quizState === 'playing' && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && quizState === 'playing') {
            finishQuiz();
        }
        return () => clearInterval(timer);
    }, [quizState, timeLeft]);

    const startQuiz = (quiz) => {
        setActiveQuiz(quiz);
        setQuizState('playing');
        setCurrentQuestionIndex(0);
        setScore(0);
        setTimeLeft(quiz.timeLimit);
        setSelectedAnswer(null);
    };

    const handleAnswer = (optionIndex) => {
        setSelectedAnswer(optionIndex);
        // Optional: Add delay before next question or show feedback immediately
    };

    const nextQuestion = () => {
        if (selectedAnswer === activeQuiz.questions[currentQuestionIndex].correct) {
            setScore(prev => prev + 1);
        }

        if (currentQuestionIndex < activeQuiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
        } else {
            finishQuiz();
        }
    };

    const finishQuiz = () => {
        // Check last answer if selected but not processed
        if (selectedAnswer === activeQuiz.questions[currentQuestionIndex].correct) {
            setScore(prev => prev + 1);
        }
        setQuizState('result');
    };

    const resetQuiz = () => {
        setActiveQuiz(null);
        setQuizState('intro');
        setScore(0);
        setCurrentQuestionIndex(0);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (loading) {
        return (
            <div className="py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto space-y-6">
                    <Skeleton className="h-10 w-48" />
                    <div className="grid gap-4">
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} className="h-40 w-full rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Quiz Playing View
    if (activeQuiz && quizState === 'playing') {
        const currentQuestion = activeQuiz.questions[currentQuestionIndex];
        const progress = ((currentQuestionIndex) / activeQuiz.questions.length) * 100;

        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4 flex items-center justify-center">
                <div className="w-full max-w-2xl">
                    <div className="mb-6 flex justify-between items-center bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <BrainCircuit className="w-5 h-5 text-purple-500" />
                            <span className="font-semibold">{activeQuiz.title}</span>
                        </div>
                        <div className={`flex items-center gap-2 font-mono font-bold ${timeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-blue-600'}`}>
                            <Clock className="w-5 h-5" />
                            {formatTime(timeLeft)}
                        </div>
                    </div>

                    <Card className="overflow-hidden bg-white dark:bg-gray-900 border-none shadow-lg">
                        <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800">
                            <motion.div
                                className="h-full bg-blue-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                        <div className="p-8">
                            <div className="mb-8">
                                <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                                    Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}
                                </span>
                                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mt-2">
                                    {currentQuestion.text}
                                </h3>
                            </div>

                            <div className="space-y-3">
                                {currentQuestion.options.map((option, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleAnswer(index)}
                                        className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group ${selectedAnswer === index
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                            : 'border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300'
                                            }`}
                                    >
                                        <span className="font-medium">{option}</span>
                                        {selectedAnswer === index && <CheckCircle className="w-5 h-5 text-blue-500" />}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-8 flex justify-end">
                                <Button
                                    onClick={nextQuestion}
                                    disabled={selectedAnswer === null}
                                    className="px-8"
                                >
                                    {currentQuestionIndex === activeQuiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    // Quiz Result View
    if (activeQuiz && quizState === 'result') {
        const percentage = Math.round((score / activeQuiz.questions.length) * 100);
        let message = '';
        let icon = Award;
        let color = 'text-yellow-500';

        if (percentage >= 80) {
            message = 'Outstanding Performance!';
            color = 'text-yellow-500';
        } else if (percentage >= 60) {
            message = 'Good Job! Keep Learning.';
            icon = CheckCircle;
            color = 'text-green-500';
        } else {
            message = 'Needs Improvement. Try Again!';
            icon = AlertTriangle;
            color = 'text-red-500';
        }

        const Icon = icon;

        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4 flex items-center justify-center">
                <Card className="w-full max-w-md text-center p-8 bg-white dark:bg-gray-900 border-none shadow-xl">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center ${color}`}
                    >
                        <Icon className="w-12 h-12" />
                    </motion.div>

                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {percentage}% Score
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        You answered {score} out of {activeQuiz.questions.length} questions correctly.
                    </p>
                    <p className={`text-lg font-medium mb-8 ${color}`}>
                        {message}
                    </p>

                    <div className="flex gap-4 justify-center">
                        <Button variant="outline" onClick={resetQuiz}>
                            Back to Quizzes
                        </Button>
                        <Button onClick={() => startQuiz(activeQuiz)}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Retry Quiz
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    // Quiz List View
    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <BrainCircuit className="w-8 h-8 text-pink-600" />
                        Quizzes
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Test your knowledge and earn badges
                    </p>
                </div>

                <div className="grid gap-4">
                    {quizzes.map((quiz) => (
                        <motion.div
                            key={quiz.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.01 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:shadow-md transition-all cursor-pointer group">
                                <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${quiz.difficulty === 'Easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                quiz.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                {quiz.difficulty}
                                            </span>
                                            <span className="text-xs text-gray-400">•</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{quiz.questionsCount} Questions</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                                            {quiz.title}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                                            {quiz.description}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right hidden sm:block">
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Time Limit</div>
                                            <div className="font-mono font-medium text-gray-900 dark:text-white">
                                                {Math.floor(quiz.timeLimit / 60)} mins
                                            </div>
                                        </div>
                                        <Button onClick={() => startQuiz(quiz)} className="shrink-0">
                                            Start Quiz
                                            <Play className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Quizzes;
