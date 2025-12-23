import React from 'react';

/**
 * Global Scrollbar Component
 * Injects custom scrollbar styles that automatically adapt to system theme preferences.
 */
const GlobalScrollbar = () => {
    return (
        <style dangerouslySetInnerHTML={{
            __html: `
            /* ========================================
               Global Scrollbar Configuration
               ======================================== */

            /* 1. Base Styles (Default to Light Mode) */
            :root {
                color-scheme: light;
                --sb-track: transparent;
                --sb-thumb: #3b82f6; /* Primary Blue-500 */
                --sb-thumb-hover: #2563eb; /* Primary Blue-600 */
            }

            /* 2. System Preference: Dark 
               - Automatically matches OS preference.
               - Matches logic in ThemeContext (which mirrors this). */
            @media (prefers-color-scheme: dark) {
                :root {
                    color-scheme: dark;
                    --sb-track: transparent;
                    --sb-thumb: #3b82f6; /* Primary Blue-500 */
                    --sb-thumb-hover: #2563eb; /* Primary Blue-600 */
                }
            }

            /* ========================================
               Webkit Scrollbar Styling 
               ======================================== */
            
            ::-webkit-scrollbar {
                width: 10px;
                height: 10px;
            }
            
            ::-webkit-scrollbar-track {
                background: var(--sb-track);
            }
            
            ::-webkit-scrollbar-thumb {
                background-color: var(--sb-thumb);
                border-radius: 9999px;
                border: 2px solid transparent;
                background-clip: content-box;
                transition: background-color 0.2s;
            }
            
            ::-webkit-scrollbar-thumb:hover {
                background-color: var(--sb-thumb-hover);
            }
            
            ::-webkit-scrollbar-corner {
                background: transparent;
            }
            
            /* ========================================
               Firefox / Standard Styling
               ======================================== */
            
            @supports (scrollbar-width: thin) {
                * {
                    scrollbar-width: thin;
                    scrollbar-color: var(--sb-thumb) var(--sb-track);
                }
            }
        `}} />
    );
};

export default GlobalScrollbar;
