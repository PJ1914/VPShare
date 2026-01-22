import React from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import YouTube from '@tiptap/extension-youtube';
import Placeholder from '@tiptap/extension-placeholder';
import QuizNode from './extensions/QuizNode';
import FlipCardNode from './extensions/FlipCardNode';
import TimelineNode from './extensions/TimelineNode';
import MindMapNode from './extensions/MindMapNode';
import InfoHotspotNode from './extensions/InfoHotspotNode';
import EditorToolbar from './EditorToolbar';
import EditorBubbleMenu from './EditorBubbleMenu';
import EditorFloatingMenu from './EditorFloatingMenu';
import './editor.css';

const TiptapEditor = ({ content, onChange, editable = true, placeholder = 'Start writing...' }) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Highlight.configure({
                multicolor: false,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full h-auto my-4',
                },
            }),
            YouTube.configure({
                inline: false,
                width: 640,
                height: 360,
                HTMLAttributes: {
                    class: 'rounded-lg my-4',
                },
            }),
            Placeholder.configure({
                placeholder,
                emptyEditorClass: 'is-editor-empty',
            }),
            QuizNode,
            FlipCardNode,
            TimelineNode,
            MindMapNode,
            InfoHotspotNode,
        ],
        content: content || {
            type: 'doc',
            content: [
                {
                    type: 'paragraph',
                    content: [],
                },
            ],
        },
        editable,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[500px] px-6 py-4',
                spellcheck: 'false',
            },
        },
        onUpdate: ({ editor }) => {
            if (onChange) {
                onChange(editor.getJSON());
            }
        },
    });

    return (
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
            {editable && <EditorToolbar editor={editor} />}
            <div className="relative">
                {editable && <EditorBubbleMenu editor={editor} />}
                {editable && <EditorFloatingMenu editor={editor} />}
                <EditorContent editor={editor} />
            </div>
        </div>
    );
};

export default TiptapEditor;
