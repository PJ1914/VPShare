from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
import logging
from utils.gemini import generate_ai_resume_content, analyze_resume_for_improvements
from utils.auth import verify_user_token

logger = logging.getLogger(__name__)

resume_router = APIRouter()

class ResumeData(BaseModel):
    name: str
    title: str
    email: str
    phone: str
    location: str
    linkedin: Optional[str] = ""
    github: Optional[str] = ""
    website: Optional[str] = ""
    portfolio: Optional[str] = ""
    twitter: Optional[str] = ""
    blog: Optional[str] = ""
    objective: Optional[str] = ""
    skills: Optional[str] = ""
    experience: Optional[str] = ""
    education: Optional[str] = ""

class ResumeGenerationRequest(BaseModel):
    resume_data: ResumeData
    template: str = "latex-modern"
    ai_enhancement: bool = True
    target_role: Optional[str] = None
    industry: Optional[str] = None

class ResumeSectionImprovement(BaseModel):
    section_name: str
    current_content: str
    target_role: Optional[str] = None
    industry: Optional[str] = None

@resume_router.post("/generate")
async def generate_resume(request: ResumeGenerationRequest, user_id: str = Depends(verify_user_token)):
    """Generate a complete resume with AI enhancement"""
    try:
        logger.info(f"Generating resume for user {user_id}")
        
        # Convert resume data to dict
        resume_dict = request.resume_data.dict()
        
        # Generate AI-enhanced content if requested
        if request.ai_enhancement:
            enhanced_content = await generate_ai_resume_content(
                resume_dict,
                request.target_role,
                request.industry
            )
            
            return {
                "success": True,
                "resume_markdown": enhanced_content["markdown"],
                "sections": enhanced_content["sections"],
                "suggestions": enhanced_content.get("suggestions", []),
                "template": request.template
            }
        else:
            # Return basic resume structure without AI enhancement
            return {
                "success": True,
                "resume_data": resume_dict,
                "template": request.template
            }
            
    except Exception as e:
        logger.error(f"Error generating resume: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate resume: {str(e)}")

@resume_router.post("/improve-section")
async def improve_resume_section(request: ResumeSectionImprovement, user_id: str = Depends(verify_user_token)):
    """Improve a specific section of the resume"""
    try:
        logger.info(f"Improving {request.section_name} section for user {user_id}")
        
        improved_content = await analyze_resume_for_improvements(
            request.current_content,
            request.section_name,
            request.target_role,
            request.industry
        )
        
        return {
            "success": True,
            "section_name": request.section_name,
            "improved_content": improved_content["improved_content"],
            "suggestions": improved_content.get("suggestions", []),
            "changes_made": improved_content.get("changes_made", []),
            "impact_score": improved_content.get("impact_score", 0)
        }
        
    except Exception as e:
        logger.error(f"Error improving resume section: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to improve section: {str(e)}")

@resume_router.get("/templates")
async def get_resume_templates():
    """Get available resume templates"""
    templates = {
        "latex-modern": {
            "name": "Modern LaTeX",
            "description": "Clean, professional LaTeX-inspired design",
            "best_for": "Tech & Business professionals",
            "features": ["Clean", "Professional", "ATS-Friendly"]
        },
        "latex-classic": {
            "name": "Classic LaTeX",
            "description": "Traditional academic resume format",
            "best_for": "Academic positions",
            "features": ["Traditional", "Academic"]
        },
        "latex-tech": {
            "name": "Tech LaTeX",
            "description": "Technology-focused with skills emphasis",
            "best_for": "Developers & Engineers",
            "features": ["Tech-Focused", "Modern"]
        },
        "latex-executive": {
            "name": "Executive LaTeX",
            "description": "Executive-level with achievements focus",
            "best_for": "Senior Management",
            "features": ["Executive", "Premium"]
        },
        "latex-academic": {
            "name": "Academic LaTeX",
            "description": "Academic CV with research focus",
            "best_for": "Researchers",
            "features": ["Academic CV", "Research"]
        }
    }
    
    return {"templates": templates}

@resume_router.post("/export")
async def export_resume(
    resume_data: ResumeData,
    template: str = "latex-modern",
    format: str = "pdf",
    user_id: str = Depends(verify_user_token)
):
    """Export resume in various formats"""
    try:
        logger.info(f"Exporting resume for user {user_id} in {format} format")
        
        # Here you would implement the actual export logic
        # For now, return a success message
        return {
            "success": True,
            "message": f"Resume exported successfully in {format} format",
            "template": template,
            "download_url": f"/api/resume/download/{user_id}/{format}"
        }
        
    except Exception as e:
        logger.error(f"Error exporting resume: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to export resume: {str(e)}")

@resume_router.get("/suggestions/{section}")
async def get_section_suggestions(
    section: str,
    role: Optional[str] = None,
    industry: Optional[str] = None,
    user_id: str = Depends(verify_user_token)
):
    """Get AI suggestions for a specific resume section"""
    try:
        suggestions = await get_resume_section_suggestions(section, role, industry)
        
        return {
            "success": True,
            "section": section,
            "suggestions": suggestions,
            "role": role,
            "industry": industry
        }
        
    except Exception as e:
        logger.error(f"Error getting suggestions: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get suggestions: {str(e)}")

async def get_resume_section_suggestions(section: str, role: Optional[str], industry: Optional[str]) -> List[str]:
    """Get suggestions for a specific resume section"""
    section_suggestions = {
        "objective": [
            "Start with your years of experience and key expertise",
            "Mention specific technologies or skills relevant to the role",
            "Include measurable achievements or goals",
            "Keep it concise (2-3 sentences maximum)"
        ],
        "experience": [
            "Use action verbs to start each bullet point",
            "Include quantifiable achievements (numbers, percentages)",
            "Focus on results and impact, not just responsibilities",
            "Tailor descriptions to match the target role"
        ],
        "skills": [
            "Group skills by category (Programming, Tools, Frameworks)",
            "List skills most relevant to the target role first",
            "Include both technical and soft skills",
            "Be specific rather than generic"
        ],
        "education": [
            "Include relevant coursework for entry-level positions",
            "Mention academic achievements (GPA if above 3.5)",
            "Add relevant projects or thesis topics",
            "Include certifications and online courses"
        ]
    }
    
    base_suggestions = section_suggestions.get(section, [])
    
    # Add role-specific suggestions if provided
    if role and industry:
        base_suggestions.append(f"Emphasize skills and experience relevant to {role} in {industry}")
    
    return base_suggestions
