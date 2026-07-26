import os
import json
import logging
from app.core.config import settings

logger = logging.getLogger("uvicorn.error")

def call_llm(system_prompt: str, user_prompt: str, json_only: bool = False, fallback_context: dict = None) -> str:
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
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.7,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"OpenAI API call failed: {type(e).__name__}")

    # 2. Try Gemini API
    if settings.GEMINI_API_KEY:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel(settings.GEMINI_MODEL)
            full_prompt = f"SYSTEM INSTRUCTIONS:\n{system_prompt}\n\nUSER PROMPT:\n{user_prompt}"
            response = model.generate_content(full_prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Gemini API call failed: {type(e).__name__}")

    # 3. Fallback intelligent mock response (for offline development without keys)
    logger.warning("No valid LLM API key provided. Using fallback AI simulation response.")
    return get_fallback_llm_response(system_prompt, user_prompt, json_only, fallback_context or {})

def get_fallback_llm_response(system_prompt: str, user_prompt: str, json_only: bool, fallback_context: dict = None) -> str:
    fallback_context = fallback_context or {}
    if "convert raw resume text into structured json" in system_prompt.lower():
        # Return a generic 'Offline' resume so the user knows the API key is missing
        return json.dumps({
            "name": "Offline Mode Candidate",
            "skills": ["Communication", "General Problem Solving", "Note: GEMINI_API_KEY Missing"],
            "projects": [
                {"title": "Setup Required", "description": "Please add your Gemini API Key to the .env file to enable AI parsing.", "tech": ["System"]}
            ],
            "experience": [
                {"role": "Local Developer", "company": "Offline Environment", "duration": "N/A", "highlights": ["Running in fallback mode"]}
            ],
            "education": [
                {"degree": "System Check", "institution": "Simulator", "year": "2026"}
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
        return _fallback_question(fallback_context)


FALLBACK_QUESTIONS = {
    "Technical": [
        "Walk me through how you'd design the core architecture for a system in this role — what are the key components and why?",
        "Tell me about a technical concept from your background you understand deeply. What's a tradeoff you had to make?",
        "How would you debug a production issue where response times suddenly doubled?",
        "What's a design decision you'd reconsider if you rebuilt one of your past projects today?",
    ],
    "Coding": [
        "Write a function that reverses a linked list in place. Walk me through your approach before coding.",
        "How would you find the first non-repeating character in a string? Talk through the time complexity.",
        "Design an algorithm to detect a cycle in a graph. What data structure would you use and why?",
        "How would you implement an LRU cache? What's the time complexity of each operation?",
    ],
    "HR": [
        "Tell me about a time you disagreed with a teammate's approach. How did you handle it?",
        "What's a project you're proud of, and what would you do differently next time?",
        "How do you prioritize when you have multiple deadlines at once?",
        "Describe a time you had to learn something quickly under pressure.",
    ],
    "Mixed": [
        "Tell me about your background and a technical project you're proud of.",
        "How do you approach learning a new technology under a tight deadline?",
        "Describe a time you had to explain a technical decision to a non-technical stakeholder.",
        "What's a mistake you made on a project, and what did you take away from it?",
    ],
}


def _fallback_question(ctx: dict) -> str:
    interview_type = ctx.get("interview_type") or "Mixed"
    pool = FALLBACK_QUESTIONS.get(interview_type, FALLBACK_QUESTIONS["Mixed"])
    turn_index = ctx.get("turn_index", 0)
    return pool[turn_index % len(pool)]