# Automation Scripts (Layer 6)

This directory contains lightweight shell scripts designed to bootstrap environments, format text/code, run linting checks, organize documentation, and manage research/index assets.

---

## 🛠️ Available Scripts

- **`[bootstrap.sh](file:///c:/Users/Administrator/Desktop/GEMINI/projects/Ziury-mobile/scripts/bootstrap.sh)`**: Sets up the local environment, checks tool dependencies (`git`, `ripgrep`, etc.), and installs git hooks.
- **`[format.sh](file:///c:/Users/Administrator/Desktop/GEMINI/projects/Ziury-mobile/scripts/format.sh)`**: Checks and fixes basic markdown and config formatting rules.
- **`[lint.sh](file:///c:/Users/Administrator/Desktop/GEMINI/projects/Ziury-mobile/scripts/lint.sh)`**: Enforces folder rules, validating that all folders have a `README.md` and no files violate naming standards.
- **`[docs.sh](file:///c:/Users/Administrator/Desktop/GEMINI/projects/Ziury-mobile/scripts/docs.sh)`**: Generates document templates (ADRs, design docs) interactively or on-demand.
- **`[research.sh](file:///c:/Users/Administrator/Desktop/GEMINI/projects/Ziury-mobile/scripts/research.sh)`**: Initializer to set up a new research log with standard headers.
- **`[knowledge-base-index.sh](file:///c:/Users/Administrator/Desktop/GEMINI/projects/Ziury-mobile/scripts/knowledge-base-index.sh)`**: Scans `ADR/` and `research/` directories to update `[INDEX.md](file:///c:/Users/Administrator/Desktop/GEMINI/projects/Ziury-mobile/knowledge-base/INDEX.md)`.

---

## 📝 Best Practices
- **Strict Execution Flag**: All scripts must execute from the repository root directory.
- **Line Endings**: Always write and save script files with LF line endings.
- **Error Handling**: Use `set -euo pipefail` in every script to prevent silent failures.
