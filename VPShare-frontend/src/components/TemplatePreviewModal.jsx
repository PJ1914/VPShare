import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Box, 
  Typography, 
  Paper,
  IconButton,
  Chip,
  Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function TemplatePreviewModal({ open, onClose, template, onSelect }) {
  if (!template) return null;

  const sampleData = {
    name: 'John Doe',
    title: 'Senior Software Engineer',
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/johndoe',
    github: 'github.com/johndoe',
    objective: 'Experienced software engineer with 5+ years in full-stack development, specializing in React and Node.js.',
    skills: 'JavaScript, React, Node.js, Python, AWS, Docker',
    experience: 'Senior Software Engineer at Tech Corp (2020-Present)\n• Led development of customer-facing web applications\n• Improved system performance by 40%\n• Mentored junior developers',
    education: 'Bachelor of Science in Computer Science\nStanford University (2015-2019)\nGPA: 3.8/4.0'
  };

  const getPreviewStyles = () => {
    switch (template.id) {
      case 'latex-modern':
        return {
          paper: {
            fontFamily: '"Inter", "Helvetica", sans-serif',
            lineHeight: 1.6,
            fontSize: '0.7rem',
          },
          header: {
            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
            color: 'white',
            p: 2,
            textAlign: 'center',
          },
          section: {
            borderBottom: '1px solid #2563eb',
            color: '#2563eb',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            mb: 1,
          }
        };
      case 'latex-classic':
        return {
          paper: {
            fontFamily: '"Times New Roman", serif',
            lineHeight: 1.5,
            fontSize: '0.7rem',
          },
          header: {
            textAlign: 'center',
            p: 2,
            borderBottom: '2px solid #000',
          },
          section: {
            borderBottom: '0.5px solid #000',
            color: '#1f2937',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            mb: 1,
          }
        };
      case 'latex-tech':
        return {
          paper: {
            fontFamily: '"JetBrains Mono", "Consolas", monospace',
            lineHeight: 1.7,
            fontSize: '0.65rem',
            backgroundColor: '#f8fafc',
          },
          header: {
            background: 'linear-gradient(135deg, #065f46 0%, #059669 100%)',
            color: 'white',
            p: 2,
            textAlign: 'left',
          },
          section: {
            borderLeft: '4px solid #059669',
            color: '#059669',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            pl: 1,
            mb: 1,
          }
        };
      case 'latex-executive':
        return {
          paper: {
            fontFamily: '"Georgia", serif',
            lineHeight: 1.6,
            fontSize: '0.7rem',
          },
          header: {
            background: 'linear-gradient(135deg, #7c2d12 0%, #dc2626 100%)',
            color: 'white',
            p: 2,
            textAlign: 'center',
          },
          section: {
            background: 'rgba(124, 45, 18, 0.1)',
            color: '#7c2d12',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            px: 1,
            py: 0.5,
            mb: 1,
          }
        };
      case 'latex-academic':
        return {
          paper: {
            fontFamily: '"Times New Roman", serif',
            lineHeight: 1.5,
            fontSize: '0.65rem',
          },
          header: {
            textAlign: 'center',
            p: 1.5,
            borderTop: '3px solid #4338ca',
            borderBottom: '1px solid #4338ca',
          },
          section: {
            borderTop: '1px solid #4338ca',
            borderBottom: '1px solid #4338ca',
            color: '#4338ca',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            textAlign: 'center',
            py: 0.5,
            mb: 1,
          }
        };
      default:
        return {
          paper: {
            fontFamily: '"Inter", "Helvetica", sans-serif',
            lineHeight: 1.6,
            fontSize: '0.7rem',
          },
          header: {
            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
            color: 'white',
            p: 2,
            textAlign: 'center',
          },
          section: {
            borderBottom: '1px solid #2563eb',
            color: '#2563eb',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            mb: 1,
          }
        };
    }
  };

  const styles = getPreviewStyles();

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: template.colorScheme }}>
            {template.name} Preview
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {template.description}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {/* Template Info */}
          <Box sx={{ minWidth: 280 }}>
            <Paper sx={{ p: 2, mb: 2, backgroundColor: `${template.colorScheme}10` }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: template.colorScheme }}>
                Template Features
              </Typography>
              <Stack direction="row" spacing={0.5} useFlexGap flexWrap sx={{ mb: 2 }}>
                {template.features.map((feature, index) => (
                  <Chip
                    key={index}
                    label={feature}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: '0.7rem',
                      borderColor: template.colorScheme,
                      color: template.colorScheme,
                    }}
                  />
                ))}
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                <strong>Best for:</strong> {template.bestFor}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                <strong>Font:</strong> {template.fontFamily}
              </Typography>
            </Paper>

            {template.recommended && (
              <Paper sx={{ p: 2, backgroundColor: '#ff6b3510', border: '1px solid #ff6b3530' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CheckCircleIcon sx={{ color: '#ff6b35', fontSize: '20px' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#ff6b35' }}>
                    Recommended Choice
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  This template is highly recommended for most professional applications and ATS systems.
                </Typography>
              </Paper>
            )}
          </Box>

          {/* Resume Preview */}
          <Box sx={{ flex: 1, minHeight: 600 }}>
            <Paper
              elevation={3}
              sx={{
                borderRadius: '8px',
                overflow: 'hidden',
                height: '600px',
                ...styles.paper,
              }}
            >
              {/* Header */}
              <Box sx={styles.header}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5, fontSize: '1rem' }}>
                  {sampleData.name}
                </Typography>
                <Typography variant="subtitle2" sx={{ opacity: 0.9, fontSize: '0.8rem' }}>
                  {sampleData.title}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 0.5, fontSize: '0.7rem' }}>
                  {sampleData.email} • {sampleData.phone} • {sampleData.location}
                </Typography>
              </Box>

              {/* Content */}
              <Box sx={{ p: 2 }}>
                {/* Professional Summary */}
                <Typography sx={styles.section}>
                  Professional Summary
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary', fontSize: '0.65rem' }}>
                  {sampleData.objective}
                </Typography>

                {/* Skills */}
                <Typography sx={styles.section}>
                  Technical Skills
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary', fontSize: '0.65rem' }}>
                  {sampleData.skills}
                </Typography>

                {/* Experience */}
                <Typography sx={styles.section}>
                  Professional Experience
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary', fontSize: '0.65rem', whiteSpace: 'pre-line' }}>
                  {sampleData.experience}
                </Typography>

                {/* Education */}
                <Typography sx={styles.section}>
                  Education
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.65rem', whiteSpace: 'pre-line' }}>
                  {sampleData.education}
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          sx={{ borderColor: 'text.secondary', color: 'text.secondary' }}
        >
          Close Preview
        </Button>
        <Button 
          onClick={() => {
            onSelect(template.id);
            onClose();
          }}
          variant="contained"
          sx={{ 
            background: `linear-gradient(135deg, ${template.colorScheme} 0%, ${template.colorScheme}dd 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${template.colorScheme}dd 0%, ${template.colorScheme}bb 100%)`,
            }
          }}
        >
          Select This Template
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default TemplatePreviewModal;
