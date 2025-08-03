# VPShare Backend

A comprehensive AI-powered resume builder and ATS checker backend built with FastAPI and Google Gemini AI.

## Features

### Resume Builder
- AI-powered resume content generation
- Multiple professional LaTeX templates
- Section-by-section improvement suggestions
- Industry-specific optimizations
- Real-time resume preview and editing

### ATS Checker
- Comprehensive ATS compatibility analysis
- File upload support (PDF, DOCX, TXT)
- Keyword density analysis
- Job description matching
- Detailed scoring and improvement suggestions

### AI Integration
- Google Gemini AI for content generation
- Industry-specific insights and recommendations
- Job-specific resume optimization
- Cover letter generation
- Smart keyword optimization

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Backend
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
# Copy .env.example to .env and fill in your values
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_ADMINSDK_JSON=your_firebase_service_account_json
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
BYPASS_AUTH=false  # Set to true for development
```

4. Set up Firebase:
   - Download your Firebase service account key
   - Place it as `firebase_adminsdk.json` in the Backend directory
   - Or set the `FIREBASE_ADMINSDK_JSON` environment variable

5. Run the application:
```bash
python main.py
```

Or with uvicorn directly:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## API Endpoints

### Chat (Legacy)
- `POST /chat` - Chat with AI assistant
- `GET /chat/history/{chat_id}` - Get chat history

### Resume Management
- `POST /api/resume/generate` - Generate new resume with AI
- `PUT /api/resume/{resume_id}` - Update existing resume
- `GET /api/resume/{resume_id}` - Get resume by ID
- `DELETE /api/resume/{resume_id}` - Delete resume
- `GET /api/resume/user/{user_id}` - Get all user resumes
- `POST /api/resume/{resume_id}/improve-section` - Improve specific section
- `GET /api/resume/templates` - Get available templates

### ATS Analysis
- `POST /api/ats/analyze-file` - Analyze uploaded resume file
- `POST /api/ats/analyze-text` - Analyze resume text directly
- `POST /api/ats/compare-job` - Compare resume with job description
- `GET /api/ats/suggestions/{analysis_id}` - Get improvement suggestions

### AI Services
- `POST /api/ai/generate-content` - Generate AI-enhanced resume content
- `POST /api/ai/improve-section` - Improve specific resume section
- `POST /api/ai/job-match-analysis` - Analyze job match compatibility
- `GET /api/ai/industry-insights/{industry}` - Get industry-specific insights
- `POST /api/ai/optimize-keywords` - Optimize resume keywords
- `POST /api/ai/generate-cover-letter` - Generate AI cover letter

## Authentication

The API uses Firebase Authentication. Include the Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase_id_token>
```

For development, set `BYPASS_AUTH=true` in your environment to skip authentication.

## File Structure

```
Backend/
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── firebase_adminsdk.json  # Firebase service account key
├── routes/                 # API route handlers
│   ├── resume_routes.py    # Resume management endpoints
│   ├── ats_routes.py       # ATS analysis endpoints
│   └── ai_routes.py        # AI service endpoints
└── utils/                  # Utility modules
    ├── auth.py             # Authentication utilities
    ├── gemini.py           # Gemini AI integration
    ├── dynamo.py           # DynamoDB operations
    ├── firebase_rag.py     # Firebase RAG operations
    └── user_context.py     # User context management
```

## Development

### Running in Development Mode

Set `BYPASS_AUTH=true` in your environment to skip Firebase authentication during development.

### API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Testing

Use the interactive API documentation at `/docs` to test endpoints, or use tools like Postman or curl.

## Production Deployment

1. Ensure all environment variables are properly set
2. Set `BYPASS_AUTH=false`
3. Configure proper CORS origins in `main.py`
4. Use a production WSGI server like Gunicorn:

```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## Error Handling

The API includes comprehensive error handling with appropriate HTTP status codes:
- 400: Bad Request (invalid input)
- 401: Unauthorized (authentication failed)
- 403: Forbidden (insufficient permissions)
- 404: Not Found (resource not found)
- 500: Internal Server Error

## Logging

Logs are configured for all major operations. Check console output for debugging information.

## Support

For issues or questions, please refer to the project documentation or create an issue in the repository.
