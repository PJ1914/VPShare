# CognitiveX GenAI Hackathon - Deployment Guide

## Overview
This guide covers the complete deployment of the hackathon registration system, including both frontend and backend components.

## Architecture
- **Frontend**: React.js application with multi-step registration form
- **Backend**: AWS Lambda functions with API Gateway
- **Database**: DynamoDB for registration data storage
- **Payment**: Razorpay integration for processing payments
- **Infrastructure**: CloudFormation for automated AWS resource deployment

## Prerequisites

### AWS Account Setup
1. Create an AWS account if you don't have one
2. Install AWS CLI: `npm install -g aws-cli`
3. Configure AWS credentials: `aws configure`
4. Ensure you have permissions for:
   - Lambda function creation and deployment
   - API Gateway management
   - DynamoDB table creation
   - CloudWatch logs access

### Razorpay Account Setup
1. Create a Razorpay account at https://razorpay.com
2. Get your API credentials from the dashboard:
   - Key ID (starts with `rzp_test_` or `rzp_live_`)
   - Key Secret
3. Set up webhooks in Razorpay dashboard pointing to your API Gateway URL

## Backend Deployment

### Step 1: Prepare Lambda Functions
Navigate to the Backend directory and ensure all files are ready:

```bash
cd Backend
```

Required files:
- `registration_handler.py` - Main registration logic
- `payment_handler.py` - Razorpay payment processing
- `admin_handler.py` - Admin panel functions
- `utils_handler.py` - Utility functions and CORS handling
- `requirements.txt` - Python dependencies
- `cloudformation-template.yaml` - Infrastructure as Code
- `deploy.sh` - Deployment script

### Step 2: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Deploy Infrastructure
Use the CloudFormation template to create all AWS resources:

```bash
# Make the deployment script executable
chmod +x deploy.sh

# Run deployment (replace values with your actual details)
./deploy.sh \
  --stack-name cognitivex-hackathon \
  --razorpay-key-id rzp_test_your_key_id \
  --razorpay-key-secret your_razorpay_secret \
  --region ap-south-1
```

### Step 4: Configure Environment Variables
After deployment, set the following environment variables in each Lambda function:

**Registration Handler:**
- `DYNAMODB_TABLE_NAME`: hackathon-registrations
- `RAZORPAY_KEY_ID`: Your Razorpay Key ID
- `RAZORPAY_KEY_SECRET`: Your Razorpay Key Secret

**Payment Handler:**
- `DYNAMODB_TABLE_NAME`: hackathon-registrations
- `RAZORPAY_KEY_ID`: Your Razorpay Key ID
- `RAZORPAY_KEY_SECRET`: Your Razorpay Key Secret

**Admin Handler:**
- `DYNAMODB_TABLE_NAME`: hackathon-registrations

**Utils Handler:**
- No additional environment variables needed

### Step 5: Configure API Gateway
1. Create a new REST API in API Gateway
2. Create the following resources and methods:

```
/hackathon
├── /register (POST) → registration_handler
├── /registration/{id} (GET) → registration_handler
├── /payment
│   ├── /create-order (POST) → payment_handler
│   ├── /verify (POST) → payment_handler
│   └── /webhook (POST) → payment_handler
├── /admin
│   ├── /registrations (GET) → admin_handler
│   ├── /stats (GET) → admin_handler
│   └── /registration/status (PUT) → admin_handler
├── /problem-statements (GET) → utils_handler
├── /hackathon-info (GET) → utils_handler
└── /health (GET) → utils_handler
```

3. Enable CORS for all methods
4. Deploy the API to a stage (e.g., 'prod')
5. Note the API Gateway URL for frontend configuration

### Step 6: Set Up DynamoDB
The CloudFormation template creates the table automatically, but verify:

**Table Name:** `hackathon-registrations`
**Primary Key:** `registration_id` (String)
**GSI:** `email-index` on `email` field for duplicate prevention

