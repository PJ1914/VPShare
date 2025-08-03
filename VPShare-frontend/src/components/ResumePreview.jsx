import React from 'react';
import { Box, Typography, Paper, Chip, Stack, Divider, Link } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import LanguageIcon from '@mui/icons-material/Language';
import TwitterIcon from '@mui/icons-material/Twitter';
import ArticleIcon from '@mui/icons-material/Article';
import CodeIcon from '@mui/icons-material/Code';

// LaTeX-style section component
const LaTeXSection = ({ title, children, template }) => {
  const getSectionStyles = () => {
    switch (template) {
      case 'latex-modern':
        return {
          title: {
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: '#2563eb',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            borderBottom: '1px solid #2563eb',
            pb: 0.5,
            mb: 2,
          }
        };
      case 'latex-classic':
        return {
          title: {
            fontSize: '1rem',
            fontWeight: 'bold',
            color: '#1f2937',
            fontFamily: '"Times New Roman", serif',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            borderBottom: '0.5px solid #000',
            pb: 0.3,
            mb: 1.5,
          }
        };
      case 'latex-tech':
        return {
          title: {
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: '#059669',
            fontFamily: '"JetBrains Mono", monospace',
            textTransform: 'uppercase',
            letterSpacing: '0.3px',
            borderLeft: '4px solid #059669',
            pl: 1,
            mb: 2,
          }
        };
      case 'latex-executive':
        return {
          title: {
            fontSize: '1rem',
            fontWeight: 'bold',
            color: '#7c2d12',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            background: 'rgba(124, 45, 18, 0.1)',
            px: 1,
            py: 0.5,
            mb: 2,
          }
        };
      case 'latex-academic':
        return {
          title: {
            fontSize: '1rem',
            fontWeight: 'bold',
            color: '#4338ca',
            fontFamily: '"Times New Roman", serif',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            borderTop: '1px solid #4338ca',
            borderBottom: '1px solid #4338ca',
            py: 0.5,
            mb: 2,
          }
        };
      default:
        return {
          title: {
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: '#2563eb',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            borderBottom: '1px solid #2563eb',
            pb: 0.5,
            mb: 2,
          }
        };
    }
  };

  const styles = getSectionStyles();

  return (
    <Box sx={{ mb: 3 }}>
      <Typography sx={styles.title}>
        {title}
      </Typography>
      {children}
    </Box>
  );
};

// Professional links component
const ProfessionalLinks = ({ data, template }) => {
  const links = [
    { key: 'email', value: data.email, icon: EmailIcon, prefix: 'mailto:' },
    { key: 'phone', value: data.phone, icon: PhoneIcon, prefix: 'tel:' },
    { key: 'location', value: data.location, icon: LocationOnIcon },
    { key: 'linkedin', value: data.linkedin, icon: LinkedInIcon, prefix: 'https://' },
    { key: 'github', value: data.github, icon: GitHubIcon, prefix: 'https://' },
    { key: 'website', value: data.website, icon: LanguageIcon, prefix: 'https://' },
    { key: 'portfolio', value: data.portfolio, icon: CodeIcon, prefix: 'https://' },
    { key: 'twitter', value: data.twitter, icon: TwitterIcon, prefix: 'https://' },
    { key: 'blog', value: data.blog, icon: ArticleIcon, prefix: 'https://' },
  ].filter(link => link.value);

  if (links.length === 0) return null;

  const getContactStyles = () => {
    if (template === 'latex-classic' || template === 'latex-academic') {
      return {
        direction: 'column',
        alignItems: 'center',
        spacing: 0.5,
        fontSize: '0.85rem',
        fontFamily: '"Times New Roman", serif',
      };
    }
    return {
      direction: { xs: 'column', sm: 'row' },
      alignItems: 'center',
      spacing: 2,
      fontSize: '0.9rem',
    };
  };

  const contactStyles = getContactStyles();

  return (
    <Stack 
      direction={contactStyles.direction}
      spacing={contactStyles.spacing}
      alignItems={contactStyles.alignItems}
      justifyContent="center"
      sx={{ mb: 3 }}
    >
      {links.map((link) => {
        const IconComponent = link.icon;
        const href = link.prefix && !link.value.startsWith('http') && link.key !== 'phone' && link.key !== 'email' 
          ? `${link.prefix}${link.value}`
          : link.prefix && (link.key === 'phone' || link.key === 'email')
          ? `${link.prefix}${link.value}`
          : link.value;

        return (
          <Box key={link.key} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconComponent sx={{ fontSize: '1rem', color: 'text.secondary' }} />
            {link.key === 'location' ? (
              <Typography variant="body2" sx={{ fontSize: contactStyles.fontSize, fontFamily: contactStyles.fontFamily }}>
                {link.value}
              </Typography>
            ) : (
              <Link 
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  textDecoration: 'none',
                  color: 'text.primary',
                  fontSize: contactStyles.fontSize,
                  fontFamily: contactStyles.fontFamily,
                  '&:hover': { 
                    textDecoration: 'underline',
                    color: 'primary.main'
                  }
                }}
              >
                {link.value}
              </Link>
            )}
          </Box>
        );
      })}
    </Stack>
  );
};

