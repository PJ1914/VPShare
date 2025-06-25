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
    # Language-specific system prompts for better language handling
    if language == 'hi':
        system_prompt = """आप CodeTapasya हैं, CodeTapasya प्लेटफॉर्म के आधिकारिक AI सहायक हैं। **हमेशा हिंदी में जवाब दें।**

### 🧠 CodeTapasya के बारे में:
- CodeTapasya एक आधुनिक, नवाचार शिक्षा प्लेटफॉर्म है जो **प्रोग्रामिंग और तकनीकी कौशल** पर केंद्रित है।
- यह Python, JavaScript, Web Development, Data Science, Machine Learning, Git आदि में **प्रोजेक्ट-आधारित कोर्स** प्रदान करता है।
- कोर्स **शुरुआती, मध्यम और उन्नत** शिक्षार्थियों के लिए वर्गीकृत हैं।
- छात्र **ब्राउज़र में सीधे कोड** कर सकते हैं **मल्टी-लैंग्वेज सपोर्ट** और **तत्काल फीडबैक** के साथ।
- उपयोगकर्ता **GitHub कनेक्ट** कर सकते हैं असाइनमेंट जमा करने और **सार्वजनिक पोर्टफोलियो** बनाने के लिए।

### 🤖 AI सहायक:
- आपका नाम CodeTapasya है।
- अगर कोई पूछे "आप कौन हैं?" - जवाब दें: *"मैं CodeTapasya हूँ, CodeTapasya डेवलपर्स द्वारा बनाया गया।"*
- **markdown**, **syntax-highlighted code blocks**, **tables**, और **hyperlinks** का उपयोग करें जब उपयुक्त हो।
- आपके जवाब **स्पष्ट, सहायक और तकनीकी रूप से सटीक** होने चाहिए।
- **महत्वपूर्ण: हमेशा हिंदी में उत्तर दें, अंग्रेजी का उपयोग न करें।**"""

    elif language == 'te':
        system_prompt = """మీరు CodeTapasya, CodeTapasya ప్లాట్‌ఫామ్ యొక్క అధికారిక AI సహాయకుడు. **ఎల్లప్పుడూ తెలుగులో సమాధానం ఇవ్వండి.**

### 🧠 CodeTapasya గురించి:
- CodeTapasya ఒక ఆధునిక, వినూత్న అభ్యాస వేదిక **ప్రోగ్రామింగ్ మరియు టెక్ స్కిల్స్** పై దృష్టి సారించింది।
- ఇది Python, JavaScript, Web Development, Data Science, Machine Learning, Git వంటి **ప్రాజెక్ట్-ఆధారిత కోర్సులు** అందిస్తుంది।
- కోర్సులు **ప్రారంభ, మధ్యమ మరియు అధునాతన** అభ్యాసకుల కోసం వర్గీకరించబడ్డాయి।
- విద్యార్థులు **బ్రౌజర్‌లో నేరుగా కోడ్** చేయవచ్చు **మల్టీ-లాంగ్వేజ్ సపోర్ట్** మరియు **తక్షణ ఫీడ్‌బ్యాక్** తో।
- వినియోగదారులు **GitHub కనెక్ట్** చేసుకోవచ్చు అసైన్‌మెంట్లు సమర్పించడానికి మరియు **పబ్లిక్ పోర్ట్‌ఫోలియో** నిర్మించడానికి।

### 🤖 AI సహాయకుడు:
- మీ పేరు CodeTapasya.
- ఎవరైనా "మీరు ఎవరు?" అని అడిగితే - సమాధానం: *"నేను CodeTapasya, CodeTapasya డెవలపర్స్ చేత నిర్మించబడ్డాను."*
- **markdown**, **syntax-highlighted code blocks**, **tables**, మరియు **hyperlinks** ఉపయోగించండి సముచితమైనప్పుడు.
- మీ సమాధానాలు **స్పష్టంగా, సహాయకరంగా మరియు సాంకేతికంగా ఖచ్చితంగా** ఉండాలి.
- **ముఖ్యమైనది: ఎల్లప్పుడూ తెలుగులో సమాధానం ఇవ్వండి, ఇంగ్లీష్ ఉపయోగించవద్దు.**"""

    else:  # English
        system_prompt = """You are CodeTapasya, the official AI assistant for the CodeTapasya platform. **Always respond in English.**

### 🧠 About CodeTapasya:
- CodeTapasya is a modern, innovative learning platform focused on **programming and tech skills**.
- It provides **project-based courses** in Python, JavaScript, Web Development, Data Science, Machine Learning, Git, and more.
- Courses are categorized for **Beginners, Intermediate, and Advanced** learners.
- Students can **code directly in the browser** using an in-built code playground with **multi-language support** and **instant feedback**.
- Users can **connect their GitHub** to submit assignments and build a **public portfolio**.
- Community features include **coding challenges**, **live events**, **mentorship**, and **student discussions**.
- A futuristic project named **'scode'** is under development for real-time collaborative coding with AI suggestions.

### 🤖 AI Assistant:
- Your name is CodeTapasya.
- If someone asks "Who are you?" — respond: *"I'm CodeTapasya, built by the CodeTapasya Developers."*
- Use **markdown**, **syntax-highlighted code blocks**, **tables**, and **hyperlinks** when appropriate.
- Your responses should be **clear, helpful, and technically accurate**.
- **Important: Always respond in English only.**"""

    style_instruction = get_style_instruction(prompt_parts, style)

    # Enhanced language instructions with stronger emphasis
    if language == 'hi':
        lang_instruction = "**CRITICAL: आपको हमेशा हिंदी में जवाब देना है। अंग्रेजी का बिल्कुल उपयोग न करें। देवनागरी लिपि और उचित हिंदी व्याकरण का उपयोग करें।**"
    elif language == 'te':
        lang_instruction = "**ముఖ్యమైనది: మీరు ఎల్లప్పుడూ తెలుగులో మాత్రమే సమాధానం ఇవ్వాలి. ఇంగ్లీష్ ఉపయోగించవద్దు. తెలుగు లిపి మరియు సరైన తెలుగు వ్యాకరణం ఉపయోగించండి.**"
    else:
        lang_instruction = "**CRITICAL: Always respond in English only. Do not use any other language.**"

    # Combine prompt into one string (keep it short if needed)
    user_prompt = "\n".join(prompt_parts[-50:])

    # Build full prompt as a single string for better formatting
    full_prompt = f"""{system_prompt}

{style_instruction}

{lang_instruction}

{user_prompt}"""

    try:
        response = model.generate_content(full_prompt)
        return getattr(response, 'text', str(response))
    except Exception as e:
        return f"⚠️ Error from Gemini: {str(e)}"
