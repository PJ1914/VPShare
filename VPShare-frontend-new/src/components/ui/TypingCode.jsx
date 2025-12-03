import React, { useState, useEffect } from 'react';

const TypingCode = ({ onComplete }) => {
    const [displayedCode, setDisplayedCode] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [hasCompleted, setHasCompleted] = useState(false);

    const fullCode = `function calculateFactorial(n) {
  if (n === 0 || n === 1) {
    return 1;
  }
  return n * calculateFactorial(n - 1);
}

// Calculate factorial of 5
console.log(calculateFactorial(5)); // Output: 120`;

    useEffect(() => {
        if (currentIndex < fullCode.length) {
            const timeout = setTimeout(() => {
                setDisplayedCode(prev => prev + fullCode[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, 50); // Typing speed: 50ms (slower)

            return () => clearTimeout(timeout);
        } else if (currentIndex === fullCode.length && !hasCompleted) {
            setHasCompleted(true);
            if (onComplete) {
                onComplete();
            }
            // Wait 2 seconds then restart
            const resetTimeout = setTimeout(() => {
                setDisplayedCode('');
                setCurrentIndex(0);
                setHasCompleted(false);
            }, 2000);

            return () => clearTimeout(resetTimeout);
        }
    }, [currentIndex, fullCode, onComplete, hasCompleted]);

    // Syntax highlighting helper
    const highlightCode = (code) => {
        const lines = code.split('\n');
        return lines.map((line, lineIndex) => {
            let highlightedLine = line;

            // Keywords
            highlightedLine = highlightedLine.replace(/(function|if|return|const|let|var)/g, '<span class="text-blue-600 dark:text-blue-400">$1</span>');

            // Function names
            highlightedLine = highlightedLine.replace(/(\w+)(?=\()/g, '<span class="text-yellow-600 dark:text-yellow-300">$1</span>');

            // Numbers
            highlightedLine = highlightedLine.replace(/\b(\d+)\b/g, '<span class="text-orange-600 dark:text-orange-300">$1</span>');

            // Comments
            highlightedLine = highlightedLine.replace(/(\/\/.*$)/g, '<span class="text-green-600 dark:text-green-400">$1</span>');

            // Strings
            highlightedLine = highlightedLine.replace(/(['"`])(.*?)\1/g, '<span class="text-green-600 dark:text-green-300">$1$2$1</span>');

            return (
                <div key={lineIndex} dangerouslySetInnerHTML={{ __html: highlightedLine || '&nbsp;' }} />
            );
        });
    };

    return (
        <div className="p-6 font-mono text-sm overflow-x-auto text-gray-800 dark:text-gray-300 min-h-[200px]">
            {highlightCode(displayedCode)}
            <span className="inline-block w-2 h-4 bg-blue-600 dark:bg-blue-400 animate-pulse ml-1"></span>
        </div>
    );
};

export default TypingCode;
