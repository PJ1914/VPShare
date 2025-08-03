import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  Paper, 
  Button, 
  Fade,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import {
  Person as PersonIcon,
  Work as WorkIcon,
  School as EducationIcon,
  Code as SkillsIcon,
  Assignment as ProjectsIcon,
  Language as LanguageIcon,
  CardMembership as CertificateIcon,
  Description as SummaryIcon,
  Download as DownloadIcon,
  AutoAwesome as AIIcon
} from '@mui/icons-material';

// Import all section components
import ContactSectionNew from '../components/sections/ContactSectionNew';
import SummarySection from '../components/sections/SummarySection';
import ExperienceSection from '../components/sections/ExperienceSection';
import EducationSection from '../components/sections/EducationSection';
import SkillsSection from '../components/sections/SkillsSection';
import ProjectsSection from '../components/sections/ProjectsSection';
import CertificatesSection from '../components/sections/CertificatesSection';
import LanguagesSection from '../components/sections/LanguagesSection';
import ResumePreview from '../components/ResumePreview';
import { aiService } from '../utils/aiService';

function ResumeBuilder() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState('latex-modern');
  const [resumeData, setResumeData] = useState({
    // Contact Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: '',
    jobTitle: '',
    
    // Summary
    summary: '',
    
    // Experience
    experiences: [],
    
    // Education
    education: [],
    
    // Skills
    skills: [],
    
    // Projects
    projects: [],
    
    // Certificates
    certificates: [],
    
    // Languages
    languages: []
  });

  const tabsData = [
    { label: 'Contact', icon: <PersonIcon />, component: ContactSectionNew },
    { label: 'Summary', icon: <SummaryIcon />, component: SummarySection },
    { label: 'Experience', icon: <WorkIcon />, component: ExperienceSection },
    { label: 'Education', icon: <EducationIcon />, component: EducationSection },
    { label: 'Skills', icon: <SkillsIcon />, component: SkillsSection },
    { label: 'Projects', icon: <ProjectsIcon />, component: ProjectsSection },
    { label: 'Certificates', icon: <CertificateIcon />, component: CertificatesSection },
    { label: 'Languages', icon: <LanguageIcon />, component: LanguagesSection },
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const updateResumeData = (section, data) => {
    setResumeData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  const handleAIOptimize = async (section) => {
    try {
      const optimizedData = await aiService.optimizeSection(section, resumeData[section]);
      updateResumeData(section, optimizedData);
    } catch (error) {
      console.error('AI optimization failed:', error);
    }
  };

  const ActiveComponent = tabsData[activeTab].component;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 2
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Professional Resume Builder
        </Typography>
        <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
          Create your professional resume with our advanced CT Resume Builder
        </Typography>
      </Paper>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Panel - Form */}
        <Grid item xs={12} md={5}>
          <Paper elevation={1} sx={{ height: 'fit-content', minHeight: '600px' }}>
            {/* Navigation Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTab-root': {
                    minWidth: 0,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }
                }}
              >
                {tabsData.map((tab, index) => (
                  <Tab
                    key={index}
                    icon={tab.icon}
                    label={tab.label}
                    iconPosition="start"
                    sx={{ 
                      flexDirection: 'row',
                      gap: 1,
                      textTransform: 'none'
                    }}
                  />
                ))}
              </Tabs>
            </Box>

            {/* Tab Content */}
            <Box sx={{ p: 3 }}>
              <Fade in={true} timeout={300}>
                <Box>
                  <ActiveComponent
                    data={resumeData}
                    updateData={updateResumeData}
                    onAIOptimize={handleAIOptimize}
                  />
                </Box>
              </Fade>
            </Box>

            {/* Action Buttons */}
            <Divider />
            <Box sx={{ p: 3 }}>
              {/* Template Selector */}
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Resume Template</InputLabel>
                <Select
                  value={selectedTemplate}
                  label="Resume Template"
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                >
                  <MenuItem value="latex-modern">Modern LaTeX</MenuItem>
                  <MenuItem value="latex-classic">Classic LaTeX</MenuItem>
                  <MenuItem value="latex-academic">Academic LaTeX</MenuItem>
                  <MenuItem value="latex-tech">Tech LaTeX</MenuItem>
                </Select>
              </FormControl>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<AIIcon />}
                  onClick={() => handleAIOptimize(tabsData[activeTab].label.toLowerCase())}
                  sx={{
                    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                    color: 'white',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #FE6B8B 60%, #FF8E53 100%)',
                    }
                  }}
                >
                  AI Optimize
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => {
                    // Download functionality
                    console.log('Download PDF clicked');
                  }}
                >
                  Download PDF
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Right Panel - Live Preview */}
        <Grid item xs={12} md={7}>
          <Paper 
            elevation={1} 
            sx={{ 
              height: 'fit-content',
              minHeight: '600px',
              position: 'sticky',
              top: 20
            }}
          >
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight="bold">
                Live Preview
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your resume updates in real-time as you type
              </Typography>
            </Box>
            
            <Box sx={{ p: 3 }}>
              <ResumePreview data={resumeData} template={selectedTemplate} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default ResumeBuilder;