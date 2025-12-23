import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Send, Loader2, Sparkles } from 'lucide-react';
import { Card } from '../ui/Card';
import Button from '../ui/Button';

const FeedbackModal = ({ isOpen, onClose, onSubmit, className }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) return;

        setSubmitting(true);
        try {
            await onSubmit(rating, comment);
            onClose();
            // Reset form
            setRating(0);
            setComment('');
        } catch (err) {
            console.error('Failed to submit feedback:', err);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-md"
                >
                    <Card className="overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-6 h-6" />
                                    <h2 className="text-2xl font-bold">How was the session?</h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-purple-100">Your feedback helps us improve</p>
                        </div>

                        {/* Content */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Star Rating */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Rate your experience *
                                </label>
                                <div className="flex items-center justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <motion.button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            whileHover={{ scale: 1.2 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="focus:outline-none"
                                        >
                                            <Star
                                                className={`w-10 h-10 transition-all ${
                                                    star <= (hoverRating || rating)
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : 'text-gray-300 dark:text-gray-600'
                                                }`}
                                            />
                                        </motion.button>
                                    ))}
                                </div>
                                {rating > 0 && (
                                    <p className="text-center mt-2 text-sm text-gray-600 dark:text-gray-400">
                                        {rating === 5 && '⭐ Excellent!'}
                                        {rating === 4 && '👍 Great!'}
                                        {rating === 3 && '👌 Good'}
                                        {rating === 2 && '😐 Fair'}
                                        {rating === 1 && '😞 Needs improvement'}
                                    </p>
                                )}
                            </div>

                            {/* Comment */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Additional comments (optional)
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="What did you like? What could be improved?"
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <Button
                                    type="submit"
                                    disabled={rating === 0 || submitting}
                                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Submit Feedback
                                        </>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                    disabled={submitting}
                                >
                                    Skip
                                </Button>
                            </div>
                        </form>
                    </Card>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default FeedbackModal;
