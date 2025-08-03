import { getAuth } from 'firebase/auth';

// Use the production API URL from the .env file
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://oeu25ew1ih.execute-api.us-east-1.amazonaws.com/prod';
const AI_CHAT_API_URL = import.meta.env.VITE_AI_CHAT_API_URL_LOCAL || 'http://127.0.0.1:8000';

class ResumeAPI {
  constructor() {
    // Use local backend for resume features since they're implemented there
    this.baseURL = AI_CHAT_API_URL;
  }

  async getAuthToken() {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    throw new Error('User not authenticated');
  }

  async makeRequest(endpoint, options = {}) {
    try {
      const token = await this.getAuthToken();
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Resume Generation
  async generateResume(resumeData, template = 'latex-modern', aiEnhancement = true, targetRole = null, industry = null) {
    return await this.makeRequest('/api/resume/generate', {
      method: 'POST',
      body: JSON.stringify({
        resume_data: this.transformResumeData(resumeData),
        template,
        ai_enhancement: aiEnhancement,
        target_role: targetRole,
        industry
      })
    });
  }

  // AI Content Generation
  async generateAIContent(resumeData, targetRole = null, industry = null, experienceLevel = 'mid', focusAreas = []) {
    return await this.makeRequest('/api/ai/generate-content', {
      method: 'POST',
      body: JSON.stringify({
        resume_data: resumeData,
        target_role: targetRole,
        industry,
        experience_level: experienceLevel,
        focus_areas: focusAreas
      })
    });
  }

  // Section Improvement
  async improveSectionWithAI(currentContent, sectionType, targetRole = null, industry = null) {
    return await this.makeRequest('/api/ai/improve-section', {
      method: 'POST',
      body: JSON.stringify({
        current_content: currentContent,
        section_type: sectionType,
        target_role: targetRole,
        industry
      })
    });
  }

  // Resume Section Improvement (legacy endpoint)
  async improveResumeSection(sectionName, currentContent, targetRole = null, industry = null) {
    return await this.makeRequest('/api/resume/improve-section', {
      method: 'POST',
      body: JSON.stringify({
        section_name: sectionName,
        current_content: currentContent,
        target_role: targetRole,
        industry
      })
    });
  }

  // Get Resume Templates
  async getResumeTemplates() {
    return await this.makeRequest('/api/resume/templates');
  }

  // Export Resume
  async exportResume(resumeData, template = 'latex-modern', format = 'pdf') {
    return await this.makeRequest('/api/resume/export', {
      method: 'POST',
      body: JSON.stringify({
        ...this.transformResumeData(resumeData),
        template,
        format
      })
    });
  }

  // Get Section Suggestions
  async getSectionSuggestions(section, role = null, industry = null) {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (industry) params.append('industry', industry);
    
    return await this.makeRequest(`/api/resume/suggestions/${section}?${params.toString()}`);
  }

  // Job Match Analysis
  async analyzeJobMatch(resumeText, jobDescription, companyInfo = null) {
    return await this.makeRequest('/api/ai/job-match-analysis', {
      method: 'POST',
      body: JSON.stringify({
        resume_text: resumeText,
        job_description: jobDescription,
        company_info: companyInfo
      })
    });
  }

  // ATS Analysis
  async analyzeATS(resumeText, jobDescription = null) {
    return await this.makeRequest('/api/ats/analyze', {
      method: 'POST',
      body: JSON.stringify({
        resume_text: resumeText,
        job_description: jobDescription
      })
    });
  }

  // Grammar Check
  async checkGrammar(resumeText) {
    return await this.makeRequest('/api/ai/grammar-check', {
      method: 'POST',
      body: JSON.stringify({
        text: resumeText
      })
    });
  }

  // Keyword Analysis
  async analyzeKeywords(resumeText, targetRole = null, industry = null) {
    return await this.makeRequest('/api/ai/keyword-analysis', {
      method: 'POST',
      body: JSON.stringify({
        resume_text: resumeText,
        target_role: targetRole,
        industry
      })
    });
  }

  // Transform frontend resume data to backend format
  transformResumeData(resumeData) {
    return {
      name: `${resumeData.personal?.firstName || ''} ${resumeData.personal?.lastName || ''}`.trim(),
      title: resumeData.personal?.jobTitle || '',
      email: resumeData.personal?.email || '',
      phone: resumeData.personal?.phone || '',
      location: resumeData.personal?.location || '',
      linkedin: resumeData.personal?.linkedin || '',
      github: resumeData.personal?.github || '',
      website: resumeData.personal?.website || '',
      portfolio: resumeData.personal?.portfolio || '',
      twitter: resumeData.personal?.twitter || '',
      blog: resumeData.personal?.blog || '',
      objective: resumeData.summary || '',
      skills: this.formatSkillsForBackend(resumeData.skills || []),
      experience: this.formatExperienceForBackend(resumeData.experiences || []),
      education: this.formatEducationForBackend(resumeData.education || [])
    };
  }

  formatSkillsForBackend(skills) {
    if (Array.isArray(skills)) {
      return skills.map(skill => {
        if (typeof skill === 'string') return skill;
        if (skill.category && skill.items) {
          return `${skill.category}: ${skill.items.join(', ')}`;
        }
        return skill.name || skill.skill || '';
      }).join('\n');
    }
    return skills;
  }

  formatExperienceForBackend(experiences) {
    return experiences.map(exp => {
      const responsibilities = Array.isArray(exp.responsibilities) 
        ? exp.responsibilities.join('\n• ') 
        : exp.responsibilities || '';
      
      return `${exp.position || ''} at ${exp.company || ''} (${exp.startDate || ''} - ${exp.endDate || exp.current ? 'Present' : ''})\n• ${responsibilities}`;
    }).join('\n\n');
  }

  formatEducationForBackend(education) {
    return education.map(edu => {
      return `${edu.degree || ''} in ${edu.field || ''} from ${edu.institution || ''} (${edu.graduationDate || ''})${edu.gpa ? ` - GPA: ${edu.gpa}` : ''}`;
    }).join('\n');
  }

  // Convert resume data to plain text for analysis
  resumeDataToText(resumeData) {
    const sections = [];
    
    // Personal info
    if (resumeData.personal) {
      const personal = resumeData.personal;
      sections.push(`${personal.firstName} ${personal.lastName}`);
      sections.push(personal.jobTitle);
      sections.push(`${personal.email} | ${personal.phone} | ${personal.location}`);
    }
    
    // Summary
    if (resumeData.summary) {
      sections.push('\nPROFESSIONAL SUMMARY');
      sections.push(resumeData.summary);
    }
    
    // Experience
    if (resumeData.experiences && resumeData.experiences.length > 0) {
      sections.push('\nEXPERIENCE');
      sections.push(this.formatExperienceForBackend(resumeData.experiences));
    }
    
    // Education
    if (resumeData.education && resumeData.education.length > 0) {
      sections.push('\nEDUCATION');
      sections.push(this.formatEducationForBackend(resumeData.education));
    }
    
    // Skills
    if (resumeData.skills && resumeData.skills.length > 0) {
      sections.push('\nSKILLS');
      sections.push(this.formatSkillsForBackend(resumeData.skills));
    }
    
    return sections.join('\n');
  }
}

export default new ResumeAPI();
