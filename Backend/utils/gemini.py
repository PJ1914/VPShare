import os
import google.generativeai as genai
from utils.dynamo import get_recent_messages_async
from utils.user_context import update_user_context, get_personalized_prompt_additions
from utils.firebase_rag import (
    get_user_profile_async, 
    get_user_chat_history_async, 
    get_user_courses_async,
    get_user_engagement_async,
    update_user_activity_async,
    analyze_user_for_rag,
    save_chat_to_firestore_async,
    get_comprehensive_user_context
)

# Configure Gemini API
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise EnvironmentError("GEMINI_API_KEY is not set.")
genai.configure(api_key=api_key)

# Simple model configuration
generation_config = {
    "temperature": 0.7,
    "top_p": 0.8,
    "top_k": 40,
    "max_output_tokens": 2048,
    "response_mime_type": "text/plain",
}

safety_settings = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
]

# System prompts for different languages - More conversational and adaptive
system_prompts = {
    "en": """You are CodeTapasya, a friendly AI programming assistant. Be conversational, helpful, and adaptive to the user's level.

Key traits:
- Be concise and natural - don't over-explain unless asked
- Adapt your response length to the user's question 
- For simple greetings, respond warmly but briefly
- For technical questions, provide focused, practical help
- Remember the conversation context
- Be encouraging and supportive
- If user says just "hello", respond with a simple greeting and ask what they're working on

Response style:
- Short questions get short answers
- Complex problems get detailed solutions
- Always be helpful but not overwhelming
- Use examples when explaining code concepts""",
    
    "hi": """आप CodeTapasya हैं, एक मित्रवत AI प्रोग्रामिंग सहायक। बातचीत में प्राकृतिक और उपयोगकर्ता के स्तर के अनुकूल रहें।

मुख्य गुण:
- संक्षिप्त और स्वाभाविक रहें - जब तक न पूछा जाए, अधिक व्याख्या न करें
- उपयोगकर्ता के प्रश्न के अनुसार अपने उत्तर की लंबाई समायोजित करें
- सरल अभिवादन के लिए, गर्मजोशी से लेकिन संक्षेप में जवाब दें""",
    
    "te": """మీరు CodeTapasya, స్నేహపూర్వక AI ప్రోగ్రామింగ్ సహాయకుడు. సంభాషణాత్మకంగా, సహాయకరంగా మరియు వినియోగదారు స్థాయికి అనుగుణంగా ఉండండి।

ముఖ్య లక్షణాలు:
- సంక్షిప్తంగా మరియు సహజంగా ఉండండి - అడగకపోతే అధిక వివరణ ఇవ్వకండి
- వినియోగదారు ప్రశ్న ప్రకారం మీ సమాధానం పొడవు సర్దుబాటు చేయండి"""
}

def analyze_user_intent(message, recent_messages):
    """Analyze user intent and conversation context for better responses"""
    message_lower = message.lower().strip()
    
    # Count recent interactions
    recent_count = len(recent_messages)
    
    # Simple greeting detection
    greetings = ['hello', 'hi', 'hey', 'hola', 'namaste', 'good morning', 'good afternoon']
    is_greeting = any(greeting in message_lower for greeting in greetings)
    
    # Identity questions
    identity_questions = ['who are you', 'what are you', 'do you know me', 'who is this']
    is_identity = any(q in message_lower for q in identity_questions)
    
    # Technical keywords
    tech_keywords = ['python', 'javascript', 'code', 'function', 'error', 'debug', 'help', 'learn', 'tutorial']
    is_technical = any(keyword in message_lower for keyword in tech_keywords)
    
    # Determine response style
    if recent_count == 0 and is_greeting:
        return "first_greeting"
    elif is_greeting and recent_count > 0:
        return "repeated_greeting"
    elif is_identity:
        return "identity_question"
    elif is_technical:
        return "technical_question"
    elif len(message.split()) <= 3:
        return "short_question"
    else:
        return "general_question"

