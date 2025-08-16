import json
import boto3
import csv
import io
from datetime import datetime, timezone
import base64
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Initialize services
dynamodb = boto3.resource('dynamodb')
s3 = boto3.client('s3')
ses = boto3.client('ses')
hackathon_table = dynamodb.Table('hackathon_registrations')

def cors_headers():
    return {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }

def export_handler(event, context):
    """GET /export - Export registration data"""
    try:
        query_params = event.get('queryStringParameters') or {}
        format_type = query_params.get('format', 'csv')
        status_filter = query_params.get('status')
        
        # Get registrations
        scan_kwargs = {}
        if status_filter and status_filter != 'all':
            scan_kwargs['FilterExpression'] = boto3.dynamodb.conditions.Attr('registration_status').eq(status_filter)
        
        response = hackathon_table.scan(**scan_kwargs)
        registrations = response['Items']
        
        if format_type == 'csv':
            # Generate CSV
            output = io.StringIO()
            writer = csv.writer(output)
            
            # Headers
            headers = [
                'Registration ID', 'Name', 'Email', 'Phone', 'College', 'Department', 'Year',
                'Team Name', 'Team Size', 'Problem Statement', 'Programming Languages',
                'AI Experience', 'Registration Status', 'Payment Status', 'Amount', 'Created At'
            ]
            writer.writerow(headers)
            
            # Data rows
            for reg in registrations:
                personal = reg.get('personal_info', {})
                team = reg.get('team_info', {})
                payment = reg.get('payment_info', {})
                skills = reg.get('skills', {})
                
                row = [
                    reg.get('registration_id', ''),
                    personal.get('fullName', ''),
                    personal.get('email', ''),
                    personal.get('phone', ''),
                    personal.get('college', ''),
                    personal.get('department', ''),
                    personal.get('yearOfStudy', ''),
                    team.get('teamName', 'Individual'),
                    team.get('teamSize', 1),
                    reg.get('problem_statement', ''),
                    ', '.join(skills.get('programmingLanguages', [])),
                    skills.get('aiExperience', ''),
                    reg.get('registration_status', ''),
                    payment.get('payment_status', ''),
                    str(payment.get('amount', 0)),
                    reg.get('created_at', '')
                ]
                writer.writerow(row)
            
            csv_content = output.getvalue()
            output.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': f'attachment; filename="hackathon_registrations_{datetime.now().strftime("%Y%m%d")}.csv"',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': csv_content
            }
            
        # Add other format handlers (Excel, PDF) here
        
    except Exception as e:
        print(f"Export error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': cors_headers(),
            'body': json.dumps({
                'success': False,
                'message': 'Export failed'
            })
        }

def send_email_handler(event, context):
    """POST /send-email - Send emails to participants"""
    try:
        if isinstance(event.get('body'), str):
            body = json.loads(event['body'])
        else:
            body = event.get('body', {})
        
        recipients = body.get('recipients', [])
        email_type = body.get('email_type', 'confirmation')
        custom_data = body.get('custom_data', {})
        
        if not recipients:
            return {
                'statusCode': 400,
                'headers': cors_headers(),
                'body': json.dumps({
                    'success': False,
                    'message': 'Recipients are required'
                })
            }
        
        successful_sends = []
        failed_sends = []
        
        for recipient_id in recipients:
            try:
                # Get registration details
                reg_response = hackathon_table.get_item(
                    Key={'registration_id': recipient_id}
                )
                
                if 'Item' not in reg_response:
                    failed_sends.append({
                        'recipient_id': recipient_id,
                        'error': 'Registration not found'
                    })
                    continue
                
                registration = reg_response['Item']
                personal_info = registration.get('personal_info', {})
                email = personal_info.get('email')
                
                if not email:
                    failed_sends.append({
                        'recipient_id': recipient_id,
                        'error': 'Email not found'
                    })
                    continue
                
                # Generate email content based on type
                subject, body_content = generate_email_content(email_type, registration, custom_data)
                
                # Send email using SES
                ses.send_email(
                    Source='noreply@yourcompany.com',  # Configure your sender email
                    Destination={'ToAddresses': [email]},
                    Message={
                        'Subject': {'Data': subject},
                        'Body': {'Html': {'Data': body_content}}
                    }
                )
                
                successful_sends.append({
                    'recipient_id': recipient_id,
                    'email': email
                })
                
            except Exception as e:
                failed_sends.append({
                    'recipient_id': recipient_id,
                    'error': str(e)
                })
        
        return {
            'statusCode': 200,
            'headers': cors_headers(),
            'body': json.dumps({
                'success': True,
                'message': f'Emails sent: {len(successful_sends)} successful, {len(failed_sends)} failed',
                'data': {
                    'successful_sends': successful_sends,
                    'failed_sends': failed_sends
                }
            })
        }
        
    except Exception as e:
        print(f"Email sending error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': cors_headers(),
            'body': json.dumps({
                'success': False,
                'message': 'Failed to send emails'
            })
        }

