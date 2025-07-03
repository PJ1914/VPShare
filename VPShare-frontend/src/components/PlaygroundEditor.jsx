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
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import TerminalIcon from '@mui/icons-material/Terminal';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import FolderIcon from '@mui/icons-material/Folder';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import { Switch, TextField } from '@mui/material';
import '../styles/PlaygroundEditor.css';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, updateDoc, getDoc, increment, onSnapshot, serverTimestamp, deleteField } from 'firebase/firestore';
import LogoCT from '../assets/CT Logo.png';

// Piston API language mapping
const pistonLanguages = {
  'javascript': { language: 'javascript', version: '18.15.0', extension: '.js' },
  'python': { language: 'python', version: '3.10.0', extension: '.py' },
  'java': { language: 'java', version: '15.0.2', extension: '.java' },
  'typescript': { language: 'typescript', version: '5.0.3', extension: '.ts' },
  'cpp': { language: 'cpp', version: '10.2.0', extension: '.cpp' },
  'c': { language: 'c', version: '10.2.0', extension: '.c' },
  'csharp': { language: 'csharp', version: '6.12.0', extension: '.cs' },
  'go': { language: 'go', version: '1.16.2', extension: '.go' },
  'rust': { language: 'rust', version: '1.68.2', extension: '.rs' },
  'php': { language: 'php', version: '8.2.3', extension: '.php' },
  'ruby': { language: 'ruby', version: '3.0.1', extension: '.rb' },
  'swift': { language: 'swift', version: '5.3.3', extension: '.swift' },
  'kotlin': { language: 'kotlin', version: '1.8.20', extension: '.kt' },
  'scala': { language: 'scala', version: '3.2.2', extension: '.scala' },
  'perl': { language: 'perl', version: '5.36.0', extension: '.pl' },
  'lua': { language: 'lua', version: '5.4.4', extension: '.lua' },
  'dart': { language: 'dart', version: '2.19.6', extension: '.dart' },
  'r': { language: 'r', version: '4.1.1', extension: '.r' },
  'bash': { language: 'bash', version: '5.2.0', extension: '.sh' },
  'powershell': { language: 'powershell', version: '7.1.4', extension: '.ps1' }
};

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
  '.cpp': 'cpp',
  '.c': 'c',
  '.cs': 'csharp',
  '.go': 'go',
  '.rs': 'rust',
  '.php': 'php',
  '.rb': 'ruby',
  '.swift': 'swift',
  '.kt': 'kotlin',
  '.scala': 'scala',
  '.pl': 'perl',
  '.lua': 'lua',
  '.dart': 'dart',
  '.r': 'r',
  '.sh': 'bash',
  '.ps1': 'powershell',
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
  '.cpp': <CodeSharpIcon className="text-blue-700" />,
  '.c': <CodeSharpIcon className="text-gray-600" />,
  '.cs': <CodeSharpIcon className="text-purple-500" />,
  '.go': <CodeSharpIcon className="text-cyan-500" />,
  '.rs': <CodeSharpIcon className="text-orange-600" />,
  '.php': <CodeSharpIcon className="text-purple-600" />,
  '.rb': <CodeSharpIcon className="text-red-600" />,
  '.swift': <CodeSharpIcon className="text-orange-500" />,
  '.kt': <CodeSharpIcon className="text-purple-400" />,
  '.scala': <CodeSharpIcon className="text-red-700" />,
  '.pl': <CodeSharpIcon className="text-blue-400" />,
  '.lua': <CodeSharpIcon className="text-blue-300" />,
  '.dart': <CodeSharpIcon className="text-blue-400" />,
  '.r': <CodeSharpIcon className="text-blue-600" />,
  '.sh': <CodeSharpIcon className="text-green-600" />,
  '.ps1': <CodeSharpIcon className="text-blue-800" />,
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
    { label: 'Hello World', code: 'console.log("Hello, World!");' },
    { label: 'Event Listener', code: 'document.getElementById("myButton").addEventListener("click", () => {\n  alert("Button clicked!");\n});' },
    { label: 'Async Function', code: 'async function fetchData() {\n  try {\n    const response = await fetch("https://api.example.com/data");\n    const data = await response.json();\n    console.log(data);\n  } catch (error) {\n    console.error("Error:", error);\n  }\n}\n\nfetchData();' },
  ],
  python: [
    { label: 'Hello World', code: '# Welcome to Python\nprint("Hello, World!")' },
    { label: 'Simple Loop', code: 'for i in range(5):\n    print(f"Count: {i}")' },
    { label: 'List Comprehension', code: 'numbers = [1, 2, 3, 4, 5]\nsquares = [x**2 for x in numbers]\nprint(squares)' },
    { label: 'Function', code: 'def greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("World"))' },
  ],
  java: [
    { label: 'Main Class', code: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}' },
    { label: 'Simple Loop', code: 'for (int i = 0; i < 5; i++) {\n    System.out.println("Count: " + i);\n}' },
    { label: 'Method', code: 'public static String greet(String name) {\n    return "Hello, " + name + "!";\n}\n\nSystem.out.println(greet("World"));' },
  ],
  typescript: [
    { label: 'Interface', code: 'interface User {\n  name: string;\n  age: number;\n}\n\nconst user: User = { name: "Alice", age: 25 };\nconsole.log(user);' },
    { label: 'Function', code: 'function greet(name: string): string {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet("World"));' },
  ],
  cpp: [
    { label: 'Hello World', code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}' },
    { label: 'Loop', code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    for(int i = 0; i < 5; i++) {\n        cout << "Count: " << i << endl;\n    }\n    return 0;\n}' },
  ],
  c: [
    { label: 'Hello World', code: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}' },
    { label: 'Loop', code: '#include <stdio.h>\n\nint main() {\n    for(int i = 0; i < 5; i++) {\n        printf("Count: %d\\n", i);\n    }\n    return 0;\n}' },
  ],
  csharp: [
    { label: 'Hello World', code: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}' },
    { label: 'Loop', code: 'using System;\n\nclass Program {\n    static void Main() {\n        for(int i = 0; i < 5; i++) {\n            Console.WriteLine($"Count: {i}");\n        }\n    }\n}' },
  ],
  go: [
    { label: 'Hello World', code: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}' },
    { label: 'Loop', code: 'package main\n\nimport "fmt"\n\nfunc main() {\n    for i := 0; i < 5; i++ {\n        fmt.Printf("Count: %d\\n", i)\n    }\n}' },
  ],
  rust: [
    { label: 'Hello World', code: 'fn main() {\n    println!("Hello, World!");\n}' },
    { label: 'Loop', code: 'fn main() {\n    for i in 0..5 {\n        println!("Count: {}", i);\n    }\n}' },
  ],
  php: [
    { label: 'Hello World', code: '<?php\necho "Hello, World!";\n?>' },
    { label: 'Loop', code: '<?php\nfor($i = 0; $i < 5; $i++) {\n    echo "Count: " . $i . "\\n";\n}\n?>' },
  ],
  ruby: [
    { label: 'Hello World', code: 'puts "Hello, World!"' },
    { label: 'Loop', code: '5.times do |i|\n  puts "Count: #{i}"\nend' },
  ],
  swift: [
    { label: 'Hello World', code: 'print("Hello, World!")' },
    { label: 'Loop', code: 'for i in 0..<5 {\n    print("Count: \\(i)")\n}' },
  ],
  kotlin: [
    { label: 'Hello World', code: 'fun main() {\n    println("Hello, World!")\n}' },
    { label: 'Loop', code: 'fun main() {\n    for(i in 0..4) {\n        println("Count: $i")\n    }\n}' },
  ],
  scala: [
    { label: 'Hello World', code: 'object Main extends App {\n  println("Hello, World!")\n}' },
    { label: 'Loop', code: 'object Main extends App {\n  for(i <- 0 to 4) {\n    println(s"Count: $i")\n  }\n}' },
  ],
  perl: [
    { label: 'Hello World', code: 'print "Hello, World!\\n";' },
    { label: 'Loop', code: 'for my $i (0..4) {\n    print "Count: $i\\n";\n}' },
  ],
  lua: [
    { label: 'Hello World', code: 'print("Hello, World!")' },
    { label: 'Loop', code: 'for i = 0, 4 do\n    print("Count: " .. i)\nend' },
  ],
  dart: [
    { label: 'Hello World', code: 'void main() {\n  print("Hello, World!");\n}' },
    { label: 'Loop', code: 'void main() {\n  for(int i = 0; i < 5; i++) {\n    print("Count: $i");\n  }\n}' },
  ],
  r: [
    { label: 'Hello World', code: 'print("Hello, World!")' },
    { label: 'Loop', code: 'for(i in 0:4) {\n  print(paste("Count:", i))\n}' },
  ],
  bash: [
    { label: 'Hello World', code: '#!/bin/bash\necho "Hello, World!"' },
    { label: 'Loop', code: '#!/bin/bash\nfor i in {0..4}; do\n    echo "Count: $i"\ndone' },
  ],
  powershell: [
    { label: 'Hello World', code: 'Write-Host "Hello, World!"' },
    { label: 'Loop', code: 'for($i = 0; $i -lt 5; $i++) {\n    Write-Host "Count: $i"\n}' },
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
  const db = getFirestore();
  // Essential state management
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
  
  // Authentication and GitHub
  const [githubUser, setGithubUser] = useState(null);
  const [githubToken, setGithubToken] = useState(null);
  const [githubRepos, setGithubRepos] = useState([]);
  const [repoName, setRepoName] = useState('');
  const [githubError, setGithubError] = useState(null);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [activeUsersCount, setActiveUsersCount] = useState(1);
  
  // Unified Output Panel (VS Code-like)
  const [outputPanelVisible, setOutputPanelVisible] = useState(true);
  const [activeOutputTab, setActiveOutputTab] = useState('preview'); // 'preview', 'terminal', 'problems', 'github', 'input'
  const [autoSave, setAutoSave] = useState(true);
  const [autoCompile, setAutoCompile] = useState(true);
  
  // Code execution states
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionOutput, setExecutionOutput] = useState('');
  const [executionError, setExecutionError] = useState('');
  const [stdin, setStdin] = useState('');
  const [consoleLines, setConsoleLines] = useState([]);

  const isDraggingHeight = useRef(false);
  const isDraggingWidth = useRef(false);
  const editorRef = useRef(null);
  const dragIndex = useRef(null);
  const octokitRef = useRef(null);
  const terminalRef = useRef(null);

  // Listen for Firebase Auth user and enable GitHub integration for all auth types
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setGithubUser(user);
      
      if (user) {
        // Check if user has GitHub provider
        const githubProvider = user.providerData.find(p => p.providerId === 'github.com');
        
        if (githubProvider) {
          // User signed in with GitHub, try to get token from session storage
          const token = sessionStorage.getItem('githubAccessToken');
          if (token) {
            setGithubToken(token);
          }
        } else {
          // User signed in with Google or email/password
          // For GitHub integration, we'll use a personal access token approach
          // Check if user has stored a GitHub token
          const storedToken = localStorage.getItem(`github_token_${user.uid}`);
          if (storedToken) {
            setGithubToken(storedToken);
          }
        }
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

  // Save project to GitHub (Vercel-like: use repoName input as owner/repo or just repo)
  const saveToGithub = async () => {
    if (!octokitRef.current || !repoName) {
      setGithubError('Please enter a repository name (e.g., vercel/next.js or mom-birthday).');
      return;
    }
    try {
      let owner, repo;
      if (repoName.includes('/')) {
        [owner, repo] = repoName.split('/');
      } else {
        // Use authenticated user's GitHub username as owner
        if (!githubUser || !githubUser.reloadUserInfo || !githubUser.reloadUserInfo.screenName) {
          setGithubError('Could not determine your GitHub username. Please re-login.');
          return;
        }
        owner = githubUser.reloadUserInfo.screenName;
        repo = repoName;
      }
      if (!owner || !repo) {
        setGithubError('Repository name must be in the format owner/repo or just repo.');
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

  // Load project from GitHub (Vercel-like: use repoName input as owner/repo or just repo)
  const loadFromGithub = async () => {
    if (!octokitRef.current || !repoName) {
      setGithubError('Please enter a repository name (e.g., vercel/next.js or mom-birthday).');
      return;
    }
    try {
      let owner, repo;
      if (repoName.includes('/')) {
        [owner, repo] = repoName.split('/');
      } else {
        // Use authenticated user's GitHub username as owner
        if (!githubUser || !githubUser.reloadUserInfo || !githubUser.reloadUserInfo.screenName) {
          setGithubError('Could not determine your GitHub username. Please re-login.');
          return;
        }
        owner = githubUser.reloadUserInfo.screenName;
        repo = repoName;
      }
      if (!owner || !repo) {
        setGithubError('Repository name must be in the format owner/repo or just repo.');
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
    const handleMouseMove = (e) => {
      rafId = requestAnimationFrame(() => {
        handleHeightResize(e);
        handleWidthResize(e);
      });
    };
    const handleMouseUp = () => {
      stopHeightResize();
      stopWidthResize();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isMobile]);

  const activeFileData = files.find(file => file.name === activeFile);

  // Filter files based on search
  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(fileSearch.toLowerCase())
  );

  // Add console line utility (defined early to avoid reference errors)
  const addConsoleOutput = useCallback((content, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setConsoleLines(prev => [...prev, {
      id: Date.now() + Math.random(),
      content,
      type,
      timestamp
    }]);
  }, []);

  // Clear console
  const clearConsole = useCallback(() => {
    setConsoleLines([]);
    setExecutionOutput('');
    setExecutionError('');
  }, []);

  // Update preview for HTML/CSS/JS with console logging
  const updatePreview = useCallback(() => {
    if (isMobile) return;
    const htmlFile = files.find(file => file.name.endsWith('.html'));
    const cssFile = files.find(file => file.name.endsWith('.css'));
    const jsFile = files.find(file => file.name.endsWith('.js'));

    if (!htmlFile) {
      addConsoleOutput('No HTML file found for preview', 'warn');
      return;
    }
    
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
      addConsoleOutput('Preview updated successfully', 'success');
      setActiveOutputTab('preview');
      setOutputPanelVisible(true);
    } catch (e) {
      setPreviewError(e.message);
      addConsoleOutput(`Preview error: ${e.message}`, 'error');
    }
  }, [files, isMobile, addConsoleOutput]);

  useEffect(() => {
    if (autoCompile && !isMobile) {
      const timeout = setTimeout(updatePreview, 300);
      return () => clearTimeout(timeout);
    }
  }, [files, autoCompile, updatePreview, isMobile]);

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

  // On GitHub token, fetch repos
  useEffect(() => {
    if (githubToken) fetchGithubRepos();
  }, [githubToken, fetchGithubRepos]);

  // GitHub integration UI and logic
  // Helper: update Firestore with coding activity
  const updateCodingActivity = useCallback(async () => {
    if (!githubUser) return;
    const uid = githubUser.uid;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    const docRef = doc(db, 'userEngagement', uid);
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        await updateDoc(docRef, {
          [`dailyMinutes.${todayStr}`]: increment(1),
          totalMinutes: increment(1),
        });
      } else {
        await setDoc(docRef, {
          dailyMinutes: { [todayStr]: 1 },
          totalMinutes: 1,
          courseProgress: {},
        });
      }
    } catch (e) {
      // Optionally log error
      console.error('Failed to update coding activity:', e);
    }
  }, [githubUser, db]);

  // Call updateCodingActivity when user edits code
  useEffect(() => {
    if (!githubUser) return;
    // Only track activity if user is authenticated and not on mobile
    if (isMobile) return;
    // Listen for file changes
    if (files.length > 0) {
      updateCodingActivity();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  // Track active users in Firestore
  useEffect(() => {
    if (!githubUser) return;
    const uid = githubUser.uid;
    const onlineRef = doc(db, 'playgroundActiveUsers', 'online');
    let unsubscribe;
    let removed = false;
    const updatePresence = async () => {
      try {
        // Ensure doc exists before updating
        await setDoc(onlineRef, { [uid]: serverTimestamp() }, { merge: true });
      } catch (e) {
        console.error('Presence setDoc error:', e);
      }
    };
    updatePresence();
    // Listen for changes to online users
    unsubscribe = onSnapshot(onlineRef, (docSnap) => {
      const data = docSnap.data() || {};
      const now = Date.now();
      const active = Object.values(data).filter(ts => ts && ts.toDate && (now - ts.toDate().getTime() < 2 * 60 * 1000));
      setActiveUsersCount(active.length);
    });
    // Remove user on unmount
    return () => {
      if (!removed) {
        removed = true;
        if (unsubscribe) unsubscribe();
        updateDoc(onlineRef, { [uid]: deleteField() }).catch(() => {});
      }
    };
  }, [githubUser, db]);

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

  // Execute code using Piston API with enhanced logging
  const executeCode = async () => {
    const currentFile = files.find(file => file.name === activeFile);
    if (!currentFile) return;

    const fileExtension = currentFile.name.substring(currentFile.name.lastIndexOf('.'));
    const language = Object.keys(pistonLanguages).find(lang => 
      pistonLanguages[lang].extension === fileExtension
    );

    if (!language) {
      addConsoleOutput(`Language not supported for file extension: ${fileExtension}`, 'error');
      setActiveOutputTab('terminal');
      setOutputPanelVisible(true);
      return;
    }

    setIsExecuting(true);
    setExecutionOutput('');
    setExecutionError('');
    setActiveOutputTab('terminal');
    setOutputPanelVisible(true);
    
    addConsoleOutput(`Executing ${currentFile.name}...`, 'info');

    try {
      const pistonConfig = pistonLanguages[language];
      const payload = {
        language: pistonConfig.language,
        version: pistonConfig.version,
        files: [
          {
            name: currentFile.name,
            content: currentFile.content
          }
        ],
        stdin: stdin
      };

      const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.run) {
        if (result.run.stdout) {
          setExecutionOutput(result.run.stdout);
          addConsoleOutput(result.run.stdout, 'success');
        }
        if (result.run.stderr) {
          setExecutionError(result.run.stderr);
          addConsoleOutput(result.run.stderr, 'error');
        }
        if (!result.run.stdout && !result.run.stderr) {
          addConsoleOutput('Program executed successfully with no output', 'info');
        }
      } else {
        addConsoleOutput('No execution result received', 'error');
      }
    } catch (error) {
      const errorMsg = `Execution failed: ${error.message}`;
      setExecutionError(errorMsg);
      addConsoleOutput(errorMsg, 'error');
    } finally {
      setIsExecuting(false);
      addConsoleOutput('Execution completed', 'info');
    }
  };

  // Check if current file can be executed
  const canExecuteCurrentFile = () => {
    const currentFile = files.find(file => file.name === activeFile);
    if (!currentFile) return false;
    
    const fileExtension = currentFile.name.substring(currentFile.name.lastIndexOf('.'));
    return Object.values(pistonLanguages).some(lang => lang.extension === fileExtension);
  };

  // Scroll to bottom of terminal
  const scrollToBottom = useCallback(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, []);

  // Scroll to top of terminal
  const scrollToTop = useCallback(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = 0;
    }
  }, []);

  // Auto-scroll terminal when new output arrives
  useEffect(() => {
    if (activeOutputTab === 'terminal' && consoleLines.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [consoleLines, activeOutputTab, scrollToBottom]);

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
          <img src={LogoCT} alt="CodeTapasya Logo" style={{ height: 36, width: 36, objectFit: 'contain', borderRadius: 8 }} />
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

        {/* Quick File Creation */}
        <motion.div
          className="quick-files-section"
          variants={sidebarContentVariants}
          initial="hidden"
          animate={sidebarOpen ? "visible" : "hidden"}
        >
          <label className="text-sm font-semibold block mb-3">Quick Create</label>
          <div className="quick-file-grid">
            {Object.entries(pistonLanguages).map(([lang, config]) => (
              <button
                key={lang}
                className="quick-file-btn"
                onClick={() => {
                  const fileName = `main${config.extension}`;
                  const mode = extensionToMode[config.extension] || lang;
                  const snippet = snippets[mode]?.[0]?.code || `// ${lang} code here`;
                  const newFile = { name: fileName, content: snippet, mode };
                  setFiles(prevFiles => [...prevFiles, newFile]);
                  setActiveFile(fileName);
                }}
                title={`Create ${lang} file`}
              >
                {extensionToIcon[config.extension] || <CodeIcon />}
                <span>{lang}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* HTML/CSS/JS Playground */}
        <motion.div
          className="frameworks-section"
          variants={sidebarContentVariants}
          initial="hidden"
          animate={sidebarOpen ? "visible" : "hidden"}
        >
          <label className="text-sm font-semibold block mb-3">Web Playground</label>
          <button
            className="framework-btn web-playground-btn"
            onClick={() => {
              const htmlFile = { name: 'index.html', content: snippets.html[0].code, mode: 'html' };
              const cssFile = { name: 'style.css', content: snippets.css[0].code, mode: 'css' };
              const jsFile = { name: 'script.js', content: snippets.javascript[0].code, mode: 'javascript' };
              setFiles([htmlFile, cssFile, jsFile]);
              setActiveFile('index.html');
            }}
            title="Create HTML/CSS/JS playground"
          >
            <div className="framework-icon-group">
              <HtmlIcon className="text-orange-500" />
              <CssIcon className="text-blue-400" />
              <JavascriptIcon className="text-yellow-400" />
            </div>
            <span>Web Playground</span>
          </button>
        </motion.div>

        {/* Frameworks Section */}
        <motion.div
          className="frameworks-section"
          variants={sidebarContentVariants}
          initial="hidden"
          animate={sidebarOpen ? "visible" : "hidden"}
        >
          <label className="text-sm font-semibold block mb-3">Frameworks</label>
          <div className="framework-grid">
            <button
              className="framework-btn"
              onClick={() => {
                const reactApp = {
                  name: 'App.jsx',
                  content: `import React, { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <header className="App-header">
        <h1>React Playground</h1>
        <p>Count: {count}</p>
        <button onClick={() => setCount(count + 1)}>
          Increment
        </button>
        <button onClick={() => setCount(count - 1)}>
          Decrement
        </button>
      </header>
    </div>
  );
}

export default App;`,
                  mode: 'javascript'
                };
                const reactCSS = {
                  name: 'App.css',
                  content: `.App {
  text-align: center;
}

.App-header {
  background-color: #282c34;
  padding: 20px;
  color: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
}

button {
  background-color: #61dafb;
  border: none;
  padding: 10px 20px;
  margin: 5px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  color: #282c34;
  font-weight: bold;
}

button:hover {
  background-color: #21b9e0;
}`,
                  mode: 'css'
                };
                const packageJson = {
                  name: 'package.json',
                  content: `{
  "name": "react-playground",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}`,
                  mode: 'json'
                };
                setFiles([reactApp, reactCSS, packageJson]);
                setActiveFile('App.jsx');
              }}
              title="Create ReactJS project"
            >
              <div className="framework-icon">
                <AccountTreeIcon style={{ fontSize: 24, color: '#61dafb' }} />
              </div>
              <span>React App</span>
            </button>
          </div>
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
              {activeUsersCount} User{activeUsersCount !== 1 ? 's' : ''} Active
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
                <PlayArrowIcon fontSize="inherit" /> Run HTML
              </motion.button>
            )}
            {canExecuteCurrentFile() && (
              <motion.button
                className="execute-button floating-action-btn"
                onClick={executeCode}
                disabled={isExecuting}
                variants={buttonHoverVariants}
                whileHover="hover"
                whileTap={{ scale: 0.95 }}
              >
                <div className="execute-icon-wrapper">
                  {isExecuting ? (
                    <div className="execute-spinner" />
                  ) : (
                    <RocketLaunchIcon fontSize="inherit" />
                  )}
                </div>
                <span className="execute-text">
                  {isExecuting ? 'Executing...' : 'Run Code'}
                </span>
              </motion.button>
            )}
            {files.some(file => file.name.endsWith('.html')) && (
              <motion.button
                className="console-toggle floating-action-btn"
                onClick={updatePreview}
                variants={buttonHoverVariants}
                whileHover="hover"
                whileTap={{ scale: 0.95 }}
              >
                <div className="console-icon-wrapper">
                  <RefreshIcon fontSize="inherit" />
                </div>
                <span className="console-text">
                  Update Preview
                </span>
              </motion.button>
            )}
            <motion.button
              className="console-toggle floating-action-btn"
              onClick={() => setOutputPanelVisible(!outputPanelVisible)}
              variants={buttonHoverVariants}
              whileHover="hover"
              whileTap={{ scale: 0.95 }}
            >
              <div className="console-icon-wrapper">
                <TerminalIcon fontSize="inherit" />
              </div>
              <span className="console-text">
                {outputPanelVisible ? 'Hide Panel' : 'Show Panel'}
              </span>
            </motion.button>
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
                  <span 
                    onClick={() => setActiveFile(file.name)} 
                    onDoubleClick={() => startRenaming(file.name)}
                    className="tab-content"
                  >
                    <span className="tab-icon">
                      {extensionToIcon[file.name.substring(file.name.lastIndexOf('.'))] || <DescriptionIcon />}
                    </span>
                    <span className="tab-name">{file.name}</span>
                    {canExecuteCurrentFile() && activeFile === file.name && (
                      <span className="executable-indicator" title="Executable file">
                        <FlashOnIcon fontSize="small" style={{ color: '#fbbf24' }} />
                      </span>
                    )}
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

        {/* VS Code-like Unified Output Panel */}
        <AnimatePresence>
          {outputPanelVisible && (
            <motion.div
              className="unified-output-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Output Panel Tabs */}
              <div className="output-panel-tabs">
                <button
                  className={`output-tab ${activeOutputTab === 'preview' ? 'active' : ''}`}
                  onClick={() => setActiveOutputTab('preview')}
                >
                  <VisibilityIcon fontSize="small" />
                  Preview
                </button>
                <button
                  className={`output-tab ${activeOutputTab === 'terminal' ? 'active' : ''}`}
                  onClick={() => setActiveOutputTab('terminal')}
                >
                  <TerminalIcon fontSize="small" />
                  Terminal
                  {consoleLines.length > 0 && (
                    <span className="console-badge">{consoleLines.length}</span>
                  )}
                </button>
                <button
                  className={`output-tab ${activeOutputTab === 'problems' ? 'active' : ''}`}
                  onClick={() => setActiveOutputTab('problems')}
                >
                  <CodeIcon fontSize="small" />
                  Problems
                  {(executionError || previewError) && (
                    <span className="error-badge">!</span>
                  )}
                </button>
                <button
                  className={`output-tab ${activeOutputTab === 'input' ? 'active' : ''}`}
                  onClick={() => setActiveOutputTab('input')}
                >
                  <KeyboardIcon fontSize="small" />
                  Input
                  {stdin && (
                    <span className="input-indicator">●</span>
                  )}
                </button>
                <button
                  className={`output-tab ${activeOutputTab === 'github' ? 'active' : ''}`}
                  onClick={() => setActiveOutputTab('github')}
                >
                  <GitHubIcon fontSize="small" />
                  GitHub
                  {githubError && (
                    <span className="error-badge">!</span>
                  )}
                </button>
              </div>

              {/* Output Panel Content */}
              <div className="output-tab-content">
                {activeOutputTab === 'preview' && (
                  <div className="output-content-area">
                    {files.some(file => file.name.endsWith('.html')) ? (
                      previewError ? (
                        <div className="console-line">
                          <div className="console-line-type error">ERROR</div>
                          <div className="console-line-content">{previewError}</div>
                        </div>
                      ) : (
                        <iframe
                          srcDoc={srcDoc}
                          title="Preview"
                          sandbox="allow-scripts"
                          className="preview-iframe"
                        />
                      )
                    ) : (
                      <div className="console-line">
                        <div className="console-line-type info">INFO</div>
                        <div className="console-line-content">
                          No HTML file open for preview. Create an HTML file or use the Web Playground template.
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeOutputTab === 'terminal' && (
                  <div className="console-output-area">
                    {/* Terminal Header with Actions */}
                    <div className="terminal-header">
                      <div className="terminal-actions">
                        <button
                          className="terminal-action-btn"
                          onClick={scrollToTop}
                          title="Scroll to top"
                        >
                          ↑ Top
                        </button>
                        <button
                          className="terminal-action-btn"
                          onClick={scrollToBottom}
                          title="Scroll to bottom"
                        >
                          ↓ Bottom
                        </button>
                        <button
                          className="terminal-action-btn"
                          onClick={clearConsole}
                          title="Clear terminal"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    {/* Terminal Content - Scrollable */}
                    <div className="terminal-content-wrapper">
                      <div className="output-content-area terminal-content" ref={terminalRef}>
                        {consoleLines.length === 0 ? (
                          <div className="console-line">
                            <div className="console-line-type info">INFO</div>
                            <div className="console-line-content">
                              Welcome to the integrated terminal. Execute code to see output here.
                            </div>
                          </div>
                        ) : (
                          consoleLines.map(line => (
                            <div key={line.id} className="console-line">
                              <div className={`console-line-type ${line.type}`}>
                                {line.type.toUpperCase()}
                              </div>
                              <div className="console-line-content">{line.content}</div>
                              <div className="console-timestamp">{line.timestamp}</div>
                            </div>
                          ))
                        )}
                        {isExecuting && (
                          <div className="console-line">
                            <div className="console-line-type info">INFO</div>
                            <div className="console-line-content">
                              <div className="executing-spinner" style={{ display: 'inline-block', marginRight: '8px' }} />
                              Executing code...
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeOutputTab === 'problems' && (
                  <div className="output-content-area">
                    {!executionError && !previewError ? (
                      <div className="console-line">
                        <div className="console-line-type success">SUCCESS</div>
                        <div className="console-line-content">No problems detected.</div>
                      </div>
                    ) : (
                      <>
                        {executionError && (
                          <div className="console-line">
                            <div className="console-line-type error">ERROR</div>
                            <div className="console-line-content">{executionError}</div>
                          </div>
                        )}
                        {previewError && (
                          <div className="console-line">
                            <div className="console-line-type error">PREVIEW</div>
                            <div className="console-line-content">{previewError}</div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {activeOutputTab === 'input' && (
                <div className="input-panel">
                  <div className="input-header">
                    <h4>Standard Input (stdin)</h4>
                    <span className="input-description">
                      Provide input for your program. Each line will be sent as separate input.
                    </span>
                  </div>
                  <div className="input-content">
                    <div className="input-editor">
                      <textarea
                        value={stdin}
                        onChange={(e) => setStdin(e.target.value)}
                        placeholder="Enter input data for your program (one value per line)..."
                        className="stdin-input"
                        rows="10"
                      />
                    </div>
                    {stdin && (
                      <div className="input-preview">
                        <h5>Input Preview:</h5>
                        <div className="preview-content">
                          {stdin.split('\n').map((line, index) => (
                            <div key={index} className="preview-line">
                              <span className="line-number">{index + 1}:</span>
                              <span className="line-content">{line || '<empty>'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="input-examples">
                      <h5>Common Input Examples:</h5>
                      <div className="example-buttons">
                        <button 
                          className="example-btn"
                          onClick={() => setStdin('5\n10\n15')}
                        >
                          Numbers
                        </button>
                        <button 
                          className="example-btn"
                          onClick={() => setStdin('Hello\nWorld\nTest')}
                        >
                          Strings
                        </button>
                        <button 
                          className="example-btn"
                          onClick={() => setStdin('1 2 3\n4 5 6\n7 8 9')}
                        >
                          Matrix
                        </button>
                        <button 
                          className="example-btn"
                          onClick={() => setStdin('')}
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeOutputTab === 'github' && (
                  <div className="output-content-area github-integration-panel">
                    <div className="github-panel-header">
                      <GitHubIcon style={{ fontSize: 20, color: theme === 'dark' ? '#fff' : '#1e40af' }} />
                      <h3>GitHub Integration</h3>
                    </div>
                    
                    {!githubUser ? (
                      <div className="github-message">
                        <div className="console-line">
                          <div className="console-line-type info">INFO</div>
                          <div className="console-line-content">Please sign in to enable GitHub features.</div>
                        </div>
                      </div>
                    ) : !githubToken ? (
                      <div className="github-setup">
                        <div className="console-line">
                          <div className="console-line-type info">INFO</div>
                          <div className="console-line-content">Connect your GitHub account to save and load projects</div>
                        </div>
                        <div className="github-token-input">
                          <input
                            type="password"
                            placeholder="GitHub Personal Access Token"
                            className="github-token-field"
                            onBlur={(e) => {
                              if (e.target.value) {
                                setGithubToken(e.target.value);
                                localStorage.setItem(`github_token_${githubUser.uid}`, e.target.value);
                              }
                            }}
                          />
                          <p className="github-help-text">
                            <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">
                              Generate token here
                            </a> with 'repo' scope
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="github-actions">
                        <div className="github-actions-row">
                          <button
                            className="github-action-btn"
                            onClick={fetchGithubRepos}
                            disabled={isLoadingRepos}
                          >
                            {isLoadingRepos ? 'Loading...' : 'Fetch Repositories'}
                          </button>
                          
                          {githubRepos.length > 0 && (
                            <select
                              className="github-repo-select"
                              value={repoName}
                              onChange={e => setRepoName(e.target.value)}
                            >
                              <option value="">Select a repository</option>
                              {githubRepos.map(repo => (
                                <option key={repo.full_name} value={repo.full_name}>
                                  {repo.full_name}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                        
                        <div className="github-actions-row">
                          <input
                            type="text"
                            placeholder="Repository name (e.g., username/repo)"
                            value={repoName}
                            onChange={(e) => setRepoName(e.target.value)}
                            className="github-repo-input"
                          />
                        </div>
                        
                        <div className="github-actions-row">
                          <button
                            className="github-action-btn github-save-btn"
                            onClick={saveToGithub}
                            disabled={!repoName}
                          >
                            <SaveIcon fontSize="small" /> Save to GitHub
                          </button>
                          
                          <button
                            className="github-action-btn github-load-btn"
                            onClick={loadFromGithub}
                            disabled={!repoName}
                          >
                            <RefreshIcon fontSize="small" /> Load from GitHub
                          </button>
                        </div>
                        
                        <div className="github-actions-row">
                          <button
                            className="github-action-btn github-disconnect-btn"
                            onClick={() => {
                              setGithubToken(null);
                              localStorage.removeItem(`github_token_${githubUser.uid}`);
                              setGithubRepos([]);
                              setRepoName('');
                            }}
                          >
                            Disconnect GitHub
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {githubError && (
                      <div className="console-line">
                        <div className="console-line-type error">ERROR</div>
                        <div className="console-line-content">{githubError}</div>
                      </div>
                    )}
                  </div>
                )}

                {activeOutputTab === 'input' && (
                  <div className="output-content-area input-panel">
                    <div className="input-panel-header">
                      <CodeIcon style={{ fontSize: 20, color: theme === 'dark' ? '#fff' : '#1e40af' }} />
                      <h3>Standard Input</h3>
                    </div>
                    
                    <div className="input-panel-content">
                      <div className="console-line">
                        <div className="console-line-type info">INFO</div>
                        <div className="console-line-content">
                          Provide input for your program. This will be passed as stdin when executing code.
                        </div>
                      </div>
                      
                      <div className="stdin-input-container">
                        <label htmlFor="stdin-input-main" className="stdin-label">
                          Program Input:
                        </label>
                        <textarea
                          id="stdin-input-main"
                          value={stdin}
                          onChange={(e) => setStdin(e.target.value)}
                          placeholder="Enter input for your program here...
Example:
5
Hello World
3.14"
                          className="stdin-textarea-main"
                          rows={8}
                        />
                        
                        <div className="input-actions">
                          <button
                            className="input-action-btn clear-input-btn"
                            onClick={() => setStdin('')}
                            disabled={!stdin}
                          >
                            Clear Input
                          </button>
                          <button
                            className="input-action-btn sample-input-btn"
                            onClick={() => {
                              const currentFile = files.find(file => file.name === activeFile);
                              if (currentFile?.name.endsWith('.py')) {
                                setStdin('5\nHello Python\n3.14\n');
                              } else if (currentFile?.name.endsWith('.java')) {
                                setStdin('10\nJava Programming\n2.718\n');
                              } else if (currentFile?.name.endsWith('.cpp') || currentFile?.name.endsWith('.c')) {
                                setStdin('7\nC++ Coding\n1.414\n');
                              } else {
                                setStdin('42\nSample Input\n9.99\n');
                              }
                            }}
                          >
                            Add Sample Input
                          </button>
                        </div>
                        
                        {stdin && (
                          <div className="input-preview">
                            <label className="input-preview-label">Input Preview:</label>
                            <div className="input-preview-content">
                              {stdin.split('\n').map((line, index) => (
                                <div key={index} className="input-line">
                                  <span className="line-number">{index + 1}:</span>
                                  <span className="line-content">{line || '(empty line)'}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Output Panel Actions */}
              <div className="output-panel-actions">
                {autoSave && (
                  <span className="auto-save-indicator">
                    ✅ Auto-saved
                  </span>
                )}
                <div style={{ flex: 1 }} />
                <button
                  className="output-action-btn"
                  onClick={() => setOutputPanelVisible(false)}
                  title="Hide panel"
                >
                  <CloseIcon fontSize="small" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default PlaygroundEditor;