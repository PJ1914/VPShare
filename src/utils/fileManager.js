/**
 * File Manager Utility for Playground
 * Handles file operations like create, update, delete, and manage file state
 */

// Default files structure
const DEFAULT_FILES = [
  {
    id: '1',
    name: 'index.js',
    content: '// Write your JavaScript code here\nconsole.log("Hello, Playground!");',
    language: 'javascript',
    isNew: false
  },
  {
    id: '2',
    name: 'styles.css',
    content: '/* Add your styles here */\nbody {\n  margin: 0;\n  font-family: Arial, sans-serif;\n}',
    language: 'css',
    isNew: false
  },
  {
    id: '3',
    name: 'index.html',
    content: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Playground</title>\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n  <script src="index.js"></script>\n</body>\n</html>',
    language: 'html',
    isNew: false
  }
];

// Get file extension from filename
const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase();
};

// Get language from file extension
const getLanguageFromExtension = (filename) => {
  const ext = getFileExtension(filename);
  const extensions = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'md': 'markdown',
    'py': 'python',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'cs': 'csharp',
    'go': 'go',
    'php': 'php',
    'rb': 'ruby',
    'rs': 'rust',
    'swift': 'swift',
    'kt': 'kotlin',
    'dart': 'dart'
  };
  return extensions[ext] || 'plaintext';
};

// Create a new file
const createNewFile = (name = '') => {
  const timestamp = Date.now();
  const defaultName = `untitled-${timestamp}`;
  const fileName = name || `${defaultName}.js`;
  const language = getLanguageFromExtension(fileName);
  
  return {
    id: `file-${timestamp}`,
    name: fileName,
    content: '',
    language,
    isNew: true
  };
};

// Update file content
const updateFileContent = (files, fileId, content) => {
  return files.map(file => 
    file.id === fileId 
      ? { ...file, content, isNew: false }
      : file
  );
};

// Update file name
const updateFileName = (files, fileId, newName) => {
  return files.map(file => {
    if (file.id === fileId) {
      const language = getLanguageFromExtension(newName);
      return { 
        ...file, 
        name: newName, 
        language,
        isNew: false 
      };
    }
    return file;
  });
};

// Delete a file
const deleteFile = (files, fileId) => {
  return files.filter(file => file.id !== fileId);
};

// Get file by ID
const getFileById = (files, fileId) => {
  return files.find(file => file.id === fileId) || null;
};

// Get initial files (load from localStorage or use defaults)
const getInitialFiles = () => {
  try {
    const savedFiles = localStorage.getItem('playground-files');
    if (savedFiles) {
      return JSON.parse(savedFiles);
    }
  } catch (error) {
    console.error('Error loading files from localStorage:', error);
  }
  return [...DEFAULT_FILES];
};

// Save files to localStorage
const saveFiles = (files) => {
  try {
    // Don't save if any file is new (unsaved)
    if (files.some(file => file.isNew)) {
      return false;
    }
    
    // Only save necessary file data
    const filesToSave = files.map(({ id, name, content, language }) => ({
      id,
      name,
      content,
      language
    }));
    
    localStorage.setItem('playground-files', JSON.stringify(filesToSave));
    return true;
  } catch (error) {
    console.error('Error saving files to localStorage:', error);
    return false;
  }
};

export {
  createNewFile,
  updateFileContent,
  updateFileName,
  deleteFile,
  getFileById,
  getInitialFiles,
  saveFiles,
  getLanguageFromExtension
};
