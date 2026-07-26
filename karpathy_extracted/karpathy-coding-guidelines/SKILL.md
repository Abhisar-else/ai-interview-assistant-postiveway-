---
name: karpathy-coding-guidelines
description: Four coding-discipline principles for writing or editing code — think before coding instead of silently guessing at ambiguous requests, prefer the simplest solution over speculative abstraction, make surgical changes that don't touch unrelated code, and turn vague tasks into goal-driven success criteria you can verify. Use this whenever the user asks for a code change, a bug fix, a refactor, or "add a feature", especially when the request is ambiguous, the codebase already exists, or there's a risk of overengineering or drive-by edits. Trigger on "fix the bug", "refactor X", "add validation", "implement this", or any request to modify an existing codebase.
---

# Karpathy-Inspired Coding Guidelines

Condensed from [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills), a single-file guideline set derived from Andrej Karpathy's observations about common LLM coding failure modes: models silently making wrong assumptions and running with them, overcomplicating code and bloating abstractions, and touching or removing code they don't fully understand as a side effect.

Four principles, applied together, directly counter this.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

- If a request is ambiguous, state the assumption explicitly or ask — don't silently pick an interpretation and run with it.
- When more than one reasonable design exists, present the alternatives rather than committing to one without mentioning the others.
- Push back if you can see a simpler approach than what was asked for — say so before implementing the more complex version.
- If something in the task or the existing code is genuinely unclear, name exactly what's unclear and ask, rather than guessing and hoping it works out.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was actually requested.
- No abstractions built for hypothetical future use cases or "just in case."
- No configurability, flexibility, or extensibility that wasn't asked for.
- No error handling for scenarios that can't actually occur given the calling context.
- If a solution could be 50 lines but is currently sketched at 200, rewrite it down.

**The test:** would a senior engineer reviewing this call it overcomplicated? If yes, simplify before showing it.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting that isn't part of the request.
- Don't refactor things that aren't broken just because you noticed them.
- Match the existing style even where you'd personally do it differently.
- If you notice unrelated dead code or issues, mention them to the user — don't silently delete or fix them as a drive-by.

When your own changes create orphaned code:
- Do remove imports, variables, or functions that your edit made unused.
- Don't remove pre-existing dead code that predates your change unless asked to.

**The test:** every changed line in the diff should trace directly back to the user's request. If it doesn't, it shouldn't be in the diff.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Vague imperative instructions ("make it work," "fix the bug") force constant back-and-forth. Turn them into concrete, verifiable goals instead:

| Instead of...    | Transform to...                                       |
|------------------|--------------------------------------------------------|
| "Add validation" | Write tests for invalid inputs, then make them pass    |
| "Fix the bug"    | Write a test that reproduces it, then make it pass     |
| "Refactor X"     | Ensure the existing tests pass before and after         |

For any multi-step task, state a brief plan up front with a verification check per step:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong, specific success criteria let you work through a task with less hand-holding. Weak criteria like "make it work" invite exactly the kind of unchecked assumptions Principle 1 warns against.

## Applying all four together

A typical flow on a real request:

1. Read the request. If it's ambiguous or has multiple valid interpretations, say so (Principle 1) before writing anything.
2. Sketch the smallest change that satisfies it — resist bolting on extra flexibility (Principle 2).
3. Identify exactly which files/lines need to change, and nothing else (Principle 3).
4. Restate the task as a checklist with verification steps, and work through it, confirming each step actually checks out before moving on (Principle 4).

## Tradeoff note

These guidelines bias toward **caution over speed**. For genuinely trivial changes — a typo fix, an obvious one-liner — use judgment; not every change needs the full ceremony. The goal is cutting down costly mistakes on non-trivial work, not adding friction to simple ones.

## Signs it's working

- Diffs contain only the requested changes — no drive-by refactoring.
- Fewer rewrites caused by overcomplication; the simple version showed up first.
- Clarifying questions arrive before implementation, not after something broke.
- Reviews come back clean because nothing unrelated moved.

## Attribution

This skill is derived from the guidelines published in [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills) (MIT licensed), itself based on [Andrej Karpathy's public observations](https://x.com/karpathy/status/2015883857489522876) about LLM coding pitfalls. The original repo also ships a Cursor project rule and a Claude Code plugin form — this version is the standalone content adapted for direct use as a chat skill.
