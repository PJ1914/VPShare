import React, { useState, useEffect, useRef } from 'react';
import {
    Plus,
    X,
    Image as ImageIcon,
    FileImage,
    Youtube,
    Code,
    Braces,
    HelpCircle,
    MoreHorizontal,
    Table,
    RotateCw,
    GitCommit,
    Network,
    Info
} from 'lucide-react';
import { cn } from '../../lib/utils';

const FloatingMenuButton = ({ onClick, icon: Icon, label, color = 'green' }) => (
    <button
        onClick={onClick}
        title={label}
        className={cn(
            'w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110',
            color === 'green' && 'border-green-500 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20',
            color === 'blue' && 'border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20',
            color === 'purple' && 'border-purple-500 text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20',
            color === 'orange' && 'border-orange-500 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20'
        )}
    >
        <Icon className="w-5 h-5" />
    </button>
);

const EditorFloatingMenu = ({ editor }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [isVisible, setIsVisible] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        if (!editor) return;

        const updatePosition = () => {
            const { state } = editor;
            const { selection } = state;
            const { $anchor } = selection;
            
            // Check if cursor is at the start of an empty block
            const isEmptyTextBlock = 
                $anchor.parent.isTextblock &&
                $anchor.parent.content.size === 0 &&
                selection.empty;

            if (isEmptyTextBlock) {
                const { view } = editor;
                const coords = view.coordsAtPos($anchor.pos);
                const editorRect = view.dom.getBoundingClientRect();
                
                setPosition({
                    top: coords.top - editorRect.top,
                    left: 0
                });
                setIsVisible(true);
            } else {
                setIsVisible(false);
                setIsOpen(false);
            }
        };

        editor.on('selectionUpdate', updatePosition);
        editor.on('focus', updatePosition);
        
        return () => {
            editor.off('selectionUpdate', updatePosition);
            editor.off('focus', updatePosition);
        };
    }, [editor]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!editor || !isVisible) return null;

    const addImage = () => {
        const url = window.prompt('Enter image URL:');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
        setIsOpen(false);
    };

    const addYouTube = () => {
        const url = window.prompt('Enter YouTube URL:');
        if (url) {
            editor.commands.setYoutubeVideo({ src: url });
        }
        setIsOpen(false);
    };

    const addCodeBlock = () => {
        editor.chain().focus().toggleCodeBlock().run();
        setIsOpen(false);
    };

    const addQuiz = () => {
        editor.chain().focus().insertContent({
            type: 'quiz',
            attrs: {
                question: 'Enter your question here',
                options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
                correctAnswer: 0,
                explanation: ''
            }
        }).run();
        setIsOpen(false);
    };

    return (
        <div
            ref={menuRef}
            className="absolute z-20 flex items-center gap-2 transition-all duration-200"
            style={{
                top: position.top,
                left: position.left,
                transform: 'translateY(-50%)'
            }}
        >
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center transition-all hover:border-gray-400 dark:hover:border-gray-500',
                    isOpen && 'rotate-45 border-gray-500 dark:border-gray-400'
                )}
            >
                {isOpen ? (
                    <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                ) : (
                    <Plus className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                )}
            </button>

            {/* Expanded Menu */}
            {isOpen && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                    <FloatingMenuButton
                        onClick={addImage}
                        icon={ImageIcon}
                        label="Add Image"
                        color="green"
                    />
                    <FloatingMenuButton
                        onClick={addImage}
                        icon={FileImage}
                        label="Upload Image"
                        color="green"
                    />
                    <FloatingMenuButton
                        onClick={addYouTube}
                        icon={Youtube}
                        label="Add Video"
                        color="green"
                    />
                    <FloatingMenuButton
                        onClick={addCodeBlock}
                        icon={Code}
                        label="Code Block"
                        color="green"
                    />
                    <FloatingMenuButton
                        onClick={addQuiz}
                        icon={HelpCircle}
                        label="Add Quiz"
                        color="green"
                    />
                    <FloatingMenuButton
                        onClick={() => setIsOpen(false)}
                        icon={MoreHorizontal}
                        label="More"
                        color="green"
                    />                    <FloatingMenuButton 
                        onClick={() => {
                            editor.chain().focus().setFlipCard().run();
                            setIsOpen(false);
                        }}
                        icon={RotateCw}
                        label="Flip Card"
                        color="orange"
                    />
                    <FloatingMenuButton 
                        onClick={() => {
                            editor.chain().focus().setTimeline().run();
                            setIsOpen(false);
                        }}
                        icon={GitCommit}
                        label="Timeline"
                        color="orange"
                    />
                     <FloatingMenuButton 
                         onClick={() => {
                            editor.chain().focus().setMindMap().run();
                            setIsOpen(false);
                        }}
                        icon={Network}
                        label="Mind Map"
                        color="orange"
                    />
                    <FloatingMenuButton 
                        onClick={() => {
                            editor.chain().focus().setInfoHotspot().run();
                            setIsOpen(false);
                        }}
                        icon={Info}
                        label="Info Hotspot"
                        color="blue"
                    />                </div>
            )}
        </div>
    );
};

export default EditorFloatingMenu;
