import React, { useState } from 'react';
import { Box, Typography, ToggleButtonGroup, ToggleButton, Tooltip, Grid, Paper, Chip, Stack, Button } from '@mui/material';
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';
import ArticleIcon from '@mui/icons-material/Article';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import FontDownloadIcon from '@mui/icons-material/FontDownload';
import StarIcon from '@mui/icons-material/Star';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TemplatePreviewModal from './TemplatePreviewModal';

function TemplateSelector({ selected, setSelected }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const handleTemplateChange = (event, newTemplate) => {
    if (newTemplate !== null) {
      setSelected(newTemplate);
    }
  };

  const handlePreview = (template, event) => {
    event.stopPropagation();
    setPreviewTemplate(template);
    setPreviewOpen(true);
  };

  const handleSelectFromPreview = (templateId) => {
    setSelected(templateId);
  };

  const templates = [
    {
      id: 'latex-modern',
      name: 'LaTeX Modern',
      icon: <ViewQuiltIcon />,
      description: 'Clean, professional LaTeX-inspired design with elegant typography',
      preview: 'Modern academic style with clean sections and professional formatting',
      colorScheme: '#2563eb',
      fontFamily: 'Inter, Helvetica',
      features: ['Clean Design', 'Professional', 'ATS-Friendly'],
      recommended: true,
      bestFor: 'Tech & Business professionals'
    },
    {
      id: 'latex-classic',
      name: 'LaTeX Classic',
      icon: <ArticleIcon />,
      description: 'Traditional academic resume format with serif fonts',
      preview: 'Classic academic layout with traditional formatting',
      colorScheme: '#1f2937',
      fontFamily: 'Times New Roman',
      features: ['Traditional', 'Academic', 'Formal'],
      recommended: false,
      bestFor: 'Academic & Research positions'
    },
    {
      id: 'latex-tech',
      name: 'LaTeX Tech',
      icon: <AccountTreeIcon />,
      description: 'Technology-focused template with emphasis on skills and projects',
      preview: 'Technical resume with prominent skills and project sections',
      colorScheme: '#059669',
      fontFamily: 'JetBrains Mono',
      features: ['Tech-Focused', 'Skills Emphasis', 'Modern'],
      recommended: false,
      bestFor: 'Software developers & Engineers'
    },
    {
      id: 'latex-executive',
      name: 'LaTeX Executive',
      icon: <BusinessCenterIcon />,
      description: 'Executive-level template with emphasis on achievements',
      preview: 'Professional executive format with achievement highlights',
      colorScheme: '#7c2d12',
      fontFamily: 'Georgia',
      features: ['Executive', 'Achievement Focus', 'Premium'],
      recommended: false,
      bestFor: 'Senior executives & Management'
    },
    {
      id: 'latex-academic',
      name: 'LaTeX Academic',
      icon: <SchoolIcon />,
      description: 'Academic CV template with publications and research focus',
      preview: 'Academic CV with research and publication emphasis',
      colorScheme: '#4338ca',
      fontFamily: 'Times New Roman',
      features: ['Academic CV', 'Research Focus', 'Publications'],
      recommended: false,
      bestFor: 'Researchers & Academics'
    }
  ];

  return (
    <Paper 
      elevation={0}
      sx={{
        p: 4,
        mb: 4,
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: 'var(--text-primary)' }}>
          Choose Your Professional Template
        </Typography>
        <Typography variant="body1" sx={{ color: 'var(--text-secondary)', maxWidth: 600, mx: 'auto' }}>
          Select a LaTeX-inspired template that best matches your career level and industry. Each template is optimized for ATS systems and professional standards.
        </Typography>
      </Box>
      
      {/* Template Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {templates.map((template) => (
          <Grid item xs={12} sm={6} lg={4} key={template.id}>
            <Paper
              elevation={selected === template.id ? 8 : 2}
              sx={{
                p: 3,
                cursor: 'pointer',
                border: selected === template.id ? `3px solid ${template.colorScheme}` : '2px solid transparent',
                background: selected === template.id 
                  ? `linear-gradient(135deg, ${template.colorScheme}10 0%, ${template.colorScheme}20 100%)`
                  : 'white',
                transition: 'all 0.3s ease-in-out',
                position: 'relative',
                minHeight: '320px',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 35px rgba(0, 0, 0, 0.15)',
                },
              }}
              onClick={() => setSelected(template.id)}
            >
              {/* Recommended Badge */}
              {template.recommended && (
                <Chip
                  icon={<StarIcon sx={{ fontSize: '16px !important' }} />}
                  label="Recommended"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: 16,
                    backgroundColor: '#ff6b35',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.7rem',
                  }}
                />
              )}

              {/* Selected Indicator */}
              {selected === template.id && (
                <CheckCircleIcon
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    color: template.colorScheme,
                    fontSize: '24px',
                  }}
                />
              )}

              {/* Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  color: selected === template.id ? template.colorScheme : 'var(--text-secondary)',
                  mr: 2,
                  fontSize: '28px'
                }}>
                  {template.icon}
                </Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: selected === template.id ? template.colorScheme : 'var(--text-primary)'
                  }}
                >
                  {template.name}
                </Typography>
              </Box>

              {/* Color & Font Preview */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ColorLensIcon sx={{ fontSize: '16px', color: 'var(--text-secondary)' }} />
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      backgroundColor: template.colorScheme,
                      border: '2px solid #f0f0f0',
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <FontDownloadIcon sx={{ fontSize: '16px', color: 'var(--text-secondary)' }} />
                  <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                    {template.fontFamily}
                  </Typography>
                </Box>
              </Box>

              {/* Description */}
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'var(--text-secondary)', 
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  mb: 2,
                  flex: 1
                }}
              >
                {template.description}
              </Typography>

              {/* Best For */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                  Best for: 
                </Typography>
                <Typography variant="caption" sx={{ color: template.colorScheme, ml: 0.5 }}>
                  {template.bestFor}
                </Typography>
              </Box>

              {/* Features */}
              <Stack direction="row" spacing={0.5} useFlexGap flexWrap sx={{ mb: 2 }}>
                {template.features.map((feature, index) => (
                  <Chip
                    key={index}
                    label={feature}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: '0.7rem',
                      height: '20px',
                      borderColor: selected === template.id ? template.colorScheme : 'var(--text-secondary)',
                      color: selected === template.id ? template.colorScheme : 'var(--text-secondary)',
                      '&:hover': {
                        backgroundColor: `${template.colorScheme}10`,
                      },
                    }}
                  />
                ))}
              </Stack>

              {/* Preview Button */}
              <Button
                variant="outlined"
                size="small"
                startIcon={<VisibilityIcon />}
                onClick={(e) => handlePreview(template, e)}
                sx={{
                  borderColor: template.colorScheme,
                  color: template.colorScheme,
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: `${template.colorScheme}10`,
                    borderColor: template.colorScheme,
                  },
                }}
              >
                Preview Template
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Selection Summary */}
      {selected && (
        <Paper
          elevation={1}
          sx={{
            p: 3,
            background: `linear-gradient(135deg, ${templates.find(t => t.id === selected)?.colorScheme}10 0%, ${templates.find(t => t.id === selected)?.colorScheme}05 100%)`,
            borderRadius: '8px',
            border: `1px solid ${templates.find(t => t.id === selected)?.colorScheme}30`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <CheckCircleIcon sx={{ color: templates.find(t => t.id === selected)?.colorScheme, fontSize: '20px' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>
              Selected: {templates.find(t => t.id === selected)?.name}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            {templates.find(t => t.id === selected)?.preview}
          </Typography>
        </Paper>
      )}

      {/* Template Preview Modal */}
      <TemplatePreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        template={previewTemplate}
        onSelect={handleSelectFromPreview}
      />

      {/* Legacy Toggle Buttons for backward compatibility */}
      <Box sx={{ display: 'none' }}>
        <ToggleButtonGroup
          value={selected}
          exclusive
          onChange={handleTemplateChange}
          aria-label="resume template"
        >
          <Tooltip title="Modern Layout" arrow>
            <ToggleButton 
              value="template-1" 
              aria-label="modern template"
              sx={{
                textTransform: 'none',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                '&.Mui-selected, &.Mui-selected:hover': {
                  color: 'white',
                  background: 'linear-gradient(to right, var(--primary-gradient-start), var(--primary-gradient-end))',
                },
              }}
            >
              <ViewQuiltIcon sx={{ mr: 1 }} />
              Modern
            </ToggleButton>
          </Tooltip>

          <Tooltip title="Classic Layout" arrow>
            <ToggleButton 
              value="template-2" 
              aria-label="classic template"
              sx={{
                textTransform: 'none',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                '&.Mui-selected, &.Mui-selected:hover': {
                  color: 'white',
                  background: 'linear-gradient(to right, var(--primary-gradient-start), var(--primary-gradient-end))',
                },
              }}
            >
              <ArticleIcon sx={{ mr: 1 }} />
              Classic
            </ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>
      </Box>
    </Paper>
  );
}

export default TemplateSelector;