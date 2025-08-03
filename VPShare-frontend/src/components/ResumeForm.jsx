import React from 'react';
import { Box, TextField, Typography, InputAdornment, Paper, Divider, Grid } from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import WorkIcon from '@mui/icons-material/Work';
import DescriptionIcon from '@mui/icons-material/Description';
import BuildIcon from '@mui/icons-material/Build';
import SchoolIcon from '@mui/icons-material/School';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import LanguageIcon from '@mui/icons-material/Language';
import TwitterIcon from '@mui/icons-material/Twitter';
import ArticleIcon from '@mui/icons-material/Article';
import CodeIcon from '@mui/icons-material/Code';

function ResumeForm({ formData, setFormData, section = 'all' }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const focusStyles = {
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: 'var(--primary-gradient-start)',
    },
  };

  // Section-specific rendering
  const renderPersonalSection = () => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          variant="outlined"
          placeholder="e.g., John Doe"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AccountCircle sx={{ color: 'var(--primary-gradient-start)' }} />
              </InputAdornment>
            ),
          }}
          sx={focusStyles}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Professional Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          variant="outlined"
          placeholder="e.g., Senior Software Engineer"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <WorkIcon sx={{ color: 'var(--primary-gradient-start)' }} />
              </InputAdornment>
            ),
          }}
          sx={focusStyles}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Professional Summary"
          name="objective"
          value={formData.objective}
          onChange={handleChange}
          variant="outlined"
          multiline
          rows={4}
          placeholder="Brief summary of your professional experience and career objectives..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                <DescriptionIcon sx={{ color: 'var(--primary-gradient-start)' }} />
              </InputAdornment>
            ),
          }}
          sx={focusStyles}
        />
      </Grid>
    </Grid>
  );

  const renderContactSection = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          variant="outlined"
          placeholder="john.doe@email.com"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon sx={{ color: 'var(--primary-gradient-start)' }} />
              </InputAdornment>
            ),
          }}
          sx={focusStyles}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Phone Number"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          variant="outlined"
          placeholder="+1 (555) 123-4567"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PhoneIcon sx={{ color: 'var(--primary-gradient-start)' }} />
              </InputAdornment>
            ),
          }}
          sx={focusStyles}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          variant="outlined"
          placeholder="City, State, Country"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocationOnIcon sx={{ color: 'var(--primary-gradient-start)' }} />
              </InputAdornment>
            ),
          }}
          sx={focusStyles}
        />
      </Grid>
      
      {/* Professional Links */}
      <Grid item xs={12}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: 'text.primary' }}>
          Professional Links
        </Typography>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="LinkedIn"
          name="linkedin"
          value={formData.linkedin}
          onChange={handleChange}
          variant="outlined"
          placeholder="linkedin.com/in/johndoe"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LinkedInIcon sx={{ color: 'var(--primary-gradient-start)' }} />
              </InputAdornment>
            ),
          }}
          sx={focusStyles}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="GitHub"
          name="github"
          value={formData.github}
          onChange={handleChange}
          variant="outlined"
          placeholder="github.com/johndoe"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <GitHubIcon sx={{ color: 'var(--primary-gradient-start)' }} />
              </InputAdornment>
            ),
          }}
          sx={focusStyles}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Personal Website"
          name="website"
          value={formData.website}
          onChange={handleChange}
          variant="outlined"
          placeholder="www.johndoe.com"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LanguageIcon sx={{ color: 'var(--primary-gradient-start)' }} />
              </InputAdornment>
            ),
          }}
          sx={focusStyles}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Portfolio"
          name="portfolio"
          value={formData.portfolio}
          onChange={handleChange}
          variant="outlined"
          placeholder="portfolio.johndoe.com"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CodeIcon sx={{ color: 'var(--primary-gradient-start)' }} />
              </InputAdornment>
            ),
          }}
          sx={focusStyles}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Twitter"
          name="twitter"
          value={formData.twitter}
          onChange={handleChange}
          variant="outlined"
          placeholder="twitter.com/johndoe"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <TwitterIcon sx={{ color: 'var(--primary-gradient-start)' }} />
              </InputAdornment>
            ),
          }}
          sx={focusStyles}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Blog"
          name="blog"
          value={formData.blog}
          onChange={handleChange}
          variant="outlined"
          placeholder="blog.johndoe.com"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <ArticleIcon sx={{ color: 'var(--primary-gradient-start)' }} />
              </InputAdornment>
            ),
          }}
          sx={focusStyles}
        />
      </Grid>
    </Grid>
  );

  const renderExperienceSection = () => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Professional Experience"
          name="experience"
          value={formData.experience}
          onChange={handleChange}
          variant="outlined"
          multiline
          rows={8}
          placeholder="Job Title at Company Name (Start Date - End Date)
