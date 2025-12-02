import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Button = React.forwardRef(({
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    children,
    disabled,
    as: Component = motion.button,
    ...props
}, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none relative overflow-hidden cursor-pointer';

    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25 border border-transparent focus-visible:ring-blue-500',
        secondary: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm focus-visible:ring-gray-500',
        outline: 'bg-transparent border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 focus-visible:ring-blue-500',
        ghost: 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white focus-visible:ring-gray-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/25 border border-transparent focus-visible:ring-red-500',
        success: 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-500/25 border border-transparent focus-visible:ring-green-500',
        warning: 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/25 border border-transparent focus-visible:ring-orange-500',
        link: 'text-blue-600 dark:text-blue-400 underline-offset-4 hover:underline p-0 h-auto font-normal shadow-none',
        gradient: 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25 border-none hover:shadow-purple-500/40 focus-visible:ring-purple-500',
        glass: 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 shadow-lg focus-visible:ring-white/50',

        // Prativeda Variants
        prativeda: 'bg-prativeda-primary-600 text-white hover:bg-prativeda-primary-700 shadow-lg shadow-prativeda-primary-500/25 border border-transparent focus-visible:ring-prativeda-primary-500',
        'prativeda-outline': 'bg-transparent border-2 border-prativeda-secondary-300 text-prativeda-secondary-700 hover:bg-prativeda-secondary-50 dark:border-prativeda-secondary-700 dark:text-prativeda-secondary-300 dark:hover:bg-prativeda-secondary-800 focus-visible:ring-prativeda-secondary-500',
    };

    const sizes = {
        xs: 'h-7 px-3 text-xs',
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-sm',
        lg: 'h-12 px-8 text-base',
        xl: 'h-14 px-10 text-lg',
        icon: 'h-10 w-10 p-2',
        'icon-sm': 'h-8 w-8 p-1.5',
        'icon-lg': 'h-12 w-12 p-3',
    };

    // Animation configs
    const tapAnimation = disabled || isLoading ? {} : { scale: 0.97 };
    const hoverAnimation = disabled || isLoading || variant === 'link' ? {} : { y: -1 };

    return (
        <Component
            ref={ref}
            className={cn(baseClasses, variants[variant], sizes[size], className)}
            disabled={disabled || isLoading}
            whileTap={tapAnimation}
            whileHover={hoverAnimation}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            {...props}
        >
            {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {children}

            {/* Subtle shine effect for primary/gradient variants */}
            {(variant === 'primary' || variant === 'gradient' || variant === 'danger' || variant === 'success') && !disabled && !isLoading && (
                <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20 pointer-events-none" />
            )}
        </Component>
    );
});

Button.displayName = 'Button';

export default Button;
