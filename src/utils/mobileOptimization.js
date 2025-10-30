/**
 * Mobile Performance Optimization Utilities
 * Provides utilities for optimizing mobile performance and user experience
 */

// Detect mobile device and capabilities
export const mobileDetection = {
  // Check if device is mobile
  isMobile: () => {
    return window.innerWidth <= 767 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },

  // Check if device supports touch
  isTouch: () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  // Check device pixel ratio for high-DPI displays
  isHighDPI: () => {
    return window.devicePixelRatio > 1.5;
  },

  // Check if device is in landscape mode
  isLandscape: () => {
    return window.innerWidth > window.innerHeight;
  },

  // Get safe area insets for notched devices
  getSafeAreaInsets: () => {
    const style = getComputedStyle(document.documentElement);
    return {
      top: style.getPropertyValue('env(safe-area-inset-top)') || '0px',
      bottom: style.getPropertyValue('env(safe-area-inset-bottom)') || '0px',
      left: style.getPropertyValue('env(safe-area-inset-left)') || '0px',
      right: style.getPropertyValue('env(safe-area-inset-right)') || '0px'
    };
  }
};

// Performance optimization utilities
export const mobilePerformance = {
  // Debounce function for scroll events
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function for resize events
  throttle: (func, limit) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Lazy load images with intersection observer
  lazyLoadImages: (selector = '.lazy-image') => {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            img.classList.add('loaded');
            observer.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.1
      });

      document.querySelectorAll(selector).forEach(img => {
        imageObserver.observe(img);
      });
    }
  },

  // Preload critical resources
  preloadResource: (href, as = 'fetch', crossorigin = 'anonymous') => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (crossorigin) link.crossOrigin = crossorigin;
    document.head.appendChild(link);
  },

  // Optimize images for mobile
  optimizeImageForMobile: (src, quality = 80) => {
    if (mobileDetection.isMobile()) {
      // For mobile, use smaller images or WebP format if supported
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      return new Promise((resolve) => {
        img.onload = () => {
          const maxWidth = Math.min(img.width, 800);
          const maxHeight = Math.min(img.height, 600);
          
          canvas.width = maxWidth;
          canvas.height = maxHeight;
          
          ctx.drawImage(img, 0, 0, maxWidth, maxHeight);
          resolve(canvas.toDataURL('image/jpeg', quality / 100));
        };
        img.src = src;
      });
    }
    return Promise.resolve(src);
  }
};

// Mobile UX enhancements
export const mobileUX = {
  // Add haptic feedback (if supported)
  addHapticFeedback: (type = 'medium') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30],
        success: [10, 50, 10],
        error: [50, 50, 50],
        warning: [20, 30, 20]
      };
      navigator.vibrate(patterns[type] || patterns.medium);
    }
  },

  // Prevent zoom on input focus
  preventZoomOnInput: () => {
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      if (input.style.fontSize.length === 0) {
        input.style.fontSize = '16px';
      }
    });
  },

  // Add pull-to-refresh functionality
  addPullToRefresh: (callback, threshold = 70) => {
    let startY = 0;
    let currentY = 0;
    let pullStarted = false;

    const handleTouchStart = (e) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        pullStarted = true;
      }
    };

    const handleTouchMove = (e) => {
      if (!pullStarted) return;
      
      currentY = e.touches[0].clientY;
      const pullDistance = currentY - startY;

      if (pullDistance > 0 && window.scrollY === 0) {
        e.preventDefault();
        
        if (pullDistance > threshold) {
          document.body.classList.add('pull-to-refresh-active');
        } else {
          document.body.classList.remove('pull-to-refresh-active');
        }
      }
    };

    const handleTouchEnd = () => {
      if (!pullStarted) return;
      
      const pullDistance = currentY - startY;
      
      if (pullDistance > threshold) {
        callback();
        mobileUX.addHapticFeedback('success');
      }
      
      document.body.classList.remove('pull-to-refresh-active');
      pullStarted = false;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  },

  // Smooth scroll with mobile optimization
  smoothScrollTo: (element, offset = 0) => {
    const targetElement = typeof element === 'string' ? document.querySelector(element) : element;
    if (!targetElement) return;

    const headerOffset = 120; // Account for mobile header
    const elementPosition = targetElement.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  },

  // Add swipe gesture detection
  addSwipeGesture: (element, callbacks = {}) => {
    let startX, startY, distX, distY;
    const threshold = 50;
    const restraint = 100;
    const allowedTime = 300;
    let startTime;

    const handleTouchStart = (e) => {
      const touchobj = e.changedTouches[0];
      startX = touchobj.pageX;
      startY = touchobj.pageY;
      startTime = new Date().getTime();
    };

    const handleTouchEnd = (e) => {
      const touchobj = e.changedTouches[0];
      distX = touchobj.pageX - startX;
      distY = touchobj.pageY - startY;
      const elapsedTime = new Date().getTime() - startTime;

      if (elapsedTime <= allowedTime) {
        if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint) {
          if (distX > 0 && callbacks.onSwipeRight) {
            callbacks.onSwipeRight();
          } else if (distX < 0 && callbacks.onSwipeLeft) {
            callbacks.onSwipeLeft();
          }
        } else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint) {
          if (distY > 0 && callbacks.onSwipeDown) {
            callbacks.onSwipeDown();
          } else if (distY < 0 && callbacks.onSwipeUp) {
            callbacks.onSwipeUp();
          }
        }
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }
};

// Mobile accessibility helpers
export const mobileA11y = {
  // Announce content changes to screen readers
  announceToScreenReader: (message, priority = 'polite') => {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.style.position = 'absolute';
    announcer.style.left = '-10000px';
    announcer.style.width = '1px';
    announcer.style.height = '1px';
    announcer.style.overflow = 'hidden';
    
    document.body.appendChild(announcer);
    announcer.textContent = message;
    
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  },

  // Ensure touch targets meet minimum size requirements
  ensureTouchTargetSize: (minSize = 48) => {
    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [role="button"], [role="link"]');
    
    interactiveElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      if (rect.width < minSize || rect.height < minSize) {
        element.style.minWidth = `${minSize}px`;
        element.style.minHeight = `${minSize}px`;
        element.style.display = element.style.display || 'inline-flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
      }
    });
  },

  // Add skip links for mobile navigation
  addSkipLinks: () => {
    const skipLinks = [
      { href: '#main-content', text: 'Skip to main content' },
      { href: '#navigation', text: 'Skip to navigation' },
      { href: '#footer', text: 'Skip to footer' }
    ];

    const skipContainer = document.createElement('div');
    skipContainer.className = 'skip-links';
    
    skipLinks.forEach(link => {
      const skipLink = document.createElement('a');
      skipLink.href = link.href;
      skipLink.textContent = link.text;
      skipLink.className = 'skip-link';
      skipContainer.appendChild(skipLink);
    });

    document.body.insertBefore(skipContainer, document.body.firstChild);
  }
};

// Export all utilities
export default {
  mobileDetection,
  mobilePerformance,
  mobileUX,
  mobileA11y
};
