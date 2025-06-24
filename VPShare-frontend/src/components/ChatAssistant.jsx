import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../styles/ChatAssistant.css';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, deleteDoc, getDocs } from 'firebase/firestore';
import axios from 'axios';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import AssistantIcon from '@mui/icons-material/Assistant';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';
import { debounce } from 'lodash';

const TYPING_SPEED = 18; // ms per character

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [style, setStyle] = useState('detailed');
  const [language, setLanguage] = useState('en');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pendingBotText, setPendingBotText] = useState('');
  const [displayedBotText, setDisplayedBotText] = useState('');
  const [isAwaitingBot, setIsAwaitingBot] = useState(false);
  const [pendingBotTempId, setPendingBotTempId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const hasPersistedRef = useRef(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatRef = useRef(null);
  const typingIntervalRef = useRef(null);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Cleanup typing interval
  useEffect(() => {
    return () => clearInterval(typingIntervalRef.current);
  }, []);

  // Auth state listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setMessages([]);
        setIsOpen(false);
        setAnchorEl(null);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Listen for chat history
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'userChats', user.uid, 'messages'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sorted = snapshot.docs
        .map(snapDoc => ({
          ...snapDoc.data(),
          _id: snapDoc.id,
          createdAt: snapDoc.data().createdAt?.toDate() || new Date(),
        }))
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      const filtered = pendingBotTempId
        ? sorted.filter(m => m.tempId !== pendingBotTempId)
        : sorted;
      setMessages(filtered);
    }, (error) => {
      console.error('Firestore snapshot error:', error);
      setMessages([]);
      alert('Failed to load chat history.');
    });
    return () => unsubscribe();
  }, [user, pendingBotTempId]);

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
        setAnchorEl(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Debounced send handler
  const handleSend = useCallback(debounce(async () => {
    const messageText = input.trim();
    if (!messageText || !user || loading || isAwaitingBot) return;
    setLoading(true);
    setIsAwaitingBot(true);
    setPendingBotText('');
    setDisplayedBotText('');
    const userMessage = { from: 'user', text: messageText, createdAt: serverTimestamp() };
    try {
      await addDoc(collection(db, 'userChats', user.uid, 'messages'), userMessage);
      setInput('');
      inputRef.current?.focus();
      try {
        const token = await user.getIdToken();
        const apiUrl = import.meta.env.VITE_AI_CHAT_API_URL || import.meta.env.VITE_AI_CHAT_API_URL_LOCAL;
        const chatContext = messages.slice(-20).map(m => ({ from: m.from, text: m.text })).concat({ from: 'user', text: messageText });
        const userInfo = { uid: user.uid, displayName: user.displayName || '', email: user.email || '', photoURL: user.photoURL || '' };
        const response = await axios.post(apiUrl, { message: messageText, chat_id: 'default', context: chatContext, user: userInfo, style, language }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const reply = response.data.reply || 'No response from AI.';
        const tempId = String(Date.now());
        hasPersistedRef.current = false;
        setPendingBotTempId(tempId);
        setPendingBotText(reply);
      } catch (err) {
        console.error('Backend error:', err?.response?.data || err.message);
        setPendingBotText('Sorry, something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Firestore write error:', err);
      alert('Error sending message. Please try again.');
      setIsAwaitingBot(false);
    } finally {
      setLoading(false);
    }
  }, 300), [user, input, loading, isAwaitingBot, messages, style, language]);

  // Typing animation
  useEffect(() => {
    if (!pendingBotText || !pendingBotTempId || !user) return;
    setDisplayedBotText('');
    let i = 0;
    clearInterval(typingIntervalRef.current);
    typingIntervalRef.current = setInterval(() => {
      setDisplayedBotText((prev) => {
        if (i >= pendingBotText.length) {
          clearInterval(typingIntervalRef.current);
          if (!hasPersistedRef.current) {
            hasPersistedRef.current = true;
            addDoc(collection(db, 'userChats', user.uid, 'messages'), {
              from: 'bot',
              text: pendingBotText,
              createdAt: serverTimestamp(),
              tempId: pendingBotTempId
            }).catch((err) => {
              console.error('Firestore persist error:', err);
              alert('Error saving response.');
            }).finally(() => {
              setIsAwaitingBot(false);
              setPendingBotText('');
              setPendingBotTempId(null);
            });
          }
          return pendingBotText;
        }
        i++;
        return pendingBotText.slice(0, i);
      });
    }, TYPING_SPEED);
    return () => clearInterval(typingIntervalRef.current);
  }, [pendingBotText, pendingBotTempId, user]);

  // Clear chat history
  const handleClearChat = async () => {
    if (!user || !window.confirm('Are you sure you want to clear all messages?')) return;
    try {
      const chatCollection = collection(db, 'userChats', user.uid, 'messages');
      const snapshot = await getDocs(chatCollection);
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      setMessages([]);
    } catch (err) {
      console.error('Error clearing chat:', err);
      alert('Failed to clear chat history.');
    }
  };

  // Copy code
  const handleCopyCode = async (code, id) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      alert('Copy failed. Please copy manually.');
    }
  };

  // Handle popover open/close
  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <div className={`chat-assistant ${isOpen ? 'open' : ''}`} ref={chatRef}>
      <IconButton
        className="toggle-button"
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
              <IconButton onClick={handleClearChat} aria-label="Clear chat history">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
          <div className="chat-history">
            {messages.map((msg, index) => (
              <div key={msg._id || index} className={`message ${msg.from}`} role="log" aria-live="polite">
                {msg.from === 'bot' && <ChatBubbleOutlineIcon className="message-icon" />}
                <div className="message-content">
                  {msg.from === 'bot' ? (
                    <ReactMarkdown
                      components={{
                        a: (props) => <a {...props} target="_blank" rel="noopener noreferrer" />,
                        code({ inline, className, children, ...props }) {
                          const codeContent = String(children).replace(/\n$/, '');
                          const language = className?.replace('language-', '') || 'text';
                          if (inline) return <code className={className} {...props}>{codeContent}</code>;
                          return (
                            <div className="code-block-wrapper">
                              <div className="code-block-header">
                                <span className="code-language">{language}</span>
                                <Tooltip title={copiedId === msg._id ? 'Copied!' : 'Copy Code'}>
                                  <button
                                    className="copy-code-btn"
                                    onClick={() => handleCopyCode(codeContent, msg._id)}
                                    aria-label="Copy code"
                                  >
                                    <ContentCopyIcon fontSize="small" />
                                  </button>
                                </Tooltip>
                              </div>
                              <pre aria-label={`Code block in ${language}`} tabIndex={0}>
                                <code className={className} {...props}>
                                  {codeContent.split('\n').map((line, i) => (
                                    <div key={i} className="code-line">
                                      <span className="line-number">{i + 1}</span>
                                      {line}
                                    </div>
                                  ))}
                                </code>
                              </pre>
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
                  <span className="message-timestamp">
                    {formatDistanceToNow(msg.createdAt, { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))}
            {isAwaitingBot && !pendingBotText && (
              <div className="message bot typing-indicator" role="log" aria-live="polite">
                <ChatBubbleOutlineIcon className="message-icon" />
                <div className="typing-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            {pendingBotText && (
              <div className="message bot loading" role="log" aria-live="polite">
                <ChatBubbleOutlineIcon className="message-icon" />
                <div className="typing-text">
                  <ReactMarkdown>{displayedBotText || '‎'}</ReactMarkdown>
                  {displayedBotText.length < pendingBotText.length && <span className="typing-cursor">|</span>}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="chat-input">
            <TextField
              inputRef={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !loading && !isAwaitingBot && !pendingBotText) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={loading || isAwaitingBot || pendingBotText ? 'Waiting...' : 'Ask CodeTapasya AI...'}
              disabled={loading || isAwaitingBot || !!pendingBotText}
              aria-label="Chat input"
              variant="outlined"
              size="small"
              multiline
              maxRows={3}
              fullWidth
              autoFocus
              InputProps={{
                sx: {
                  borderRadius: '32px',
                  background: 'var(--background-light)',
                  fontSize: 'clamp(12px, 1.5vw, 14px)',
                  padding: '4px 8px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--border-color)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--primary-gradient-start)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--primary-gradient-start)',
                    borderWidth: '2px',
                  },
                },
                startAdornment: (
                  <InputAdornment position="start">
                    <IconButton
                      onClick={handlePopoverOpen}
                      aria-label="Open response options"
                      sx={{ color: 'var(--primary-gradient-end)', p: 0.5 }}
                    >
                      <ExpandLessIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleSend}
                      disabled={loading || isAwaitingBot || !!pendingBotText || !input.trim()}
                      aria-label="Send message"
                      sx={{
                        color: 'var(--primary-gradient-end)',
                        background: 'linear-gradient(135deg, var(--cta-gradient-start) 0%, var(--cta-gradient-end) 100%)',
                        borderRadius: '16px',
                        p: 0.5,
                        '&:hover': { background: 'var(--hover-color)' },
                        '&:disabled': { background: '#d1d5db', opacity: 0.6 },
                      }}
                    >
                      {loading || isAwaitingBot || pendingBotText ? <CircularProgress size={18} color="inherit" /> : <SendIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Popover
              open={open}
              anchorEl={anchorEl}
              onClose={handlePopoverClose}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              sx={{
                '& .MuiPopover-paper': {
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'var(--background-light)',
                  boxShadow: '0 6px 24px rgba(30, 64, 175, 0.2)',
                  width: 'clamp(220px, 60vw, 300px)',
                  border: '1px solid var(--border-color)',
                  animation: 'popover-pop 0.2s ease-in-out',
                },
              }}
            >
              <div className="chat-options">
                <FormControl variant="outlined" size="small" fullWidth sx={{ mb: 1.5 }}>
                  <InputLabel id="chat-style-label">Response Style</InputLabel>
                  <Select
                    labelId="chat-style-label"
                    id="chat-style-select"
                    label="Response Style"
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    sx={{
                      background: 'var(--chat-bot-bg)',
                      borderRadius: '8px',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--border-color)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary-gradient-start)' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary-gradient-start)' },
                    }}
                  >
                    <MenuItem value="detailed">Detailed</MenuItem>
                    <MenuItem value="short">Short</MenuItem>
                  </Select>
                </FormControl>
                <FormControl variant="outlined" size="small" fullWidth>
                  <InputLabel id="chat-language-label">Language</InputLabel>
                  <Select
                    labelId="chat-language-label"
                    id="chat-language-select"
                    label="Language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    sx={{
                      background: 'var(--chat-bot-bg)',
                      borderRadius: '8px',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--border-color)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary-gradient-start)' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary-gradient-start)' },
                    }}
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="hi">Hindi</MenuItem>
                    <MenuItem value="te">Telugu</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </Popover>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatAssistant;