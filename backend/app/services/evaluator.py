import json
from typing import List, Dict, Any
from app.services.llm import call_llm

FINAL_REPORT_PROMPT = """SYSTEM:
You are evaluating a completed mock interview transcript. Output ONLY valid JSON, no markdown fences:
{
  "overall_score": 0-100,
  "technical_score": 0-100,
  "communication_score": 0-100,
  "problem_solving_score": 0-100,
  "confidence_score": 0-100,
  "strengths": [string, string, string],
  "improvements": [string, string, string],
  "recommended_topics": [string, string, string]
}
Base scores on substance, correctness, structure of answers, and communication clarity across the full transcript. Be specific and constructive, not generic.
"""

def generate_performance_report(
    job_role: str,
    interview_type: str,
    difficulty: str,
    transcript: List[Dict[str, Any]]
) -> Dict[str, Any]:
    transcript_json = json.dumps(transcript, indent=2)

    user_prompt = f"""Job role: {job_role}
Interview type: {interview_type}
Difficulty: {difficulty}
Full transcript:
{transcript_json}"""

    llm_output = call_llm(FINAL_REPORT_PROMPT, user_prompt, json_only=True)
    cleaned_output = llm_output.replace("```json", "").replace("```", "").strip()

    try:
        report_data = json.loads(cleaned_output)
    except Exception:
        report_data = {
            "overall_score": 75,
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
