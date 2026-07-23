# Multi-Agent Conversation Example

Demonstrates the **Markdown Mail Protocol** for agent-to-agent communication with human-in-the-loop approval.

## How It Works

```
Researcher writes draft → Script marks pending_human → Human approves
→ Script routes to Coder → Coder writes draft → Script marks pending_human
→ Human approves → Script routes to Researcher → ...
```

## File Structure

```
conversations/
└── thread-001/
    ├── 01-researcher-question.md   # state: approved
    └── 02-coder-answer.md          # state: pending_human
```

## States

| State | Meaning |
|---|---|
| `draft` | Agent just created this, script will mark as pending |
| `pending_human` | Waiting for human to review and approve |
| `approved` | Human approved, script will route to next agent |
| `completed` | Already processed by script |

## Quick Start

1. **Create a thread:**
   ```bash
   mkdir -p conversations/thread-$(date +%s)
   ```

2. **Write first message** from researcher (set state to `approved` to auto-route)

3. **Run manager:**
   ```bash
   bash scripts/conversation-manager.sh
   ```

4. **Approve messages:** Edit `state: pending_human` → `state: approved` in the file

## Configuration

Set agent invocation commands via environment:

```bash
export RESEARCHER_CMD="ollama run researcher-model"
export CODER_CMD="ollama run coder-model"
bash scripts/conversation-manager.sh
```

Without commands set, manager prompts you to manually feed the prompt to your AI tool.
