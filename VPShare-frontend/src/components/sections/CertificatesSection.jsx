import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  IconButton,
  
  Divider,
  Card,
  CardContent,
  InputAdornment,
  Tooltip,
  Chip,
  Grid
} from '@mui/material';

import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  EmojiEvents as CertificateIcon,
  CalendarToday as DateIcon,
  Business as OrganizationIcon,
  AutoAwesome as AIIcon,
  Link as LinkIcon
} from '@mui/icons-material';

function CertificatesSection({ data, onChange, onAIAnalysis }) {
  const [editingIndex, setEditingIndex] = useState(-1);
  const [newCertificate, setNewCertificate] = useState({
    name: '',
    issuer: '',
    date: '',
    expiryDate: '',
    credentialId: '',
    url: ''
  });

  const certificates = data.certificates || [];

  const handleAdd = () => {
    if (newCertificate.name.trim() && newCertificate.issuer.trim()) {
      onChange('certificates', [...certificates, { ...newCertificate, id: Date.now() }]);
      setNewCertificate({
        name: '',
        issuer: '',
        date: '',
        expiryDate: '',
        credentialId: '',
        url: ''
      });
    }
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
  };

  const handleSave = (index, updatedCertificate) => {
    const updatedCertificates = [...certificates];
    updatedCertificates[index] = updatedCertificate;
    onChange('certificates', updatedCertificates);
    setEditingIndex(-1);
  };

  const handleDelete = (index) => {
    const updatedCertificates = certificates.filter((_, i) => i !== index);
    onChange('certificates', updatedCertificates);
  };

  const handleAIOptimize = () => {
    onAIAnalysis('certificates_optimization');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" color="primary">
          Certificates & Licenses
        </Typography>
        <Tooltip title="AI Optimize Certificates">
          <IconButton onClick={handleAIOptimize} color="primary" size="small">
            <AIIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Add your professional certifications, licenses, and credentials to showcase your expertise.
      </Typography>

      {/* Add New Certificate */}
      <Paper sx={{ p: 3, mb: 3, border: '2px dashed #e0e0e0' }}>
        <Typography variant="h6" gutterBottom>
          Add New Certificate
        </Typography>
        
        <Grid container spacing={2}>
          <Grid xs={12} sm={6}>
            <TextField
              fullWidth
              label="Certificate Name"
              value={newCertificate.name}
              onChange={(e) => setNewCertificate({ ...newCertificate, name: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CertificateIcon color="action" />
                  </InputAdornment>
                ),
              }}
              placeholder="e.g., AWS Certified Solutions Architect"
              variant="outlined"
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <TextField
              fullWidth
              label="Issuing Organization"
              value={newCertificate.issuer}
              onChange={(e) => setNewCertificate({ ...newCertificate, issuer: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <OrganizationIcon color="action" />
                  </InputAdornment>
                ),
              }}
              placeholder="e.g., Amazon Web Services"
              variant="outlined"
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <TextField
              fullWidth
              label="Issue Date"
              type="date"
              value={newCertificate.date}
              onChange={(e) => setNewCertificate({ ...newCertificate, date: e.target.value })}
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
              label="Expiry Date (Optional)"
              type="date"
              value={newCertificate.expiryDate}
              onChange={(e) => setNewCertificate({ ...newCertificate, expiryDate: e.target.value })}
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
              label="Credential ID (Optional)"
              value={newCertificate.credentialId}
              onChange={(e) => setNewCertificate({ ...newCertificate, credentialId: e.target.value })}
              placeholder="Certificate ID or License Number"
              variant="outlined"
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <TextField
              fullWidth
              label="Certificate URL (Optional)"
              value={newCertificate.url}
              onChange={(e) => setNewCertificate({ ...newCertificate, url: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LinkIcon color="action" />
                  </InputAdornment>
                ),
              }}
              placeholder="https://..."
              variant="outlined"
            />
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            disabled={!newCertificate.name.trim() || !newCertificate.issuer.trim()}
            size="large"
          >
            Add Certificate
          </Button>
        </Box>
      </Paper>

      {/* Existing Certificates */}
      {certificates.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Your Certificates ({certificates.length})
          </Typography>
          
          {certificates.map((certificate, index) => (
            <Card key={certificate.id || index} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
              <CardContent>
                {editingIndex === index ? (
                  <CertificateEditForm
                    certificate={certificate}
                    onSave={(updated) => handleSave(index, updated)}
                    onCancel={() => setEditingIndex(-1)}
                  />
                ) : (
                  <CertificateDisplay
                    certificate={certificate}
                    onEdit={() => handleEdit(index)}
                    onDelete={() => handleDelete(index)}
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {certificates.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CertificateIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No certificates added yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add your professional certifications to strengthen your resume
          </Typography>
        </Box>
      )}

      {/* Pro Tips */}
      <Box sx={{ mt: 4, p: 3, bgcolor: 'primary.50', borderRadius: 2, border: '1px solid', borderColor: 'primary.200' }}>
        <Typography variant="subtitle2" color="primary.main" fontWeight="bold" sx={{ mb: 1 }}>
          💡 Pro Tips for Certificates:
        </Typography>
        <Typography variant="body2" color="text.secondary" component="div">
          • Include relevant certifications for your target role<br />
          • Add expiry dates to show current certifications<br />
          • Include credential IDs for verification<br />
          • Prioritize industry-recognized certifications<br />
          • Add URLs to digital badges when available
        </Typography>
      </Box>
    </Box>
  );
}

// Certificate Display Component
function CertificateDisplay({ certificate, onEdit, onDelete }) {
  const isExpired = certificate.expiryDate && new Date(certificate.expiryDate) < new Date();
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" color="primary" gutterBottom>
            {certificate.name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {certificate.issuer}
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
            {certificate.date && (
              <Chip 
                label={`Issued: ${new Date(certificate.date).toLocaleDateString()}`} 
                size="small" 
                variant="outlined" 
              />
            )}
            {certificate.expiryDate && (
              <Chip 
                label={`Expires: ${new Date(certificate.expiryDate).toLocaleDateString()}`} 
                size="small" 
                variant="outlined"
                color={isExpired ? "error" : "default"}
              />
            )}
            {certificate.credentialId && (
              <Chip 
                label={`ID: ${certificate.credentialId}`} 
                size="small" 
                variant="outlined" 
              />
            )}
          </Box>
          
          {certificate.url && (
            <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
              <LinkIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
              <a href={certificate.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                View Certificate
              </a>
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

// Certificate Edit Form Component
function CertificateEditForm({ certificate, onSave, onCancel }) {
  const [editedCertificate, setEditedCertificate] = useState({ ...certificate });

  const handleSave = () => {
    if (editedCertificate.name.trim() && editedCertificate.issuer.trim()) {
      onSave(editedCertificate);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Edit Certificate
      </Typography>
      
      <Grid container spacing={2}>
        <Grid xs={12} sm={6}>
          <TextField
            fullWidth
            label="Certificate Name"
            value={editedCertificate.name}
            onChange={(e) => setEditedCertificate({ ...editedCertificate, name: e.target.value })}
            variant="outlined"
            size="small"
          />
        </Grid>
        <Grid xs={12} sm={6}>
          <TextField
            fullWidth
            label="Issuing Organization"
            value={editedCertificate.issuer}
            onChange={(e) => setEditedCertificate({ ...editedCertificate, issuer: e.target.value })}
            variant="outlined"
            size="small"
          />
        </Grid>
        <Grid xs={12} sm={6}>
          <TextField
            fullWidth
            label="Issue Date"
            type="date"
            value={editedCertificate.date}
            onChange={(e) => setEditedCertificate({ ...editedCertificate, date: e.target.value })}
            InputLabelProps={{ shrink: true }}
            variant="outlined"
            size="small"
          />
        </Grid>
        <Grid xs={12} sm={6}>
          <TextField
            fullWidth
            label="Expiry Date"
            type="date"
            value={editedCertificate.expiryDate}
            onChange={(e) => setEditedCertificate({ ...editedCertificate, expiryDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            variant="outlined"
            size="small"
          />
        </Grid>
        <Grid xs={12} sm={6}>
          <TextField
            fullWidth
            label="Credential ID"
            value={editedCertificate.credentialId}
            onChange={(e) => setEditedCertificate({ ...editedCertificate, credentialId: e.target.value })}
            variant="outlined"
            size="small"
          />
        </Grid>
        <Grid xs={12} sm={6}>
          <TextField
            fullWidth
            label="Certificate URL"
            value={editedCertificate.url}
            onChange={(e) => setEditedCertificate({ ...editedCertificate, url: e.target.value })}
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
          disabled={!editedCertificate.name.trim() || !editedCertificate.issuer.trim()}
        >
          Save Changes
        </Button>
      </Box>
    </Box>
  );
}

export default CertificatesSection;


