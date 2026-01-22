import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import InfoHotspotComponent from './InfoHotspotComponent';

export const InfoHotspotNode = Node.create({
    name: 'infoHotspot',
    group: 'inline',
    inline: true,
    draggable: true,
    atom: true,

    addCommands() {
        return {
            setInfoHotspot: () => ({ commands }) => {
                return commands.insertContent({ type: 'infoHotspot' })
            },
        }
    },

    addAttributes() {
        return {
            infoText: {
                default: 'Enter additional information here.',
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'span[data-type="infoHotspot"]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'infoHotspot' })];
    },

    addNodeView() {
        return ReactNodeViewRenderer(InfoHotspotComponent);
    },
});

export default InfoHotspotNode;
