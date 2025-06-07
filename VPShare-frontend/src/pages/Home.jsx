import Navbar from '../components/Navbar';
import '../styles/Home.css';

function Home() {
  return (
    <>
      <main className="home-main">
        {/* Hero Section */}
        <section className="hero">
          <h1>Master Web Development with VPShare</h1>
          <p className="hero-subtitle">Your journey to becoming a full-stack developer starts here. Learn Frontend, Backend, and Databases with ease.</p>
          <a href="#pricing" className="cta-button">Get Started Today</a>
        </section>

        {/* Vision Section */}
        <section className="vision">
          <h2>Our Vision</h2>
          <p>
            At VPShare, we believe anyone can become a web developer with the right guidance. Our mission is to empower beginners with clear, structured, and hands-on learning paths in Frontend, Backend, and Databases. We provide simple tutorials, practical projects, and a supportive community to help you succeed.
          </p>
        </section>

        {/* Learning Paths Section */}
        <section className="learning-paths">
          <h2>Explore Our Learning Paths</h2>
          <div className="paths-container">
            <div className="path-card">
              <h3>Frontend Development</h3>
              <p>Learn HTML, CSS, JavaScript, and modern frameworks like React to build stunning user interfaces.</p>
            </div>
            <div className="path-card">
              <h3>Backend Development</h3>
              <p>Master server-side programming with Node.js, Express, and APIs to power your applications.</p>
            </div>
            <div className="path-card">
              <h3>Databases</h3>
              <p>Understand SQL and NoSQL databases like MySQL and MongoDB to store and manage data effectively.</p>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="pricing" id="pricing">
          <h2>Pricing Plans</h2>
          <p>Choose a plan that fits your learning journey. Start for free or unlock premium content.</p>
          <div className="pricing-container">
            <div className="pricing-card">
              <h3>Free Plan</h3>
              <p className="price">0 / forever</p>
              <ul>
                <li>Access to beginner tutorials</li>
                <li>Community support</li>
                <li>Basic projects</li>
              </ul>
              <a href="#" className="cta-button secondary">Start Free</a>
            </div>
            <div className="pricing-card">
              <h3>Monthly Plan</h3>
              <p className="price">99 RS / month</p>
              <ul>
                <li>All Free Plan features</li>
                <li>Advanced tutorials</li>
                <li>Exclusive projects</li>
                <li>Priority support</li>
              </ul>
              <a href="#" className="cta-button">Subscribe Now</a>
            </div>
            <div className="pricing-card">
              <h3>Lifetime Plan</h3>
              <p className="price">599 RS / one-time</p>
              <ul>
                <li>All Monthly Plan features</li>
                <li>Lifetime access to all content</li>
                <li>Early access to new courses</li>
                <li>Personalized mentorship</li>
              </ul>
              <a href="#" className="cta-button">Get Lifetime Access</a>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="cta">
          <h2>Ready to Start Your Journey?</h2>
          <p>Join thousands of beginners learning web development with VPShare.</p>
          <a href="#pricing" className="cta-button">Join Now</a>
        </section>
      </main>
    </>
  );
}

export default Home;