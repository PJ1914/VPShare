import { useState, useEffect, useRef, useCallback } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Custom hook to manage chat functionality
 * Separates chat logic from UI components for better maintainability
 */
export const useChat = (user) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingBotText, setPendingBotText] = useState('');
  const [displayedBotText, setDisplayedBotText] = useState('');
  const [isAwaitingBot, setIsAwaitingBot] = useState(false);
  const [pendingBotTempId, setPendingBotTempId] = useState(null);
  
  const hasPersistedRef = useRef(false);
  const typingIntervalRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Listen for chat history when user changes
  useEffect(() => {
    if (!user) {
      setMessages([]);
      return;
    }

    const q = query(collection(db, 'userChats', user.uid, 'messages'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sorted = snapshot.docs
        .map(snapDoc => ({
          ...snapDoc.data(),
          _id: snapDoc.id,
          createdAt: snapDoc.data().createdAt?.toDate() || new Date(),
        }))
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      
      // Filter out any messages that match the current pending bot message
      // to prevent double display during typing animation
      const filtered = pendingBotTempId
        ? sorted.filter(m => {
            // Remove messages with matching tempId OR recent bot messages with same text
            if (m.tempId === pendingBotTempId) return false;
            if (m.from === 'bot' && pendingBotText && m.text === pendingBotText) return false;
            return true;
          })
        : sorted;
      
      setMessages(filtered);
    }, (error) => {
      setMessages([]);
    });

    return () => unsubscribe();
  }, [user, pendingBotTempId, pendingBotText]);

  // Typing animation effect with improved performance
  useEffect(() => {
    if (!pendingBotText || !pendingBotTempId || !user) return;
    
    setDisplayedBotText('');
    let i = 0;
    clearInterval(typingIntervalRef.current);
    
    // Adaptive typing speed based on content length
    const getTypingSpeed = (textLength) => {
      if (textLength > 2000) return 2; // Very fast for very long content
      if (textLength > 1000) return 3; // Fast for long content
      if (textLength > 500) return 5;  // Medium for medium content
      return 8; // Normal speed for short content
    };
    
    const typingSpeed = getTypingSpeed(pendingBotText.length);
    
    typingIntervalRef.current = setInterval(() => {
      setDisplayedBotText((prev) => {
        if (i >= pendingBotText.length) {
          clearInterval(typingIntervalRef.current);
          
          if (!hasPersistedRef.current && user) {
            hasPersistedRef.current = true;
            addDoc(collection(db, 'userChats', user.uid, 'messages'), {
              from: 'bot',
              text: pendingBotText,
              createdAt: serverTimestamp(),
              tempId: pendingBotTempId
            }).then(() => {
              // Clear pending states after successful persistence
              setTimeout(() => {
                setIsAwaitingBot(false);
                setPendingBotText('');
                setPendingBotTempId(null);
                setDisplayedBotText('');
              }, 100); // Small delay to ensure Firestore updates first
            }).catch((err) => {
              // Still clear states even if persistence fails
              setIsAwaitingBot(false);
              setPendingBotText('');
              setPendingBotTempId(null);
              setDisplayedBotText('');
            });
          }
          return pendingBotText;
        }
        
        // Adaptive character skipping based on content length
        const skipAmount = pendingBotText.length > 1500 ? 5 : 
                          pendingBotText.length > 1000 ? 3 : 
                          pendingBotText.length > 500 ? 2 : 1;
        
        i += skipAmount;
        
        const currentText = pendingBotText.slice(0, Math.min(i, pendingBotText.length));
        
        return currentText;
      });
    }, typingSpeed);

    return () => clearInterval(typingIntervalRef.current);
  }, [pendingBotText, pendingBotTempId, user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(typingIntervalRef.current);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const sendMessage = useCallback(async (messageText, options = {}) => {
    if (!messageText.trim() || !user || loading || isAwaitingBot) return;
    
    // Abort any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Initialize abort controller for this request
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    setLoading(true);
    setIsAwaitingBot(true);
    setPendingBotText('');
    setDisplayedBotText('');

    try {
      // Save user message to Firestore
      const userMessage = { 
        from: 'user', 
        text: messageText, 
        createdAt: serverTimestamp() 
      };
      await addDoc(collection(db, 'userChats', user.uid, 'messages'), userMessage);

      // Get auth token and make API call
      const token = await user.getIdToken();
      const baseUrl = import.meta.env.VITE_AI_CHAT_API_URL_LOCAL;
      const chatUrl = `${baseUrl}/chat`;

      const response = await fetch(chatUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          chat_id: 'default',
          style: options.style || 'auto',
          language: options.language || 'en'
        }),
        signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      // Check if response is streaming
      const contentType = response.headers.get('content-type');
      
      if (!contentType || !contentType.includes('text/event-stream')) {
        // Handle as regular JSON response
        const jsonResponse = await response.json();
        if (jsonResponse.reply) {
          setPendingBotText(jsonResponse.reply);
        } else {
          setPendingBotText('Received response in unexpected format.');
        }
        return;
      }

      // Handle streaming response with improved logic
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';
      let isStreamComplete = false;
      
      const tempId = crypto.randomUUID();
      hasPersistedRef.current = false;
      setPendingBotTempId(tempId);
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            break;
          }
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('data: ')) {
              try {
                const jsonStr = trimmedLine.slice(6).trim();
                
                if (jsonStr && jsonStr !== '' && jsonStr !== 'undefined' && jsonStr !== 'null') {
                  const data = JSON.parse(jsonStr);
                  
                  if (data.text) {
                    accumulatedText += data.text;
                    setPendingBotText(accumulatedText);
                  } else if (data.done) {
                    isStreamComplete = true;
                    setPendingBotText(accumulatedText);
                    break;
                  } else if (data.error) {
                    throw new Error(data.error);
                  }
                }
              } catch (parseError) {
                // Continue processing instead of failing
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
      
      // Ensure final text is set if stream ended without done signal
      if (accumulatedText && !isStreamComplete) {
        setPendingBotText(accumulatedText);
      } else if (!accumulatedText) {
        setPendingBotText('I apologize, but I received an empty response. Please try again.');
      }
      
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') {
        // Request was aborted
      } else {
        setPendingBotText('Sorry, something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [user, loading, isAwaitingBot]);

  const clearChat = useCallback(async () => {
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
  }, [user]);

  const stopResponse = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    clearInterval(typingIntervalRef.current);
    setIsAwaitingBot(false);
    setPendingBotText('');
    setDisplayedBotText('');
    setPendingBotTempId(null);
    setLoading(false);
    hasPersistedRef.current = false;
  }, []);

  return {
    // State
    messages,
    loading,
    isAwaitingBot,
    pendingBotText,
    displayedBotText,
    pendingBotTempId,
    
    // Actions
    sendMessage,
    clearChat,
    stopResponse
  };
};
