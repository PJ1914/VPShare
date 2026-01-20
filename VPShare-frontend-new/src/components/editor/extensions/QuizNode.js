import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import QuizComponent from './QuizComponent';

export const QuizNode = Node.create({
    name: 'quiz',
    group: 'block',
    draggable: true,
    atom: true,

    addAttributes() {
        return {
            question: {
                default: 'Enter your question here',
            },
            options: {
                default: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
            },
            correctAnswer: {
                default: 0,
            },
            explanation: {
                default: '',
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-type="quiz"]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'quiz' })];
    },

    addNodeView() {
        return ReactNodeViewRenderer(QuizComponent);
    },
});

export default QuizNode;
