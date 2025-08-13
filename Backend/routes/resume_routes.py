from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
import logging
import asyncio
from datetime import datetime
from utils.gemini import generate_ai_resume_content, analyze_resume_for_improvements
from utils.auth import verify_user_token

logger = logging.getLogger(__name__)

resume_router = APIRouter()

class ContactInfo(BaseModel):
    firstName: str
    lastName: str
    email: str
    phone: str
    location: Optional[str] = ""
    linkedin: Optional[str] = ""
    github: Optional[str] = ""
    website: Optional[str] = ""
    portfolio: Optional[str] = ""
    jobTitle: Optional[str] = ""

class Experience(BaseModel):
    title: str
    company: str
    location: Optional[str] = ""
    startDate: str
    endDate: str
    description: Optional[str] = ""

class Education(BaseModel):
    degree: str
    major: Optional[str] = ""
    school: str
    year: Optional[str] = ""
    graduationDate: Optional[str] = ""
    gpa: Optional[str] = ""

class Skill(BaseModel):
    name: str
    category: Optional[str] = "General"
    proficiency: Optional[str] = ""

class Project(BaseModel):
    name: str
    description: Optional[str] = ""
    technologies: Optional[List[str]] = []
    date: Optional[str] = ""
    url: Optional[str] = ""

class Certificate(BaseModel):
    name: str
    issuer: str
    date: Optional[str] = ""
    url: Optional[str] = ""

class Language(BaseModel):
    name: str
    proficiency: Optional[str] = ""

class EnhancedResumeData(BaseModel):
    # Contact Information
    firstName: str
    lastName: str
    email: str
    phone: str
    location: Optional[str] = ""
    linkedin: Optional[str] = ""
    github: Optional[str] = ""
    website: Optional[str] = ""
    portfolio: Optional[str] = ""
    jobTitle: Optional[str] = ""
    
    # Content Sections
    summary: Optional[str] = ""
    experiences: Optional[List[Experience]] = []
    education: Optional[List[Education]] = []
    skills: Optional[List[Skill]] = []
    projects: Optional[List[Project]] = []
    certificates: Optional[List[Certificate]] = []
    languages: Optional[List[Language]] = []
    
    # Targeting
    targetRole: Optional[str] = ""
    industry: Optional[str] = ""
    customSections: Optional[List[Dict[str, Any]]] = []

class ResumeGenerationRequest(BaseModel):
    resume_data: EnhancedResumeData
    template: str = "latex-modern"
    ai_enhancement: bool = True
    target_role: Optional[str] = None
    industry: Optional[str] = None

class ResumeSectionImprovement(BaseModel):
    section_name: str
    current_content: str
    target_role: Optional[str] = None
    industry: Optional[str] = None

class ResumeAnalysisRequest(BaseModel):
    resume_data: EnhancedResumeData

@resume_router.post("/generate")
async def generate_resume(request: ResumeGenerationRequest, user_id: str = Depends(verify_user_token)):
    """Generate a complete resume with AI enhancement"""
    try:
        logger.info(f"Generating resume for user {user_id}")
        
        # Convert enhanced resume data to simple dict for AI processing
        resume_dict = {
            "name": f"{request.resume_data.firstName} {request.resume_data.lastName}".strip(),
            "title": request.resume_data.jobTitle or "",
            "email": request.resume_data.email,
            "phone": request.resume_data.phone,
            "location": request.resume_data.location or "",
            "linkedin": request.resume_data.linkedin or "",
            "github": request.resume_data.github or "",
            "website": request.resume_data.website or "",
            "portfolio": request.resume_data.portfolio or "",
            "objective": request.resume_data.summary or "",
            "skills": format_skills_for_ai(request.resume_data.skills),
            "experience": format_experience_for_ai(request.resume_data.experiences),
            "education": format_education_for_ai(request.resume_data.education),
        }
        
        # Generate AI-enhanced content if requested
        if request.ai_enhancement:
            enhanced_content = await generate_ai_resume_content(
                resume_dict,
                request.target_role or request.resume_data.targetRole,
                request.industry or request.resume_data.industry
            )
            
            return {
                "success": True,
                "resume_markdown": enhanced_content.get("markdown", ""),
                "sections": enhanced_content.get("sections", {}),
                "suggestions": enhanced_content.get("suggestions", []),
                "template": request.template,
                "score": calculate_resume_score(request.resume_data)
            }
        else:
            # Return basic resume structure without AI enhancement
            return {
                "success": True,
                "resume_data": resume_dict,
                "template": request.template,
                "score": calculate_resume_score(request.resume_data)
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
            "improved_content": improved_content.get("improved_content", ""),
            "suggestions": improved_content.get("suggestions", []),
            "changes_made": improved_content.get("changes_made", []),
            "impact_score": improved_content.get("impact_score", 0),
            "keywords_added": improved_content.get("keywords_added", [])
        }
        
    except Exception as e:
        logger.error(f"Error improving resume section: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to improve section: {str(e)}")

@resume_router.post("/analyze")
async def analyze_resume(request: ResumeAnalysisRequest, user_id: str = Depends(verify_user_token)):
    """Analyze resume and provide score and suggestions"""
    try:
        logger.info(f"Analyzing resume for user {user_id}")
        
        score = calculate_resume_score(request.resume_data)
        suggestions = get_resume_suggestions(request.resume_data)
        strengths = get_resume_strengths(request.resume_data)
        
        return {
            "success": True,
            "score": score,
            "suggestions": suggestions,
            "strengths": strengths,
            "completeness": calculate_completeness(request.resume_data)
        }
        
    except Exception as e:
        logger.error(f"Error analyzing resume: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze resume: {str(e)}")

