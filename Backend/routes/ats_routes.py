from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import logging
import json
import fitz  # PyMuPDF for PDF processing
import docx  # python-docx for Word documents
from io import BytesIO
from utils.gemini import analyze_ats_compatibility
from utils.auth import verify_user_token

logger = logging.getLogger(__name__)

ats_router = APIRouter()

class ATSAnalysisRequest(BaseModel):
    resume_text: str
    job_description: str
    target_role: Optional[str] = None
    industry: Optional[str] = None

class ATSScoreResponse(BaseModel):
    overall_score: int
    keyword_match_score: int
    format_score: int
    content_score: int
    missing_keywords: List[str]
    found_keywords: List[str]
    suggestions: List[str]
    sections_analysis: Dict[str, Any]

@ats_router.post("/analyze", response_model=ATSScoreResponse)
async def analyze_ats_compatibility(
    request: ATSAnalysisRequest,
    user_id: str = Depends(verify_user_token)
):
    """Analyze resume ATS compatibility against job description"""
    try:
        logger.info(f"Analyzing ATS compatibility for user {user_id}")
        
        # Use Gemini AI to analyze the resume
        analysis_result = await analyze_ats_compatibility(
            request.resume_text,
            request.job_description
        )
        
        return ATSScoreResponse(
            overall_score=analysis_result["overall_score"],
            keyword_match_score=analysis_result["keyword_match_score"],
            format_score=analysis_result["format_score"],
            content_score=analysis_result["content_score"],
            missing_keywords=analysis_result["missing_keywords"],
            found_keywords=analysis_result["found_keywords"],
            suggestions=analysis_result["suggestions"],
            sections_analysis=analysis_result["sections_analysis"]
        )
        
    except Exception as e:
        logger.error(f"Error analyzing ATS compatibility: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze resume: {str(e)}")

@ats_router.post("/analyze-file")
async def analyze_resume_file(
    file: UploadFile = File(...),
    job_description: str = None,
    user_id: str = Depends(verify_user_token)
):
    """Analyze uploaded resume file for ATS compatibility"""
    try:
        logger.info(f"Analyzing uploaded file for user {user_id}")
        
        # Read file content
        file_content = await file.read()
        
        # Extract text based on file type
        if file.filename.endswith('.pdf'):
            resume_text = extract_text_from_pdf(file_content)
        elif file.filename.endswith(('.doc', '.docx')):
            resume_text = extract_text_from_docx(file_content)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF or Word document.")
        
        if not resume_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from the uploaded file.")
        
        # If no job description provided, do general ATS analysis
        if not job_description:
            job_description = "General software development position requiring programming skills, problem-solving abilities, and technical expertise."
        
        # Analyze with Gemini AI
        analysis_result = await analyze_ats_compatibility(
            resume_text,
            job_description
        )
        
        return {
            "success": True,
            "filename": file.filename,
            "extracted_text_length": len(resume_text),
            **analysis_result
        }
        
    except Exception as e:
        logger.error(f"Error analyzing resume file: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze file: {str(e)}")

@ats_router.post("/improve")
async def get_ats_improvement_recommendations(
    request: ATSAnalysisRequest,
    user_id: str = Depends(verify_user_token)
):
    """Get detailed improvement recommendations for ATS score"""
    try:
        logger.info(f"Getting ATS improvements for user {user_id}")
        
        improvements = await analyze_ats_compatibility(
            request.resume_text,
            request.job_description
        )
        
        return {
            "success": True,
            "improvements": improvements.get("improvement_suggestions", []),
            "priority_fixes": improvements["priority_fixes"],
            "keyword_suggestions": improvements["keyword_suggestions"],
            "format_improvements": improvements["format_improvements"],
            "content_enhancements": improvements["content_enhancements"]
        }
        
    except Exception as e:
        logger.error(f"Error getting ATS improvements: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get improvements: {str(e)}")

