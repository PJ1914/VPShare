import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Tooltip from '@mui/material/Tooltip';
import { formatDistanceToNow } from 'date-fns';
import styles from './Message.module.css';

const Message = ({ message, onCopyCode }) => {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(message._id);
      setTimeout(() => setCopiedId(null), 2000);
      if (onCopyCode) onCopyCode(code, message._id);
    } catch (err) {
      alert('Failed to copy code. Please try manually.');
    }
  };

  return (
    <div className={`${styles.message} ${styles[message.from]}`} role="log" aria-live="polite">
      {message.from === 'bot' && <ChatBubbleOutlineIcon className={styles.messageIcon} />}
      <div className={styles.messageContent}>
        {message.from === 'bot' ? (
          <ReactMarkdown
            components={{
              a: (props) => <a {...props} target="_blank" rel="noopener noreferrer" />,
              // Custom paragraph component that avoids nesting pre elements
              p({ children, ...props }) {
                return <div className={styles.markdownParagraph}>{children}</div>;
              },
              code({ inline, className, children, ...props }) {
                const codeContent = String(children).replace(/\n$/, '');
                const language = className?.replace('language-', '') || 'text';
                if (inline) return <code className={className} {...props}>{codeContent}</code>;
                return (
                  <div className={styles.codeBlockWrapper}>
                    <div className={styles.codeBlockHeader}>
                      <span className={styles.codeLanguage}>{language}</span>
                      <Tooltip title={copiedId === message._id ? 'Copied!' : 'Copy Code'}>
                        <button
                          className={styles.copyCodeBtn}
                          onClick={() => handleCopyCode(codeContent)}
                          aria-label="Copy code"
                        >
                          <ContentCopyIcon fontSize="small" />
                          {copiedId === message._id ? 'Copied!' : 'Copy'}
                        </button>
                      </Tooltip>
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
            {message.text}
          </ReactMarkdown>
        ) : (
          message.text
        )}
        <span className={styles.messageTimestamp}>
          {formatDistanceToNow(message.createdAt, { addSuffix: true })}
        </span>
      </div>
    </div>
  );
};

export default Message;
