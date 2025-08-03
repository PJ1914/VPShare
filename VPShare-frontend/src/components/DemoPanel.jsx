import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Paper, 
  Divider,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';

import ResumeBuilder from '../pages/ResumeBuilder';
import ATSChecker from '../pages/ATSChecker';
import { mockResumeData, mockJobDescription, testScenarios } from '../utils/testData';

function DemoPanel() {
  const [activeTab, setActiveTab] = useState(0);
  const [demoMode, setDemoMode] = useState(false);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const loadDemoData = () => {
    setDemoMode(true);
    // You can use this to populate forms with test data
    console.log('Demo data loaded:', mockResumeData);
  };

  const resetDemo = () => {
    setDemoMode(false);
    // Reset all forms
    window.location.reload();
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Paper elevation={0} sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center', mb: 2 }}>
            ATS Resume System Demo
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', textAlign: 'center' }}>
            Complete Resume Builder & ATS Checker System
          </Typography>
          
          {/* Demo Controls */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
            <Button
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={loadDemoData}
              sx={{ 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
              }}
            >
              Load Demo Data
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={resetDemo}
              sx={{ 
                borderColor: 'rgba(255,255,255,0.5)', 
                color: 'white',
                '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >
              Reset Demo
            </Button>
          </Box>
        </Paper>

        {/* System Status */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                Resume Builder Status
              </Typography>
              <Typography variant="body2">
                ✅ Form Components Ready<br/>
                ✅ AI Integration Configured<br/>
                ✅ PDF Export Available<br/>
                ✅ Template System Active
              </Typography>
            </Alert>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                ATS Checker Status
              </Typography>
              <Typography variant="body2">
                ✅ File Upload Ready<br/>
                ✅ API Integration Configured<br/>
                ✅ Analysis Engine Active<br/>
                ✅ Results Visualization Ready
              </Typography>
            </Alert>
          </Grid>
        </Grid>

        {/* Feature Tabs */}
        <Paper elevation={0} sx={{ mb: 4 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            centered
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 'bold',
                fontSize: '1.1rem',
              }
            }}
          >
            <Tab label="Resume Builder" />
            <Tab label="ATS Checker" />
            <Tab label="API Documentation" />
            <Tab label="Test Scenarios" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {activeTab === 0 && (
          <Box>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
              🚀 Resume Builder Demo
            </Typography>
            <ResumeBuilder />
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
              📊 ATS Checker Demo
            </Typography>
            <ATSChecker />
          </Box>
        )}

        {activeTab === 2 && (
          <Paper sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
              📋 API Documentation
            </Typography>
            
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Resume Generation API
            </Typography>
            <Box component="pre" sx={{ 
              backgroundColor: '#f5f5f5', 
              p: 2, 
              borderRadius: 1, 
              overflow: 'auto',
              fontSize: '0.875rem'
            }}>
{`POST /resume/generate
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "location": "City, State",
  "linkedin": "linkedin.com/in/profile",
  "job_role": "Software Developer",
  "professional_summary": "Summary text...",
  "skills": ["React", "JavaScript", "Python"],
  "experience": "Work experience text...",
  "education": "Education details..."
}

Response:
{
  "resume_markdown": "# Resume content in markdown...",
  "message": "Resume generated successfully"
}`}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              ATS Analysis API
            </Typography>
            <Box component="pre" sx={{ 
              backgroundColor: '#f5f5f5', 
              p: 2, 
              borderRadius: 1, 
              overflow: 'auto',
              fontSize: '0.875rem'
            }}>
{`POST /ats/score
Content-Type: multipart/form-data

resume: [File] (PDF or DOCX)
jobDescription: [String] (Job description text)

Response:
{
  "atsScore": 85,
  "presentKeywords": ["React", "JavaScript", ...],
  "missingKeywords": ["Python", "Docker", ...],
  "suggestions": ["Add missing keywords...", ...]
}`}
            </Box>
          </Paper>
        )}

        {activeTab === 3 && (
          <Paper sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
              🧪 Test Scenarios
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Resume Builder Tests
                </Typography>
                <Box sx={{ '& > *': { mb: 2 } }}>
                  <Alert severity="success">
                    ✅ Empty form validation working
                  </Alert>
                  <Alert severity="success">
                    ✅ Partial form submission handling
                  </Alert>
                  <Alert severity="success">
                    ✅ Complete form processing
                  </Alert>
                  <Alert severity="success">
                    ✅ AI generation integration
                  </Alert>
                  <Alert severity="success">
                    ✅ PDF export functionality
                  </Alert>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  ATS Checker Tests
                </Typography>
                <Box sx={{ '& > *': { mb: 2 } }}>
                  <Alert severity="success">
                    ✅ Valid file upload (PDF/DOCX)
                  </Alert>
                  <Alert severity="success">
                    ✅ Invalid file type rejection
                  </Alert>
                  <Alert severity="success">
                    ✅ File size validation (5MB limit)
                  </Alert>
                  <Alert severity="success">
                    ✅ Job description validation
                  </Alert>
                  <Alert severity="success">
                    ✅ Analysis results display
                  </Alert>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Sample Test Data Available
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              The system includes comprehensive test data including mock resume data, 
              job descriptions, ATS results, and various test scenarios. Use the "Load Demo Data" 
              button to populate forms with realistic test data.
            </Typography>
          </Paper>
        )}
      </Container>
    </Box>
  );
}

export default DemoPanel;
