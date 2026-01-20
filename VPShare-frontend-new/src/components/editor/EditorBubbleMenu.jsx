import React, { useState } from 'react';
import { BubbleMenu } from '@tiptap/react/menus';
import {
    Bold,
    Italic,
    Link as LinkIcon,
    Heading1,
    Heading2,
    Quote,
    Code,
    Highlighter,
    Strikethrough
} from 'lucide-react';
import { cn } from '../../lib/utils';

const BubbleMenuButton = ({ onClick, isActive, title, children }) => (
    <button
        onClick={onClick}
        title={title}
        className={cn(
            'p-2 hover:bg-white/10 rounded transition-colors',
            isActive && 'bg-white/20 text-white'
        )}
    >
        {children}
    </button>
);

const EditorBubbleMenu = ({ editor }) => {
    if (!editor) return null;

    const addLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('Enter URL:', previousUrl);
        
        if (url === null) return;
        
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    return (
        <BubbleMenu
            editor={editor}
            tippyOptions={{
                duration: 150,
                placement: 'top',
            }}
            className="flex items-center gap-0.5 px-2 py-1.5 bg-gray-900 dark:bg-gray-800 rounded-lg shadow-xl border border-gray-700"
        >
            <BubbleMenuButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                title="Bold"
            >
                <span className="font-bold text-white text-sm">B</span>
            </BubbleMenuButton>
            
            <BubbleMenuButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                title="Italic"
            >
                <span className="italic text-white text-sm">i</span>
            </BubbleMenuButton>
            
            <BubbleMenuButton
                onClick={addLink}
                isActive={editor.isActive('link')}
                title="Add Link"
            >
                <LinkIcon className="w-4 h-4 text-white" />
            </BubbleMenuButton>

            <div className="w-px h-5 bg-gray-600 mx-1" />

            <BubbleMenuButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive('heading', { level: 1 })}
                title="Heading 1"
            >
                <span className="font-bold text-white text-base">T</span>
            </BubbleMenuButton>
            
            <BubbleMenuButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive('heading', { level: 2 })}
                title="Heading 2"
            >
                <span className="font-bold text-white text-xs">T</span>
            </BubbleMenuButton>

            <BubbleMenuButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive('blockquote')}
                title="Quote"
            >
                <Quote className="w-4 h-4 text-white" />
            </BubbleMenuButton>

            <div className="w-px h-5 bg-gray-600 mx-1" />

            <BubbleMenuButton
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                isActive={editor.isActive('highlight')}
                title="Highlight"
            >
                <Highlighter className="w-4 h-4 text-white" />
            </BubbleMenuButton>
        </BubbleMenu>
    );
};

export default EditorBubbleMenu;