def get_contextual_prompt(message, recent_messages, language, intent):
    """Create a contextual prompt based on user intent and history"""
    
    # Build conversation context
    conversation_history = ""
    if recent_messages:
        for msg in recent_messages[-4:]:  # Last 4 messages for context
            role = "User" if msg['role'] == 'user' else "Assistant"
            conversation_history += f"{role}: {msg['content']}\n"
    
    # Create intent-specific prompts
    intent_prompts = {
        "first_greeting": f"User just said '{message}' for the first time. Respond with a brief, friendly greeting and ask what they're working on today. Keep it short and welcoming.",
        
        "repeated_greeting": f"User said '{message}' again. They might be testing or unsure what to ask. Respond briefly and encourage them to share what they need help with.",
        
        "identity_question": f"User asked '{message}'. Give a brief, friendly introduction as CodeTapasya and ask what you can help them with today. Don't be overly detailed.",
        
        "technical_question": f"User has a technical question: '{message}'. Provide a focused, helpful answer. Be practical and include examples if relevant.",
        
        "short_question": f"User asked a short question: '{message}'. Give a concise, direct answer. Don't over-explain unless they ask for more details.",
        
        "general_question": f"User asked: '{message}'. Provide a helpful, appropriately detailed response based on their question."
    }
    
    base_prompt = intent_prompts.get(intent, intent_prompts["general_question"])
    
    # Add conversation context if available
    if conversation_history:
        full_prompt = f"""Previous conversation:
{conversation_history}

Context: {base_prompt}

Respond naturally and helpfully. Keep your tone conversational and adaptive to the user's needs."""
    else:
        full_prompt = f"""Context: {base_prompt}

Respond naturally and helpfully. Keep your tone conversational."""
    
    return full_prompt

async def get_gemini_reply(message, user_id, language="en", chat_id="default"):
    """Enhanced implementation with comprehensive Firebase RAG integration"""
    try:
        # Get comprehensive user data from Firebase
        user_data = await get_comprehensive_user_context(user_id)
        user_profile = user_data['profile']
        firebase_chat_history = user_data['chat_history']
        user_courses = user_data['courses']
        engagement_data = user_data['engagement']
        
        # Also get DynamoDB messages for backup
        try:
            dynamo_messages = await get_recent_messages_async(user_id, chat_id, limit=10)
        except:
            dynamo_messages = []
        
        # Use Firebase history if available, otherwise fall back to DynamoDB
        recent_messages = firebase_chat_history if firebase_chat_history else dynamo_messages
        
        # Update user context for personalization
        user_context = update_user_context(user_id, message)
        
        # Analyze user intent
        intent = analyze_user_intent(message, recent_messages)
        
        # Create comprehensive RAG context
        rag_context = analyze_user_for_rag(user_profile, firebase_chat_history, user_courses, engagement_data)
        
        # Create enhanced contextual prompt
        contextual_prompt = get_enhanced_contextual_prompt(
            message, recent_messages, language, intent, user_profile, rag_context
        )
        
        # Add personalized context from simple system
        personalization = get_personalized_prompt_additions(user_context)
        if personalization:
            contextual_prompt += f"\n\nAdditional context: {'; '.join(personalization)}"
        
        # Get the model with improved system instruction
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config=generation_config,
            safety_settings=safety_settings,
            system_instruction=system_prompts.get(language, system_prompts["en"])
        )
        
        # Generate response with enhanced contextual prompt
        response = model.generate_content(contextual_prompt)
        
        # Save user message to Firebase
        await save_chat_to_firestore_async(user_id, 'user', message, {'intent': intent})
        
        # Process response
        if response and response.text:
            response_text = response.text.strip()
            
            # Save AI response to Firebase
            await save_chat_to_firestore_async(user_id, 'assistant', response_text, {'model': 'gemini-1.5-flash'})
            
            # Update user activity in Firebase with more detailed data
            activity_data = {
                'last_message_topic': intent,
                'last_message_length': len(message),
                'response_length': len(response_text),
                'interaction_timestamp': 'server_timestamp',
                'total_interactions': engagement_data.get('total_interactions', 0) + 1
            }
            await update_user_activity_async(user_id, activity_data)
            
            return response_text
        else:
            # Personalized fallback responses
            user_name = user_profile.get('name', 'there') if user_profile else 'there'
            fallback_responses = {
                "first_greeting": f"Hello {user_name}! I'm CodeTapasya. What can I help you code today?",
                "repeated_greeting": f"Hi again {user_name}! What would you like to work on?",
                "identity_question": f"I'm CodeTapasya, your coding assistant. Nice to meet you {user_name}! What can I help you build or learn?",
                "technical_question": f"I'm here to help with your coding question, {user_name}. Could you provide more details?",
                "short_question": f"I'm here to help, {user_name}! Could you tell me more about what you need?",
                "general_question": f"I'm ready to help, {user_name}! What would you like to work on?"
            }
            fallback_response = fallback_responses.get(intent, f"How can I help you today, {user_name}?")
            
            # Save fallback response to Firebase
            await save_chat_to_firestore_async(user_id, 'assistant', fallback_response, {'type': 'fallback'})
            
            return fallback_response
    
    except Exception as e:
        print(f"Error in get_gemini_reply: {e}")
        # Contextual error responses
        error_responses = {
            "en": "I'm having some technical difficulties. Could you try asking again?",
            "hi": "मुझे कुछ तकनीकी समस्या हो रही है। क्या आप फिर से पूछ सकते हैं?",
            "te": "నాకు కొన్ని సాంకేతిక ఇబ్బందులు ఉన్నాయి. దయచేసి మళ్లీ అడగండి?"
        }
        error_message = error_responses.get(language, error_responses["en"])
        
        # Try to save error occurrence to Firebase
        try:
            await save_chat_to_firestore_async(user_id, 'assistant', error_message, {'type': 'error', 'error': str(e)})
        except:
            pass
        
        return error_message

