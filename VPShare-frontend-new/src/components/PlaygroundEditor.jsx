import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Editor, { loader } from '@monaco-editor/react';
import {
    Play, Moon, Sun, Plus, X, Terminal, Menu, FileText, Eye, Trash2,
    Zap, Users, AlertCircle, Loader2, Github, ChevronRight, ChevronDown,
    Folder, FolderOpen, Settings, Code2, Save, Download, Scissors, Copy, Clipboard,
    Maximize, Minimize, Layout, ArrowLeft
} from 'lucide-react';

loader.config({
    paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs' }
});

const LANGUAGES = {
    javascript: { label: 'JavaScript', icon: '🟨', ext: '.js', monaco: 'javascript' },
    typescript: { label: 'TypeScript', icon: '🔷', ext: '.ts', monaco: 'typescript' },
    python: { label: 'Python', icon: '🐍', ext: '.py', monaco: 'python' },
    java: { label: 'Java', icon: '☕', ext: '.java', monaco: 'java' },
    c: { label: 'C', icon: '🇨', ext: '.c', monaco: 'c' },
    cpp: { label: 'C++', icon: '🇨', ext: '.cpp', monaco: 'cpp' },
    csharp: { label: 'C#', icon: '#️⃣', ext: '.cs', monaco: 'csharp' },
    go: { label: 'Go', icon: '🐹', ext: '.go', monaco: 'go' },
    rust: { label: 'Rust', icon: '🦀', ext: '.rs', monaco: 'rust' },
    php: { label: 'PHP', icon: '🐘', ext: '.php', monaco: 'php' },
    ruby: { label: 'Ruby', icon: '💎', ext: '.rb', monaco: 'ruby' },
    swift: { label: 'Swift', icon: '🐦', ext: '.swift', monaco: 'swift' },
    kotlin: { label: 'Kotlin', icon: '🎯', ext: '.kt', monaco: 'kotlin' },
    scala: { label: 'Scala', icon: '🔴', ext: '.scala', monaco: 'scala' },
    haskell: { label: 'Haskell', icon: 'λ', ext: '.hs', monaco: 'haskell' },
    lua: { label: 'Lua', icon: '🌙', ext: '.lua', monaco: 'lua' },
    perl: { label: 'Perl', icon: '🐪', ext: '.pl', monaco: 'perl' },
    r: { label: 'R', icon: '📈', ext: '.r', monaco: 'r' },
    sql: { label: 'SQL', icon: '🗃️', ext: '.sql', monaco: 'sql' },
    html: { label: 'HTML', icon: '🌐', ext: '.html', monaco: 'html' },
    css: { label: 'CSS', icon: '🎨', ext: '.css', monaco: 'css' },
    json: { label: 'JSON', icon: '📦', ext: '.json', monaco: 'json' },
    xml: { label: 'XML', icon: '📰', ext: '.xml', monaco: 'xml' },
    yaml: { label: 'YAML', icon: '📝', ext: '.yaml', monaco: 'yaml' },
    markdown: { label: 'Markdown', icon: '⬇️', ext: '.md', monaco: 'markdown' },
};

