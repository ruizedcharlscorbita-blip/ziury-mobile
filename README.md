# AI Stack v1.0

A reusable, local-first, AI-assisted software engineering foundation designed to be cloned directly into any project repository. It standardizes AI instructions, context optimization, templates, Git hooks, development environments, and search patterns.

> [!IMPORTANT]
> **Simplicity First**: When in doubt, choose the simpler implementation. This repository is intended to be a lightweight engineering foundation, not a framework or platform. Avoid over-engineering, unnecessary abstractions, and excessive dependencies.

---

## 🚀 Quick Start

To adopt the AI Stack in your repository:

1. **Clone or Copy**: Clone this repository or copy its contents into the root directory of your software project:
   ```bash
   git clone https://github.com/your-org/ai-stack.git .ai-stack
   # Or copy files directly into your active repository
   ```
2. **Run Bootstrap**: Initialize local Git hooks and check your development tools:
   ```bash
   bash ./scripts/bootstrap.sh
   ```
3. **Configure API Keys**: Create your local environment file:
   ```bash
   cp .env.example .env
   ```
4. **Customize Instructions**: Update the following root files to describe your project's code style, goals, and architecture:
   - `[PROJECT.md](file:///c:/Users/Administrator/Desktop/GEMINI/projects/ai%20stack/PROJECT.md)`: Describe your project goal, architecture, and technology.
   - `[CLAUDE.md](file:///c:/Users/Administrator/Desktop/GEMINI/projects/ai%20stack/CLAUDE.md)`: Set commands and preferences for Claude Code or other CLI agents.
   - `[STYLEGUIDE.md](file:///c:/Users/Administrator/Desktop/GEMINI/projects/ai%20stack/STYLEGUIDE.md)`: Define your code formatting, naming, and commit style.

---

## 📁 Repository Structure

The stack is organized into distinct layers to optimize developer and AI-assistant coordination:

```
ai-stack/
├── knowledge-base/     # Layer 1: Long-term memory & Architecture Decisions (ADRs)
├── prompts/            # Reusable prompt instructions & system headers
├── agents/             # Layer 4: Role-based AI instructions (architect, reviewer, etc.)
├── workflows/          # Standard engineering recipes & process steps
├── docs/               # Reference guides (security, search, environment setup, observability)
├── templates/          # Layer 9 & 11: Reusable markdown templates for tickets/docs
├── scripts/            # Layer 6: Automation tools (lint, format, bootstrap)
├── hooks/              # Layer 6: Git hooks (pre-commit checking)
└── .mcp/               # Layer 5: Model Context Protocol configs and recommendations
```

*Every folder contains a local `README.md` file detailing its specific purpose, contents, and best practices.*

---

## 🛠️ Core Principles

1. **Capability First**: Prioritize implementing practical tools and workflows rather than strict hierarchical structures.
2. **One Tool Per Capability**: Avoid overlapping tools or duplicative workflows.
3. **Markdown First**: Plaintext Markdown handles documentation, templating, and system guidance.
4. **Local First**: Keep configuration files, documentation, and hooks inside the codebase.
5. **AI Agnostic**: Ensure compatibility with Claude Code, Cursor, Windsurf, Copilot, Gemini CLI, and other systems.

---

## 📄 License

This project is licensed under the MIT License - see the `[LICENSE](file:///c:/Users/Administrator/Desktop/GEMINI/projects/ai%20stack/LICENSE)` file for details.
