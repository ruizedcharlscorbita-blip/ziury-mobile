# AI Agents & Role Instructions

This directory contains role-specific instructions and system prompts for configuring AI agents, subagents, and custom coding copilots.

## Agent Profiles

- `[architect.md](file:///c:/Users/Administrator/Desktop/GEMINI/projects/ai%20stack/agents/architect.md)`: Instructs the AI as a system architect. Focuses on design patterns, structure, and high-level requirements.
- `[backend.md](file:///c:/Users/Administrator/Desktop/GEMINI/projects/ai%20stack/agents/backend.md)`: Instructions for backend code tasks, performance, database schemas, and APIs.
- `[frontend.md](file:///c:/Users/Administrator/Desktop/GEMINI/projects/ai%20stack/agents/frontend.md)`: Instructions for frontend components, UI, accessibility, and styles.
- `[reviewer.md](file:///c:/Users/Administrator/Desktop/GEMINI/projects/ai%20stack/agents/reviewer.md)`: Rules for reviewing PRs, formatting checks, and security audits.
- `[researcher.md](file:///c:/Users/Administrator/Desktop/GEMINI/projects/ai%20stack/agents/researcher.md)`: Guidance for conducting technical evaluations and writing logs.
- `[tester.md](file:///c:/Users/Administrator/Desktop/GEMINI/projects/ai%20stack/agents/tester.md)`: Instructions for test-driven development, writing unit, integration, and end-to-end tests.

## Best Practices
- **Role Assignment**: Before delegating a task to a subagent or commencing work in an LLM chat, paste the content of the corresponding markdown file as the system prompt or prepended prompt.
- **Customization**: Feel free to extend these roles with project-specific constraints (e.g. "We use Go and PostgreSQL" in the backend agent instructions).
