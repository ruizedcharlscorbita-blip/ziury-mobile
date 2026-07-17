# AGENTS.md — Shared Assistant Instructions

This document contains shared instructions and persona guidelines for AI agents, developers, and code copilots working within this repository. All AI agents interacting with this workspace must adhere to these directives.

---

## Agent Philosophy

We follow a **Capability-First, One-Tool-Per-Capability, Markdown-First, Local-First, AI-Agnostic** approach.

> [!IMPORTANT]
> **Simplicity First**: When in doubt, choose the simpler implementation. This repository is intended to be a lightweight engineering foundation, not a framework or platform. Avoid over-engineering, unnecessary abstractions, and excessive dependencies.

---

## Directives for AI Assistants

### 1. File Modification & Creation Rules
- **Maintain Documentation Integrity**: Keep existing docstrings and comments intact.
- **Self-Documenting Code**: Keep files documented at the directory level. If a new folder is created, you **MUST** create a `README.md` file inside it explaining:
  1. Purpose of the folder.
  2. Contents / File list.
  3. Best practices and conventions.
- **No Incomplete Content**: Do not write files with comments like `// TODO: Implement this` or `/* rest of code here */`. Write the complete block.

### 2. Style & Format
- **Markdown Headers**: Use clear hierarchies with `#`, `##`, `###`. Keep line lengths readable.
- **Syntax Highlighting**: Always specify language in markdown code blocks (e.g., ````bash````, ````json````, ````markdown````).
- **Paths & Referencing**: Use Markdown links to files when discussing changes (e.g., `[STYLEGUIDE.md](file:///c:/Users/Administrator/Desktop/GEMINI/projects/ai%20stack/STYLEGUIDE.md)`).

### 3. Tool Usage & Automation
- Use the provided automation scripts in `./scripts/` (such as `lint.sh` and `format.sh`) instead of implementing ad-hoc validation.
- Do not run `pip install`, `npm install`, or other packaging commands automatically. The codebase is designed to be zero-dependency by default.

### 4. Git and Commit Conventions
- Check and follow `[STYLEGUIDE.md](file:///c:/Users/Administrator/Desktop/GEMINI/projects/ai%20stack/STYLEGUIDE.md)` for naming conventions and commit styles.
- Commit messages must follow semantic commit formatting (e.g., `feat:`, `docs:`, `fix:`, `chore:`).
