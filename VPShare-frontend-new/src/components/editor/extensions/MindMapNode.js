import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import MindMapComponent from './MindMapComponent';

export const MindMapNode = Node.create({
    name: 'mindMap',
    group: 'block',
    draggable: true,
    atom: true,

    addCommands() {
        return {
            setMindMap: () => ({ commands }) => {
                return commands.insertContent({ type: 'mindMap' })
            },
        }
    },

    addAttributes() {
        return {
            rootNode: {
                default: {
                    id: 'root',
                    label: 'Central Idea',
                    children: [
                        { id: '1', label: 'Branch 1', children: [] },
                        { id: '2', label: 'Branch 2', children: [] }
                    ]
                },
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-type="mindMap"]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'mindMap' })];
    },

    addNodeView() {
        return ReactNodeViewRenderer(MindMapComponent);
    },
});

export default MindMapNode;
