from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import logging
from utils.gemini import (
    generate_ai_resume_content,
    analyze_resume_for_improvements,
    get_industry_specific_suggestions
)
from utils.auth import verify_user_token

logger = logging.getLogger(__name__)

ai_router = APIRouter()

class AIResumeRequest(BaseModel):
    resume_data: Dict[str, Any]
    target_role: Optional[str] = None
    industry: Optional[str] = None
    experience_level: Optional[str] = "mid"
    focus_areas: Optional[List[str]] = []

class AIImprovementRequest(BaseModel):
    current_content: str
    section_type: str
    target_role: Optional[str] = None
    industry: Optional[str] = None

class AIJobMatchRequest(BaseModel):
    resume_text: str
    job_description: str
    company_info: Optional[str] = None

@ai_router.post("/generate-content")
async def generate_ai_content(
    request: AIResumeRequest,
    user_id: str = Depends(verify_user_token)
):
    """Generate AI-enhanced resume content"""
    try:
        logger.info(f"Generating AI content for user {user_id}")
        
        ai_content = await generate_ai_resume_content(
            request.resume_data,
            request.target_role,
            request.industry,
            request.experience_level,
            request.focus_areas
        )
        
        return {
            "success": True,
            "enhanced_resume": ai_content["enhanced_resume"],
            "improvements_made": ai_content["improvements_made"],
            "suggestions": ai_content["suggestions"],
            "keywords_added": ai_content["keywords_added"]
        }
        
    except Exception as e:
        logger.error(f"Error generating AI content: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate AI content: {str(e)}")

@ai_router.post("/improve-section")
async def improve_section_with_ai(
    request: AIImprovementRequest,
    user_id: str = Depends(verify_user_token)
):
    """Improve a specific resume section using AI"""
    try:
        logger.info(f"Improving {request.section_type} section for user {user_id}")
        
        improvements = await analyze_resume_for_improvements(
            request.current_content,
            request.section_type,
            request.target_role,
            request.industry
        )
        
        return {
            "success": True,
            "section_type": request.section_type,
            "improved_content": improvements["improved_content"],
            "changes_made": improvements["changes_made"],
            "suggestions": improvements["suggestions"],
            "impact_score": improvements["impact_score"]
        }
        
    except Exception as e:
        logger.error(f"Error improving section: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to improve section: {str(e)}")

@ai_router.post("/job-match-analysis")
async def analyze_job_match(
    request: AIJobMatchRequest,
    user_id: str = Depends(verify_user_token)
):
    """Analyze how well resume matches a specific job"""
    try:
        logger.info(f"Analyzing job match for user {user_id}")
        
        # Use Gemini to analyze job match
        match_analysis = await analyze_job_resume_match(
            request.resume_text,
            request.job_description,
            request.company_info
        )
        
        return {
            "success": True,
            "match_score": match_analysis["match_score"],
            "strengths": match_analysis["strengths"],
            "gaps": match_analysis["gaps"],
            "recommendations": match_analysis["recommendations"],
            "missing_skills": match_analysis["missing_skills"],
            "alignment_analysis": match_analysis["alignment_analysis"]
        }
        
    except Exception as e:
        logger.error(f"Error analyzing job match: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze job match: {str(e)}")

@ai_router.get("/industry-insights/{industry}")
async def get_industry_insights(
    industry: str,
    role: Optional[str] = None,
    user_id: str = Depends(verify_user_token)
):
    """Get AI-powered industry insights and recommendations"""
    try:
        logger.info(f"Getting industry insights for {industry}")
        
        insights = await get_industry_specific_suggestions(industry, role)
        
        return {
            "success": True,
            "industry": industry,
            "role": role,
            "key_skills": insights["key_skills"],
            "trending_technologies": insights["trending_technologies"],
            "resume_tips": insights["resume_tips"],
            "salary_insights": insights["salary_insights"],
            "growth_areas": insights["growth_areas"]
        }
        
    except Exception as e:
        logger.error(f"Error getting industry insights: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get insights: {str(e)}")

@ai_router.post("/optimize-keywords")
async def optimize_resume_keywords(
    resume_content: str,
    target_job_description: str,
    user_id: str = Depends(verify_user_token)
):
    """Optimize resume keywords for better ATS matching"""
    try:
        logger.info(f"Optimizing keywords for user {user_id}")
        
        optimization = await optimize_keywords_with_ai(
            resume_content,
            target_job_description
        )
        
        return {
            "success": True,
            "optimized_content": optimization["optimized_content"],
            "keywords_added": optimization["keywords_added"],
            "keywords_removed": optimization["keywords_removed"],
            "density_analysis": optimization["density_analysis"],
            "improvement_score": optimization["improvement_score"]
        }
        
    except Exception as e:
        logger.error(f"Error optimizing keywords: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to optimize keywords: {str(e)}")

@ai_router.post("/generate-cover-letter")
async def generate_cover_letter(
    resume_data: Dict[str, Any],
    job_description: str,
    company_name: str,
    user_id: str = Depends(verify_user_token)
):
    """Generate AI-powered cover letter based on resume and job description"""
    try:
        logger.info(f"Generating cover letter for user {user_id}")
        
        cover_letter = await generate_ai_cover_letter(
            resume_data,
            job_description,
            company_name
        )
        
        return {
            "success": True,
            "cover_letter": cover_letter["content"],
            "tone": cover_letter["tone"],
            "key_points_highlighted": cover_letter["key_points"],
            "customization_suggestions": cover_letter["suggestions"]
        }
        
    except Exception as e:
        logger.error(f"Error generating cover letter: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate cover letter: {str(e)}")

# Helper functions (to be implemented in utils/gemini.py)
async def analyze_job_resume_match(resume_text: str, job_description: str, company_info: Optional[str]) -> Dict[str, Any]:
    """Analyze how well a resume matches a job description"""
    # This will be implemented in the enhanced gemini.py
    pass

async def optimize_keywords_with_ai(resume_content: str, job_description: str) -> Dict[str, Any]:
    """Optimize resume keywords using AI"""
    # This will be implemented in the enhanced gemini.py
    pass

async def generate_ai_cover_letter(resume_data: Dict, job_description: str, company_name: str) -> Dict[str, Any]:
    """Generate cover letter using AI"""
    # This will be implemented in the enhanced gemini.py
    pass
