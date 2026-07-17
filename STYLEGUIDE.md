# STYLEGUIDE.md — Project Style Guide

This document defines naming, folder structure, formatting, and commit conventions for the repository. All contributions (by humans or AI agents) must strictly follow these rules.

---

## 1. Naming Conventions

### File & Folder Naming
- **Folders**: Use lowercase, kebab-case for directories (e.g. `knowledge-base/`, `docs/`, `development-environment/`).
- **Markdown Files**: Use lowercase, kebab-case for documentation files (e.g. `context-optimization.md`, `ast-grep.md`).
- **Special AI Stack root files**: Always use uppercase for standard root documents (`CLAUDE.md`, `AGENTS.md`, `PROJECT.md`, `STYLEGUIDE.md`, `README.md`).
- **Scripts**: Use lowercase, kebab-case for automation scripts with `.sh` extensions (e.g. `knowledge-base-index.sh`).
- **Git Hooks**: Do not use extensions (e.g. `pre-commit`).

---

## 2. Markdown Formatting

- **Structure**: Maintain a clear logical heading outline using `#` through `####`.
- **Lists**: Use hyphens `-` for unordered lists. Keep them concise to prevent long line wrapping.
- **Alerts**: Use GitHub-style blockquotes for critical info:
  > [!NOTE]
  > Useful informational context.

  > [!IMPORTANT]
  > Critical instructions that must be followed.

  > [!WARNING]
  > High risk or breaking changes.
- **Code Blocks**: Always specify the language for syntax highlighting (e.g., ````bash````, ````json````).
- **Line Endings**: Always use LF (Unix) line endings for all text/code files.

---

## 3. Git Commit Conventions

We enforce semantic commit messages. Every commit message must be structured as follows:

```
<type>: <description>
```

### Allowed Types:
- **`feat`**: Adding a new starter template, script, or configuration.
- **`docs`**: Additions or updates to documentation and guidelines.
- **`fix`**: Correction to a script, link, formatting, or broken configuration.
- **`refactor`**: Reorganizing documents or scripts without changing behavior.
- **`chore`**: Maintenance, updating metadata, or index regeneration.

### Examples:
- `docs: add repomix setup guide to context optimization`
- `feat: add tester agent template`
- `fix: correct path checks in bootstrap script`
- `chore: update knowledge-base-index file mapping`
