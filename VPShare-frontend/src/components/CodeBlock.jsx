import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/styles/tomorrow';
import { Button } from '@mui/material';
import { ContentCopy, Check } from '@mui/icons-material';
import '../styles/CourseDetail.css';

const CodeBlock = ({ language = 'javascript', code }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    return (
        <div className="code-block-container">
            <div className="code-block-header">
                <span className="code-language">{language}</span>
                <Button
                    variant="contained"
                    size="small"
                    onClick={handleCopy}
                    className="copy-button"
                    startIcon={copied ? <Check /> : <ContentCopy />}
                >
                    {copied ? 'Copied!' : 'Copy'}
                </Button>
            </div>
            <SyntaxHighlighter
                language={language}
                style={tomorrow}
                customStyle={{ margin: 0 }}
                wrapLongLines={true}
            >
                {code.trim()}
            </SyntaxHighlighter>
        </div>
    );
};

export default CodeBlock;
