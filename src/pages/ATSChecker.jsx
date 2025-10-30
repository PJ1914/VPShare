import React, { useState } from 'react';
import { Container, Typography, Box, Button, CircularProgress, Alert, Snackbar } from '@mui/material';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import RefreshIcon from '@mui/icons-material/Refresh';

import FileUpload from '../components/FileUpload';
import ATSResultCard from '../components/ATSResultCard';
import { analyzeResumeWithATS } from '../utils/atsApi';

function ATSChecker() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [atsResult, setAtsResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a PDF or DOCX file only.');
        return;
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError('File size must be less than 5MB.');
        return;
      }

      setResumeFile(file);
      setError('');
    }
  };

  const handleSubmit = async () => {
    // Clear previous results and errors
    setError('');
    setAtsResult(null);
    setSuccessMessage('');
    
    // Validate inputs
    if (!resumeFile) {
      setError("Please upload your resume file.");
      return;
    }
    
    if (!jobDescription.trim()) {
      setError("Please paste the job description.");
      return;
    }

    if (jobDescription.trim().length < 50) {
      setError("Job description seems too short. Please provide a more detailed job description.");
      return;
    }
    
    setIsLoading(true);

    try {
      const result = await analyzeResumeWithATS(resumeFile, jobDescription);
      setAtsResult(result);
      setSuccessMessage('Resume analysis completed successfully!');
      
      // Scroll to results
      setTimeout(() => {
        const resultsElement = document.getElementById('ats-results');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      
    } catch (error) {
      console.error("ATS analysis failed:", error);
      setError(error.message || "An error occurred during analysis. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResumeFile(null);
    setJobDescription('');
    setAtsResult(null);
    setError('');
    setSuccessMessage('');
    
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const canSubmit = resumeFile && jobDescription.trim() && !isLoading;

  return (
    <Box sx={{ background: '#f9fafb', py: 5, minHeight: '100vh' }}>
      <Container maxWidth="lg">
        {/* Page Header */}
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', color: 'var(--text-primary)' }} gutterBottom>
            ATS Resume Checker
          </Typography>
          <Typography variant="h6" sx={{ color: 'var(--text-secondary)', maxWidth: '700px', margin: 'auto' }}>
            Optimize your resume for Applicant Tracking Systems. Get detailed analysis, keyword matching, and improvement suggestions.
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* File Upload Component */}
        <Box sx={{ mb: 4 }}>
          <FileUpload 
            onFileChange={handleFileChange} 
            jd={jobDescription} 
            setJD={setJobDescription}
            disabled={isLoading}
            selectedFileName={resumeFile ? resumeFile.name : ''}
          />
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 5 }}>
          <Button
            size="large"
            disabled={!canSubmit}
            startIcon={isLoading ? <CircularProgress size={24} color="inherit" /> : <AnalyticsIcon />}
            onClick={handleSubmit}
            sx={{
              color: 'white',
              textTransform: 'none',
              fontWeight: 'bold',
              py: 1.5,
              px: 6,
              fontSize: '1.1rem',
              background: 'linear-gradient(to right, var(--primary-gradient-start), var(--primary-gradient-end))',
              '&:hover': {
                opacity: 0.9,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
              },
              '&.Mui-disabled': {
                background: '#dbeafe',
                color: '#9ca3af',
              }
            }}
          >
            {isLoading ? 'Analyzing Resume...' : 'Analyze My Resume'}
          </Button>

          {(resumeFile || jobDescription || atsResult) && !isLoading && (
            <Button
              size="large"
              startIcon={<RefreshIcon />}
              onClick={handleReset}
              sx={{
                color: 'var(--text-primary)',
                textTransform: 'none',
                fontWeight: 'bold',
                py: 1.5,
                px: 4,
                fontSize: '1.1rem',
                border: '2px solid var(--primary-gradient-start)',
                '&:hover': {
                  backgroundColor: 'var(--primary-gradient-start)',
                  color: 'white',
                },
              }}
            >
              Start Over
            </Button>
          )}
        </Box>

        {/* Progress Indicator */}
        {isLoading && (
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="body1" sx={{ color: 'var(--text-secondary)', mb: 2 }}>
              Processing your resume... This may take a few moments.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                Analyzing keywords, formatting, and content structure
              </Typography>
            </Box>
          </Box>
        )}

        {/* Result Card Section */}
        {(isLoading || atsResult) && (
          <Box id="ats-results">
            <ATSResultCard result={atsResult} isLoading={isLoading} />
          </Box>
        )}

        {/* Success Snackbar */}
        <Snackbar
          open={!!successMessage}
          autoHideDuration={4000}
          onClose={() => setSuccessMessage('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="success" onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

export default ATSChecker;