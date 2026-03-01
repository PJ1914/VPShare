import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    CheckCircle, AlertCircle, Loader2, Lock,
    User, Mail, Phone, Hash, BookOpen,
    Sparkles, Star, ArrowRight, Gift,
    GraduationCap, Building2, MessageCircle, Ticket, X, LogIn
} from 'lucide-react';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { useEventPayment, EVENT_COURSES } from '../hooks/useEventPayment';
import SEO from '../components/SEO';
import { getSEOForPage } from '../utils/seo';

const EventRegistration = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const {
        initiateEventPayment,
        loading,
        error,
        paymentSuccess,
        registrationData,
        clearError,
        reset
    } = useEventPayment();

    const [formData, setFormData] = useState({
        fullName: '',
        rollNumber: '',
        collegeName: '',
        email: '',
        phone: ''
    });

    // Prefill email from Firebase user when logged in
    useEffect(() => {
        if (user?.email) {
            setFormData(prev => ({ ...prev, email: user.email }));
        }
    }, [user]);

    const [selectedCourse, setSelectedCourse] = useState('combo');
    const [formErrors, setFormErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);

    // Valid coupon codes
    const VALID_COUPONS = {
        'EVENT400': { discount: 400, description: 'Event Special Discount' },
        'WELCOME400': { discount: 400, description: 'Welcome Offer' },
        'SAVE400': { discount: 400, description: 'Save ₹400' }
    };

    // Validation
    const validateField = useCallback((name, value) => {
        switch (name) {
            case 'fullName':
                if (!value.trim()) return 'Full name is required';
                if (value.trim().length < 2) return 'Name must be at least 2 characters';
                return '';
            case 'rollNumber':
                if (!value.trim()) return 'Roll number is required';
                return '';
            case 'collegeName':
                if (!value.trim()) return 'College name is required';
                return '';
            case 'email':
                if (!value.trim()) return 'Email is required';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address';
                return '';
            case 'phone':
                if (!value.trim()) return 'Phone number is required';
                if (!/^[6-9]\d{9}$/.test(value.replace(/\s/g, ''))) return 'Enter a valid 10-digit Indian phone number';
                return '';
            default:
                return '';
        }
    }, []);

    const validateAllFields = useCallback(() => {
        const errors = {};
        Object.keys(formData).forEach((key) => {
            const err = validateField(key, formData[key]);
            if (err) errors[key] = err;
        });
        setFormErrors(errors);
        setTouched({
            fullName: true,
            rollNumber: true,
            collegeName: true,
            email: true,
            phone: true
        });
        return Object.keys(errors).length === 0;
    }, [formData, validateField]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (touched[name]) {
            const err = validateField(name, value);
            setFormErrors((prev) => ({ ...prev, [name]: err }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
        const err = validateField(name, value);
        setFormErrors((prev) => ({ ...prev, [name]: err }));
    };

    const handleApplyCoupon = () => {
        if (!couponCode.trim()) {
            setCouponError('Please enter a coupon code');
            return;
        }

        setCouponLoading(true);
        setCouponError('');

        // Simulate API call
        setTimeout(() => {
            const upperCoupon = couponCode.trim().toUpperCase();
            if (VALID_COUPONS[upperCoupon]) {
                setAppliedCoupon({ code: upperCoupon, ...VALID_COUPONS[upperCoupon] });
                setCouponError('');
            } else {
                setCouponError('Invalid coupon code');
                setAppliedCoupon(null);
            }
            setCouponLoading(false);
        }, 500);
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!user) {
            alert('Please login to continue registration');
            navigate('/login', { state: { from: '/event-registration' } });
            return;
        }
        if (!validateAllFields()) return;
        const course = EVENT_COURSES[selectedCourse];
        const couponCode = appliedCoupon ? appliedCoupon.code : null;
        const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
        initiateEventPayment(formData, course, couponCode, discountAmount, user);
    };

    const course = EVENT_COURSES[selectedCourse];
    const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
    const finalPrice = Math.max(0, course.price - couponDiscount);

    // Success state
    if (paymentSuccess && registrationData) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, type: 'spring' }}
                    >
                        <Card className="overflow-hidden">
                            {/* Success gradient header */}
                            <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 p-8 text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                                >
                                    <CheckCircle className="w-20 h-20 text-white mx-auto mb-4" />
                                </motion.div>
                                <h2 className="text-3xl font-bold text-white mb-2">
                                    Registration Successful! 🎉
                                </h2>
                                <p className="text-green-100 text-lg">
                                    Welcome aboard, {registrationData.fullName}!
                                </p>
                            </div>

                            <CardContent className="p-8 pt-8 space-y-6">
                                {/* Registration details */}
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 space-y-3">
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-4">
                                        Registration Details
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Course</span>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {registrationData.courseSelected}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Amount Paid</span>
                                            <p className="font-medium text-green-600 dark:text-green-400">
                                                ₹{registrationData.amountPaid?.toLocaleString()}
                                            </p>
                                        </div>
                                        {registrationData.couponCode && (
                                            <div className="col-span-2">
                                                <span className="text-gray-500 dark:text-gray-400">Coupon Applied</span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded">
                                                        <Ticket className="w-3 h-3" />
                                                        {registrationData.couponCode}
                                                    </span>
                                                    <span className="text-xs text-green-600 dark:text-green-400">
                                                        Saved ₹{registrationData.discountApplied}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Payment ID</span>
                                            <p className="font-mono text-xs text-gray-700 dark:text-gray-300">
                                                {registrationData.razorpayPaymentId}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Status</span>
                                            <p className="flex items-center gap-1 font-medium text-green-600 dark:text-green-400">
                                                <CheckCircle className="w-4 h-4" /> Confirmed
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* WhatsApp Join Button */}
                                <motion.a
                                    href="https://chat.whatsapp.com/Ll3soLeC4Fa08kO9RyCOLG"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-green-500/25 hover:shadow-green-500/40"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    initial={false}
                                >
                                    <MessageCircle className="w-6 h-6" />
                                    Join Official WhatsApp Group
                                    <ArrowRight className="w-5 h-5" />
                                </motion.a>

                                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    Join the group for updates, class schedules, and study materials.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => window.location.href = '/dashboard'}
                                    >
                                        Go to Dashboard
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="flex-1"
                                        onClick={reset}
                                    >
                                        Register Another
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4 sm:px-6 lg:px-8">
            <SEO {...getSEOForPage('eventRegistration')} />
            <div className="max-w-6xl mx-auto">
                {/* Hero Section */}
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-4"
                    >
                        <Sparkles className="w-4 h-4" />
                        Sponsored Event — Limited Seats
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4"
                    >
                        CodeTapasya Event Registration
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
                    >
                        Register for our premium courses at exclusive event pricing.
                        Each course originally priced at ₹3,000 — now just ₹1,499 each!
                    </motion.p>
                </div>

                {/* Error Alert */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="max-w-3xl mx-auto mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3"
                        >
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                            <div className="flex-1">
                                <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                                    Payment Error
                                </h3>
                                <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
                            </div>
                            <button
                                onClick={clearError}
                                className="text-red-500 hover:text-red-700 cursor-pointer"
                            >
                                Dismiss
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid lg:grid-cols-5 gap-8 items-start">
                    {/* Left: Course Selection + Form (3 cols) */}
                    <div className="lg:col-span-3 space-y-8">
                        {/* Course Selection */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                        >
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                                Select Your Course
                            </h2>
                            <div className="grid gap-4 sm:grid-cols-3">
                                {Object.values(EVENT_COURSES).map((c) => {
                                    const isSelected = selectedCourse === c.id;
                                    return (
                                        <motion.div
                                            key={c.id}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setSelectedCourse(c.id)}
                                            className={cn(
                                                'cursor-pointer relative rounded-2xl p-5 border-2 transition-all duration-200 bg-white dark:bg-gray-900',
                                                isSelected
                                                    ? 'border-blue-600 dark:border-blue-500 shadow-lg ring-1 ring-blue-600 dark:ring-blue-500'
                                                    : 'border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700'
                                            )}
                                        >
                                            {c.isBestOffer && (
                                                <div className="absolute -top-3 right-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                                                    <Star className="w-3 h-3 fill-current" />
                                                    BEST OFFER
                                                </div>
                                            )}

                                            <div className={cn(
                                                'p-2 rounded-xl w-fit mb-3',
                                                isSelected
                                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                                            )}>
                                                {c.id === 'machine-learning' ? (
                                                    <GraduationCap className="w-5 h-5" />
                                                ) : c.id === 'full-stack' ? (
                                                    <BookOpen className="w-5 h-5" />
                                                ) : (
                                                    <Gift className="w-5 h-5" />
                                                )}
                                            </div>

                                            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-2">
                                                {c.name}
                                            </h3>

                                            <div className="flex items-baseline gap-2">
                                                <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
                                                    ₹{c.price.toLocaleString()}
                                                </span>
                                                <span className="text-sm text-gray-400 line-through">
                                                    ₹{c.originalPrice.toLocaleString()}
                                                </span>
                                            </div>

                                            <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">
                                                Save ₹{(c.originalPrice - c.price).toLocaleString()}
                                            </p>

                                            {/* Selection indicator */}
                                            {isSelected && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="absolute top-3 left-3"
                                                >
                                                    <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>

                        {/* Login Prompt (if not authenticated) */}
                        {!authLoading && !user && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                            >
                                <Card className="overflow-hidden border-2 border-blue-200 dark:border-blue-800">
                                    <div className="p-8 text-center">
                                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                            Login Required
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                                            Please login or create an account to register for the event.<br />
                                            Your courses will be automatically available in your dashboard.
                                        </p>
                                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                            <Button
                                                onClick={() => navigate('/login', { state: { from: '/event-registration' } })}
                                                className="flex items-center gap-2"
                                            >
                                                <LogIn className="w-4 h-4" />
                                                Login to Continue
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => navigate('/signup', { state: { from: '/event-registration' } })}
                                            >
                                                Create Account
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {/* Registration Form (only show if logged in) */}
                        {!authLoading && user && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                            >
                                <Card className="overflow-hidden">
                                    <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <User className="w-5 h-5 text-blue-600" />
                                            Student Information
                                        </h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            Fill in your details to complete registration
                                        </p>
                                    </div>

                                <CardContent className="p-6 pt-6">
                                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                                        {/* Full Name */}
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                                Full Name <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input
                                                    id="event-fullName"
                                                    name="fullName"
                                                    type="text"
                                                    placeholder="Enter your full name"
                                                    value={formData.fullName}
                                                    onChange={handleInputChange}
                                                    onBlur={handleBlur}
                                                    error={touched.fullName ? formErrors.fullName : ''}
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>

                                        {/* Roll Number */}
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                                Roll Number <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input
                                                    id="event-rollNumber"
                                                    name="rollNumber"
                                                    type="text"
                                                    placeholder="Enter your roll number"
                                                    value={formData.rollNumber}
                                                    onChange={handleInputChange}
                                                    onBlur={handleBlur}
                                                    error={touched.rollNumber ? formErrors.rollNumber : ''}
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>

                                        {/* College Name */}
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                                College Name <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input
                                                    id="event-collegeName"
                                                    name="collegeName"
                                                    type="text"
                                                    placeholder="Enter your college name"
                                                    value={formData.collegeName}
                                                    onChange={handleInputChange}
                                                    onBlur={handleBlur}
                                                    error={touched.collegeName ? formErrors.collegeName : ''}
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                                Email ID <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input
                                                    id="event-email"
                                                    name="email"
                                                    type="email"
                                                    placeholder="yourname@example.com"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    onBlur={handleBlur}
                                                    error={touched.email ? formErrors.email : ''}
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                                Phone Number <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input
                                                    id="event-phone"
                                                    name="phone"
                                                    type="tel"
                                                    placeholder="10-digit mobile number"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    onBlur={handleBlur}
                                                    error={touched.phone ? formErrors.phone : ''}
                                                    className="pl-10"
                                                    maxLength={10}
                                                />
                                            </div>
                                        </div>

                                        {/* Submit — visible on mobile only (desktop has sidebar checkout) */}
                                        <div className="lg:hidden pt-4">
                                            <Button
                                                type="submit"
                                                isLoading={loading}
                                                disabled={loading}
                                                className="w-full h-12 text-base shadow-blue-500/25"
                                                size="lg"
                                            >
                                                {!loading && <Lock className="w-4 h-4 mr-2" />}
                                                Pay ₹{finalPrice.toLocaleString()} Securely
                                            </Button>
                                            <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3 flex items-center justify-center gap-1">
                                                <Lock className="w-3 h-3" />
                                                Secured by Razorpay
                                            </p>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                        )}
                    </div>

                    {/* Right: Order Summary Sidebar (2 cols) */}
                    <div className="lg:col-span-2 sticky top-24">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
                                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Lock className="w-5 h-5 text-green-600" />
                                        Order Summary
                                    </h2>
                                </div>

                                <div className="p-6 space-y-5">
                                    {/* Selected course info */}
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                                            {course.id === 'combo' ? (
                                                <Gift className="w-7 h-7" />
                                            ) : course.id === 'machine-learning' ? (
                                                <GraduationCap className="w-7 h-7" />
                                            ) : (
                                                <BookOpen className="w-7 h-7" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900 dark:text-white">
                                                {course.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                {course.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* What's included */}
                                    <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                            What's Included:
                                        </h4>
                                        <ul className="space-y-2">
                                            {[
                                                'Live instructor-led sessions',
                                                'Hands-on projects & assignments',
                                                'Certificate of completion',
                                                'Lifetime access to materials',
                                                ...(course.id === 'combo'
                                                    ? ['Both ML & Full Stack courses', 'Save ₹3,501 on combo']
                                                    : [])
                                            ].map((feature, i) => (
                                                <li key={i} className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                                                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Coupon Code Section */}
                                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                                            Have a Coupon Code?
                                        </h4>
                                        {!appliedCoupon ? (
                                            <div className="space-y-2">
                                                <div className="flex gap-2">
                                                    <div className="relative flex-1">
                                                        <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                        <Input
                                                            value={couponCode}
                                                            onChange={(e) => {
                                                                setCouponCode(e.target.value.toUpperCase());
                                                                setCouponError('');
                                                            }}
                                                            onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                                                            placeholder="Enter code"
                                                            className="pl-10 uppercase"
                                                            disabled={couponLoading}
                                                        />
                                                    </div>
                                                    <Button
                                                        onClick={handleApplyCoupon}
                                                        variant="outline"
                                                        disabled={couponLoading || !couponCode.trim()}
                                                        isLoading={couponLoading}
                                                        className="whitespace-nowrap"
                                                    >
                                                        Apply
                                                    </Button>
                                                </div>
                                                {couponError && (
                                                    <p className="text-xs text-red-600 dark:text-red-400">
                                                        {couponError}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Ticket className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                        <div>
                                                            <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                                                                {appliedCoupon.code}
                                                            </p>
                                                            <p className="text-xs text-green-600 dark:text-green-400">
                                                                {appliedCoupon.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={handleRemoveCoupon}
                                                        className="text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Pricing */}
                                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-gray-600 dark:text-gray-400">Original Price</span>
                                            <span className="text-gray-400 line-through">
                                                ₹{course.originalPrice.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-gray-600 dark:text-gray-400">Event Discount</span>
                                            <span className="font-medium text-green-600 dark:text-green-400">
                                                -₹{(course.originalPrice - course.price).toLocaleString()}
                                            </span>
                                        </div>
                                        {appliedCoupon && (
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-gray-600 dark:text-gray-400">Coupon Discount</span>
                                                <span className="font-medium text-green-600 dark:text-green-400">
                                                    -₹{couponDiscount}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center text-lg font-bold text-gray-900 dark:text-white pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <span>Total</span>
                                            <span>₹{finalPrice.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* Pay button — desktop */}
                                    <div className="hidden lg:block">
                                        <Button
                                            onClick={handleSubmit}
                                            isLoading={loading}
                                            disabled={loading}
                                            className="w-full h-12 text-base shadow-blue-500/25"
                                            size="lg"
                                        >
                                            {!loading && <Lock className="w-4 h-4 mr-2" />}
                                            Pay ₹{finalPrice.toLocaleString()} Securely
                                        </Button>

                                        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3 flex items-center justify-center gap-1">
                                            <Lock className="w-3 h-3" />
                                            Secured by Razorpay
                                        </p>
                                    </div>

                                    {/* Trust badges */}
                                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                            <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                            <span>Secure Payment</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                            <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                            <span>Instant Access</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                            <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                            <span>Certificate Included</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                            <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                            <span>24/7 Support</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventRegistration;
