// Test data and utilities for Resume System
export const mockResumeData = {
  name: 'John Doe',
  title: 'Senior Frontend Developer',
  email: 'john.doe@email.com',
  phone: '+1 (555) 123-4567',
  location: 'San Francisco, CA',
  linkedin: 'linkedin.com/in/johndoe',
  objective: 'Experienced frontend developer with 5+ years building scalable React applications. Passionate about creating exceptional user experiences and leading development teams.',
  skills: 'React, TypeScript, Node.js, Python, AWS, Docker, GraphQL, Jest, Webpack, MongoDB',
  experience: `Senior Frontend Developer - Tech Company (2022 - Present)
• Led development of customer-facing dashboard serving 100K+ users
• Improved application performance by 40% through code optimization
• Mentored 3 junior developers and established best practices

Frontend Developer - Startup Inc (2020 - 2022)
• Built responsive web applications using React and TypeScript
• Implemented CI/CD pipelines reducing deployment time by 60%
• Collaborated with design team to implement pixel-perfect UI components`,
  education: `Bachelor of Science in Computer Science - University of California (2020)
• Relevant Coursework: Data Structures, Algorithms, Web Development
• GPA: 3.8/4.0

Certified AWS Solutions Architect - Amazon Web Services (2021)
• Cloud architecture and deployment strategies`
};

export const mockJobDescription = `
We are seeking a Senior Frontend Developer to join our growing team. The ideal candidate will have:

Required Skills:
- 5+ years of experience with React and TypeScript
- Strong understanding of modern JavaScript (ES6+)
- Experience with state management (Redux, Context API)
- Proficiency in HTML5, CSS3, and responsive design
- Experience with testing frameworks (Jest, Cypress)
- Knowledge of CI/CD pipelines and DevOps practices

Preferred Skills:
- Experience with Next.js or similar frameworks
- Backend development experience with Node.js
- Cloud platforms experience (AWS, Azure, GCP)
- GraphQL and API development
- Agile/Scrum methodology experience

Responsibilities:
- Lead frontend architecture decisions
- Mentor junior developers
- Collaborate with design and backend teams
- Optimize application performance
- Implement best practices for code quality
`;

export const mockATSResult = {
  atsScore: 85,
  presentKeywords: [
    'React',
    'TypeScript',
    'JavaScript',
    'Frontend Developer',
    'HTML5',
    'CSS3',
    'Jest',
    'CI/CD',
    'AWS',
    'Performance Optimization',
    'Mentoring',
    'Team Collaboration'
  ],
  missingKeywords: [
    'Redux',
    'Context API',
    'Next.js',
    'Cypress',
    'GraphQL',
    'Agile',
    'Scrum',
    'API development'
  ],
  suggestions: [
    'Add "Redux" or "Context API" to your skills section to show state management experience',
    'Include "Next.js" if you have experience with this framework',
    'Mention "Agile" or "Scrum" methodology in your experience descriptions',
    'Add "Cypress" or other end-to-end testing tools to demonstrate testing expertise',
    'Include "GraphQL" and "API development" keywords if applicable to your experience',
    'Consider adding more specific metrics and achievements to your experience bullets',
    'Ensure your resume is in a standard format (PDF preferred) for better ATS parsing'
  ]
};

