import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AceEditor from 'react-ace';
import MenuIcon from '@mui/icons-material/Menu';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CodeIcon from '@mui/icons-material/Code';
import DeleteIcon from '@mui/icons-material/Delete';
import { Switch, TextField } from '@mui/material';
import '../styles/PlaygroundEditor.css';

// Import Ace editor modes and themes
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/mode-css';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/mode-typescript';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-markdown';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-github';

// Language mode mapping based on file extension
const extensionToMode = {
  '.html': 'html',
  '.css': 'css',
  '.js': 'javascript',
  '.py': 'python',
  '.java': 'java',
  '.ts': 'typescript',
  '.json': 'json',
  '.md': 'markdown',
};

// Predefined snippets for each language mode
const snippets = {
  html: [
    { label: 'Basic HTML', code: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My Page</title>\n</head>\n<body>\n  <h1>Hello, World!</h1>\n</body>\n</html>' },
    { label: 'HTML Form', code: '<form>\n  <label for="name">Name:</label>\n  <input type="text" id="name" name="name">\n  <button type="submit">Submit</button>\n</form>' },
  ],
  css: [
    { label: 'CSS Reset', code: '* { margin: 0; padding: 0; box-sizing: border-box; }' },
    { label: 'Center Div', code: '.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n}' },
  ],
  javascript: [
    { label: 'Console Log', code: 'console.log("Hello, World!");' },
    { label: 'Event Listener', code: 'document.getElementById("myButton").addEventListener("click", () => {\n  alert("Button clicked!");\n});' },
  ],
  python: [
    { label: 'Hello World', code: '# Welcome to Python\nprint("Hello, World!")' },
    { label: 'Simple Loop', code: 'for i in range(5):\n    print(f"Count: {i}")' },
  ],
  java: [
    { label: 'Main Class', code: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}' },
    { label: 'Simple Loop', code: 'for (int i = 0; i < 5; i++) {\n    System.out.println("Count: " + i);\n}' },
  ],
  typescript: [
    { label: 'Interface', code: 'interface User {\n  name: string;\n  age: number;\n}\n\nconst user: User = { name: "Alice", age: 25 };\nconsole.log(user);' },
    { label: 'Function', code: 'function greet(name: string): string {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet("World"));' },
  ],
  json: [
    { label: 'Basic JSON', code: '{\n  "name": "Example",\n  "version": "1.0.0"\n}' },
    { label: 'Array', code: '{\n  "items": [1, 2, 3, 4, 5]\n}' },
  ],
  markdown: [
    { label: 'Heading', code: '# Welcome to Markdown\n\nWrite your documentation here!' },
    { label: 'List', code: '- Item 1\n- Item 2\n- Item 3' },
  ],
};

// Animation variants for buttons
const buttonHoverVariants = {
  hover: { scale: 1.1, transition: { duration: 0.2 } },
};

// Animation variants for sidebar content
const sidebarContentVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, delay: 0.2 } },
};

