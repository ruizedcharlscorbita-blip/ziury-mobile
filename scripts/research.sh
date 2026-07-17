#!/usr/bin/env bash
# ==============================================================================
# AI Stack v1.0 - Research Log Initializer
# ==============================================================================
set -euo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

if [ $# -lt 1 ]; then
    echo "Usage: bash ./scripts/research.sh <short-title-with-dashes>"
    echo "Example: bash ./scripts/research.sh database-benchmarks"
    exit 1
fi

TITLE_SLUG="$1"

# Convert title slug to lower kebab-case
TITLE_SLUG=$(echo "$TITLE_SLUG" | tr '[:upper:]' '[:lower:]' | tr ' _' '-')

# Find the next serial number in knowledge-base/research/
MAX_NUM=0
mkdir -p knowledge-base/research
for file in knowledge-base/research/[0-9][0-9][0-9]-*.md; do
    if [ -e "$file" ]; then
        BASE=$(basename "$file")
        NUM=${BASE%%-*}
        # Remove leading zeros to treat as decimal number in bash
        NUM_VAL=$((10#$NUM))
        if [ "$NUM_VAL" -gt "$MAX_NUM" ]; then
            MAX_NUM=$"$NUM_VAL"
        fi
    fi
done

NEXT_NUM=$((MAX_NUM + 1))
# Format next number as a 3-digit string (e.g. 002)
NEXT_NUM_STR=$(printf "%03d" "$NEXT_NUM")

OUTPUT_FILE="knowledge-base/research/${NEXT_NUM_STR}-${TITLE_SLUG}.md"
TEMPLATE_FILE="templates/research.md"

if [ ! -f "$TEMPLATE_FILE" ]; then
    echo "❌ Error: Template file '$TEMPLATE_FILE' not found!"
    exit 1
fi

# Copy and replace placeholder title and date in output file
TODAY=$(date +"%Y-%m-%d")
cp "$TEMPLATE_FILE" "$OUTPUT_FILE"

# Replaces title in file (portable sed)
TITLE_DISPLAY=$(echo "$TITLE_SLUG" | tr '-' ' ' | awk '{for(i=1;i<=NF;i++)sub(/./,toupper(substr($i,1,1)),$i)}1')
if sed --version >/dev/null 2>&1; then
    sed -i "s/# Technical Research Note/# RES-${NEXT_NUM_STR}: ${TITLE_DISPLAY}/" "$OUTPUT_FILE"
    sed -i "s/\* \*\*Date\*\*: .*/\* \*\*Date\*\*: ${TODAY}/" "$OUTPUT_FILE"
else
    sed -i '' "s/# Technical Research Note/# RES-${NEXT_NUM_STR}: ${TITLE_DISPLAY}/" "$OUTPUT_FILE"
    sed -i '' "s/\* \*\*Date\*\*: .*/\* \*\*Date\*\*: ${TODAY}/" "$OUTPUT_FILE"
fi

echo "✅ Created new research log: $OUTPUT_FILE"

# Update Knowledge Index
if [ -f "scripts/knowledge-base-index.sh" ]; then
    bash scripts/knowledge-base-index.sh
fi

exit 0
