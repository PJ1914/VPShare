import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  AutoAwesome as AIIcon,
  School as SchoolIcon
} from '@mui/icons-material';

const EducationSection = ({ data, updateData, onAIOptimize }) => {
  const [newEducation, setNewEducation] = useState({
    degree: '',
    institution: '',
    location: '',
    graduationDate: '',
    gpa: '',
    description: ''
  });

  const education = data.education || [];

  const handleAddEducation = () => {
    const updatedEducation = [...education, { ...newEducation, id: Date.now() }];
    updateData('education', updatedEducation);
    setNewEducation({
      degree: '',
      institution: '',
      location: '',
      graduationDate: '',
      gpa: '',
      description: ''
    });
  };

  const handleDeleteEducation = (id) => {
    const updatedEducation = education.filter(edu => edu.id !== id);
    updateData('education', updatedEducation);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          Education
        </Typography>
        <IconButton 
          size="small" 
          onClick={() => onAIOptimize('education')}
          sx={{ color: 'primary.main' }}
        >
          <AIIcon />
        </IconButton>
      </Box>

      {/* Add New Education Form */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <SchoolIcon sx={{ mr: 1 }} />
          Add Education
        </Typography>
        
        <Grid container spacing={2}>
          <Grid xs={12}>
            <TextField
              fullWidth
              size="small"
              label="Degree"
              placeholder="Bachelor of Science in Computer Science"
              value={newEducation.degree}
              onChange={(e) => setNewEducation(prev => ({ ...prev, degree: e.target.value }))}
            />
          </Grid>
          <Grid xs={12} sm={8}>
            <TextField
              fullWidth
              size="small"
              label="Institution"
              placeholder="University of California, Berkeley"
              value={newEducation.institution}
              onChange={(e) => setNewEducation(prev => ({ ...prev, institution: e.target.value }))}
            />
          </Grid>
          <Grid xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="Location"
              placeholder="Berkeley, CA"
              value={newEducation.location}
              onChange={(e) => setNewEducation(prev => ({ ...prev, location: e.target.value }))}
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Graduation Date"
              type="month"
              value={newEducation.graduationDate}
              onChange={(e) => setNewEducation(prev => ({ ...prev, graduationDate: e.target.value }))}
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="GPA (Optional)"
              placeholder="3.8/4.0"
              value={newEducation.gpa}
              onChange={(e) => setNewEducation(prev => ({ ...prev, gpa: e.target.value }))}
            />
          </Grid>
          <Grid xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              size="small"
              label="Additional Details (Optional)"
              placeholder="Relevant coursework, honors, activities..."
              value={newEducation.description}
              onChange={(e) => setNewEducation(prev => ({ ...prev, description: e.target.value }))}
            />
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleAddEducation}
            disabled={!newEducation.degree || !newEducation.institution}
          >
            Add Education
          </Button>
        </Box>
      </Paper>

      {/* Education List */}
      {education.map((edu) => (
        <Paper key={edu.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1 }}>
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
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {edu.description}
                </Typography>
              )}
            </Box>
            <IconButton 
              size="small" 
              onClick={() => handleDeleteEducation(edu.id)}
              sx={{ color: 'error.main' }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Paper>
      ))}

      {education.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
          <SchoolIcon sx={{ fontSize: 48, opacity: 0.3 }} />
          <Typography variant="body2">
            No education added yet. Add your educational background above.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default EducationSection;

