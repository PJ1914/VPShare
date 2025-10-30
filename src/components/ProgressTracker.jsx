import React from 'react';
import { Box, Typography, Chip, LinearProgress } from '@mui/material';
import { motion } from 'framer-motion';
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Star as StarIcon
} from '@mui/icons-material';

const ProgressTracker = ({ tabs, activeTab, completionData }) => {
  const calculateSectionCompletion = (tabLabel, data) => {
    const label = tabLabel.toLowerCase();
    
    switch (label) {
      case 'contact':
        const requiredContact = ['firstName', 'lastName', 'email', 'phone'];
        return requiredContact.filter(field => data[field]?.trim()).length / requiredContact.length;
      
      case 'summary':
        return data.summary && data.summary.length > 50 ? 1 : 0;
      
      case 'experience':
        return data.experiences && data.experiences.length > 0 ? 1 : 0;
      
      case 'education':
        return data.education && data.education.length > 0 ? 1 : 0;
      
      case 'skills':
        return data.skills && data.skills.length > 0 ? 1 : 0;
      
      case 'projects':
        return data.projects && data.projects.length > 0 ? 1 : 0;
      
      case 'certificates':
        return data.certificates && data.certificates.length > 0 ? 1 : 0;
      
      case 'languages':
        return data.languages && data.languages.length > 0 ? 1 : 0;
      
      default:
        return 0;
    }
  };

  const overallCompletion = tabs.reduce((acc, tab, index) => {
    return acc + calculateSectionCompletion(tab.label, completionData);
  }, 0) / tabs.length;

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
          Resume Progress
        </Typography>
        <Typography variant="body2" color="white" fontWeight="bold">
          {Math.round(overallCompletion * 100)}% Complete
        </Typography>
      </Box>
      
      <LinearProgress 
        variant="determinate" 
        value={overallCompletion * 100} 
        sx={{ 
          height: 8, 
          borderRadius: 4,
          bgcolor: 'rgba(255,255,255,0.3)',
          '& .MuiLinearProgress-bar': {
            bgcolor: 'white',
            borderRadius: 4
          }
        }} 
      />
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
        {tabs.map((tab, index) => {
          const completion = calculateSectionCompletion(tab.label, completionData);
          const isActive = index === activeTab;
          const isCompleted = completion >= (tab.required ? 1 : 0.5);
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Chip
                icon={
                  isCompleted ? (
                    <CheckCircleIcon sx={{ fontSize: 16 }} />
                  ) : (
                    <UncheckedIcon sx={{ fontSize: 16 }} />
                  )
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {tab.label}
                    {tab.required && <StarIcon sx={{ fontSize: 12 }} />}
                  </Box>
                }
                size="small"
                variant={isActive ? "filled" : "outlined"}
                color={isCompleted ? "success" : isActive ? "primary" : "default"}
                sx={{
                  color: isActive ? 'white' : isCompleted ? 'success.main' : 'rgba(255,255,255,0.7)',
                  borderColor: isActive ? 'white' : isCompleted ? 'success.main' : 'rgba(255,255,255,0.3)',
                  bgcolor: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
              />
            </motion.div>
          );
        })}
      </Box>
    </Box>
  );
};

export default ProgressTracker;
