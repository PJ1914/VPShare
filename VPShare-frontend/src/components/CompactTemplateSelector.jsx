import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Drawer, 
  Grid, 
  Paper, 
  Chip, 
  Stack,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PaletteIcon from '@mui/icons-material/Palette';
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';
import ArticleIcon from '@mui/icons-material/Article';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TemplatePreviewModal from './TemplatePreviewModal';

function CompactTemplateSelector({ selected, setSelected, showButton = true }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const templates = [
    {
      id: 'latex-modern',
      name: 'Modern',
      fullName: 'LaTeX Modern',
      icon: <ViewQuiltIcon />,
      description: 'Clean, professional LaTeX-inspired design',
      colorScheme: '#2563eb',
      fontFamily: 'Inter',
      features: ['Clean', 'Professional', 'ATS-Friendly'],
      recommended: true,
      bestFor: 'Tech & Business professionals'
    },
    {
      id: 'latex-classic',
      name: 'Classic',
      fullName: 'LaTeX Classic',
      icon: <ArticleIcon />,
      description: 'Traditional academic resume format',
      colorScheme: '#1f2937',
      fontFamily: 'Times New Roman',
      features: ['Traditional', 'Academic'],
      recommended: false,
      bestFor: 'Academic positions'
    },
    {
      id: 'latex-tech',
      name: 'Tech',
      fullName: 'LaTeX Tech',
      icon: <AccountTreeIcon />,
      description: 'Technology-focused with skills emphasis',
      colorScheme: '#059669',
      fontFamily: 'JetBrains Mono',
      features: ['Tech-Focused', 'Modern'],
      recommended: false,
      bestFor: 'Developers & Engineers'
    },
    {
      id: 'latex-executive',
      name: 'Executive',
      fullName: 'LaTeX Executive',
      icon: <BusinessCenterIcon />,
      description: 'Executive-level with achievements focus',
      colorScheme: '#7c2d12',
      fontFamily: 'Georgia',
      features: ['Executive', 'Premium'],
      recommended: false,
      bestFor: 'Senior Management'
    },
    {
      id: 'latex-academic',
      name: 'Academic',
      fullName: 'LaTeX Academic',
      icon: <SchoolIcon />,
      description: 'Academic CV with research focus',
      colorScheme: '#4338ca',
      fontFamily: 'Times New Roman',
      features: ['Academic CV', 'Research'],
      recommended: false,
      bestFor: 'Researchers'
    }
  ];

  const selectedTemplate = templates.find(t => t.id === selected);

  const handlePreview = (template, event) => {
    event.stopPropagation();
    setPreviewTemplate(template);
    setPreviewOpen(true);
  };

  const handleSelectFromPreview = (templateId) => {
    setSelected(templateId);
  };

  const handleSelectTemplate = (templateId) => {
    setSelected(templateId);
    setDrawerOpen(false);
  };

  return (
    <>
      {/* Compact Display */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        {selectedTemplate && (
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              px: 2,
              py: 1,
              backgroundColor: `${selectedTemplate.colorScheme}10`,
              borderRadius: '8px',
              border: `1px solid ${selectedTemplate.colorScheme}30`,
              flex: 1
            }}
          >
            <Box sx={{ color: selectedTemplate.colorScheme, fontSize: '20px' }}>
              {selectedTemplate.icon}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: selectedTemplate.colorScheme }}>
                {selectedTemplate.fullName}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {selectedTemplate.description}
              </Typography>
            </Box>
            {selectedTemplate.recommended && (
              <Chip
                icon={<StarIcon sx={{ fontSize: '14px !important' }} />}
                label="Recommended"
                size="small"
                sx={{
                  backgroundColor: '#ff6b35',
                  color: 'white',
                  fontSize: '0.65rem',
                  height: '20px',
                }}
              />
            )}
          </Box>
        )}
        
        <Button
          variant="outlined"
          startIcon={<PaletteIcon />}
          onClick={() => setDrawerOpen(true)}
          sx={{
            textTransform: 'none',
            borderColor: 'primary.main',
            color: 'primary.main',
            whiteSpace: 'nowrap',
            '&:hover': {
              backgroundColor: 'primary.main',
              color: 'white',
            },
          }}
        >
          {showButton ? 'Change Template' : 'Select Template'}
        </Button>
      </Box>

      {/* Template Selection Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 600, md: 800 },
            borderRadius: '12px 0 0 12px',
          }
        }}
      >
        <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Choose Template
            </Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Template Grid */}
          <Grid container spacing={2}>
            {templates.map((template) => (
              <Grid item xs={12} sm={6} key={template.id}>
                <Paper
                  elevation={selected === template.id ? 4 : 1}
                  sx={{
                    p: 2.5,
                    cursor: 'pointer',
                    border: selected === template.id ? `2px solid ${template.colorScheme}` : '1px solid transparent',
                    background: selected === template.id 
                      ? `linear-gradient(135deg, ${template.colorScheme}08 0%, ${template.colorScheme}15 100%)`
                      : 'white',
                    transition: 'all 0.2s ease-in-out',
                    position: 'relative',
                    minHeight: '180px',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                    },
                  }}
                  onClick={() => handleSelectTemplate(template.id)}
                >
                  {/* Recommended Badge */}
                  {template.recommended && (
                    <Chip
                      icon={<StarIcon sx={{ fontSize: '12px !important' }} />}
                      label="Recommended"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: -6,
                        right: 8,
                        backgroundColor: '#ff6b35',
                        color: 'white',
                        fontSize: '0.65rem',
                        height: '20px',
                      }}
                    />
                  )}

                  {/* Selected Indicator */}
                  {selected === template.id && (
                    <CheckCircleIcon
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        color: template.colorScheme,
                        fontSize: '20px',
                      }}
                    />
                  )}

                  {/* Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Box sx={{ 
                      color: selected === template.id ? template.colorScheme : 'text.secondary',
                      mr: 1.5,
                      fontSize: '24px'
                    }}>
                      {template.icon}
                    </Box>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 'bold',
                        color: selected === template.id ? template.colorScheme : 'text.primary'
                      }}
                    >
                      {template.fullName}
                    </Typography>
                  </Box>

                  {/* Description */}
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary', 
                      fontSize: '0.8rem',
                      lineHeight: 1.4,
                      mb: 1.5
                    }}
                  >
                    {template.description}
                  </Typography>

                  {/* Best For */}
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
                    <strong>Best for:</strong> <span style={{ color: template.colorScheme }}>{template.bestFor}</span>
                  </Typography>

                  {/* Features */}
                  <Stack direction="row" spacing={0.5} useFlexGap flexWrap sx={{ mb: 2 }}>
                    {template.features.map((feature, index) => (
                      <Chip
                        key={index}
                        label={feature}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: '0.65rem',
                          height: '18px',
                          borderColor: template.colorScheme,
                          color: template.colorScheme,
                        }}
                      />
                    ))}
                  </Stack>

                  {/* Preview Button */}
                  <Button
                    variant="text"
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={(e) => handlePreview(template, e)}
                    sx={{
                      color: template.colorScheme,
                      fontSize: '0.7rem',
                      textTransform: 'none',
                      p: 0.5,
                      minWidth: 'auto',
                      '&:hover': {
                        backgroundColor: `${template.colorScheme}10`,
                      },
                    }}
                  >
                    Preview
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Drawer>

      {/* Template Preview Modal */}
      <TemplatePreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        template={previewTemplate}
        onSelect={handleSelectFromPreview}
      />
    </>
  );
}

export default CompactTemplateSelector;
