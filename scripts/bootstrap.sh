#!/usr/bin/env bash
# ==============================================================================
# AI Stack v1.0 - Bootstrap Environment Script
# ==============================================================================
set -euo pipefail
IFS=$'\n\t'

# Get repository root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

echo "======================================================================"
echo "🚀 Bootstrapping AI Stack Environment"
echo "======================================================================"

# 1. Check Recommended CLI Tools
echo "🔍 Checking recommended command-line tools..."
TOOLS=(git rg fd ast-grep)
for tool in "${TOOLS[@]}"; do
    if command -v "$tool" >/dev/null 2>&1; then
        echo "  ✅ $tool is installed: $(command -v "$tool")"
    else
        echo "  ⚠️  $tool is NOT installed. (Recommended for Layer 8: Search)"
    fi
done

# 2. Check and copy local env file
echo "🔑 Checking local environment config..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "  ✅ Created local .env file from .env.example"
    else
        echo "  ❌ Error: .env.example file not found!"
        exit 1
    fi
else
    echo "  ✅ Local .env file already exists."
fi

# 3. Setup Git Hooks
echo "🪝 Configuring Git Hooks..."
if [ -d ".git" ]; then
    if [ -f "hooks/pre-commit" ]; then
        mkdir -p .git/hooks
        cp hooks/pre-commit .git/hooks/pre-commit
        chmod +x .git/hooks/pre-commit
        echo "  ✅ Pre-commit hook successfully installed at .git/hooks/pre-commit"
    else
        echo "  ⚠️  hooks/pre-commit not found. Skipping hook installation."
    fi
else
    echo "  ⚠️  .git directory not detected. Run 'git init' first to use hooks."
fi

echo "======================================================================"
echo "🎉 Bootstrap Complete! Ready to use AI Stack."
echo "======================================================================"
