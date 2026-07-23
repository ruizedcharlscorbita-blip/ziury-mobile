# Security Reference Guide (Layer 10)

This document defines security rules for secret management, API storage, and preventing credentials leaks.

---

## 1. Local Credentials & Gitignore

- **Ignore Active Credentials**: Never commit `.env` or other active config files to Git. Staged credentials must be caught by pre-commit hooks.
- **Provide Templates**: Always commit `.env.example` templates containing dummy placeholders for configuration.
- **Prevent Key Files Leak**: Ensure private keys (`.pem`, `.key`), certificates, and credentials folders are declared in the project's root `[.gitignore](file:///c:/Users/Administrator/Desktop/GEMINI/projects/Ziury-mobile/ZIUR-AI-STACK%20V1/.gitignore)`.

---

## 2. API Key Storage

- **Local Storage**: Store local API keys inside `.env`. Do not hardcode credentials in source code.
- **System Environment Variables**: For CI/CD and production runtimes, load API credentials from system env variables or cloud key vaults (e.g. AWS Secrets Manager, GCP Secret Manager, Vault).
- **Environment Loaders**: Load keys using safe configuration loaders at startup and fail fast if required variables are missing:
  ```bash
  # Shell validation example
  if [ -z "${GEMINI_API_KEY:-}" ]; then
      echo "❌ Error: GEMINI_API_KEY is not defined!"
      exit 1
  fi
  ```

---

## 3. Safe Development Practices

- **Scan Commits**: If a secret is accidentally committed, rotate the credentials *immediately*. Deleting the commit in Git history is not enough, as history remains cached or mirrored.
- **Enable Hook Audits**: Keep the git hooks active by running `./scripts/bootstrap.sh` on onboarding.