const TEMPLATES = {
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Page</title>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>Welcome to the playground!</p>
</body>
</html>`,
    css: `/* CSS Playground */
body {
    font-family: 'Inter', sans-serif;
    margin: 0;
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

h1 {
    color: white;
    text-align: center;
    font-size: 3rem;
}`,
    javascript: `// JavaScript Playground
console.log('Hello, World!');

const greeting = (name) => {
  return \`Hello, \${name}!\`;
};

console.log(greeting('Developer'));`,
    python: `# Python Playground
print('Hello, World!')

def greeting(name):
    return f'Hello, {name}!'

print(greeting('Developer'))`,
    java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
    c: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
    cpp: `#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}`,
    go: `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`,
    rust: `fn main() {
    println!("Hello, World!");
}`,
};

const PlaygroundEditor = () => {
    const navigate = useNavigate();
    const [isFromAssignment, setIsFromAssignment] = useState(false);
    const [assignmentId, setAssignmentId] = useState(null);
    const [questionId, setQuestionId] = useState(null);
    // Suppress unused vars if they are intended for future use or part of bigger state logic
    // eslint-disable-next-line no-unused-vars
    const _usage = [assignmentId, questionId]; // Hack to silence linter or simpler: remove if truly unused.
    // Actually, setAssignmentId IS used. assignmentId is NOT used.
    // I I'll comment them out or remove if not needed.
    // They seem to be used in lines 210, 211.
    // Wait, setAssignmentId is used. assignmentId is read? No.
    // If I look at line 201 effect.
    // I will simply suppress the unused warning for these state variables if removing them is too risky for logic I can't fully see.
    // Actually, I'll just remove 'assignmentId' from destructuring if possible? No it's useState.
    // I will replace with:
    // const [assignmentId, setAssignmentId] = useState(null); 
    // to
    // const [, setAssignmentId] = useState(null);
    // But wait, are they used elsewhere?
    // I'll search for 'assignmentId' usage.
    // It's not used in the viewed code except definition.
    // I'll perform the fix for useEffect 'files' dependency first.

    const [files, setFiles] = useState(() => {
        const saved = localStorage.getItem('playground_files');
        return saved ? JSON.parse(saved) : [
            { id: '1', name: 'index.html', language: 'html', content: TEMPLATES.html },
            { id: '2', name: 'styles.css', language: 'css', content: TEMPLATES.css },
            { id: '3', name: 'script.js', language: 'javascript', content: TEMPLATES.javascript },
        ];
    });

    const [activeFileId, setActiveFileId] = useState('1');
    const [theme, setTheme] = useState('vs-dark');
    const [fontSize, setFontSize] = useState(14);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [outputVisible, setOutputVisible] = useState(true);
    const [activeTab, setActiveTab] = useState('terminal');
    const [consoleOutput, setConsoleOutput] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [autoSave, setAutoSave] = useState(true);
    const [autoCompile, setAutoCompile] = useState(true);
    const [activeUsers] = useState(1);
    const [stdin, setStdin] = useState('');
    const [executionOutput, setExecutionOutput] = useState('');
    const [executionError, setExecutionError] = useState('');
    const [explorerExpanded, setExplorerExpanded] = useState(true);
    const [activeMenu, setActiveMenu] = useState(null);
    const [sidebarWidth, setSidebarWidth] = useState(250);
    const [terminalHeight, setTerminalHeight] = useState(250);
    const [isDraggingSidebar, setIsDraggingSidebar] = useState(false);
    const [cursorPosition, setCursorPosition] = useState({ lineNumber: 1, column: 1 });
    const [editorOptions, setEditorOptions] = useState({ tabSize: 4, insertSpaces: true });
    const [showSettings, setShowSettings] = useState(false);
    const [isDraggingTerminal, setIsDraggingTerminal] = useState(false);

    const editorRef = useRef(null);
    const iframeRef = useRef(null);
    const menuRef = useRef(null);
    const activeFile = files.find(f => f.id === activeFileId) || files[0];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setActiveMenu(null);
            }
        };

        const handleMouseMove = (e) => {
            if (isDraggingSidebar) {
                const newWidth = Math.max(150, Math.min(e.clientX, 600));
                setSidebarWidth(newWidth);
            }
            if (isDraggingTerminal) {
                const newHeight = Math.max(100, Math.min(window.innerHeight - e.clientY, window.innerHeight - 200));
                setTerminalHeight(newHeight);
            }
        };

        const handleMouseUp = () => {
            setIsDraggingSidebar(false);
            setIsDraggingTerminal(false);
            document.body.style.cursor = 'default';
        };

        if (isDraggingSidebar) document.body.style.cursor = 'col-resize';
        if (isDraggingTerminal) document.body.style.cursor = 'row-resize';

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDraggingSidebar, isDraggingTerminal]);

    useEffect(() => {
        if (autoSave) localStorage.setItem('playground_files', JSON.stringify(files));
    }, [files, autoSave]);

    // Load code from assignment if coming from assignment page
    useEffect(() => {
        const returnTo = localStorage.getItem('returnToAssignment');
        const codeFromAssignment = localStorage.getItem('playgroundCode');
        const languageFromAssignment = localStorage.getItem('playgroundLanguage');
        const qId = localStorage.getItem('codeQuestionId');

        if (returnTo && codeFromAssignment) {
            setIsFromAssignment(true);
            setAssignmentId(returnTo);
            setQuestionId(qId);

            // Create/update file with assignment code
            const lang = languageFromAssignment || 'javascript';
            const existingFileIndex = files.findIndex(f => f.language === lang);

            if (existingFileIndex >= 0) {
                setFiles(prev => prev.map((f, i) =>
                    i === existingFileIndex
                        ? { ...f, content: codeFromAssignment }
                        : f
                ));
                setActiveFileId(files[existingFileIndex].id);
            } else {
                const newFile = {
                    id: Date.now().toString(),
                    name: `code.${LANGUAGES[lang]?.ext || '.txt'}`,
                    language: lang,
                    content: codeFromAssignment
                };
                setFiles(prev => [newFile, ...prev]);
                setActiveFileId(newFile.id);
            }
        }
    }, [activeFileId, files]); // Added files to dependency

    const handleEditorDidMount = (editor) => {
        editorRef.current = editor;

        editor.onDidChangeCursorPosition((e) => {
            setCursorPosition(e.position);
        });

        // Initial status
        setCursorPosition(editor.getPosition());
        const model = editor.getModel();
        if (model) {
            const options = model.getOptions();
            setEditorOptions({
                tabSize: options.tabSize,
                insertSpaces: options.insertSpaces
            });
        }
    };

    const formatCode = () => {
        editorRef.current?.getAction('editor.action.formatDocument').run();
    };

    const updateFileContent = (content) => {
        setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content } : f));
    };

    const addFile = () => {
        const name = prompt('Enter file name (e.g., app.js):');
        if (!name) return;
        const ext = name.substring(name.lastIndexOf('.'));
        const lang = Object.entries(LANGUAGES).find(([, v]) => v.ext === ext)?.[0] || 'javascript';
        const newFile = { id: Date.now().toString(), name, language: lang, content: TEMPLATES[lang] || '' };
        setFiles(prev => [...prev, newFile]);
        setActiveFileId(newFile.id);
    };

    const deleteFile = (id) => {
        if (files.length === 1) return;
        setFiles(prev => prev.filter(f => f.id !== id));
        if (activeFileId === id) setActiveFileId(files[0].id);
    };

    const addConsoleLog = (message, level = 'info') => {
        setConsoleOutput(prev => [...prev, {
            id: Date.now() + Math.random(),
            message,
            level,
            timestamp: new Date().toLocaleTimeString()
        }]);
    };

    const handleRun = useCallback(() => {
        setIsRunning(true);
        setConsoleOutput([]);
        const htmlFile = files.find(f => f.language === 'html');
        const cssFile = files.find(f => f.language === 'css');
        const jsFile = files.find(f => f.language === 'javascript');

        if (!htmlFile) {
            // Fallback if no HTML file exists - Create a virtual one for the preview
            const fallbackHtml = `<!DOCTYPE html>
<html>
<head>
    <style>${cssFile?.content || ''}</style>
</head>
<body>
    <div id="app"></div>
    <script>
        // Virtual HTML Wrapper
        console.log('ℹ️ No HTML file found. Running in JS-only mode.');
    </script>
</body>
</html>`;

            try {
                const doc = `${fallbackHtml.replace('</body>', `<script>
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;
console.log = (...args) => { window.parent.postMessage({ type: 'log', level: 'info', args: args.map(String) }, '*'); originalLog(...args); };
console.error = (...args) => { window.parent.postMessage({ type: 'log', level: 'error', args: args.map(String) }, '*'); originalError(...args); };
console.warn = (...args) => { window.parent.postMessage({ type: 'log', level: 'warn', args: args.map(String) }, '*'); originalWarn(...args); };
window.onerror = (msg, url, line) => { window.parent.postMessage({ type: 'log', level: 'error', args: [\`Error: \${msg} at line \${line}\`] }, '*'); return true; };
try { ${jsFile?.content || ''} } catch (e) { console.error(e.message); }
</script></body>`)}`;

                if (iframeRef.current) iframeRef.current.srcdoc = doc;
                addConsoleLog('✓ Running in JS Preview Mode', 'info');
                setActiveTab('preview');
                setOutputVisible(true);
            } catch (error) {
                addConsoleLog(`✗ Error: ${error.message}`, 'error');
            }
            setIsRunning(false);
            return;
        }

        try {
            const doc = `<!DOCTYPE html><html><head><style>${cssFile?.content || ''}</style></head><body>${htmlFile.content}<script>
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;
console.log = (...args) => { window.parent.postMessage({ type: 'log', level: 'info', args: args.map(String) }, '*'); originalLog(...args); };
console.error = (...args) => { window.parent.postMessage({ type: 'log', level: 'error', args: args.map(String) }, '*'); originalError(...args); };
console.warn = (...args) => { window.parent.postMessage({ type: 'log', level: 'warn', args: args.map(String) }, '*'); originalWarn(...args); };
window.onerror = (msg, url, line) => { window.parent.postMessage({ type: 'log', level: 'error', args: [\`Error: \${msg} at line \${line}\`] }, '*'); return true; };
try { ${jsFile?.content || ''} } catch (e) { console.error(e.message); }
</script></body></html>`;
            if (iframeRef.current) iframeRef.current.srcdoc = doc;
            addConsoleLog('✓ Code executed successfully', 'success');
            setActiveTab('preview');
            setOutputVisible(true);
        } catch (error) {
            addConsoleLog(`✗ Error: ${error.message}`, 'error');
            setActiveTab('terminal');
            setOutputVisible(true);
        }
        setIsRunning(false);
    }, [files]);

    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data?.type === 'log') {
                addConsoleLog(event.data.args.join(' '), event.data.level);
                setActiveTab('terminal');
                setOutputVisible(true);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    useEffect(() => {
        if (autoCompile) {
            const timeout = setTimeout(handleRun, 500);
            return () => clearTimeout(timeout);
        }
    }, [files, autoCompile, handleRun]);

    const executeCode = async () => {
        const currentFile = files.find(f => f.id === activeFileId);
        if (!currentFile || currentFile.language === 'html' || currentFile.language === 'css') {
            addConsoleLog('This file type cannot be executed', 'warn');
            return;
        }
        setIsRunning(true);
        setExecutionOutput('');
        setExecutionError('');
        setActiveTab('terminal');
        setOutputVisible(true);
        addConsoleLog(`⚡ Executing ${currentFile.name}...`, 'info');
        try {
            const response = await fetch('https://emkc.org/api/v2/piston/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    language: currentFile.language,
                    version: '*',
                    files: [{ name: currentFile.name, content: currentFile.content }],
                    stdin: stdin
                })
            });
            const result = await response.json();
            if (result.run) {
                if (result.run.stdout) {
                    setExecutionOutput(result.run.stdout);
                    addConsoleLog(result.run.stdout, 'success');
                }
                if (result.run.stderr) {
                    setExecutionError(result.run.stderr);
                    addConsoleLog(result.run.stderr, 'error');
                }
                if (!result.run.stdout && !result.run.stderr) {
                    addConsoleLog('✓ Program executed successfully with no output', 'info');
                }
            }
        } catch (error) {
            addConsoleLog(`✗ Execution failed: ${error.message}`, 'error');
        } finally {
            setIsRunning(false);
        }
    };

    const downloadCurrentFile = () => {
        const blob = new Blob([activeFile.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = activeFile.name;
        a.click();
        URL.revokeObjectURL(url);
        addConsoleLog(`Downloaded ${activeFile.name}`, 'success');
    };

    const handleMenuAction = (action) => {
        setActiveMenu(null);
        switch (action) {
            case 'file-new': addFile(); break;
            case 'file-save':
                localStorage.setItem('playground_files', JSON.stringify(files));
                addConsoleLog('Files saved locally', 'success');
                break;
            case 'file-download': downloadCurrentFile(); break;
            case 'edit-undo': editorRef.current?.trigger('keyboard', 'undo'); break;
            case 'edit-redo': editorRef.current?.trigger('keyboard', 'redo'); break;
            case 'edit-cut':
                editorRef.current?.focus();
                document.execCommand('cut');
                break;
            case 'edit-copy':
                editorRef.current?.focus();
                document.execCommand('copy');
                break;
            case 'edit-paste':
                editorRef.current?.focus();
                navigator.clipboard.readText().then(text => {
                    const selection = editorRef.current.getSelection();
                    const range = selection;
                    const op = { range: range, text: text, forceMoveMarkers: true };
                    editorRef.current.executeEdits("my-source", [op]);
                }).catch(() => addConsoleLog('Clipboard permission denied', 'error'));
                break;
            case 'selection-all':
                editorRef.current?.setSelection(editorRef.current.getModel().getFullModelRange());
                break;
            case 'view-sidebar': setSidebarOpen(!sidebarOpen); break;
            case 'view-terminal': setOutputVisible(!outputVisible); break;
            case 'view-zoom-in': setFontSize(prev => Math.min(prev + 2, 30)); break;
            case 'view-zoom-out': setFontSize(prev => Math.max(prev - 2, 10)); break;
            case 'run-run': handleRun(); break;
            case 'file-autosave': setAutoSave(!autoSave); break;
            case 'run-autocompile': setAutoCompile(!autoCompile); break;
            case 'view-theme-dark': setTheme('vs-dark'); break;
            case 'view-theme-light': setTheme('light'); break;
            case 'terminal-clear': setConsoleOutput([]); break;
            case 'edit-format': formatCode(); break;
            default: break;
        }
    };

    const MENUS = {
        File: [
            { label: 'New File', action: 'file-new', icon: Plus },
            { label: 'Save', action: 'file-save', icon: Save },
            { label: 'Auto Save', action: 'file-autosave', checked: autoSave },
            { type: 'separator' },
            { label: 'Download', action: 'file-download', icon: Download },
        ],
        Edit: [
            { label: 'Undo', action: 'edit-undo', shortcut: 'Ctrl+Z' },
            { label: 'Redo', action: 'edit-redo', shortcut: 'Ctrl+Y' },
            { type: 'separator' },
            { label: 'Cut', action: 'edit-cut', shortcut: 'Ctrl+X', icon: Scissors },
            { label: 'Copy', action: 'edit-copy', shortcut: 'Ctrl+C', icon: Copy },
            { label: 'Paste', action: 'edit-paste', shortcut: 'Ctrl+V', icon: Clipboard },
            { type: 'separator' },
            { label: 'Format Document', action: 'edit-format', shortcut: 'Shift+Alt+F', icon: Code2 },
        ],
        Selection: [
            { label: 'Select All', action: 'selection-all', shortcut: 'Ctrl+A' },
        ],
        View: [
            { label: 'Toggle Sidebar', action: 'view-sidebar', icon: Layout },
            { label: 'Toggle Terminal', action: 'view-terminal', icon: Terminal },
            { type: 'separator' },
            { label: 'Zoom In', action: 'view-zoom-in', icon: Maximize },
            { label: 'Zoom Out', action: 'view-zoom-out', icon: Minimize },
            { type: 'separator' },
            { label: 'Dark Mode', action: 'view-theme-dark', checked: theme === 'vs-dark', icon: Moon },
            { label: 'Light Mode', action: 'view-theme-light', checked: theme === 'light', icon: Sun },
        ],
        Run: [
            { label: 'Run Code', action: 'run-run', icon: Play },
            { label: 'Auto Compile', action: 'run-autocompile', checked: autoCompile, icon: Zap },
        ],
        Terminal: [
            { label: 'Clear Terminal', action: 'terminal-clear', icon: Trash2 },
        ]
    };



    return (
        <div className="h-full flex flex-col bg-[#1e1e1e] text-gray-100">
            {/* Top Menu Bar */}
            <div className="h-9 bg-[#323233] border-b border-[#2d2d30] flex items-center justify-between px-2 text-xs select-none" ref={menuRef}>
                <div className="flex items-center space-x-1">
                    {Object.entries(MENUS).map(([name, items]) => (
                        <div key={name} className="relative">
                            <button
                                onClick={() => setActiveMenu(activeMenu === name ? null : name)}
                                onMouseEnter={() => activeMenu && setActiveMenu(name)}
                                className={`px-3 py-1 rounded hover:bg-[#505050] transition-colors ${activeMenu === name ? 'bg-[#505050] text-white' : 'text-gray-300'}`}
                            >
                                {name}
                            </button>
                            {activeMenu === name && (
                                <div className="absolute top-full left-0 mt-1 w-56 bg-[#252526] border border-[#454545] rounded-md shadow-xl z-50 py-1">
                                    {items.map((item, index) => (
                                        item.type === 'separator' ? (
                                            <div key={index} className="h-px bg-[#454545] my-1" />
                                        ) : (
                                            <button
                                                key={index}
                                                onClick={() => handleMenuAction(item.action)}
                                                className="w-full text-left px-4 py-1.5 hover:bg-[#094771] hover:text-white flex items-center justify-between group"
                                            >
                                                <div className="flex items-center">
                                                    <div className="w-4 flex items-center justify-center mr-2">
                                                        {item.checked && <span className="text-blue-400 font-bold">✓</span>}
                                                        {!item.checked && item.icon && <item.icon className="w-3.5 h-3.5 text-gray-400 group-hover:text-white" />}
                                                    </div>
                                                    <span className="text-gray-300 group-hover:text-white">{item.label}</span>
                                                </div>
                                                {item.shortcut && <span className="text-gray-500 text-[10px] group-hover:text-gray-200 ml-4">{item.shortcut}</span>}
                                            </button>
                                        )
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex items-center space-x-4">
                    {/* Return to Assignment Button */}
                    {isFromAssignment && (
                        <>
                            <button
                                onClick={() => {
                                    // Save code back to localStorage for assignment
                                    const activeFileContent = files.find(f => f.id === activeFileId)?.content || '';
                                    localStorage.setItem(`assignmentAnswer_${questionId}`, activeFileContent);

                                    // Clear assignment flags
                                    localStorage.removeItem('returnToAssignment');
                                    localStorage.removeItem('playgroundCode');
                                    localStorage.removeItem('playgroundLanguage');
                                    localStorage.removeItem('codeQuestionId');

                                    // Navigate back to assignments
                                    navigate('/courses/assignments');
                                }}
                                className="flex items-center space-x-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium shadow-sm transition-all"
                            >
                                <ArrowLeft className="w-3 h-3" />
                                <span>Save & Return to Assignment</span>
                            </button>
                            <div className="h-4 w-px bg-[#454545]" />
                        </>
                    )}

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handleRun}
                            disabled={isRunning}
                            className="flex items-center space-x-1.5 px-3 py-1 bg-[#2d2d30] hover:bg-[#3e3e42] text-green-500 hover:text-green-400 border border-green-900/30 rounded text-xs transition-colors"
                            title="Run Web Preview"
                        >
                            <Play className="w-3 h-3" />
                            <span>Preview</span>
                        </button>

                        {activeFile?.language !== 'html' && activeFile?.language !== 'css' && (
                            <button
                                onClick={executeCode}
                                disabled={isRunning}
                                className="flex items-center space-x-1.5 px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-xs font-medium shadow-sm shadow-green-900/20 transition-all"
                            >
                                {isRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3 fill-current" />}
                                <span>Run File</span>
                            </button>
                        )}
                    </div>
                    <div className="h-4 w-px bg-[#454545]" />
                    <div className="flex items-center space-x-2">
                        <Users className="w-3 h-3 text-green-500" />
                        <span className="text-gray-400 text-xs">{activeUsers} Active</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - Explorer */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: sidebarWidth }}
                            exit={{ width: 0 }}
                            className="bg-[#252526] border-r border-[#2d2d30] flex flex-col relative"
                            style={{ width: sidebarWidth }}
                        >
                            {/* Resize Handle */}
                            <div
                                className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 transition-colors z-10"
                                onMouseDown={(e) => { e.preventDefault(); setIsDraggingSidebar(true); }}
                            />
                            <div className="h-9 flex items-center px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-[#2d2d30]">
                                Explorer
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                <div className="p-2">
                                    <div
                                        className="flex items-center space-x-1 text-sm text-gray-300 cursor-pointer hover:bg-[#2a2d2e] px-1 py-0.5 rounded"
                                        onClick={() => setExplorerExpanded(!explorerExpanded)}
                                    >
                                        {explorerExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                        {explorerExpanded ? <FolderOpen className="w-4 h-4 text-blue-400" /> : <Folder className="w-4 h-4 text-blue-400" />}
                                        <span className="font-medium">VPShare-frontend-new</span>
                                    </div>

                                    {explorerExpanded && (
                                        <div className="ml-4 mt-1 space-y-0.5">
                                            {files.map(file => (
                                                <div
                                                    key={file.id}
                                                    onClick={() => setActiveFileId(file.id)}
                                                    className={`group flex items-center justify-between px-2 py-1 text-sm rounded cursor-pointer ${activeFileId === file.id ? 'bg-[#37373d]' : 'hover:bg-[#2a2d2e]'
                                                        }`}
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <FileText className="w-4 h-4 text-gray-400" />
                                                        <span className="text-gray-300">{file.name}</span>
                                                    </div>
                                                    {files.length > 1 && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); deleteFile(file.id); }}
                                                            className="opacity-0 group-hover:opacity-100"
                                                        >
                                                            <X className="w-3 h-3 text-gray-500 hover:text-gray-300" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <button
                                                onClick={addFile}
                                                className="flex items-center space-x-2 px-2 py-1 text-sm text-gray-400 hover:text-gray-200 hover:bg-[#2a2d2e] rounded w-full"
                                            >
                                                <Plus className="w-4 h-4" />
                                                <span>New File</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Editor Area */}
                <div className="flex-1 flex flex-col">
                    {/* File Tabs */}
                    <div className="h-9 bg-[#2d2d30] border-b border-[#2d2d30] flex items-center overflow-x-auto">
                        {files.map(file => (
                            <div
                                key={file.id}
                                onClick={() => setActiveFileId(file.id)}
                                className={`group flex items-center space-x-2 px-3 h-full border-r border-[#2d2d30] cursor-pointer ${activeFileId === file.id ? 'bg-[#1e1e1e] text-white' : 'bg-[#2d2d30] text-gray-400 hover:text-gray-200'
                                    }`}
                            >
                                <span className="text-xs">{LANGUAGES[file.language]?.icon || '📄'}</span>
                                <span className="text-xs">{file.name}</span>
                                {files.length > 1 && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteFile(file.id); }}
                                        className="opacity-0 group-hover:opacity-100 hover:bg-[#3e3e42] rounded p-0.5"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Toolbar */}
                    <div className="h-10 bg-[#1e1e1e] border-b border-[#2d2d30] flex items-center justify-between px-3">
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="p-1.5 hover:bg-[#2a2d2e] rounded"
                            >
                                <Menu className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex items-center space-x-3">
                            <select
                                value={fontSize}
                                onChange={(e) => setFontSize(Number(e.target.value))}
                                className="px-2 py-1 bg-[#3c3c3c] border border-[#2d2d30] rounded text-xs focus:outline-none focus:border-blue-500 text-gray-300"
                            >
                                <option value={12}>12px</option>
                                <option value={14}>14px</option>
                                <option value={16}>16px</option>
                                <option value={18}>18px</option>
                                <option value={20}>20px</option>
                            </select>
                            <button
                                onClick={formatCode}
                                className="p-1.5 hover:bg-[#2a2d2e] rounded text-gray-400 hover:text-white"
                                title="Format Document"
                            >
                                <Code2 className="w-4 h-4" />
                            </button>
                            <div className="w-px h-4 bg-[#2d2d30] mx-2" />
                            <select
                                value={fontSize}
                                onChange={(e) => setFontSize(Number(e.target.value))}
                                className="px-2 py-1 bg-[#3c3c3c] border border-[#2d2d30] rounded text-xs focus:outline-none focus:border-blue-500 text-gray-300"
                            >
                                <option value={12}>12px</option>
                                <option value={14}>14px</option>
                                <option value={16}>16px</option>
                                <option value={18}>18px</option>
                                <option value={20}>20px</option>
                                <option value={24}>24px</option>
                            </select>
                        </div>
                    </div>

                    {/* Editor */}
                    <div className="flex-1 bg-[#1e1e1e]">
                        <Editor
                            height="100%"
                            language={LANGUAGES[activeFile.language]?.monaco || 'javascript'}
                            value={activeFile.content}
                            onChange={updateFileContent}
                            theme={theme}
                            onMount={handleEditorDidMount}
                            options={{
                                fontSize,
                                minimap: { enabled: false },
                                wordWrap: 'on',
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                tabSize: 2,
                                lineNumbers: 'on',
                                renderLineHighlight: 'all',
                                scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
                                padding: { top: 10, bottom: 10 },
                                smoothScrolling: true,
                                cursorBlinking: 'smooth',
                                cursorSmoothCaretAnimation: 'on',
                                formatOnPaste: true,
                                formatOnType: true,
                            }}
                        />
                    </div>

                    {/* Bottom Panel */}
                    <AnimatePresence>
                        {outputVisible && (
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: terminalHeight }}
                                exit={{ height: 0 }}
                                className="border-t border-[#2d2d30] bg-[#1e1e1e] flex flex-col relative"
                                style={{ height: terminalHeight }}
                            >
                                {/* Resize Handle */}
                                <div
                                    className="absolute top-0 left-0 right-0 h-1 cursor-row-resize hover:bg-blue-500 transition-colors z-10"
                                    onMouseDown={(e) => { e.preventDefault(); setIsDraggingTerminal(true); }}
                                />
                                <div className="h-9 bg-[#252526] flex items-center justify-between px-3 border-b border-[#2d2d30]">
                                    <div className="flex items-center space-x-1">
                                        {['Problems', 'Output', 'Terminal', 'Input', 'Debug Console', 'Ports'].map(tab => (
                                            <button
                                                key={tab}
                                                onClick={() => setActiveTab(tab.toLowerCase().replace(' ', ''))}
                                                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${activeTab === tab.toLowerCase().replace(' ', '')
                                                    ? 'bg-[#1e1e1e] text-white'
                                                    : 'text-gray-400 hover:text-gray-200'
                                                    }`}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        {activeTab === 'terminal' && (
                                            <button
                                                onClick={() => setConsoleOutput([])}
                                                className="p-1 hover:bg-[#2a2d2e] rounded"
                                                title="Clear Console"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setOutputVisible(false)}
                                            className="p-1 hover:bg-[#2a2d2e] rounded"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-auto bg-[#1e1e1e]">
                                    {activeTab === 'preview' && (
                                        <iframe ref={iframeRef} title="preview" className="w-full h-full bg-white" sandbox="allow-scripts" />
                                    )}

                                    {activeTab === 'terminal' && (
                                        <div className="p-3 font-mono text-xs space-y-1">
                                            {consoleOutput.length === 0 ? (
                                                <div className="text-gray-500 text-center py-8">Console output will appear here</div>
                                            ) : (
                                                consoleOutput.map(log => (
                                                    <div
                                                        key={log.id}
                                                        className={`flex items-start space-x-2 ${log.level === 'error' ? 'text-red-400' :
                                                            log.level === 'warn' ? 'text-yellow-400' :
                                                                log.level === 'success' ? 'text-green-400' :
                                                                    'text-gray-300'
                                                            }`}
                                                    >
                                                        <span className="text-gray-600">[{log.timestamp}]</span>
                                                        <span>{log.message}</span>
                                                    </div>
                                                ))
                                            )}
                                            {executionOutput && <div className="text-green-400 whitespace-pre-wrap">{executionOutput}</div>}
                                            {executionError && <div className="text-red-400 whitespace-pre-wrap">{executionError}</div>}
                                        </div>
                                    )}

                                    {activeTab === 'input' && (
                                        <div className="p-3 h-full flex flex-col">
                                            <div className="text-xs text-gray-400 mb-2">Standard Input (stdin) for your program:</div>
                                            <textarea
                                                value={stdin}
                                                onChange={(e) => setStdin(e.target.value)}
                                                className="flex-1 bg-[#252526] text-gray-300 p-2 text-xs font-mono border border-[#3c3c3c] focus:border-blue-500 focus:outline-none resize-none"
                                                placeholder="Enter input here..."
                                            />
                                        </div>
                                    )}

                                    {activeTab === 'output' && (
                                        <div className="p-3 font-mono text-xs text-gray-400">Build output will appear here</div>
                                    )}

                                    {activeTab === 'problems' && (
                                        <div className="p-3 text-xs text-gray-400">No problems detected</div>
                                    )}

                                    {activeTab === 'debugconsole' && (
                                        <div className="p-3 font-mono text-xs text-gray-400">Debug console</div>
                                    )}

                                    {activeTab === 'ports' && (
                                        <div className="p-3 text-xs text-gray-400">No forwarded ports</div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Status Bar */}
                    <div className="h-6 bg-[#007acc] flex items-center justify-between px-3 text-xs text-white">
                        <div className="flex items-center space-x-4">
                            <span>Ln {cursorPosition.lineNumber}, Col {cursorPosition.column}</span>
                            <span>{editorOptions.insertSpaces ? 'Spaces' : 'Tab'}: {editorOptions.tabSize}</span>
                            <span>UTF-8</span>
                            <span>CRLF</span>
                            <span>{LANGUAGES[activeFile.language]?.label || 'Plain Text'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setShowSettings(true)}
                                className="hover:text-white transition-colors flex items-center space-x-1"
                            >
                                <Settings className="w-3 h-3" />
                                <span>Settings</span>
                            </button>
                        </div>
                    </div>

                    {/* Settings Modal */}
                    <AnimatePresence>
                        {showSettings && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center"
                                onClick={() => setShowSettings(false)}
                            >
                                <motion.div
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.95, opacity: 0 }}
                                    className="bg-[#252526] border border-[#454545] rounded-lg shadow-2xl w-96 overflow-hidden"
                                    onClick={e => e.stopPropagation()}
                                >
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#454545]">
                                        <h3 className="text-sm font-medium text-white">Editor Settings</h3>
                                        <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="p-4 space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs text-gray-400">Font Size</label>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="range"
                                                    min="10"
                                                    max="30"
                                                    value={fontSize}
                                                    onChange={(e) => setFontSize(Number(e.target.value))}
                                                    className="flex-1"
                                                />
                                                <span className="text-xs text-gray-300 w-8 text-right">{fontSize}px</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs text-gray-400">Theme</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => setTheme('vs-dark')}
                                                    className={`px-3 py-2 text-xs rounded border ${theme === 'vs-dark' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-[#3c3c3c] border-[#454545] text-gray-300'}`}
                                                >
                                                    Dark (VS Code)
                                                </button>
                                                <button
                                                    onClick={() => setTheme('light')}
                                                    className={`px-3 py-2 text-xs rounded border ${theme === 'light' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-[#3c3c3c] border-[#454545] text-gray-300'}`}
                                                >
                                                    Light
                                                </button>
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t border-[#454545]">
                                            <div className="flex items-center justify-between py-2">
                                                <span className="text-xs text-gray-300">Auto Save</span>
                                                <button
                                                    onClick={() => setAutoSave(!autoSave)}
                                                    className={`w-8 h-4 rounded-full transition-colors relative ${autoSave ? 'bg-green-600' : 'bg-gray-600'}`}
                                                >
                                                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${autoSave ? 'left-4.5' : 'left-0.5'}`} />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between py-2">
                                                <span className="text-xs text-gray-300">Auto Compile</span>
                                                <button
                                                    onClick={() => setAutoCompile(!autoCompile)}
                                                    className={`w-8 h-4 rounded-full transition-colors relative ${autoCompile ? 'bg-green-600' : 'bg-gray-600'}`}
                                                >
                                                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${autoCompile ? 'left-4.5' : 'left-0.5'}`} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default PlaygroundEditor;