# Helper functions
def format_skills_for_ai(skills: List[Skill]) -> str:
    """Format skills list for AI processing"""
    if not skills:
        return ""
    
    # Group skills by category
    skill_categories = {}
    for skill in skills:
        category = skill.category or "General"
        if category not in skill_categories:
            skill_categories[category] = []
        skill_categories[category].append(skill.name)
    
    # Format as string
    formatted_skills = []
    for category, skill_list in skill_categories.items():
        if category == "General":
            formatted_skills.extend(skill_list)
        else:
            formatted_skills.append(f"{category}: {', '.join(skill_list)}")
    
    return "; ".join(formatted_skills)

def format_experience_for_ai(experiences: List[Experience]) -> str:
    """Format experience list for AI processing"""
    if not experiences:
        return ""
    
    formatted_exp = []
    for exp in experiences:
        exp_str = f"{exp.title} at {exp.company}"
        if exp.location:
            exp_str += f", {exp.location}"
        exp_str += f" ({exp.startDate} - {exp.endDate})"
        if exp.description:
            exp_str += f"\n{exp.description}"
        formatted_exp.append(exp_str)
    
    return "\n\n".join(formatted_exp)

def format_education_for_ai(education: List[Education]) -> str:
    """Format education list for AI processing"""
    if not education:
        return ""
    
    formatted_edu = []
    for edu in education:
        edu_str = f"{edu.degree}"
        if edu.major:
            edu_str += f" in {edu.major}"
        edu_str += f" from {edu.school}"
        if edu.year or edu.graduationDate:
            edu_str += f" ({edu.year or edu.graduationDate})"
        if edu.gpa:
            edu_str += f", GPA: {edu.gpa}"
        formatted_edu.append(edu_str)
    
    return "\n".join(formatted_edu)

def calculate_resume_score(resume_data: EnhancedResumeData) -> int:
    """Calculate resume completeness score"""
    score = 0
    
    # Contact information (25 points)
    if resume_data.firstName and resume_data.lastName:
        score += 5
    if resume_data.email:
        score += 5
    if resume_data.phone:
        score += 5
    if resume_data.location:
        score += 5
    if resume_data.linkedin or resume_data.github or resume_data.website:
        score += 5
    
    # Summary (15 points)
    if resume_data.summary and len(resume_data.summary) > 50:
        score += 15
    elif resume_data.summary:
        score += 8
    
    # Experience (25 points)
    if resume_data.experiences:
        score += min(25, len(resume_data.experiences) * 8)
    
    # Education (15 points)
    if resume_data.education:
        score += min(15, len(resume_data.education) * 7)
    
    # Skills (10 points)
    if resume_data.skills:
        score += min(10, len(resume_data.skills) * 2)
    
    # Projects (5 points)
    if resume_data.projects:
        score += min(5, len(resume_data.projects) * 2)
    
    # Certificates (3 points)
    if resume_data.certificates:
        score += min(3, len(resume_data.certificates))
    
    # Languages (2 points)
    if resume_data.languages:
        score += min(2, len(resume_data.languages))
    
    return min(100, score)

def get_resume_suggestions(resume_data: EnhancedResumeData) -> List[str]:
    """Get improvement suggestions for resume"""
    suggestions = []
    
    if not resume_data.summary or len(resume_data.summary) < 50:
        suggestions.append("Add a compelling professional summary (50+ characters)")
    
    if not resume_data.experiences or len(resume_data.experiences) == 0:
        suggestions.append("Add your work experience with specific achievements")
    
    if not resume_data.skills or len(resume_data.skills) < 5:
        suggestions.append("Include more relevant technical and soft skills")
    
    if not (resume_data.linkedin or resume_data.github or resume_data.website):
        suggestions.append("Add professional links (LinkedIn, GitHub, portfolio)")
    
    if not resume_data.projects or len(resume_data.projects) == 0:
        suggestions.append("Showcase your projects to demonstrate practical skills")
    
    if not resume_data.targetRole:
        suggestions.append("Specify your target role for better AI optimization")
    
    return suggestions

def get_resume_strengths(resume_data: EnhancedResumeData) -> List[str]:
    """Get resume strengths"""
    strengths = []
    
    if resume_data.linkedin and resume_data.github:
        strengths.append("Strong online professional presence")
    
    if resume_data.experiences and len(resume_data.experiences) >= 2:
        strengths.append("Good work experience background")
    
    if resume_data.projects and len(resume_data.projects) >= 2:
        strengths.append("Strong project portfolio")
    
    if resume_data.certificates and len(resume_data.certificates) > 0:
        strengths.append("Professional certifications included")
    
    if resume_data.skills and len(resume_data.skills) >= 8:
        strengths.append("Comprehensive skill set listed")
    
    return strengths

def calculate_completeness(resume_data: EnhancedResumeData) -> Dict[str, float]:
    """Calculate section-wise completeness"""
    completeness = {}
    
    # Contact section
    contact_fields = [resume_data.firstName, resume_data.lastName, resume_data.email, resume_data.phone]
    completeness["contact"] = sum(1 for field in contact_fields if field) / len(contact_fields)
    
    # Content sections
    completeness["summary"] = 1.0 if resume_data.summary and len(resume_data.summary) > 50 else 0.0
    completeness["experience"] = 1.0 if resume_data.experiences and len(resume_data.experiences) > 0 else 0.0
    completeness["education"] = 1.0 if resume_data.education and len(resume_data.education) > 0 else 0.0
    completeness["skills"] = 1.0 if resume_data.skills and len(resume_data.skills) > 0 else 0.0
    completeness["projects"] = 1.0 if resume_data.projects and len(resume_data.projects) > 0 else 0.0
    
    return completeness

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
    resume_data: EnhancedResumeData,
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
