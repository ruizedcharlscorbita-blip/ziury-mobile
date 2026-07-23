# Prompt: Context Pack for AI Sessions

## Purpose
Instructions for packaging the right context files into an AI session so the model has everything it needs to assist without wasting tokens on irrelevant content.

---

## What to Include (Priority Order)

### 1. Always Include (Minimal Session)
Copy and paste the content of these files into your session or attach them via your AI tool's file upload:

| File | Why |
|---|---|
| `PROJECT.md` | Goals, architecture, and technology overview |
| `STYLEGUIDE.md` | Code and commit formatting rules |
| `AGENTS.md` | Behavioral directives for the AI |
| `knowledge-base/MEMORY.md` | Current project state and milestones |

### 2. Include for Architecture & Design Tasks
| File | Why |
|---|---|
| `knowledge-base/INDEX.md` | Full index of all ADRs, research, and patterns |
| `knowledge-base/ADR/*.md` | Specific ADRs relevant to the current decision |
| `knowledge-base/patterns/*.md` | Code/architecture patterns in use |

### 3. Include for Feature or Bug Work
| File | Why |
|---|---|
| `workflows/feature-development.md` or `workflows/bug-fix.md` | The step-by-step process for this type of task |
| Relevant `templates/*.md` | The output template the AI should fill |
| `agents/architect.md` or `agents/reviewer.md` | Load the appropriate persona |

---

## How to Pack Context Using Repomix (Optional)

If you have `repomix` installed, generate a single-file context dump:
```bash
npx repomix --output ./tmp/context-output.txt --include "PROJECT.md,STYLEGUIDE.md,AGENTS.md,knowledge-base/MEMORY.md,knowledge-base/INDEX.md"
```
The output path is controlled by `CONTEXT_OUTPUT_PATH` in your `.env` file.

---

## Token Budget Guidelines

| Session Type | Recommended Files | Approx. Tokens |
|---|---|---|
| Quick question | `PROJECT.md` only | ~500 |
| Feature task | Minimal set + workflow + template | ~3,000 |
| Full architecture review | All knowledge-base files + agents | ~8,000 |

---

## Anti-Patterns to Avoid
- ❌ Dumping the entire repository into a single context window
- ❌ Re-loading files the AI already has from a previous message
- ❌ Including binary files, `.git/` contents, or `.env` with real keys

---

## References
- [CLAUDE.md](file:///c:/Users/Administrator/Desktop/GEMINI/projects/Ziury-mobile/ZIUR-AI-STACK%20V1/CLAUDE.md)
- [docs/context-optimization.md](file:///c:/Users/Administrator/Desktop/GEMINI/projects/Ziury-mobile/ZIUR-AI-STACK%20V1/docs/context-optimization.md)
- [prompts/system-header.md](file:///c:/Users/Administrator/Desktop/GEMINI/projects/Ziury-mobile/ZIUR-AI-STACK%20V1/prompts/system-header.md)
