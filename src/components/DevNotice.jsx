import React from 'react';
import { Alert, Box, IconButton, Collapse } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const DevNotice = ({ show, onDismiss, message, severity = 'info' }) => {
  return (
    <Collapse in={show}>
      <Box sx={{ mb: 2 }}>
        <Alert 
          severity={severity}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={onDismiss}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {message || 'Development notice: Some features may be temporarily unavailable.'}
        </Alert>
      </Box>
    </Collapse>
  );
};

export default DevNotice;
