import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import SendIcon from '@mui/icons-material/Send';
import StopIcon from '@mui/icons-material/Stop';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CircularProgress from '@mui/material/CircularProgress';
import Popover from '@mui/material/Popover';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

const ChatInput = ({ 
  onSendMessage,
  onStop,
  loading,
  isAwaitingBot,
  pendingBotText,
  inputRef
}) => {
  const [input, setInput] = useState('');
  const [style, setStyle] = useState('auto');
  const [language, setLanguage] = useState('en');
  const [anchorEl, setAnchorEl] = useState(null);

  const handleSend = () => {
    if (!input.trim() || loading || isAwaitingBot || pendingBotText) return;
    
    onSendMessage(input, { style, language });
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey && !loading && !isAwaitingBot && !pendingBotText) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <div className="chat-input">
      <TextField
        inputRef={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
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
            borderRadius: '20px',
            background: 'var(--background-light)',
            fontSize: '14px',
            padding: '10px 14px',
            minHeight: '52px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'var(--border-color)',
              borderWidth: '1.5px',
              transition: 'all 0.2s ease',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'var(--primary-gradient-start)',
              borderWidth: '2px',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'var(--primary-gradient-start)',
              borderWidth: '2px',
              boxShadow: '0 0 0 3px rgba(30, 64, 175, 0.1)',
            },
          },
          startAdornment: (
            <InputAdornment position="start">
              <IconButton
                onClick={handlePopoverOpen}
                aria-label="Open response options"
                sx={{ 
                  p: 1.2,
                  minWidth: '48px',
                  minHeight: '48px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: 'rgba(30, 64, 175, 0.08)',
                    transform: 'scale(1.05)',
                  }
                }}
              >
                <ExpandLessIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                className={`send-stop-button ${isAwaitingBot ? 'loading' : ''}`}
                onClick={isAwaitingBot ? onStop : handleSend}
                disabled={!input.trim() && !isAwaitingBot}
                aria-label={isAwaitingBot ? 'Stop response' : 'Send message'}
                sx={{
                  minWidth: '48px',
                  minHeight: '48px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: 'rgba(30, 64, 175, 0.08)',
                    transform: 'scale(1.05)',
                  },
                  '&:disabled': {
                    opacity: 0.4,
                    transform: 'none',
                  }
                }}
              >
                {isAwaitingBot ? (
                  <div style={{ position: 'relative', width: '20px', height: '20px' }}>
                    <StopIcon fontSize="small" />
                    <CircularProgress 
                      className="overlay-spinner" 
                      size={20} 
                      thickness={2}
                    />
                  </div>
                ) : (
                  <SendIcon fontSize="small" />
                )}
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
            padding: 'clamp(16px, 4vw, 24px)',
            borderRadius: 'clamp(8px, 2vw, 12px)',
            background: '#ffffff',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05)',
            width: 'clamp(280px, 85vw, 380px)',
            maxWidth: '95vw',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            animation: 'popover-pop 0.15s ease-out',
            overflow: 'visible',
            margin: '8px',
          },
        }}
      >
        <div className="chat-options">
          <FormControl variant="outlined" size="small" fullWidth sx={{ mb: 'clamp(12px, 3vw, 20px)' }}>
            <InputLabel>Response Style</InputLabel>
            <Select
              label="Response Style"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
            >
              <MenuItem value="auto">Auto (Recommended)</MenuItem>
              <MenuItem value="detailed">Detailed</MenuItem>
              <MenuItem value="short">Short</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl variant="outlined" size="small" fullWidth>
            <InputLabel>Language</InputLabel>
            <Select
              label="Language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="hi">Hindi</MenuItem>
              <MenuItem value="te">Telugu</MenuItem>
            </Select>
          </FormControl>
        </div>
      </Popover>
    </div>
  );
};

export default ChatInput;
