import json
from typing import List, Dict, Any
from app.services.llm import call_llm

QUESTION_GEN_PROMPT = """SYSTEM:
You are a professional {interview_type} interviewer conducting a {difficulty} difficulty interview for the role of {job_role}. Ask exactly ONE question at a time. Do not answer your own question. Do not repeat a question already asked. Keep questions concise (1-3 sentences). Adjust tone: Technical = probing on concepts/code/design; HR = behavioral/motivation/culture-fit; Mixed = alternate between the two.

Candidate resume summary:
{resume_json_summary}

Conversation so far (last 5 turns):
{recent_transcript}
"""

def generate_next_question(
    job_role: str,
    interview_type: str,
    difficulty: str,
    resume_summary: Dict[str, Any],
    transcript: List[Dict[str, Any]],
    is_first_turn: bool = False
) -> str:
    # Prepare resume summary string
    resume_str = json.dumps(resume_summary) if resume_summary else "No resume uploaded."

    # Keep last 5 turns to control token cost
    recent_turns = transcript[-5:] if transcript else []
    transcript_str = "\n".join([f"{t.get('role', 'user')}: {t.get('content', '')}" for t in recent_turns]) if recent_turns else "None"

    system_prompt = QUESTION_GEN_PROMPT.format(
        interview_type=interview_type,
        difficulty=difficulty,
        job_role=job_role,
        resume_json_summary=resume_str,
        recent_transcript=transcript_str
    )

    if is_first_turn or not transcript:
        user_prompt = "Ask the opening question for this interview."
    else:
        last_turn = transcript[-1] if transcript else {}
        last_answer = last_turn.get("content", "")
        user_prompt = f"""The candidate just answered: "{last_answer}"
Decide whether to (a) ask a natural follow-up that probes deeper on this answer, or (b) move to a new topic appropriate for the role/difficulty. Then output only the next question — no preamble, no labels."""

    response = call_llm(system_prompt, user_prompt)
    return response.replace("Interviewer:", "").replace("Question:", "").strip()
