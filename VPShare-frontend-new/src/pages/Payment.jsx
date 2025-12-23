import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle, AlertCircle, Loader2,
    Shield, Lock, ArrowRight, Star
} from 'lucide-react';
import { PLANS } from '../data/plans';
import { usePayment } from '../hooks/usePayment';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { cn } from '../lib/utils';

const Payment = () => {
    const { plan: planId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { initiatePayment, loading, error, clearError } = usePayment();

    const [selectedPlanId, setSelectedPlanId] = useState(planId || 'monthly');
    const selectedPlan = PLANS[selectedPlanId];

    // Update URL when selection changes
    useEffect(() => {
        if (selectedPlanId && selectedPlanId !== planId) {
            navigate(`/payment/${selectedPlanId}`, { replace: true });
        }
    }, [selectedPlanId, navigate, planId]);

    const handlePaymentSuccess = (response) => {
        // Navigate to success page or dashboard
        navigate('/dashboard?payment=success');
    };

    const onPayClick = () => {
        if (!selectedPlan) return;
        initiatePayment(selectedPlan, handlePaymentSuccess);
    };

    if (!selectedPlan) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Invalid Plan Selected</p>
            </div>
        );
    }

    const PlanIcon = selectedPlan.icon;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl mb-4"
                    >
                        Unlock Your Potential
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
                    >
                        Choose the perfect plan to accelerate your coding journey.
                    </motion.p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="max-w-3xl mx-auto mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3"
                    >
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                        <div className="flex-1">
                            <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Payment Error</h3>
                            <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
                        </div>
                        <button onClick={clearError} className="text-red-500 hover:text-red-700">Dismiss</button>
                    </motion.div>
                )}

                <div className="grid lg:grid-cols-3 gap-8 items-start">
                    {/* Plan Selection List */}
                    <div className="lg:col-span-2 grid gap-6 sm:grid-cols-2">
                        {Object.values(PLANS).map((plan) => {
                            const Icon = plan.icon;
                            const isSelected = selectedPlanId === plan.id;

                            return (
                                <motion.div
                                    key={plan.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedPlanId(plan.id)}
                                    className={cn(
                                        "cursor-pointer relative rounded-2xl p-6 border-2 transition-all duration-200 bg-white dark:bg-gray-900",
                                        isSelected
                                            ? "border-blue-600 dark:border-blue-500 shadow-lg ring-1 ring-blue-600 dark:ring-blue-500"
                                            : "border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700"
                                    )}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-3 right-4 bg-linear-to-r from-orange-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-current" />
                                            POPULAR
                                        </div>
                                    )}

                                    <div className="flex items-start justify-between mb-4">
                                        <div className={cn(
                                            "p-3 rounded-xl",
                                            isSelected ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                                        )}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-gray-900 dark:text-white">₹{plan.price}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{plan.duration}</div>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>

                                    <ul className="space-y-2 mt-4">
                                        {plan.features.slice(0, 3).map((feature, i) => (
                                            <li key={i} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                                <CheckCircle className="w-4 h-4 text-green-500 mr-2 shrink-0" />
                                                <span className="line-clamp-1">{feature}</span>
                                            </li>
                                        ))}
                                        {plan.features.length > 3 && (
                                            <li className="text-xs text-blue-600 dark:text-blue-400 font-medium pl-6">
                                                + {plan.features.length - 3} more features
                                            </li>
                                        )}
                                    </ul>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Checkout Summary */}
                    <div className="lg:col-span-1 sticky top-24">
                        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
                            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-green-600" />
                                    Order Summary
                                </h2>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                                        <PlanIcon className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">{selectedPlan.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{selectedPlan.duration} access</p>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">What's Included:</h4>
                                    <ul className="space-y-2">
                                        {selectedPlan.features.map((feature, i) => (
                                            <li key={i} className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                                                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                                        <span className="font-medium text-gray-900 dark:text-white">₹{selectedPlan.price}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-gray-600 dark:text-gray-400">Tax</span>
                                        <span className="font-medium text-gray-900 dark:text-white">₹0</span>
                                    </div>
                                    <div className="flex justify-between items-center text-lg font-bold text-gray-900 dark:text-white pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <span>Total</span>
                                        <span>₹{selectedPlan.price}</span>
                                    </div>
                                </div>

                                <Button
                                    onClick={onPayClick}
                                    isLoading={loading}
                                    className="w-full h-12 text-base shadow-blue-500/25"
                                    size="lg"
                                >
                                    {!loading && <Lock className="w-4 h-4 mr-2" />}
                                    Pay ₹{selectedPlan.price} Securely
                                </Button>

                                <div className="text-center">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                                        <Lock className="w-3 h-3" />
                                        Secured by Razorpay
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;
