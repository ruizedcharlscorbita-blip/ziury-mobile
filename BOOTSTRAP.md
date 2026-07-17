# BOOTSTRAP.md — Onboarding Checklist

Follow this checklist to initialize your local development environment and configure AI Stack in your repository.

---

## 🛠️ Onboarding Checklist

### Step 1: Install Core Utilities
- [ ] **Install Git**: System version controller.
- [ ] **Install VS Code**: Recommended text editor and IDE.
- [ ] **Install Docker**: Containerized deployment helper.

### Step 2: Install AI Copilots & Context Tools
- [ ] **Install Claude Code** (or Cursor / Windsurf): Local-first CLI AI assistant.
- [ ] **Install MCP** (Model Context Protocol): Direct local context tool access for LLMs.
- [ ] **Install RTK**: Repo-to-text context packager.
- [ ] **Install Repomix**: Flat text codebase packer.

### Step 3: Run AI Stack Automation
- [ ] **Run bootstrap.sh**:
  ```bash
  bash ./scripts/bootstrap.sh
  ```
  *This automatically copies `.env.example` to `.env` and installs git pre-commit hooks.*
- [ ] **Verify structural linting**:
  ```bash
  bash ./scripts/lint.sh
  ```
  *Ensures every folder contains a README.md and naming structures comply.*

---

## 🎉 Ready

Once all items are checked, your development workspace is configured and ready for pair programming with AI agents.
