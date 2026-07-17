# Observability Reference Guide (Layer 12)

This document details lightweight conventions for logging, AI API usage tracking, local token estimations, and cost monitoring without requiring heavy external SaaS solutions.

---

## 1. Local Logging Conventions

Follow a standard, plaintext-friendly logging structure. Logs should print to `stdout`/`stderr` or append to local log files:

```
[TIMESTAMP] [LEVEL] [CONTEXT] Message
```

### Log Levels:
- **`INFO`**: Non-blocking status updates (e.g. `[2026-07-17T19:11:35] [INFO] [BOOTSTRAP] Git hooks configured successfully.`).
- **`WARN`**: Minor issues or fallback triggers (e.g. `[WARN] [SEARCH] ripgrep is not installed. Falling back to find.`).
- **`ERROR`**: Blocking execution failures requiring immediate attention.

---

## 2. AI Usage & Token Tracking

Tracking input and output tokens is critical to manage LLM API costs.

### Token Estimation formula
For plaintext prompts:
- **English Text**: Roughly `1 token ≈ 4 characters` or `0.75 words`.
- **Code**: Roughly `1 token ≈ 3 characters` due to indentation and special characters.

### Local Command Check (word count estimation):
You can estimate tokens for a packaged repository context file (e.g. `repomix-output.txt` or `rtk-output.txt`) using shell commands:

```bash
# Estimate token count (chars divided by 3)
CHARS=$(wc -c < repomix-output.txt)
EST_TOKENS=$((CHARS / 3))
echo "Estimated Context Tokens: $EST_TOKENS"
```

---

## 3. Local Cost Calculation

To track costs, log metadata in a simple local CSV file (`costs.csv`) after invoking external LLMs:

```csv
Date,Model,InputTokens,OutputTokens,CostUSD
2026-07-17,claude-3-5-sonnet,45000,1200,0.141
```

### Reference API Rates (approximate per million tokens):
- **Claude 3.5 Sonnet**: $3.00 input / $15.00 output
- **Gemini 1.5 Pro**: $1.25 input / $5.00 output
- **GPT-4o**: $5.00 input / $15.00 output
