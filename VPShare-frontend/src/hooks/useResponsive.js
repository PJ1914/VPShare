import { useState, useEffect } from 'react';

// Custom hook for responsive design
export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  const [deviceType, setDeviceType] = useState('desktop');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({ width, height });

      // Determine device type based on width
      if (width <= 575) {
        setDeviceType('mobile-portrait');
      } else if (width <= 767) {
        setDeviceType('mobile-landscape');
      } else if (width <= 991) {
        setDeviceType('tablet');
      } else if (width <= 1199) {
        setDeviceType('desktop');
      } else {
        setDeviceType('large-desktop');
      }
    };

    // Set initial values
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = deviceType.includes('mobile');
  const isTablet = deviceType === 'tablet';
  const isDesktop = deviceType.includes('desktop');
  
  return {
    screenSize,
    deviceType,
    isMobile,
    isTablet,
    isDesktop,
    // Utility functions
    isPortrait: screenSize.height > screenSize.width,
    isLandscape: screenSize.width > screenSize.height,
  };
};

// Breakpoint constants
export const BREAKPOINTS = {
  mobilePortrait: 575,
  mobileLandscape: 767,
  tablet: 991,
  desktop: 1199,
  largeDesktop: 1200,
};

// Media query helper
export const mediaQuery = {
  mobilePortrait: `(max-width: ${BREAKPOINTS.mobilePortrait}px)`,
  mobileLandscape: `(min-width: ${BREAKPOINTS.mobilePortrait + 1}px) and (max-width: ${BREAKPOINTS.mobileLandscape}px)`,
  tablet: `(min-width: ${BREAKPOINTS.mobileLandscape + 1}px) and (max-width: ${BREAKPOINTS.tablet}px)`,
  desktop: `(min-width: ${BREAKPOINTS.tablet + 1}px) and (max-width: ${BREAKPOINTS.desktop}px)`,
  largeDesktop: `(min-width: ${BREAKPOINTS.largeDesktop}px)`,
  mobile: `(max-width: ${BREAKPOINTS.mobileLandscape}px)`,
  tabletAndUp: `(min-width: ${BREAKPOINTS.mobileLandscape + 1}px)`,
  desktopAndUp: `(min-width: ${BREAKPOINTS.tablet + 1}px)`,
};

export default useResponsive;
