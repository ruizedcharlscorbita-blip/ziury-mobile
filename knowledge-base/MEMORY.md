# MEMORY.md — Project Memory & Learnings

This document serves as the project's persistent active context. It tracks major milestones, lessons learned, and the state of active tasks. Update this file whenever the project pivots, hits a milestone, or makes significant architectural decisions.

---

## 📅 Project History & Milestones

### 2026-07-17: Initial Project Setup
- **Milestone**: Completed AI Stack v1.0 layout and core files.
- **Learnings**:
  - Zero-dependency bash scripts provide maximum portability for initial repository templates.
  - Ensuring every folder has a local `README.md` file guarantees clear organization for new developers onboarding to the project.

---

## 🎯 Active Priorities

1. **Establish Automation Hooks**: Ensure `./scripts/` and `./hooks/` are set up and working via Git configs.
2. **Standardize Context Packing**: Set up Repomix and RTK guides for developer context optimization.
3. **Rollout Templates**: Provide ready-to-use ADR, issue, feature, and PR templates.

---

## 💡 Lessons Learned & Core Beliefs

- **Simplicity Over Abstraction**: Over-engineered build scripts or heavy external task-runners (like Gulp or Grunt) introduce dependency issues. Keep it to pure Bash/Shell and simple configurations.
- **Explicit Links**: AI coding assistants navigate the repo faster when Markdown documents use explicit relative or absolute file paths rather than vague descriptions.
