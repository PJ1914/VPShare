import { useEffect } from 'react';

/**
 * Custom hook to ensure mobile visibility for critical components
 * Applies emergency visibility fixes on mobile devices
 */
export const useMobileVisibilityFix = (className, dependencies = []) => {
  useEffect(() => {
    // Only run on mobile devices
    const isMobile = window.innerWidth <= 768;
    
    if (!isMobile) return;
    
    // Small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      const elements = document.querySelectorAll(`.${className}`);
      
      if (elements.length === 0) {
        console.warn(`🚨 Mobile Visibility Fix: No elements found with class "${className}"`);
        return;
      }
      
      elements.forEach((element, index) => {
        // Apply emergency visibility styles
        element.style.setProperty('display', 'block', 'important');
        element.style.setProperty('visibility', 'visible', 'important');
        element.style.setProperty('opacity', '1', 'important');
        element.style.setProperty('min-height', 'auto', 'important');
        element.style.setProperty('width', '100%', 'important');
        
        // Add debug border in development
        if (process.env.NODE_ENV === 'development') {
          element.style.setProperty('border', '2px dashed orange', 'important');
          element.style.setProperty('position', 'relative', 'important');
          
          // Add debug label
          const debugLabel = document.createElement('div');
          debugLabel.textContent = `📱 Mobile Fix Applied: ${className}`;
          debugLabel.style.cssText = `
            position: absolute;
            top: -25px;
            left: 0;
            background: orange;
            color: white;
            padding: 2px 8px;
            font-size: 12px;
            font-weight: bold;
            z-index: 9999;
            border-radius: 3px;
          `;
          element.appendChild(debugLabel);
        }
        
        console.log(`✅ Mobile Visibility Fix applied to element ${index + 1}/${elements.length}: ${className}`);
      });
    }, 100);
    
    return () => clearTimeout(timer);
  }, dependencies);
};

/**
 * Hook specifically for the hackathon section mobile visibility
 */
export const useHackathonMobileFix = () => {
  useMobileVisibilityFix('hackathon-section-mobile');
  
  useEffect(() => {
    // Additional hackathon-specific fixes with continuous monitoring
    const isMobile = window.innerWidth <= 768;
    
    if (!isMobile) return;
    
    let intervalId;
    let timeoutId;
    
    const applyVisibilityFix = () => {
      // Find hackathon section by multiple selectors
      const selectors = [
        '.hackathon-section-mobile',
        '[class*="hackathon"]',
        '[id*="hackathon"]'
      ];
      
      let hackathonElement = null;
      
      for (const selector of selectors) {
        hackathonElement = document.querySelector(selector);
        if (hackathonElement) break;
      }
      
      if (hackathonElement) {
        // Apply aggressive visibility styles
        hackathonElement.style.setProperty('display', 'block', 'important');
        hackathonElement.style.setProperty('visibility', 'visible', 'important');
        hackathonElement.style.setProperty('opacity', '1', 'important');
        hackathonElement.style.setProperty('position', 'relative', 'important');
        hackathonElement.style.setProperty('z-index', '1', 'important');
        hackathonElement.style.setProperty('min-height', '500px', 'important');
        hackathonElement.style.setProperty('width', '100%', 'important');
        hackathonElement.style.setProperty('overflow', 'visible', 'important');
        
        // Ensure parent containers are also visible
        let parent = hackathonElement.parentElement;
        let level = 0;
        
        while (parent && level < 5) {
          parent.style.setProperty('display', 'block', 'important');
          parent.style.setProperty('visibility', 'visible', 'important');
          parent.style.setProperty('opacity', '1', 'important');
          parent.style.setProperty('overflow', 'visible', 'important');
          parent = parent.parentElement;
          level++;
        }
        
        // Apply to all child elements too
        const childElements = hackathonElement.querySelectorAll('*');
        childElements.forEach(child => {
          child.style.setProperty('visibility', 'visible', 'important');
          child.style.setProperty('opacity', '1', 'important');
          child.style.setProperty('display', 'block', 'important');
        });
        
        console.log('🎯 Hackathon Mobile Fix: Section made visible');
        return true;
      } else {
        console.warn('🚨 Hackathon Mobile Fix: Section not found in DOM');
        return false;
      }
    };
    
    // Initial fix with delay
    timeoutId = setTimeout(() => {
      applyVisibilityFix();
      
      // Set up continuous monitoring to prevent hiding
      intervalId = setInterval(() => {
        applyVisibilityFix();
      }, 1000); // Check every second
    }, 100);
    
    // Also apply fix on scroll and resize
    const handleEvent = () => {
      setTimeout(applyVisibilityFix, 50);
    };
    
    window.addEventListener('scroll', handleEvent);
    window.addEventListener('resize', handleEvent);
    window.addEventListener('orientationchange', handleEvent);
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
      window.removeEventListener('scroll', handleEvent);
      window.removeEventListener('resize', handleEvent);
      window.removeEventListener('orientationchange', handleEvent);
    };
  }, []);
};

export default useMobileVisibilityFix;