function ResumePreview({ data, template = 'latex-modern', aiContent }) {
  // Process skills into array - handle both string and array formats
  const skillsArray = Array.isArray(data.skills) 
    ? data.skills.map(skill => typeof skill === 'object' ? skill.name : skill)
    : data.skills 
      ? data.skills.split(',').map(skill => skill.trim()).filter(skill => skill) 
      : [];
  
  // Template-specific styling
  const getTemplateStyles = () => {
    switch (template) {
      case 'latex-modern':
        return {
          paper: {
            fontFamily: '"Inter", "Helvetica", sans-serif',
            lineHeight: 1.6,
            fontSize: '0.9rem',
          },
          header: {
            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
            color: 'white',
            p: 4,
            textAlign: 'center',
          },
        };
      case 'latex-classic':
        return {
          paper: {
            fontFamily: '"Times New Roman", serif',
            lineHeight: 1.5,
            fontSize: '0.9rem',
          },
          header: {
            textAlign: 'center',
            p: 3,
            borderBottom: '2px solid #000',
          },
        };
      case 'latex-tech':
        return {
          paper: {
            fontFamily: '"JetBrains Mono", "Consolas", monospace',
            lineHeight: 1.7,
            fontSize: '0.85rem',
            backgroundColor: '#f8fafc',
          },
          header: {
            background: 'linear-gradient(135deg, #065f46 0%, #059669 100%)',
            color: 'white',
            p: 3,
            textAlign: 'left',
          },
        };
      case 'latex-executive':
        return {
          paper: {
            fontFamily: '"Georgia", serif',
            lineHeight: 1.6,
            fontSize: '0.9rem',
          },
          header: {
            background: 'linear-gradient(135deg, #7c2d12 0%, #dc2626 100%)',
            color: 'white',
            p: 4,
            textAlign: 'center',
          },
        };
      case 'latex-academic':
        return {
          paper: {
            fontFamily: '"Times New Roman", serif',
            lineHeight: 1.5,
            fontSize: '0.85rem',
          },
          header: {
            textAlign: 'center',
            p: 2,
            borderTop: '3px solid #4338ca',
            borderBottom: '1px solid #4338ca',
          },
        };
      default:
        return {
          paper: {
            fontFamily: '"Inter", "Helvetica", sans-serif',
            lineHeight: 1.6,
            fontSize: '0.9rem',
          },
          header: {
            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
            color: 'white',
            p: 4,
            textAlign: 'center',
          },
        };
    }
  };

  const templateStyles = getTemplateStyles();

  // If there's AI content, display it with enhanced styling
  if (aiContent) {
    return (
      <Paper 
        id="resume-preview-content"
        elevation={0}
        sx={{
          boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          overflow: 'hidden',
          minHeight: '800px',
          ...templateStyles.paper,
        }}
      >
        <Box sx={{ p: { xs: 3, md: 5 } }}>
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <Typography variant="h4" sx={{ 
                  fontWeight: 'bold', 
                  mb: 2, 
                  color: 'primary.main',
                  textAlign: 'center',
                  fontSize: '1.8rem',
                }}>
                  {children}
                </Typography>
              ),
              h2: ({ children }) => (
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 'bold', 
                    mt: 3, 
                    mb: 1.5, 
                    color: 'text.primary',
                    borderBottom: '2px solid',
                    borderColor: 'primary.main',
                    pb: 0.5,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontSize: '1rem',
                  }}
                >
                  {children}
                </Typography>
              ),
              h3: ({ children }) => (
                <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 2, mb: 1, color: 'text.primary' }}>
                  {children}
                </Typography>
              ),
              p: ({ children }) => (
                <Typography variant="body1" sx={{ mb: 1.5, lineHeight: 1.6, color: 'text.secondary' }}>
                  {children}
                </Typography>
              ),
              ul: ({ children }) => (
                <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                  {children}
                </Box>
              ),
              li: ({ children }) => (
                <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.5, color: 'text.secondary' }}>
                  {children}
                </Typography>
              ),
            }}
          >
            {aiContent}
          </ReactMarkdown>
        </Box>
      </Paper>
    );
  }

  // Original preview with enhanced LaTeX-style templates
  return (
    <Paper 
      id="resume-preview-content"
      elevation={0}
      sx={{
        boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        overflow: 'hidden',
        minHeight: '800px',
        ...templateStyles.paper,
      }}
    >
      {/* Header Section */}
      <Box sx={templateStyles.header}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 'bold', 
            mb: 1,
            fontSize: template === 'latex-academic' ? '1.5rem' : '2rem',
            fontFamily: template === 'latex-classic' || template === 'latex-academic' ? '"Times New Roman", serif' : 'inherit',
          }}
        >
          {(data.firstName && data.lastName) 
            ? `${data.firstName} ${data.lastName}` 
            : data.name || 'Your Name'}
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 2, 
            opacity: (template && (template.includes('latex-classic') || template.includes('latex-academic'))) ? 1 : 0.9,
            fontSize: '1.1rem',
            fontFamily: template === 'latex-classic' || template === 'latex-academic' ? '"Times New Roman", serif' : 'inherit',
          }}
        >
          {data.jobTitle || data.title || 'Professional Title'}
        </Typography>
        
        {/* Professional Links */}
        <ProfessionalLinks data={data} template={template} />
      </Box>

      {/* Content Section */}
      <Box sx={{ p: { xs: 3, md: 4 } }}>
        {/* Professional Summary */}
        {(data.summary || data.objective) && (
          <LaTeXSection title="Professional Summary" template={template}>
            <Typography 
              variant="body1" 
              sx={{ 
                lineHeight: 1.6, 
                color: 'text.secondary',
                textAlign: 'justify',
                fontStyle: template === 'latex-academic' ? 'italic' : 'normal',
              }}
            >
              {data.summary || data.objective}
            </Typography>
          </LaTeXSection>
        )}

        {/* Technical Skills */}
        {skillsArray.length > 0 && (
          <LaTeXSection title="Technical Skills" template={template}>
            {template === 'latex-tech' ? (
              <Box sx={{ fontFamily: '"JetBrains Mono", monospace' }}>
                {skillsArray.map((skill, index) => (
                  <Typography
                    key={index}
                    component="span"
                    sx={{
                      display: 'inline-block',
                      backgroundColor: 'rgba(5, 150, 105, 0.1)',
                      color: '#065f46',
                      px: 1,
                      py: 0.5,
                      mr: 1,
                      mb: 1,
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      border: '1px solid rgba(5, 150, 105, 0.2)',
                    }}
                  >
                    {skill}
                  </Typography>
                ))}
              </Box>
            ) : template === 'latex-classic' || template === 'latex-academic' ? (
              <Typography variant="body2" sx={{ lineHeight: 1.5, color: 'text.secondary' }}>
                {skillsArray.join(' • ')}
              </Typography>
            ) : (
              <Stack direction="row" spacing={1} useFlexGap flexWrap>
                {skillsArray.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    variant="outlined"
                    size="small"
                    sx={{
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      fontSize: '0.8rem',
                      '&:hover': {
                        backgroundColor: 'primary.main',
                        color: 'white',
                      },
                    }}
                  />
                ))}
              </Stack>
            )}
          </LaTeXSection>
        )}

        {/* Professional Experience */}
        {(data.experiences && data.experiences.length > 0) || data.experience && (
          <LaTeXSection title="Professional Experience" template={template}>
            {data.experiences && data.experiences.length > 0 ? (
              data.experiences.map((exp, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {exp.jobTitle} - {exp.company}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {exp.location} • {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-line' }}>
                    {exp.description}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography 
                variant="body1" 
                sx={{ 
                  lineHeight: 1.6, 
                  color: 'text.secondary', 
                  whiteSpace: 'pre-line',
                  textAlign: 'justify',
                }}
              >
                {data.experience}
              </Typography>
            )}
          </LaTeXSection>
        )}

        {/* Education */}
        {(data.education && data.education.length > 0) || data.education && (
          <LaTeXSection title="Education" template={template}>
            {Array.isArray(data.education) && data.education.length > 0 ? (
              data.education.map((edu, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {edu.degree}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {edu.institution} • {edu.location}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Graduated: {edu.graduationDate} {edu.gpa && `• GPA: ${edu.gpa}`}
                  </Typography>
                  {edu.description && (
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {edu.description}
                    </Typography>
                  )}
                </Box>
              ))
            ) : (
              <Typography 
                variant="body1" 
                sx={{ 
                  lineHeight: 1.6, 
                  color: 'text.secondary', 
                  whiteSpace: 'pre-line',
                  textAlign: 'justify',
                }}
              >
                {data.education}
              </Typography>
            )}
          </LaTeXSection>
        )}

        {/* Empty State */}
        {!data.firstName && !data.lastName && !data.name && !data.jobTitle && !data.title && !data.summary && !data.objective && (!data.skills || data.skills.length === 0) && (!data.experiences || data.experiences.length === 0) && !data.experience && (!data.education || data.education.length === 0) && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
              Professional Resume Preview
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Fill out the form to see your LaTeX-style resume preview
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
}

export default ResumePreview;
