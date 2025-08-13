import axios from 'axios';

/**
 * Makes a real API call to the backend for ATS analysis using axios.
 * @param {File} resumeFile - The user's uploaded resume file.
 * @param {string} jobDescription - The job description text.
 * @returns {Promise<object>} - A promise that resolves with the ATS analysis result.
 */
export const analyzeResumeWithATS = async (resumeFile, jobDescription) => {
  // Validate inputs
  if (!resumeFile) {
    throw new Error('Please upload a resume file.');
  }
  
  if (!jobDescription.trim()) {
    throw new Error('Please provide a job description.');
  }

  // Validate file type
  const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!allowedTypes.includes(resumeFile.type)) {
    throw new Error('Please upload a PDF or DOCX file.');
  }

  // Validate file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (resumeFile.size > maxSize) {
    throw new Error('File size must be less than 5MB.');
  }

  // Create FormData for multipart upload
  const formData = new FormData();
  formData.append('resume', resumeFile);
  formData.append('jobDescription', jobDescription.trim());

  // Use environment variable for API endpoint with fallback
  const API_ENDPOINT = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/ats/score';

  try {
    // Make the POST request using axios
    const response = await axios.post(API_ENDPOINT, formData, {
      headers: {
        // Don't set Content-Type manually, let axios handle it for FormData
      },
      timeout: 60000, // 60 second timeout for file processing
      onUploadProgress: (progressEvent) => {
        // Optional: You can add upload progress tracking here
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      },
    });
    
    // Validate response structure
    const result = response.data;
    if (!result.atsScore && result.atsScore !== 0) {
      throw new Error('Invalid response format from server.');
    }

    return result;

  } catch (error) {
    console.error('Error calling ATS API with axios:', error);

    // Handle different types of errors
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. The file might be too large or the server is busy. Please try again.');
    }

    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const errorData = error.response.data;

      if (status === 413) {
        throw new Error('File too large. Please upload a smaller file.');
      } else if (status === 415) {
        throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
      } else if (status === 422) {
        throw new Error('Invalid file format or corrupted file. Please try a different file.');
      } else if (errorData?.detail) {
        throw new Error(errorData.detail);
      } else if (errorData?.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error(`Server error (${status}). Please try again later.`);
      }
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
    } else {
      // Something else happened
      throw new Error('An unexpected error occurred while analyzing the resume. Please try again.');
    }
  }
};