• Key responsibility or achievement
• Another responsibility with quantified results
• Notable accomplishment

Previous Job Title at Previous Company (Start Date - End Date)
• Key accomplishment
• Responsibility with metrics"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                <WorkIcon sx={{ color: 'var(--primary-gradient-start)' }} />
              </InputAdornment>
            ),
          }}
          sx={focusStyles}
        />
      </Grid>
    </Grid>
  );

  const renderEducationSection = () => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Education"
          name="education"
          value={formData.education}
          onChange={handleChange}
          variant="outlined"
          multiline
          rows={4}
          placeholder="Degree Name, Major
University Name, Location (Graduation Year)
GPA: X.X/4.0 (if notable)
Relevant coursework, honors, or achievements"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                <SchoolIcon sx={{ color: 'var(--primary-gradient-start)' }} />
              </InputAdornment>
            ),
          }}
          sx={focusStyles}
        />
      </Grid>
    </Grid>
  );

  const renderSkillsSection = () => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Skills & Technologies"
          name="skills"
          value={formData.skills}
          onChange={handleChange}
          variant="outlined"
          multiline
          rows={3}
          placeholder="JavaScript, React, Node.js, Python, AWS, Docker, SQL, Git, Agile"
          helperText="Separate skills with commas for better formatting"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                <BuildIcon sx={{ color: 'var(--primary-gradient-start)' }} />
              </InputAdornment>
            ),
          }}
          sx={focusStyles}
        />
      </Grid>
    </Grid>
  );

  // Render based on section prop
  if (section === 'personal') return renderPersonalSection();
  if (section === 'contact') return renderContactSection();
  if (section === 'experience') return renderExperienceSection();
  if (section === 'education') return renderEducationSection();
  if (section === 'skills') return renderSkillsSection();

  // Default: render full form (for backward compatibility)
  return (
    <Paper 
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
        borderRadius: '8px',
      }}
    >
      <Box component="form" noValidate autoComplete="off">
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: 'var(--text-primary)' }}>
          Professional Resume Details
        </Typography>
        
        {/* Personal Information Section */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: '600', color: 'var(--text-primary)' }}>
          Personal Information
        </Typography>
        {renderPersonalSection()}
        
        <Divider sx={{ my: 3 }} />
        
        {/* Contact Information Section */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: '600', color: 'var(--text-primary)' }}>
          Contact & Professional Links
        </Typography>
        {renderContactSection()}
        
        <Divider sx={{ my: 3 }} />
        
        {/* Experience Section */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: '600', color: 'var(--text-primary)' }}>
          Professional Experience
        </Typography>
        {renderExperienceSection()}
        
        <Divider sx={{ my: 3 }} />
        
        {/* Education Section */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: '600', color: 'var(--text-primary)' }}>
          Education
        </Typography>
        {renderEducationSection()}
        
        <Divider sx={{ my: 3 }} />
        
        {/* Skills Section */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: '600', color: 'var(--text-primary)' }}>
          Skills & Technologies
        </Typography>
        {renderSkillsSection()}
      </Box>
    </Paper>
  );
}

export default ResumeForm;
