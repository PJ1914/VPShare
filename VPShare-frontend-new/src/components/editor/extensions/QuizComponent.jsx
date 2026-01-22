import React, { useState } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { CheckCircle, Circle, Trash2, HelpCircle, AlertCircle, XCircle, Plus } from 'lucide-react';
import Button from '../../ui/Button';

const QuizComponent = ({ node, updateAttributes, deleteNode, editor }) => {
    const { question, options, correctAnswer, explanation } = node.attrs;
    const isEditable = editor.isEditable;

    // Admin State
    const [localQuestion, setLocalQuestion] = useState(question);
    const [localOptions, setLocalOptions] = useState(options);
    const [localCorrect, setLocalCorrect] = useState(correctAnswer);
    const [localExplanation, setLocalExplanation] = useState(explanation);

    // Student State
    const [selectedOption, setSelectedOption] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);

    // ... Admin Handlers ...
    const handleQuestionChange = (value) => {
        setLocalQuestion(value);
        updateAttributes({ question: value });
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...localOptions];
        newOptions[index] = value;
        setLocalOptions(newOptions);
        updateAttributes({ options: newOptions });
    };

    const handleCorrectChange = (index) => {
        setLocalCorrect(index);
        updateAttributes({ correctAnswer: index });
    };

    const handleExplanationChange = (value) => {
        setLocalExplanation(value);
        updateAttributes({ explanation: value });
    };

    const addOption = () => {
        const newOptions = [...localOptions, `Option ${localOptions.length + 1}`];
        setLocalOptions(newOptions);
        updateAttributes({ options: newOptions });
    };

    const removeOption = (index) => {
        if (localOptions.length <= 2) return;
        const newOptions = localOptions.filter((_, i) => i !== index);
        setLocalOptions(newOptions);
        updateAttributes({ options: newOptions });
        if (localCorrect === index) {
            setLocalCorrect(0);
            updateAttributes({ correctAnswer: 0 });
        } else if (localCorrect > index) {
            setLocalCorrect(localCorrect - 1);
            updateAttributes({ correctAnswer: localCorrect - 1 });
        }
    };

    // Student Handlers
    const checkAnswer = () => {
        setIsSubmitted(true);
        setShowExplanation(true);
    };

    const resetQuiz = () => {
        setIsSubmitted(false);
        setSelectedOption(null);
        setShowExplanation(false);
    };

    if (!isEditable) {
        return (
            <NodeViewWrapper className="quiz-block my-6">
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span className="font-semibold text-blue-900 dark:text-blue-100">Quiz</span>
                    </div>
                    
                    <div className="p-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                            {question}
                        </h3>

                        <div className="space-y-3">
                            {options.map((option, index) => {
                                let optionClass = "w-full text-left p-4 rounded-lg border transition-all flex items-center justify-between group ";
                                if (isSubmitted) {
                                    if (index === correctAnswer) {
                                        optionClass += "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300";
                                    } else if (index === selectedOption && index !== correctAnswer) {
                                        optionClass += "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300";
                                    } else {
                                        optionClass += "opacity-50 border-gray-200 dark:border-gray-800";
                                    }
                                } else {
                                    if (selectedOption === index) {
                                        optionClass += "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500 ring-1 ring-blue-500";
                                    } else {
                                        optionClass += "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800";
                                    }
                                }

                                return (
                                    <button
                                        key={index}
                                        onClick={() => !isSubmitted && setSelectedOption(index)}
                                        disabled={isSubmitted}
                                        className={optionClass}
                                    >
                                        <span className="flex items-center gap-3">
                                            <span className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center ${
                                                isSubmitted && index === correctAnswer ? 'border-green-500 bg-green-500 text-white' :
                                                isSubmitted && index === selectedOption ? 'border-red-500 bg-red-500 text-white' :
                                                selectedOption === index ? 'border-blue-500 bg-blue-500 text-white' :
                                                'border-gray-400 dark:border-gray-500'
                                            }`}>
                                                {isSubmitted && index === correctAnswer ? <CheckCircle className="w-4 h-4" /> :
                                                 isSubmitted && index === selectedOption ? <XCircle className="w-4 h-4" /> :
                                                 <span className="text-xs">{String.fromCharCode(65 + index)}</span>}
                                            </span>
                                            <span>{option}</span>
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Footer / Actions */}
                        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            {!isSubmitted ? (
                                <Button 
                                    onClick={checkAnswer} 
                                    disabled={selectedOption === null}
                                    className="w-full sm:w-auto"
                                >
                                    Check Answer
                                </Button>
                            ) : (
                                <div className="w-full space-y-4">
                                    <div className={`p-4 rounded-lg flex items-start gap-3 ${
                                        selectedOption === correctAnswer 
                                            ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-200' 
                                            : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                                    }`}>
                                        {selectedOption === correctAnswer 
                                            ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> 
                                            : <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                        }
                                        <div>
                                            <p className="font-medium mb-1">
                                                {selectedOption === correctAnswer ? 'Correct Answer!' : 'Incorrect'}
                                            </p>
                                            {explanation && <p className="text-sm opacity-90">{explanation}</p>}
                                        </div>
                                    </div>
                                    <Button variant="outline" onClick={resetQuiz} size="sm">
                                        Try Again
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </NodeViewWrapper>
        );
    }

    // ... Original Admin View Return ...
    return (
        <NodeViewWrapper className="quiz-block my-4">
            <div className="relative border-2 border-blue-500 rounded-xl p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 dark:border-blue-700 shadow-sm">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                        <HelpCircle className="w-5 h-5" />
                        <span className="font-semibold text-sm uppercase tracking-wide">Quiz Question</span>
                    </div>
                    <button
                        onClick={deleteNode}
                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Delete quiz"
                    >
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                </div>

                {/* Question Input */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Question
                    </label>
                    <textarea
                        value={localQuestion}
                        onChange={(e) => handleQuestionChange(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={2}
                        placeholder="Enter your question here..."
                    />
                </div>

                {/* Options */}
                <div className="space-y-3 mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Answer Options
                    </label>
                    {localOptions.map((option, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <button
                                onClick={() => handleCorrectChange(index)}
                                className="flex-shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                                title="Mark as correct answer"
                            >
                                {localCorrect === index ? (
                                    <CheckCircle className="w-5 h-5 text-green-500 fill-current" />
                                ) : (
                                    <Circle className="w-5 h-5 text-gray-400" />
                                )}
                            </button>
                            <input
                                value={option}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder={`Option ${index + 1}`}
                            />
                            {localOptions.length > 2 && (
                                <button
                                    onClick={() => removeOption(index)}
                                    className="flex-shrink-0 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                                    title="Remove option"
                                >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        onClick={addOption}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Option
                    </button>
                </div>

                {/* Explanation (optional) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Explanation (Optional)
                    </label>
                    <textarea
                        value={localExplanation}
                        onChange={(e) => handleExplanationChange(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={2}
                        placeholder="Explain why this is the correct answer..."
                    />
                </div>

                {/* Correct Answer Indicator */}
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        <strong>Correct Answer:</strong> {localOptions[localCorrect] || 'Not set'}
                    </p>
                </div>
            </div>
        </NodeViewWrapper>
    );
};

export default QuizComponent;
