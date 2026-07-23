# Knowledge & Memory Layer

This directory acts as the centralized repository for long-term memory, engineering decisions, architectural patterns, research logs, and code snippets.

## Contents
- `[INDEX.md](file:///c:/Users/Administrator/Desktop/GEMINI/projects/Ziury-mobile/ZIUR-AI-STACK%20V1/knowledge-base/INDEX.md)`: A index log tracking all documentation, research notes, and architectural decisions.
- `[MEMORY.md](file:///c:/Users/Administrator/Desktop/GEMINI/projects/Ziury-mobile/ZIUR-AI-STACK%20V1/knowledge-base/MEMORY.md)`: Active memory tracking project milestones, constraints, and current context.
- **`[ADR/](file:///c:/Users/Administrator/Desktop/GEMINI/projects/Ziury-mobile/ZIUR-AI-STACK%20V1/knowledge-base/ADR/README.md)`**: Architecture Decision Records detailing significant technical decisions.
- **`[research/](file:///c:/Users/Administrator/Desktop/GEMINI/projects/Ziury-mobile/ZIUR-AI-STACK%20V1/knowledge-base/research/README.md)`**: Logs and briefs of experimental/technical investigations.
- **`[patterns/](file:///c:/Users/Administrator/Desktop/GEMINI/projects/Ziury-mobile/ZIUR-AI-STACK%20V1/knowledge-base/patterns/README.md)`**: Code, architecture, and configuration design patterns.
- **`[snippets/](file:///c:/Users/Administrator/Desktop/GEMINI/projects/Ziury-mobile/ZIUR-AI-STACK%20V1/knowledge-base/snippets/README.md)`**: Reusable codebase specific utility snippets.

## Best Practices
- **Never delete decisions**: If an architecture choice is overturned, do not delete the ADR file; write a new ADR that supersedes the previous one.
- **Run the indexing script**: When adding files to `ADR/` or `research/`, run the `knowledge-base-index.sh` script to keep `INDEX.md` in sync.
- **Update MEMORY.md on major changes**: When reaching milestones or pivoting technical approaches, update `MEMORY.md`.
