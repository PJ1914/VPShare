import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Timer, Play, Pause, RotateCcw, X, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';

const TimerContext = createContext();

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};

export const TimerProvider = ({ children }) => {
  const [studyTimer, setStudyTimer] = useState({
    isRunning: false,
    timeLeft: 25 * 60,
    mode: 'pomodoro',
    cycles: 0,
    customTime: 25,
    isCustomMode: false
  });

  const [showTimerPopup, setShowTimerPopup] = useState(false);
  const [isTimerMinimized, setIsTimerMinimized] = useState(false);
  const [timerPosition, setTimerPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Load timer state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('studyTimerState');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setStudyTimer(prev => ({
          ...prev,
          ...parsed,
          isRunning: false // Don't auto-start on page load
        }));
      } catch (error) {
        console.error('Error loading timer state:', error);
      }
    }

    const savedPosition = localStorage.getItem('timerPosition');
    if (savedPosition) {
      try {
        setTimerPosition(JSON.parse(savedPosition));
      } catch (error) {
        console.error('Error loading timer position:', error);
      }
    }
  }, []);

  // Save timer state to localStorage
  useEffect(() => {
    const stateToSave = {
      timeLeft: studyTimer.timeLeft,
      mode: studyTimer.mode,
      cycles: studyTimer.cycles,
      customTime: studyTimer.customTime,
      isCustomMode: studyTimer.isCustomMode
    };
    localStorage.setItem('studyTimerState', JSON.stringify(stateToSave));
  }, [studyTimer.timeLeft, studyTimer.mode, studyTimer.cycles, studyTimer.customTime, studyTimer.isCustomMode]);

  // Save timer position
  useEffect(() => {
    localStorage.setItem('timerPosition', JSON.stringify(timerPosition));
  }, [timerPosition]);

  // Optimized timer effect using requestAnimationFrame
  useEffect(() => {
    let animationFrameId;
    let lastTime = 0;
    const interval = 1000; // 1 second

    const animate = (currentTime) => {
      if (!lastTime) lastTime = currentTime;
      
      const deltaTime = currentTime - lastTime;
      
      if (deltaTime >= interval && studyTimer.isRunning && studyTimer.timeLeft > 0) {
        setStudyTimer(prev => {
          if (prev.timeLeft <= 1) {
            // Timer completed
            if (prev.mode === 'pomodoro') {
              const newCycles = prev.cycles + 1;
              if (newCycles % 4 === 0) {
                return { ...prev, mode: 'longBreak', timeLeft: 15 * 60, isRunning: false, cycles: newCycles };
              } else {
                return { ...prev, mode: 'shortBreak', timeLeft: 5 * 60, isRunning: false, cycles: newCycles };
              }
            } else {
              return { ...prev, mode: 'pomodoro', timeLeft: 25 * 60, isRunning: false };
            }
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
        lastTime = currentTime;
      }
      
      if (studyTimer.isRunning && studyTimer.timeLeft > 0) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    if (studyTimer.isRunning && studyTimer.timeLeft > 0) {
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [studyTimer.isRunning, studyTimer.timeLeft, studyTimer.mode, studyTimer.cycles]);

  const startTimer = useCallback(() => {
    setStudyTimer(prev => ({ ...prev, isRunning: true }));
    if (!showTimerPopup) {
      setShowTimerPopup(true);
    }
  }, [showTimerPopup]);

  const pauseTimer = useCallback(() => {
    setStudyTimer(prev => ({ ...prev, isRunning: false }));
  }, []);

  const resetTimer = useCallback(() => {
    setStudyTimer(prev => ({
      ...prev,
      isRunning: false,
      timeLeft: prev.isCustomMode ? prev.customTime * 60 : 
              prev.mode === 'pomodoro' ? 25 * 60 : 
              prev.mode === 'shortBreak' ? 5 * 60 : 15 * 60
    }));
  }, []);

  const switchMode = useCallback((mode) => {
    const times = {
      pomodoro: 25 * 60,
      shortBreak: 5 * 60,
      longBreak: 15 * 60
    };
    setStudyTimer(prev => ({
      ...prev,
      mode,
      timeLeft: prev.isCustomMode ? prev.customTime * 60 : times[mode],
      isRunning: false,
      isCustomMode: false
    }));
  }, []);

  const setCustomTime = useCallback((minutes) => {
    setStudyTimer(prev => ({
      ...prev,
      customTime: minutes,
      timeLeft: minutes * 60,
      isCustomMode: true,
      mode: 'custom',
      isRunning: false
    }));
  }, []);

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Draggable popup functions
  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - timerPosition.x,
      y: e.clientY - timerPosition.y
    });
  }, [timerPosition]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      setTimerPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const value = {
    studyTimer,
    showTimerPopup,
    setShowTimerPopup,
    isTimerMinimized,
    setIsTimerMinimized,
    timerPosition,
    setTimerPosition,
    isDragging,
    handleMouseDown,
    startTimer,
    pauseTimer,
    resetTimer,
    switchMode,
    setCustomTime,
    formatTime
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
      {/* Global Timer Popup */}
      {showTimerPopup && (
        <div
          className={`fixed z-50 bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-200 ${
            isTimerMinimized ? 'w-48 h-12' : 'w-64'
          }`}
          style={{
            left: `${timerPosition.x}px`,
            top: `${timerPosition.y}px`,
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
          onMouseDown={handleMouseDown}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Timer className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Study Timer
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                size="xs"
                variant="ghost"
                onClick={() => setIsTimerMinimized(!isTimerMinimized)}
                className="p-1 h-6 w-6"
              >
                {isTimerMinimized ? (
                  <ArrowRight className="w-3 h-3" />
                ) : (
                  <ArrowRight className="w-3 h-3 transform rotate-90" />
                )}
              </Button>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => setShowTimerPopup(false)}
                className="p-1 h-6 w-6"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Content */}
          {!isTimerMinimized && (
            <div className="p-4 space-y-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatTime(studyTimer.timeLeft)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {studyTimer.isCustomMode ? 'Custom Time' : 
                   studyTimer.mode === 'pomodoro' ? 'Focus Time' : 'Break Time'}
                </div>
              </div>

              <div className="flex items-center justify-center space-x-2">
                <Button
                  size="xs"
                  onClick={studyTimer.isRunning ? pauseTimer : startTimer}
                  className="flex items-center"
                >
                  {studyTimer.isRunning ? (
                    <Pause className="w-3 h-3 mr-1" />
                  ) : (
                    <Play className="w-3 h-3 mr-1" />
                  )}
                  {studyTimer.isRunning ? 'Pause' : 'Start'}
                </Button>
                <Button size="xs" variant="outline" onClick={resetTimer}>
                  <RotateCcw className="w-3 h-3" />
                </Button>
              </div>

              {studyTimer.isRunning && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                  <div
                    className="bg-blue-600 h-1 rounded-full transition-all duration-1000 linear"
                    style={{
                      width: `${((studyTimer.customTime * 60 - studyTimer.timeLeft) / (studyTimer.customTime * 60)) * 100}%`
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </TimerContext.Provider>
  );
};