@ats_router.get("/keywords/{industry}")
async def get_industry_keywords(
    industry: str,
    role: Optional[str] = None,
    user_id: str = Depends(verify_user_token)
):
    """Get important keywords for specific industry and role"""
    try:
        # Industry-specific keywords database
        industry_keywords = {
            "technology": [
                "Software Development", "Programming", "Algorithms", "Data Structures",
                "API", "Database", "Cloud Computing", "DevOps", "Agile", "Scrum",
                "Git", "Testing", "Debugging", "Code Review", "System Design"
            ],
            "finance": [
                "Financial Analysis", "Risk Management", "Portfolio Management",
                "Investment Banking", "Equity Research", "Financial Modeling",
                "Regulatory Compliance", "Asset Management", "Trading", "Derivatives"
            ],
            "marketing": [
                "Digital Marketing", "SEO", "SEM", "Social Media Marketing",
                "Content Marketing", "Brand Management", "Campaign Management",
                "Analytics", "Lead Generation", "Conversion Optimization"
            ],
            "healthcare": [
                "Patient Care", "Medical Records", "Healthcare Administration",
                "Clinical Research", "Regulatory Affairs", "Quality Assurance",
                "Medical Devices", "Pharmacology", "Healthcare IT", "Compliance"
            ]
        }
        
        keywords = industry_keywords.get(industry.lower(), [])
        
        return {
            "success": True,
            "industry": industry,
            "role": role,
            "keywords": keywords,
            "total_keywords": len(keywords)
        }
        
    except Exception as e:
        logger.error(f"Error getting industry keywords: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get keywords: {str(e)}")

@ats_router.post("/compare")
async def compare_resumes(
    resume1: str,
    resume2: str,
    job_description: str,
    user_id: str = Depends(verify_user_token)
):
    """Compare two resumes against the same job description"""
    try:
        logger.info(f"Comparing resumes for user {user_id}")
        
        # Analyze both resumes
        analysis1 = await analyze_ats_compatibility(resume1, job_description)
        analysis2 = await analyze_ats_compatibility(resume2, job_description)
        
        comparison = {
            "resume1_score": analysis1["overall_score"],
            "resume2_score": analysis2["overall_score"],
            "winner": "Resume 1" if analysis1["overall_score"] > analysis2["overall_score"] else "Resume 2",
            "score_difference": abs(analysis1["overall_score"] - analysis2["overall_score"]),
            "detailed_comparison": {
                "keyword_match": {
                    "resume1": analysis1["keyword_match_score"],
                    "resume2": analysis2["keyword_match_score"]
                },
                "format_score": {
                    "resume1": analysis1["format_score"],
                    "resume2": analysis2["format_score"]
                },
                "content_score": {
                    "resume1": analysis1["content_score"],
                    "resume2": analysis2["content_score"]
                }
            },
            "recommendations": generate_comparison_recommendations(analysis1, analysis2)
        }
        
        return {"success": True, **comparison}
        
    except Exception as e:
        logger.error(f"Error comparing resumes: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to compare resumes: {str(e)}")

def extract_text_from_pdf(pdf_content: bytes) -> str:
    """Extract text from PDF file"""
    try:
        pdf_file = BytesIO(pdf_content)
        pdf_document = fitz.open(stream=pdf_file, filetype="pdf")
        text = ""
        
        for page_num in range(pdf_document.page_count):
            page = pdf_document.load_page(page_num)
            text += page.get_text()
        
        pdf_document.close()
        return text
        
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {e}")
        raise Exception(f"Failed to extract text from PDF: {str(e)}")

def extract_text_from_docx(docx_content: bytes) -> str:
    """Extract text from Word document"""
    try:
        docx_file = BytesIO(docx_content)
        doc = docx.Document(docx_file)
        text = ""
        
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        
        return text
        
    except Exception as e:
        logger.error(f"Error extracting text from DOCX: {e}")
        raise Exception(f"Failed to extract text from Word document: {str(e)}")

def generate_comparison_recommendations(analysis1: Dict, analysis2: Dict) -> List[str]:
    """Generate recommendations based on resume comparison"""
    recommendations = []
    
    if analysis1["keyword_match_score"] > analysis2["keyword_match_score"]:
        recommendations.append("Resume 1 has better keyword matching. Consider incorporating more relevant keywords from Resume 1 into Resume 2.")
    else:
        recommendations.append("Resume 2 has better keyword matching. Consider incorporating more relevant keywords from Resume 2 into Resume 1.")
    
    if analysis1["format_score"] > analysis2["format_score"]:
        recommendations.append("Resume 1 has better ATS-friendly formatting.")
    else:
        recommendations.append("Resume 2 has better ATS-friendly formatting.")
    
    if analysis1["content_score"] > analysis2["content_score"]:
        recommendations.append("Resume 1 has stronger content structure and presentation.")
    else:
        recommendations.append("Resume 2 has stronger content structure and presentation.")
    
    return recommendations
