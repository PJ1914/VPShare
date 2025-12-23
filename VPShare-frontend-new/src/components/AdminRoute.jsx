import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle } from 'lucide-react';

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const checkAdminStatus = async () => {
            if (user) {
                try {
                    const tokenResult = await user.getIdTokenResult();
                    setIsAdmin(tokenResult.claims.role === 'admin' || tokenResult.claims.admin === true);
                } catch (error) {
                    console.error('Error checking admin status:', error);
                    setIsAdmin(false);
                }
            } else {
                setIsAdmin(false);
            }
            setChecking(false);
        };

        checkAdminStatus();
    }, [user]);

    if (loading || checking) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <div className="flex items-center gap-3 text-red-500 mb-4">
                        <AlertCircle className="w-8 h-8" />
                        <h2 className="text-2xl font-bold">Access Denied</h2>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                        You do not have permission to access this page. Admin privileges are required.
                    </p>
                </div>
            </div>
        );
    }

    return children;
};

export default AdminRoute;