def generate_certificate_handler(event, context):
    """POST /generate-certificate - Generate certificates"""
    try:
        if isinstance(event.get('body'), str):
            body = json.loads(event['body'])
        else:
            body = event.get('body', {})
        
        registration_id = body.get('registration_id')
        certificate_type = body.get('certificate_type', 'participation')
        
        if not registration_id:
            return {
                'statusCode': 400,
                'headers': cors_headers(),
                'body': json.dumps({
                    'success': False,
                    'message': 'Registration ID is required'
                })
            }
        
        # Get registration details
        reg_response = hackathon_table.get_item(
            Key={'registration_id': registration_id}
        )
        
        if 'Item' not in reg_response:
            return {
                'statusCode': 404,
                'headers': cors_headers(),
                'body': json.dumps({
                    'success': False,
                    'message': 'Registration not found'
                })
            }
        
        registration = reg_response['Item']
        
        # Generate certificate PDF (you'll need to implement this based on your requirements)
        certificate_pdf = generate_certificate_pdf(registration, certificate_type)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/pdf',
                'Content-Disposition': f'attachment; filename="certificate_{registration_id}.pdf"',
                'Access-Control-Allow-Origin': '*'
            },
            'body': base64.b64encode(certificate_pdf).decode('utf-8'),
            'isBase64Encoded': True
        }
        
    except Exception as e:
        print(f"Certificate generation error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': cors_headers(),
            'body': json.dumps({
                'success': False,
                'message': 'Failed to generate certificate'
            })
        }

def generate_email_content(email_type, registration, custom_data):
    """Generate email content based on type"""
    personal_info = registration.get('personal_info', {})
    name = personal_info.get('fullName', 'Participant')
    
    if email_type == 'confirmation':
        subject = "✅ CognitiveX Hackathon Registration Confirmed"
        body = f"""
        <h2>Hello {name},</h2>
        <p>Your registration for CognitiveX Hackathon has been confirmed!</p>
        <p><strong>Registration ID:</strong> {registration.get('registration_id')}</p>
        <p>We're excited to have you participate. Stay tuned for more updates.</p>
        <p>{custom_data.get('custom_message', '')}</p>
        <p>Best regards,<br>CognitiveX Team</p>
        """
    elif email_type == 'reminder':
        subject = "⏰ CognitiveX Hackathon Reminder"
        body = f"""
        <h2>Hello {name},</h2>
        <p>This is a friendly reminder about the upcoming CognitiveX Hackathon.</p>
        <p>Make sure you're prepared and ready to innovate!</p>
        <p>{custom_data.get('custom_message', '')}</p>
        <p>Best regards,<br>CognitiveX Team</p>
        """
    elif email_type == 'announcement':
        subject = "📢 Important Announcement - CognitiveX Hackathon"
        body = f"""
        <h2>Hello {name},</h2>
        <p>We have an important announcement regarding the CognitiveX Hackathon:</p>
        <p>{custom_data.get('custom_message', '')}</p>
        <p>Best regards,<br>CognitiveX Team</p>
        """
    else:
        subject = "CognitiveX Hackathon Update"
        body = f"""
        <h2>Hello {name},</h2>
        <p>{custom_data.get('custom_message', 'Thank you for participating in CognitiveX Hackathon!')}</p>
        <p>Best regards,<br>CognitiveX Team</p>
        """
    
    return subject, body

def generate_certificate_pdf(registration, certificate_type):
    """Generate certificate PDF - implement based on your requirements"""
    # This is a placeholder - you'll need to implement actual PDF generation
    # using libraries like reportlab, weasyprint, or similar
    return b"PDF certificate content here"

def lambda_handler(event, context):
    """Main Lambda entry point for utils"""
    http_method = event.get("httpMethod", "")
    path = event.get("resource", "") or event.get("path", "")
    
    try:
        if http_method == "GET" and path == "/export":
            return export_handler(event, context)
        elif http_method == "POST" and path == "/send-email":
            return send_email_handler(event, context)
        elif http_method == "POST" and path == "/generate-certificate":
            return generate_certificate_handler(event, context)
        elif http_method == "OPTIONS":
            return {
                "statusCode": 200,
                "headers": cors_headers(),
                "body": json.dumps({"success": True})
            }
        else:
            return {
                "statusCode": 404,
                "headers": cors_headers(),
                "body": json.dumps({
                    "success": False,
                    "message": f"No route for {http_method} {path}"
                })
            }
    
    except Exception as e:
        print(f"Utils Lambda error: {str(e)}")
        return {
            "statusCode": 500,
            "headers": cors_headers(),
            "body": json.dumps({"success": False, "message": "Internal server error"})
        }
