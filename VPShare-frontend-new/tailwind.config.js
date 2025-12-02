/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                },
                secondary: {
                    500: '#8b5cf6',
                    600: '#7c3aed',
                },
                success: '#10b981',
                error: '#ef4444',
                warning: '#f59e0b',
                info: '#3b82f6',

                // Prativeda Specific Colors
                'prativeda-primary': {
                    50: '#f5e8e8',
                    100: '#e8c9cd',
                    200: '#d9a7af',
                    300: '#ca8591',
                    400: '#bf6a7a',
                    500: '#b35063',
                    600: '#ac495b',
                    700: '#a34050',
                    800: '#9a3746',
                    900: '#8b2635',
                    950: '#6d1d28',
                },
                'prativeda-secondary': {
                    50: '#f7f8f7',
                    100: '#e0e2db',
                    200: '#d2d4c8',
                    300: '#bbbfb0',
                    400: '#a4a998',
                    500: '#8d9480',
                    600: '#767d6b',
                    700: '#5f6556',
                    800: '#484e42',
                    900: '#2e3532',
                    950: '#1f2421',
                },
                'prativeda-success': {
                    50: '#f9fdf5',
                    100: '#f1fae8',
                    200: '#e7f5d8',
                    300: '#ddefc5',
                    400: '#d3efbd',
                    500: '#c3e8a8',
                    600: '#a8d987',
                    700: '#8bc966',
                    800: '#6eb945',
                    900: '#4f8f2a',
                },
                'prativeda-warning': {
                    500: '#f59e0b',
                    600: '#d97706',
                },
                'prativeda-danger': {
                    500: '#ef4444',
                    600: '#dc2626',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Lexend', 'Inter', 'sans-serif'],
            },
            boxShadow: {
                'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
                'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 30px -5px rgba(0, 0, 0, 0.04)',
            },
        },
    },
    plugins: [],
}
