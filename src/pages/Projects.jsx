import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import FolderIcon from '@mui/icons-material/Folder';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import GitHubIcon from '@mui/icons-material/GitHub';
import CodeIcon from '@mui/icons-material/Code';
import WebIcon from '@mui/icons-material/Web';
import StorageIcon from '@mui/icons-material/Storage';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import DataObjectIcon from '@mui/icons-material/DataObject';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CloudIcon from '@mui/icons-material/Cloud';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import '../styles/Projects.css';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  hover: { y: -5, boxShadow: '0 8px 25px rgba(0,0,0,0.15)', transition: { duration: 0.3 } },
};

const buttonVariants = {
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  tap: { scale: 0.95, transition: { duration: 0.1 } },
};

// Mock project data with various categories and technologies
const mockProjects = [
  {
    id: 1,
    title: 'E-commerce Website',
    description: 'Full-stack online store with React, Node.js, and MongoDB. Features include user authentication, shopping cart, payment integration, and admin dashboard.',
    type: 'Web Application',
    category: 'frontend',
    technologies: ['React', 'Node.js', 'MongoDB', 'Express', 'Stripe'],
    status: 'Completed',
    lastUpdated: '2024-12-15',
    stars: 24,
    isStarred: true,
    isPrivate: false,
    collaborators: 3,
    progress: 100,
    githubUrl: 'https://github.com/user/ecommerce-app',
    liveUrl: 'https://mystore.netlify.app',
    icon: <WebIcon />,
    color: '#3b82f6'
  },
  {
    id: 2,
    title: 'Task Management API',
    description: 'RESTful API for task management with JWT authentication, role-based access control, and real-time notifications.',
    type: 'Backend API',
    category: 'backend',
    technologies: ['Node.js', 'Express', 'PostgreSQL', 'JWT', 'Socket.io'],
    status: 'In Progress',
    lastUpdated: '2024-12-20',
    stars: 12,
    isStarred: false,
    isPrivate: true,
    collaborators: 1,
    progress: 75,
    githubUrl: 'https://github.com/user/task-api',
    icon: <StorageIcon />,
    color: '#10b981'
  },
  {
    id: 3,
    title: 'Mobile Fitness Tracker',
    description: 'Cross-platform mobile app for fitness tracking with workout plans, progress monitoring, and social features.',
    type: 'Mobile App',
    category: 'mobile',
    technologies: ['React Native', 'Firebase', 'Redux', 'Expo'],
    status: 'Planning',
    lastUpdated: '2024-12-18',
    stars: 8,
    isStarred: true,
    isPrivate: false,
    collaborators: 2,
    progress: 25,
    icon: <PhoneAndroidIcon />,
    color: '#f59e0b'
  },
  {
    id: 4,
    title: 'Data Analytics Dashboard',
    description: 'Interactive dashboard for data visualization and analytics with charts, graphs, and real-time data streaming.',
    type: 'Data Visualization',
    category: 'data',
    technologies: ['Python', 'Streamlit', 'Pandas', 'Plotly', 'SQLite'],
    status: 'Completed',
    lastUpdated: '2024-12-10',
    stars: 31,
    isStarred: false,
    isPrivate: false,
    collaborators: 4,
    progress: 100,
    liveUrl: 'https://analytics-dashboard.streamlit.app',
    icon: <TrendingUpIcon />,
    color: '#8b5cf6'
  },
  {
    id: 5,
    title: 'AI Chatbot Assistant',
    description: 'Intelligent chatbot with natural language processing, machine learning capabilities, and integration with popular messaging platforms.',
    type: 'AI/ML Project',
    category: 'ai',
    technologies: ['Python', 'TensorFlow', 'OpenAI API', 'FastAPI', 'Docker'],
    status: 'In Progress',
    lastUpdated: '2024-12-22',
    stars: 45,
    isStarred: true,
    isPrivate: false,
    collaborators: 5,
    progress: 60,
    githubUrl: 'https://github.com/user/ai-chatbot',
    icon: <SmartToyIcon />,
    color: '#ef4444'
  },
  {
    id: 6,
    title: 'Cloud Infrastructure Setup',
    description: 'Complete cloud infrastructure setup with CI/CD pipeline, monitoring, logging, and automated deployment.',
    type: 'DevOps',
    category: 'devops',
    technologies: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins'],
    status: 'Completed',
    lastUpdated: '2024-12-12',
    stars: 18,
    isStarred: false,
    isPrivate: true,
    collaborators: 3,
    progress: 100,
    icon: <CloudIcon />,
    color: '#06b6d4'
  }
];

const categoryIcons = {
  frontend: <WebIcon />,
  backend: <StorageIcon />,
  mobile: <PhoneAndroidIcon />,
  desktop: <DesktopWindowsIcon />,
  data: <TrendingUpIcon />,
  ai: <SmartToyIcon />,
  devops: <CloudIcon />,
  security: <SecurityIcon />
};

const statusColors = {
  'Completed': '#10b981',
  'In Progress': '#f59e0b', 
  'Planning': '#6b7280',
  'On Hold': '#ef4444'
};

