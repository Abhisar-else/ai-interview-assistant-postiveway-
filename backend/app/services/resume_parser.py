import json
import pdfplumber
from typing import Dict, Any, Tuple
from app.services.llm import call_llm

RESUME_PROMPT = """SYSTEM:
You convert raw resume text into structured JSON. Output ONLY valid JSON, no markdown fences, no commentary.

Schema:
{
  "name": string,
  "skills": [string],
  "projects": [{"title": string, "description": string, "tech": [string]}],
  "experience": [{"role": string, "company": string, "duration": string, "highlights": [string]}],
  "education": [{"degree": string, "institution": string, "year": string}]
}
"""

def extract_text_from_pdf(file_path: str) -> str:
    extracted_text = ""
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"
    except Exception as e:
        extracted_text = f"Raw text extraction failed: {e}"
    return extracted_text.strip()

def parse_resume(file_path: str) -> Tuple[str, Dict[str, Any]]:
    raw_text = extract_text_from_pdf(file_path)

    user_prompt = f"Resume text:\n\"\"\"\n{raw_text}\n\"\"\""

    llm_output = call_llm(RESUME_PROMPT, user_prompt, json_only=True)

    # Clean markdown fences defensively
    cleaned_output = llm_output.replace("```json", "").replace("```", "").strip()

    try:
        parsed_json = json.loads(cleaned_output)
    except Exception:
        parsed_json = {
            "name": "Candidate",
            "skills": ["General Engineering"],
            "projects": [],
            "experience": [],
            "education": []
        }

    return raw_text, parsed_json