export const mockAIGeneratedResume = `# John Doe
## Senior Frontend Developer

**Contact Information:**
- Email: john.doe@email.com
- Phone: +1 (555) 123-4567
- Location: San Francisco, CA
- LinkedIn: linkedin.com/in/johndoe

## Professional Summary

Experienced Senior Frontend Developer with 5+ years of expertise in building scalable, high-performance React applications. Proven track record of leading development teams, optimizing application performance, and delivering exceptional user experiences. Strong background in modern JavaScript, TypeScript, and cloud technologies.

## Technical Skills

**Frontend Technologies:** React, TypeScript, JavaScript (ES6+), HTML5, CSS3, Redux, Context API
**Testing & Quality:** Jest, Cypress, Unit Testing, Integration Testing
**DevOps & Tools:** AWS, Docker, CI/CD Pipelines, Webpack, Git
**Backend & Databases:** Node.js, MongoDB, GraphQL, REST APIs
**Methodologies:** Agile, Scrum, Test-Driven Development

## Professional Experience

### Senior Frontend Developer | Tech Company (2022 - Present)
- Led development of customer-facing dashboard application serving over 100,000 active users
- Improved overall application performance by 40% through strategic code optimization and lazy loading implementation
- Mentored 3 junior developers and established comprehensive coding standards and best practices
- Collaborated with cross-functional teams including design, backend, and product management
- Implemented automated testing strategies reducing bug reports by 35%

### Frontend Developer | Startup Inc (2020 - 2022)
- Built responsive web applications using React, TypeScript, and modern CSS frameworks
- Developed and maintained CI/CD pipelines that reduced deployment time by 60%
- Collaborated closely with design team to implement pixel-perfect UI components
- Participated in code reviews and contributed to architectural decisions
- Implemented performance monitoring and optimization strategies

## Education

### Bachelor of Science in Computer Science | University of California (2020)
- **Relevant Coursework:** Data Structures & Algorithms, Web Development, Software Engineering
- **GPA:** 3.8/4.0
- **Projects:** Built full-stack web applications using MERN stack

## Certifications

### AWS Certified Solutions Architect (2021)
- Demonstrated expertise in cloud architecture and deployment strategies
- Hands-on experience with AWS services including EC2, S3, CloudFront, and Lambda

## Key Achievements

- **Performance Leader:** Improved application load times by 40% through optimization techniques
- **Team Leader:** Successfully mentored junior developers and established coding best practices
- **Innovation Driver:** Implemented modern development practices reducing deployment time by 60%
- **Quality Advocate:** Established testing strategies that reduced production bugs by 35%`;

// Utility functions for testing
export const validateResumeData = (data) => {
  const requiredFields = ['name', 'title'];
  const missingFields = requiredFields.filter(field => !data[field]);
  
  return {
    isValid: missingFields.length === 0,
    missingFields,
    warnings: []
  };
};

export const simulateAPIDelay = (ms = 2000) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const mockAPIResponses = {
  resumeGeneration: {
    success: {
      resume_markdown: mockAIGeneratedResume,
      message: 'Resume generated successfully'
    },
    error: {
      detail: 'Failed to generate resume. Please check your input data.',
      status: 400
    }
  },
  atsAnalysis: {
    success: mockATSResult,
    error: {
      detail: 'Failed to analyze resume. Please ensure the file is a valid PDF or DOCX.',
      status: 422
    }
  }
};

// Test scenarios
export const testScenarios = {
  // Resume Builder scenarios
  emptyForm: {
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    objective: '',
    skills: '',
    experience: '',
    education: ''
  },
  
  partialForm: {
    name: 'John Doe',
    title: 'Frontend Developer',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    objective: '',
    skills: 'React, JavaScript',
    experience: '',
    education: ''
  },
  
  completeForm: mockResumeData,
  
  // ATS Checker scenarios
  validFile: {
    name: 'resume.pdf',
    type: 'application/pdf',
    size: 1024 * 1024 // 1MB
  },
  
  invalidFileType: {
    name: 'resume.txt',
    type: 'text/plain',
    size: 1024
  },
  
  oversizedFile: {
    name: 'resume.pdf',
    type: 'application/pdf',
    size: 6 * 1024 * 1024 // 6MB (over limit)
  },
  
  shortJobDescription: 'Looking for a developer.',
  
  completeJobDescription: mockJobDescription
};

export default {
  mockResumeData,
  mockJobDescription,
  mockATSResult,
  mockAIGeneratedResume,
  validateResumeData,
  simulateAPIDelay,
  mockAPIResponses,
  testScenarios
};
