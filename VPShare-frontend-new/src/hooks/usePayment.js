import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

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

export const usePayment = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);

    useEffect(() => {
        loadRazorpayScript().then(setRazorpayLoaded);
    }, []);

    const initiatePayment = useCallback(async (plan, onSuccess) => {
        if (!razorpayLoaded) {
            setError('Razorpay SDK failed to load. Please check your connection.');
            return;
        }
        if (!user) {
            setError('Please log in to proceed with payment.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 1. Get Authentication Token
            const token = await user.getIdToken();
            const apiUrl = import.meta.env.VITE_API_BASE_URL;

            if (!apiUrl) {
                throw new Error("API URL is not configured.");
            }

            // 2. Create Order
            const orderPayload = {
                payment_type: 'subscription',
                plan: plan.id,
                amount: plan.amount
            };

            const orderResponse = await axios.post(
                `${apiUrl}/create-order`,
                orderPayload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            const { order_id, amount, currency, key_id } = orderResponse.data;

            if (!order_id || !key_id) {
                throw new Error('Invalid response from server');
            }

            // 3. Open Razorpay Modal
            const options = {
                key: key_id,
                amount: amount,
                currency: currency,
                name: 'CodeTapasya',
                description: `Subscription for ${plan.name}`,
                order_id: order_id,
                handler: async function (response) {
                    try {
                        setLoading(true); // Keep loading state while verifying

                        // 4. Verify Payment
                        const verifyPayload = {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            payment_type: 'subscription',
                            plan: plan.id,
                            amount: plan.amount,
                            email: user.email,
                            duration: plan.duration
                        };

                        await axios.post(
                            `${apiUrl}/verify-payment`,
                            verifyPayload,
                            {
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                }
                            }
                        );

                        // 5. Update Firestore (Client-side backup/immediate update)
                        try {
                            const db = getFirestore();
                            const expiryDate = new Date();

                            // Calculate expiry
                            if (plan.id === 'one-day') expiryDate.setDate(expiryDate.getDate() + 1);
                            else if (plan.id === 'weekly') expiryDate.setDate(expiryDate.getDate() + 7);
                            else if (plan.id === 'monthly') expiryDate.setMonth(expiryDate.getMonth() + 1);
                            else if (plan.id === 'six-month') expiryDate.setMonth(expiryDate.getMonth() + 6);
                            else if (plan.id === 'yearly') expiryDate.setFullYear(expiryDate.getFullYear() + 1);
                            else expiryDate.setMonth(expiryDate.getMonth() + 3); // Default 3 months for live classes

                            await setDoc(doc(db, 'users', user.uid), {
                                subscription: {
                                    plan: plan.id,
                                    status: 'active',
                                    startDate: serverTimestamp(),
                                    expiresAt: expiryDate,
                                    paymentId: response.razorpay_payment_id,
                                    orderId: response.razorpay_order_id,
                                    amount: plan.amount
                                },
                                lastUpdated: serverTimestamp()
                            }, { merge: true });

                        } catch (fsError) {
                            console.warn("Firestore update failed, but payment was successful:", fsError);
                        }

                        // 6. Send Email (Optional, non-blocking)
                        try {
                            axios.post(
                                `${apiUrl}/send-email`,
                                {
                                    email: user.email,
                                    plan: plan.id,
                                    amount: plan.amount,
                                    duration: plan.duration
                                },
                                {
                                    headers: { 'Authorization': `Bearer ${token}` }
                                }
                            );
                        } catch (e) {
                            console.warn("Email sending failed:", e);
                        }

                        if (onSuccess) {
                            onSuccess(response);
                        }
                    } catch (err) {
                        console.error("Verification Error:", err);
                        setError(err.response?.data?.error || 'Payment verification failed. Please contact support.');
                    } finally {
                        setLoading(false);
                    }
                },
                prefill: {
                    name: user.displayName || '',
                    email: user.email || '',
                },
                theme: {
                    color: '#2563eb',
                },
                modal: {
                    ondismiss: () => setLoading(false)
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                setError(response.error.description || 'Payment failed');
                setLoading(false);
            });
            rzp.open();

        } catch (err) {
            console.error("Payment Initialization Error:", err);
            setError(err.response?.data?.error || err.message || 'Failed to initialize payment.');
            setLoading(false);
        }
    }, [user, razorpayLoaded]);

    return {
        initiatePayment,
        loading,
        error,
        razorpayLoaded,
        clearError: () => setError(null)
    };
};
