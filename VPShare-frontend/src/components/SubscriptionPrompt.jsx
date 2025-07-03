import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Box,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Lock as LockIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon,
  SupportAgent as SupportAgentIcon
} from '@mui/icons-material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import '../styles/SubscriptionPrompt.css';

const SubscriptionPrompt = ({ 
  moduleIndex, 
  totalModules, 
  courseName = "this course",
  variant = "card" // "card", "banner", "modal"
}) => {
  const unlockedModules = 2; // Free modules limit
  const lockedModules = totalModules - unlockedModules;

  const benefits = [
    { icon: <CheckCircleIcon />, text: "Access to all modules and content" },
    { icon: <TrendingUpIcon />, text: "Progress tracking and analytics" },
    { icon: <AccessTimeIcon />, text: "Unlimited learning time" },
    { icon: <SupportAgentIcon />, text: "Priority support" },
    { icon: <StarIcon />, text: "Certificate of completion" }
  ];

  if (variant === "banner") {
    return (
      <motion.div 
        className="subscription-banner-prompt"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="banner-content">
          <LockOutlinedIcon className="lock-icon" />
          <div className="banner-text">
            <Typography variant="h6" className="banner-title">
              Premium Content Ahead
            </Typography>
            <Typography variant="body2">
              Subscribe to unlock {lockedModules} more modules in {courseName}
            </Typography>
          </div>
          <Link to="/payment/monthly" className="upgrade-btn-small">
            Upgrade Now
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="subscription-prompt-container"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="subscription-prompt-card">
        <CardContent className="prompt-content">
          <div className="prompt-header">
            <div className="lock-icon-container">
              <WorkspacePremiumIcon className="premium-icon" />
              <LockOutlinedIcon className="lock-overlay" />
            </div>
            
            <Typography variant="h4" className="prompt-title">
              Unlock Premium Content
            </Typography>
            
            <Typography variant="body1" className="prompt-subtitle">
              You've accessed {unlockedModules} free modules. Subscribe to continue learning!
            </Typography>
          </div>

          <div className="progress-visual">
            <div className="progress-bar-container">
              <div className="progress-bar">
                <motion.div 
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${(unlockedModules / totalModules) * 100}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
              <Typography variant="caption" className="progress-text">
                {unlockedModules} of {totalModules} modules unlocked
              </Typography>
            </div>
          </div>

          <div className="premium-benefits">
            <Typography variant="h6" className="benefits-title">
              What you'll get with Premium:
            </Typography>
            
            <List className="benefits-list">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <ListItem className="benefit-item">
                    <ListItemIcon className="benefit-icon">
                      {benefit.icon}
                    </ListItemIcon>
                    <ListItemText primary={benefit.text} />
                  </ListItem>
                </motion.div>
              ))}
            </List>
          </div>

          <div className="pricing-highlight">
            <Chip 
              label="Most Popular" 
              className="popular-chip"
              icon={<StarIcon />}
            />
            <Typography variant="h5" className="price-text">
              ₹99<span className="price-period">/month</span>
            </Typography>
            <Typography variant="caption" className="price-subtitle">
              Full access to all courses and features
            </Typography>
          </div>

          <div className="action-buttons">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                component={Link}
                to="/payment/monthly"
                variant="contained"
                size="large"
                className="upgrade-btn-primary"
                startIcon={<WorkspacePremiumIcon />}
              >
                Upgrade to Premium
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                component={Link}
                to="/payment/yearly"
                variant="outlined"
                size="large"
                className="upgrade-btn-secondary"
              >
                View All Plans
              </Button>
            </motion.div>
          </div>

          <Typography variant="caption" className="guarantee-text">
            30-day money-back guarantee • Cancel anytime
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SubscriptionPrompt;
