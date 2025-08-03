import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  IconButton,
  
  Card,
  CardContent,
  InputAdornment,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Grid
} from '@mui/material';

import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Language as LanguageIcon,
  AutoAwesome as AIIcon,
  Public as GlobalIcon
} from '@mui/icons-material';

function LanguagesSection({ data, onChange, onAIAnalysis }) {
  const [editingIndex, setEditingIndex] = useState(-1);
  const [newLanguage, setNewLanguage] = useState({
    name: '',
    proficiency: 'Intermediate',
    certification: ''
  });

  const languages = data.languages || [];

  const proficiencyLevels = [
    'Beginner',
    'Elementary',
    'Intermediate',
    'Upper Intermediate',
    'Advanced',
    'Native'
  ];

  const handleAdd = () => {
    if (newLanguage.name.trim()) {
      onChange('languages', [...languages, { ...newLanguage, id: Date.now() }]);
      setNewLanguage({
        name: '',
        proficiency: 'Intermediate',
        certification: ''
      });
    }
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
  };

  const handleSave = (index, updatedLanguage) => {
    const updatedLanguages = [...languages];
    updatedLanguages[index] = updatedLanguage;
    onChange('languages', updatedLanguages);
    setEditingIndex(-1);
  };

  const handleDelete = (index) => {
    const updatedLanguages = languages.filter((_, i) => i !== index);
    onChange('languages', updatedLanguages);
  };

  const handleAIOptimize = () => {
    onAIAnalysis('languages_optimization');
  };

  const getProficiencyColor = (proficiency) => {
    const colors = {
      'Beginner': 'error',
      'Elementary': 'warning',
      'Intermediate': 'info',
      'Upper Intermediate': 'primary',
      'Advanced': 'success',
      'Native': 'success'
    };
    return colors[proficiency] || 'default';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" color="primary">
          Languages
        </Typography>
        <Tooltip title="AI Optimize Languages">
          <IconButton onClick={handleAIOptimize} color="primary" size="small">
            <AIIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Add languages you speak to showcase your communication abilities and global perspective.
      </Typography>

      {/* Add New Language */}
      <Paper sx={{ p: 3, mb: 3, border: '2px dashed #e0e0e0' }}>
        <Typography variant="h6" gutterBottom>
          Add New Language
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} sm={4}>
            <TextField
              fullWidth
              label="Language"
              value={newLanguage.name}
              onChange={(e) => setNewLanguage({ ...newLanguage, name: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LanguageIcon color="action" />
                  </InputAdornment>
                ),
              }}
              placeholder="e.g., English, Spanish, French"
              variant="outlined"
            />
          </Grid>
          
          <Grid xs={12} sm={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Proficiency Level</InputLabel>
              <Select
                value={newLanguage.proficiency}
                onChange={(e) => setNewLanguage({ ...newLanguage, proficiency: e.target.value })}
                label="Proficiency Level"
              >
                {proficiencyLevels.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid xs={12} sm={3}>
            <TextField
              fullWidth
              label="Certification (Optional)"
              value={newLanguage.certification}
              onChange={(e) => setNewLanguage({ ...newLanguage, certification: e.target.value })}
              placeholder="e.g., TOEFL, IELTS, DELE"
              variant="outlined"
            />
          </Grid>
          
          <Grid xs={12} sm={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAdd}
              disabled={!newLanguage.name.trim()}
              size="large"
            >
              Add
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Existing Languages */}
      {languages.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Your Languages ({languages.length})
          </Typography>
          
          {languages.map((language, index) => (
            <Card key={language.id || index} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
              <CardContent>
                {editingIndex === index ? (
                  <LanguageEditForm
                    language={language}
                    onSave={(updated) => handleSave(index, updated)}
                    onCancel={() => setEditingIndex(-1)}
                    proficiencyLevels={proficiencyLevels}
                  />
                ) : (
                  <LanguageDisplay
                    language={language}
                    onEdit={() => handleEdit(index)}
                    onDelete={() => handleDelete(index)}
                    getProficiencyColor={getProficiencyColor}
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {languages.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <LanguageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No languages added yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add languages you speak to showcase your communication skills
          </Typography>
        </Box>
      )}

      {/* Quick Add Popular Languages */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Add Popular Languages
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
          {[
            'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
            'Chinese (Mandarin)', 'Japanese', 'Korean', 'Arabic', 'Russian', 'Hindi'
          ].map((popularLanguage) => (
            <Chip
              key={popularLanguage}
              label={popularLanguage}
              onClick={() => {
                if (!languages.some(lang => lang.name.toLowerCase() === popularLanguage.toLowerCase())) {
                  setNewLanguage({ ...newLanguage, name: popularLanguage });
                }
              }}
              variant="outlined"
              size="small"
              sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'primary.50' } }}
            />
          ))}
        </Box>
      </Box>

      {/* Pro Tips */}
      <Box sx={{ mt: 4, p: 3, bgcolor: 'primary.50', borderRadius: 2, border: '1px solid', borderColor: 'primary.200' }}>
        <Typography variant="subtitle2" color="primary.main" fontWeight="bold" sx={{ mb: 1 }}>
          💡 Pro Tips for Languages:
        </Typography>
        <Typography variant="body2" color="text.secondary" component="div">
          • Be honest about your proficiency levels<br />
          • Include certifications when available (TOEFL, IELTS, etc.)<br />
          • Consider the relevance to your target job market<br />
          • Native language doesn't always need to be listed<br />
          • Use standard proficiency frameworks (CEFR levels)
        </Typography>
      </Box>
    </Box>
  );
}

// Language Display Component
function LanguageDisplay({ language, onEdit, onDelete, getProficiencyColor }) {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Typography variant="h6" color="primary">
              {language.name}
            </Typography>
            <Chip
              label={language.proficiency}
              color={getProficiencyColor(language.proficiency)}
              size="small"
              variant="outlined"
            />
          </Box>
          
          {language.certification && (
            <Typography variant="body2" color="text.secondary">
              <GlobalIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
              Certification: {language.certification}
            </Typography>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={onEdit} size="small" color="primary">
            <EditIcon />
          </IconButton>
          <IconButton onClick={onDelete} size="small" color="error">
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}

// Language Edit Form Component
function LanguageEditForm({ language, onSave, onCancel, proficiencyLevels }) {
  const [editedLanguage, setEditedLanguage] = useState({ ...language });

  const handleSave = () => {
    if (editedLanguage.name.trim()) {
      onSave(editedLanguage);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Edit Language
      </Typography>
      
      <Grid container spacing={2}>
        <Grid xs={12} sm={4}>
          <TextField
            fullWidth
            label="Language"
            value={editedLanguage.name}
            onChange={(e) => setEditedLanguage({ ...editedLanguage, name: e.target.value })}
            variant="outlined"
            size="small"
          />
        </Grid>
        
        <Grid xs={12} sm={4}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel>Proficiency Level</InputLabel>
            <Select
              value={editedLanguage.proficiency}
              onChange={(e) => setEditedLanguage({ ...editedLanguage, proficiency: e.target.value })}
              label="Proficiency Level"
            >
              {proficiencyLevels.map((level) => (
                <MenuItem key={level} value={level}>
                  {level}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid xs={12} sm={4}>
          <TextField
            fullWidth
            label="Certification"
            value={editedLanguage.certification}
            onChange={(e) => setEditedLanguage({ ...editedLanguage, certification: e.target.value })}
            variant="outlined"
            size="small"
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        <Button onClick={onCancel} variant="outlined">
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          disabled={!editedLanguage.name.trim()}
        >
          Save Changes
        </Button>
      </Box>
    </Box>
  );
}

export default LanguagesSection;


