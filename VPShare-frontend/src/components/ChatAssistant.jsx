// src/components/ChatAssistant.jsx
import React, { useState, useEffect, useRef } from 'react';
import '../styles/ChatAssistant.css'; 
import { auth, db } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import axios from 'axios';
import IconButton from '@mui/material/IconButton';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import ReactMarkdown from 'react-markdown';

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pendingBotText, setPendingBotText] = useState('');
  const [displayedBotText, setDisplayedBotText] = useState('');
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
    if (!input.trim() || !user || loading) return;
    setLoading(true);
    setPendingBotText('');
    setDisplayedBotText('');
    const userMessage = { from: 'user', text: input, createdAt: serverTimestamp() };
    await addDoc(collection(db, 'userChats', user.uid, 'messages'), userMessage);
    setInput('');
    inputRef.current && inputRef.current.focus();
    try {
      // Use production API URL or fall back to local development URL
      const apiUrl = import.meta.env.VITE_AI_CHAT_API_URL || import.meta.env.VITE_AI_CHAT_API_URL_LOCAL;
      const token = await user.getIdToken();
      // Prepare last 20 messages as context
      const chatContext = messages.slice(-20).map(m => ({ from: m.from, text: m.text }));
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
          message: input,
          chat_id: 'default',
          context: chatContext,
          user: userInfo
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingBotText(response.data.reply);
    } catch (err) {
      console.error('Backend error:', err?.response?.data || err.message);
      setPendingBotText('Sorry, something went wrong.');
    }
    setLoading(false);
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
          // Only add the full message to Firestore if it doesn't already exist
          addDoc(collection(db, 'userChats', user.uid, 'messages'), { from: 'bot', text: pendingBotText, createdAt: serverTimestamp() });
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
      <IconButton className="toggle-button" onClick={() => setIsOpen(prev => !prev)} size="large">
        {isOpen ? <CloseIcon fontSize="inherit" /> : <ChatBubbleOutlineIcon fontSize="inherit" />}
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
                      a: (props) => <a {...props} target="_blank" rel="noopener noreferrer" />
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                ) : (
                  msg.text
                )}
              </div>
            ))}
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
              disabled={loading || !!pendingBotText}
            />
            <button onClick={handleSend} disabled={loading || !!pendingBotText || !input.trim()}>{loading || pendingBotText ? '...' : 'Send'}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatAssistant;
