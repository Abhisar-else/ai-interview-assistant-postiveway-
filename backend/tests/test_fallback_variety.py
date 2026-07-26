from app.services.ai_interviewer import generate_next_question


def test_fallback_questions_vary_by_interview_type_and_turn():
    """
    Reproduces: with no LLM API key configured, every question -- regardless
    of job_role, interview_type, difficulty, or turn number -- was the exact
    same hardcoded sentence. Fallback questions should differ by
    interview_type and should not repeat every turn.
    """
    hr_q = generate_next_question("Frontend Developer", "HR", "Easy", {}, [], is_first_turn=True)
    coding_q = generate_next_question("Full Stack Developer", "Coding", "Medium", {}, [], is_first_turn=True)
    assert hr_q != coding_q, "HR and Coding fallback questions should not be identical"

    turn0 = generate_next_question("Data Scientist", "Technical", "Hard", {}, [], is_first_turn=True)

    transcript = [{"role": "ai", "content": turn0}, {"role": "user", "content": "a0"}]
    turn1 = generate_next_question("Data Scientist", "Technical", "Hard", {}, transcript, is_first_turn=False)

    transcript += [{"role": "ai", "content": turn1}, {"role": "user", "content": "a1"}]
    turn2 = generate_next_question("Data Scientist", "Technical", "Hard", {}, transcript, is_first_turn=False)

    transcript += [{"role": "ai", "content": turn2}, {"role": "user", "content": "a2"}]
    turn3 = generate_next_question("Data Scientist", "Technical", "Hard", {}, transcript, is_first_turn=False)

    assert len({turn0, turn1, turn2, turn3}) == 4, (
        "Technical fallback should visit all 4 pool questions across 4 turns of "
        "realistic (question+answer per turn) transcript growth, not just half of them"
    )