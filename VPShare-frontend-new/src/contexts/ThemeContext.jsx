import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function useTheme() {
    return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
    // Purely automatic theme management based on system preference
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const applyTheme = (e) => {
            const root = window.document.documentElement;
            // Remove potential manual classes if any residue exists
            root.classList.remove('light', 'dark');

            if (e.matches) {
                root.classList.add('dark');
            } else {
                root.classList.add('light');
            }
        };

        // Initial check
        applyTheme(mediaQuery);

        // Listen for system changes
        mediaQuery.addEventListener('change', applyTheme);

        return () => mediaQuery.removeEventListener('change', applyTheme);
    }, []);

    // No toggle function needed as per requirements
    return (
        <ThemeContext.Provider value={{}}>
            {children}
        </ThemeContext.Provider>
    );
}
