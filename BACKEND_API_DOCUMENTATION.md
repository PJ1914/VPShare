# CodeKurukshetra Backend API Documentation

## Architecture Overview

### Technology Stack
- **Backend Framework**: Go (Golang) deployed on AWS
- **Database**: AWS DynamoDB
- **Authentication**: Firebase Auth
- **Payment Gateway**: Razorpay
- **Email Service**: AWS SES / SendGrid
- **File Storage**: AWS S3
- **API Gateway**: AWS API Gateway
- **Deployment**: AWS Lambda + API Gateway

### System Architecture
```
Client (React+Vite) 
    ↓
AWS API Gateway 
    ↓
AWS Lambda (Go Runtime)
    ↓
DynamoDB + Razorpay + Firebase Auth + Email Service
```

## API Endpoints

### Base URL
```
Production: https://api.codetapasya.com/hackathon
Development: https://dev-api.codetapasya.com/hackathon
```

### Authentication
All endpoints require Firebase Auth token in header:
```
Authorization: Bearer <firebase_jwt_token>
```

### 1. Registration Endpoints

#### POST /register/team
Create a new team registration

**Request Body:**
```json
{
  "team_name": "string",
  "track": "string", // optional
  "members": [
    {
      "first_name": "string",
      "last_name": "string", 
      "email": "string",
      "phone": "string",
      "college": "string",
      "year": "string",
      "github_username": "string",
      "linkedin": "string", // optional
      "student_status": boolean,
      "is_leader": boolean
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "team_id": "uuid",
    "payment_order_id": "razorpay_order_id",
    "amount": 99900, // in paise
    "currency": "INR"
  }
}
```

### 2. Payment Endpoints

#### POST /payment/verify
Verify payment after Razorpay success

**Request Body:**
```json
{
  "razorpay_order_id": "string",
  "razorpay_payment_id": "string", 
  "razorpay_signature": "string",
  "team_id": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "payment_status": "paid",
    "confirmation_sent": true
  }
}
```

#### POST /payment/webhook
Razorpay webhook endpoint (internal)

**Headers:**
```
X-Razorpay-Signature: webhook_signature
```

### 3. Team Management

#### GET /team/{team_id}
Get team details

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "track": "string",
    "payment_status": "string",
    "members": [...],
    "created_at": "timestamp"
  }
}
```

#### PUT /team/{team_id}
Update team details (before payment)

#### DELETE /team/{team_id}
Delete team (admin only)

### 4. Participant Endpoints

#### GET /participant/{participant_id}
Get participant details

#### PUT /participant/{participant_id} 
Update participant details

### 5. Admin Endpoints

#### GET /admin/registrations
Get all registrations with filters

**Query Parameters:**
- `payment_status`: paid|pending|failed
- `track`: filter by track
- `page`: pagination
- `limit`: results per page

#### GET /admin/statistics
Get event statistics

**Response:**
```json
{
  "total_teams": 150,
  "total_participants": 450,
  "paid_teams": 120,
  "revenue": 11988000, // in paise
  "track_wise_distribution": {...}
}
```

#### GET /admin/export/csv
Export registrations as CSV

#### POST /admin/refund/{team_id}
Process refund for a team

### 6. General Endpoints

#### GET /health
Health check endpoint

#### GET /tracks
Get available tracks/categories

#### GET /config
Get hackathon configuration (dates, rules, etc.)

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional details if any"
  }
}
```

### Common Error Codes
- `INVALID_REQUEST`: 400 - Invalid request format
- `UNAUTHORIZED`: 401 - Authentication required
- `FORBIDDEN`: 403 - Access denied
- `NOT_FOUND`: 404 - Resource not found
- `DUPLICATE_EMAIL`: 409 - Email already registered
- `PAYMENT_FAILED`: 402 - Payment processing failed
- `INTERNAL_ERROR`: 500 - Server error

## Rate Limiting
- Registration endpoints: 5 requests per minute per IP
- General endpoints: 100 requests per minute per IP
- Admin endpoints: 1000 requests per minute per authenticated user

## Environment Variables

### Required Environment Variables
```bash
# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key

# Razorpay
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-key-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret

# AWS
AWS_REGION=ap-south-1
DYNAMODB_TABLE_PREFIX=codekurukshetra_

# Email
EMAIL_SERVICE_PROVIDER=sendgrid # or aws_ses
SENDGRID_API_KEY=your-api-key
FROM_EMAIL=hackathon@codetapasya.com

# Application
ENVIRONMENT=production
CORS_ORIGINS=https://codetapasya.com,https://app.codetapasya.com
```

## Database Schema (DynamoDB)

### Tables Structure

#### participants
```json
{
  "PK": "PARTICIPANT#uuid",
  "SK": "PROFILE",
  "GSI1PK": "EMAIL#email",
  "GSI2PK": "TEAM#team_id",
  "first_name": "string",
  "last_name": "string", 
  "email": "string",
  "phone": "string",
  "college": "string",
  "year": "string",
  "github_username": "string",
  "linkedin": "string",
  "student_status": "boolean",
  "registration_type": "team_member",
  "team_id": "string",
  "payment_status": "pending|paid|failed|refunded",
  "is_leader": "boolean",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

#### teams
```json
{
  "PK": "TEAM#uuid", 
  "SK": "PROFILE",
  "GSI1PK": "PAYMENT_STATUS#status",
  "name": "string",
  "track": "string",
  "leader_participant_id": "string",
  "payment_status": "pending|paid|failed|refunded",
  "payment_order_id": "string",
  "payment_id": "string",
  "amount": "number",
  "member_count": "number",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

#### payments
```json
{
  "PK": "PAYMENT#uuid",
  "SK": "TRANSACTION", 
  "razorpay_order_id": "string",
  "razorpay_payment_id": "string",
  "team_id": "string",
  "amount": "number",
  "currency": "INR",
  "status": "pending|paid|failed|refunded",
  "metadata": "json",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Global Secondary Indexes (GSI)

1. **GSI1**: Email lookup
   - PK: EMAIL#email
   - SK: PARTICIPANT#uuid

2. **GSI2**: Team member lookup  
   - PK: TEAM#team_id
   - SK: PARTICIPANT#uuid

3. **GSI3**: Payment status lookup
   - PK: PAYMENT_STATUS#status
   - SK: TEAM#uuid

## Security Considerations

### Data Protection
- All PII encrypted at rest in DynamoDB
- HTTPS enforced for all API calls
- Firebase JWT tokens for authentication
- Razorpay webhook signature verification
- Input validation and sanitization

### Access Control
- Firebase Auth for user authentication
- Role-based access for admin endpoints
- Rate limiting on all endpoints
- CORS configuration for allowed origins

### Payment Security
- PCI DSS compliance through Razorpay
- Webhook signature verification
- Idempotency keys for payment operations
- Secure storage of payment metadata

## Deployment

### AWS Lambda Deployment
```bash
# Build Go binary
GOOS=linux go build -o main

# Create deployment package
zip deployment.zip main

# Deploy using AWS CLI
aws lambda update-function-code \
  --function-name codekurukshetra-api \
  --zip-file fileb://deployment.zip
```

### API Gateway Configuration
- CORS enabled for frontend domains
- Request/Response logging enabled
- API key authentication for admin endpoints
- Custom domain mapping

### Environment Setup
1. Create DynamoDB tables with GSIs
2. Configure Razorpay webhooks
3. Set up Firebase project and service account
4. Configure email service (SendGrid/SES)
5. Deploy Lambda functions
6. Configure API Gateway routes
7. Set up monitoring and alerts
