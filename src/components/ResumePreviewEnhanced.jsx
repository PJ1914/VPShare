import React from 'react';
import { Box, Typography, Paper, Chip, Stack, Divider, Link, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import LanguageIcon from '@mui/icons-material/Language';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import CodeIcon from '@mui/icons-material/Code';
import StarIcon from '@mui/icons-material/Star';

const ResumePreviewEnhanced = ({ data, template = 'latex-modern', score = 0 }) => {
  // Helper function to format date
  const formatDate = (date) => {
    if (!date) return '';
    if (date.toLowerCase() === 'present') return 'Present';
    return date;
  };

  // Helper function to get full name
  const getFullName = () => {
    return `${data.firstName || ''} ${data.lastName || ''}`.trim();
  };

  // Template-specific styling
  const getTemplateStyles = () => {
    const baseStyles = {
      paper: {
        minHeight: '800px',
        p: 4,
        bgcolor: 'white',
        color: 'black',
        fontFamily: '"Times New Roman", serif',
        lineHeight: 1.6
      }
    };

    switch (template) {
      case 'latex-modern':
        return {
          ...baseStyles,
          paper: {
            ...baseStyles.paper,
            fontFamily: '"Inter", "Helvetica", sans-serif',
          },
          header: {
            borderBottom: '2px solid #2563eb',
            pb: 2,
            mb: 3
          },
          sectionTitle: {
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: '#2563eb',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            borderBottom: '1px solid #2563eb',
            pb: 0.5,
            mb: 2,
          },
          contactIcon: { color: '#2563eb', fontSize: 16 }
        };

      case 'latex-classic':
        return {
          ...baseStyles,
          header: {
            borderBottom: '1px solid #000',
            pb: 2,
            mb: 3
          },
          sectionTitle: {
            fontSize: '1rem',
            fontWeight: 'bold',
            color: '#1f2937',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            borderBottom: '0.5px solid #000',
            pb: 0.3,
            mb: 1.5,
          },
          contactIcon: { color: '#1f2937', fontSize: 16 }
        };

      case 'latex-tech':
        return {
          ...baseStyles,
          paper: {
            ...baseStyles.paper,
            fontFamily: '"Fira Code", "Courier New", monospace',
          },
          header: {
            borderBottom: '2px solid #059669',
            pb: 2,
            mb: 3
          },
          sectionTitle: {
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: '#059669',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            borderBottom: '1px solid #059669',
            pb: 0.5,
            mb: 2,
          },
          contactIcon: { color: '#059669', fontSize: 16 }
        };

      case 'latex-academic':
        return {
          ...baseStyles,
          header: {
            borderBottom: '1px solid #7c2d12',
            pb: 2,
            mb: 3
          },
          sectionTitle: {
            fontSize: '1rem',
            fontWeight: 'bold',
            color: '#7c2d12',
            textTransform: 'none',
            borderBottom: '0.5px solid #7c2d12',
            pb: 0.3,
            mb: 1.5,
          },
          contactIcon: { color: '#7c2d12', fontSize: 16 }
        };

      default:
        return baseStyles;
    }
  };

  const styles = getTemplateStyles();

  const LaTeXSection = ({ title, children, icon }) => (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ...styles.sectionTitle }}>
        {icon && React.cloneElement(icon, { sx: { fontSize: 20, color: 'inherit' } })}
        {title}
      </Box>
      {children}
    </Box>
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Paper elevation={3} sx={styles.paper}>
        {/* Resume Score Indicator */}
        {score > 0 && (
          <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }}>
            <Chip
              icon={<StarIcon sx={{ fontSize: 16 }} />}
              label={`Score: ${score}/100`}
              size="small"
              color={score >= 80 ? 'success' : score >= 60 ? 'warning' : 'error'}
              sx={{ fontWeight: 'bold' }}
            />
          </Box>
        )}

        {/* Header Section */}
        <Box sx={styles.header}>
          <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
            {getFullName() || 'Your Name'}
          </Typography>
          
          {data.jobTitle && (
            <Typography 
              variant="h6" 
              textAlign="center" 
              color="text.secondary" 
              sx={{ fontStyle: 'italic', mb: 2 }}
            >
              {data.jobTitle}
            </Typography>
          )}

          {/* Contact Information */}
          <Stack 
            direction="row" 
            flexWrap="wrap" 
            justifyContent="center" 
            divider={<Divider orientation="vertical" flexItem />}
            spacing={2}
          >
            {data.email && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <EmailIcon sx={styles.contactIcon} />
                <Typography variant="body2">{data.email}</Typography>
              </Box>
            )}
            {data.phone && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PhoneIcon sx={styles.contactIcon} />
                <Typography variant="body2">{data.phone}</Typography>
              </Box>
            )}
            {data.location && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationOnIcon sx={styles.contactIcon} />
                <Typography variant="body2">{data.location}</Typography>
              </Box>
            )}
          </Stack>

          {/* Professional Links */}
          <Stack 
            direction="row" 
            flexWrap="wrap" 
            justifyContent="center" 
            spacing={2}
            sx={{ mt: 1 }}
          >
            {data.linkedin && (
              <Link href={data.linkedin} target="_blank" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, textDecoration: 'none' }}>
                <LinkedInIcon sx={styles.contactIcon} />
                <Typography variant="body2">LinkedIn</Typography>
              </Link>
            )}
            {data.github && (
              <Link href={data.github} target="_blank" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, textDecoration: 'none' }}>
                <GitHubIcon sx={styles.contactIcon} />
                <Typography variant="body2">GitHub</Typography>
              </Link>
            )}
            {data.website && (
              <Link href={data.website} target="_blank" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, textDecoration: 'none' }}>
                <LanguageIcon sx={styles.contactIcon} />
                <Typography variant="body2">Website</Typography>
              </Link>
            )}
          </Stack>
        </Box>

        {/* Summary/Objective Section */}
        {data.summary && (
          <LaTeXSection title="Professional Summary">
            <Typography variant="body1" sx={{ textAlign: 'justify' }}>
              {data.summary}
            </Typography>
          </LaTeXSection>
        )}

        {/* Experience Section */}
        {data.experiences && data.experiences.length > 0 && (
          <LaTeXSection title="Professional Experience" icon={<WorkIcon />}>
            {data.experiences.map((exp, index) => (
              <Box key={index} sx={{ mb: index < data.experiences.length - 1 ? 2 : 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {exp.title || 'Job Title'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {exp.company || 'Company Name'} {exp.location && `• ${exp.location}`}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', minWidth: 'fit-content', ml: 2 }}>
                    {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
                  </Typography>
                </Box>
                {exp.description && (
                  <Typography variant="body2" sx={{ mt: 1, textAlign: 'justify' }}>
                    {exp.description}
                  </Typography>
                )}
              </Box>
            ))}
          </LaTeXSection>
        )}

        {/* Education Section */}
        {data.education && data.education.length > 0 && (
          <LaTeXSection title="Education" icon={<SchoolIcon />}>
            {data.education.map((edu, index) => (
              <Box key={index} sx={{ mb: index < data.education.length - 1 ? 1.5 : 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {edu.degree || 'Degree'} {edu.major && `in ${edu.major}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {edu.school || 'Institution Name'}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', minWidth: 'fit-content', ml: 2 }}>
                    {edu.year || edu.graduationDate || 'Year'}
                  </Typography>
                </Box>
                {edu.gpa && (
                  <Typography variant="body2" color="text.secondary">
                    GPA: {edu.gpa}
                  </Typography>
                )}
              </Box>
            ))}
          </LaTeXSection>
        )}

        {/* Skills Section */}
        {data.skills && data.skills.length > 0 && (
          <LaTeXSection title="Technical Skills" icon={<CodeIcon />}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {data.skills.map((skill, index) => (
                <Chip
                  key={index}
                  label={typeof skill === 'string' ? skill : skill.name}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    borderColor: styles.contactIcon.color,
                    color: styles.contactIcon.color,
                    '&:hover': {
                      bgcolor: `${styles.contactIcon.color}10`
                    }
                  }}
                />
              ))}
            </Box>
          </LaTeXSection>
        )}

        {/* Projects Section */}
        {data.projects && data.projects.length > 0 && (
          <LaTeXSection title="Projects">
            {data.projects.map((project, index) => (
              <Box key={index} sx={{ mb: index < data.projects.length - 1 ? 2 : 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {project.name || 'Project Name'}
                  </Typography>
                  {project.date && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      {project.date}
                    </Typography>
                  )}
                </Box>
                {project.description && (
                  <Typography variant="body2" sx={{ textAlign: 'justify' }}>
                    {project.description}
                  </Typography>
                )}
                {project.technologies && project.technologies.length > 0 && (
                  <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {project.technologies.map((tech, techIndex) => (
                      <Chip
                        key={techIndex}
                        label={tech}
                        size="small"
                        sx={{ 
                          bgcolor: `${styles.contactIcon.color}10`,
                          color: styles.contactIcon.color,
                          fontSize: '0.7rem'
                        }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            ))}
          </LaTeXSection>
        )}

        {/* Certificates Section */}
        {data.certificates && data.certificates.length > 0 && (
          <LaTeXSection title="Certifications">
            {data.certificates.map((cert, index) => (
              <Box key={index} sx={{ mb: index < data.certificates.length - 1 ? 1 : 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {cert.name || 'Certification Name'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {cert.issuer || 'Issuing Organization'}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    {cert.date || 'Date'}
                  </Typography>
                </Box>
              </Box>
            ))}
          </LaTeXSection>
        )}

        {/* Languages Section */}
        {data.languages && data.languages.length > 0 && (
          <LaTeXSection title="Languages">
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {data.languages.map((lang, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1" fontWeight="medium">
                    {typeof lang === 'string' ? lang : lang.name}
                  </Typography>
                  {typeof lang === 'object' && lang.proficiency && (
                    <Typography variant="body2" color="text.secondary">
                      ({lang.proficiency})
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </LaTeXSection>
        )}

        {/* Empty State */}
        {!getFullName() && !data.summary && (!data.experiences || data.experiences.length === 0) && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Start Building Your Resume
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Fill out the sections on the left to see your resume come to life
            </Typography>
          </Box>
        )}
      </Paper>
    </motion.div>
  );
};

export default ResumePreviewEnhanced;
