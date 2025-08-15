/* Mobile Registration Enhancement Wrapper */
import React, { useEffect } from 'react';
import { useResponsive } from '../../hooks/useResponsive';

const MobileRegistrationWrapper = ({ children }) => {
  const { isMobile, isTablet } = useResponsive();

  useEffect(() => {
    if (isMobile || isTablet) {
      // Prevent body scroll when registration form is active
      document.body.style.overflowX = 'hidden';
      
      // Add mobile-specific viewport meta tag adjustments
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
        );
      }

      // Add touch-friendly focus handling
      const addTouchFocusSupport = () => {
        const inputs = document.querySelectorAll('input, select, textarea, button');
        inputs.forEach(input => {
          input.addEventListener('focus', () => {
            input.classList.add('mobile-focused');
            // Scroll input into view with padding
            setTimeout(() => {
              input.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
              });
            }, 300);
          });
          
          input.addEventListener('blur', () => {
            input.classList.remove('mobile-focused');
          });
        });
      };

      // Initialize touch support after component mounts
      setTimeout(addTouchFocusSupport, 100);

      return () => {
        document.body.style.overflowX = 'auto';
        // Reset viewport meta tag
        if (viewport) {
          viewport.setAttribute('content', 
            'width=device-width, initial-scale=1.0'
          );
        }
      };
    }
  }, [isMobile, isTablet]);

  // Don't add extra wrapper div - just enhance existing children
  // This prevents additional layering issues
  if (isMobile || isTablet) {
    // Add mobile-specific data attribute without extra wrapper
    return React.cloneElement(children, {
      ...children.props,
      'data-mobile-optimized': 'true',
      className: `${children.props.className || ''} mobile-optimized`.trim()
    });
  }

  return children;
};

export default MobileRegistrationWrapper;
