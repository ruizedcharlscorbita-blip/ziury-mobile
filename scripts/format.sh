#!/usr/bin/env bash
# ==============================================================================
# AI Stack v1.0 - Lightweight Formatting Script
# ==============================================================================
set -euo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

echo "======================================================================"
echo "🧹 Formatting Check: Markdown & Configurations"
echo "======================================================================"

# Find markdown and json files (ignoring hidden files, node_modules)
FILES=$(find . -type f \( -name "*.md" -o -name "*.json" \) -not -path "*/.*" -not -path "*node_modules*")

STATUS=0

for file in $FILES; do
    # Check for trailing whitespaces
    if grep -E '[[:space:]]+$' "$file" >/dev/null 2>&1; then
        echo "  ⚠️  $file has trailing whitespaces. Fixing..."
        # Remove trailing whitespaces in-place (handles macOS and GNU sed)
        if sed --version >/dev/null 2>&1; then
            sed -i 's/[[:space:]]*$//' "$file"
        else
            sed -i '' 's/[[:space:]]*$//' "$file"
        fi
    fi

    # Check for missing newline at end of file
    if [ -n "$(tail -c 1 "$file")" ]; then
        echo "  ⚠️  $file lacks newline at end of file. Appending..."
        echo "" >> "$file"
    fi
done

echo "✅ Formatting validation complete."
exit $STATUS