def get_enhanced_contextual_prompt(message, recent_messages, language, intent, user_profile, rag_context):
    """Create enhanced contextual prompt with Firebase RAG data"""
    
    # Build conversation context
    conversation_history = ""
    if recent_messages:
        for msg in recent_messages[-6:]:  # Last 6 messages for context
            role = "User" if msg['role'] == 'user' else "Assistant"
            conversation_history += f"{role}: {msg['content']}\n"
    
    # Get user name for personalization
    user_name = user_profile.get('name', 'User') if user_profile else 'User'
    
    # Create enhanced intent-specific prompts
    intent_prompts = {
        "first_greeting": f"User {user_name} just said '{message}' for the first time. Respond with a brief, friendly, personalized greeting using their name and ask what they're working on today. Keep it short and welcoming.",
        
        "repeated_greeting": f"User {user_name} said '{message}' again. They might be testing or unsure what to ask. Respond briefly using their name and encourage them to share what they need help with.",
        
        "identity_question": f"User {user_name} asked '{message}'. Give a brief, friendly introduction as CodeTapasya, acknowledge them by name, and ask what you can help them with today. Don't be overly detailed.",
        
        "technical_question": f"User {user_name} has a technical question: '{message}'. Provide a focused, helpful answer considering their background. Be practical and include examples if relevant.",
        
        "short_question": f"User {user_name} asked a short question: '{message}'. Give a concise, direct answer using their name. Don't over-explain unless they ask for more details.",
        
        "general_question": f"User {user_name} asked: '{message}'. Provide a helpful, appropriately detailed response based on their question and background."
    }
    
    base_prompt = intent_prompts.get(intent, intent_prompts["general_question"])
    
    # Add RAG context if available
    rag_info = ""
    if rag_context:
        rag_info = f"\n\nPersonalized user context:\n- " + "\n- ".join(rag_context)
    
    # Build the full prompt
    if conversation_history:
        full_prompt = f"""Previous conversation:
{conversation_history}

Context: {base_prompt}{rag_info}

Respond naturally and helpfully. Use the user's name when appropriate. Keep your tone conversational and adaptive to their skill level and interests."""
    else:
        full_prompt = f"""Context: {base_prompt}{rag_info}

Respond naturally and helpfully. Use the user's name when appropriate. Keep your tone conversational and adaptive to their background."""
    
    return full_prompt
