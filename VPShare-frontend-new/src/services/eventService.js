import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    serverTimestamp,
    where
} from 'firebase/firestore';
import { db } from '../config/firebase';

const EVENT_REGISTRATIONS_COLLECTION = 'eventRegistrations';

/**
 * Store a successful event registration in Firestore
 */
export const saveEventRegistration = async (registrationData) => {
    try {
        const docRef = await addDoc(collection(db, EVENT_REGISTRATIONS_COLLECTION), {
            fullName: registrationData.fullName,
            rollNumber: registrationData.rollNumber,
            collegeName: registrationData.collegeName,
            email: registrationData.email,
            phone: registrationData.phone,
            courseSelected: registrationData.courseSelected,
            amountPaid: registrationData.amountPaid,
            couponCode: registrationData.couponCode || null,
            discountApplied: registrationData.discountApplied || 0,
            razorpayOrderId: registrationData.razorpayOrderId,
            razorpayPaymentId: registrationData.razorpayPaymentId,
            paymentStatus: registrationData.paymentStatus || 'success',
            registrationId: registrationData.registrationId || null,
            createdAt: serverTimestamp()
        });
        return { id: docRef.id, ...registrationData };
    } catch (error) {
        console.error('Error saving event registration:', error);
        throw new Error('Failed to save registration. Please contact support.');
    }
};

/**
 * Fetch all event registrations (Admin only — access controlled via Firestore rules)
 */
export const getEventRegistrations = async () => {
    try {
        const q = query(
            collection(db, EVENT_REGISTRATIONS_COLLECTION),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const registrations = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            registrations.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.() || new Date()
            });
        });
        return registrations;
    } catch (error) {
        console.error('Error fetching event registrations:', error);
        throw new Error('Failed to fetch registrations.');
    }
};

/**
 * Search registrations by field value
 */
export const searchEventRegistrations = async (field, value) => {
    try {
        const q = query(
            collection(db, EVENT_REGISTRATIONS_COLLECTION),
            where(field, '==', value)
        );
        const querySnapshot = await getDocs(q);
        const registrations = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            registrations.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.() || new Date()
            });
        });
        return registrations;
    } catch (error) {
        console.error('Error searching event registrations:', error);
        throw new Error('Failed to search registrations.');
    }
};

/**
 * Export registrations to CSV format string
 */
export const exportRegistrationsToCSV = (registrations) => {
    const headers = [
        'Name',
        'Roll Number',
        'College',
        'Email',
        'Phone',
        'Course',
        'Amount (₹)',
        'Payment ID',
        'Order ID',
        'Status',
        'Date'
    ];

    const rows = registrations.map((reg) => [
        reg.fullName,
        reg.rollNumber,
        reg.collegeName,
        reg.email,
        reg.phone,
        reg.courseSelected,
        reg.amountPaid,
        reg.razorpayPaymentId,
        reg.razorpayOrderId,
        reg.paymentStatus,
        reg.createdAt instanceof Date
            ? reg.createdAt.toLocaleDateString('en-IN')
            : new Date(reg.createdAt).toLocaleDateString('en-IN')
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map((row) =>
            row.map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')
        )
    ].join('\n');

    return csvContent;
};

/**
 * Trigger CSV file download
 */
export const downloadCSV = (csvContent, filename = 'event_registrations.csv') => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
