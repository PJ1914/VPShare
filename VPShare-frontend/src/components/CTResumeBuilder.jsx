import React, { useState, useEffect } from 'react';
import './ResumeBuilder.css';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Tab,
  Tabs,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Grid
} from '@mui/material';
import {
  AutoAwesome as AIIcon,
  Download as DownloadIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Build as SkillsIcon,
  EmojiEvents as CertificateIcon,
  Assignment as ProjectIcon,
  Language as LanguageIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Psychology as BrainIcon,
  Spellcheck as SpellcheckIcon,
  TrendingUp as ATSIcon,
  AutoFixHigh as ImprovementIcon,
  AutoAwesome
} from '@mui/icons-material';

// Import section components
import ContactSectionComponent from './sections/ContactSectionNew';
import ProfessionalSummarySection from './sections/ProfessionalSummarySection';
import ExperienceSection from './sections/ExperienceSection';
import EducationSection from './sections/EducationSection';
import SkillsSection from './sections/SkillsSection';
import ProjectsSection from './sections/ProjectsSection';
import CertificatesSection from './sections/CertificatesSection';
import LanguagesSection from './sections/LanguagesSection';
import AIAssistant from './AIAssistant';
import ResumePreview from './ResumePreview';
import ResumeAPI from '../services/resumeAPI';

