import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { saveEventRegistration } from '../services/eventService';

// Helper to load Razorpay script
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

// Course pricing config (amounts in paise for Razorpay)
export const EVENT_COURSES = {
    'machine-learning': {
        id: 'machine-learning',
        name: 'Machine Learning',
        originalPrice: 3000,
        price: 1500,
        amount: 150000, // in paise
        description: 'Complete Machine Learning course with hands-on projects'
    },
    'full-stack': {
        id: 'full-stack',
        name: 'Full Stack Development',
        originalPrice: 3000,
        price: 1500,
        amount: 150000,
        description: 'End-to-end Full Stack Development course'
    },
    'combo': {
        id: 'combo',
        name: 'Combo Offer (ML + Full Stack)',
        originalPrice: 6000,
        price: 2499,
        amount: 249900,
        description: 'Both Machine Learning & Full Stack Development courses',
        isBestOffer: true
    }
};

export const useEventPayment = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [registrationData, setRegistrationData] = useState(null);

    useEffect(() => {
        loadRazorpayScript().then(setRazorpayLoaded);
    }, []);

    const initiateEventPayment = useCallback(async (formData, selectedCourse) => {
        if (!razorpayLoaded) {
            setError('Razorpay SDK failed to load. Please check your connection.');
            return;
        }

        setLoading(true);
        setError(null);
        setPaymentSuccess(false);

        try {
            const apiUrl = import.meta.env.VITE_HACKATHON_PAYMENT_API_URL;

            if (!apiUrl) {
                throw new Error('Payment API URL is not configured.');
            }

            // 1. Create Order via backend (server determines the amount — never trust frontend)
            const orderPayload = {
                payment_type: 'event_registration',
                course: selectedCourse.id,
                amount: selectedCourse.amount,
                notes: {
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    rollNumber: formData.rollNumber,
                    collegeName: formData.collegeName,
                    courseSelected: selectedCourse.name
                }
            };

            const orderResponse = await axios.post(
                `${apiUrl}/create-order`,
                orderPayload,
                {
                    headers: { 'Content-Type': 'application/json' }
                    // NO Authorization header - event registration is public
                }
            );

            const { order_id, amount, currency, key_id } = orderResponse.data;

            if (!order_id || !key_id) {
                throw new Error('Invalid response from server');
            }

            // 2. Open Razorpay Modal
            const options = {
                key: key_id,
                amount: amount,
                currency: currency || 'INR',
                name: 'CodeTapasya',
                description: `Event Registration: ${selectedCourse.name}`,
                order_id: order_id,
                handler: async function (response) {
                    try {
                        setLoading(true);

                        // 3. Verify Payment via backend
                        const verifyPayload = {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            payment_type: 'event_registration',
                            course: selectedCourse.id,
                            amount: selectedCourse.amount,
                            email: formData.email,
                            // Include all student data for Lambda to store
                            fullName: formData.fullName,
                            rollNumber: formData.rollNumber,
                            collegeName: formData.collegeName,
                            phone: formData.phone,
                            courseSelected: selectedCourse.name
                        };

                        const verifyResponse = await axios.post(
                            `${apiUrl}/verify-payment`,
                            verifyPayload,
                            {
                                headers: { 'Content-Type': 'application/json' }
                                // NO Authorization header - event registration is public
                            }
                        );

                        // 4. Store in Firestore for admin panel
                        const regData = {
                            fullName: formData.fullName,
                            rollNumber: formData.rollNumber,
                            collegeName: formData.collegeName,
                            email: formData.email,
                            phone: formData.phone,
                            courseSelected: selectedCourse.name,
                            amountPaid: selectedCourse.price,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            paymentStatus: 'success',
                            registrationId: verifyResponse.data.registration_id
                        };

                        // Save to Firestore (for admin panel)
                        try {
                            await saveEventRegistration(regData);
                            console.log('✅ Registration saved to Firestore for admin panel');
                        } catch (firestoreError) {
                            console.error('⚠️ Firestore save failed (non-critical):', firestoreError);
                            // Don't fail the whole flow - Lambda already stored in DynamoDB
                        }

                        setRegistrationData(regData);
                        setPaymentSuccess(true);
                    } catch (err) {
                        console.error('Payment verification error:', err);
                        setError(
                            err.response?.data?.error ||
                            'Payment verification failed. If money was debited, please contact support.'
                        );
                    } finally {
                        setLoading(false);
                    }
                },
                prefill: {
                    name: formData.fullName,
                    email: formData.email,
                    contact: formData.phone
                },
                theme: {
                    color: '#2563eb'
                },
                modal: {
                    ondismiss: () => setLoading(false)
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                setError(response.error.description || 'Payment failed. Please try again.');
                setLoading(false);
            });
            rzp.open();
        } catch (err) {
            console.error('Payment initialization error:', err);
            setError(
                err.response?.data?.error ||
                err.message ||
                'Failed to initialize payment. Please try again.'
            );
            setLoading(false);
        }
    }, [razorpayLoaded]);

    return {
        initiateEventPayment,
        loading,
        error,
        razorpayLoaded,
        paymentSuccess,
        registrationData,
        clearError: () => setError(null),
        reset: () => {
            setPaymentSuccess(false);
            setRegistrationData(null);
            setError(null);
        }
    };
};
