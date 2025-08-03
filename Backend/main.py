from dotenv import load_dotenv
load_dotenv()

import os
import time
import json
import asyncio
from fastapi import FastAPI, Request, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import firebase_admin
from firebase_admin import credentials, auth
from utils.dynamo import save_message_async, get_recent_messages_async
from utils.gemini import get_gemini_reply

# Import route modules
from routes.resume_routes import resume_router
from routes.ats_routes import ats_router
from routes.ai_routes import ai_router

app = FastAPI(
    title="VPShare API",
    description="AI-powered resume builder and ATS checker",
    version="1.0.0"
)

# Firebase Admin SDK Init
if not firebase_admin._apps:
    # Load credentials from environment or fallback to file
    service_account_json = os.getenv("FIREBASE_ADMINSDK_JSON")
    if service_account_json:
        try:
            sa_info = json.loads(service_account_json)
            cred = credentials.Certificate(sa_info)
        except Exception as e:
            print("Error loading Firebase credentials from env:", e)
            raise
    else:
        cred = credentials.Certificate('firebase_adminsdk.json')
    
    firebase_admin.initialize_app(cred)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/test")
async def test():
    return {"message": "Server is running!"}

@app.post("/chat")
async def chat(request: Request, authorization: str = Header(None)):
    try:
        # For development - bypass auth
        bypass_auth = os.getenv("BYPASS_AUTH", "false").lower() == "true"
        
        if not bypass_auth:
            if not authorization or not authorization.startswith("Bearer "):
                raise HTTPException(status_code=401, detail="Invalid authorization header")
            
            token = authorization.split(" ")[1]
            try:
                decoded_token = auth.verify_id_token(token)
                user_id = decoded_token['uid']
            except Exception as e:
                print(f"Token verification failed: {e}")
                raise HTTPException(status_code=401, detail="Invalid token")
        else:
            user_id = "dev_user"

        body = await request.json()
        message = body.get("message", "")
        chat_id = body.get("chat_id", "default")
        language = body.get("language", "en")
        
        if not message:
            raise HTTPException(status_code=400, detail="Message is required")

        # Save the user message first
        await save_message_async(user_id, message, "user", chat_id)

        # Create streaming response
        async def generate_response():
            try:
                # Get AI reply using simple implementation
                assistant_reply = await get_gemini_reply(message, user_id, language, chat_id)
                
                # Save the assistant message
                await save_message_async(user_id, assistant_reply, "assistant", chat_id)
                
                # Stream the response in chunks for frontend animation
                words = assistant_reply.split()
                chunk_size = 3  # Send 3 words at a time
                
                for i in range(0, len(words), chunk_size):
                    chunk = " ".join(words[i:i + chunk_size])
                    if i + chunk_size < len(words):
                        chunk += " "
                    
                    yield f"data: {json.dumps({'text': chunk})}\n\n"
                    await asyncio.sleep(0.05)  # Small delay for animation effect
                
                # Send completion signal
                yield f"data: {json.dumps({'done': True})}\n\n"
                
            except Exception as e:
                print(f"Error generating response: {e}")
                error_message = "I encountered an error while processing your request. Please try again."
                if language == 'hi':
                    error_message = "आपके अनुरोध को संसाधित करते समय मुझे एक त्रुटि आई। कृपया पुनः प्रयास करें।"
                elif language == 'te':
                    error_message = "మీ అభ్యర్థనను ప్రాసెసింగ్ చేస్తున్నప్పుడు నాకు లోపం వచ్చింది. దయచేసి మళ్లీ ప్రయత్నించండి।"
                
                yield f"data: {json.dumps({'text': error_message})}\n\n"
                yield f"data: {json.dumps({'done': True})}\n\n"

        return StreamingResponse(
            generate_response(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        error_message = "I encountered an error while processing your request. Please try again."
        
        # Return streaming error response
        async def error_response():
            yield f"data: {json.dumps({'text': error_message})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"
        
        return StreamingResponse(
            error_response(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive"
            }
        )

@app.get("/chat/history/{chat_id}")
async def get_chat_history(chat_id: str, authorization: str = Header(None)):
    try:
        bypass_auth = os.getenv("BYPASS_AUTH", "false").lower() == "true"
        
        if not bypass_auth:
            if not authorization or not authorization.startswith("Bearer "):
                raise HTTPException(status_code=401, detail="Invalid authorization header")
            
            token = authorization.split(" ")[1]
            try:
                decoded_token = auth.verify_id_token(token)
                user_id = decoded_token['uid']
            except Exception as e:
                print(f"Token verification failed: {e}")
                raise HTTPException(status_code=401, detail="Invalid token")
        else:
            user_id = "dev_user"

        messages = await get_recent_messages_async(user_id, chat_id, limit=50)
        return {"messages": messages}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting chat history: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving chat history")

# Include routers with prefixes
app.include_router(resume_router, prefix="/api/resume", tags=["Resume"])
app.include_router(ats_router, prefix="/api/ats", tags=["ATS"])
app.include_router(ai_router, prefix="/api/ai", tags=["AI"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
