import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ message, className = '' }) => {
    return (
        <div className={`bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2 ${className}`}>
            <AlertCircle size={20} />
            <span>{message}</span>
        </div>
    );
};

export default ErrorMessage;
