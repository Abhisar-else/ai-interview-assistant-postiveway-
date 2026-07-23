import os
import json
import logging
from app.core.config import settings

logger = logging.getLogger("uvicorn.error")

def call_llm(system_prompt: str, user_prompt: str, json_only: bool = False) -> str:
    """
    Unified LLM caller. Uses OpenAI API or Gemini API depending on available keys.
    Falls back gracefully if no key is supplied.
    """
    # 1. Try OpenAI API
    if settings.OPENAI_API_KEY:
        try:
            import openai
            client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.7,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"OpenAI API call failed: {e}")

    # 2. Try Gemini API
    if settings.GEMINI_API_KEY:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel("gemini-1.5-flash")
            full_prompt = f"SYSTEM INSTRUCTIONS:\n{system_prompt}\n\nUSER PROMPT:\n{user_prompt}"
            response = model.generate_content(full_prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Gemini API call failed: {e}")

    # 3. Fallback intelligent mock response (for offline development without keys)
    logger.warning("No valid LLM API key provided. Using fallback AI simulation response.")
    return get_fallback_llm_response(system_prompt, user_prompt, json_only)

def get_fallback_llm_response(system_prompt: str, user_prompt: str, json_only: bool) -> str:
    if "resume" in system_prompt.lower() or "convert raw resume" in system_prompt.lower():
        return json.dumps({
            "name": "Candidate",
            "skills": ["JavaScript", "React", "Python", "FastAPI", "PostgreSQL", "Git", "REST APIs"],
            "projects": [
                {"title": "Full Stack Web App", "description": "Interactive web application with responsive UI and REST backend", "tech": ["React", "FastAPI"]}
            ],
            "experience": [
                {"role": "Software Developer Intern", "company": "Tech Firm", "duration": "6 months", "highlights": ["Engineered core user features", "Optimized database queries"]}
            ],
            "education": [
                {"degree": "B.Tech Computer Science", "institution": "University", "year": "2026"}
            ]
        })
    elif "evaluating a completed mock interview" in system_prompt.lower() or json_only:
        return json.dumps({
            "overall_score": 82,
            "technical_score": 85,
            "communication_score": 80,
            "problem_solving_score": 83,
            "confidence_score": 80,
            "strengths": [
                "Demonstrated solid conceptual depth when explaining core concepts",
                "Clear structure in responses with realistic project examples",
                "Good technical confidence during probing follow-ups"
            ],
            "improvements": [
                "Could elaborate more on edge-case handling and failure modes",
                "Practice quantifying performance targets and metrics in answers",
                "Explore system design scalability trade-offs deeper"
            ],
            "recommended_topics": [
                "System Architecture & Scaling",
                "Database Indexing Strategies",
                "Error Resiliency Patterns"
            ]
        })
    else:
        return "That is a well-reasoned answer. Can you describe how you would optimize this solution for high concurrency or handle potential edge cases?"
