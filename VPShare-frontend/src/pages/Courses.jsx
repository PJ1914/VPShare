import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Courses.css';

function Courses() {
  const [filter, setFilter] = useState('All');

  // Sample course data (replace with API call from src/services/)
  const courses = [
    {
      id: 1,
      category: 'Frontend',
      title: 'HTML & CSS Fundamentals',
      description: 'Learn to build and style web pages with HTML and CSS.',
      level: 'Beginner',
      link: '/courses/html-css',
    },
    {
      id: 2,
      category: 'Frontend',
      title: 'JavaScript Essentials',
      description: 'Master JavaScript to add interactivity to your websites.',
      level: 'Beginner',
      link: '/courses/javascript',
    },
    {
      id: 3,
      category: 'Frontend',
      title: 'React for Beginners',
      description: 'Build dynamic user interfaces with React.',
      level: 'Intermediate',
      link: '/courses/react',
    },
    {
      id: 4,
      category: 'Backend',
      title: 'Node.js and Express',
      description: 'Create server-side applications with Node.js and Express.',
      level: 'Beginner',
      link: '/courses/node-js',
    },
    {
      id: 5,
      category: 'Backend',
      title: 'RESTful APIs',
      description: 'Design and build RESTful APIs for web applications.',
      level: 'Intermediate',
      link: '/courses/rest-apis',
    },
    {
      id: 6,
      category: 'Databases',
      title: 'SQL Basics',
      description: 'Learn to query and manage databases with SQL.',
      level: 'Beginner',
      link: '/courses/sql',
    },
    {
      id: 7,
      category: 'Databases',
      title: 'MongoDB for Beginners',
      description: 'Explore NoSQL databases with MongoDB.',
      level: 'Beginner',
      link: '/courses/mongodb',
    },
  ];

  // Filter courses based on category
  const filteredCourses = filter === 'All' ? courses : courses.filter(course => course.category === filter);

  return (
    <div className="courses-container">
      <main className="courses-main">
        {/* Hero Section */}
        <section className="courses-hero">
          <h1>Explore Our Courses</h1>
          <p>Master web development with our beginner-friendly courses in Frontend, Backend, and Databases.</p>
          <Link to="#courses" className="hero-cta">Start Learning</Link>
        </section>

        {/* Filter Bar */}
        <section className="filter-bar">
          <h2>Filter Courses</h2>
          <div className="filter-buttons">
            {['All', 'Frontend', 'Backend', 'Databases'].map(category => (
              <button
                key={category}
                className={`filter-button ${filter === category ? 'active' : ''}`}
                onClick={() => setFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* Course List */}
        <section className="course-list">
          <h2>{filter} Courses</h2>
          <div className="course-grid">
            {filteredCourses.map(course => (
              <div key={course.id} className="course-card">
                <span className={`course-category ${course.category.toLowerCase()}`}>{course.category}</span>
                <h3>{course.title}</h3>
                <p className="course-description">{course.description}</p>
                <p className="course-level">Level: {course.level}</p>
                <Link to={course.link} className="course-link">Start Course</Link>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Courses;