function PlaygroundEditor() {
  // State management
  const [files, setFiles] = useState(() => {
    const savedFiles = localStorage.getItem('playground_files');
    return savedFiles ? JSON.parse(savedFiles) : [
      { name: 'index.html', content: snippets.html[0].code, mode: 'html' },
    ];
  });
  const [activeFile, setActiveFile] = useState(files[0]?.name || '');
  const [srcDoc, setSrcDoc] = useState('');
  const [previewError, setPreviewError] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [outputVisible, setOutputVisible] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [autoCompile, setAutoCompile] = useState(true);
  const [newFileName, setNewFileName] = useState('');
  const [snippetType, setSnippetType] = useState('');
  const [editorHeight, setEditorHeight] = useState(400);
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const [fontSize, setFontSize] = useState(14);
  const [renamingFile, setRenamingFile] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  const isDraggingHeight = useRef(false);
  const isDraggingWidth = useRef(false);

  // Auto-save to local storage when enabled
  useEffect(() => {
    if (autoSave) {
      localStorage.setItem('playground_files', JSON.stringify(files));
    }
  }, [files, autoSave]);

  // Manual save function
  const saveFiles = () => {
    localStorage.setItem('playground_files', JSON.stringify(files));
  };

  // Update file content
  const updateFileContent = (name, content) => {
    setFiles(prevFiles =>
      prevFiles.map(file =>
        file.name === name ? { ...file, content } : file
      )
    );
  };

  // Add new file
  const addNewFile = () => {
    if (!newFileName) return;
    const extension = newFileName.substring(newFileName.lastIndexOf('.')).toLowerCase();
    const mode = extensionToMode[extension] || 'text';
    const snippet = snippets[mode]?.[0]?.code || '';
    const newFile = { name: newFileName, content: snippet, mode };
    setFiles(prevFiles => [...prevFiles, newFile]);
    setActiveFile(newFileName);
    setNewFileName('');
  };

  // Close file
  const closeFile = (name) => {
    const updatedFiles = files.filter(file => file.name !== name);
    setFiles(updatedFiles);
    if (updatedFiles.length === 0) {
      setActiveFile('');
    } else if (activeFile === name) {
      setActiveFile(updatedFiles[0].name);
    }
  };

  // Rename file
  const startRenaming = (name) => {
    setRenamingFile(name);
    setRenameValue(name);
  };

  const finishRenaming = () => {
    if (!renameValue || renameValue === renamingFile) {
      setRenamingFile(null);
      return;
    }
    const extension = renameValue.substring(renameValue.lastIndexOf('.')).toLowerCase();
    const mode = extensionToMode[extension] || 'text';
    setFiles(prevFiles =>
      prevFiles.map(file =>
        file.name === renamingFile
          ? { ...file, name: renameValue, mode }
          : file
      )
    );
    setActiveFile(renameValue);
    setRenamingFile(null);
  };

  // Clear all files
  const clearAllFiles = () => {
    setFiles([]);
    setActiveFile('');
  };

  // Insert snippet
  const insertSnippet = () => {
    if (!snippetType || !activeFileData) return;
    const mode = activeFileData.mode;
    const snippet = snippets[mode]?.find(s => s.label === snippetType)?.code || '';
    updateFileContent(activeFileData.name, snippet);
    setSnippetType('');
  };

  // Update preview for HTML/CSS/JS
  const updatePreview = useCallback(() => {
    const htmlFile = files.find(file => file.name.endsWith('.html'));
    const cssFile = files.find(file => file.name.endsWith('.css'));
    const jsFile = files.find(file => file.name.endsWith('.js'));

    if (!htmlFile) return;
    try {
      const newSrcDoc = `
        <html>
          <head>
            <style>${cssFile?.content || ''}</style>
          </head>
          <body>
            ${htmlFile.content}
            <script>
              try {
                ${jsFile?.content || ''}
              } catch (e) {
                console.error(e);
                window.parent.postMessage({ type: 'error', message: e.message }, '*');
              }
            </script>
          </body>
        </html>
      `;
      setSrcDoc(newSrcDoc);
      setPreviewError(null);
    } catch (e) {
      setPreviewError(e.message);
    }
  }, [files]);

  useEffect(() => {
    if (autoCompile) {
      const timeout = setTimeout(updatePreview, 300);
      return () => clearTimeout(timeout);
    }
  }, [files, autoCompile, updatePreview]);

  // Handle errors from iframe
  useEffect(() => {
    const handleError = (event) => {
      if (event.data?.type === 'error') {
        setPreviewError(event.data.message);
      }
    };
    window.addEventListener('message', handleError);
    return () => window.removeEventListener('message', handleError);
  }, []);

  // Handle editor height resizing
  const handleHeightResize = (e) => {
    if (isDraggingHeight.current) {
      const newHeight = e.clientY - document.querySelector('.editor-pane').getBoundingClientRect().top;
      setEditorHeight(Math.max(200, Math.min(800, newHeight)));
    }
  };

  const startHeightResize = () => {
    isDraggingHeight.current = true;
  };

  const stopHeightResize = () => {
    isDraggingHeight.current = false;
  };

  // Handle sidebar width resizing
  const handleWidthResize = (e) => {
    if (isDraggingWidth.current && sidebarOpen) {
      const newWidth = e.clientX;
      setSidebarWidth(Math.max(200, Math.min(400, newWidth)));
    }
  };

  const startWidthResize = () => {
    isDraggingWidth.current = true;
  };

  const stopWidthResize = () => {
    isDraggingWidth.current = false;
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleHeightResize);
    window.addEventListener('mouseup', stopHeightResize);
    window.addEventListener('mousemove', handleWidthResize);
    window.addEventListener('mouseup', stopWidthResize);
    return () => {
      window.removeEventListener('mousemove', handleHeightResize);
      window.removeEventListener('mouseup', stopHeightResize);
      window.removeEventListener('mousemove', handleWidthResize);
      window.removeEventListener('mouseup', stopWidthResize);
    };
  }, []);

  const activeFileData = files.find(file => file.name === activeFile);

  return (
    <div className={`playground-container ${theme}`}>
      {/* Sidebar */}
      <motion.div
        className="playground-sidebar"
        style={{ width: sidebarOpen ? `${sidebarWidth}px` : '0px' }}
        initial={{ x: -250 }}
        animate={{ x: sidebarOpen ? 0 : -sidebarWidth }}
        transition={{ type: 'spring', stiffness: 120 }}
      >
        <motion.h3
          className="sidebar-title"
          variants={sidebarContentVariants}
          initial="hidden"
          animate={sidebarOpen ? "visible" : "hidden"}
        >
          Files
        </motion.h3>
        <motion.div
          className="sidebar-section"
          variants={sidebarContentVariants}
          initial="hidden"
          animate={sidebarOpen ? "visible" : "hidden"}
        >
          <label htmlFor="new-file-input">New File</label>
          <input
            id="new-file-input"
            type="text"
            placeholder="e.g., index.html"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addNewFile()}
          />
          <motion.button
            className="sidebar-button"
            onClick={addNewFile}
            disabled={!newFileName}
            variants={buttonHoverVariants}
            whileHover="hover"
          >
            Add File
          </motion.button>
        </motion.div>
        <motion.div
          className="sidebar-section"
          variants={sidebarContentVariants}
          initial="hidden"
          animate={sidebarOpen ? "visible" : "hidden"}
        >
          <label htmlFor="snippet-select">Snippets</label>
          <select
            id="snippet-select"
            value={snippetType}
            onChange={(e) => setSnippetType(e.target.value)}
            disabled={!activeFileData}
          >
            <option value="">None</option>
            {activeFileData && snippets[activeFileData.mode]?.map(snippet => (
              <option key={snippet.label} value={snippet.label}>{snippet.label}</option>
            ))}
          </select>
          <motion.button
            className="sidebar-button"
            onClick={insertSnippet}
            disabled={!snippetType}
            variants={buttonHoverVariants}
            whileHover="hover"
          >
            <CodeIcon fontSize="small" style={{ marginRight: '0.5rem' }} />
            Insert Snippet
          </motion.button>
        </motion.div>
        <motion.div
          className="sidebar-section"
          variants={sidebarContentVariants}
          initial="hidden"
          animate={sidebarOpen ? "visible" : "hidden"}
        >
          <motion.button
            className="sidebar-button clear-button"
            onClick={clearAllFiles}
            disabled={files.length === 0}
            variants={buttonHoverVariants}
            whileHover="hover"
          >
            <DeleteIcon fontSize="small" style={{ marginRight: '0.5rem' }} />
            Clear All Files
          </motion.button>
        </motion.div>
      </motion.div>
      {sidebarOpen && (
        <motion.div
          className="sidebar-resizer"
          style={{ left: `${sidebarWidth}px` }}
          onMouseDown={startWidthResize}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Main Content */}
      <div className={`playground-main ${sidebarOpen ? 'sidebar-open' : ''}`} style={{ marginLeft: sidebarOpen ? `${sidebarWidth}px` : '0px' }}>
        {/* Toolbar */}
        <motion.div
          className="playground-toolbar"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <motion.button
            className="toolbar-button sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            variants={buttonHoverVariants}
            whileHover="hover"
          >
            <MenuIcon fontSize="inherit" />
          </motion.button>
          <div className="toolbar-right">
            <motion.span
              className="collaboration-indicator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              2 Users Active
            </motion.span>
            <motion.label
              className="auto-save-toggle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <span className="toggle-label">Auto-Save</span>
              <Switch
                checked={autoSave}
                onChange={() => setAutoSave(!autoSave)}
                color="primary"
              />
            </motion.label>
            {!autoSave && (
              <motion.button
                className="save-button"
                onClick={saveFiles}
                variants={buttonHoverVariants}
                whileHover="hover"
              >
                <SaveIcon fontSize="inherit" /> Save
              </motion.button>
            )}
            <motion.label
              className="auto-compile-toggle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <span className="toggle-label">Auto-Compile</span>
              <Switch
                checked={autoCompile}
                onChange={() => setAutoCompile(!autoCompile)}
                color="primary"
              />
            </motion.label>
            {!autoCompile && files.some(file => file.name.endsWith('.html')) && (
              <motion.button
                className="run-button"
                onClick={updatePreview}
                variants={buttonHoverVariants}
                whileHover="hover"
              >
                <PlayArrowIcon fontSize="inherit" /> Run
              </motion.button>
            )}
            <motion.div
              className="font-size-select"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.7 }}
            >
              <label htmlFor="font-size">Font Size</label>
              <select
                id="font-size"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
              >
                {[12, 14, 16, 18, 20].map(size => (
                  <option key={size} value={size}>{size}px</option>
                ))}
              </select>
            </motion.div>
            <motion.label
              className="theme-toggle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.8 }}
            >
              <input
                type="checkbox"
                checked={theme === 'dark'}
                onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              />
              <span className="theme-icon">
                {theme === 'dark' ? <LightModeIcon fontSize="inherit" /> : <DarkModeIcon fontSize="inherit" />}
              </span>
            </motion.label>
            <motion.button
              className="toggle-output-button"
              onClick={() => setOutputVisible(!outputVisible)}
              variants={buttonHoverVariants}
              whileHover="hover"
            >
              {outputVisible ? <VisibilityOffIcon fontSize="inherit" /> : <VisibilityIcon fontSize="inherit" />}
              {outputVisible ? 'Hide Output' : 'Show Output'}
            </motion.button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="tab-bar">
          <AnimatePresence>
            {files.map(file => (
              <motion.div
                key={file.name}
                className={`tab ${activeFile === file.name ? 'active' : ''}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                whileHover={{ scale: 1.05 }}
              >
                {renamingFile === file.name ? (
                  <TextField
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={finishRenaming}
                    onKeyPress={(e) => e.key === 'Enter' && finishRenaming()}
                    size="small"
                    autoFocus
                    className="rename-input"
                  />
                ) : (
                  <span onClick={() => setActiveFile(file.name)} onDoubleClick={() => startRenaming(file.name)}>
                    {file.name}
                  </span>
                )}
                <motion.button
                  className="close-tab"
                  onClick={() => closeFile(file.name)}
                  variants={buttonHoverVariants}
                  whileHover="hover"
                >
                  <CloseIcon fontSize="small" />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Editor Pane */}
        <motion.div className="editor-pane" style={{ height: `${editorHeight}px` }}>
          {activeFileData ? (
            <motion.div
              key={activeFileData.name}
              className="editor-section"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.h4
                className="editor-title"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {activeFileData.name}
              </motion.h4>
              <AceEditor
                mode={activeFileData.mode}
                theme={theme === 'dark' ? 'monokai' : 'github'}
                value={activeFileData.content}
                onChange={(content) => updateFileContent(activeFileData.name, content)}
                name={`${activeFileData.name}-editor`}
                editorProps={{ $blockScrolling: true }}
                setOptions={{ useWorker: false, fontSize: fontSize }}
                className="code-editor"
                style={{ height: '100%' }}
              />
            </motion.div>
          ) : (
            <motion.div
              className="no-file-message"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p>No files open. Add a new file from the sidebar.</p>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          className="editor-resizer"
          onMouseDown={startHeightResize}
          whileHover={{ backgroundColor: 'var(--primary-color)' }}
          transition={{ duration: 0.2 }}
        />

        {/* Output Pane */}
        <motion.div
          className="output-container"
          initial={{ height: 'auto' }}
          animate={{ height: outputVisible ? 'auto' : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="output-pane">
            <div className="output-header">
              <motion.h4
                className="output-title"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                Output
              </motion.h4>
              <div className="output-actions">
                {autoSave && (
                  <motion.span
                    className="auto-save"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    Auto-saved ✅
                  </motion.span>
                )}
                {files.some(file => file.name.endsWith('.html')) && autoCompile && (
                  <motion.button
                    className="refresh-button"
                    onClick={updatePreview}
                    variants={buttonHoverVariants}
                    whileHover="hover"
                  >
                    <RefreshIcon fontSize="inherit" /> Refresh
                  </motion.button>
                )}
              </div>
            </div>
            {files.some(file => file.name.endsWith('.html')) ? (
              previewError ? (
                <motion.div
                  className="output-error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <p>Error: {previewError}</p>
                </motion.div>
              ) : (
                <iframe
                  srcDoc={srcDoc}
                  title="Output"
                  sandbox="allow-scripts"
                  frameBorder="0"
                  className="output-iframe"
                />
              )
            ) : (
              <motion.div
                className="output-mock"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <p>No HTML file open for preview.</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default PlaygroundEditor;