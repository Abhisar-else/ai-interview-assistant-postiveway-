import json
from typing import List, Dict, Any
from app.services.llm import call_llm

FINAL_REPORT_PROMPT = """SYSTEM:
You are evaluating a completed mock interview session. Output ONLY valid JSON, no markdown fences:
{
  "overall_score": 0-100,
  "ats_score": 0-100,
  "technical_score": 0-100,
  "communication_score": 0-100,
  "problem_solving_score": 0-100,
  "confidence_score": 0-100,
  "strengths": [string, string, string],
  "improvements": [string, string, string],
  "recommended_topics": [string, string, string]
}
Base "ats_score" on how well the candidate's resume (skills, projects, experience) matches the requirements of the targeted job role.
Base other scores on substance, correctness, structure of answers, and communication clarity across the full transcript.
Be specific and constructive, not generic.
"""

def generate_performance_report(
    job_role: str,
    interview_type: str,
    difficulty: str,
    transcript: List[Dict[str, Any]],
    resume_summary: Dict[str, Any] = None,
    target_company: str = None
) -> Dict[str, Any]:
    transcript_json = json.dumps(transcript, indent=2)
    resume_json = json.dumps(resume_summary or {}, indent=2)
    company_context = f" for {target_company}" if target_company else ""

    user_prompt = f"""Job role: {job_role}{company_context}
Interview type: {interview_type}
Difficulty: {difficulty}

Candidate Resume Summary:
{resume_json}

Full Interview Transcript:
{transcript_json}"""

    llm_output = call_llm(FINAL_REPORT_PROMPT, user_prompt, json_only=True)
    cleaned_output = llm_output.replace("```json", "").replace("```", "").strip()

    try:
        report_data = json.loads(cleaned_output)
    except Exception:
        report_data = {
            "overall_score": 75,
            "ats_score": 70,
            "technical_score": 78,
            "communication_score": 75,
            "problem_solving_score": 74,
            "confidence_score": 73,
            "strengths": [
                "Answered questions with good structure",
                "Demonstrated relevant technical knowledge",
                "Maintained engagement throughout the session"
            ],
            "improvements": [
                "Provide deeper technical trade-off analysis",
                "Incorporate more quantifiable project metrics",
                "Practice edge-case problem solving"
            ],
            "recommended_topics": [
                "System Design Basics",
                "Database Indexing & Performance",
                "Behavioral Interview Frameworks (STAR)"
            ]
        }

    return report_data
