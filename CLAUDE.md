# CLAUDE.md — AI assistant guidelines

This file provides context and instructions for AI coding assistants (such as Claude Code, cursor, windsurf, etc.) working on this repository.

> [!NOTE]
> **Core Recommendation**: When in doubt, choose the simpler implementation. This repository is intended to be a lightweight engineering foundation, not a framework or platform. Avoid over-engineering, unnecessary abstractions, and excessive dependencies.

## Standard Development Commands

### Environment & Setup
- **Bootstrap Environment**: `bash ./scripts/bootstrap.sh`
- **Lint Project Structure & Rules**: `bash ./scripts/lint.sh`
- **Format Code & Markdown**: `bash ./scripts/format.sh`
- **Build / Validate Documentation Index**: `bash ./scripts/knowledge-base-index.sh`
- **Generate Template Files**: `bash ./scripts/docs.sh`
- **Start New Research Note**: `bash ./scripts/research.sh`

## Coding Standards & Preferences
- **Languages**: Use Markdown (`.md`), Shell Scripting (`.sh`), JSON (`.json`), and YAML (`.yaml`). Avoid introducing Python, Node.js, or other complex languages unless strictly necessary.
- **Structure**: Every folder **must** contain a `README.md` file explaining its purpose, contents, and best practices.
- **Portability**: Write bash scripts using portable syntax. Use LF line endings for all scripts.
- **Readability**: Prefer explicit, self-documenting code and clear Markdown structures over complex or nested logic.

## Response Style
- **Conciseness**: Keep explanations brief and structured. Rely on Markdown headings and lists.
- **Clickable Links**: Always include relative or absolute links to files and symbols when discussing code (e.g. `[README.md](file:///c:/Users/Administrator/Desktop/GEMINI/projects/Ziury-mobile/ZIUR-AI-STACK%20V1/README.md)`).
- **No Placeholders**: Never generate partial implementations or placeholders. Provide complete files and configurations.
- **Task Tracking**: Refer to and update the task tracking file at `<appDataDir>/brain/<conversation-id>/task.md` or a local equivalent if appropriate.
