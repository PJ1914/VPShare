import { useEffect } from 'react';
import { motion } from 'framer-motion';
import PlaygroundEditor from '../components/PlaygroundEditor';
import ErrorBoundary from '../components/PlaygroundEditor';
import '../styles/PlaygroundEditor.css';

function Playground() {
  // Reset scroll position to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="playground-wrapper">
      <motion.h2
        className="playground-title"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        Coding Playground
      </motion.h2>
      <ErrorBoundary>
        <PlaygroundEditor />
      </ErrorBoundary>
    </div>
  );
}

export default Playground;