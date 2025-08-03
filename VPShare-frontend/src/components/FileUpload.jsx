import React from 'react';
import { Box, Button, TextField, Typography, Paper, Stack, Divider } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

// We'll continue passing the selected file's name to display in the UI
function FileUpload({ onFileChange, jd, setJD, disabled, selectedFileName }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 4 }, // Responsive padding
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
        borderRadius: '8px',
      }}
    >
      <Stack spacing={3} divider={<Divider />}>
        {/* Step 1: Upload Resume */}
        <Box>
          <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 'bold', color: 'var(--text-primary)' }}>
            1. Upload Your Resume
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <Button
              component="label"
              variant="contained"
              disabled={disabled}
              startIcon={<CloudUploadIcon />}
              sx={{
                flexShrink: 0, // Prevent the button from shrinking
                color: 'white',
                background: 'var(--text-primary)',
                '&:hover': {
                  background: 'var(--text-secondary)',
                }
              }}
            >
              Choose File
              <input type="file" hidden accept=".pdf,.docx" onChange={onFileChange} />
            </Button>
            <Typography 
              variant="body1" 
              color="text.secondary"
              noWrap
              sx={{ minWidth: 0 }} // Allow text to be truncated
            >
              {selectedFileName || 'No file selected.'}
            </Typography>
          </Stack>
        </Box>

        {/* Step 2: Paste Job Description */}
        <Box>
           <Typography variant="h6" component="h3" sx={{ mb: 1, fontWeight: 'bold', color: 'var(--text-primary)' }}>
            2. Paste Job Description
          </Typography>
          <TextField
            fullWidth
            label="Job Description"
            value={jd}
            onChange={e => setJD(e.target.value)}
            disabled={disabled}
            multiline
            rows={15}
            placeholder="Paste the full job description here to analyze..."
            sx={{
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'var(--primary-gradient-start)', // Custom focus color
              },
            }}
          />
        </Box>
      </Stack>
    </Paper>
  );
}

export default FileUpload;