### Step 7: Configure Razorpay Webhooks
1. Log in to Razorpay Dashboard
2. Go to Settings > Webhooks
3. Create a new webhook with URL: `https://your-api-gateway-url/prod/payment/webhook`
4. Select events: `payment.captured`, `payment.failed`
5. Set webhook secret in Lambda environment variables

## Frontend Deployment

### Step 1: Configure Environment Variables
Create a `.env` file in the `VPShare-frontend` directory:

```env
REACT_APP_HACKATHON_API_URL=https://your-api-gateway-url.execute-api.ap-south-1.amazonaws.com/prod
REACT_APP_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

### Step 2: Build the Application
```bash
cd VPShare-frontend
npm install
npm run build
```

### Step 3: Deploy to Vercel (Recommended)
1. Install Vercel CLI: `npm install -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`
4. Set environment variables in Vercel dashboard

Alternative deployment options:
- **AWS S3 + CloudFront**: For static hosting
- **Netlify**: Similar to Vercel
- **AWS Amplify**: Full-stack deployment

## Testing the System

### Backend Testing
```bash
# Health check
curl https://your-api-gateway-url/prod/health

# Get problem statements
curl https://your-api-gateway-url/prod/problem-statements

# Test registration (replace with actual data)
curl -X POST https://your-api-gateway-url/prod/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "phone": "+919876543210",
    "college": "Test College",
    "department": "Computer Science",
    "year": "3",
    "rollNumber": "TEST123",
    "teamName": "Test Team",
    "teamSize": 1,
    "teamMembers": [{"name": "Test User", "email": "test@example.com", "phone": "+919876543210", "role": "Team Leader"}],
    "problemStatement": "AI-Powered Healthcare Diagnosis System",
    "programmingLanguages": ["Python", "JavaScript"],
    "aiExperience": "Intermediate (1-3 years)",
    "ibmSkillsBuild": true,
    "nascomRegistration": true
  }'
```

### Frontend Testing
1. Navigate to your deployed frontend URL
2. Go to the Hackathon page
3. Test the complete registration flow:
   - Fill out personal information
   - Configure team details
   - Select technical preferences
   - Accept requirements
   - Review and process payment

## Monitoring and Maintenance

### CloudWatch Monitoring
- Set up CloudWatch alarms for Lambda function errors
- Monitor DynamoDB read/write capacity
- Track API Gateway request metrics

### Logging
- Lambda functions log to CloudWatch Logs
- Enable detailed monitoring for troubleshooting

### Security
- All Lambda functions use IAM roles with minimal permissions
- API Gateway has throttling enabled
- DynamoDB has encryption at rest enabled
- Razorpay webhooks are verified with signatures

## Cost Optimization
- Lambda functions use provisioned concurrency only if needed
- DynamoDB uses on-demand billing for variable workloads
- API Gateway has caching enabled for static endpoints

## Troubleshooting

### Common Issues
1. **CORS Errors**: Ensure all API methods have CORS enabled
2. **Payment Failures**: Verify Razorpay webhook configuration
3. **Registration Duplicates**: Check email GSI configuration
4. **Lambda Timeouts**: Increase timeout settings in CloudFormation
5. **Environment Variables**: Verify all required variables are set

### Debug Tools
- CloudWatch Logs for Lambda function debugging
- API Gateway execution logs
- Razorpay dashboard for payment status
- DynamoDB console for data verification

## Scaling Considerations
- Lambda functions automatically scale
- DynamoDB on-demand scaling handles traffic spikes
- API Gateway supports high concurrent requests
- Consider implementing SQS for high-volume registrations

## Support and Contacts
For technical support during deployment:
- AWS Support: Your AWS support plan
- Razorpay Support: support@razorpay.com
- Development Team: hackathon@tkrcollege.ac.in

## Success Metrics
After deployment, monitor:
- Registration conversion rate
- Payment success rate
- System availability (99.9% target)
- Average response time (<2 seconds)
- Error rate (<1%)

This comprehensive deployment ensures a robust, scalable hackathon registration system ready for production use.
