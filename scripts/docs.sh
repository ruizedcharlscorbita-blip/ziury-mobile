#!/usr/bin/env bash
# ==============================================================================
# AI Stack v1.0 - Documentation Template Generator
# ==============================================================================
set -euo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

print_usage() {
    echo "Usage: bash ./scripts/docs.sh <template_name> <output_name>"
    echo ""
    echo "Available templates:"
      echo "  adr           -> knowledge-base/ADR/<output_name>.md"
    echo "  research      -> knowledge-base/research/<output_name>.md"
    echo "  design-doc    -> docs/<output_name>.md"
    echo "  meeting-notes -> docs/meetings/<output_name>.md"
    echo "  api-doc       -> docs/<output_name>.md"
}

if [ $# -lt 2 ]; then
    print_usage
    exit 1
fi

TEMPLATE_TYPE="$1"
OUTPUT_NAME="$2"

# Append extension if missing
if [[ ! "$OUTPUT_NAME" =~ \.md$ ]]; then
    OUTPUT_NAME="${OUTPUT_NAME}.md"
fi

case "$TEMPLATE_TYPE" in
    adr)
        TARGET_FILE="knowledge-base/ADR/$OUTPUT_NAME"
        SOURCE_FILE="templates/adr.md"
        ;;
    research)
        TARGET_FILE="knowledge-base/research/$OUTPUT_NAME"
        SOURCE_FILE="templates/research.md"
        ;;
    design-doc)
        TARGET_FILE="docs/$OUTPUT_NAME"
        SOURCE_FILE="templates/design-doc.md"
        ;;
    meeting-notes)
        mkdir -p docs/meetings
        TARGET_FILE="docs/meetings/$OUTPUT_NAME"
        SOURCE_FILE="templates/meeting-notes.md"
        ;;
    api-doc)
        TARGET_FILE="docs/$OUTPUT_NAME"
        SOURCE_FILE="templates/api-doc.md"
        ;;
    *)
        echo "❌ Error: Unknown template type '$TEMPLATE_TYPE'."
        print_usage
        exit 1
        ;;
esac

# Validate template exists
if [ ! -f "$SOURCE_FILE" ]; then
    echo "❌ Error: Source template '$SOURCE_FILE' not found!"
    exit 1
fi

# Ensure target directory exists
mkdir -p "$(dirname "$TARGET_FILE")"

# Avoid overwriting
if [ -f "$TARGET_FILE" ]; then
    echo "❌ Error: Target file '$TARGET_FILE' already exists!"
    exit 1
fi

# Copy template
cp "$SOURCE_FILE" "$TARGET_FILE"
echo "✅ Template generated: $TARGET_FILE"

# Re-run index script if it was ADR or Research
if [ "$TEMPLATE_TYPE" == "adr" ] || [ "$TEMPLATE_TYPE" == "research" ]; then
    if [ -f "scripts/knowledge-base-index.sh" ]; then
        bash scripts/knowledge-base-index.sh
    fi
fi

exit 0
