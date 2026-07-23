#!/usr/bin/env bash
# ==============================================================================
# AI Stack v1.0 - Initialize Conversation Thread
# ==============================================================================
set -euo pipefail
IFS=$'
	'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

CONV_DIR="${CONV_DIR:-./conversations}"
mkdir -p "$CONV_DIR"

THREAD_ID="thread-$(date +%s)"
THREAD_DIR="$CONV_DIR/$THREAD_ID"
mkdir -p "$THREAD_DIR"

FIRST_AGENT="${1:-researcher}"
TARGET_AGENT="${2:-coder}"
TIMESTAMP="$(date -Iseconds)"

cat > "$THREAD_DIR/01-${FIRST_AGENT}-question.md" <<EOF
---
thread_id: "$THREAD_ID"
sequence: 1
from: "$FIRST_AGENT"
to: "$TARGET_AGENT"
state: pending_human
created_at: "$TIMESTAMP"
approved_at: ""
---

# TODO: Title

## Context

<!-- What is this conversation about? -->

## Message

<!-- Write the initial question or task here -->

## Human Notes

<!-- Change state to "approved" when ready to start the conversation -->
EOF

echo "Created conversation thread: $THREAD_DIR"
echo "Edit: $THREAD_DIR/01-${FIRST_AGENT}-question.md"
echo "Then run: bash scripts/conversation-manager.sh"
