import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import FlipCardComponent from './FlipCardComponent';

export const FlipCardNode = Node.create({
    name: 'flipCard',
    group: 'block',
    draggable: true,
    atom: true,

    addAttributes() {
        return {
            cards: {
                default: [
                    { id: '1', frontText: 'Concept 1', backText: 'Definition 1' },
                    { id: '2', frontText: 'Concept 2', backText: 'Definition 2' },
                ],
            },
        };
    },

    addCommands() {
        return {
            setFlipCard: () => ({ commands }) => {
                return commands.insertContent({ type: 'flipCard' })
            },
        }
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-type="flipCard"]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'flipCard' })];
    },

    addNodeView() {
        return ReactNodeViewRenderer(FlipCardComponent);
    },
});

export default FlipCardNode;
