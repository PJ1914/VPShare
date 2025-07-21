"""
Firebase RAG System for VPShare
Integrates with Firestore collections: users, userChats, userEngagement, userProgress, playgroundActiveUsers
"""

import firebase_admin
from firebase_admin import credentials, firestore
import asyncio
from concurrent.futures import ThreadPoolExecutor
import os
from datetime import datetime, timedelta, timezone

# Initialize Firebase Admin (if not already initialized)
def initialize_firebase():
    if not firebase_admin._apps:
        try:
            # Try to get credentials from environment or service account file
            cred_path = os.getenv('FIREBASE_CREDENTIALS_PATH', './firebase_adminsdk.json')
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
        except Exception as e:
            print(f"Firebase initialization error: {e}")
            # Fallback to default credentials if available
            try:
                firebase_admin.initialize_app()
            except:
                print("Could not initialize Firebase. Some features may not work.")

# Initialize Firebase
initialize_firebase()

# Get Firestore client
try:
    db = firestore.client()
except:
    db = None
    print("Firestore client unavailable")

# Thread executor for async operations
executor = ThreadPoolExecutor(max_workers=3)

def normalize_datetime(dt_obj):
    """Normalize datetime objects to ensure they can be compared"""
    if dt_obj is None:
        return datetime.now()
    
    if isinstance(dt_obj, str):
        try:
            # Try different string formats
            if 'T' in dt_obj:
                # ISO format
                dt_obj = dt_obj.replace('Z', '+00:00')
                parsed = datetime.fromisoformat(dt_obj)
            else:
                # Simple format
                parsed = datetime.strptime(dt_obj, '%Y-%m-%d %H:%M:%S')
            
            # Make timezone naive if it's timezone aware
            if parsed.tzinfo is not None:
                parsed = parsed.replace(tzinfo=None)
            return parsed
        except:
            return datetime.now()
    
    elif isinstance(dt_obj, datetime):
        # Make timezone naive if it's timezone aware
        if dt_obj.tzinfo is not None:
            return dt_obj.replace(tzinfo=None)
        return dt_obj
    
    else:
        # For any other type, return current time
        return datetime.now()

async def get_user_profile_async(user_id):
    """Get user profile from Firestore users collection"""
    if not db:
        return {}
    
    def get_user_profile_sync():
        try:
            user_ref = db.collection('users').document(user_id)
            user_doc = user_ref.get()
            if user_doc.exists:
                return user_doc.to_dict()
            return {}
        except Exception as e:
            print(f"Error getting user profile: {e}")
            return {}
    
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(executor, get_user_profile_sync)

async def get_user_chat_history_async(user_id, limit=15):
    """Get user chat history from userChats collection"""
    if not db:
        return []
    
    def get_chat_history_sync():
        try:
            # Simple query without complex indexing for now
            chats_ref = db.collection('userChats')
            
            # Use a simple query to avoid index requirements
            # Get all chats for user and sort in Python
            user_chats = []
            docs = chats_ref.where('userId', '==', user_id).get()
            
            for doc in docs:
                chat_data = doc.to_dict()
                
                # Safely normalize timestamp
                timestamp = normalize_datetime(chat_data.get('timestamp'))
                
                user_chats.append({
                    'role': chat_data.get('role', 'user'),
                    'content': chat_data.get('message', chat_data.get('content', '')),
                    'timestamp': timestamp
                })
            
            # Sort by timestamp in Python and limit
            user_chats.sort(key=lambda x: x.get('timestamp', datetime.min), reverse=True)
            user_chats = user_chats[:limit]
            
            # Return in chronological order (oldest first)
            return list(reversed(user_chats))
            
        except Exception as e:
            print(f"Error getting chat history: {e}")
            return []
    
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(executor, get_chat_history_sync)

async def get_user_engagement_async(user_id):
    """Get user engagement data from userEngagement collection"""
    if not db:
        return {}
    
    def get_engagement_sync():
        try:
            engagement_ref = db.collection('userEngagement').document(user_id)
            engagement_doc = engagement_ref.get()
            if engagement_doc.exists:
                return engagement_doc.to_dict()
            return {}
        except Exception as e:
            print(f"Error getting user engagement: {e}")
            return {}
    
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(executor, get_engagement_sync)

