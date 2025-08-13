import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Grid,
  Paper,
  Button,
  Chip,
  Tooltip,
  Alert,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  LinkedIn as LinkedInIcon,
  Language as WebsiteIcon,
  Work as WorkIcon,
  AutoAwesome as AIIcon,
  GitHub as GitHubIcon,
  Folder as PortfolioIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const ContactSectionEnhanced = ({ data, updateData, onAIOptimize, aiSuggestions, validationErrors, loading }) => {
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [completionStatus, setCompletionStatus] = useState({});

  useEffect(() => {
    // Calculate completion status for each field
    const status = {
      firstName: !!data.firstName?.trim(),
      lastName: !!data.lastName?.trim(),
      email: !!data.email?.trim(),
      phone: !!data.phone?.trim(),
      location: !!data.location?.trim(),
      jobTitle: !!data.jobTitle?.trim(),
      linkedin: !!data.linkedin?.trim(),
      github: !!data.github?.trim(),
      website: !!data.website?.trim(),
      portfolio: !!data.portfolio?.trim()
    };
    setCompletionStatus(status);
  }, [data]);

  const handleInputChange = (field, value) => {
    updateData(field, value);
  };

  const getFieldIcon = (fieldName) => {
    const icons = {
      firstName: <PersonIcon />,
      lastName: <PersonIcon />,
      email: <EmailIcon />,
      phone: <PhoneIcon />,
      location: <LocationIcon />,
      jobTitle: <WorkIcon />,
      linkedin: <LinkedInIcon />,
      github: <GitHubIcon />,
      website: <WebsiteIcon />,
      portfolio: <PortfolioIcon />
    };
    return icons[fieldName] || <PersonIcon />;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s|-|\(|\)/g, ''));
  };

  const validateURL = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const getFieldValidation = (fieldName, value) => {
    if (!value?.trim()) return null;
    
    switch (fieldName) {
      case 'email':
        return validateEmail(value) ? 'success' : 'error';
      case 'phone':
        return validatePhone(value) ? 'success' : 'error';
      case 'linkedin':
      case 'github':
      case 'website':
      case 'portfolio':
        return validateURL(value) ? 'success' : 'error';
      default:
        return value.trim().length > 0 ? 'success' : null;
    }
  };

  const requiredFields = [
    { name: 'firstName', label: 'First Name', placeholder: 'John', required: true },
    { name: 'lastName', label: 'Last Name', placeholder: 'Doe', required: true },
    { name: 'email', label: 'Email Address', placeholder: 'john.doe@example.com', required: true },
    { name: 'phone', label: 'Phone Number', placeholder: '+1 (555) 123-4567', required: true },
    { name: 'location', label: 'Location', placeholder: 'New York, NY', required: false },
    { name: 'jobTitle', label: 'Job Title', placeholder: 'Software Engineer', required: false }
  ];

  const optionalFields = [
    { name: 'linkedin', label: 'LinkedIn Profile', placeholder: 'https://linkedin.com/in/johndoe' },
    { name: 'github', label: 'GitHub Profile', placeholder: 'https://github.com/johndoe' },
    { name: 'website', label: 'Personal Website', placeholder: 'https://johndoe.com' },
    { name: 'portfolio', label: 'Portfolio', placeholder: 'https://portfolio.johndoe.com' }
  ];

  const completedRequired = requiredFields.filter(field => 
    field.required && completionStatus[field.name]
  ).length;
  const totalRequired = requiredFields.filter(field => field.required).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box>
        {/* Header with AI Optimize */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Contact Information
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                {completedRequired}/{totalRequired} required fields completed
              </Typography>
              {completedRequired === totalRequired && (
                <CheckCircleIcon sx={{ color: 'success.main', fontSize: 16 }} />
              )}
            </Box>
          </Box>
          
          <Tooltip title="Optimize with AI">
            <IconButton 
              size="small" 
              onClick={() => onAIOptimize('contact')}
              disabled={loading}
              sx={{ 
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.light',
                  color: 'white'
                }
              }}
            >
              <AIIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* AI Suggestions */}
        <AnimatePresence>
          {aiSuggestions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Alert 
                severity="info" 
                sx={{ mb: 3 }}
                icon={<AIIcon />}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  AI Suggestions:
                </Typography>
                <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                  {aiSuggestions.map((suggestion, index) => (
                    <Typography component="li" variant="body2" key={index}>
                      {suggestion}
                    </Typography>
                  ))}
                </Box>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Required Fields */}
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Essential Information
          </Typography>
          
          <Grid container spacing={2}>
            {requiredFields.map((field) => (
              <Grid item xs={12} sm={field.name === 'jobTitle' ? 12 : 6} key={field.name}>
                <TextField
                  fullWidth
                  label={field.label}
                  placeholder={field.placeholder}
                  value={data[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  required={field.required}
                  error={!!validationErrors?.[field.name]}
                  helperText={validationErrors?.[field.name]}
                  InputProps={{
                    startAdornment: React.cloneElement(getFieldIcon(field.name), {
                      sx: { color: 'text.secondary', mr: 1, fontSize: 20 }
                    }),
                    endAdornment: completionStatus[field.name] && (
                      <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: getFieldValidation(field.name, data[field.name]) === 'success' 
                          ? 'success.main' 
                          : getFieldValidation(field.name, data[field.name]) === 'error'
                          ? 'error.main'
                          : 'primary.main'
                      }
                    }
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Optional Fields */}
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              cursor: 'pointer',
              mb: showOptionalFields ? 2 : 0
            }}
            onClick={() => setShowOptionalFields(!showOptionalFields)}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                Additional Information
              </Typography>
              <Typography variant="body2" color="text.secondary">
                LinkedIn, GitHub, websites, and more
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip 
                label={`${optionalFields.filter(f => completionStatus[f.name]).length}/${optionalFields.length} completed`}
                size="small"
                color={optionalFields.filter(f => completionStatus[f.name]).length > 0 ? 'success' : 'default'}
              />
              {showOptionalFields ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Box>
          </Box>
          
          <Collapse in={showOptionalFields}>
            <Grid container spacing={2}>
              {optionalFields.map((field) => (
                <Grid item xs={12} sm={6} key={field.name}>
                  <TextField
                    fullWidth
                    label={field.label}
                    placeholder={field.placeholder}
                    value={data[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    InputProps={{
                      startAdornment: React.cloneElement(getFieldIcon(field.name), {
                        sx: { color: 'text.secondary', mr: 1, fontSize: 20 }
                      }),
                      endAdornment: completionStatus[field.name] && (
                        <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: getFieldValidation(field.name, data[field.name]) === 'success' 
                            ? 'success.main' 
                            : getFieldValidation(field.name, data[field.name]) === 'error'
                            ? 'error.main'
                            : 'primary.main'
                        }
                      }
                    }}
                  />
                </Grid>
              ))}
            </Grid>
            
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                Adding professional links increases your resume score and showcases your online presence
              </Typography>
            </Box>
          </Collapse>
        </Paper>

        {/* Target Role and Industry */}
        <Paper variant="outlined" sx={{ p: 3, mt: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Career Focus
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Help AI optimize your resume for specific roles and industries
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Target Role"
                placeholder="e.g., Software Engineer, Product Manager"
                value={data.targetRole || ''}
                onChange={(e) => handleInputChange('targetRole', e.target.value)}
                InputProps={{
                  startAdornment: <WorkIcon sx={{ color: 'text.secondary', mr: 1 }} />
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Industry"
                placeholder="e.g., Technology, Healthcare, Finance"
                value={data.industry || ''}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                InputProps={{
                  startAdornment: <WorkIcon sx={{ color: 'text.secondary', mr: 1 }} />
                }}
              />
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </motion.div>
  );
};

export default ContactSectionEnhanced;
