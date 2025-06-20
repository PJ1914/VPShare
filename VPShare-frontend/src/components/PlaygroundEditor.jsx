import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { Octokit } from '@octokit/rest';
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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SearchIcon from '@mui/icons-material/Search';
import GitHubIcon from '@mui/icons-material/GitHub';
import HtmlIcon from '@mui/icons-material/Html';
import CssIcon from '@mui/icons-material/Css';
import JavascriptIcon from '@mui/icons-material/Javascript';
import CodeSharpIcon from '@mui/icons-material/CodeSharp'; 
import DescriptionIcon from '@mui/icons-material/Description'; 
import { Switch, TextField } from '@mui/material';
import '../styles/PlaygroundEditor.css';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

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

// File extension to icon mapping using MUI icons
const extensionToIcon = {
  '.html': <HtmlIcon className="text-indigo-500" />,
  '.css': <CssIcon className="text-teal-400" />,
  '.js': <JavascriptIcon className="text-yellow-400" />,
  '.py': <CodeSharpIcon className="text-blue-500" />,
  '.java': <CodeSharpIcon className="text-red-500" />,
  '.ts': <CodeSharpIcon className="text-blue-600" />,
  '.json': <DescriptionIcon className="text-green-400" />,
  '.md': <DescriptionIcon className="text-gray-400" />,
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

// Utility to debounce a function
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
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
  const [isMobile, setIsMobile] = useState(false);
  const [fileExplorerOpen, setFileExplorerOpen] = useState(true);
  const [fileSearch, setFileSearch] = useState('');
  const [githubUser, setGithubUser] = useState(null);
  const [githubToken, setGithubToken] = useState(null);
  const [githubRepos, setGithubRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [repoFiles, setRepoFiles] = useState([]);
  const [repoBranches, setRepoBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('main');
  const [commitHistory, setCommitHistory] = useState([]);
  const [newRepoName, setNewRepoName] = useState('');
  const [newFilePath, setNewFilePath] = useState('');
  const [newFolderPath, setNewFolderPath] = useState('');
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [isLoadingCommits, setIsLoadingCommits] = useState(false);
  const [repoName, setRepoName] = useState(''); // Add missing repoName state for GitHub integration input
  const [githubError, setGithubError] = useState(null); // Add missing githubError state for GitHub integration errors

  const isDraggingHeight = useRef(false);
  const isDraggingWidth = useRef(false);
  const editorRef = useRef(null);
  const dragIndex = useRef(null);
  const octokitRef = useRef(null);

  // Listen for Firebase Auth user and extract GitHub token
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setGithubUser(user);
      // Extract GitHub access token from providerData or reload user
      if (user) {
        user.getIdTokenResult(true).then((idTokenResult) => {
          // Firebase stores GitHub access token in user.stsTokenManager or user.reloadUserInfo
          // But the most reliable way is to check user.providerData
          const githubProvider = user.providerData.find(p => p.providerId === 'github.com');
          if (githubProvider && user.reloadUserInfo && user.reloadUserInfo.providerUserInfo) {
            const githubInfo = user.reloadUserInfo.providerUserInfo.find(p => p.providerId === 'github.com');
            if (githubInfo && githubInfo.screenName) {
              // Try to get token from user.reloadUserInfo or custom claims
              // But Firebase does not expose the GitHub access token by default for security
              // If you use signInWithPopup, you can get the credential from the result
              // Here, you may need to store the token in Firestore or in localStorage after login
              // For now, try to get it from sessionStorage (if you stored it after login)
              const token = sessionStorage.getItem('githubAccessToken');
              if (token) setGithubToken(token);
            }
          }
        });
      } else {
        setGithubToken(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Initialize Octokit after authentication
  useEffect(() => {
    if (githubToken) {
      octokitRef.current = new Octokit({ auth: githubToken });
    }
  }, [githubToken]);

  // Save project to GitHub (Vercel-like: use repoName input as owner/repo)
  const saveToGithub = async () => {
    if (!octokitRef.current || !repoName) {
      setGithubError('Please enter a repository name (e.g., vercel/next.js).');
      return;
    }
    try {
      const [owner, repo] = repoName.split('/');
      if (!owner || !repo) {
        setGithubError('Repository name must be in the format owner/repo.');
        return;
      }
      const projectData = JSON.stringify(files);
      const content = btoa(projectData);
      await octokitRef.current.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: 'project.json',
        message: 'Save project from PlaygroundEditor',
        content,
      });
      setGithubError(null);
      alert('Project saved to GitHub successfully!');
    } catch (error) {
      setGithubError('Failed to save to GitHub: ' + error.message);
    }
  };

  // Load project from GitHub (Vercel-like: use repoName input as owner/repo)
  const loadFromGithub = async () => {
    if (!octokitRef.current || !repoName) {
      setGithubError('Please enter a repository name (e.g., vercel/next.js).');
      return;
    }
    try {
      const [owner, repo] = repoName.split('/');
      if (!owner || !repo) {
        setGithubError('Repository name must be in the format owner/repo.');
        return;
      }
      const response = await octokitRef.current.repos.getContent({
        owner,
        repo,
        path: 'project.json',
      });
      const projectData = JSON.parse(atob(response.data.content));
      setFiles(projectData);
      setActiveFile(projectData[0]?.name || '');
      setGithubError(null);
      alert('Project loaded from GitHub successfully!');
    } catch (error) {
      setGithubError('Failed to load from GitHub: ' + error.message);
    }
  };

  // Detect mobile device on mount
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /mobile|android|iphone|ipad|tablet|touch/.test(userAgent);
      const isSmallScreen = window.innerWidth <= 767;
      setIsMobile(isMobileDevice && isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-save to local storage when enabled
  useEffect(() => {
    if (autoSave && !isMobile) {
      localStorage.setItem('playground_files', JSON.stringify(files));
    }
  }, [files, autoSave, isMobile]);

  // Manual save function
  const saveFiles = () => {
    if (!isMobile) {
      localStorage.setItem('playground_files', JSON.stringify(files));
    }
  };

  // Debounced update file content to reduce state updates during typing
  const debouncedUpdateFileContent = useMemo(
    () =>
      debounce((name, content) => {
        setFiles(prevFiles =>
          prevFiles.map(file =>
            file.name === name ? { ...file, content } : file
          )
        );
      }, 50),
    []
  );

  // Update file content
  const updateFileContent = (name, content) => {
    if (isMobile) return;
    debouncedUpdateFileContent(name, content);
  };

  // Add new file
  const addNewFile = () => {
    if (isMobile || !newFileName) return;
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
    if (isMobile) return;
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
    if (isMobile) return;
    setRenamingFile(name);
    setRenameValue(name);
  };

  const finishRenaming = () => {
    if (isMobile || !renameValue || renameValue === renamingFile) {
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
    if (isMobile) return;
    setFiles([]);
    setActiveFile('');
  };

  // Insert snippet
  const insertSnippet = () => {
    if (isMobile || !snippetType || !activeFileData) return;
    const mode = activeFileData.mode;
    const snippet = snippets[mode]?.find(s => s.label === snippetType)?.code || '';
    updateFileContent(activeFileData.name, snippet);
    setSnippetType('');
  };

  // Drag-and-drop file reordering
  const handleDragStart = (index) => {
    dragIndex.current = index;
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
  };

  const handleDrop = (index) => {
    const draggedFile = files[dragIndex.current];
    const newFiles = [...files];
    newFiles.splice(dragIndex.current, 1);
    newFiles.splice(index, 0, draggedFile);
    setFiles(newFiles);
    dragIndex.current = null;
  };

  // Update preview for HTML/CSS/JS
  const updatePreview = useCallback(() => {
    if (isMobile) return;
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
  }, [files, isMobile]);

  useEffect(() => {
    if (autoCompile && !isMobile) {
      const timeout = setTimeout(updatePreview, 300);
      return () => clearTimeout(timeout);
    }
  }, [files, autoCompile, updatePreview, isMobile]);

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

  // Handle editor height resizing with requestAnimationFrame
  const handleHeightResize = (e) => {
    if (isDraggingHeight.current && !isMobile) {
      const newHeight = e.clientY - document.querySelector('.editor-pane').getBoundingClientRect().top;
      setEditorHeight(Math.max(200, Math.min(800, newHeight)));
    }
  };

  const startHeightResize = () => {
    if (isMobile) return;
    isDraggingHeight.current = true;
  };

  const stopHeightResize = () => {
    isDraggingHeight.current = false;
  };

  // Handle sidebar width resizing with requestAnimationFrame
  const handleWidthResize = (e) => {
    if (isDraggingWidth.current && sidebarOpen && !isMobile) {
      const newWidth = e.clientX;
      setSidebarWidth(Math.max(200, Math.min(400, newWidth)));
    }
  };

  const startWidthResize = () => {
    if (isMobile) return;
    isDraggingWidth.current = true;
  };

  const stopWidthResize = () => {
    isDraggingWidth.current = false;
  };

  useEffect(() => {
    let rafId;
    const rafHandleHeightResize = (e) => {
      rafId = requestAnimationFrame(() => handleHeightResize(e));
    };
    const rafHandleWidthResize = (e) => {
      rafId = requestAnimationFrame(() => handleWidthResize(e));
    };

    window.addEventListener('mousemove', rafHandleHeightResize);
    window.addEventListener('mouseup', stopHeightResize);
    window.addEventListener('mousemove', rafHandleWidthResize);
    window.addEventListener('mouseup', stopWidthResize);

    return () => {
      window.removeEventListener('mousemove', rafHandleHeightResize);
      window.removeEventListener('mouseup', stopHeightResize);
      window.removeEventListener('mousemove', rafHandleWidthResize);
      window.removeEventListener('mouseup', stopWidthResize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isMobile]);

  const activeFileData = files.find(file => file.name === activeFile);

  // Filter files based on search
  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(fileSearch.toLowerCase())
  );

  // --- GITHUB ADVANCED LOGIC ---
  // Fetch user repos
  const fetchGithubRepos = useCallback(async () => {
    if (!octokitRef.current) return;
    setIsLoadingRepos(true);
    try {
      const { data } = await octokitRef.current.repos.listForAuthenticatedUser({ per_page: 100 });
      setGithubRepos(data);
      setIsLoadingRepos(false);
    } catch (e) {
      setGithubError('Failed to fetch repos: ' + e.message);
      setIsLoadingRepos(false);
    }
  }, []);

  // Fetch repo branches
  const fetchGithubBranches = useCallback(async (repo) => {
    if (!octokitRef.current || !repo) return;
    setIsLoadingBranches(true);
    try {
      const { data } = await octokitRef.current.repos.listBranches({ owner: repo.owner.login, repo: repo.name });
      setRepoBranches(data);
      setSelectedBranch(data[0]?.name || 'main');
      setIsLoadingBranches(false);
    } catch (e) {
      setGithubError('Failed to fetch branches: ' + e.message);
      setIsLoadingBranches(false);
    }
  }, []);

  // Fetch file tree for repo/branch
  const fetchGithubFileTree = useCallback(async (repo, branch) => {
    if (!octokitRef.current || !repo) return;
    setIsLoadingFiles(true);
    try {
      const { data } = await octokitRef.current.git.getTree({
        owner: repo.owner.login,
        repo: repo.name,
        tree_sha: branch,
        recursive: true,
      });
      setRepoFiles(data.tree);
      setIsLoadingFiles(false);
    } catch (e) {
      setGithubError('Failed to fetch file tree: ' + e.message);
      setIsLoadingFiles(false);
    }
  }, []);

  // Fetch commit history
  const fetchGithubCommits = useCallback(async (repo, branch) => {
    if (!octokitRef.current || !repo) return;
    setIsLoadingCommits(true);
    try {
      const { data } = await octokitRef.current.repos.listCommits({
        owner: repo.owner.login,
        repo: repo.name,
        sha: branch,
        per_page: 10,
      });
      setCommitHistory(data);
      setIsLoadingCommits(false);
    } catch (e) {
      setGithubError('Failed to fetch commits: ' + e.message);
      setIsLoadingCommits(false);
    }
  }, []);

  // On GitHub token, fetch repos
  useEffect(() => {
    if (githubToken) fetchGithubRepos();
  }, [githubToken, fetchGithubRepos]);

  // On repo select, fetch branches and file tree
  useEffect(() => {
    if (selectedRepo) {
      fetchGithubBranches(selectedRepo);
      fetchGithubFileTree(selectedRepo, selectedBranch);
      fetchGithubCommits(selectedRepo, selectedBranch);
    }
  }, [selectedRepo, selectedBranch, fetchGithubBranches, fetchGithubFileTree, fetchGithubCommits]);

  // If on mobile, show a message instead of the playground
  if (isMobile) {
    return (
      <motion.div
        className="mobile-message"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2>Playground Not Available on Mobile</h2>
        <p>Please use a laptop, tablet, or desktop to access the Coding Playground.</p>
      </motion.div>
    );
  }

  return (
    <div className={`playground-container ${theme}`}>
      {/* Sidebar */}
      <motion.div
        className="playground-sidebar glassy-effect"
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
          CodeTapasya Playground
          <GitHubIcon />
        </motion.h3>

        {/* Search Bar */}
        <motion.div
          className="sidebar-section"
          variants={sidebarContentVariants}
          initial="hidden"
          animate={sidebarOpen ? "visible" : "hidden"}
        >
          <div className="relative">
            <SearchIcon className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={fileSearch}
              onChange={(e) => setFileSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-transparent border border-gray-500 rounded-md text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </motion.div>

        {/* File Explorer */}
        <motion.div
          className="sidebar-section"
          variants={sidebarContentVariants}
          initial="hidden"
          animate={sidebarOpen ? "visible" : "hidden"}
        >
          <div
            className="flex items-center justify-between cursor-pointer hover:text-gold-500 transition-colors"
            onClick={() => setFileExplorerOpen(!fileExplorerOpen)}
          >
            <label className="text-sm font-semibold">Files</label>
            {fileExplorerOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </div>
          <AnimatePresence>
            {fileExplorerOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {filteredFiles.length > 0 ? (
                  filteredFiles.map((file, index) => (
                    <motion.div
                      key={file.name}
                      className="file-item flex items-center justify-between p-2 rounded-md cursor-move hover:bg-gray-700/50 transition-all"
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={() => handleDrop(index)}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center space-x-2">
                        {extensionToIcon[file.name.substring(file.name.lastIndexOf('.'))] || <DescriptionIcon />}
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
                      </div>
                      <motion.button
                        className="text-gray-400 hover:text-red-400 transition-colors"
                        onClick={() => closeFile(file.name)}
                        variants={buttonHoverVariants}
                        whileHover="hover"
                      >
                        <CloseIcon fontSize="small" />
                      </motion.button>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No files found.</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* New File Section */}
        <motion.div
          className="sidebar-section"
          variants={sidebarContentVariants}
          initial="hidden"
          animate={sidebarOpen ? "visible" : "hidden"}
        >
          <label htmlFor="new-file-input" className="text-sm font-semibold block mb-2">New File</label>
          <input
            id="new-file-input"
            type="text"
            placeholder="e.g., index.html"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addNewFile()}
            className="w-full px-4 py-2 bg-transparent border border-gray-500 rounded-md text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          <motion.button
            className="sidebar-button neumorphic w-full mt-2"
            onClick={addNewFile}
            disabled={!newFileName}
            variants={buttonHoverVariants}
            whileHover="hover"
          >
            Add File
          </motion.button>
        </motion.div>

        {/* Snippets Section */}
        <motion.div
          className="sidebar-section"
          variants={sidebarContentVariants}
          initial="hidden"
          animate={sidebarOpen ? "visible" : "hidden"}
        >
          <label htmlFor="snippet-select" className="text-sm font-semibold block mb-2">Snippets</label>
          <select
            id="snippet-select"
            value={snippetType}
            onChange={(e) => setSnippetType(e.target.value)}
            disabled={!activeFileData}
            className="w-full px-4 py-2 bg-transparent border border-gray-500 rounded-md text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition-all"
          >
            <option value="">None</option>
            {activeFileData && snippets[activeFileData.mode]?.map(snippet => (
              <option key={snippet.label} value={snippet.label}>{snippet.label}</option>
            ))}
          </select>
          <motion.button
            className="sidebar-button neumorphic w-full mt-2 flex items-center justify-center"
            onClick={insertSnippet}
            disabled={!snippetType}
            variants={buttonHoverVariants}
            whileHover="hover"
          >
            <CodeIcon fontSize="small" className="mr-2" />
            Insert Snippet
          </motion.button>
        </motion.div>

        {/* GitHub Integration Section */}
        <motion.div
          className="sidebar-section"
          variants={sidebarContentVariants}
          initial="hidden"
          animate={sidebarOpen ? "visible" : "hidden"}
        >
          <label htmlFor="repo-name" className="text-sm font-semibold block mb-2">GitHub Integration</label>
          {!githubToken ? (
            <div className="text-gray-400 text-sm p-2 rounded-md bg-gray-800/40">
              Please sign in with GitHub from the Login page to enable GitHub features.
            </div>
          ) : (
            <>
              <input
                id="repo-name"
                type="text"
                placeholder="Repository name"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                className="w-full px-4 py-2 bg-transparent border border-gray-500 rounded-md text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition-all mb-2"
              />
              <motion.button
                className="sidebar-button neumorphic w-full mb-2"
                onClick={saveToGithub}
                disabled={!repoName}
                variants={buttonHoverVariants}
                whileHover="hover"
              >
                Save to GitHub
              </motion.button>
              <motion.button
                className="sidebar-button neumorphic w-full"
                onClick={loadFromGithub}
                disabled={!repoName}
                variants={buttonHoverVariants}
                whileHover="hover"
              >
                Load from GitHub
              </motion.button>
              {githubError && (
                <p className="text-red-400 text-sm mt-2">{githubError}</p>
              )}
            </>
          )}
        </motion.div>

        {/* Clear All Files */}
        <motion.div
          className="sidebar-section"
          variants={sidebarContentVariants}
          initial="hidden"
          animate={sidebarOpen ? "visible" : "hidden"}
        >
          <motion.button
            className="sidebar-button neumorphic clear-button w-full flex items-center justify-center"
            onClick={clearAllFiles}
            disabled={files.length === 0}
            variants={buttonHoverVariants}
            whileHover="hover"
          >
            <DeleteIcon fontSize="small" className="mr-2" />
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
              <Editor
                height="100%"
                width="100%"
                language={activeFileData.mode}
                theme={theme === 'dark' ? 'vs-dark' : 'light'}
                value={activeFileData.content}
                onChange={(content) => updateFileContent(activeFileData.name, content)}
                onMount={(editor) => {
                  editorRef.current = editor;
                }}
                options={{
                  fontSize: fontSize,
                  minimap: { enabled: false },
                  wordWrap: 'on',
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  lineNumbers: 'on',
                  glyphMargin: false,
                  folding: true,
                  lineDecorationsWidth: 10,
                  lineNumbersMinChars: 3,
                }}
                className="code-editor"
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
          whileHover={{ backgroundColor: 'var(--primary-gradient-start)' }}
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