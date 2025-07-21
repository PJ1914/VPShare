import json
import os
from datetime import datetime
import asyncio
import concurrent.futures

# Simple in-memory user context store (in production, use Redis or database)
user_contexts = {}

class UserContext:
    def __init__(self, user_id):
        self.user_id = user_id
        self.preferences = {
            "response_style": "auto",  # auto, concise, detailed
            "skill_level": "unknown",  # beginner, intermediate, advanced
            "primary_languages": [],   # [python, javascript, etc.]
            "recent_topics": [],       # Recent topics discussed
            "interaction_count": 0
        }
        self.last_updated = datetime.now()
    
    def update_from_message(self, message):
        """Update user context based on message content"""
        message_lower = message.lower()
        
        # Detect programming languages mentioned
        languages = {
            'python': ['python', 'py', 'django', 'flask', 'pandas'],
            'javascript': ['javascript', 'js', 'node', 'react', 'vue', 'angular'],
            'java': ['java', 'spring', 'maven'],
            'cpp': ['c++', 'cpp', 'c plus'],
            'html': ['html', 'css', 'bootstrap'],
            'sql': ['sql', 'database', 'mysql', 'postgresql']
        }
        
        for lang, keywords in languages.items():
            if any(keyword in message_lower for keyword in keywords):
                if lang not in self.preferences["primary_languages"]:
                    self.preferences["primary_languages"].append(lang)
        
        # Detect skill level indicators
        beginner_indicators = ['learn', 'start', 'begin', 'new to', 'tutorial', 'basic']
        advanced_indicators = ['optimize', 'performance', 'architecture', 'design pattern', 'scalability']
        
        if any(indicator in message_lower for indicator in beginner_indicators):
            self.preferences["skill_level"] = "beginner"
        elif any(indicator in message_lower for indicator in advanced_indicators):
            self.preferences["skill_level"] = "advanced"
        elif self.preferences["skill_level"] == "unknown":
            self.preferences["skill_level"] = "intermediate"
        
        # Detect response style preference
        if any(word in message_lower for word in ['brief', 'short', 'quick', 'summary']):
            self.preferences["response_style"] = "concise"
        elif any(word in message_lower for word in ['detail', 'explain', 'step by step', 'thorough']):
            self.preferences["response_style"] = "detailed"
        
        self.preferences["interaction_count"] += 1
        self.last_updated = datetime.now()

def get_user_context(user_id):
    """Get or create user context"""
    if user_id not in user_contexts:
        user_contexts[user_id] = UserContext(user_id)
    return user_contexts[user_id]

def update_user_context(user_id, message):
    """Update user context based on message"""
    context = get_user_context(user_id)
    context.update_from_message(message)
    return context

def get_personalized_prompt_additions(user_context):
    """Generate personalized prompt additions based on user context"""
    additions = []
    
    if user_context.preferences["skill_level"] != "unknown":
        additions.append(f"User skill level: {user_context.preferences['skill_level']}")
    
    if user_context.preferences["primary_languages"]:
        langs = ", ".join(user_context.preferences["primary_languages"])
        additions.append(f"User's known languages: {langs}")
    
    if user_context.preferences["response_style"] != "auto":
        additions.append(f"Preferred response style: {user_context.preferences['response_style']}")
    
    if user_context.preferences["interaction_count"] < 3:
        additions.append("This is a new user - be extra welcoming and helpful")
    
    return additions
