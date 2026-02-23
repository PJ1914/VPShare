
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// Initialize likely if key exists, otherwise let the function handle error
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export const analyzeAndFormatContent = async (content) => {
    if (!API_KEY || !genAI) {
        throw new Error("Gemini API Key is missing in environment variables (VITE_GEMINI_API_KEY)");
    }

    // Use Gemini 2.0 Flash - 1M context window, 8192 max output tokens
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash",
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192, // Maximum for Gemini 2.0 Flash
            topP: 0.95,
        }
    });

    const prompt = `You are an INTELLIGENT educational content formatter for TipTap editor. Convert tutorial content to engaging, interactive JSON using ALL available components.

🎯 YOUR MISSION: Make boring text INTERACTIVE and ENGAGING for Indian students learning web development!

⚠️ CRITICAL TIPTAP STRUCTURE RULES (MUST FOLLOW):
1. Return ONLY valid JSON (no markdown fence, no explanations outside JSON)
2. BLOCK nodes (codeBlock, heading, quiz, flipCard, timeline, mindMap, bulletList) CANNOT be nested inside paragraphs
3. Paragraphs can ONLY contain INLINE content (text with marks)
4. For inline code like "display: flex", use: { "type": "text", "text": "display: flex", "marks": [{"type": "code"}] }
5. For multi-line code blocks, use separate codeBlock node (NOT inside paragraph)
6. Escape quotes in strings: \\" for nested quotes
7. Keep Hindi-English mix tone (relatable for Indian students)

📦 AVAILABLE TIPTAP COMPONENTS:

🔹 INLINE CONTENT (Can go inside paragraphs):
- Plain text: { "type": "text", "text": "your content" }
- Bold text: { "type": "text", "text": "bold word", "marks": [{"type": "bold"}] }
- Inline code: { "type": "text", "text": "display: flex", "marks": [{"type": "code"}] }
- Link: { "type": "text", "text": "click here", "marks": [{"type": "link", "attrs": {"href": "url"}}] }

🔹 BLOCK CONTENT (Separate nodes, NEVER inside paragraphs):

1. HEADING - Section titles
{ "type": "heading", "attrs": { "level": 2 }, "content": [{ "type": "text", "text": "Understanding CSS" }] }

2. PARAGRAPH - Regular text (can contain inline code, bold, etc.)
{ "type": "paragraph", "content": [{ "type": "text", "text": "The " }, { "type": "text", "text": "display", "marks": [{"type": "code"}] }, { "type": "text", "text": " property controls layout." }] }

3. CODEBLOCK - Multi-line code examples (separate block)
{ "type": "codeBlock", "attrs": { "language": "css" }, "content": [{ "type": "text", "text": "p {\\n  color: #666;\\n}" }] }

4. QUIZ - Practice questions
{ "type": "quiz", "attrs": { "question": "What is CSS selector?", "options": ["A pointer", "A property", "A value", "A tag"], "correctAnswer": 0, "explanation": "Selectors point to HTML elements" } }

5. FLIPCARD - Vocabulary/definitions
{ "type": "flipCard", "attrs": { "cards": [{ "id": "1", "frontText": "Element Selector", "backText": "Selects ALL instances of an HTML tag (e.g., p, h2)" }] } }

6. TIMELINE - Step-by-step processes
{ "type": "timeline", "attrs": { "points": [{ "id": 1, "title": "Step 1: Open VS Code", "description": "Launch editor", "date": "First" }] } }

7. MINDMAP - Concept hierarchies
{ "type": "mindMap", "attrs": { "rootNode": { "id": "root", "label": "CSS Selectors", "children": [{ "id": "1", "label": "Element Selector" }] } } }

8. BULLETLIST - Lists
{ "type": "bulletList", "content": [{ "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Point 1" }] }] }] }

🧠 SMART USAGE RULES:

INLINE CODE (inside paragraph) - Use for:
- Short snippets: "color: red", "display: flex", "<div>", "margin: 10px"
- Property names: "font-family", "background-color"
- Single values: "#FF0000", "sans-serif"
Example: { "type": "paragraph", "content": [{ "type": "text", "text": "Use " }, { "type": "text", "text": "color: red", "marks": [{"type": "code"}] }, { "type": "text", "text": " for red text." }] }

CODEBLOCK (separate node) - Use for:
- Multi-line CSS/HTML/JS examples
- Complete code snippets with braces/tags
- Code with comments
Example: 
{ "type": "paragraph", "content": [{ "type": "text", "text": "Here's an example:" }] },
{ "type": "codeBlock", "attrs": { "language": "css" }, "content": [{ "type": "text", "text": "p {\\n  color: #666;\\n}" }] }

QUIZ - When you see questions, assessments, "test yourself"

FLIPCARD - For definitions, vocabulary, key-value pairs (CSS properties list!)

TIMELINE - For step-by-step instructions, numbered tasks

MINDMAP - For categories, hierarchies, concept relationships

📝 EXAMPLE OUTPUT WITH INLINE CODE:
{
  "type": "doc",
  "content": [
    { "type": "heading", "attrs": { "level": 2 }, "content": [{ "type": "text", "text": "CSS Selectors" }] },
    { "type": "paragraph", "content": [{ "type": "text", "text": "The " }, { "type": "text", "text": "display", "marks": [{"type": "code"}] }, { "type": "text", "text": " property controls layout. Use " }, { "type": "text", "text": "flex", "marks": [{"type": "code"}] }, { "type": "text", "text": " for flexible layouts." }] },
    { "type": "paragraph", "content": [{ "type": "text", "text": "Here's a complete example:" }] },
    { "type": "codeBlock", "attrs": { "language": "css" }, "content": [{ "type": "text", "text": ".container {\\n  display: flex;\\n  gap: 20px;\\n}" }] },
    { "type": "flipCard", "attrs": { "cards": [{ "id": "1", "frontText": "display: flex", "backText": "Creates a flexible box layout container" }] } },
    { "type": "quiz", "attrs": { "question": "Which property creates a flex container?", "options": ["display: flex", "flex: 1", "justify-content", "align-items"], "correctAnswer": 0, "explanation": "display: flex is the main property that creates a flex container" } }
  ]
}

⚠️ CRITICAL MISTAKES TO AVOID:
❌ NEVER put codeBlock inside paragraph - they are separate blocks!
❌ NEVER put quiz/flipCard/timeline/mindMap inside paragraph!
❌ Don't wrap JSON in markdown code fences
❌ Don't skip code examples
❌ Don't forget to escape quotes with backslash: \\"
❌ Don't generate responses longer than 15,000 characters - keep it CONCISE!

✅ CORRECT PATTERNS:
✅ Short code in paragraph: { "type": "text", "text": "color: red", "marks": [{"type": "code"}] }
✅ Multi-line code: Separate codeBlock node
✅ Interactive elements: Separate block nodes
✅ Keep responses under 15K chars - focus on quality over quantity!

🎓 TARGET AUDIENCE: Indian students (keep "Yeh", "Rohan", "Priya" references, Hindi-English mix)

NOW FORMAT THIS CONTENT (make it INTERACTIVE and ENGAGING):
${content.substring(0, 15000)}

IMPORTANT: Keep your JSON response UNDER 15,000 characters. Be concise! Return pure JSON only. No markdown fences.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Cleanup markdown code blocks if present to extract pure JSON
        text = text.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '').trim();

        // Try to fix common JSON issues
        let jsonContent;
        try {
            jsonContent = JSON.parse(text);
        } catch (parseError) {
            console.warn("Initial JSON parse failed, attempting to fix...", parseError.message);
            
            // More aggressive JSON repair
            let fixedText = text;
            
            // Fix 1: Remove trailing commas before } or ]
            fixedText = fixedText.replace(/,(\s*[}\]])/g, '$1');
            
            // Fix 2: Remove any trailing incomplete objects/arrays
            // Find the last complete closing brace
            const lastClosingDocBrace = fixedText.lastIndexOf(']}');
            if (lastClosingDocBrace > -1) {
                fixedText = fixedText.substring(0, lastClosingDocBrace + 2);
            }
            
            // Fix 3: Balance braces
            let openBraces = (fixedText.match(/{/g) || []).length;
            let closeBraces = (fixedText.match(/}/g) || []).length;
            let openBrackets = (fixedText.match(/\[/g) || []).length;
            let closeBrackets = (fixedText.match(/]/g) || []).length;
            
            if (openBraces > closeBraces) {
                fixedText += '}'.repeat(Math.min(openBraces - closeBraces, 5));
            }
            if (openBrackets > closeBrackets) {
                fixedText += ']'.repeat(Math.min(openBrackets - closeBrackets, 5));
            }
            
            try {
                jsonContent = JSON.parse(fixedText);
                console.log("✅ Successfully fixed JSON");
            } catch (secondError) {
                console.error("JSON fix failed. Original response length:", text.length);
                console.error("Parse error:", secondError.message);
                
                // Return a basic fallback structure
                return {
                    type: "doc",
                    content: [
                        {
                            type: "paragraph",
                            content: [{
                                type: "text",
                                marks: [{ type: "bold" }],
                                text: "⚠️ AI formatting failed"
                            }]
                        },
                        {
                            type: "paragraph",
                            content: [{
                                type: "text",
                                text: "The AI response was too complex. Try breaking your content into smaller sections (2000-5000 characters each)."
                            }]
                        }
                    ]
                };
            }
        }

        // CRITICAL: Sanitize BEFORE returning to prevent TipTap crashes
        const sanitized = sanitizeContent(jsonContent);
        
        // If top level got flattened (shouldn't happen for doc, but just in case)
        if (sanitized && sanitized.__flatten) {
            return {
                type: "doc",
                content: sanitized.nodes
            };
        }
        
        return sanitized;
    } catch (error) {
        console.error("Error generating content:", error);
        
        // Return user-friendly fallback
        return {
            type: "doc",
            content: [
                {
                    type: "paragraph",
                    content: [{
                        type: "text",
                        marks: [{ type: "bold" }],
                        text: "AI Content Generation Error"
                    }]
                },
                {
                    type: "paragraph",
                    content: [{
                        type: "text",
                        text: `Failed to format content: ${error.message}. Please try again with shorter content or check your API key.`
                    }]
                }
            ]
        };
    }
};

// Helper: Remove empty text nodes and fix invalid nesting
const sanitizeContent = (node, depth = 0) => {
    if (!node) return null;

    // Prevent infinite recursion
    if (depth > 50) {
        console.error("Max recursion depth reached in sanitizeContent");
        return null;
    }

    // Remove text nodes with empty string
    if (node.type === 'text' && (!node.text || node.text === '')) {
        return null;
    }

    // List of block-level node types that CANNOT be inside paragraphs
    const blockNodeTypes = ['codeBlock', 'heading', 'quiz', 'flipCard', 'timeline', 'mindMap', 'bulletList', 'orderedList', 'blockquote', 'horizontalRule'];

    // Fix invalid nesting: block nodes inside paragraphs
    if (node.type === 'paragraph' && node.content && Array.isArray(node.content)) {
        // Check if any child is a block node (invalid!)
        const hasBlockChild = node.content.some(child => child && blockNodeTypes.includes(child.type));
        
        if (hasBlockChild) {
            console.warn("🔧 Fixing invalid nesting: block node inside paragraph");
            
            // Split paragraph content into valid pieces
            const result = [];
            let currentParagraphContent = [];
            
            for (const child of node.content) {
                if (!child) continue;
                
                if (blockNodeTypes.includes(child.type)) {
                    // Save accumulated paragraph content before the block
                    if (currentParagraphContent.length > 0) {
                        result.push({
                            type: 'paragraph',
                            content: currentParagraphContent.filter(Boolean)
                        });
                        currentParagraphContent = [];
                    }
                    // Add the block node separately (recursively sanitize it too)
                    const sanitizedBlock = sanitizeContent(child, depth + 1);
                    if (sanitizedBlock) {
                        result.push(sanitizedBlock);
                    }
                } else {
                    // Accumulate inline content
                    const sanitizedInline = sanitizeContent(child, depth + 1);
                    if (sanitizedInline) {
                        currentParagraphContent.push(sanitizedInline);
                    }
                }
            }
            
            // Add remaining paragraph content
            if (currentParagraphContent.length > 0) {
                result.push({
                    type: 'paragraph',
                    content: currentParagraphContent.filter(Boolean)
                });
            }
            
            // Return array marker so parent knows to flatten
            return { __flatten: true, nodes: result.filter(Boolean) };
        }
    }

    // Recursively sanitize children
    if (node.content && Array.isArray(node.content)) {
        const newContent = [];
        
        for (const child of node.content) {
            if (!child) continue;
            
            const sanitized = sanitizeContent(child, depth + 1);
            if (sanitized) {
                if (sanitized.__flatten) {
                    // Flatten the array of nodes
                    newContent.push(...sanitized.nodes);
                } else {
                    newContent.push(sanitized);
                }
            }
        }
        
        node.content = newContent;
    }

    return node;
};