function Projects() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState(mockProjects);
  const [filteredProjects, setFilteredProjects] = useState(mockProjects);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('lastUpdated'); // 'lastUpdated', 'stars', 'name'
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let filtered = projects;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.technologies.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(project => project.category === selectedCategory);
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(project => project.status === selectedStatus);
    }

    // Sort projects
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'stars':
          return b.stars - a.stars;
        case 'name':
          return a.title.localeCompare(b.title);
        case 'lastUpdated':
        default:
          return new Date(b.lastUpdated) - new Date(a.lastUpdated);
      }
    });

    setFilteredProjects(filtered);
  }, [projects, searchTerm, selectedCategory, selectedStatus, sortBy]);

  const toggleStar = (projectId) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, isStarred: !project.isStarred }
        : project
    ));
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  if (!user) {
    return (
      <div className="loading-container">
        <motion.div 
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <FolderIcon fontSize="large" />
        </motion.div>
        <p>Loading your projects...</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="projects-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <SEO 
        title="My Projects - CodeTapasya"
        description="Manage and showcase your coding projects on CodeTapasya. Create, edit, and share your programming projects with the community."
        canonical="https://codetapasya.com/projects"
        ogImage="https://codetapasya.com/og-projects.jpg"
        keywords="coding projects, programming portfolio, project management, CodeTapasya projects, developer portfolio"
        noIndex={true}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "My Projects",
          "description": "Personal project management and portfolio page for CodeTapasya developers.",
          "url": "https://codetapasya.com/projects",
          "isPartOf": {
            "@type": "WebSite",
            "name": "CodeTapasya",
            "url": "https://codetapasya.com"
          },
          "audience": {
            "@type": "Audience",
            "audienceType": "Developers"
          }
        }}
      />
      <div className="projects-header">
        <div className="projects-title-section">
          <FolderIcon className="projects-icon" />
          <div>
            <h1>My Projects</h1>
            <p>Manage and showcase your coding projects</p>
          </div>
        </div>
        
        <motion.button 
          className="add-project-btn"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <AddIcon />
          New Project
        </motion.button>
      </div>

      <div className="projects-controls">
        <div className="search-filter-section">
          <div className="search-box">
            <SearchIcon className="search-icon" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-controls">
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
              <option value="mobile">Mobile</option>
              <option value="data">Data & Analytics</option>
              <option value="ai">AI/ML</option>
              <option value="devops">DevOps</option>
            </select>

            <select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Planning">Planning</option>
              <option value="On Hold">On Hold</option>
            </select>

            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="lastUpdated">Recently Updated</option>
              <option value="stars">Most Starred</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>

        <div className="view-controls">
          <Tooltip title="Grid View">
            <IconButton 
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'active' : ''}
            >
              <ViewModuleIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="List View">
            <IconButton 
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'active' : ''}
            >
              <ViewListIcon />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      <div className="projects-stats">
        <div className="stat-item">
          <span className="stat-number">{projects.length}</span>
          <span className="stat-label">Total Projects</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{projects.filter(p => p.status === 'Completed').length}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{projects.filter(p => p.status === 'In Progress').length}</span>
          <span className="stat-label">In Progress</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{projects.reduce((sum, p) => sum + p.stars, 0)}</span>
          <span className="stat-label">Total Stars</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={`${viewMode}-${filteredProjects.length}`}
          className={`projects-grid ${viewMode}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              className="project-card"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              transition={{ delay: index * 0.1 }}
            >
              <div className="project-card-header">
                <div className="project-icon" style={{ color: project.color }}>
                  {project.icon}
                </div>
                <div className="project-actions">
                  <Tooltip title={project.isStarred ? "Unstar" : "Star"}>
                    <IconButton onClick={() => toggleStar(project.id)} size="small">
                      {project.isStarred ? <StarIcon sx={{ color: '#fbbf24' }} /> : <StarBorderIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Share">
                    <IconButton size="small">
                      <ShareIcon />
                    </IconButton>
                  </Tooltip>
                </div>
              </div>

              <div className="project-content">
                <h3 className="project-title">{project.title}</h3>
                <p className="project-description">{project.description}</p>
                
                <div className="project-meta">
                  <Chip 
                    size="small" 
                    label={project.status}
                    style={{ 
                      backgroundColor: statusColors[project.status] + '20',
                      color: statusColors[project.status],
                      fontWeight: 'bold'
                    }}
                  />
                  <span className="project-type">{project.type}</span>
                </div>

                <div className="project-technologies">
                  {project.technologies.slice(0, 3).map((tech, idx) => (
                    <Chip key={idx} size="small" label={tech} variant="outlined" />
                  ))}
                  {project.technologies.length > 3 && (
                    <span className="tech-more">+{project.technologies.length - 3} more</span>
                  )}
                </div>

                {project.progress < 100 && (
                  <div className="project-progress">
                    <div className="progress-header">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <motion.div 
                        className="progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${project.progress}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        style={{ backgroundColor: project.color }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="project-footer">
                <div className="project-stats">
                  <div className="stat">
                    <StarIcon fontSize="small" />
                    <span>{project.stars}</span>
                  </div>
                  <div className="stat">
                    <GroupIcon fontSize="small" />
                    <span>{project.collaborators}</span>
                  </div>
                  <div className="stat">
                    {project.isPrivate ? <PersonIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    <span>{project.isPrivate ? 'Private' : 'Public'}</span>
                  </div>
                </div>
                
                <div className="project-links">
                  {project.githubUrl && (
                    <Tooltip title="View on GitHub">
                      <IconButton size="small" onClick={() => window.open(project.githubUrl, '_blank')}>
                        <GitHubIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  {project.liveUrl && (
                    <Tooltip title="View Live Demo">
                      <IconButton size="small" onClick={() => window.open(project.liveUrl, '_blank')}>
                        <WebIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </div>
                
                <div className="project-updated">
                  <AccessTimeIcon fontSize="small" />
                  <span>{getTimeAgo(project.lastUpdated)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {filteredProjects.length === 0 && (
        <motion.div 
          className="no-projects"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <FolderIcon className="no-projects-icon" />
          <h3>No projects found</h3>
          <p>Try adjusting your search filters or create your first project!</p>
          <motion.button 
            className="create-first-project-btn"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <AddIcon />
            Create Your First Project
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}

export default Projects;