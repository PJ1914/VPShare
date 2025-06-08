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
        <h3 className="sidebar-title">Files</h3>
        <div className="sidebar-section">
          <label htmlFor="new-file-input">New File</label>
          <input
            id="new-file-input"
            type="text"
            placeholder="e.g., index.html"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addNewFile()}
          />
          <button
            className="sidebar-button"
            onClick={addNewFile}
            disabled={!newFileName}
          >
            Add File
          </button>
        </div>
        <div className="sidebar-section">
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
          <button
            className="sidebar-button"
            onClick={insertSnippet}
            disabled={!snippetType}
          >
            <CodeIcon fontSize="small" style={{ marginRight: '0.5rem' }} />
            Insert Snippet
          </button>
        </div>
        <div className="sidebar-section">
          <button
            className="sidebar-button clear-button"
            onClick={clearAllFiles}
            disabled={files.length === 0}
          >
            <DeleteIcon fontSize="small" style={{ marginRight: '0.5rem' }} />
            Clear All Files
          </button>
        </div>
      </motion.div>
      {sidebarOpen && (
        <div
          className="sidebar-resizer"
          style={{ left: `${sidebarWidth}px` }}
          onMouseDown={startWidthResize}
        />
      )}

      {/* Main Content */}
      <div className={`playground-main ${sidebarOpen ? 'sidebar-open' : ''}`} style={{ marginLeft: sidebarOpen ? `${sidebarWidth}px` : '0px' }}>
        {/* Toolbar */}
        <div className="playground-toolbar">
          <button
            className="toolbar-button sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <MenuIcon fontSize="inherit" />
          </button>
          <div className="toolbar-right">
            <span className="collaboration-indicator">2 Users Active</span>
            <label className="auto-save-toggle">
              <span className="toggle-label">Auto-Save</span>
              <Switch
                checked={autoSave}
                onChange={() => setAutoSave(!autoSave)}
                color="primary"
              />
            </label>
            {!autoSave && (
              <button className="save-button" onClick={saveFiles}>
                <SaveIcon fontSize="inherit" /> Save
              </button>
            )}
            <label className="auto-compile-toggle">
              <span className="toggle-label">Auto-Compile</span>
              <Switch
                checked={autoCompile}
                onChange={() => setAutoCompile(!autoCompile)}
                color="primary"
              />
            </label>
            {!autoCompile && files.some(file => file.name.endsWith('.html')) && (
              <button className="run-button" onClick={updatePreview}>
                <PlayArrowIcon fontSize="inherit" /> Run
              </button>
            )}
            <div className="font-size-select">
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
            </div>
            <label className="theme-toggle">
              <input
                type="checkbox"
                checked={theme === 'dark'}
                onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              />
              <span className="theme-icon">
                {theme === 'dark' ? <LightModeIcon fontSize="inherit" /> : <DarkModeIcon fontSize="inherit" />}
              </span>
            </label>
            <button
              className="toggle-output-button"
              onClick={() => setOutputVisible(!outputVisible)}
            >
              {outputVisible ? <VisibilityOffIcon fontSize="inherit" /> : <VisibilityIcon fontSize="inherit" />}
              {outputVisible ? 'Hide Output' : 'Show Output'}
            </button>
          </div>
        </div>

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
                <button className="close-tab" onClick={() => closeFile(file.name)}>
                  <CloseIcon fontSize="small" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Editor Pane */}
        <motion.div className="editor-pane" style={{ height: `${editorHeight}px` }}>
          {activeFileData ? (
            <motion.div
              key={activeFileData.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="editor-section"
            >
              <h4 className="editor-title">{activeFileData.name}</h4>
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
            <div className="no-file-message">
              <p>No files open. Add a new file from the sidebar.</p>
            </div>
          )}
        </motion.div>

        <div className="editor-resizer" onMouseDown={startHeightResize} />

        {/* Output Pane */}
        <motion.div
          className="output-container"
          initial={{ height: 'auto' }}
          animate={{ height: outputVisible ? 'auto' : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="output-pane">
            <div className="output-header">
              <h4 className="output-title">Output</h4>
              <div className="output-actions">
                {autoSave && <span className="auto-save">Auto-saved ✅</span>}
                {files.some(file => file.name.endsWith('.html')) && autoCompile && (
                  <button className="refresh-button" onClick={updatePreview}>
                    <RefreshIcon fontSize="inherit" /> Refresh
                  </button>
                )}
              </div>
            </div>
            {files.some(file => file.name.endsWith('.html')) ? (
              previewError ? (
                <div className="output-error">
                  <p>Error: {previewError}</p>
                </div>
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
              <div className="output-mock">
                <p>No HTML file open for preview.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default PlaygroundEditor;