# Git Hooks Configuration

This directory contains Git hooks templates used to validate codebase layout, prevent credential leakages, and enforce formatting guidelines before committing.

## Contents
- `[pre-commit](file:///c:/Users/Administrator/Desktop/GEMINI/projects/Ziury-mobile/hooks/pre-commit)`: Shell script executing formatting and structure checks before commits are finalized.

## How to Install
Git hooks are automatically copied and configured when running the bootstrap script:
```bash
bash ./scripts/bootstrap.sh
```

Alternatively, you can copy them manually:
```bash
cp hooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```