function CTResumeBuilder() {
  const [activeTab, setActiveTab] = useState(0);
  const [resumeData, setResumeData] = useState({
    personal: {
      firstName: '',
      lastName: '',
      jobTitle: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      website: '',
      portfolio: ''
    },
    summary: '',
    experiences: [],
    education: [],
    skills: [],
    projects: [],
    certificates: [],
    languages: []
  });

  const [aiAssistant, setAiAssistant] = useState({
    isOpen: false,
    loading: false,
    suggestions: null,
    analysisType: null
  });

  const [notifications, setNotifications] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [templates, setTemplates] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [targetRole, setTargetRole] = useState('');
  const [industry, setIndustry] = useState('');

  const [template, setTemplate] = useState('modern');
  const [completionScore, setCompletionScore] = useState(0);

  // Load templates on component mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await ResumeAPI.getResumeTemplates();
        setTemplates(response.templates || {});
      } catch (error) {
        console.error('Failed to load templates:', error);
        showNotification('Failed to load templates', 'error');
      }
    };
    loadTemplates();
  }, []);

  // Auto-save resume data to backend
  useEffect(() => {
    const autoSave = async () => {
      if (resumeData.personal.firstName || resumeData.personal.email) {
        try {
          // Auto-save every 30 seconds if there's content
          await ResumeAPI.generateResume(resumeData, template, false);
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    };

    const saveInterval = setInterval(autoSave, 30000); // 30 seconds
    return () => clearInterval(saveInterval);
  }, [resumeData, template]);

  // Calculate completion score
  useEffect(() => {
    const calculateCompletion = () => {
      let score = 0;
      const weights = {
        personal: 20,
        summary: 15,
        experiences: 25,
        education: 15,
        skills: 15,
        projects: 10
      };

      // Personal info
      const personalFields = Object.values(resumeData.personal).filter(val => val.trim());
      score += (personalFields.length / 9) * weights.personal;

      // Summary
      if (resumeData.summary.trim()) score += weights.summary;

      // Experience
      if (resumeData.experiences.length > 0) score += weights.experiences;

      // Education
      if (resumeData.education.length > 0) score += weights.education;

      // Skills
      if (resumeData.skills.length > 0) score += weights.skills;

      // Projects
      if (resumeData.projects.length > 0) score += weights.projects;

      setCompletionScore(Math.round(score));
    };

    calculateCompletion();
  }, [resumeData]);

  const tabs = [
    { label: 'Contact', icon: <PersonIcon />, component: ContactSectionComponent },
    { label: 'Summary', icon: <AIIcon />, component: ProfessionalSummarySection },
    { label: 'Experience', icon: <WorkIcon />, component: ExperienceSection },
    { label: 'Education', icon: <SchoolIcon />, component: EducationSection },
    { label: 'Skills', icon: <SkillsIcon />, component: SkillsSection },
    { label: 'Projects', icon: <ProjectIcon />, component: ProjectsSection },
    { label: 'Certificates', icon: <CertificateIcon />, component: CertificatesSection },
    { label: 'Languages', icon: <LanguageIcon />, component: LanguagesSection }
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleDataChange = (section, data) => {
    setResumeData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  const showNotification = (message, severity = 'success') => {
    setNotifications({ open: true, message, severity });
  };

  const handleAIAnalysis = async (type) => {
    setAiAssistant({ ...aiAssistant, loading: true, analysisType: type, isOpen: true });
    
    try {
      let analysisData;
      const resumeText = ResumeAPI.resumeDataToText(resumeData);
      
      switch (type) {
        case 'grammar':
          analysisData = await ResumeAPI.checkGrammar(resumeText);
          break;
        case 'ats':
          analysisData = await ResumeAPI.analyzeATS(resumeText);
          break;
        case 'improvements':
          analysisData = await ResumeAPI.generateAIContent(
            resumeData, 
            targetRole, 
            industry, 
            'mid', 
            ['content_improvement', 'keyword_optimization']
          );
          break;
        case 'keywords':
          analysisData = await ResumeAPI.analyzeKeywords(resumeText, targetRole, industry);
          break;
        default:
          analysisData = await ResumeAPI.generateAIContent(resumeData, targetRole, industry);
      }
      
      setAiAssistant({
        isOpen: true,
        loading: false,
        suggestions: analysisData,
        analysisType: type
      });
    } catch (error) {
      showNotification(`Failed to analyze resume: ${error.message}`, 'error');
      setAiAssistant({ ...aiAssistant, loading: false });
    }
  };

  const handleSectionImprovement = async (sectionType, currentContent) => {
    setIsLoading(true);
    try {
      const improvement = await ResumeAPI.improveSectionWithAI(
        currentContent,
        sectionType,
        targetRole,
        industry
      );
      
      showNotification('Section improved successfully!');
      return improvement.improved_content;
    } catch (error) {
      showNotification(`Failed to improve section: ${error.message}`, 'error');
      return currentContent;
    } finally {
      setIsLoading(false);
    }
  };

  const handleAIContentGeneration = async () => {
    if (!resumeData.personal.firstName && !resumeData.personal.email) {
      showNotification('Please fill in basic personal information first', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const aiContent = await ResumeAPI.generateAIContent(
        resumeData,
        targetRole,
        industry,
        'mid',
        ['professional_summary', 'experience_enhancement', 'skills_optimization']
      );
      
      if (aiContent.enhanced_resume) {
        // Update resume data with AI-enhanced content
        setResumeData(prev => ({
          ...prev,
          ...aiContent.enhanced_resume
        }));
        showNotification('Resume enhanced with AI suggestions!');
      }
    } catch (error) {
      showNotification(`Failed to generate AI content: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportToPDF = async () => {
    if (!resumeData.personal.firstName && !resumeData.personal.email) {
      showNotification('Please fill in basic information before exporting', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const exportResult = await ResumeAPI.exportResume(resumeData, template, 'pdf');
      showNotification('Resume exported successfully!');
      
      // If there's a download URL, open it
      if (exportResult.download_url) {
        window.open(exportResult.download_url, '_blank');
      }
    } catch (error) {
      showNotification(`Failed to export resume: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const CurrentTabComponent = tabs[activeTab].component;

  return (
    <div className="ct-resume-builder">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography>Processing with AI...</Typography>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="builder-header">
        <div className="header-content">
          <div className="header-title">
            <h1>CT Resume Builder</h1>
            <p>Create your professional resume with AI-powered assistance</p>
          </div>
          <div className="header-controls">
            <div className="role-industry-inputs">
              <input
                type="text"
                placeholder="Target Role"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
              <input
                type="text"
                placeholder="Industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </div>
            <div className="completion-score">
              <h3>{completionScore}%</h3>
              <span>Complete</span>
            </div>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleExportToPDF}
              disabled={isLoading}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Main Two-Panel Layout */}
      <div className="resume-builder-layout">
        {/* Left Panel - Form */}
        <div className="left-panel">
          <div className="form-container">
            {/* Tab Navigation */}
            <div className="tab-navigation">
              <div className="tabs-container">
                {tabs.map((tab, index) => (
                  <button
                    key={index}
                    className={`tab-button ${index === activeTab ? 'active' : ''}`}
                    onClick={() => setActiveTab(index)}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              <CurrentTabComponent
                data={resumeData}
                onChange={handleDataChange}
                onAIAnalysis={handleAIAnalysis}
                onSectionImprovement={handleSectionImprovement}
                targetRole={targetRole}
                industry={industry}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* AI Assistant Panel */}
          <div className="ai-assistant-panel">
            <div className="ai-header">
              <BrainIcon />
              <h3>AI Assistant</h3>
            </div>
            <p className="ai-description">
              Get AI-powered suggestions to improve your resume for {targetRole || 'your target role'} 
              {industry ? ` in ${industry}` : ''}
            </p>
            
            <div className="ai-buttons">
              <button
                className="ai-button"
                onClick={() => handleAIAnalysis('grammar')}
                disabled={aiAssistant.loading || isLoading}
              >
                <SpellcheckIcon />
                Grammar Check
              </button>
              <button
                className="ai-button"
                onClick={() => handleAIAnalysis('ats')}
                disabled={aiAssistant.loading || isLoading}
              >
                <ATSIcon />
                ATS Score
              </button>
              <button
                className="ai-button"
                onClick={() => handleAIAnalysis('improvements')}
                disabled={aiAssistant.loading || isLoading}
              >
                <ImprovementIcon />
                Suggestions
              </button>
              <button
                className="ai-button"
                onClick={() => handleAIAnalysis('keywords')}
                disabled={aiAssistant.loading || isLoading}
              >
                <AIIcon />
                Keywords
              </button>
            </div>
            
            {/* AI Content Generation Button */}
            <Button
              fullWidth
              variant="contained"
              startIcon={<AutoAwesome />}
              onClick={handleAIContentGeneration}
              disabled={isLoading || aiAssistant.loading}
              sx={{ 
                mt: 2, 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              {isLoading ? 'Enhancing...' : 'Enhance with AI'}
            </Button>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="right-panel">
          <div className="preview-container">
            <div className="preview-header">
              <h3>Resume Preview</h3>
              <p>Live preview of your {template} template resume</p>
            </div>
            <div className="preview-content">
              <ResumePreview
                data={resumeData}
                template={template}
              />
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Dialog */}
      <AIAssistant
        open={aiAssistant.isOpen}
        onClose={() => setAiAssistant({ ...aiAssistant, isOpen: false })}
        loading={aiAssistant.loading}
        suggestions={aiAssistant.suggestions}
        analysisType={aiAssistant.analysisType}
        onApplySuggestion={(suggestion) => {
          // Apply suggestion logic
          showNotification('Suggestion applied successfully!');
        }}
      />

      {/* Notifications */}
      <Snackbar
        open={notifications.open}
        autoHideDuration={4000}
        onClose={() => setNotifications({ ...notifications, open: false })}
      >
        <Alert
          onClose={() => setNotifications({ ...notifications, open: false })}
          severity={notifications.severity}
          sx={{ width: '100%' }}
        >
          {notifications.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default CTResumeBuilder;
