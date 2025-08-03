import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  IconButton,
  Chip,
  
  Card,
  CardContent,
  InputAdornment,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Rating,
  Divider,
  Grid
} from '@mui/material';

import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Build as SkillIcon,
  AutoAwesome as AIIcon,
  Star as StarIcon,
  Code as TechnicalIcon,
  People as SoftIcon,
  Language as LanguageIcon
} from '@mui/icons-material';

function SkillsSection({ data, onChange, onAIAnalysis }) {
  const [newSkill, setNewSkill] = useState('');
  const [skillLevel, setSkillLevel] = useState(3);
  const [skillCategory, setSkillCategory] = useState('Technical');

  const skills = data.skills || [];

  const skillCategories = ['Technical', 'Soft Skills', 'Languages', 'Tools', 'Frameworks', 'Other'];

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      const skill = {
        name: newSkill.trim(),
        level: skillLevel,
        category: skillCategory,
        id: Date.now()
      };
      onChange('skills', [...skills, skill]);
      setNewSkill('');
      setSkillLevel(3);
    }
  };

  const handleDeleteSkill = (index) => {
    const updatedSkills = skills.filter((_, i) => i !== index);
    onChange('skills', updatedSkills);
  };

  const handleSkillLevelChange = (index, newLevel) => {
    const updatedSkills = [...skills];
    updatedSkills[index] = { ...updatedSkills[index], level: newLevel };
    onChange('skills', updatedSkills);
  };

  const handleAIOptimize = () => {
    onAIAnalysis('skills_optimization');
  };

  const getSkillsByCategory = (category) => {
    return skills.filter(skill => skill.category === category);
  };

  const getLevelText = (level) => {
    const levels = {
      1: 'Beginner',
      2: 'Basic',
      3: 'Intermediate',
      4: 'Advanced',
      5: 'Expert'
    };
    return levels[level] || 'Intermediate';
  };

  const getLevelColor = (level) => {
    const colors = {
      1: 'error',
      2: 'warning',
      3: 'info',
      4: 'primary',
      5: 'success'
    };
    return colors[level] || 'info';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" color="primary">
          Skills & Expertise
        </Typography>
        <Tooltip title="AI Optimize Skills">
          <IconButton onClick={handleAIOptimize} color="primary" size="small">
            <AIIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Add your technical and soft skills to showcase your expertise and capabilities.
      </Typography>

      {/* Add New Skill */}
      <Paper sx={{ p: 3, mb: 3, border: '2px dashed #e0e0e0' }}>
        <Typography variant="h6" gutterBottom>
          Add New Skill
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} sm={4}>
            <TextField
              fullWidth
              label="Skill Name"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SkillIcon color="action" />
                  </InputAdornment>
                ),
              }}
              placeholder="e.g., JavaScript, Leadership"
              variant="outlined"
              onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
            />
          </Grid>
          
          <Grid xs={12} sm={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Category</InputLabel>
              <Select
                value={skillCategory}
                onChange={(e) => setSkillCategory(e.target.value)}
                label="Category"
              >
                {skillCategories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid xs={12} sm={3}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Proficiency Level
              </Typography>
              <Rating
                value={skillLevel}
                onChange={(event, newValue) => setSkillLevel(newValue)}
                max={5}
                icon={<StarIcon fontSize="inherit" />}
                emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
              />
              <Typography variant="caption" color="text.secondary">
                {getLevelText(skillLevel)}
              </Typography>
            </Box>
          </Grid>
          
          <Grid xs={12} sm={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddSkill}
              disabled={!newSkill.trim()}
              size="large"
            >
              Add
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Skills by Category */}
      {skillCategories.map((category) => {
        const categorySkills = getSkillsByCategory(category);
        if (categorySkills.length === 0) return null;

        return (
          <Card key={category} sx={{ mb: 3, border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {category === 'Technical' && <TechnicalIcon sx={{ mr: 1, color: 'primary.main' }} />}
                {category === 'Soft Skills' && <SoftIcon sx={{ mr: 1, color: 'success.main' }} />}
                {category === 'Languages' && <LanguageIcon sx={{ mr: 1, color: 'info.main' }} />}
                {!['Technical', 'Soft Skills', 'Languages'].includes(category) && <SkillIcon sx={{ mr: 1, color: 'secondary.main' }} />}
                
                <Typography variant="h6" color="primary">
                  {category} ({categorySkills.length})
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {categorySkills.map((skill, index) => {
                  const skillIndex = skills.findIndex(s => s.id === skill.id);
                  return (
                    <Box key={skill.id || index} sx={{ position: 'relative', mb: 1 }}>
                      <Chip
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <span>{skill.name}</span>
                            <Rating
                              value={skill.level}
                              onChange={(event, newValue) => handleSkillLevelChange(skillIndex, newValue)}
                              size="small"
                              max={5}
                              sx={{ ml: 1 }}
                            />
                          </Box>
                        }
                        onDelete={() => handleDeleteSkill(skillIndex)}
                        color={getLevelColor(skill.level)}
                        variant="outlined"
                        sx={{
                          '& .MuiChip-label': {
                            display: 'flex',
                            alignItems: 'center'
                          }
                        }}
                      />
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        );
      })}

      {skills.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <SkillIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No skills added yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add your technical and soft skills to showcase your expertise
          </Typography>
        </Box>
      )}

      {/* Quick Add Popular Skills */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Add Popular Skills
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
          {[
            'JavaScript', 'Python', 'React', 'Node.js', 'HTML/CSS', 'SQL', 'Git',
            'Communication', 'Leadership', 'Problem Solving', 'Teamwork', 'Project Management'
          ].map((popularSkill) => (
            <Chip
              key={popularSkill}
              label={popularSkill}
              onClick={() => {
                if (!skills.some(skill => skill.name.toLowerCase() === popularSkill.toLowerCase())) {
                  setNewSkill(popularSkill);
                  setSkillCategory(
                    ['Communication', 'Leadership', 'Problem Solving', 'Teamwork', 'Project Management'].includes(popularSkill)
                      ? 'Soft Skills'
                      : 'Technical'
                  );
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
          💡 Pro Tips for Skills:
        </Typography>
        <Typography variant="body2" color="text.secondary" component="div">
          • Focus on skills relevant to your target job<br />
          • Be honest about your proficiency levels<br />
          • Include both technical and soft skills<br />
          • Use industry-standard terminology<br />
          • Organize skills by category for better readability
        </Typography>
      </Box>
    </Box>
  );
}

export default SkillsSection;


