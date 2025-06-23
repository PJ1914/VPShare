// src/components/ChatAssistant.jsx
import React, { useState, useEffect, useRef } from 'react';
import '../styles/ChatAssistant.css'; 
import { auth, db } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import axios from 'axios';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ReactMarkdown from 'react-markdown';

const AiIcon = (props) => (
  <svg
    width="28" height="28"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M12 2C8.13 2 5 5.13 5 9c0 1.64.57 3.15 1.53 4.33L5 19l5.67-1.53C11.85 18.43 13.36 19 15 19c3.87 0 7-3.13 7-7s-3.13-10-7-10zm0 2c2.76 0 5 2.24 5 5s-2.24 5-5 5-5-2.24-5-5 2.24-5 5-5zm0 1.5a.5.5 0 00-.5.5v3.5H8a.5.5 0 000 1h3.5V17a.5.5 0 001 0v-3.5H16a.5.5 0 000-1h-3.5V6a.5.5 0 00-.5-.5z" fill="currentColor"/>
  </svg>
);

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pendingBotText, setPendingBotText] = useState('');
  const [displayedBotText, setDisplayedBotText] = useState('');
  const [completedBotText, setCompletedBotText] = useState('');
  const [isAwaitingBot, setIsAwaitingBot] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatRef = useRef(null);
  const typingIntervalRef = useRef(null);

  // Get user and listen for chat history
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      setMessages([]);
      return;
    }
    const q = query(collection(db, 'userChats', user.uid, 'messages'), orderBy('createdAt'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Sort by createdAt (timestamp) if available
      const sorted = snapshot.docs
        .map(doc => ({ ...doc.data(), _id: doc.id }))
        .sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return a.createdAt.seconds - b.createdAt.seconds;
        });
      // Filter out the bot message that is currently being typed (avoid double display)
      const filtered = pendingBotText
        ? sorted.filter(m => !(m.from === 'bot' && m.text === pendingBotText))
        : sorted;
      setMessages(filtered);
    });
    return () => unsubscribe();
  }, [user, pendingBotText]);

  useEffect(() => {
    if (isOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Scroll to bottom as the AI types
  useEffect(() => {
    if (isOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [displayedBotText, isOpen]);

  // Close chat on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event) {
      if (chatRef.current && !chatRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSend = async () => {
    const messageText = input.trim();
    if (!messageText || !user || loading) return;
    setLoading(true);
    setIsAwaitingBot(true);
    setPendingBotText('');
    setDisplayedBotText('');
    // Save user message to Firestore
    const userMessage = { from: 'user', text: messageText, createdAt: serverTimestamp() };
    await addDoc(collection(db, 'userChats', user.uid, 'messages'), userMessage);
    // Clear input and refocus
    setInput('');
    inputRef.current?.focus();
    try {
      // Use production API URL or fall back to local development URL
      const apiUrl = import.meta.env.VITE_AI_CHAT_API_URL || import.meta.env.VITE_AI_CHAT_API_URL_LOCAL;
      const token = await user.getIdToken();
      // Prepare last 20 messages as context
      const chatContext = messages.slice(-20).map(m => ({ from: m.from, text: m.text })).concat({ from: 'user', text: messageText });
      // Prepare user info
      const userInfo = {
        uid: user.uid,
        displayName: user.displayName || '',
        email: user.email || '',
        photoURL: user.photoURL || ''
      };
      const response = await axios.post(
        apiUrl,
        {
          message: messageText,
          chat_id: 'default',
          context: chatContext,
          user: userInfo
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const reply = response.data.reply;
      setPendingBotText(reply);
      // Keep awaiting until typing effect completes
    } catch (err) {
      console.error('Backend error:', err?.response?.data || err.message);
      setPendingBotText('Sorry, something went wrong.');
      // setIsAwaitingBot will be cleared after typing animation in effect
    }
    setLoading(false);
    // Re-focus input on mobile to keep keyboard open
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  };

  // Typing animation for bot
  useEffect(() => {
    if (!pendingBotText) return;
    setDisplayedBotText('');
    let i = 0;
    typingIntervalRef.current && clearInterval(typingIntervalRef.current);
    typingIntervalRef.current = setInterval(() => {
      setDisplayedBotText((prev) => {
        if (i >= pendingBotText.length) {
          clearInterval(typingIntervalRef.current);
          // Persist bot message to Firestore after typing
          addDoc(collection(db, 'userChats', user.uid, 'messages'), {
            from: 'bot',
            text: pendingBotText,
            createdAt: serverTimestamp(),
          });
          setIsAwaitingBot(false);
          setPendingBotText('');
          return prev;
        }
        i++;
        return pendingBotText.slice(0, i);
      });
    }, 18); // ~55 chars/sec
    return () => clearInterval(typingIntervalRef.current);
  }, [pendingBotText, user]);

  return (
    <div className={`chat-assistant ${isOpen ? 'open' : ''}`} ref={chatRef}>
      <IconButton className="toggle-button" onClick={() => setIsOpen(prev => !prev)} size="large" aria-label={isOpen ? 'Close chat' : 'Open AI chat'}>
        {isOpen ? <CloseIcon fontSize="inherit" /> : <AiIcon />}
      </IconButton>
      {isOpen && (
        <div className="chat-box">
          <div className="chat-history">
            {messages.map((msg, index) => (
              <div key={msg._id || index} className={`message ${msg.from}`}>
                {msg.from === 'bot' && (
                  <span className="ct-badge">CT</span>
                )}
                {msg.from === 'bot' ? (
                  <ReactMarkdown
                    components={{
                      a: (props) => <a {...props} target="_blank" rel="noopener noreferrer" />, 
                      code({ inline, className, children, ...props }) {
                        const codeContent = String(children).replace(/\n$/, '');
                        return inline ? (
                          <code className={className} {...props}>{codeContent}</code>
                        ) : (
                          <div className="code-block-wrapper">
                            <button className="copy-code-btn" onClick={() => navigator.clipboard.writeText(codeContent)}>Copy</button>
                            <pre><code className={className} {...props}>{codeContent}</code></pre>
                          </div>
                        );
                      }
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                ) : (
                  msg.text
                )}
              </div>
            ))}
            {isAwaitingBot && pendingBotText === '' && (
              <div className="message bot typing-indicator">
                <span className="ct-badge">CT</span>
                <div className="typing-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            {pendingBotText && (
              <div className="message bot loading">
                <span className="ct-badge">CT</span>
                <span className="typing-text">
                  <ReactMarkdown>{displayedBotText || '‎'}</ReactMarkdown>
                  {displayedBotText.length < pendingBotText.length && <span className="typing-cursor">|</span>}
                </span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="chat-input">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && !pendingBotText && handleSend()}
              placeholder={loading || pendingBotText ? 'Waiting for response...' : 'Type a message...'}
              disabled={loading || isAwaitingBot || !!pendingBotText}
            />
            <button onClick={handleSend} disabled={loading || isAwaitingBot || !!pendingBotText || !input.trim()}>{loading || isAwaitingBot || pendingBotText ? '...' : 'Send'}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatAssistant;
