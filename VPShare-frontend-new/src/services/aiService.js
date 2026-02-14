
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// Initialize likely if key exists, otherwise let the function handle error
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export const analyzeAndFormatContent = async (content) => {
    if (!API_KEY || !genAI) {
        throw new Error("Gemini API Key is missing in environment variables (VITE_GEMINI_API_KEY)");
    }

    // Use Gemini 2.0 Flash as it offers better speed/performance for complex tasks
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
    You are an expert, engaging educational content creator for Indian students.
    
    TARGET AUDIENCE: 
    - Indian students who want to learn interestingly without getting bored.
    - Use simple, relatable analogies (e.g., cricket, Bollywood, festivals, daily life examples like chai, traffic).
    - Tone: Friendly, conversational, enthusiastic, yet educational.
    - Avoid dry, academic jargon unless necessary (and explain it if used).

    TASK:
    Analyze the raw content below and convert it into a structured **Tiptap JSON Document**.
    You MUST return ONLY valid JSON.

    STRUCTURE RULES:
    The output must strictly follow this JSON schema:
    {
      "type": "doc",
      "content": [
         // Array of nodes
      ]
    }

    SUPPORTED NODES (use these where appropriate):

    1. Headings:
       { "type": "heading", "attrs": { "level": 1 }, "content": [{ "type": "text", "text": "Title" }] }
    
    2. Paragraphs (with formatting):
       { "type": "paragraph", "content": [
           { "type": "text", "text": "Normal text " },
           { "type": "text", "marks": [{"type": "bold"}], "text": "Bold text" },
           { "type": "text", "marks": [{"type": "italic"}], "text": "Italic text" }
       ]}

    3. Lists:
       - Bullet: { "type": "bulletList", "content": [ { "type": "listItem", "content": [ { "type": "paragraph", ... } ] } ] }
       - Ordered: { "type": "orderedList", "content": [ ... ] }

    4. Code Blocks:
       { "type": "codeBlock", "attrs": { "language": "javascript" }, "content": [{ "type": "text", "text": "console.log('Hello');" }] }

    5. Tables (Use for comparison or structured data):
       { "type": "table", "content": [
           { "type": "tableRow", "content": [
               { "type": "tableHeader", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Header 1" }] }] },
               { "type": "tableHeader", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Header 2" }] }] }
           ]},
           { "type": "tableRow", "content": [
               { "type": "tableCell", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Cell 1" }] }] },
               { "type": "tableCell", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Cell 2" }] }] }
           ]}
       ]}

    6. **INTERACTIVE NODES (CRITICAL - Use these to make it UN-BORING!)**:
       
       - **Quiz** (Insert after a key concept check):
         { "type": "quiz", "attrs": { 
             "question": "Easy question to check understanding?", 
             "options": ["Wrong 1", "Correct Answer", "Wrong 2", "Wrong 3"], 
             "correctAnswer": 1, 
             "explanation": "Simple explanation why!" 
         }}

       - **Timeline** (For history, processes, or steps):
         { "type": "timeline", "attrs": { 
             "points": [
                 { "id": 1, "title": "Step 1", "description": "Start here", "date": "Phase 1" },
                 { "id": 2, "title": "Step 2", "description": "Then this happens", "date": "Phase 2" }
             ] 
         }}

       - **Flip Cards** (For vocabulary or key concepts):
         { "type": "flipCard", "attrs": { 
             "cards": [
                 { "id": "1", "frontText": "Concept", "backText": "Definition/Analogy" }
             ] 
         }}

       - **Mind Map** (For overview or connections):
         { "type": "mindMap", "attrs": { 
             "rootNode": { 
                "id": "root", "label": "Main Topic", "children": [
                    { "id": "c1", "label": "Subtopic 1", "children": [] },
                    { "id": "c2", "label": "Subtopic 2", "children": [] }
                ]
             } 
         }}

       - **Info Hotspot** (For detailed breakdown):
         { "type": "infoHotspot", "attrs": {} } (Use sparingly, minimal attributes) or skip if complex.

    CONTENT TO PROCESS:
    ${content}
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Cleanup markdown code blocks if present to extract pure JSON
        text = text.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '');

        // Parse JSON
        const jsonContent = JSON.parse(text);

        return sanitizeContent(jsonContent);
    } catch (error) {
        console.error("Error generating content:", error);
        // Fallback or re-throw
        throw error;
    }
};

// Helper: Remove empty text nodes which crash Tiptap
const sanitizeContent = (node) => {
    if (!node) return null;

    // Remove text nodes with empty string
    if (node.type === 'text' && (!node.text || node.text === '')) {
        return null;
    }

    if (node.content && Array.isArray(node.content)) {
        node.content = node.content
            .map(child => sanitizeContent(child))
            .filter(Boolean); // Create new array with valid children

        // If a valid node ends up with empty content but requires it (like list), Tiptap might complain,
        // but 'doc' and 'paragraph' usually handle empty content arrays fine (showing placeholder).
    }

    return node;
};
