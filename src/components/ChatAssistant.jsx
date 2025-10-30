import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../styles/ChatAssistant.css';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import AssistantIcon from '@mui/icons-material/Assistant';
import Tooltip from '@mui/material/Tooltip';

// Import our new components and hooks
import { useChat } from '../hooks/useChat';
import ChatView from './ChatView';
import ChatInput from './ChatInput';

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatRef = useRef(null);

  // Use our custom chat hook
  const {
    messages,
    loading,
    isAwaitingBot,
    pendingBotText,
    displayedBotText,
    pendingBotTempId,
    sendMessage,
    clearChat,
    stopResponse
  } = useChat(user);

  // Load chat open state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('chatOpen');
    if (stored === 'true') setIsOpen(true);
  }, []);

  // Persist chat open state
  useEffect(() => {
    localStorage.setItem('chatOpen', isOpen);
  }, [isOpen]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Auth state listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setIsOpen(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Debounced scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (isOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages, displayedBotText, isOpen, scrollToBottom]);

  // Refocus input after messages update or bot finishes
  useEffect(() => {
    if (isOpen && !isAwaitingBot && !pendingBotText && inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages, isAwaitingBot, pendingBotText, isOpen]);

  // Close chat on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event) => {
      const isInChat = chatRef.current && chatRef.current.contains(event.target);
      const isInPopover = event.target.closest('[role="presentation"]');
      if (!isInChat && !isInPopover) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Copy code handler
  const handleCopyCode = async (code, id) => {
    // This is now handled in the Message component
  };

  return (
    <div className={`chat-assistant ${isOpen ? 'open' : ''}`} ref={chatRef}>
      <IconButton
        className="chat-toggle-button"
        onClick={() => setIsOpen(prev => !prev)}
        size="large"
        aria-label={isOpen ? 'Close chat' : 'Open CodeTapasya AI chat'}
      >
        {isOpen ? <CloseIcon fontSize="inherit" /> : <AssistantIcon fontSize="inherit" />}
      </IconButton>
      
      {isOpen && (
        <div className="chat-box">
          <div className="chat-header">
            <span>CodeTapasya AI</span>
            <Tooltip title="Clear Chat History">
              <IconButton onClick={clearChat} aria-label="Clear chat history">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
          
          <ChatView
            messages={messages}
            isAwaitingBot={isAwaitingBot}
            pendingBotText={pendingBotText}
            displayedBotText={displayedBotText}
            pendingBotTempId={pendingBotTempId}
            onCopyCode={handleCopyCode}
            chatEndRef={chatEndRef}
          />
          
          <ChatInput
            onSendMessage={sendMessage}
            onStop={stopResponse}
            loading={loading}
            isAwaitingBot={isAwaitingBot}
            pendingBotText={pendingBotText}
            inputRef={inputRef}
          />
        </div>
      )}
    </div>
  );
};

export default ChatAssistant;