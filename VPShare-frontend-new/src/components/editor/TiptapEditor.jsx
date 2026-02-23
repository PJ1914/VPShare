import React, { useState } from 'react';
import { EditorContent, useEditor, ReactNodeViewRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import YouTube from '@tiptap/extension-youtube';
import Placeholder from '@tiptap/extension-placeholder';
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { all, createLowlight } from 'lowlight';

import QuizNode from './extensions/QuizNode';
import FlipCardNode from './extensions/FlipCardNode';
import TimelineNode from './extensions/TimelineNode';
import MindMapNode from './extensions/MindMapNode';
import InfoHotspotNode from './extensions/InfoHotspotNode';
import CodeBlockComponent from './extensions/CodeBlockComponent';

import EditorToolbar from './EditorToolbar';
import EditorBubbleMenu from './EditorBubbleMenu';
import EditorFloatingMenu from './EditorFloatingMenu';
import './editor.css';

// Modal imports
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { analyzeAndFormatContent } from '../../services/aiService';

// Create lowlight instance
const lowlight = createLowlight(all);

const TiptapEditor = ({ content, onChange, editable = true, placeholder = 'Start writing...' }) => {
    // --- State ---
    const [activeModal, setActiveModal] = useState(null); // 'link', 'image', 'youtube', 'ai'
    const [modalInput, setModalInput] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
                // Disable default codeBlock so we can use the advanced one
                codeBlock: false,
                // Disable default Link so we can use custom configured one
                link: false,
            }),
            CodeBlockLowlight
                .extend({
                    addNodeView() {
                        return ReactNodeViewRenderer(CodeBlockComponent)
                    }
                })
                .configure({
                    lowlight,
                }),
            Highlight.configure({
                multicolor: false,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer',
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
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            QuizNode,
            FlipCardNode,
            TimelineNode,
            MindMapNode,
            InfoHotspotNode,
        ],
        content: content || {
            type: 'doc',
            content: [{ type: 'paragraph', content: [] }],
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

    // --- Modal Actions ---

    const openLinkModal = () => {
        const previousUrl = editor?.getAttributes('link').href || '';
        setModalInput(previousUrl);
        setActiveModal('link');
    };

    const openImageModal = () => {
        setModalInput('');
        setActiveModal('image');
    };

    const openYouTubeModal = () => {
        setModalInput('');
        setActiveModal('youtube');
    };

    const openAiModal = () => {
        setModalInput('');
        setActiveModal('ai');
    };

    const closeModal = () => {
        setActiveModal(null);
        setModalInput('');
    };

    const handleModalSubmit = async () => {
        if (!editor) return;

        if (activeModal === 'link' && modalInput === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            closeModal();
            return;
        }

        if (!modalInput) {
            closeModal();
            return;
        }

        switch (activeModal) {
            case 'link':
                editor.chain().focus().extendMarkRange('link').setLink({ href: modalInput }).run();
                break;
            case 'image':
                editor.chain().focus().setImage({ src: modalInput }).run();
                break;
            case 'youtube':
                editor.commands.setYoutubeVideo({ src: modalInput });
                break;
            case 'ai':
                await handleAiProcess(modalInput);
                break;
            default:
                break;
        }
        closeModal();
    };

    const handleAiProcess = async (rawContent) => {
        setIsAiLoading(true);
        try {
            // contentResult can be HTML string or JSON object depending on aiService implementation
            const contentResult = await analyzeAndFormatContent(rawContent);

            // Append to the end of the document instead of replacing
            editor.chain().focus('end').insertContent(contentResult).run();
        } catch (error) {
            console.error("AI Formatting Error:", error);
            alert("Failed to format content with AI. Please check the console for details.");
        } finally {
            setIsAiLoading(false);
        }
    };

    // --- Helpers for Modal UI ---

    const getModalTitle = () => {
        switch (activeModal) {
            case 'link': return 'Insert Link';
            case 'image': return 'Insert Image';
            case 'youtube': return 'Insert YouTube Video';
            case 'ai': return 'AI Magic Format';
            default: return '';
        }
    };

    const getModalDescription = () => {
        switch (activeModal) {
            case 'link': return 'Enter the URL for the link.';
            case 'image': return 'Enter the URL of the image you want to embed.';
            case 'youtube': return 'Enter the URL of the YouTube video.';
            case 'ai': return 'Paste your raw content (text & code) below. The AI will format it for you.';
            default: return '';
        }
    };

    return (
        <div className={`border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm transition-all duration-300 ${isFullScreen ? 'editor-fullscreen' : ''}`}>
            {editable && (
                <EditorToolbar
                    editor={editor}
                    openLinkModal={openLinkModal}
                    openImageModal={openImageModal}
                    openYouTubeModal={openYouTubeModal}
                    openAiModal={openAiModal}
                    isAiLoading={isAiLoading}
                    isFullScreen={isFullScreen}
                    toggleFullScreen={() => setIsFullScreen(!isFullScreen)}
                />
            )}

            <div className="relative flex-1 flex flex-col min-h-0">
                {editable && (
                    <EditorBubbleMenu
                        editor={editor}
                        openLinkModal={openLinkModal}
                    />
                )}
                {editable && <EditorFloatingMenu editor={editor} />}
                <EditorContent editor={editor} className={isFullScreen ? 'h-full' : ''} />
            </div>

            {/* --- Shared Modal --- */}
            <Modal
                isOpen={!!activeModal}
                onClose={isAiLoading ? undefined : closeModal}
                title={getModalTitle()}
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {getModalDescription()}
                    </p>

                    {activeModal === 'ai' ? (
                        isAiLoading ? (
                            <div className="flex flex-col items-center justify-center py-8 space-y-4">
                                <LoadingSpinner size={48} />
                                <p className="text-blue-600 dark:text-blue-400 font-medium animate-pulse">
                                    Creating magic content...
                                </p>
                                <p className="text-xs text-gray-400">
                                    This might take a few seconds.
                                </p>
                            </div>
                        ) : (
                            <textarea
                                className="flex min-h-[150px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-blue-600"
                                placeholder="Paste raw content here..."
                                value={modalInput}
                                onChange={(e) => setModalInput(e.target.value)}
                            />
                        )
                    ) : (
                        <Input
                            placeholder="https://..."
                            value={modalInput}
                            onChange={(e) => setModalInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleModalSubmit();
                            }}
                            autoFocus
                        />
                    )}

                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={closeModal} disabled={isAiLoading}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleModalSubmit}
                            disabled={(activeModal === 'ai' && !modalInput) || isAiLoading}
                            isLoading={isAiLoading}
                        >
                            {activeModal === 'ai' ? 'Format Content' : 'Insert'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default TiptapEditor;
