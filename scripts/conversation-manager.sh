#!/usr/bin/env bash
# ==============================================================================
# AI Stack v1.0 - Multi-Agent Conversation Manager
# ==============================================================================
# Automatically orchestrates agent-to-agent conversations with human-in-the-loop
# approval. Polls conversation directory, routes messages, invokes agents.
#
# Usage:
#   bash scripts/conversation-manager.sh [conversations_dir]
#
# Configuration (env vars):
#   CONV_DIR        - Conversation directory (default: ./conversations)
#   POLL_INTERVAL   - Seconds between polls (default: 2)
#   RESEARCHER_CMD  - Command to invoke researcher agent
#   CODER_CMD       - Command to invoke coder agent
# ==============================================================================
set -euo pipefail
IFS=$'
	'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

CONV_DIR="${CONV_DIR:-./conversations}"
POLL_INTERVAL="${POLL_INTERVAL:-2}"
RESEARCHER_CMD="${RESEARCHER_CMD:-}"
CODER_CMD="${CODER_CMD:-}"

mkdir -p "$CONV_DIR"

# --- helpers ---

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

list_threads() {
    find "$CONV_DIR" -maxdepth 1 -type d -name 'thread-*' | sort
}

latest_message_in_thread() {
    local thread="$1"
    find "$thread" -maxdepth 1 -type f -name '*.md' | sort -V | tail -n 1
}

extract_frontmatter() {
    local file="$1"
    local key="$2"
    sed -n '/^---$/,/^---$/p' "$file" | grep "^$key:" | sed "s/^$key: *//" | tr -d '"'
}

set_frontmatter() {
    local file="$1"
    local key="$2"
    local value="$3"
    sed -i "s/^$key:.*/$key: \"$value\"/" "$file"
}

generate_message_filename() {
    local thread="$1"
    local seq
    seq=$(($(find "$thread" -maxdepth 1 -type f -name '*.md' | wc -l) + 1))
    printf "%02d" "$seq"
}

invoke_agent() {
    local agent="$1"
    local prompt_file="$2"
    local cmd_var="${agent^^}_CMD"
    local cmd="${!cmd_var:-}"

    if [[ -n "$cmd" ]]; then
        log "🤖 Invoking $agent via: $cmd"
        "$cmd" "$prompt_file"
    else
        log "⏳ $agent not configured. Prompt ready at: $prompt_file"
        log "   Action: Feed prompt to $agent, paste response into draft file."
    fi
}

# --- state machine ---

process_thread() {
    local thread="$1"
    local thread_name
    thread_name="$(basename "$thread")"
    local latest
    latest="$(latest_message_in_thread "$thread")"

    [[ -z "$latest" ]] && return

    local state
    state="$(extract_frontmatter "$latest" "state")"

    case "$state" in
        draft)
            # New draft created by agent, mark pending human approval
            set_frontmatter "$latest" "state" "pending_human"
            log "📬 $thread_name: New draft from $(extract_frontmatter "$latest" "from") -> pending human approval"
            log "   File: $latest"
            ;;

        pending_human)
            # Waiting for human to edit state to "approved"
            # Do nothing until human acts
            ;;

        approved)
            # Human approved, route to next agent
            local from_agent
            from_agent="$(extract_frontmatter "$latest" "from")"
            local to_agent
            to_agent="$(extract_frontmatter "$latest" "to")"

            log "✅ $thread_name: Human approved message from $from_agent"

            # Create prompt for next agent
            local seq
            seq="$(generate_message_filename "$thread")"
            local prompt_file="$thread/${seq}-${to_agent}-prompt.md"

            cat > "$prompt_file" <<EOF
---
thread_id: "$thread_name"
sequence: $seq
from: "$to_agent"
to: "$( [[ "$to_agent" == "researcher" ]] && echo "coder" || echo "researcher" )"
state: draft
created_at: "$(date -Iseconds)"
approved_at: ""
---

# Response to $(extract_frontmatter "$latest" "from")

## Previous Message

$(sed '1,/^---$/d' "$latest" | sed '1,/^---$/d')

## Task

You are the **$to_agent** agent. Respond to the message above.
Continue the conversation thread toward the project goal.

## Output Format

Write your response as a markdown file with YAML frontmatter.
Save it to: $thread/${seq}-$(date +%s)-${to_agent}.md
EOF

            set_frontmatter "$latest" "state" "completed"
            invoke_agent "$to_agent" "$prompt_file"
            ;;

        completed)
            # Already processed, do nothing
            ;;
    esac
}

# --- main loop ---

log "🚀 Conversation Manager started"
log "   Watching: $(cd "$CONV_DIR" && pwd)"
log "   Poll interval: ${POLL_INTERVAL}s"
log "   Press Ctrl+C to stop"

while true; do
    for thread in $(list_threads); do
        process_thread "$thread"
    done
    sleep "$POLL_INTERVAL"
done
