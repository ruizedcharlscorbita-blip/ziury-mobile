#!/usr/bin/env bash
# ==============================================================================
# SNP-001: Pre-commit Lint Snippet
# ==============================================================================
# Use this snippet within git hooks (e.g. .git/hooks/pre-commit) to validate
# repository formatting and directory structure compliance.
# ==============================================================================

set -euo pipefail

echo "=== Running Pre-Commit Lint Validation ==="

# Check for uncommitted secrets or keys
if git diff --cached | grep -E "API_KEY|SECRET_KEY|password" | grep -v "example" >/dev/null 2>&1; then
    echo "❌ ERROR: Potential API Key or Secret detected in diff."
    echo "Please double-check your changes or add exceptions."
    exit 1
fi

# Run formatting checks (dry-run)
if [ -f "./scripts/format.sh" ]; then
    bash ./scripts/format.sh
else
    echo "⚠️ Warning: format.sh script not found. Skipping formatting validation."
fi

# Run structural checks
if [ -f "./scripts/lint.sh" ]; then
    bash ./scripts/lint.sh
else
    echo "⚠️ Warning: lint.sh script not found. Skipping structure validation."
fi

echo "✅ Pre-commit validation passed."
exit 0
