from dotenv import load_dotenv
load_dotenv()

import os
import time
import json
from fastapi import FastAPI, Request, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
import firebase_admin
from firebase_admin import credentials, auth
from utils.dynamo import save_message, get_recent_messages
from utils.gemini import get_gemini_reply
import traceback

app = FastAPI()

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
        cred = credentials.Certificate("firebase_adminsdk.json")
    firebase_admin.initialize_app(cred)

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to frontend URL in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/chat")
async def chat_handler(request: Request, authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization token missing")

    body = await request.json()
    message = body.get("message")
    chat_id = body.get("chat_id", "default")
    style = body.get("style", "auto")  # Extract style from request
    language = body.get("language", "en")  # Extract language from request

    if not message:
        raise HTTPException(status_code=400, detail="Message missing")

    try:
        token = authorization.replace("Bearer ", "")
        decoded = auth.verify_id_token(token)
        user_id = decoded["uid"]

        # Get recent messages from DynamoDB
        history = get_recent_messages(user_id, chat_id)
        prompt_parts = [f"{msg['role'].capitalize()}: {msg['message']}" for msg in history]
        prompt_parts.append(f"User: {message}")

        # Save user message
        save_message(user_id, message, "user", chat_id)

        # Gemini Response with style and language
        reply = get_gemini_reply(prompt_parts, style=style, language=language)

        # Save assistant reply
        save_message(user_id, reply, "assistant", chat_id)

        return {"reply": reply}

    except Exception as e:
        print("Exception in /chat:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
