import React from 'react';
import { cn } from '../../lib/utils';

const Input = React.forwardRef(({ className, type, error, label, ...props }, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block text-gray-700 dark:text-gray-300">
                    {label}
                </label>
            )}
            <input
                type={type}
                className={cn(
                    "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-blue-600",
                    error && "border-red-500 focus-visible:ring-red-500",
                    className
                )}
                ref={ref}
                {...props}
            />
            {error && (
                <p className="text-sm font-medium text-red-500 mt-1">{error}</p>
            )}
        </div>
    );
});
Input.displayName = "Input";

export default Input;
