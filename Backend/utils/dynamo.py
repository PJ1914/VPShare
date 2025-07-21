import os
import time
import boto3
import asyncio
import concurrent.futures
from boto3.dynamodb.conditions import Key
import logging

# Configure logging
logger = logging.getLogger(__name__)

try:
    dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
    table_name = os.getenv("DYNAMO_TABLE")
    if not table_name:
        logger.warning("DYNAMO_TABLE environment variable not set")
        table = None
    else:
        table = dynamodb.Table(table_name)
except Exception as e:
    logger.error(f"Failed to initialize DynamoDB: {e}")
    table = None

# Thread pool for running blocking database operations
executor = concurrent.futures.ThreadPoolExecutor(max_workers=5)

def save_message(user_id, message, role, chat_id="default"):
    if not table:
        logger.warning("DynamoDB table not available, skipping message save")
        return
    
    try:
        # Create the item to save
        item = {
            "user_id": user_id,
            "timestamp": str(int(time.time())),  # store as string for DynamoDB
            "role": role,
            "message": message,
            "chat_id": chat_id
        }
        
        # Try to save the message
        table.put_item(Item=item)
        logger.info(f"Successfully saved message for user {user_id}, chat {chat_id}")
        
        # Optional: Clean up old messages (limit to 50 per user per chat)
        try:
            history = get_recent_messages(user_id, chat_id, limit=60)  # Get more to check if cleanup needed
            if len(history) >= 50:
                # Delete the oldest message
                oldest = min(history, key=lambda x: int(x["timestamp"]))
                table.delete_item(Key={"user_id": user_id, "timestamp": oldest["timestamp"]})
                logger.info(f"Cleaned up old message for user {user_id}")
        except Exception as cleanup_error:
            logger.warning(f"Failed to cleanup old messages: {cleanup_error}")
            
    except Exception as e:
        logger.error(f"Failed to save message to DynamoDB: {e}")
        print(f"Failed to save message to DynamoDB: {e}")

def get_recent_messages(user_id, chat_id, limit=10):
    if not table:
        logger.warning("DynamoDB table not available, returning empty history")
        return []
    
    try:
        # Query by user_id (primary key) and filter by chat_id
        response = table.query(
            KeyConditionExpression=Key("user_id").eq(user_id),
            ScanIndexForward=False  # Get newest messages first
        )
        
        # Filter by chat_id and get the most recent messages for this chat
        all_items = response.get("Items", [])
        chat_messages = [item for item in all_items if item.get("chat_id") == chat_id]
        
        # Sort by timestamp and get last messages
        sorted_messages = sorted(chat_messages, key=lambda x: int(x.get("timestamp", "0")))
        messages = sorted_messages[-limit:] if len(sorted_messages) > limit else sorted_messages
        
        logger.info(f"Retrieved {len(messages)} messages for user {user_id}, chat {chat_id}")
        
        # Format messages for consistency
        formatted_messages = []
        for msg in messages:
            formatted_messages.append({
                "role": msg.get("role", "user"),
                "content": msg.get("message", ""),
                "timestamp": msg.get("timestamp", "0"),
                "chat_id": msg.get("chat_id", "default")
            })
            
        return formatted_messages
            
    except Exception as e:
        logger.error(f"Failed to get recent messages from DynamoDB: {e}")
        print(f"Failed to get recent messages from DynamoDB: {e}")
        return []

def get_course_information(course_name: str = None):
    """
    Retrieves information about courses offered on the CodeTapasya platform.
    If a course_name is provided, it searches for that specific course.
    Otherwise, it returns a list of all available courses.
    """
    try:
        # Use a separate table for courses (LearningPlatform)
        if not dynamodb:
            return "Course information service is currently unavailable: DynamoDB not initialized"
        
        learning_table = dynamodb.Table("LearningPlatform")
        
        if course_name:
            # Search for a specific course by name (case-insensitive partial match)
            response = learning_table.scan(
                FilterExpression="contains(#title, :name)",
                ExpressionAttributeNames={"#title": "title"},
                ExpressionAttributeValues={
                    ":name": course_name.lower()
                }
            )
            items = response.get("Items", [])
            if not items:
                return f"No course found with the name '{course_name}'. Try searching for available courses without specifying a name."
            
            # Format course information nicely
            course_info = []
            for item in items:
                info = f"**{item.get('title', 'Unknown')}**\n"
                info += f"- Level: {item.get('level', 'Not specified')}\n"
                info += f"- Description: {item.get('description', 'No description available')}\n"
                if 'prerequisites' in item:
                    info += f"- Prerequisites: {item['prerequisites']}\n"
                if 'duration' in item:
                    info += f"- Duration: {item['duration']}\n"
                if 'modules' in item and isinstance(item['modules'], list):
                    info += f"- Modules: {len(item['modules'])} modules available\n"
                    # Show first few module names
                    module_names = [mod.get('name', 'Unnamed') for mod in item['modules'][:3]]
                    if module_names:
                        info += f"  - Sample modules: {', '.join(module_names)}\n"
                if 'category' in item:
                    info += f"- Category: {item['category']}\n"
                course_info.append(info)
            
            return "\n\n".join(course_info)
        else:
            # Get all available courses
            response = learning_table.scan()
            courses = []
            for item in response.get("Items", []):
                course_title = item.get('title', 'Unknown Course')
                course_level = item.get('level', 'Unknown Level')
                course_category = item.get('category', 'General')
                module_count = len(item.get('modules', [])) if 'modules' in item else 0
                
                course_line = f"- **{course_title}** ({course_level})"
                if course_category != 'General':
                    course_line += f" - {course_category}"
                if module_count > 0:
                    course_line += f" - {module_count} modules"
                courses.append(course_line)
            
            if not courses:
                return "No courses are currently available in the database."
            
            return f"**Available Courses on CodeTapasya Learning Platform:**\n\n" + "\n".join(courses)
    
    except Exception as e:
        return f"Error retrieving course information: {str(e)}"

# Async wrappers for non-blocking database operations
async def save_message_async(user_id, message, role, chat_id="default"):
    """Async wrapper for save_message to avoid blocking the event loop"""
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(executor, save_message, user_id, message, role, chat_id)

async def get_recent_messages_async(user_id, chat_id, limit=10):
    """Async wrapper for get_recent_messages to avoid blocking the event loop"""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(executor, get_recent_messages, user_id, chat_id, limit)
