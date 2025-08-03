import json
import boto3
import logging
import time
import traceback
import os
import urllib.request
import urllib.parse
import base64
import hmac
import hashlib
from botocore.exceptions import ClientError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

RAZORPAY_KEY_ID = os.environ.get("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.environ.get("RAZORPAY_KEY_SECRET")
FIREBASE_API_KEY = os.environ.get("FIREBASE_API_KEY")

def cors_headers(content_type="application/json"):
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Content-Type": content_type
    }

def verify_firebase_token(auth_token):
    try:
        if not auth_token:
            logger.warning("No Authorization header.")
            return False, "No Authorization header"
        token = auth_token.replace("Bearer ", "")
        url = f"https://identitytoolkit.googleapis.com/v1/accounts:lookup?key={FIREBASE_API_KEY}"
        data = json.dumps({"idToken": token}).encode('utf-8')
        headers = {'Content-Type': 'application/json'}
        req = urllib.request.Request(url, data=data, headers=headers, method='POST')
        with urllib.request.urlopen(req) as response:
            response_body = response.read().decode('utf-8')
            status_code = response.getcode()
            if status_code != 200:
                error_message = json.loads(response_body).get("error", {}).get("message", "Invalid token")
                logger.error(f"Firebase token verification failed: {error_message}")
                return False, error_message
            data = json.loads(response_body)
            if "users" not in data or not data["users"]:
                logger.warning("No user found.")
                return False, "No user found"
            user_id = data["users"][0]["localId"]
            logger.info(f"Firebase token verified for user: {user_id}")
            return True, user_id
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        logger.error(f"Firebase HTTP error: {e.code} - {error_body}")
        try:
            error_json = json.loads(error_body)
            return False, error_json.get("error", {}).get("message", f"HTTP Error {e.code}")
        except json.JSONDecodeError:
            return False, f"HTTP Error {e.code}: {error_body}"
    except Exception as e:
        logger.error(f"Unexpected error in verify_firebase_token: {str(e)}\n{traceback.format_exc()}")
        return False, str(e)

