import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '../../../lib/utils';

const CodeBlockComponent = ({ node: { attrs: { language: defaultLanguage } }, updateAttributes, extension }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        const content = extension.editor.state.doc.nodeAt(extension.getPos()).textContent;
        navigator.clipboard.writeText(content);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <NodeViewWrapper className="relative group code-block">
            <div className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-md bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
                    title="Copy code"
                >
                    {isCopied ? <Check size={16} /> : <Copy size={16} />}
                </button>
            </div>

            <select
                contentEditable={false}
                defaultValue={defaultLanguage}
                onChange={event => updateAttributes({ language: event.target.value })}
                className="absolute right-12 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-700/50 text-gray-300 text-xs rounded px-2 py-1 outline-none border-none hover:bg-gray-700"
            >
                <option value="null">auto</option>
                <option disabled>—</option>
                {extension.options.lowlight.listLanguages().map((lang, index) => (
                    <option key={index} value={lang}>
                        {lang}
                    </option>
                ))}
            </select>

            <pre>
                <NodeViewContent as="code" />
            </pre>
        </NodeViewWrapper>
    );
};

export default CodeBlockComponent;
