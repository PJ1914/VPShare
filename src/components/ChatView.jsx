import React from 'react';
import ReactMarkdown from 'react-markdown';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import Message from './Message';
import styles from './Message.module.css';

const ChatView = ({ 
  messages, 
  isAwaitingBot, 
  pendingBotText, 
  displayedBotText, 
  pendingBotTempId,
  onCopyCode, 
  chatEndRef 
}) => {
  return (
    <div className="chat-history">
      {messages.length === 0 && !isAwaitingBot && !pendingBotText && (
        <div className="empty-state" role="status" aria-live="polite">
          🤖 Ask anything related to coding, projects, Git, or tech. I'm here to help!
        </div>
      )}
      
      {messages.map((msg, index) => (
        <Message 
          key={msg._id || index} 
          message={msg} 
          onCopyCode={onCopyCode}
        />
      ))}
      
      {isAwaitingBot && !pendingBotText && (
        <div className={`${styles.message} ${styles.bot} ${styles.typingIndicator}`} role="log" aria-live="polite">
          <ChatBubbleOutlineIcon className={styles.messageIcon} />
          <div className={styles.typingDots}>
            <span></span><span></span><span></span>
          </div>
        </div>
      )}
      
      {pendingBotText && pendingBotTempId && (
        <div className={`${styles.message} ${styles.bot}`} role="log" aria-live="polite">
          <ChatBubbleOutlineIcon className={styles.messageIcon} />
          <div className={`${styles.messageContent} ${styles.typingText}`}>
            <ReactMarkdown
              components={{
                a: (props) => <a {...props} target="_blank" rel="noopener noreferrer" />,
                code({ inline, className, children, ...props }) {
                  const codeContent = String(children).replace(/\n$/, '');
                  const language = className?.replace('language-', '') || 'text';
                  if (inline) return <code className={className} {...props}>{codeContent}</code>;
                  return (
                    <div className={styles.codeBlockWrapper}>
                      <div className={styles.codeBlockHeader}>
                        <span className={styles.codeLanguage}>{language}</span>
                      </div>
                      <pre aria-label={`Code block in ${language}`} tabIndex={0}>
                        <code className={className} {...props}>
                          {codeContent.split('\n').map((line, i) => (
                            <div key={i} className={styles.codeLine}>
                              <span className={styles.lineNumber}>{i + 1}</span>
                              <span>{line}</span>
                            </div>
                          ))}
                        </code>
                      </pre>
                    </div>
                  );
                }
              }}
            >
              {displayedBotText || '‎'}
            </ReactMarkdown>
            {displayedBotText.length < pendingBotText.length && (
              <span className={styles.typingCursor}>|</span>
            )}
          </div>
        </div>
      )}
      
      <div ref={chatEndRef} />
    </div>
  );
};

export default ChatView;
