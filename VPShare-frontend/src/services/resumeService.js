import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    
    return Promise.reject(error.response?.data || error.message);
  }
);

export const resumeService = {
  // Generate complete resume with AI enhancement
  async generateResume(resumeRequest) {
    try {
      const response = await api.post('/api/resume/generate', resumeRequest);
      return response;
    } catch (error) {
      throw new Error(error.detail || 'Failed to generate resume');
    }
  },

  // Improve specific section with AI
  async optimizeSection(sectionName, currentContent, targetRole = null, industry = null) {
    try {
      const response = await api.post('/api/resume/improve-section', {
        section_name: sectionName,
        current_content: currentContent,
        target_role: targetRole,
        industry: industry
      });
      return response;
    } catch (error) {
      throw new Error(error.detail || 'Failed to optimize section');
    }
  },

  // Get available resume templates
  async getTemplates() {
    try {
      const response = await api.get('/api/resume/templates');
      return response;
    } catch (error) {
      throw new Error(error.detail || 'Failed to fetch templates');
    }
  },

  // Export resume in various formats
  async exportResume(resumeData, template = 'latex-modern', format = 'pdf') {
    try {
      const response = await api.post('/api/resume/export', {
        ...resumeData,
        template,
        format
      });
      return response;
    } catch (error) {
      throw new Error(error.detail || 'Failed to export resume');
    }
  },

  // Get AI suggestions for specific section
  async getSectionSuggestions(section, role = null, industry = null) {
    try {
      const response = await api.get(`/api/resume/suggestions/${section}`, {
        params: { role, industry }
      });
      return response;
    } catch (error) {
      throw new Error(error.detail || 'Failed to get suggestions');
    }
  },

  // Save resume data to user profile
  async saveResume(userId, resumeData) {
    try {
      // For now, use localStorage as backup
      const saved = {
        ...resumeData,
        lastModified: new Date().toISOString(),
        userId
      };
      
      localStorage.setItem(`resume_${userId}`, JSON.stringify(saved));
      
      // TODO: Implement backend save endpoint
      // const response = await api.post('/api/resume/save', { userId, resumeData });
      return saved;
    } catch (error) {
      throw new Error('Failed to save resume');
    }
  },

  // Load saved resume data
  async loadResume(userId) {
    try {
      // For now, use localStorage
      const saved = localStorage.getItem(`resume_${userId}`);
      if (saved) {
        return JSON.parse(saved);
      }
      
      // TODO: Implement backend load endpoint
      // const response = await api.get(`/api/resume/load/${userId}`);
      return null;
    } catch (error) {
      console.error('Failed to load resume:', error);
      return null;
    }
  },

  // Analyze resume and provide score
  async analyzeResume(resumeData) {
    try {
      // Calculate local score based on completeness
      let score = 0;
      let suggestions = [];

      // Contact information (20 points)
      if (resumeData.firstName && resumeData.lastName && resumeData.email && resumeData.phone) {
        score += 20;
      } else {
        suggestions.push('Complete your contact information');
      }

      // Summary/Objective (20 points)
      if (resumeData.summary && resumeData.summary.length > 50) {
        score += 20;
      } else {
        suggestions.push('Add a compelling professional summary');
      }

      // Experience (30 points)
      if (resumeData.experiences && resumeData.experiences.length > 0) {
        score += 30;
        // Bonus for detailed experiences
        const hasQuantifiedAchievements = resumeData.experiences.some(exp => 
          exp.description && /\d+/.test(exp.description)
        );
        if (hasQuantifiedAchievements) score += 5;
      } else {
        suggestions.push('Add your work experience with quantified achievements');
      }

      // Education (15 points)
      if (resumeData.education && resumeData.education.length > 0) {
        score += 15;
      } else {
        suggestions.push('Include your educational background');
      }

      // Skills (10 points)
      if (resumeData.skills && resumeData.skills.length > 0) {
        score += 10;
      } else {
        suggestions.push('List your relevant skills');
      }

      // Projects (5 points)
      if (resumeData.projects && resumeData.projects.length > 0) {
        score += 5;
      }

      return {
        score: Math.min(100, score),
        suggestions,
        strengths: this.getResumeStrengths(resumeData),
        improvements: suggestions
      };
    } catch (error) {
      throw new Error('Failed to analyze resume');
    }
  },

  getResumeStrengths(resumeData) {
    const strengths = [];
    
    if (resumeData.linkedin || resumeData.github || resumeData.website) {
      strengths.push('Strong online presence');
    }
    
    if (resumeData.experiences && resumeData.experiences.length >= 3) {
      strengths.push('Extensive work experience');
    }
    
    if (resumeData.projects && resumeData.projects.length >= 2) {
      strengths.push('Good project portfolio');
    }
    
    if (resumeData.certificates && resumeData.certificates.length > 0) {
      strengths.push('Professional certifications');
    }
    
    if (resumeData.languages && resumeData.languages.length > 1) {
      strengths.push('Multilingual abilities');
    }
    
    return strengths;
  },

  // Validate resume data
  validateResumeData(resumeData) {
    const errors = {};
    
    // Validate required fields
    if (!resumeData.firstName?.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!resumeData.lastName?.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!resumeData.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resumeData.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (!resumeData.phone?.trim()) {
      errors.phone = 'Phone number is required';
    }
    
    // Validate URLs if provided
    const urlFields = ['linkedin', 'github', 'website', 'portfolio'];
    urlFields.forEach(field => {
      if (resumeData[field] && resumeData[field].trim()) {
        try {
          new URL(resumeData[field]);
        } catch {
          errors[field] = 'Invalid URL format';
        }
      }
    });
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Format resume data for API
  formatResumeForAPI(resumeData) {
    return {
      name: `${resumeData.firstName} ${resumeData.lastName}`.trim(),
      title: resumeData.jobTitle || '',
      email: resumeData.email || '',
      phone: resumeData.phone || '',
      location: resumeData.location || '',
      linkedin: resumeData.linkedin || '',
      github: resumeData.github || '',
      website: resumeData.website || '',
      portfolio: resumeData.portfolio || '',
      objective: resumeData.summary || '',
      skills: this.formatSkillsForAPI(resumeData.skills),
      experience: this.formatExperienceForAPI(resumeData.experiences),
      education: this.formatEducationForAPI(resumeData.education),
    };
  },

  formatSkillsForAPI(skills) {
    if (!skills || !Array.isArray(skills)) return '';
    
    // Group skills by category if they have categories
    const skillsByCategory = skills.reduce((acc, skill) => {
      const category = skill.category || 'General';
      if (!acc[category]) acc[category] = [];
      acc[category].push(skill.name || skill);
      return acc;
    }, {});
    
    return Object.entries(skillsByCategory)
      .map(([category, skillList]) => {
        if (category === 'General') return skillList.join(', ');
        return `${category}: ${skillList.join(', ')}`;
      })
      .join('\n');
  },

  formatExperienceForAPI(experiences) {
    if (!experiences || !Array.isArray(experiences)) return '';
    
    return experiences
      .map(exp => {
        let formatted = `${exp.title || ''} at ${exp.company || ''}`;
        if (exp.startDate || exp.endDate) {
          formatted += ` (${exp.startDate || ''} - ${exp.endDate || 'Present'})`;
        }
        if (exp.description) {
          formatted += `\n${exp.description}`;
        }
        return formatted;
      })
      .join('\n\n');
  },

  formatEducationForAPI(education) {
    if (!education || !Array.isArray(education)) return '';
    
    return education
      .map(edu => {
        let formatted = `${edu.degree || ''} in ${edu.major || ''}`;
        if (edu.school) {
          formatted += ` from ${edu.school}`;
        }
        if (edu.year || edu.graduationDate) {
          formatted += ` (${edu.year || edu.graduationDate})`;
        }
        if (edu.gpa) {
          formatted += ` - GPA: ${edu.gpa}`;
        }
        return formatted;
      })
      .join('\n');
  }
};

export default resumeService;
