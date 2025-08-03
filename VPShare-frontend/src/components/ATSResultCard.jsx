import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Stack,
  Chip,
  LinearProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssessmentIcon from '@mui/icons-material/Assessment';

function ATSResultCard({ result, isLoading }) {
  // Modern loading state
  if (isLoading) {
    return (
      <Paper 
        elevation={0}
        sx={{
          p: { xs: 2, md: 4 },
          boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          textAlign: 'center',
        }}
      >
        <Stack spacing={3} alignItems="center">
          <CircularProgress size={60} sx={{ color: 'var(--primary-gradient-start)'}} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'var(--text-primary)', mb: 1 }}>
              Analyzing Your Resume
            </Typography>
            <Typography variant="body1" sx={{ color: 'var(--text-secondary)', mb: 2 }}>
              Our AI is examining your resume against the job requirements...
            </Typography>
            <LinearProgress 
              sx={{ 
                width: '300px', 
                height: '6px', 
                borderRadius: '3px',
                backgroundColor: '#e5e7eb',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: 'var(--primary-gradient-start)',
                },
              }} 
            />
          </Box>
        </Stack>
      </Paper>
    );
  }

  if (!result) return null;

  // Determine score color based on percentage
  const getScoreColor = (score) => {
    if (score >= 80) return '#22c55e'; // green
    if (score >= 60) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  // Determine score status
  const getScoreStatus = (score) => {
    if (score >= 80) return { text: 'Excellent Match', color: '#22c55e' };
    if (score >= 60) return { text: 'Good Match', color: '#f59e0b' };
    if (score >= 40) return { text: 'Fair Match', color: '#f59e0b' };
    return { text: 'Needs Improvement', color: '#ef4444' };
  };

  const scoreColor = getScoreColor(result.atsScore);
  const scoreStatus = getScoreStatus(result.atsScore);

  return (
    <Paper 
      elevation={0}
      sx={{
        p: { xs: 2, md: 4 },
        boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
      }}
    >
      {/* Header Section */}
      <Grid container spacing={3} alignItems="center" sx={{ mb: 4 }}>
        {/* Score Visualization */}
        <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress
              variant="determinate"
              value={100}
              size={160}
              thickness={3}
              sx={{ color: 'rgba(0, 0, 0, 0.1)' }}
            />
            <CircularProgress
              variant="determinate"
              value={result.atsScore}
              size={160}
              thickness={3}
              sx={{
                color: scoreColor,
                position: 'absolute',
                left: 0,
              }}
            />
            <Box
              sx={{
                top: 0, left: 0, bottom: 0, right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
              }}
            >
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: scoreColor }}>
                {`${Math.round(result.atsScore)}%`}
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                ATS Score
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Score Details */}
        <Grid item xs={12} sm={8}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>
                Analysis Complete
              </Typography>
              <Chip 
                label={scoreStatus.text}
                sx={{ 
                  backgroundColor: scoreStatus.color,
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.875rem',
                }}
              />
            </Box>
            <Typography variant="h6" sx={{ color: 'var(--text-secondary)' }}>
              Your resume has been analyzed against the job requirements. Here's how to improve your match rate.
            </Typography>
            
            {/* Quick Stats */}
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0369a1' }}>
                    {result.presentKeywords?.length || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#0369a1' }}>
                    Matched Keywords
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#fef3c7', borderRadius: '8px' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#d97706' }}>
                    {result.missingKeywords?.length || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#d97706' }}>
                    Missing Keywords
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f3e8ff', borderRadius: '8px' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#7c3aed' }}>
                    {result.suggestions?.length || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#7c3aed' }}>
                    Suggestions
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Stack>
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 4 }} />

      {/* Detailed Analysis */}
      <Grid container spacing={4}>
        {/* Matched Keywords */}
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon sx={{ color: '#22c55e' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>
              Matched Keywords
            </Typography>
          </Box>
          {result.presentKeywords && result.presentKeywords.length > 0 ? (
            <Box sx={{ maxHeight: '200px', overflowY: 'auto' }}>
              <List dense>
                {result.presentKeywords.map((item, i) => (
                  <ListItem key={i} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckCircleIcon sx={{ color: '#22c55e', fontSize: '1.2rem' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={item} 
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              No matching keywords found.
            </Typography>
          )}
        </Grid>

        {/* Missing Keywords */}
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CancelIcon sx={{ color: '#ef4444' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>
              Missing Keywords
            </Typography>
          </Box>
          {result.missingKeywords && result.missingKeywords.length > 0 ? (
            <Box sx={{ maxHeight: '200px', overflowY: 'auto' }}>
              <List dense>
                {result.missingKeywords.map((item, i) => (
                  <ListItem key={i} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CancelIcon sx={{ color: '#ef4444', fontSize: '1.2rem' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={item} 
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              Great! No critical keywords are missing.
            </Typography>
          )}
        </Grid>

        {/* Improvement Suggestions */}
        <Grid item xs={12}>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <LightbulbIcon sx={{ color: '#f59e0b' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>
              Improvement Suggestions
            </Typography>
          </Box>
          {result.suggestions && result.suggestions.length > 0 ? (
            <List dense>
              {result.suggestions.map((item, i) => (
                <ListItem key={i} sx={{ py: 1, alignItems: 'flex-start' }}>
                  <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                    <TrendingUpIcon sx={{ color: '#f59e0b', fontSize: '1.2rem' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={item} 
                    primaryTypographyProps={{ variant: 'body2', lineHeight: 1.5 }}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              Your resume looks great! No specific improvements needed.
            </Typography>
          )}
        </Grid>
      </Grid>

      {/* Action Items */}
      <Box sx={{ mt: 4, p: 3, backgroundColor: '#f8fafc', borderRadius: '8px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <AssessmentIcon sx={{ color: 'var(--primary-gradient-start)' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>
            Next Steps
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {result.atsScore >= 80 
            ? "Excellent! Your resume is well-optimized for this job. Consider applying with confidence."
            : result.atsScore >= 60
            ? "Good match! Consider incorporating some of the missing keywords naturally into your resume."
            : "Your resume needs optimization. Focus on adding the missing keywords and following the improvement suggestions."}
        </Typography>
      </Box>
    </Paper>
  );
}

export default ATSResultCard;