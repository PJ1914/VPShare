import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuth } from 'firebase/auth';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  FileText, 
  Video, 
  Code, 
  BookOpen,
  ChevronRight,
  Trophy,
  Lock
} from 'lucide-react';
import LearningSpaceSidebar from '../components/layout/LearningSpaceSidebar';
import { isEnrolledInLiveClasses } from '../services/enrollmentService';
import SEO from '../components/SEO';
import '../styles/LiveClassesModule.css';
import '../styles/LearningSpaceLayout.css';

// Module curriculum data
const MODULES = {
  '1': {
    title: 'Python Fundamentals',
    description: 'Master the basics of Python programming',
    duration: '4 weeks',
    lessons: [
      {
        id: 1,
        title: 'Introduction to Python',
        duration: '2 hours',
        type: 'video',
        topics: ['Variables & Data Types', 'Input/Output', 'Basic Operators'],
        resources: ['Slides', 'Code Examples', 'Quiz'],
        completed: true
      },
      {
        id: 2,
        title: 'Control Flow',
        duration: '2.5 hours',
        type: 'video',
        topics: ['If-Else Statements', 'Loops', 'Break & Continue'],
        resources: ['Slides', 'Practice Problems', 'Quiz'],
        completed: true
      },
      {
        id: 3,
        title: 'Functions & Modules',
        duration: '3 hours',
        type: 'video',
        topics: ['Defining Functions', 'Parameters & Arguments', 'Modules & Packages'],
        resources: ['Slides', 'Code Examples', 'Assignment'],
        completed: false
      },
      {
        id: 4,
        title: 'Data Structures',
        duration: '3 hours',
        type: 'video',
        topics: ['Lists', 'Tuples', 'Dictionaries', 'Sets'],
        resources: ['Slides', 'Practice Problems', 'Quiz'],
        completed: false
      },
      {
        id: 5,
        title: 'File Handling',
        duration: '2 hours',
        type: 'video',
        topics: ['Reading Files', 'Writing Files', 'Context Managers'],
        resources: ['Slides', 'Code Examples', 'Assignment'],
        completed: false
      },
      {
        id: 6,
        title: 'Module 1 Project',
        duration: '4 hours',
        type: 'project',
        topics: ['Build a CLI Calculator', 'File-based Todo App', 'Data Analysis Script'],
        resources: ['Project Brief', 'Starter Code', 'Submission Form'],
        completed: false
      }
    ]
  },
  '2': {
    title: 'Advanced Python & AWS Basics',
    description: 'Object-oriented programming and cloud fundamentals',
    duration: '4 weeks',
    lessons: [
      {
        id: 1,
        title: 'Object-Oriented Programming',
        duration: '3 hours',
        type: 'video',
        topics: ['Classes & Objects', 'Inheritance', 'Polymorphism'],
        resources: ['Slides', 'Code Examples', 'Quiz'],
        completed: false
      },
      {
        id: 2,
        title: 'Error Handling & Debugging',
        duration: '2 hours',
        type: 'video',
        topics: ['Try-Except', 'Custom Exceptions', 'Debugging Techniques'],
        resources: ['Slides', 'Practice Problems', 'Quiz'],
        completed: false
      },
      {
        id: 3,
        title: 'Working with APIs',
        duration: '2.5 hours',
        type: 'video',
        topics: ['REST APIs', 'Requests Library', 'JSON Handling'],
        resources: ['Slides', 'Code Examples', 'Assignment'],
        completed: false
      },
      {
        id: 4,
        title: 'Introduction to AWS',
        duration: '3 hours',
        type: 'video',
        topics: ['AWS Console', 'IAM', 'S3 Basics'],
        resources: ['Slides', 'Live Demo', 'Quiz'],
        completed: false
      },
      {
        id: 5,
        title: 'AWS Lambda Functions',
        duration: '3 hours',
        type: 'video',
        topics: ['Serverless Computing', 'Lambda with Python', 'Event Triggers'],
        resources: ['Slides', 'Code Examples', 'Assignment'],
        completed: false
      },
      {
        id: 6,
        title: 'Module 2 Project',
        duration: '5 hours',
        type: 'project',
        topics: ['Build a Weather API App', 'Deploy to AWS Lambda', 'Connect to S3'],
        resources: ['Project Brief', 'Starter Code', 'Submission Form'],
        completed: false
      }
    ]
  },
  '3': {
    title: 'Full-Stack AWS Deployment',
    description: 'Build and deploy production-ready applications',
    duration: '4 weeks',
    lessons: [
      {
        id: 1,
        title: 'EC2 & Application Deployment',
        duration: '3 hours',
        type: 'video',
        topics: ['EC2 Instances', 'SSH Access', 'Application Setup'],
        resources: ['Slides', 'Live Demo', 'Quiz'],
        completed: false
      },
      {
        id: 2,
        title: 'Databases on AWS',
        duration: '3 hours',
        type: 'video',
        topics: ['RDS Setup', 'Database Connections', 'Data Migration'],
        resources: ['Slides', 'Code Examples', 'Assignment'],
        completed: false
      },
      {
        id: 3,
        title: 'Load Balancing & Auto Scaling',
        duration: '2.5 hours',
        type: 'video',
        topics: ['ELB Configuration', 'Auto Scaling Groups', 'High Availability'],
        resources: ['Slides', 'Live Demo', 'Quiz'],
        completed: false
      },
      {
        id: 4,
        title: 'CI/CD with AWS',
        duration: '3 hours',
        type: 'video',
        topics: ['CodePipeline', 'CodeBuild', 'CodeDeploy'],
        resources: ['Slides', 'Code Examples', 'Assignment'],
        completed: false
      },
      {
        id: 5,
        title: 'Monitoring & Security',
        duration: '2.5 hours',
        type: 'video',
        topics: ['CloudWatch', 'Security Groups', 'Best Practices'],
        resources: ['Slides', 'Live Demo', 'Quiz'],
        completed: false
      },
      {
        id: 6,
        title: 'Final Capstone Project',
        duration: '8 hours',
        type: 'project',
        topics: ['Full-Stack App', 'AWS Deployment', 'Production Ready'],
        resources: ['Project Brief', 'Starter Code', 'Submission Form'],
        completed: false
      }
    ]
  }
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

function LiveClassesModule() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkEnrollment = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const enrolled = await isEnrolledInLiveClasses(user.uid);
        if (!enrolled) {
          navigate('/live-classes');
          return;
        }
        setIsEnrolled(enrolled);
      } catch (error) {
        console.error('Failed to check enrollment:', error);
        navigate('/live-classes');
      } finally {
        setLoading(false);
      }
    };

    checkEnrollment();
  }, [navigate]);

  const module = MODULES[moduleId];

  if (loading) {
    return (
      <>
        <LearningSpaceSidebar isEnrolledInLiveClasses={true} />
        <div className="learning-space-content">
          <div className="module-container">
            <div className="loading-skeleton">
              <div className="skeleton-header" />
              <div className="skeleton-card" />
              <div className="skeleton-card" />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!module) {
    return (
      <>
        <LearningSpaceSidebar isEnrolledInLiveClasses={isEnrolled} />
        <div className="learning-space-content">
          <div className="module-container">
            <h1>Module not found</h1>
            <button onClick={() => navigate('/courses')} className="modern-btn modern-btn-primary">
              Back to Courses
            </button>
          </div>
        </div>
      </>
    );
  }

  const completedLessons = module.lessons.filter(l => l.completed).length;
  const progress = Math.round((completedLessons / module.lessons.length) * 100);

  const getLessonIcon = (type) => {
    switch (type) {
      case 'video':
        return <Video size={20} />;
      case 'project':
        return <Code size={20} />;
      case 'reading':
        return <BookOpen size={20} />;
      default:
        return <FileText size={20} />;
    }
  };

  return (
    <>
      <SEO
        title={`${module.title} - Live Classes | CodeTapasya`}
        description={module.description}
        noIndex={true}
      />

      <LearningSpaceSidebar isEnrolledInLiveClasses={isEnrolled} />

      <div className="learning-space-content">
        <div className="module-container">
          {/* Module Header */}
          <motion.div
            className="module-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="module-header-content">
              <div className="breadcrumb">
                <span onClick={() => navigate('/courses')} className="breadcrumb-link">Courses</span>
                <ChevronRight size={16} />
                <span onClick={() => navigate('/courses')} className="breadcrumb-link">Live Classes</span>
                <ChevronRight size={16} />
                <span>Module {moduleId}</span>
              </div>

              <h1 className="module-title">{module.title}</h1>
              <p className="module-description">{module.description}</p>

              <div className="module-meta">
                <div className="meta-item">
                  <Clock size={18} />
                  <span>{module.duration}</span>
                </div>
                <div className="meta-item">
                  <FileText size={18} />
                  <span>{module.lessons.length} lessons</span>
                </div>
                <div className="meta-item">
                  <Trophy size={18} />
                  <span>{completedLessons}/{module.lessons.length} completed</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="progress-section">
                <div className="progress-header">
                  <span>Your Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="progress-bar-container">
                  <motion.div
                    className="progress-bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Lessons List */}
          <motion.div
            className="lessons-container"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <h2 className="lessons-title">Course Content</h2>

            <div className="lessons-list">
              {module.lessons.map((lesson, index) => (
                <motion.div
                  key={lesson.id}
                  className={`lesson-card ${lesson.completed ? 'completed' : ''}`}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="lesson-header">
                    <div className="lesson-status">
                      {lesson.completed ? (
                        <CheckCircle className="status-icon completed" size={24} />
                      ) : (
                        <Circle className="status-icon" size={24} />
                      )}
                    </div>

                    <div className="lesson-info">
                      <div className="lesson-title-row">
                        <h3 className="lesson-title">
                          Lesson {lesson.id}: {lesson.title}
                        </h3>
                        <div className="lesson-type">
                          {getLessonIcon(lesson.type)}
                          <span>{lesson.type}</span>
                        </div>
                      </div>

                      <div className="lesson-meta">
                        <Clock size={16} />
                        <span>{lesson.duration}</span>
                      </div>

                      {/* Topics */}
                      <div className="lesson-topics">
                        {lesson.topics.map((topic, idx) => (
                          <span key={idx} className="topic-tag">
                            {topic}
                          </span>
                        ))}
                      </div>

                      {/* Resources */}
                      <div className="lesson-resources">
                        <span className="resources-label">Resources:</span>
                        {lesson.resources.map((resource, idx) => (
                          <span key={idx} className="resource-tag">
                            {resource}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="lesson-action">
                      {lesson.completed ? (
                        <button className="lesson-btn review">
                          Review
                        </button>
                      ) : index === 0 || module.lessons[index - 1].completed ? (
                        <button className="lesson-btn start">
                          {index === completedLessons ? 'Continue' : 'Start'}
                        </button>
                      ) : (
                        <button className="lesson-btn locked" disabled>
                          <Lock size={16} />
                          Locked
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Next Module CTA */}
          {progress === 100 && parseInt(moduleId) < 3 && (
            <motion.div
              className="next-module-cta"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Trophy size={32} />
              <h3>Module Completed! 🎉</h3>
              <p>You've finished all lessons in this module. Ready for the next challenge?</p>
              <button
                className="modern-btn modern-btn-primary"
                onClick={() => navigate(`/live-classes/module/${parseInt(moduleId) + 1}`)}
              >
                Continue to Module {parseInt(moduleId) + 1}
                <ChevronRight size={20} />
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}

export default LiveClassesModule;
