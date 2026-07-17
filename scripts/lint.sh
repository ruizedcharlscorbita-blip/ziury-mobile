#!/usr/bin/env bash
# ==============================================================================
# AI Stack v1.0 - Project Structure Linter
# ==============================================================================
set -euo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

echo "======================================================================"
echo "🛡️ Linting Repository Structure & Constraints"
echo "======================================================================"

STATUS=0

# 1. Verify that every folder contains a README.md (case-insensitive)
echo "📁 Checking for mandatory README.md in directories..."
# Get all folders, excluding hidden folders (.git, .mcp, etc.) and vendor directories
DIRS=$(find . -type d -not -path "*/.*" -not -path "*node_modules*" -not -path "*tmp*" -not -path "./hooks")

for dir in $DIRS; do
    # Skip root directory check since it has README.md, but let's check it anyway or just skip
    if [ "$dir" == "." ]; then
        continue
    fi

    if [ ! -f "$dir/README.md" ] && [ ! -f "$dir/readme.md" ]; then
        echo "  ❌ Fail: Directory '$dir' is missing README.md"
        STATUS=1
    fi
done

# 2. Check for secret files or patterns checked in
echo "🔑 Checking for potential secret files..."
DANGEROUS_FILES=$(find . -type f \( -name "*.pem" -o -name "*.key" -o -name "*.pfx" \) -not -path "*/.*" -not -path "*node_modules*")
for dfile in $DANGEROUS_FILES; do
    echo "  ❌ Fail: Dangerous secret file '$dfile' detected in workspace!"
    STATUS=1
done

if [ $STATUS -eq 0 ]; then
    echo "✅ Structural linting passed successfully."
else
    echo "❌ Linting errors detected. Please address folders missing README.md."
fi

exit $STATUS
