# Development Environment Reference (Layer 7)

This document establishes standards and configurations for development workspaces, IDE extensions, Git setups, and containers.

---

## 1. VS Code Recommended Extensions

Create a `.vscode/extensions.json` file in your project:
```json
{
  "recommendations": [
    "saoudrizwan.claude-dev",
    "github.copilot",
    "streetsidesoftware.code-spell-checker",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint"
  ]
}
```

---

## 2. Git Configurations

Configure your local environment to ensure secure and semantic commits:

```bash
# Enable commit GPG signing globally (optional, recommended)
git config --global commit.gpgsign true

# Set standard core editor
git config --global core.editor "code --wait"

# Enforce LF endings on check-in, check-out as-is (best for cross-platform)
git config --global core.autocrlf input
```

---

## 3. Docker Recommendations

- **Use Multi-stage Builds**: Separates build dependencies from production runtimes to minimize image sizes.
- **Run as Non-Root**: Always create a non-root group and user inside Dockerfiles to protect host environments.
- **Cache Optimization**: Order commands to leverage Docker cache layers (e.g. copy package manifests and install dependencies before copying source files).

---

## 4. Dev Container Configuration

Use the Dev Container specification to enable zero-setup onboarding. Save this as `.devcontainer/devcontainer.json`:

```json
{
  "name": "AI-Assisted Environment",
  "image": "mcr.microsoft.com/devcontainers/base:ubuntu",
  "features": {
    "ghcr.io/devcontainers/features/node:1": {},
    "ghcr.io/devcontainers/features/git:1": {}
  },
  "customizations": {
    "vscode": {
      "extensions": [
        "saoudrizwan.claude-dev",
        "github.copilot",
        "esbenp.prettier-vscode"
      ]
    }
  },
  "postCreateCommand": "bash ./scripts/bootstrap.sh"
}
```
