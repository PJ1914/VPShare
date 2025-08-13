import React, { useState, useEffect } from 'react';
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
  Grid,
  IconButton,
  Tooltip,
  LinearProgress,
  Alert,
  Snackbar,
  Chip,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  CircularProgress
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
  AutoAwesome as AIIcon,
  Save as SaveIcon,
  Visibility as PreviewIcon,
  RestoreFromTrash as ResetIcon,
  Share as ShareIcon,
  CloudUpload as ImportIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Import enhanced section components
import ContactSectionEnhanced from '../components/sections/ContactSectionEnhanced';
import SummarySection from '../components/sections/SummarySection';
import ExperienceSection from '../components/sections/ExperienceSection';
import EducationSection from '../components/sections/EducationSection';
import SkillsSection from '../components/sections/SkillsSection';
import ProjectsSection from '../components/sections/ProjectsSection';
import CertificatesSection from '../components/sections/CertificatesSection';
import LanguagesSection from '../components/sections/LanguagesSection';
import ResumePreviewEnhanced from '../components/ResumePreviewEnhanced';
import TemplateSelectorModal from '../components/TemplateSelectorModal';
import ProgressTracker from '../components/ProgressTracker';

// Import services
import { resumeService } from '../services/resumeService';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

function ResumeBuilderEnhanced() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  
  // Handle case where NotificationContext might not be available
  let showNotification;
  try {
    const notificationContext = useNotification();
    showNotification = notificationContext?.showNotification || (() => {
      console.log('Notification context not available');
    });
  } catch (error) {
    console.warn('NotificationContext not available, using console.log');
    showNotification = (message, type) => {
      console.log(`${type}: ${message}`);
    };
  }

  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState('latex-modern');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [resumeScore, setResumeScore] = useState(0);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [lastSaved, setLastSaved] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState({});
  
  const [resumeData, setResumeData] = useState({
    // Contact Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    website: '',
    portfolio: '',
    jobTitle: '',
    
    // Summary/Objective
    summary: '',
    
    // Professional Experience
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
    languages: [],
    
    // Additional Info
    targetRole: '',
    industry: '',
    customSections: []
  });

  // Tabs configuration with enhanced icons and data mapping
  const tabsData = [
    { 
      label: 'Contact', 
      icon: <PersonIcon />, 
      component: ContactSectionEnhanced,
      dataKey: 'contact'
    },
    { 
      label: 'Summary', 
      icon: <SummaryIcon />, 
      component: SummarySection,
      dataKey: 'summary'
    },
    { 
      label: 'Experience', 
      icon: <WorkIcon />, 
      component: ExperienceSection,
      dataKey: 'experiences'
    },
    { 
      label: 'Education', 
      icon: <EducationIcon />, 
      component: EducationSection,
      dataKey: 'education'
    },
    { 
      label: 'Skills', 
      icon: <SkillsIcon />, 
      component: SkillsSection,
      dataKey: 'skills'
    },
    { 
      label: 'Projects', 
      icon: <ProjectsIcon />, 
      component: ProjectsSection,
      dataKey: 'projects'
    },
    { 
      label: 'Certificates', 
      icon: <CertificateIcon />, 
      component: CertificatesSection,
      dataKey: 'certificates'
    },
    { 
      label: 'Languages', 
      icon: <LanguageIcon />, 
      component: LanguagesSection,
      dataKey: 'languages'
    }
  ];

  // Load saved resume on component mount
  useEffect(() => {
    loadSavedResume();
  }, [user]);

  // Auto-save functionality
  useEffect(() => {
    if (!user || !resumeData.firstName) return;

    const autoSave = setTimeout(() => {
      saveResume(true); // Silent save
    }, 10000); // Auto-save every 10 seconds (reduced from 30)

    return () => clearTimeout(autoSave);
  }, [resumeData, user]);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (user && resumeData.firstName) {
        // Save to localStorage immediately
        localStorage.setItem(`resume_${user.uid}`, JSON.stringify(resumeData));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user, resumeData]);

  // Calculate completion percentage and score
  useEffect(() => {
    calculateCompletionAndScore();
  }, [resumeData]);

  const loadSavedResume = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      // Try to load from resumeService first
      const savedData = await resumeService.loadResume(user.uid);
      if (savedData) {
        setResumeData(prevData => ({
          ...prevData,
          ...savedData
        }));
        setLastSaved(new Date());
        showNotification('Resume loaded successfully!', 'success');
      }
    } catch (error) {
      console.error('Error loading resume:', error);
      // Try to load from localStorage as fallback
      try {
        const localData = localStorage.getItem(`resume_${user.uid}`);
        if (localData) {
          const parsedData = JSON.parse(localData);
          setResumeData(prevData => ({
            ...prevData,
            ...parsedData
          }));
          showNotification('Resume loaded from local storage', 'info');
        }
      } catch (localError) {
        console.error('Error loading from localStorage:', localError);
        showNotification('No saved resume found', 'info');
      }
    } finally {
      setLoading(false);
    }
  };

  const saveResume = async (silent = false) => {
    if (!user) {
      if (!silent) showNotification('Please login to save resume', 'warning');
      return;
    }
    
    try {
      setSaving(true);
      
      // Save to localStorage immediately as backup
      localStorage.setItem(`resume_${user.uid}`, JSON.stringify(resumeData));
      
      // Try to save to backend
      await resumeService.saveResume(user.uid, resumeData);
      setLastSaved(new Date());
      if (!silent) {
        showNotification('Resume saved successfully!', 'success');
      }
    } catch (error) {
      console.error('Error saving resume:', error);
      if (!silent) {
        showNotification('Saved locally - will sync when online', 'warning');
      }
    } finally {
      setSaving(false);
    }
  };

  const calculateCompletionAndScore = () => {
    let score = 0;
    let completedSections = 0;
    const totalSections = tabsData.length;

    // Contact section
    if (resumeData.firstName && resumeData.lastName && resumeData.email && resumeData.phone) {
      completedSections++;
      score += 15;
    }

    // Summary section
    if (resumeData.summary && resumeData.summary.length > 50) {
      completedSections++;
      score += 20;
    }

    // Experience section
    if (resumeData.experiences && resumeData.experiences.length > 0) {
      completedSections++;
      score += 25;
    }

    // Education section
    if (resumeData.education && resumeData.education.length > 0) {
      completedSections++;
      score += 15;
    }

    // Skills section
    if (resumeData.skills && resumeData.skills.length > 0) {
      completedSections++;
      score += 15;
    }

    // Projects section
    if (resumeData.projects && resumeData.projects.length > 0) {
      completedSections++;
      score += 10;
    }

    setCompletionPercentage((completedSections / totalSections) * 100);
    setResumeScore(score);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const updateResumeData = (section, data) => {
    setResumeData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  // Get section-specific data for each component
  const getSectionData = (dataKey) => {
    let sectionData;
    switch (dataKey) {
      case 'contact':
        sectionData = {
          firstName: resumeData.firstName || '',
          lastName: resumeData.lastName || '',
          email: resumeData.email || '',
          phone: resumeData.phone || '',
          location: resumeData.location || '',
          linkedin: resumeData.linkedin || '',
          github: resumeData.github || '',
          website: resumeData.website || '',
          portfolio: resumeData.portfolio || '',
          jobTitle: resumeData.jobTitle || ''
        };
        break;
      case 'summary':
        sectionData = {
          summary: resumeData.summary || '',
          targetRole: resumeData.targetRole || '',
          industry: resumeData.industry || ''
        };
        break;
      case 'experiences':
        sectionData = { experiences: resumeData.experiences || [] };
        break;
      case 'education':
        sectionData = { education: resumeData.education || [] };
        break;
      case 'skills':
        sectionData = { skills: resumeData.skills || [] };
        break;
      case 'projects':
        sectionData = { projects: resumeData.projects || [] };
        break;
      case 'certificates':
        sectionData = { certificates: resumeData.certificates || [] };
        break;
      case 'languages':
        sectionData = { languages: resumeData.languages || [] };
        break;
      default:
        sectionData = resumeData[dataKey] || {};
    }
    
    console.log(`getSectionData(${dataKey}):`, sectionData); // Debug log
    return sectionData;
  };

  // Update section-specific data
  const updateSectionData = (dataKey, newData) => {
    console.log('Updating section data:', dataKey, newData); // Debug log
    
    if (dataKey === 'contact' || dataKey === 'summary') {
      // For contact and summary sections, merge the data
      setResumeData(prev => {
        const updated = { ...prev, ...newData };
        console.log(`${dataKey} data updated:`, updated); // Debug log
        return updated;
      });
    } else {
      // For array-based sections (experiences, education, skills, etc.)
      setResumeData(prev => {
        const updated = { ...prev, [dataKey]: newData };
        console.log(`${dataKey} data updated:`, updated); // Debug log
        return updated;
      });
    }
  };

  const handleAIOptimize = async (section) => {
    if (!user) {
      showNotification('Please login to use AI features', 'warning');
      return;
    }

    try {
      setLoading(true);
      
      // Check if resumeService has optimizeSection method
      if (typeof resumeService.optimizeSection === 'function') {
        const optimizedData = await resumeService.optimizeSection(
          section, 
          resumeData[section],
          resumeData.targetRole,
          resumeData.industry
        );
        
        updateResumeData(section, optimizedData.improved_content);
        setAiSuggestions(prev => ({
          ...prev,
          [section]: optimizedData.suggestions
        }));
        
        showNotification('Section optimized with AI!', 'success');
      } else {
        // Fallback: Provide mock AI suggestions
        const mockSuggestions = {
          contact: ['Add a professional photo', 'Include LinkedIn profile', 'Add relevant certifications'],
          summary: ['Make it more specific to target role', 'Add quantifiable achievements', 'Include key technologies'],
          experiences: ['Use action verbs', 'Quantify achievements', 'Show impact with numbers'],
          skills: ['Group skills by category', 'Add proficiency levels', 'Include relevant certifications']
        };
        
        setAiSuggestions(prev => ({
          ...prev,
          [section]: mockSuggestions[section] || ['Section looks good!']
        }));
        
        showNotification('AI suggestions generated (demo mode)', 'info');
      }
    } catch (error) {
      console.error('AI optimization failed:', error);
      showNotification('AI optimization temporarily unavailable', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const generateResumeWithAI = async () => {
    if (!user) {
      showNotification('Please login to generate resume', 'warning');
      return;
    }

    try {
      setGenerating(true);
      const result = await resumeService.generateResume({
        resume_data: resumeData,
        template: selectedTemplate,
        ai_enhancement: true,
        target_role: resumeData.targetRole,
        industry: resumeData.industry
      });
      
      if (result.success) {
        showNotification('Resume generated successfully!', 'success');
        // Handle the generated resume data
      }
    } catch (error) {
      console.error('Resume generation failed:', error);
      showNotification('Resume generation failed. Please try again.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const exportResume = async (format = 'pdf') => {
    if (!user) {
      showNotification('Please login to export resume', 'warning');
      return;
    }

    // Basic validation
    if (!resumeData.firstName || !resumeData.lastName || !resumeData.email) {
      showNotification('Please fill in basic contact information before exporting', 'warning');
      return;
    }

    try {
      setLoading(true);
      
      // Check if resumeService has exportResume method
      if (typeof resumeService.exportResume === 'function') {
        const result = await resumeService.exportResume({
          ...resumeData,
          template: selectedTemplate,
          format
        });
        
        if (result.success) {
          showNotification(`Resume exported as ${format.toUpperCase()}!`, 'success');
          // Handle download
          if (result.download_url) {
            window.open(result.download_url, '_blank');
          }
        } else {
          throw new Error(result.message || 'Export failed');
        }
      } else {
        // Fallback: Generate JSON export
        const exportData = {
          ...resumeData,
          template: selectedTemplate,
          exportDate: new Date().toISOString(),
          format: format
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resume_${resumeData.firstName}_${resumeData.lastName}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showNotification('Resume exported as JSON (PDF generation temporarily unavailable)', 'info');
      }
    } catch (error) {
      console.error('Export failed:', error);
      showNotification('Export failed. Please try again later.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetResume = () => {
    if (window.confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
      setResumeData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        github: '',
        website: '',
        portfolio: '',
        jobTitle: '',
        summary: '',
        experiences: [],
        education: [],
        skills: [],
        projects: [],
        certificates: [],
        languages: [],
        targetRole: '',
        industry: '',
        customSections: []
      });
      showNotification('Resume data reset successfully', 'info');
    }
  };

  const ActiveComponent = tabsData[activeTab].component;

  // Fallback component for when section components fail
  const FallbackSection = ({ dataKey }) => (
    <Paper sx={{ p: 3, textAlign: 'center' }}>
      <WarningIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        Section Temporarily Unavailable
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        The {dataKey} section is currently unavailable. Please try refreshing the page.
      </Typography>
      <Button 
        variant="contained" 
        onClick={() => window.location.reload()}
        sx={{ mt: 2 }}
      >
        Refresh Page
      </Button>
    </Paper>
  );

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Initial Loading Screen */}
      {loading && !resumeData.firstName && (
        <Box 
          sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Loading Resume Builder...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Setting up your workspace
          </Typography>
        </Box>
      )}

      {/* Top Header Bar */}
      <Paper 
        elevation={1} 
        sx={{ 
          p: 2, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 0,
          zIndex: 1000
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Typography variant="h5" fontWeight="bold">
              Professional Resume Builder
            </Typography>
            
            {/* Quick Stats */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StarIcon sx={{ fontSize: 20 }} />
                <Typography variant="h6" fontWeight="bold">
                  {resumeScore}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Score
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon sx={{ fontSize: 20 }} />
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {Math.round(completionPercentage)}% Complete
                </Typography>
              </Box>
            </Box>
          </Box>
          
          {/* Action Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={() => saveResume()}
              disabled={saving}
              size="small"
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
              }}
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
            
            <Button
              variant="contained"
              startIcon={<AIIcon />}
              onClick={generateResumeWithAI}
              disabled={generating}
              size="small"
              sx={{ 
                bgcolor: '#FF6B6B',
                '&:hover': { bgcolor: '#FF5252' }
              }}
            >
              {generating ? 'Generating...' : 'AI Optimize'}
            </Button>
            
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => exportResume('pdf')}
              disabled={loading}
              size="small"
              sx={{ 
                bgcolor: '#4CAF50',
                '&:hover': { bgcolor: '#45a049' }
              }}
            >
              Export PDF
            </Button>
            
            <IconButton 
              onClick={() => setShowTemplateSelector(true)}
              sx={{ color: 'white' }}
            >
              <PreviewIcon />
            </IconButton>
            
            <IconButton 
              onClick={resetResume}
              sx={{ color: 'white' }}
            >
              <ResetIcon />
            </IconButton>
            
            {lastSaved && (
              <Typography variant="caption" sx={{ opacity: 0.8, ml: 2 }}>
                Saved: {lastSaved.toLocaleTimeString()}
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Main Split Screen Layout */}
      <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Panel - Editor */}
        <Box 
          sx={{ 
            width: isMobile ? '100%' : '50%',
            display: 'flex',
            flexDirection: 'column',
            borderRight: isMobile ? 'none' : '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }}
        >
          {/* Section Navigation */}
          <Box 
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              bgcolor: 'background.paper',
              p: 1
            }}
          >
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 48,
                '& .MuiTab-root': {
                  minWidth: 0,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  px: 2,
                  py: 1,
                  '&.Mui-selected': {
                    color: 'primary.main',
                    fontWeight: 600
                  }
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
                    '&.Mui-selected': {
                      bgcolor: 'rgba(25, 118, 210, 0.08)'
                    }
                  }}
                />
              ))}
            </Tabs>
          </Box>

          {/* Active Section Form */}
          <Box 
            sx={{ 
              flexGrow: 1, 
              overflow: 'auto',
              p: 3,
              bgcolor: 'grey.50'
            }}
          >
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {(() => {
                try {
                  // Check if component exists
                  if (!ActiveComponent) {
                    return <FallbackSection dataKey={tabsData[activeTab].dataKey} />;
                  }

                  const sectionData = getSectionData(tabsData[activeTab].dataKey);
                  console.log(`Rendering ${tabsData[activeTab].dataKey} with data:`, sectionData);

                  return React.createElement(ActiveComponent, {
                    // Standard props for all components
                    data: sectionData,
                    updateData: (fieldOrData, value) => {
                      console.log('updateData called with:', fieldOrData, value); // Debug log
                      
                      if (typeof fieldOrData === 'string' && value !== undefined) {
                        // This handles both:
                        // 1. Contact section: updateData('firstName', 'John')
                        // 2. Array sections: updateData('experiences', arrayOfExperiences)
                        
                        if (fieldOrData === 'experiences' || fieldOrData === 'education' || 
                            fieldOrData === 'skills' || fieldOrData === 'projects' || 
                            fieldOrData === 'certificates' || fieldOrData === 'languages') {
                          // Array section update - value is the entire array
                          console.log('Array update for:', fieldOrData, value);
                          updateSectionData(fieldOrData, value);
                        } else {
                          // Contact/Summary field update - value is a single field value
                          console.log('Field update:', fieldOrData, '=', value);
                          const currentData = getSectionData(tabsData[activeTab].dataKey);
                          const updatedData = { ...currentData, [fieldOrData]: value };
                          updateSectionData(tabsData[activeTab].dataKey, updatedData);
                        }
                      } else {
                        // Full object update
                        console.log('Full object update:', fieldOrData);
                        updateSectionData(tabsData[activeTab].dataKey, fieldOrData);
                      }
                    },
                    onAIOptimize: () => handleAIOptimize(tabsData[activeTab].dataKey),
                    aiSuggestions: aiSuggestions[tabsData[activeTab].dataKey] || [],
                    loading: loading,
                    validationErrors: {},
                    
                    // Alternative prop names for compatibility
                    onChange: (field, value) => {
                      if (typeof field === 'string') {
                        // Handle field-specific updates
                        const currentData = getSectionData(tabsData[activeTab].dataKey);
                        const updatedData = { ...currentData, [field]: value };
                        updateSectionData(tabsData[activeTab].dataKey, updatedData);
                      } else {
                        // Handle full data updates
                        updateSectionData(tabsData[activeTab].dataKey, field);
                      }
                    },
                    updateData: (field, value) => {
                      if (typeof field === 'string') {
                        // Single field update - this is what ContactSectionEnhanced needs
                        const currentData = getSectionData(tabsData[activeTab].dataKey);
                        const updatedData = { ...currentData, [field]: value };
                        updateSectionData(tabsData[activeTab].dataKey, updatedData);
                      } else {
                        // Full object update
                        updateSectionData(tabsData[activeTab].dataKey, field);
                      }
                    },
                    onSectionImprovement: async (section, content) => {
                      await handleAIOptimize(tabsData[activeTab].dataKey);
                      return content; // Return improved content
                    },
                    
                    // Additional props for specific sections
                    targetRole: resumeData.targetRole,
                    industry: resumeData.industry,
                    isLoading: loading
                  });
                } catch (error) {
                  console.error('Error rendering section component:', error);
                  return <FallbackSection dataKey={tabsData[activeTab].dataKey} />;
                }
              })()}
            </motion.div>
          </Box>

          {/* Section Navigation Controls */}
          <Box 
            sx={{ 
              p: 2, 
              borderTop: 1, 
              borderColor: 'divider',
              bgcolor: 'background.paper',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Button
              variant="outlined"
              onClick={() => setActiveTab(Math.max(0, activeTab - 1))}
              disabled={activeTab === 0}
              size="small"
            >
              Previous
            </Button>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {activeTab + 1} of {tabsData.length}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(activeTab + 1) / tabsData.length * 100} 
                sx={{ width: 100, height: 4, borderRadius: 2 }}
              />
            </Box>
            
            <Button
              variant="contained"
              onClick={() => setActiveTab(Math.min(tabsData.length - 1, activeTab + 1))}
              disabled={activeTab === tabsData.length - 1}
              size="small"
            >
              Next
            </Button>
          </Box>
        </Box>

        {/* Right Panel - Live Preview */}
        {!isMobile && (
          <Box 
            sx={{ 
              width: '50%',
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'grey.100'
            }}
          >
            {/* Preview Header */}
            <Box 
              sx={{ 
                p: 2, 
                borderBottom: 1, 
                borderColor: 'divider',
                bgcolor: 'background.paper',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Box>
                <Typography variant="h6" fontWeight="600">
                  Live Preview
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedTemplate.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Template
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip 
                  icon={<StarIcon />} 
                  label={`Score: ${resumeScore}`}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
                <Tooltip title="Change Template">
                  <IconButton onClick={() => setShowTemplateSelector(true)} size="small">
                    <PreviewIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Export PDF">
                  <IconButton onClick={() => exportResume('pdf')} size="small">
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            {/* Preview Content */}
            <Box 
              sx={{ 
                flexGrow: 1, 
                overflow: 'auto', 
                p: 2,
                display: 'flex',
                justifyContent: 'center',
                bgcolor: 'grey.100'
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                style={{ width: '100%', maxWidth: '600px' }}
              >
                <ResumePreviewEnhanced 
                  data={resumeData} 
                  template={selectedTemplate}
                  score={resumeScore}
                />
              </motion.div>
            </Box>
          </Box>
        )}
      </Box>

      {/* Mobile Preview Toggle */}
      {isMobile && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1000
          }}
        >
          <Button
            variant="contained"
            startIcon={<PreviewIcon />}
            onClick={() => {
              // Toggle mobile preview modal or navigate to preview page
              setShowTemplateSelector(true);
            }}
            sx={{
              borderRadius: '50px',
              px: 3,
              py: 1.5,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 4px 20px rgba(33, 150, 243, 0.3)'
            }}
          >
            Preview
          </Button>
        </Box>
      )}

      {/* Template Selector Modal */}
      <TemplateSelectorModal
        open={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        selectedTemplate={selectedTemplate}
        onTemplateSelect={setSelectedTemplate}
      />

      {/* Loading Overlay */}
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
            <LinearProgress sx={{ mb: 2, width: 200 }} />
            <Typography>Processing your request...</Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
}

export default ResumeBuilderEnhanced;