def verify_razorpay_signature(payment_id, order_id, signature, secret):
    """Verify Razorpay payment signature"""
    try:
        body = order_id + "|" + payment_id
        expected_signature = hmac.new(
            secret.encode('utf-8'),
            body.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(expected_signature, signature)
    except Exception as e:
        logger.error(f"Error verifying signature: {e}")
        return False

def lambda_handler(event, context):
    start_time = time.time()
    logger.info("verify-payment invoked with event: %s", json.dumps(event, default=str))

    http_method = None
    headers = {}
    body_str = '{}'

    # Parse event based on different API Gateway formats
    if 'httpMethod' in event:
        http_method = event['httpMethod']  # REST API (V1)
        raw_headers = event.get('headers') or {}
        headers = {k.lower(): v for k, v in raw_headers.items()}
        body_str = event.get('body', '{}')
    elif 'requestContext' in event and 'http' in event['requestContext']:
        http_method = event['requestContext']['http'].get('method')  # HTTP API (V2)
        raw_headers = event.get('headers') or {}
        headers = {k.lower(): v for k, v in raw_headers.items()}
        body_str = event.get('body', '{}')
    elif 'routeKey' in event:
        http_method = event['routeKey'].split(' ')[0]  # HTTP API (V2) routeKey
        raw_headers = event.get('headers') or {}
        headers = {k.lower(): v for k, v in raw_headers.items()}
        body_str = event.get('body', '{}')
    else:
        # Direct invocation or unknown format
        http_method = 'POST'
        headers = {}
        body_str = json.dumps(event)

    logger.info("HTTP method: %s", http_method)

    try:
        if http_method == 'OPTIONS':
            logger.info("Handling OPTIONS preflight")
            return {
                'statusCode': 200,
                'headers': cors_headers(),
                'body': ""
            }

        if http_method != 'POST':
            logger.error("Invalid HTTP method: %s", http_method)
            return {
                'statusCode': 405,
                'headers': cors_headers(),
                'body': json.dumps({'error': 'Method not allowed'})
            }

        # Verify Firebase authentication
        auth_header = headers.get('authorization', '')
        is_valid, result = verify_firebase_token(auth_header)
        if not is_valid:
            logger.error("Invalid Firebase token: %s", result)
            return {
                'statusCode': 403,
                'headers': cors_headers(),
                'body': json.dumps({'error': f"Authentication error: {result}"})
            }
        user_id = result
        logger.info("Authenticated user_id: %s", user_id)

        # Parse request body
        if event.get('isBase64Encoded', False):
            body_str = base64.b64decode(body_str).decode('utf-8')
        body = json.loads(body_str)
        
        # Extract payment details
        payment_id = body.get('razorpay_payment_id')
        order_id = body.get('razorpay_order_id')
        signature = body.get('razorpay_signature')
        payment_type = body.get('payment_type', 'subscription')  # Default to subscription
        
        if not all([payment_id, order_id, signature]):
            logger.error("Missing required payment verification fields")
            return {
                'statusCode': 400,
                'headers': cors_headers(),
                'body': json.dumps({'error': 'Missing payment verification data'})
            }

        # Verify Razorpay signature
        if not verify_razorpay_signature(payment_id, order_id, signature, RAZORPAY_KEY_SECRET):
            logger.error("Invalid Razorpay signature")
            return {
                'statusCode': 400,
                'headers': cors_headers(),
                'body': json.dumps({'error': 'Invalid payment signature'})
            }

        logger.info("Payment signature verified successfully")
        
        # Handle different payment types
        if payment_type == 'hackathon':
            # Hackathon payment verification
            registration_id = body.get('registration_id')
            team_size = body.get('team_size', 1)
            amount = body.get('amount')
            
            logger.info("Verifying hackathon payment: registration_id=%s, team_size=%d, amount=%d", 
                       registration_id, team_size, amount)
            
            # Validate hackathon payment amounts
            hackathon_amounts = {1: 19900, 2: 54900, 3: 54900, 4: 69900}  # amounts in paise: ₹199, ₹549, ₹549, ₹699
            expected_amount = hackathon_amounts.get(team_size)
            
            if not registration_id:
                logger.error("Missing registration_id for hackathon payment")
                return {
                    'statusCode': 400,
                    'headers': cors_headers(),
                    'body': json.dumps({'error': 'Registration ID is required for hackathon payment verification'})
                }
            
            if not amount or amount != expected_amount:
                logger.error("Invalid amount for team size %d: received %d, expected %d", 
                           team_size, amount, expected_amount)
                return {
                    'statusCode': 400,
                    'headers': cors_headers(),
                    'body': json.dumps({'error': 'Invalid amount for selected team size'})
                }
                
            # Store hackathon payment record (optional - you can add DynamoDB storage here)
            response_data = {
                'success': True,
                'payment_verified': True,
                'payment_type': 'hackathon',
                'registration_id': registration_id,
                'team_size': team_size,
                'amount': amount,
                'payment_id': payment_id,
                'order_id': order_id,
                'user_id': user_id
            }
            
        else:
            # Subscription payment verification (existing logic)
            plan = body.get('plan')
            amount = body.get('amount')
            email = body.get('email')
            duration = body.get('duration')
            
            logger.info("Verifying subscription payment: plan=%s, amount=%d", plan, amount)
            
            # Validate subscription amounts
            plan_amounts = {
                'one-day': 1000, 'weekly': 4900, 'monthly': 9900, 
                'six-month': 44900, 'yearly': 79900
            }
            
            if plan and plan in plan_amounts:
                expected_amount = plan_amounts[plan]
                if amount != expected_amount:
                    logger.error("Invalid amount for plan %s: received %d, expected %d", 
                               plan, amount, expected_amount)
                    return {
                        'statusCode': 400,
                        'headers': cors_headers(),
                        'body': json.dumps({'error': 'Invalid amount for selected plan'})
                    }
            
            response_data = {
                'success': True,
                'payment_verified': True,
                'payment_type': 'subscription',
                'plan': plan,
                'amount': amount,
                'email': email,
                'duration': duration,
                'payment_id': payment_id,
                'order_id': order_id,
                'user_id': user_id
            }

        logger.info("Payment verification successful: %s", json.dumps(response_data, default=str))
        
        return {
            'statusCode': 200,
            'headers': cors_headers(),
            'body': json.dumps(response_data)
        }

    except json.JSONDecodeError:
        logger.error("Invalid JSON in request body\n%s", traceback.format_exc())
        return {
            'statusCode': 400,
            'headers': cors_headers(),
            'body': json.dumps({'error': 'Invalid JSON payload'})
        }
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}\n{traceback.format_exc()}")
        return {
            'statusCode': 500,
            'headers': cors_headers(),
            'body': json.dumps({'error': f"Internal server error: {str(e)}"})
        }
    finally:
        logger.info("Execution completed in %.2f seconds", time.time() - start_time)
