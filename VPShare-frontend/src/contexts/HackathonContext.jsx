import React, { createContext, useContext, useState, useEffect } from 'react';
import hackathonService from '../services/hackathonService';
// Import icons for timeline
import { Sword, Shield, Flame, Crown } from 'lucide-react';

const HackathonContext = createContext();
export { HackathonContext };

export const useHackathon = () => {
  const context = useContext(HackathonContext);
  if (!context) {
    throw new Error('useHackathon must be used within a HackathonProvider');
  }
  return context;
};

export const HackathonProvider = ({ children }) => {
  const [hackathons, setHackathons] = useState([]);
  const [currentHackathon, setCurrentHackathon] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sample hackathon data - replace with API calls
  const sampleHackathons = [
    {
      id: 'codekurukshetra-2025',
      name: 'CodeKurukshetra',
      sanskrit: 'कोड कुरुक्षेत्र',
      subtitle: 'The Ultimate 48-Hour Coding Battlefield',
      description: 'Where legends are born and code warriors prove their worth in the greatest hackathon of our time. Choose your weapon, form your army, and fight for glory!',
      startDate: '2025-09-27T09:00:00Z',
      endDate: '2025-09-28T17:00:00Z',
      registrationDeadline: '2025-09-25T23:59:59Z',
      maxTeamSize: 4,
      minTeamSize: 1,
      venue: 'Virtual & Physical Hybrid',
      status: 'upcoming', // upcoming, ongoing, completed
      problemStatements: [
        {
          id: 1,
          title: 'AI-Powered Code Reviewer & Bug Fixer',
          category: 'Developer Tools',
          problem: 'Developers waste hours finding bugs and improving code quality.',
          task: 'Build an AI-based code reviewer that scans repositories, detects syntax errors, performance bottlenecks, and security flaws, and suggests fixes.',
          features: 'Integrate with GitHub API for automated pull request reviews.',
          techStack: ['Python', 'OpenAI', 'LangChain', 'Next.js', 'GitHub API'],
          impact: 'Highly relevant to developers and GitHub sponsorship.',
          difficulty: 4,
          color: 'linear-gradient(135deg, #FF6B6B, #FF8E53)'
        },
        {
          id: 2,
          title: 'AI-Powered Resume & Portfolio Builder',
          category: 'Career Enhancement',
          problem: 'Students struggle to create impactful resumes and portfolios.',
          task: 'Build a platform that auto-generates ATS-friendly resumes and developer portfolios using LinkedIn + GitHub data.',
          features: 'Skill ranking, project visualization, and QR integration.',
          techStack: ['Next.js', 'Node.js', 'OpenAI API', 'Firebase'],
          impact: 'Great for students & hackathon participants.',
          difficulty: 3,
          color: 'linear-gradient(135deg, #667eea, #764ba2)'
        },
        {
          id: 3,
          title: 'Blockchain-Based Certificate Verification Platform',
          category: 'Web3',
          problem: 'Certificates from hackathons and colleges are easily forged.',
          task: 'Create a platform that issues tamper-proof, verifiable certificates stored on blockchain.',
          features: 'QR-based verification, participant dashboards, and shareable digital badges.',
          techStack: ['Solidity', 'Polygon/Ethereum', 'Next.js', 'IPFS'],
          impact: 'Perfect for hackathons, universities, and recruitment.',
          difficulty: 3,
          color: 'linear-gradient(135deg, #f093fb, #f5576c)'
        },
        {
          id: 4,
          title: 'Smart AI-Based Plagiarism Detector for Code Submissions',
          category: 'Hackathon-Friendly',
          problem: 'Hackathon organizers struggle to verify original submissions.',
          task: 'Build an AI-driven code plagiarism checker that compares project repositories using embeddings + semantic analysis.',
          features: 'Supports multiple languages, integrates with GitHub.',
          techStack: ['Python', 'OpenAI Embeddings', 'Flask', 'GitHub API'],
          impact: 'Ideal for CodeKurukshetra itself.',
          difficulty: 4,
          color: 'linear-gradient(135deg, #4facfe, #00f2fe)'
        },
        {
          id: 5,
          title: 'AI-Powered Learning Companion',
          category: 'EdTech',
          problem: 'Students lack personalized learning paths for tech stacks.',
          task: 'Build an AI chatbot that suggests courses, coding challenges, and interview questions based on GitHub + LinkedIn profiles.',
          features: 'Daily coding reminders, progress tracking, and mock tests.',
          techStack: ['React', 'Node.js', 'LangChain', 'Firebase'],
          impact: 'High adoption potential in universities and hackathons.',
          difficulty: 3,
          color: 'linear-gradient(135deg, #FA8072, #FFB6C1)'
        },
        {
          id: 6,
          title: 'FinTech Smart Expense Analyzer & Investment Advisor',
          category: 'Software-Only FinTech',
          problem: 'Students and professionals struggle to track expenses and manage investments.',
          task: 'Build a personal finance dashboard that analyzes UPI/Bank transactions and suggests budgeting + investment plans using AI.',
          features: 'Razorpay API integration, secure authentication, insights visualization.',
          techStack: ['Next.js', 'Node.js', 'Razorpay API', 'ML Models'],
          impact: 'Attracts FinTech sponsors and has high real-world value.',
          difficulty: 4,
          color: 'linear-gradient(135deg, #11998e, #38ef7d)'
        },
        {
          id: 7,
          title: 'AI-Powered Fake News & Deepfake Detection Platform',
          category: 'Cybersecurity + AI',
          problem: 'Social media misinformation spreads rapidly and causes damage.',
          task: 'Create an AI-driven platform that analyzes articles, tweets, and videos to classify them as authentic or fake.',
          features: 'Fact-checking APIs + real-time detection dashboard.',
          techStack: ['Python', 'HuggingFace Models', 'React', 'Firebase'],
          impact: 'Relevant to journalism, security, and education.',
          difficulty: 4,
          color: 'linear-gradient(135deg, #667eea, #764ba2)'
        },
        {
          id: 8,
          title: 'One-Click Cloud Deployment Platform',
          category: 'DevOps Simplified',
          problem: 'Deploying apps to cloud platforms is complex for beginners.',
          task: 'Build a platform where developers upload their projects → it automatically builds, containers, and deploys apps to AWS, GCP, or Vercel.',
          features: 'Automated CI/CD pipelines, environment isolation, and SSL.',
          techStack: ['Next.js', 'Node.js', 'Docker', 'Kubernetes', 'Vercel/AWS APIs'],
          impact: 'Perfect for GitHub & AWS sponsorship pitches.',
          difficulty: 4,
          color: 'linear-gradient(135deg, #FF9A8B, #GGD558)'
        },
        {
          id: 9,
          title: 'AI-Powered MentorBot for Hackathons',
          category: 'CodeKurukshetra Exclusive',
          problem: 'Mentors can\'t handle hundreds of participant queries simultaneously.',
          task: 'Build a ChatGPT-powered mentor bot trained on docs, APIs, FAQs, and judging rules to guide participants in real-time.',
          features: 'Integrates with Discord, Slack, or Telegram.',
          techStack: ['LangChain', 'OpenAI', 'Supabase', 'React'],
          impact: 'Increases hackathon efficiency and improves participant experience.',
          difficulty: 3,
          color: 'linear-gradient(135deg, #667eea, #764ba2)'
        },
        {
          id: 10,
          title: 'AI-Based SaaS Tool for Code-to-API Generation',
          category: 'Productivity Booster',
          problem: 'Developers waste time manually creating API endpoints for apps.',
          task: 'Build a SaaS tool that auto-generates REST/GraphQL APIs from a given database schema or codebase.',
          features: 'API documentation, testing playground, and SDK generation.',
          techStack: ['Next.js', 'Node.js', 'OpenAI', 'Postman API'],
          impact: 'Attracts developer tool sponsors like GitHub, Postman, and RapidAPI.',
          difficulty: 4,
          color: 'linear-gradient(135deg, #4facfe, #00f2fe)'
        }
      ],
      tracks: [
        {
          id: 'ai-ml',
          name: 'AI & Machine Learning',
          sanskrit: 'बुद्धि युद्ध',
          description: 'Forge intelligent weapons using the power of artificial minds',
          icon: '🤖',
          technologies: ['TensorFlow', 'PyTorch', 'OpenAI', 'Hugging Face'],
          color: 'linear-gradient(135deg, #FF6B6B, #FF8E53)'
        },
        {
          id: 'web-dev',
          name: 'Web Development',
          sanskrit: 'जाल निर्माण',
          description: 'Weave digital realms that captivate and conquer',
          icon: '🌐',
          technologies: ['React', 'Vue', 'Angular', 'Node.js'],
          color: 'linear-gradient(135deg, #667eea, #764ba2)'
        },
        {
          id: 'mobile-dev',
          name: 'Mobile Development',
          sanskrit: 'चल शक्ति',
          description: 'Craft pocket-sized armies for the mobile battlefield',
          icon: '📱',
          technologies: ['React Native', 'Flutter', 'Swift', 'Kotlin'],
          color: 'linear-gradient(135deg, #f093fb, #f5576c)'
        },
        {
          id: 'blockchain',
          name: 'Blockchain & Web3',
          sanskrit: 'श्रृंखला युद्ध',
          description: 'Build decentralized solutions for the future',
          icon: '🔗',
          technologies: ['Solidity', 'Ethereum', 'Polygon', 'IPFS'],
          color: 'linear-gradient(135deg, #4facfe, #00f2fe)'
        }
      ],
      prizes: [
        {
          rank: 1,
          title: 'Grand Champion',
          sanskrit: 'महारथी',
          amount: 40000,
          description: 'The ultimate code warrior who conquers all',
          icon: '🏆'
        },
        {
          rank: 2,
          title: 'Elite Warrior',
          sanskrit: 'वीर योद्धा',
          amount: 20000,
          description: 'Honor to the brave who fought valiantly',
          icon: '🥈'
        },
        {
          rank: 3,
          title: 'Brave Fighter',
          sanskrit: 'साहसी सैनिक',
          amount: 10000,
          description: 'Recognition for courage in battle',
          icon: '🥉'
        }
      ],
      timeline: [
        {
          phase: 'युद्ध प्रारम्भ',
          title: 'Day 1 - Morning',
          description: 'Warriors assemble, choose tracks, form alliances',
          time: 'Day 1 - 9:00 AM',
          icon: <Sword size={24} />
        },
        {
          phase: 'नीति',
          title: 'Day 1 - Evening',
          description: 'Plan your approach, research, initial development',
          time: 'Day 1 - 6:00 PM',
          icon: <Shield size={24} />
        },
        {
          phase: 'संग्राम',
          title: 'Day 2 - Full Day',
          description: 'Code with fury, build your weapon of choice',
          time: 'Day 2 - All Day',
          icon: <Flame size={24} />
        },
        {
          phase: 'विजय',
          title: 'Day 3 - Final Battle',
          description: 'Present your creation, claim victory',
          time: 'Day 3 - Final Presentations',
          icon: <Crown size={24} />
        }
      ],
      rules: [
        'Teams can have 1-4 members',
        'All code must be written during the hackathon',
        'Use of APIs and libraries is allowed',
        'Projects must be functional and demonstrable',
        'Originality and innovation are key judging criteria'
      ],
      judging: [
        { criteria: 'Innovation & Creativity', weight: '30%' },
        { criteria: 'Technical Excellence', weight: '25%' },
        { criteria: 'Design & User Experience', weight: '20%' },
        { criteria: 'Functionality & Completeness', weight: '15%' },
        { criteria: 'Presentation & Communication', weight: '10%' }
      ]
    }
  ];

  useEffect(() => {
    // Load hackathons (in real app, this would be an API call)
    setHackathons(sampleHackathons);
    setCurrentHackathon(sampleHackathons[0]);
  }, []);

  const registerTeam = async (registrationData) => {
    setLoading(true);
    try {
      console.log('🚀 Starting registration process...');
      
      // Transform the form data to match hackathonService expectations
      const serviceData = {
        personal_info: {
          full_name: registrationData.teamLead.name,
          email: registrationData.teamLead.email,
          phone: registrationData.teamLead.phone,
          college: registrationData.teamLead.college,
          department: registrationData.teamLead.branch,
          year: registrationData.teamLead.year,
          roll_number: registrationData.teamLead.rollNumber || ''
        },
        team_info: {
          team_name: registrationData.teamName,
          team_size: 1 + registrationData.members.filter(member => member.name.trim()).length,
          team_members: [
            // Team lead as first member
            {
              name: registrationData.teamLead.name,
              email: registrationData.teamLead.email,
              phone: registrationData.teamLead.phone,
              college: registrationData.teamLead.college,
              department: registrationData.teamLead.branch,
              year: registrationData.teamLead.year,
              role: 'Team Leader'
            },
            // Add team members
            ...registrationData.members
              .filter(member => member.name.trim())
              .map(member => ({
                name: member.name,
                email: member.email,
                phone: member.phone,
                college: member.college,
                department: member.branch,
                year: member.year,
                role: 'Team Member'
              }))
          ]
        },
        additional_info: {
          expectations: registrationData.projectIdea || '',
          linkedin: '',
          github: ''
        }
      };

      console.log('🔄 Calling hackathonService.register...');
      const result = await hackathonService.register(serviceData);
      
      if (result.success) {
        console.log('✅ Registration successful:', result);
        
        // Add to local state for immediate UI update
        const newRegistration = {
          id: result.data.registration_id,
          hackathonId: currentHackathon.id,
          ...registrationData,
          registeredAt: new Date().toISOString(),
          status: 'pending' // Will be updated to 'confirmed' after payment
        };
        
        setRegistrations(prev => [...prev, newRegistration]);
        return { 
          success: true, 
          registration: newRegistration,
          registrationId: result.data.registration_id,
          teamSize: result.data.team_size
        };
      } else {
        console.error('❌ Registration failed:', result.message);
        throw new Error(result.message || 'Registration failed');
      }
    } catch (error) {
      console.error('💥 Registration error:', error);
      return { 
        success: false, 
        error: error.message || 'Registration failed. Please try again.'
      };
    } finally {
      setLoading(false);
    }
  };

  const getRegistrationByEmail = (email) => {
    return registrations.find(reg => 
      reg.teamLead.email === email && reg.hackathonId === currentHackathon?.id
    );
  };

  const value = {
    hackathons,
    currentHackathon,
    registrations,
    loading,
    registerTeam,
    getRegistrationByEmail,
    setCurrentHackathon
  };

  return (
    <HackathonContext.Provider value={value}>
      {children}
    </HackathonContext.Provider>
  );
};
