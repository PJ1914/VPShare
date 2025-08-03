import React from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Grid
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  LinkedIn as LinkedInIcon,
  Language as WebsiteIcon,
  Work as WorkIcon,
  AutoAwesome as AIIcon
} from '@mui/icons-material';

const ContactSectionNew = ({ data, updateData, onAIOptimize }) => {
  const handleInputChange = (field, value) => {
    updateData(field, value);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          Contact Information
        </Typography>
        <IconButton 
          size="small" 
          onClick={() => onAIOptimize('contact')}
          sx={{ color: 'primary.main' }}
        >
          <AIIcon />
        </IconButton>
      </Box>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="First Name"
            placeholder="John"
            value={data.firstName || ''}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            InputProps={{
              startAdornment: <PersonIcon sx={{ color: 'text.secondary', mr: 1 }} />
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Last Name"
            placeholder="Doe"
            value={data.lastName || ''}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            InputProps={{
              startAdornment: <PersonIcon sx={{ color: 'text.secondary', mr: 1 }} />
            }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Job Title"
            placeholder="Senior Software Engineer"
            value={data.jobTitle || ''}
            onChange={(e) => handleInputChange('jobTitle', e.target.value)}
            InputProps={{
              startAdornment: <WorkIcon sx={{ color: 'text.secondary', mr: 1 }} />
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email"
            placeholder="john.doe@example.com"
            type="email"
            value={data.email || ''}
            onChange={(e) => handleInputChange('email', e.target.value)}
            InputProps={{
              startAdornment: <EmailIcon sx={{ color: 'text.secondary', mr: 1 }} />
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Phone"
            placeholder="+1 (555) 123-4567"
            value={data.phone || ''}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            InputProps={{
              startAdornment: <PhoneIcon sx={{ color: 'text.secondary', mr: 1 }} />
            }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Location"
            placeholder="San Francisco, CA"
            value={data.location || ''}
            onChange={(e) => handleInputChange('location', e.target.value)}
            InputProps={{
              startAdornment: <LocationIcon sx={{ color: 'text.secondary', mr: 1 }} />
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="LinkedIn"
            placeholder="linkedin.com/in/johndoe"
            value={data.linkedin || ''}
            onChange={(e) => handleInputChange('linkedin', e.target.value)}
            InputProps={{
              startAdornment: <LinkedInIcon sx={{ color: 'text.secondary', mr: 1 }} />
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Website"
            placeholder="johndoe.dev"
            value={data.website || ''}
            onChange={(e) => handleInputChange('website', e.target.value)}
            InputProps={{
              startAdornment: <WebsiteIcon sx={{ color: 'text.secondary', mr: 1 }} />
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ContactSectionNew;
