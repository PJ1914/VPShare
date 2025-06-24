import os
import google.generativeai as genai

# Configure Gemini API
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise EnvironmentError("GEMINI_API_KEY is not set.")
genai.configure(api_key=api_key)

model = genai.GenerativeModel("gemini-2.0-flash")

def get_style_instruction(prompt_parts, style):
    prompt_text = " ".join(prompt_parts).lower()

    if style == 'auto':
        if any(kw in prompt_text for kw in ["in short", "summarize", "brief", "shortly"]):
            return "Respond in a short and concise manner."
        elif any(kw in prompt_text for kw in ["explain in detail", "step by step", "deeply", "detailed explanation"]):
            return "Respond in a detailed and comprehensive manner."
        else:
            return ""  # Default: Gemini handles it
    elif style == 'short':
        return "Respond in a short and concise manner."
    elif style == 'detailed':
        return "Respond in a detailed and comprehensive manner."
    return ""

def get_gemini_reply(prompt_parts, style='auto', language='en'):
    # Full context about CodeTapasya platform
    system_prompt = (
        "You are CodeTapasya, the official AI assistant for the CodeTapasya platform.\n\n"
        "### 🧠 About CodeTapasya:\n"
        "- CodeTapasya is a modern, innovative learning platform focused on **programming and tech skills**.\n"
        "- It provides **project-based courses** in Python, JavaScript, Web Development, Data Science, Machine Learning, Git, and more.\n"
        "- Courses are categorized for **Beginners, Intermediate, and Advanced** learners.\n"
        "- Students can **code directly in the browser** using an in-built code playground with **multi-language support** and **instant feedback**.\n"
        "- Users can **connect their GitHub** to submit assignments and build a **public portfolio**.\n"
        "- Community features include **coding challenges**, **live events**, **mentorship**, and **student discussions**.\n"
        "- A futuristic project named **'scode'** is under development for real-time collaborative coding with AI suggestions.\n\n"
        "### 🤖 AI Assistant:\n"
        "- Your name is CodeTapasya.\n"
        "- If someone asks “Who are you?” — respond: *“I'm CodeTapasya, built by the CodeTapasya Developers.”*\n"
        "- Use **markdown**, **syntax-highlighted code blocks**, **tables**, and **hyperlinks** when appropriate.\n"
        "- Your responses should be **clear, helpful, and technically accurate**.\n"
    )

    style_instruction = get_style_instruction(prompt_parts, style)

    lang_instruction = {
        'en': "Respond in English.",
        'hi': "Respond in Hindi.",
        'te': "Respond in Telugu."
    }.get(language, "Respond in English.")

    # Combine prompt into one string (keep it short if needed)
    user_prompt = "\n".join(prompt_parts[-50:])

    full_prompt = [
        system_prompt,
        style_instruction,
        lang_instruction,
        user_prompt
    ]

    try:
        response = model.generate_content(full_prompt)
        return getattr(response, 'text', str(response))
    except Exception as e:
        return f"⚠️ Error from Gemini: {str(e)}"
