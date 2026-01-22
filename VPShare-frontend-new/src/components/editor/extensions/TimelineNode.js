import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import TimelineComponent from './TimelineComponent';

export const TimelineNode = Node.create({
    name: 'timeline',
    group: 'block',
    draggable: true,
    atom: true,

    addCommands() {
        return {
            setTimeline: () => ({ commands }) => {
                return commands.insertContent({ type: 'timeline' })
            },
        }
    },

    addAttributes() {
        return {
            points: {
                default: [
                    { id: 1, title: 'Phase 1', description: 'Initial Phase', date: 'Step 1' },
                    { id: 2, title: 'Phase 2', description: 'Development Phase', date: 'Step 2' },
                    { id: 3, title: 'Phase 3', description: 'Deployment Phase', date: 'Step 3' },
                ],
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-type="timeline"]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'timeline' })];
    },

    addNodeView() {
        return ReactNodeViewRenderer(TimelineComponent);
    },
});

export default TimelineNode;
