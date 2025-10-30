import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  Preview as PreviewIcon,
  Business as BusinessIcon,
  School as AcademicIcon,
  Code as TechIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { resumeService } from '../services/resumeService';

const TemplateSelectorModal = ({ open, onClose, selectedTemplate, onTemplateSelect }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [templates, setTemplates] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await resumeService.getTemplates();
      setTemplates(response.templates || {});
    } catch (error) {
      console.error('Failed to load templates:', error);
      // Fallback templates
      setTemplates({
        "latex-modern": {
          name: "Modern LaTeX",
          description: "Clean, professional LaTeX-inspired design",
          best_for: "Tech & Business professionals",
          features: ["Clean", "Professional", "ATS-Friendly"]
        },
        "latex-classic": {
          name: "Classic LaTeX",
          description: "Traditional academic resume format",
          best_for: "Academic positions",
          features: ["Traditional", "Academic"]
        },
        "latex-tech": {
          name: "Tech LaTeX",
          description: "Technology-focused with skills emphasis",
          best_for: "Developers & Engineers",
          features: ["Tech-Focused", "Modern"]
        },
        "latex-executive": {
          name: "Executive LaTeX",
          description: "Executive-level with achievements focus",
          best_for: "Senior Management",
          features: ["Executive", "Premium"]
        },
        "latex-academic": {
          name: "Academic LaTeX",
          description: "Academic CV with research focus",
          best_for: "Researchers",
          features: ["Academic CV", "Research"]
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const getTemplateIcon = (templateId) => {
    if (templateId.includes('tech')) return <TechIcon />;
    if (templateId.includes('academic')) return <AcademicIcon />;
    if (templateId.includes('executive')) return <BusinessIcon />;
    return <BusinessIcon />;
  };

  const getTemplateColor = (templateId) => {
    if (templateId.includes('tech')) return '#4CAF50';
    if (templateId.includes('academic')) return '#FF9800';
    if (templateId.includes('executive')) return '#9C27B0';
    if (templateId.includes('classic')) return '#795548';
    return '#2196F3';
  };

  const handleTemplateSelect = (templateId) => {
    onTemplateSelect(templateId);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
          minHeight: isMobile ? '100vh' : '80vh'
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Choose Resume Template
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Select a template that best fits your career goals
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography>Loading templates...</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            <AnimatePresence>
              {Object.entries(templates).map(([templateId, template], index) => (
                <Grid item xs={12} sm={6} md={4} key={templateId}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      sx={{
                        height: '100%',
                        cursor: 'pointer',
                        border: selectedTemplate === templateId ? `2px solid ${getTemplateColor(templateId)}` : '2px solid transparent',
                        '&:hover': {
                          boxShadow: theme.shadows[8],
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => handleTemplateSelect(templateId)}
                    >
                      <CardContent sx={{ p: 3 }}>
                        {/* Template Header */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {React.cloneElement(getTemplateIcon(templateId), {
                              sx: { color: getTemplateColor(templateId), fontSize: 24 }
                            })}
                            <Typography variant="h6" fontWeight="bold">
                              {template.name}
                            </Typography>
                          </Box>
                          
                          {selectedTemplate === templateId && (
                            <CheckIcon sx={{ color: getTemplateColor(templateId) }} />
                          )}
                        </Box>

                        {/* Template Description */}
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {template.description}
                        </Typography>

                        {/* Best For */}
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" fontWeight="bold" gutterBottom>
                            Best for:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {template.best_for}
                          </Typography>
                        </Box>

                        {/* Features */}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                          {template.features?.map((feature, featureIndex) => (
                            <Chip
                              key={featureIndex}
                              label={feature}
                              size="small"
                              sx={{
                                bgcolor: `${getTemplateColor(templateId)}20`,
                                color: getTemplateColor(templateId),
                                fontSize: '0.75rem'
                              }}
                            />
                          ))}
                        </Box>

                        {/* Preview Button */}
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<PreviewIcon />}
                          fullWidth
                          sx={{
                            borderColor: getTemplateColor(templateId),
                            color: getTemplateColor(templateId),
                            '&:hover': {
                              borderColor: getTemplateColor(templateId),
                              bgcolor: `${getTemplateColor(templateId)}10`
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle preview
                            console.log('Preview template:', templateId);
                          }}
                        >
                          Preview
                        </Button>

                        {/* Popular/Recommended Badge */}
                        {(templateId === 'latex-modern' || templateId === 'latex-tech') && (
                          <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                            <Chip
                              icon={<StarIcon sx={{ fontSize: 14 }} />}
                              label="Popular"
                              size="small"
                              color="warning"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </AnimatePresence>
          </Grid>
        )}

        {/* Template Comparison */}
        <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Template Comparison Guide
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">Modern LaTeX</Typography>
                <Typography variant="body2" color="text.secondary">
                  Perfect for tech professionals and modern industries
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">Classic LaTeX</Typography>
                <Typography variant="body2" color="text.secondary">
                  Traditional format for conservative industries
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">Tech LaTeX</Typography>
                <Typography variant="body2" color="text.secondary">
                  Optimized for software engineers and developers
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">Academic LaTeX</Typography>
                <Typography variant="body2" color="text.secondary">
                  Designed for researchers and academic positions
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => handleTemplateSelect(selectedTemplate)}
          disabled={!selectedTemplate}
        >
          Use Selected Template
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TemplateSelectorModal;
