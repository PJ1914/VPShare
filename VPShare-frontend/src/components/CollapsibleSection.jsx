import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  IconButton, 
  Collapse, 
  Divider,
  Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddIcon from '@mui/icons-material/Add';

function CollapsibleSection({ 
  title, 
  children, 
  icon, 
  defaultExpanded = false,
  expanded = null, // Add controlled expanded prop
  onToggle = null, // Add controlled toggle prop
  showAddButton = false,
  onAdd,
  addButtonText = "Add",
  isEmpty = false
}) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  
  // Use controlled state if provided, otherwise use internal state
  const isExpanded = expanded !== null ? expanded : internalExpanded;
  
  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalExpanded(!internalExpanded);
    }
  };

  return (
    <Paper 
      elevation={0}
      sx={{
        mb: 2,
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #e5e7eb',
        '&:hover': {
          borderColor: '#d1d5db',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          cursor: 'pointer',
          backgroundColor: isExpanded ? '#f8fafc' : 'white',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: '#f8fafc',
          },
        }}
        onClick={handleToggle}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {icon && (
            <Box sx={{ color: 'primary.main', fontSize: '20px' }}>
              {icon}
            </Box>
          )}
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 'bold', 
              color: 'text.primary',
              fontSize: '1rem'
            }}
          >
            {title}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {showAddButton && !isExpanded && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={(e) => {
                e.stopPropagation();
                // Call the onAdd handler first to expand the section
                if (onAdd) {
                  onAdd();
                }
                // If no controlled state, expand internally
                if (!onToggle) {
                  setInternalExpanded(true);
                }
              }}
              sx={{
                textTransform: 'none',
                fontSize: '0.8rem',
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                },
              }}
            >
              {addButtonText}
            </Button>
          )}
          
          <IconButton 
            size="small"
            sx={{ 
              color: 'text.secondary',
              transform: isExpanded ? 'rotate(0deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease-in-out',
            }}
          >
            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* Content */}
      <Collapse in={isExpanded}>
        <Divider />
        <Box sx={{ p: isExpanded ? 3 : 0 }}>
          {isEmpty && isExpanded ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                No content added yet
              </Typography>
              {showAddButton && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={onAdd}
                  sx={{
                    textTransform: 'none',
                    borderRadius: '8px',
                  }}
                >
                  {addButtonText}
                </Button>
              )}
            </Box>
          ) : (
            children
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}

export default CollapsibleSection;
