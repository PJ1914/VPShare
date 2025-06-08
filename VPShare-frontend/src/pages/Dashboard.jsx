import { Link } from 'react-router-dom';
import {
  LibraryBooks as LibraryBooksIcon,
  Person as PersonIcon,
  Support as SupportIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import '../styles/Dashboard.css';

function Dashboard() {
  // Placeholder for user data (replace with AuthContext or API call)
  const user = { name: 'Learner' }; // Example user object

  // Sample blog data (replace with API call from services/)
  const blogs = [
    {
      id: 1,
      category: 'Frontend',
      title: 'Getting Started with HTML & CSS',
      excerpt: 'Learn the basics of building web pages with HTML and styling with CSS.',
      link: '/blogs/html-css',
    },
    {
      id: 2,
      category: 'Backend',
      title: 'Introduction to Node.js',
      excerpt: 'Discover how to build server-side applications using Node.js and Express.',
      link: '/blogs/node-js',
    },
    {
      id: 3,
      category: 'Databases',
      title: 'SQL for Beginners',
      excerpt: 'Master the fundamentals of SQL to manage and query databases.',
      link: '/blogs/sql',
    },
    {
      id: 4,
      category: 'Frontend',
      title: 'React Basics',
      excerpt: 'Dive into React to create dynamic user interfaces.',
      link: '/blogs/react',
    },
  ];

  return (
    <div className="dashboard-container">
      {/* Navbar (assumed to be included in App.jsx layout) */}
      <main className="dashboard-main">
        {/* Welcome Section */}
        <section className="welcome-section">
          <h1>Welcome Back, {user.name}!</h1>
          <p>Your journey to mastering web development continues here.</p>
        </section>

        {/* Learning Progress */}
        <section className="progress-section">
          <h2>Your Learning Progress</h2>
          <div className="progress-container">
            <div className="progress-card">
              <h3>Frontend</h3>
              <p>50% Complete</p>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '50%' }}></div>
              </div>
              <Link to="/courses/frontend" className="progress-link">Continue Learning</Link>
            </div>
            <div className="progress-card">
              <h3>Backend</h3>
              <p>30% Complete</p>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '30%' }}></div>
              </div>
              <Link to="/courses/backend" className="progress-link">Continue Learning</Link>
            </div>
            <div className="progress-card">
              <h3>Databases</h3>
              <p>20% Complete</p>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '20%' }}></div>
              </div>
              <Link to="/courses/databases" className="progress-link">Continue Learning</Link>
            </div>
          </div>
        </section>

        {/* Blog Section */}
        <section className="blog-section">
          <h2>Latest Blogs</h2>
          <div className="blog-container">
            {blogs.map((blog) => (
              <div key={blog.id} className="blog-card">
                <span className={`blog-category ${blog.category.toLowerCase()}`}>{blog.category}</span>
                <h3>{blog.title}</h3>
                <p>{blog.excerpt}</p>
                <Link to={blog.link} className="blog-link">Read More</Link>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Links */}
        <section className="quick-links">
          <h2>Quick Links</h2>
          <div className="quick-links-container">
            <Link to="/Courses" className="quick-link-card">
              <span className="quick-link-icon"><LibraryBooksIcon /></span>
              <span className="quick-link-text">Browse All Courses</span>
            </Link>
            <Link to="/profile" className="quick-link-card">
              <span className="quick-link-icon"><PersonIcon /></span>
              <span className="quick-link-text">Update Profile</span>
            </Link>
            <Link to="/support" className="quick-link-card">
              <span className="quick-link-icon"><SupportIcon /></span>
              <span className="quick-link-text">Get Support</span>
            </Link>
            <Link to="/playground" className="quick-link-card">
              <span className="quick-link-icon"><CodeIcon /></span>
              <span className="quick-link-text">Code Playground</span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;