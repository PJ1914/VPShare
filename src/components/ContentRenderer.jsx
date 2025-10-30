import React from 'react';
import ReactMarkdown from 'react-markdown';
import NoteBox from './NoteBox';
import CodeBlock from './CodeBlock';

// The main parser function
const parseContent = (text) => {
    if (!text) return [];

    // Regex to split content by our custom blocks and code fences
    const blockRegex = /(```[\s\S]*?```|\[(NOTE|TIP|WARNING|IMPORTANT)\][\s\S]*?\[\/\2\]|\[EXAMPLE\][\s\S]*?\[\/EXAMPLE\]|\[DEF\][\s\S]*?\[\/DEF\]|\[OUTPUT\][\s\S]*?\[\/OUTPUT\]|\[PREREQUISITE\][\s\S]*?\[\/PREREQUISITE\]|\[LEARNING_OUTCOME\][\s\S]*?\[\/LEARNING_OUTCOME\]|\[QUIZ\][\s\S]*?\[\/QUIZ\]|\[ASSIGNMENT\][\s\S]*?\[\/ASSIGNMENT\]|\[PROJECT\][\s\S]*?\[\/PROJECT\]|\[RESOURCE\][\s\S]*?\[\/RESOURCE\]|\[INTERACTIVE\][\s\S]*?\[\/INTERACTIVE\])/g;
    const parts = text.split(blockRegex).filter(part => part && part.trim() !== '');

    const blocks = [];
    for (const part of parts) {
        if (part.startsWith('```')) {
            const language = part.match(/```(\w+)/)?.[1] || 'plaintext';
            const code = part.replace(/```\w*\n|```/g, '');
            blocks.push({ type: 'code', language, content: code });
        } else if (part.startsWith('[')) {
            // Handle various block types
            const blockTypeMatch = part.match(/\[(\w+)\]/);
            if (blockTypeMatch) {
                const blockType = blockTypeMatch[1].toLowerCase();
                let content = part.replace(/\[\/?\w+\]/g, '').trim();
                
                switch (blockType) {
                    case 'note':
                    case 'tip':
                    case 'warning':
                    case 'important':
                        blocks.push({ type: 'note', noteType: blockType, content });
                        break;
                    case 'example':
                        blocks.push({ type: 'example', content });
                        break;
                    case 'def':
                        blocks.push({ type: 'definition', content });
                        break;
                    case 'output':
                        blocks.push({ type: 'output', content });
                        break;
                    case 'prerequisite':
                        blocks.push({ type: 'prerequisite', content });
                        break;
                    case 'learning_outcome':
                        blocks.push({ type: 'learning_outcome', content });
                        break;
                    case 'quiz':
                        blocks.push({ type: 'quiz', content });
                        break;
                    case 'assignment':
                        blocks.push({ type: 'assignment', content });
                        break;
                    case 'project':
                        blocks.push({ type: 'project', content });
                        break;
                    case 'resource':
                        blocks.push({ type: 'resource', content });
                        break;
                    case 'interactive':
                        blocks.push({ type: 'interactive', content });
                        break;
                    default:
                        blocks.push({ type: 'markdown', content: part });
                }
            } else {
                blocks.push({ type: 'markdown', content: part });
            }
        } else {
            blocks.push({ type: 'markdown', content: part });
        }
    }
    return blocks;
};

// Special block components
const ExampleBox = ({ children }) => (
    <div className="example-box">
        <div className="example-header">
            <span className="example-icon">🎯</span>
            <strong>Example:</strong>
        </div>
        <div className="example-content">{children}</div>
    </div>
);

const DefinitionBox = ({ children }) => (
    <div className="definition-box">
        <div className="def-icon">📖</div>
        <div className="def-content">{children}</div>
    </div>
);

const OutputBox = ({ children }) => (
    <div className="output-box">
        <div className="output-header">
            <span className="output-icon">⚡</span>
            <strong>Output:</strong>
        </div>
        <pre className="output-content">{children}</pre>
    </div>
);

const PrerequisiteBox = ({ children }) => (
    <div className="prerequisite-box">
        <div className="prerequisite-header">
            <span className="prerequisite-icon">📚</span>
            <strong>Prerequisites:</strong>
        </div>
        <div className="prerequisite-content">{children}</div>
    </div>
);

const LearningOutcomeBox = ({ children }) => (
    <div className="outcome-box">
        <div className="outcome-header">
            <span className="outcome-icon">🎯</span>
            <strong>Learning Outcome:</strong>
        </div>
        <div className="outcome-content">{children}</div>
    </div>
);

const QuizBox = ({ children }) => (
    <div className="quiz-indicator">
        <div className="quiz-header">
            <span className="quiz-icon">❓</span>
            <strong>Quick Check:</strong>
        </div>
        <div className="quiz-content">{children}</div>
    </div>
);

const AssignmentBox = ({ children }) => (
    <div className="assignment-box">
        <div className="assignment-header">
            <span className="assignment-icon">📝</span>
            <strong>Assignment:</strong>
        </div>
        <div className="assignment-content">{children}</div>
    </div>
);

const ProjectBox = ({ children }) => (
    <div className="project-box">
        <div className="project-header">
            <span className="project-icon">🚀</span>
            <strong>Project:</strong>
        </div>
        <div className="project-content">{children}</div>
    </div>
);

const ResourceBox = ({ children }) => (
    <div className="resource-box">
        <div className="resource-header">
            <span className="resource-icon">📖</span>
            <strong>Additional Resource:</strong>
        </div>
        <div className="resource-content">{children}</div>
    </div>
);

const InteractiveBox = ({ children }) => (
    <div className="interactive-box">
        <div className="interactive-header">
            <span className="interactive-icon">🎮</span>
            <strong>Try It Out:</strong>
        </div>
        <div className="interactive-content">{children}</div>
    </div>
);

const ContentRenderer = ({ content }) => {
    const blocks = parseContent(content);

    return (
        <div className="learning-content-prose">
            {blocks.map((block, index) => {
                switch (block.type) {
                    case 'code':
                        return <CodeBlock key={index} language={block.language} code={block.content} />;
                    case 'note':
                        return (
                            <NoteBox key={index} type={block.noteType}>
                                <ReactMarkdown>{block.content}</ReactMarkdown>
                            </NoteBox>
                        );
                    case 'example':
                        return (
                            <ExampleBox key={index}>
                                <ReactMarkdown>{block.content}</ReactMarkdown>
                            </ExampleBox>
                        );
                    case 'definition':
                        return (
                            <DefinitionBox key={index}>
                                <ReactMarkdown>{block.content}</ReactMarkdown>
                            </DefinitionBox>
                        );
                    case 'output':
                        return (
                            <OutputBox key={index}>
                                {block.content}
                            </OutputBox>
                        );
                    case 'prerequisite':
                        return (
                            <PrerequisiteBox key={index}>
                                <ReactMarkdown>{block.content}</ReactMarkdown>
                            </PrerequisiteBox>
                        );
                    case 'learning_outcome':
                        return (
                            <LearningOutcomeBox key={index}>
                                <ReactMarkdown>{block.content}</ReactMarkdown>
                            </LearningOutcomeBox>
                        );
                    case 'quiz':
                        return (
                            <QuizBox key={index}>
                                <ReactMarkdown>{block.content}</ReactMarkdown>
                            </QuizBox>
                        );
                    case 'assignment':
                        return (
                            <AssignmentBox key={index}>
                                <ReactMarkdown>{block.content}</ReactMarkdown>
                            </AssignmentBox>
                        );
                    case 'project':
                        return (
                            <ProjectBox key={index}>
                                <ReactMarkdown>{block.content}</ReactMarkdown>
                            </ProjectBox>
                        );
                    case 'resource':
                        return (
                            <ResourceBox key={index}>
                                <ReactMarkdown>{block.content}</ReactMarkdown>
                            </ResourceBox>
                        );
                    case 'interactive':
                        return (
                            <InteractiveBox key={index}>
                                <ReactMarkdown>{block.content}</ReactMarkdown>
                            </InteractiveBox>
                        );
                    case 'markdown':
                        return <ReactMarkdown key={index}>{block.content}</ReactMarkdown>;
                    default:
                        return null;
                }
            })}
        </div>
    );
};

export default ContentRenderer;
