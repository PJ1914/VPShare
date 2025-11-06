import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  BookOpen,
  TrendingUp,
  Code,
  FileText,
  Target,
  Users,
  Trophy,
  MessageCircle,
  ChevronDown,
  Menu,
  Library,
  MonitorPlay,
  Video
} from 'lucide-react';
import '../../styles/LearningSpaceSidebar.css';

const LearningSpaceSidebar = ({ isEnrolledInLiveClasses }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

  const menuItems = [
    {
      id: 'courses',
      icon: BookOpen,
      label: 'All Courses',
      path: '/courses',
      badge: null
    },
    ...(isEnrolledInLiveClasses
      ? [
          {
            id: 'live-classes',
            icon: MonitorPlay,
            label: 'Live Classes',
            path: '/live-classes',
            badge: 'NEW',
            expandable: true,
            subItems: [
              { id: 'module-1', label: 'Module 1: Python', icon: '📘', path: '/live-classes/module/1' },
              { id: 'module-2', label: 'Module 2: Backend', icon: '📚', path: '/live-classes/module/2' },
              { id: 'module-3', label: 'Module 3: AWS', icon: '☁️', path: '/live-classes/module/3' }
            ]
          }
        ]
      : [
          {
            id: 'live-classes-preview',
            icon: MonitorPlay,
            label: 'Live Classes',
            path: '/live-classes',
            badge: 'NEW'
          }
        ]),
    {
      id: 'progress',
      icon: TrendingUp,
      label: 'My Progress',
      path: '/dashboard#progress'
    },
    {
      id: 'divider1',
      type: 'divider',
      label: 'TOOLS'
    },
    {
      id: 'video-generator',
      icon: Video,
      label: 'Video Generator',
      path: '/video-generator',
      badge: 'HOT'
    },
    {
      id: 'divider2',
      type: 'divider',
      label: 'PRACTICE'
    },
    {
      id: 'assignments',
      icon: FileText,
      label: 'Assignments',
      path: '/assignments'
    },
    {
      id: 'quizzes',
      icon: Target,
      label: 'Quizzes',
      path: '/quizzes'
    }
  ];

  const isActive = (path) => {
    if (path.includes('?')) {
      const [basePath, query] = path.split('?');
      return location.pathname === basePath && location.search.includes(query.split('=')[1]);
    }
    if (path.includes('#')) {
      return location.pathname + location.hash === path;
    }
    return location.pathname === path;
  };

  const handleItemClick = (item) => {
    if (item.expandable) {
      setExpandedSection(expandedSection === item.id ? null : item.id);
    } else if (item.path) {
      navigate(item.path);
      setIsOpen(false);
    }
  };

  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 1024 : false);

  const toggleSidebar = () => {
    setIsOpen(prev => !prev);
  };

  // Track viewport changes so the component reacts when device rotates/resizes
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };

    window.addEventListener('resize', handleResize);
    // initial sync
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Gesture detection for edge-swipe open / swipe-to-close
  const gestureRef = useRef({ startX: 0, startY: 0, lastX: 0, touching: false });

  useEffect(() => {
    if (!isMobile) return undefined;

    const onTouchStart = (e) => {
      const t = e.touches && e.touches[0];
      if (!t) return;
      gestureRef.current.startX = t.clientX;
      gestureRef.current.startY = t.clientY;
      gestureRef.current.lastX = t.clientX;
      gestureRef.current.touching = true;
    };

    const onTouchMove = (e) => {
      if (!gestureRef.current.touching) return;
      const t = e.touches && e.touches[0];
      if (!t) return;
      gestureRef.current.lastX = t.clientX;
    };

    const onTouchEnd = () => {
      if (!gestureRef.current.touching) return;
      const dx = gestureRef.current.lastX - gestureRef.current.startX;
      const startedAtEdge = gestureRef.current.startX <= 50; // left-edge start

      // open if swipe right starting from left edge
      if (startedAtEdge && dx > 80) {
        setIsOpen(true);
      }

      // close if sidebar open and swipe left sufficiently
      if (isOpen && dx < -80) {
        setIsOpen(false);
      }

      gestureRef.current.touching = false;
      gestureRef.current.startX = 0;
      gestureRef.current.lastX = 0;
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isMobile, isOpen]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen && isMobile) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev || ''; };
    }
    return undefined;
  }, [isOpen, isMobile]);

  return (
    <>
      {/* NOTE: Removed visible hamburger toggle — sidebar is controlled via gestures (edge swipe to open, swipe left to close). */}

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            onTouchEnd={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Canva Style (Collapsed by default, expands on hover) */}
      <motion.aside
        id="learning-space-sidebar"
        className={`learning-space-sidebar ${isOpen ? 'mobile-open' : ''} ${isExpanded ? 'expanded' : 'collapsed'}`}
        initial={false}
        animate={ isMobile ? { x: isOpen ? 0 : '-100%', width: isExpanded ? 240 : 72 } : { width: isExpanded ? 240 : 72 } }
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        onMouseEnter={() => !isMobile && setIsExpanded(true)}
        onMouseLeave={() => !isMobile && setIsExpanded(false)}
        // sidebar has internal touch listeners via window handlers for edge swipe open and swipe-to-close
      >
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">
              <Library size={(isExpanded || isOpen) ? 24 : 28} />
            </div>
            <AnimatePresence>
              {(isExpanded || isOpen) && (
                <motion.span 
                  className="logo-text"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  Courses
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            if (item.type === 'divider') {
              return (
                <AnimatePresence key={item.id}>
                  {isExpanded && (
                    <motion.div 
                      className="nav-divider"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span>{item.label}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              );
            }

            const Icon = item.icon;
            const active = isActive(item.path || '');

            return (
              <div key={item.id}>
                <motion.button
                  className={`nav-item ${active ? 'active' : ''} ${item.badge ? 'has-badge' : ''}`}
                  onClick={() => handleItemClick(item)}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    handleItemClick(item);
                  }}
                  whileHover={{ x: isExpanded || isOpen ? 4 : 0 }}
                  whileTap={{ scale: 0.95 }}
                  title={!isExpanded && !isOpen ? item.label : ''}
                  aria-label={item.label}
                >
                  <div className="nav-item-content">
                    <Icon size={22} className="nav-icon" />
                    <AnimatePresence>
                      {(isExpanded || isOpen) && (
                        <motion.span 
                          className="nav-label"
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {item.badge && (isExpanded || isOpen) && (
                      <motion.span 
                        className={`nav-badge ${item.badge.toLowerCase()}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        {item.badge}
                      </motion.span>
                    )}
                  </div>
                  {item.expandable && (isExpanded || isOpen) && (
                    <ChevronDown
                      size={18}
                      className={`expand-icon ${expandedSection === item.id ? 'expanded' : ''}`}
                    />
                  )}
                </motion.button>

                {/* Sub-items */}
                <AnimatePresence>
                  {item.expandable && expandedSection === item.id && (isExpanded || isOpen) && (
                    <motion.div
                      className="sub-items"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.subItems.map((subItem) => (
                        <motion.button
                          key={subItem.id}
                          className="sub-item"
                          onClick={() => {
                            if (subItem.path) {
                              navigate(subItem.path);
                            } else {
                              navigate(`${item.path}&module=${subItem.id}`);
                            }
                            setIsOpen(false);
                          }}
                          onTouchEnd={(e) => {
                            e.preventDefault();
                            if (subItem.path) {
                              navigate(subItem.path);
                            } else {
                              navigate(`${item.path}&module=${subItem.id}`);
                            }
                            setIsOpen(false);
                          }}
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <span className="sub-icon">{subItem.icon}</span>
                          <span className="sub-label">{subItem.label}</span>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>
      </motion.aside>
    </>
  );
};

export default LearningSpaceSidebar;
