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
  Chip,
  Link,
  Divider,
  Grid
} from '@mui/material';

import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Assignment as ProjectIcon,
  CalendarToday as DateIcon,
  Code as TechIcon,
  Link as LinkIcon,
  AutoAwesome as AIIcon,
  GitHub as GitHubIcon,
  Language as WebIcon
} from '@mui/icons-material';

function ProjectsSection({ data, onChange, onAIAnalysis }) {
  const [editingIndex, setEditingIndex] = useState(-1);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    technologies: '',
    startDate: '',
    endDate: '',
    github: '',
    demo: '',
    highlights: ''
  });

  const projects = data.projects || [];

  const handleAdd = () => {
    if (newProject.name.trim() && newProject.description.trim()) {
      const project = {
        ...newProject,
        technologies: newProject.technologies.split(',').map(tech => tech.trim()).filter(tech => tech),
        highlights: newProject.highlights.split('\n').filter(highlight => highlight.trim()),
        id: Date.now()
      };
      onChange('projects', [...projects, project]);
      setNewProject({
        name: '',
        description: '',
        technologies: '',
        startDate: '',
        endDate: '',
        github: '',
        demo: '',
        highlights: ''
      });
    }
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
  };

  const handleSave = (index, updatedProject) => {
    const updatedProjects = [...projects];
    updatedProjects[index] = {
      ...updatedProject,
      technologies: typeof updatedProject.technologies === 'string' 
        ? updatedProject.technologies.split(',').map(tech => tech.trim()).filter(tech => tech)
        : updatedProject.technologies,
      highlights: typeof updatedProject.highlights === 'string'
        ? updatedProject.highlights.split('\n').filter(highlight => highlight.trim())
        : updatedProject.highlights
    };
    onChange('projects', updatedProjects);
    setEditingIndex(-1);
  };

  const handleDelete = (index) => {
    const updatedProjects = projects.filter((_, i) => i !== index);
    onChange('projects', updatedProjects);
  };

  const handleAIOptimize = () => {
    onAIAnalysis('projects_optimization');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" color="primary">
          Projects & Portfolio
        </Typography>
        <Tooltip title="AI Optimize Projects">
          <IconButton onClick={handleAIOptimize} color="primary" size="small">
            <AIIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Showcase your personal and professional projects to demonstrate your skills and experience.
      </Typography>

      {/* Add New Project */}
      <Paper sx={{ p: 3, mb: 3, border: '2px dashed #e0e0e0' }}>
        <Typography variant="h6" gutterBottom>
          Add New Project
        </Typography>
        
        <Grid container spacing={2}>
          <Grid xs={12}>
            <TextField
              fullWidth
              label="Project Name"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ProjectIcon color="action" />
                  </InputAdornment>
                ),
              }}
              placeholder="e.g., E-commerce Website, Mobile App"
              variant="outlined"
            />
          </Grid>
          
          <Grid xs={12}>
            <TextField
              fullWidth
              label="Project Description"
              multiline
              rows={3}
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              placeholder="Describe what the project does, its purpose, and your role..."
              variant="outlined"
            />
          </Grid>
          
          <Grid xs={12} sm={6}>
            <TextField
              fullWidth
              label="Technologies Used"
              value={newProject.technologies}
              onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TechIcon color="action" />
                  </InputAdornment>
                ),
              }}
              placeholder="React, Node.js, MongoDB (comma-separated)"
              variant="outlined"
              helperText="Separate technologies with commas"
            />
          </Grid>
          
          <Grid xs={12} sm={6}>
            <TextField
              fullWidth
              label="Key Highlights"
              multiline
              rows={3}
              value={newProject.highlights}
              onChange={(e) => setNewProject({ ...newProject, highlights: e.target.value })}
              placeholder="• Increased performance by 40%&#10;• Implemented user authentication&#10;• Deployed on AWS"
              variant="outlined"
              helperText="One highlight per line"
            />
          </Grid>
          
          <Grid xs={12} sm={6}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={newProject.startDate}
              onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DateIcon color="action" />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
            />
          </Grid>
          
          <Grid xs={12} sm={6}>
            <TextField
              fullWidth
              label="End Date (Optional)"
              type="date"
              value={newProject.endDate}
              onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DateIcon color="action" />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              helperText="Leave empty if ongoing"
            />
          </Grid>
          
          <Grid xs={12} sm={6}>
            <TextField
              fullWidth
              label="GitHub Repository (Optional)"
              value={newProject.github}
              onChange={(e) => setNewProject({ ...newProject, github: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <GitHubIcon color="action" />
                  </InputAdornment>
                ),
              }}
              placeholder="https://github.com/username/project"
              variant="outlined"
            />
          </Grid>
          
          <Grid xs={12} sm={6}>
            <TextField
              fullWidth
              label="Live Demo URL (Optional)"
              value={newProject.demo}
              onChange={(e) => setNewProject({ ...newProject, demo: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <WebIcon color="action" />
                  </InputAdornment>
                ),
              }}
              placeholder="https://project-demo.com"
              variant="outlined"
            />
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            disabled={!newProject.name.trim() || !newProject.description.trim()}
            size="large"
          >
            Add Project
          </Button>
        </Box>
      </Paper>

      {/* Existing Projects */}
      {projects.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Your Projects ({projects.length})
          </Typography>
          
          {projects.map((project, index) => (
            <Card key={project.id || index} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
              <CardContent>
                {editingIndex === index ? (
                  <ProjectEditForm
                    project={project}
                    onSave={(updated) => handleSave(index, updated)}
                    onCancel={() => setEditingIndex(-1)}
                  />
                ) : (
                  <ProjectDisplay
                    project={project}
                    onEdit={() => handleEdit(index)}
                    onDelete={() => handleDelete(index)}
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {projects.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <ProjectIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No projects added yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add your projects to showcase your practical experience and skills
          </Typography>
        </Box>
      )}

      {/* Pro Tips */}
      <Box sx={{ mt: 4, p: 3, bgcolor: 'primary.50', borderRadius: 2, border: '1px solid', borderColor: 'primary.200' }}>
        <Typography variant="subtitle2" color="primary.main" fontWeight="bold" sx={{ mb: 1 }}>
          💡 Pro Tips for Projects:
        </Typography>
        <Typography variant="body2" color="text.secondary" component="div">
          • Focus on projects relevant to your target role<br />
          • Include quantifiable achievements and metrics<br />
          • Mention specific technologies and tools used<br />
          • Provide links to live demos or GitHub repositories<br />
          • Highlight your role and contributions in team projects
        </Typography>
      </Box>
    </Box>
  );
}

// Project Display Component
function ProjectDisplay({ project, onEdit, onDelete }) {
  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" color="primary" gutterBottom>
            {project.name}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            {project.description}
          </Typography>
          
          {project.highlights && project.highlights.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Key Highlights:
              </Typography>
              <Box component="ul" sx={{ margin: 0, paddingLeft: 2 }}>
                {project.highlights.map((highlight, idx) => (
                  <Typography key={idx} component="li" variant="body2" color="text.secondary">
                    {highlight}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}
          
          {project.technologies && project.technologies.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Technologies:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {project.technologies.map((tech, idx) => (
                  <Chip key={idx} label={tech} size="small" variant="outlined" />
                ))}
              </Box>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mt: 2 }}>
            {(project.startDate || project.endDate) && (
              <Typography variant="body2" color="text.secondary">
                <DateIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                {formatDate(project.startDate)} - {project.endDate ? formatDate(project.endDate) : 'Present'}
              </Typography>
            )}
            
            {project.github && (
              <Link href={project.github} target="_blank" rel="noopener noreferrer" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                <GitHubIcon sx={{ fontSize: 16, mr: 0.5 }} />
                <Typography variant="body2">GitHub</Typography>
              </Link>
            )}
            
            {project.demo && (
              <Link href={project.demo} target="_blank" rel="noopener noreferrer" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                <WebIcon sx={{ fontSize: 16, mr: 0.5 }} />
                <Typography variant="body2">Live Demo</Typography>
              </Link>
            )}
          </Box>
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

// Project Edit Form Component
function ProjectEditForm({ project, onSave, onCancel }) {
  const [editedProject, setEditedProject] = useState({
    ...project,
    technologies: Array.isArray(project.technologies) ? project.technologies.join(', ') : project.technologies || '',
    highlights: Array.isArray(project.highlights) ? project.highlights.join('\n') : project.highlights || ''
  });

  const handleSave = () => {
    if (editedProject.name.trim() && editedProject.description.trim()) {
      onSave(editedProject);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Edit Project
      </Typography>
      
      <Grid container spacing={2}>
        <Grid xs={12}>
          <TextField
            fullWidth
            label="Project Name"
            value={editedProject.name}
            onChange={(e) => setEditedProject({ ...editedProject, name: e.target.value })}
            variant="outlined"
            size="small"
          />
        </Grid>
        
        <Grid xs={12}>
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={2}
            value={editedProject.description}
            onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
            variant="outlined"
            size="small"
          />
        </Grid>
        
        <Grid xs={12} sm={6}>
          <TextField
            fullWidth
            label="Technologies"
            value={editedProject.technologies}
            onChange={(e) => setEditedProject({ ...editedProject, technologies: e.target.value })}
            variant="outlined"
            size="small"
          />
        </Grid>
        
        <Grid xs={12} sm={6}>
          <TextField
            fullWidth
            label="Highlights"
            multiline
            rows={2}
            value={editedProject.highlights}
            onChange={(e) => setEditedProject({ ...editedProject, highlights: e.target.value })}
            variant="outlined"
            size="small"
          />
        </Grid>
        
        <Grid xs={12} sm={6}>
          <TextField
            fullWidth
            label="Start Date"
            type="date"
            value={editedProject.startDate}
            onChange={(e) => setEditedProject({ ...editedProject, startDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            variant="outlined"
            size="small"
          />
        </Grid>
        
        <Grid xs={12} sm={6}>
          <TextField
            fullWidth
            label="End Date"
            type="date"
            value={editedProject.endDate}
            onChange={(e) => setEditedProject({ ...editedProject, endDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            variant="outlined"
            size="small"
          />
        </Grid>
        
        <Grid xs={12} sm={6}>
          <TextField
            fullWidth
            label="GitHub"
            value={editedProject.github}
            onChange={(e) => setEditedProject({ ...editedProject, github: e.target.value })}
            variant="outlined"
            size="small"
          />
        </Grid>
        
        <Grid xs={12} sm={6}>
          <TextField
            fullWidth
            label="Demo URL"
            value={editedProject.demo}
            onChange={(e) => setEditedProject({ ...editedProject, demo: e.target.value })}
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
          disabled={!editedProject.name.trim() || !editedProject.description.trim()}
        >
          Save Changes
        </Button>
      </Box>
    </Box>
  );
}

export default ProjectsSection;


