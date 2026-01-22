import React from 'react';
import {
    Bold,
    Italic,
    Highlighter,
    Link as LinkIcon,
    Heading1,
    Heading2,
    Heading3,
    Image as ImageIcon,
    Youtube,
    HelpCircle,
    List,
    ListOrdered,
    Undo,
    Redo,
    Code,
    RotateCw,
    GitCommit,
    Network,
    PlusCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';

const ToolbarButton = ({ onClick, isActive, disabled, title, children, className }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={cn(
                'p-2 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed',
                isActive && 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
                !isActive && 'text-gray-700 dark:text-gray-300',
                className
            )}
        >
            {children}
        </button>
    );
};

const ToolbarDivider = () => (
    <div className="w-px h-6 bg-gray-300 dark:bg-gray-700" />
);

const EditorToolbar = ({ editor }) => {
    if (!editor) return null;

    const addLink = () => {
        const url = window.prompt('Enter URL:');
        if (url) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    };

    const addImage = () => {
        const url = window.prompt('Enter image URL:');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const addYouTube = () => {
        const url = window.prompt('Enter YouTube URL:');
        if (url) {
            editor.commands.setYoutubeVideo({ src: url });
        }
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
    };

    const addFlipCard = () => {
        editor.chain().focus().insertContent({ type: 'flipCard' }).run();
    };

    const addTimeline = () => {
        editor.chain().focus().insertContent({ type: 'timeline' }).run();
    };

    const addMindMap = () => {
        editor.chain().focus().insertContent({ type: 'mindMap' }).run();
    };

    const addInfoHotspot = () => {
        editor.chain().focus().insertContent({ type: 'infoHotspot' }).run();
    };

    return (
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-2 flex flex-wrap items-center gap-1 shadow-sm">
            {/* Text Formatting */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                title="Bold (Ctrl+B)"
            >
                <Bold className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                title="Italic (Ctrl+I)"
            >
                <Italic className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                isActive={editor.isActive('highlight')}
                title="Highlight"
            >
                <Highlighter className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={addLink}
                isActive={editor.isActive('link')}
                title="Add Link"
            >
                <LinkIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleCode().run()}
                isActive={editor.isActive('code')}
                title="Inline Code"
            >
                <Code className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarDivider />

            {/* Headings */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive('heading', { level: 1 })}
                title="Heading 1"
            >
                <Heading1 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive('heading', { level: 2 })}
                title="Heading 2"
            >
                <Heading2 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                isActive={editor.isActive('heading', { level: 3 })}
                title="Heading 3"
            >
                <Heading3 className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarDivider />

            {/* Lists */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive('bulletList')}
                title="Bullet List"
            >
                <List className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive('orderedList')}
                title="Numbered List"
            >
                <ListOrdered className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarDivider />

            {/* Media */}
            <ToolbarButton
                onClick={addImage}
                title="Add Image"
            >
                <ImageIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={addYouTube}
                title="Add YouTube Video"
            >
                <Youtube className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarDivider />

            {/* Interactive */}
            <ToolbarButton
                onClick={addQuiz}
                title="Add Quiz Block"
                className="text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30"
            >
                <HelpCircle className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
                onClick={addFlipCard}
                title="Add Flip Card"
                className="text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30"
            >
                <RotateCw className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
                onClick={addTimeline}
                title="Add Timeline"
                className="text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30"
            >
                <GitCommit className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
                onClick={addMindMap}
                title="Add Mind Map"
                className="text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30"
            >
                <Network className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
                onClick={addInfoHotspot}
                title="Add Info Hotspot"
                className="text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
            >
                <PlusCircle className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarDivider />

            {/* History */}
            <ToolbarButton
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                title="Undo"
            >
                <Undo className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                title="Redo"
            >
                <Redo className="w-4 h-4" />
            </ToolbarButton>
        </div>
    );
};

export default EditorToolbar;
