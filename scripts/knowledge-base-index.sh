#!/usr/bin/env bash
# ==============================================================================
# AI Stack v1.0 - Knowledge & Documentation Indexer
# ==============================================================================
set -euo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

# Compute a portable file:// URL base from REPO_ROOT.
# Git Bash returns Unix-style paths like /c/Users/...
# We convert to Windows-style file URLs: file:///c:/Users/...
_REPO_STRIPPED="${REPO_ROOT#/}"
_DRIVE="${_REPO_STRIPPED:0:1}"
_REST="${_REPO_STRIPPED:1}"
_WIN_PATH="${_DRIVE}:${_REST}"
REPO_URL_BASE="file:///$(printf '%s' "$_WIN_PATH" | sed 's| |%20|g')"

INDEX_FILE="knowledge-base/INDEX.md"
TEMP_INDEX="knowledge-base/INDEX.md.tmp"

echo "======================================================================"
echo "📚 Rebuilding Knowledge Index: $INDEX_FILE"
echo "======================================================================"

# Write Header
cat << 'EOF' > "$TEMP_INDEX"
# Knowledge & Documentation Index

This document tracks all active architectural decisions, research logs, and technical references. It is updated automatically or manually using the `knowledge-base-index.sh` utility.

---

## 🏛️ Architectural Decision Records (ADRs)

| ID | Title | Date | Status | Description |
|---|---|---|---|---|
EOF

# Parse ADRs
echo "🔬 Scanning ADRs..."
# Sort matching files numerically
for file in $(find knowledge-base/ADR -type f -name "[0-9][0-9][0-9]-*.md" | sort); do
    BASE=$(basename "$file")
    NUM=${BASE%%-*}
    ID="ADR-${NUM}"

    # Extract title (first H1 line)
    TITLE=$(grep -E "^# " "$file" | head -n 1 | sed 's/^# //' || echo "Untitled")
    # Remove the ID prefix from title if present (e.g. ADR-001:)
    TITLE=$(echo "$TITLE" | sed -E 's/^ADR-[0-9]{3}: //')

    # Extract Status and Date
    DATE=$(grep -i "\*\*Date\*\*" "$file" | head -n 1 | sed -E 's/.*Date\*\*:[[:space:]]*//' | sed 's/\*//g' | tr -d '\r' || echo "Unknown")
    if [ "$DATE" == "Unknown" ]; then
        DATE=$(grep -i "Date:" "$file" | head -n 1 | sed -E 's/.*Date:[[:space:]]*//' | tr -d '\r' || echo "Unknown")
    fi

    STATUS_VAL=$(grep -i "\*\*Status\*\*" "$file" | head -n 1 | sed -E 's/.*Status\*\*:[[:space:]]*//' | sed 's/\*//g' | tr -d '\r' || echo "Draft")
    if [ "$STATUS_VAL" == "Draft" ]; then
        STATUS_VAL=$(grep -i "Status:" "$file" | head -n 1 | sed -E 's/.*Status:[[:space:]]*//' | tr -d '\r' || echo "Draft")
    fi

    # Extract Description (first paragraph of Context or first non-empty line after headers)
    DESC=$(grep -A 2 -i "Context" "$file" | tail -n 1 | tr -d '\r' || echo "")
    if [ -z "$DESC" ]; then
        DESC="No description provided."
    fi
    # Shorten description if too long
    if [ ${#DESC} -gt 100 ]; then
        DESC="${DESC:0:97}..."
    fi

    # Dynamic file URL derived from the actual REPO_ROOT at runtime
    URL="${REPO_URL_BASE}/knowledge-base/ADR/${BASE}"

    echo "| ${ID} | [${TITLE}](${URL}) | ${DATE} | ${STATUS_VAL} | ${DESC} |" >> "$TEMP_INDEX"
done

# Write Research section header
cat << 'EOF' >> "$TEMP_INDEX"

---

## 🔍 Technical Research Logs

| Code | Title | Date | Focus |
|---|---|---|---|
EOF

# Parse Research logs
echo "🔍 Scanning Research Logs..."
for file in $(find knowledge-base/research -type f -name "[0-9][0-9][0-9]-*.md" | sort); do
    BASE=$(basename "$file")
    NUM=${BASE%%-*}
    ID="RES-${NUM}"

    TITLE=$(grep -E "^# " "$file" | head -n 1 | sed 's/^# //' || echo "Untitled")
    TITLE=$(echo "$TITLE" | sed -E 's/^RES-[0-9]{3}: //')

    DATE=$(grep -i "\*\*Date\*\*" "$file" | head -n 1 | sed -E 's/.*Date\*\*:[[:space:]]*//' | sed 's/\*//g' | tr -d '\r' || echo "Unknown")
    if [ "$DATE" == "Unknown" ]; then
        DATE=$(grep -i "Date:" "$file" | head -n 1 | sed -E 's/.*Date:[[:space:]]*//' | tr -d '\r' || echo "Unknown")
    fi

    FOCUS_VAL=$(grep -i "\*\*Focus Area\*\*" "$file" | head -n 1 | sed -E 's/.*Focus Area\*\*:[[:space:]]*//' | sed 's/\*//g' | tr -d '\r' || echo "")
    if [ -z "$FOCUS_VAL" ]; then
        FOCUS_VAL=$(grep -i "Focus:" "$file" | head -n 1 | sed -E 's/.*Focus:[[:space:]]*//' | tr -d '\r' || echo "General investigation.")
    fi

    URL="${REPO_URL_BASE}/knowledge-base/research/${BASE}"

    echo "| ${ID} | [${TITLE}](${URL}) | ${DATE} | ${FOCUS_VAL} |" >> "$TEMP_INDEX"
done

# Write Patterns section header
cat << 'EOF' >> "$TEMP_INDEX"

---

## 🧩 Architectural & Code Patterns

EOF

# Parse Patterns
echo "🧩 Scanning Patterns..."
for file in $(find knowledge-base/patterns -type f -name "[0-9][0-9][0-9]-*.md" | sort); do
    BASE=$(basename "$file")
    NUM=${BASE%%-*}
    ID="PTN-${NUM}"

    TITLE=$(grep -E "^# " "$file" | head -n 1 | sed 's/^# //' || echo "Untitled")
    TITLE=$(echo "$TITLE" | sed -E 's/^PTN-[0-9]{3}: //')

    URL="${REPO_URL_BASE}/knowledge-base/patterns/${BASE}"
    echo "- [${ID}: ${TITLE}](${URL})" >> "$TEMP_INDEX"
done

# Write Snippets section header
cat << 'EOF' >> "$TEMP_INDEX"

---

## ✂️ Code Snippets

EOF

# Parse Snippets
echo "✂️ Scanning Snippets..."
for file in $(find knowledge-base/snippets -type f -name "[0-9][0-9][0-9]-*.*" | sort); do
    BASE=$(basename "$file")
    NUM=${BASE%%-*}
    ID="SNP-${NUM}"

    # Extract title from first line comments matching # SNP-XXX:
    TITLE=$(grep -E "^# SNP-[0-9]{3}:" "$file" | head -n 1 | sed -E 's/^# SNP-[0-9]{3}:[[:space:]]*//' | tr -d '\r' || echo "Code Snippet")

    URL="${REPO_URL_BASE}/knowledge-base/snippets/${BASE}"
    echo "- [${ID}: ${TITLE}](${URL})" >> "$TEMP_INDEX"
done

mv "$TEMP_INDEX" "$INDEX_FILE"
echo "✅ Knowledge Index successfully regenerated!"
exit 0
