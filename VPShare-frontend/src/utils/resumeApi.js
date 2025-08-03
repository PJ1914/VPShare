import axios from 'axios';

/**
 * Calls the backend to generate resume content using the Gemini API.
 * @param {object} formData - The data from the resume form.
 * @returns {Promise<object>} - A promise that resolves with the AI-generated content.
 */
export const generateAiResume = async (formData) => {
  // Prepare the payload with all form data
  const payload = {
    name: formData.name || '',
    email: formData.email || '',
    phone: formData.phone || '',
    location: formData.location || '',
    linkedin: formData.linkedin || '',
    job_role: formData.title || '', // Backend expects 'job_role'
    professional_summary: formData.objective || '',
    skills: formData.skills ? formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill) : [],
    experience: formData.experience || '',
    education: formData.education || '',
  };

  // Use environment variable for API endpoint with fallback
  const API_ENDPOINT = process.env.REACT_APP_RESUME_API_URL || 'http://127.0.0.1:8000/resume/generate';

  try {
    const response = await axios.post(API_ENDPOINT, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
    });
    
    return response.data;
  } catch (error) {
    console.error('Error generating AI resume:', error);
    
    // Handle different types of errors
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. Please try again.');
    }
    
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.detail || error.response.data?.message || 'Server error occurred';
      throw new Error(errorMessage);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Unable to connect to the server. Please check your connection.');
    } else {
      // Something else happened
      throw new Error('An unexpected error occurred while generating the resume.');
    }
  }
};