async def get_user_progress_async(user_id):
    """Get user progress from userProgress collection"""
    if not db:
        return []
    
    def get_progress_sync():
        try:
            # Simplified query to avoid FieldPath issues
            progress_ref = db.collection('userProgress')
            
            # Get all documents and filter in Python
            all_docs = progress_ref.get()
            progress_data = []
            
            for doc in all_docs:
                doc_id = doc.id
                # Check if document ID starts with user_id
                if doc_id.startswith(f'{user_id}_'):
                    doc_data = doc.to_dict()
                    doc_data['progressId'] = doc_id
                    progress_data.append(doc_data)
            
            return progress_data
            
        except Exception as e:
            print(f"Error getting user progress: {e}")
            return []
    
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(executor, get_progress_sync)

async def get_user_courses_async(user_id):
    """Get user's enrolled courses from userProgress and other course data"""
    progress_data = await get_user_progress_async(user_id)
    
    courses = []
    for progress in progress_data:
        # Handle lastAccessed timestamp safely using normalize function
        last_accessed = normalize_datetime(progress.get('lastAccessed'))
        
        course_info = {
            'courseId': progress.get('courseId', ''),
            'completedSections': progress.get('completedSections', []),
            'progressPercentage': len(progress.get('completedSections', [])) * 10,  # Rough estimate
            'lastAccessed': last_accessed
        }
        courses.append(course_info)
    
    return courses

async def get_playground_activity_async(user_id):
    """Get user's playground activity from playgroundActiveUsers collection"""
    if not db:
        return {}
    
    def get_playground_sync():
        try:
            playground_ref = db.collection('playgroundActiveUsers').document(user_id)
            playground_doc = playground_ref.get()
            if playground_doc.exists:
                return playground_doc.to_dict()
            return {}
        except Exception as e:
            print(f"Error getting playground activity: {e}")
            return {}
    
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(executor, get_playground_sync)

async def update_user_activity_async(user_id, activity_data):
    """Update user activity in userEngagement collection"""
    if not db:
        return
    
    def update_activity_sync():
        try:
            engagement_ref = db.collection('userEngagement').document(user_id)
            
            # Prepare update data with normalized timestamp
            update_data = {
                'lastActive': firestore.SERVER_TIMESTAMP,
                'lastInteraction': datetime.now(),  # This will be timezone-naive
                **activity_data
            }
            
            # Update or create the document
            engagement_ref.set(update_data, merge=True)
            
        except Exception as e:
            print(f"Error updating user activity: {e}")
    
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(executor, update_activity_sync)

async def save_chat_to_firestore_async(user_id, role, message, metadata=None):
    """Save chat message to userChats collection"""
    if not db:
        return
    
    def save_chat_sync():
        try:
            chat_data = {
                'userId': user_id,
                'role': role,  # 'user' or 'assistant'
                'message': message,
                'timestamp': datetime.now(),  # Use timezone-naive datetime
                'metadata': metadata or {}
            }
            
            # Add to userChats collection
            db.collection('userChats').add(chat_data)
            
        except Exception as e:
            print(f"Error saving chat: {e}")
    
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(executor, save_chat_sync)

