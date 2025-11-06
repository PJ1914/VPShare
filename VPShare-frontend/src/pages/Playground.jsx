import { useEffect } from 'react';
import { motion } from 'framer-motion';
import PlaygroundEditor from '../components/PlaygroundEditor';
import ErrorBoundary from '../components/ErrorBoundary';
import '../styles/PlaygroundEditor.css';

function Playground() {
  // Reset scroll position to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="modern-page">
      <div className="modern-container">
        {/* Modern Header */}
        <motion.section
          className="modern-section"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="modern-card" style={{ textAlign: 'center', padding: '2rem' }}>
            <h1 className="modern-heading-xl" style={{ marginBottom: '1rem' }}>
              Coding Playground
            </h1>
            <p className="modern-text">
              Write, run & execute code in your browser with our interactive playground
            </p>
          </div>
        </motion.section>

        {/* Modern Playground Editor */}
        <motion.section
          className="modern-section"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
        >
          <div className="modern-card no-hover" style={{ padding: '1rem', minHeight: '600px' }}>
            <ErrorBoundary>
              <PlaygroundEditor />
            </ErrorBoundary>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

export default Playground;