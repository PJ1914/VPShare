import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  Chip,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  AutoAwesome as AIIcon,
  Work as WorkIcon
} from '@mui/icons-material';

const ExperienceSection = ({ data, updateData, onAIOptimize }) => {
  const [editingId, setEditingId] = useState(null);
  const [newExperience, setNewExperience] = useState({
    jobTitle: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    description: '',
    current: false
  });

  const experiences = data.experiences || [];

  const handleAddExperience = () => {
    const updatedExperiences = [...experiences, { ...newExperience, id: Date.now() }];
    updateData('experiences', updatedExperiences);
    setNewExperience({
      jobTitle: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      description: '',
      current: false
    });
  };

  const handleDeleteExperience = (id) => {
    const updatedExperiences = experiences.filter(exp => exp.id !== id);
    updateData('experiences', updatedExperiences);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          Professional Experience
        </Typography>
        <IconButton 
          size="small" 
          onClick={() => onAIOptimize('experiences')}
          sx={{ color: 'primary.main' }}
        >
          <AIIcon />
        </IconButton>
      </Box>

      {/* Add New Experience Form */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <WorkIcon sx={{ mr: 1 }} />
          Add New Experience
        </Typography>
        
        <Grid container spacing={2}>
          <Grid xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Job Title"
              value={newExperience.jobTitle}
              onChange={(e) => setNewExperience(prev => ({ ...prev, jobTitle: e.target.value }))}
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Company"
              value={newExperience.company}
              onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))}
            />
          </Grid>
          <Grid xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="Location"
              value={newExperience.location}
              onChange={(e) => setNewExperience(prev => ({ ...prev, location: e.target.value }))}
            />
          </Grid>
          <Grid xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="Start Date"
              type="month"
              value={newExperience.startDate}
              onChange={(e) => setNewExperience(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </Grid>
          <Grid xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="End Date"
              type="month"
              value={newExperience.endDate}
              onChange={(e) => setNewExperience(prev => ({ ...prev, endDate: e.target.value }))}
              disabled={newExperience.current}
            />
          </Grid>
          <Grid xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              size="small"
              label="Description"
              placeholder="• Describe your key achievements and responsibilities..."
              value={newExperience.description}
              onChange={(e) => setNewExperience(prev => ({ ...prev, description: e.target.value }))}
            />
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleAddExperience}
            disabled={!newExperience.jobTitle || !newExperience.company}
          >
            Add Experience
          </Button>
        </Box>
      </Paper>

      {/* Experience List */}
      {experiences.map((experience) => (
        <Paper key={experience.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {experience.jobTitle}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {experience.company} • {experience.location}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {experience.startDate} - {experience.current ? 'Present' : experience.endDate}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-line' }}>
                {experience.description}
              </Typography>
            </Box>
            <IconButton 
              size="small" 
              onClick={() => handleDeleteExperience(experience.id)}
              sx={{ color: 'error.main' }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Paper>
      ))}

      {experiences.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
          <WorkIcon sx={{ fontSize: 48, opacity: 0.3 }} />
          <Typography variant="body2">
            No experience added yet. Add your first job experience above.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ExperienceSection;