def analyze_user_for_rag(user_profile, chat_history, user_courses, engagement_data=None):
    """Analyze user data to create RAG context for personalized responses"""
    rag_context = []
    
    # User profile analysis
    if user_profile:
        name = user_profile.get('name', '')
        if name:
            rag_context.append(f"User's name is {name}")
        
        # Learning preferences
        if 'learningGoals' in user_profile:
            goals = user_profile['learningGoals']
            if isinstance(goals, list):
                rag_context.append(f"Learning goals: {', '.join(goals)}")
            else:
                rag_context.append(f"Learning goal: {goals}")
        
        # Skill level
        skill_level = user_profile.get('skillLevel', user_profile.get('experience', ''))
        if skill_level:
            rag_context.append(f"Skill level: {skill_level}")
        
        # Preferred languages
        if 'preferredLanguages' in user_profile:
            langs = user_profile['preferredLanguages']
            if isinstance(langs, list):
                rag_context.append(f"Interested in: {', '.join(langs)}")
        
        # Add more profile context
        if 'currentProject' in user_profile:
            rag_context.append(f"Working on: {user_profile['currentProject']}")
        
        if 'experienceLevel' in user_profile:
            rag_context.append(f"Experience: {user_profile['experienceLevel']}")
    
    # Course progress analysis
    if user_courses:
        active_courses = [course['courseId'] for course in user_courses if course.get('courseId')]
        if active_courses:
            rag_context.append(f"Currently enrolled in: {', '.join(active_courses)}")
        
        # Find most recent course activity
        if user_courses:
            try:
                # Ensure all timestamps are normalized before comparison
                valid_courses = []
                for course in user_courses:
                    normalized_time = normalize_datetime(course.get('lastAccessed'))
                    course_copy = course.copy()
                    course_copy['lastAccessed'] = normalized_time
                    valid_courses.append(course_copy)
                
                if valid_courses:
                    recent_course = max(valid_courses, key=lambda x: x.get('lastAccessed', datetime.min))
                    course_id = recent_course.get('courseId', '')
                    completion = len(recent_course.get('completedSections', []))
                    if course_id and completion > 0:
                        rag_context.append(f"Making progress in {course_id} ({completion} sections completed)")
            except Exception as e:
                print(f"Error processing recent course: {e}")
                # Skip recent course analysis if there's an error
    
    # Chat history analysis for interests and patterns
    if chat_history:
        recent_topics = []
        technical_interests = []
        question_patterns = []
        
        for chat in chat_history[-10:]:  # Last 10 messages for deeper analysis
            content = chat.get('content', '').lower()
            
            # Extract programming topics mentioned
            topics = ['python', 'javascript', 'react', 'node', 'api', 'database', 'css', 'html', 'firebase', 'aws', 'docker']
            for topic in topics:
                if topic in content and topic not in recent_topics:
                    recent_topics.append(topic)
            
            # Analyze question types
            if any(q in content for q in ['how to', 'how do', 'can you']):
                question_patterns.append('help-seeking')
            elif any(q in content for q in ['what is', 'explain', 'define']):
                question_patterns.append('learning-focused')
            elif any(q in content for q in ['error', 'bug', 'problem', 'issue']):
                question_patterns.append('debugging')
        
        if recent_topics:
            rag_context.append(f"Recently discussed: {', '.join(recent_topics[:5])}")  # Top 5 topics
        
        # Add conversation pattern insights
        if question_patterns:
            most_common = max(set(question_patterns), key=question_patterns.count)
            if most_common == 'help-seeking':
                rag_context.append("Prefers step-by-step guidance")
            elif most_common == 'learning-focused':
                rag_context.append("Enjoys detailed explanations and theory")
            elif most_common == 'debugging':
                rag_context.append("Often needs debugging assistance")
    
    # Engagement patterns
    if engagement_data:
        if 'preferredTimeOfDay' in engagement_data:
            rag_context.append(f"Most active during: {engagement_data['preferredTimeOfDay']}")
        
        if 'averageSessionLength' in engagement_data:
            session_length = engagement_data['averageSessionLength']
            if session_length > 30:
                rag_context.append("Prefers detailed, comprehensive explanations")
            else:
                rag_context.append("Prefers quick, concise answers")
        
        # Add interaction frequency context
        total_interactions = engagement_data.get('total_interactions', 0)
        if total_interactions > 50:
            rag_context.append("Experienced user with extensive chat history")
        elif total_interactions > 10:
            rag_context.append("Regular user building familiarity")
        else:
            rag_context.append("New user getting started")
    
    return rag_context

# Wrapper function for backward compatibility with the main chat system
async def get_comprehensive_user_context(user_id):
    """Get all user data for comprehensive RAG analysis"""
    try:
        # Fetch all user data in parallel
        user_profile_task = get_user_profile_async(user_id)
        chat_history_task = get_user_chat_history_async(user_id, limit=10)
        user_courses_task = get_user_courses_async(user_id)
        engagement_task = get_user_engagement_async(user_id)
        playground_task = get_playground_activity_async(user_id)
        
        # Wait for all tasks to complete
        user_profile, chat_history, user_courses, engagement_data, playground_data = await asyncio.gather(
            user_profile_task,
            chat_history_task,
            user_courses_task,
            engagement_task,
            playground_task,
            return_exceptions=True
        )
        
        # Handle any exceptions
        if isinstance(user_profile, Exception):
            user_profile = {}
        if isinstance(chat_history, Exception):
            chat_history = []
        if isinstance(user_courses, Exception):
            user_courses = []
        if isinstance(engagement_data, Exception):
            engagement_data = {}
        if isinstance(playground_data, Exception):
            playground_data = {}
        
        return {
            'profile': user_profile,
            'chat_history': chat_history,
            'courses': user_courses,
            'engagement': engagement_data,
            'playground': playground_data
        }
    
    except Exception as e:
        print(f"Error getting comprehensive user context: {e}")
        return {
            'profile': {},
            'chat_history': [],
            'courses': [],
            'engagement': {},
            'playground': {}
        }
