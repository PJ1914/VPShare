// src/components/ChatAssistant.jsx
import React, { useState, useEffect, useRef } from 'react';
import '../styles/ChatAssistant.css'; 
import { auth, db } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Get user and listen for chat history
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'userChats', user.uid, 'messages'), orderBy('createdAt'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => doc.data()));
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (isOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || !user) return;
    setLoading(true);
    const userMessage = { from: 'user', text: input, createdAt: serverTimestamp() };
    await addDoc(collection(db, 'userChats', user.uid, 'messages'), userMessage);
    setInput('');
    try {
      // Use dynamic API endpoint from .env
      const apiUrl = import.meta.env.VITE_AI_CHAT_API_URL;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, uid: user.uid, email: user.email })
      });
      const data = await response.json();
      const botMessage = { from: 'bot', text: data.reply, createdAt: serverTimestamp() };
      await addDoc(collection(db, 'userChats', user.uid, 'messages'), botMessage);
    } catch (err) {
      await addDoc(collection(db, 'userChats', user.uid, 'messages'), { from: 'bot', text: 'Sorry, something went wrong.', createdAt: serverTimestamp() });
    }
    setLoading(false);
  };

  return (
    <div className={`chat-assistant ${isOpen ? 'open' : ''}`}>
      <button className="toggle-button" onClick={() => setIsOpen(prev => !prev)}>
        {isOpen ? '×' : '💬'}
      </button>
      {isOpen && (
        <div className="chat-box">
          <div className="chat-history">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.from}`}>
                {msg.text}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="chat-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()}
              placeholder={loading ? 'Waiting for response...' : 'Type a message...'}
              disabled={loading}
            />
            <button onClick={handleSend} disabled={loading || !input.trim()}>{loading ? '...' : 'Send'}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatAssistant;
