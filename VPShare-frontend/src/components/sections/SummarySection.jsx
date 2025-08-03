import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  CircularProgress,
  Chip,
  Stack
} from '@mui/material';
import {
  AutoAwesome as AIIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';

const SummarySection = ({ 
  data, 
  onChange, 
  onSectionImprovement, 
  targetRole, 
  industry, 
  isLoading 
}) => {
  const [isImproving, setIsImproving] = useState(false);

  const handleSummaryChange = (value) => {
    onChange('summary', value);
  };

  const handleAIImprovement = async () => {
    if (!data.summary?.trim()) {
      return;
    }

    setIsImproving(true);
    try {
      const improvedContent = await onSectionImprovement('summary', data.summary);
      if (improvedContent) {
        handleSummaryChange(improvedContent);
      }
    } catch (error) {
      console.error('Failed to improve summary:', error);
    } finally {
      setIsImproving(false);
    }
  };

  const getSummaryTips = () => {
    const tips = [
      'Start with your years of experience',
      'Highlight key achievements with numbers',
      'Include relevant skills and technologies',
      'Keep it 2-3 sentences and impactful'
    ];

    if (targetRole) {
      tips.push(`Emphasize experience relevant to ${targetRole}`);
    }
    if (industry) {
      tips.push(`Include ${industry} industry knowledge`);
    }

    return tips;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Professional Summary
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton 
            size="small" 
            onClick={handleAIImprovement}
            disabled={isImproving || isLoading || !data.summary?.trim()}
            sx={{ color: 'primary.main' }}
          >
            {isImproving ? <CircularProgress size={16} /> : <AIIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* Target Role/Industry Display */}
      {(targetRole || industry) && (
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            {targetRole && (
              <Chip 
                label={`Target: ${targetRole}`} 
                size="small" 
                color="primary" 
                variant="outlined" 
              />
            )}
            {industry && (
              <Chip 
                label={`Industry: ${industry}`} 
                size="small" 
                color="secondary" 
                variant="outlined" 
              />
            )}
          </Stack>
        </Box>
      )}
      
      <TextField
        fullWidth
        multiline
        rows={4}
        placeholder={`Write a compelling professional summary${targetRole ? ` for a ${targetRole} position` : ''}${industry ? ` in ${industry}` : ''}. Highlight your key achievements, relevant experience, and career objectives...`}
        value={data.summary || ''}
        onChange={(e) => handleSummaryChange(e.target.value)}
        variant="outlined"
        sx={{ mb: 2 }}
        disabled={isLoading}
      />

      {/* AI Tips */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          bgcolor: 'grey.50', 
          border: '1px solid', 
          borderColor: 'grey.200',
          mb: 2 
        }}
      >
        <Typography variant="subtitle2" color="primary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
          <CheckIcon sx={{ mr: 1, fontSize: 16 }} />
          Professional Summary Tips
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: 2 }}>
          {getSummaryTips().map((tip, index) => (
            <Typography 
              key={index} 
              variant="caption" 
              color="text.secondary" 
              component="li"
              sx={{ mb: 0.5 }}
            >
              {tip}
            </Typography>
          ))}
        </Box>
      </Paper>
      
      <Typography variant="caption" color="text.secondary">
        A strong summary should be 2-3 sentences highlighting your most relevant experience and skills
        {targetRole && ` for ${targetRole} positions`}.
      </Typography>
    </Box>
  );
};

export default SummarySection;
