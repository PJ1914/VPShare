from fastapi import HTTPException, Header
from firebase_admin import auth
import firebase_admin
from firebase_admin import credentials
from typing import Optional
import json
import os
import logging

logger = logging.getLogger(__name__)

# Initialize Firebase Admin SDK if not already initialized
if not firebase_admin._apps:
    try:
        # Load service account key
        service_account_path = os.path.join(os.path.dirname(__file__), '..', 'firebase_adminsdk.json')
        if os.path.exists(service_account_path):
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred)
            logger.info("Firebase Admin SDK initialized successfully")
        else:
            logger.error("Firebase service account key not found")
    except Exception as e:
        logger.error(f"Failed to initialize Firebase Admin SDK: {e}")

async def verify_user_token(authorization: str = Header(None)) -> str:
    """
    Verify Firebase ID token and return user ID
    
    Args:
        authorization: Authorization header with Bearer token
        
    Returns:
        str: User ID from verified token
        
    Raises:
        HTTPException: If token is invalid or missing
    """
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization header missing"
        )
    
    try:
        # Extract token from "Bearer <token>" format
        if not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=401,
                detail="Invalid authorization header format"
            )
        
        token = authorization.split("Bearer ")[1]
        
        # Verify the token with Firebase
        decoded_token = auth.verify_id_token(token)
        user_id = decoded_token['uid']
        
        logger.info(f"Token verified for user: {user_id}")
        return user_id
        
    except auth.InvalidIdTokenError:
        logger.error("Invalid ID token")
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token"
        )
    except auth.ExpiredIdTokenError:
        logger.error("Expired ID token")
        raise HTTPException(
            status_code=401,
            detail="Authentication token has expired"
        )
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        raise HTTPException(
            status_code=401,
            detail="Authentication failed"
        )

async def get_user_info(user_id: str) -> dict:
    """
    Get user information from Firebase Auth
    
    Args:
        user_id: User ID
        
    Returns:
        dict: User information
    """
    try:
        user_record = auth.get_user(user_id)
        return {
            'uid': user_record.uid,
            'email': user_record.email,
            'email_verified': user_record.email_verified,
            'display_name': user_record.display_name,
            'photo_url': user_record.photo_url,
            'provider_data': [
                {
                    'provider_id': provider.provider_id,
                    'uid': provider.uid,
                    'email': provider.email
                }
                for provider in user_record.provider_data
            ]
        }
    except Exception as e:
        logger.error(f"Failed to get user info: {e}")
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

def verify_admin_role(user_id: str) -> bool:
    """
    Check if user has admin role (implement based on your admin logic)
    
    Args:
        user_id: User ID to check
        
    Returns:
        bool: True if user is admin
    """
    try:
        # Get custom claims
        user_record = auth.get_user(user_id)
        custom_claims = user_record.custom_claims or {}
        return custom_claims.get('admin', False)
    except Exception as e:
        logger.error(f"Failed to check admin role: {e}")
        return False

async def require_admin_role(user_id: str = None, authorization: str = Header(None)) -> str:
    """
    Verify user token and require admin role
    
    Args:
        user_id: Optional user ID (if already verified)
        authorization: Authorization header
        
    Returns:
        str: Admin user ID
        
    Raises:
        HTTPException: If not admin or invalid token
    """
    if not user_id:
        user_id = await verify_user_token(authorization)
    
    if not verify_admin_role(user_id):
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )
    
    return user_id

def create_custom_token(user_id: str, additional_claims: dict = None) -> str:
    """
    Create custom token for user (for testing or special cases)
    
    Args:
        user_id: User ID
        additional_claims: Additional claims to include
        
    Returns:
        str: Custom token
    """
    try:
        return auth.create_custom_token(
            user_id, 
            additional_claims or {}
        ).decode('utf-8')
    except Exception as e:
        logger.error(f"Failed to create custom token: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to create authentication token"
        )

# Optional: Middleware for automatic token verification
class AuthMiddleware:
    """Middleware for automatic token verification on protected routes"""
    
    def __init__(self, protected_paths: list = None):
        self.protected_paths = protected_paths or [
            '/api/resume',
            '/api/ats',
            '/api/ai',
            '/api/user'
        ]
    
    async def __call__(self, request, call_next):
        """Process request and verify token if on protected path"""
        path = request.url.path
        
        # Check if path requires authentication
        if any(path.startswith(protected) for protected in self.protected_paths):
            authorization = request.headers.get('authorization')
            try:
                user_id = await verify_user_token(authorization)
                request.state.user_id = user_id
            except HTTPException:
                # Let the route handler deal with the authentication error
                pass
        
        response = await call_next(request)
        return response
