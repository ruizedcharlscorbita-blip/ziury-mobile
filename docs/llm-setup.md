# LLM Provider Setup Guide

This guide covers both ways to connect AI tools to language models in this project: **Tier 1 BYOK** (default, zero setup) and **Tier 2 Proxy** (optional, unified routing via LiteLLM).

---

## Tier 1 — BYOK: Direct API Keys (Default)

The simplest setup. Your AI tools call provider APIs directly using the keys in your `.env` file. No server required.

### Step 1: Fill your `.env`

Open [`.env`](file:///c:/Users/Administrator/Desktop/GEMINI/projects/Ziury-mobile/.env) and set whichever keys you have:

```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-proj-...
GEMINI_API_KEY=AIzaSy...
```

Leave unused providers blank. That's it — Tier 1 is active.

---

### Step 2: Add Providers to Your AI Tool UI

Use these copy-paste values when adding providers in your AI coding assistant settings (e.g., Continue.dev, Cursor, Windsurf):

#### Anthropic (Claude)

| Field | Value |
|---|---|
| Provider ID | `anthropic` |
| Display Name | `Anthropic` |
| Base URL | `https://api.anthropic.com` |
| API Key | your `ANTHROPIC_API_KEY` value |
| Model IDs | `claude-sonnet-4-5`, `claude-opus-4`, `claude-haiku-3-5` |

#### OpenAI

| Field | Value |
|---|---|
| Provider ID | `openai` |
| Display Name | `OpenAI` |
| Base URL | `https://api.openai.com/v1` |
| API Key | your `OPENAI_API_KEY` value |
| Model IDs | `gpt-4o`, `gpt-4.1`, `gpt-4o-mini` |

#### Google Gemini

| Field | Value |
|---|---|
| Provider ID | `google-gemini` |
| Display Name | `Google Gemini` |
| Base URL | `https://generativelanguage.googleapis.com/v1beta` |
| API Key | your `GEMINI_API_KEY` value |
| Model IDs | `gemini-2.5-pro`, `gemini-2.0-flash` |

> [!IMPORTANT]
> **Gemini provider error fix**: If you see `"Unable to determine provider for model 'google-ge...'"`, you must use the `google-gemini` Provider ID (not `gemini`) OR prefix your model as `openai/google-gemini` in the combo entry format. The Base URL above resolves this when added as a proper standalone provider.

#### Mistral

| Field | Value |
|---|---|
| Provider ID | `mistral` |
| Display Name | `Mistral` |
| Base URL | `https://api.mistral.ai/v1` |
| API Key | your `MISTRAL_API_KEY` value |
| Model IDs | `mistral-large-latest`, `mistral-medium`, `mistral-small` |

#### Groq (fast inference)

| Field | Value |
|---|---|
| Provider ID | `groq` |
| Display Name | `Groq` |
| Base URL | `https://api.groq.com/openai/v1` |
| API Key | your `GROQ_API_KEY` value |
| Model IDs | `llama-3-70b-8192`, `mixtral-8x7b-32768` |

---

## Tier 2 — Provider Proxy: LiteLLM (Optional)

One local proxy server sits between your AI tools and all providers. You point every tool at `http://localhost:4000` and the proxy handles routing. Best for: teams, cost tracking, or switching models without reconfiguring every tool.

### How It Works

```
Your AI Tool  →  http://localhost:4000  →  LiteLLM Proxy  →  Anthropic / OpenAI / Gemini / ...
```

### Prerequisites

LiteLLM is a Python package. Install it once:

```bash
pip install litellm[proxy]
```

> [!NOTE]
> This is the only external dependency in the stack and is **completely optional**. If you do not want to use a proxy, skip this section entirely.

---

### Step 1: Create Your Proxy Config

Copy the example config:

```bash
cp .mcp/litellm.config.example.yaml .mcp/litellm.config.yaml
```

The YAML uses `os.environ/KEY_NAME` to read all keys from your `.env` — no real credentials go into the YAML file itself.

---

### Step 2: Set the Proxy Key in `.env`

Choose any string as your local master key and add it:

```bash
LLM_PROXY_API_KEY=my-local-stack-key
LLM_PROXY_BASE_URL=http://localhost:4000
```

---

### Step 3: Start the Proxy

```bash
litellm --config .mcp/litellm.config.yaml --port 4000
```

You should see output like:
```
LiteLLM: Proxy running on http://localhost:4000
```

To run it in the background:
```bash
litellm --config .mcp/litellm.config.yaml --port 4000 &
```

---

### Step 4: Add the Proxy as a Single Provider in Your AI Tool

Replace all individual providers with one entry:

| Field | Value |
|---|---|
| Provider ID | `litellm` |
| Display Name | `LiteLLM Proxy` |
| Base URL | `http://localhost:4000` |
| API Key | your `LLM_PROXY_API_KEY` value |
| Model IDs | `claude-sonnet-4-5`, `gpt-4o`, `gemini-2.5-pro`, `ollama/llama3` |

All model IDs must match the `model_name` values in your `litellm.config.yaml`.

---

### Switching Between Tiers

| Scenario | What to do |
|---|---|
| Use BYOK only | Fill Tier 1 keys in `.env`. Leave `LLM_PROXY_BASE_URL` blank. |
| Switch to Proxy | Fill `LLM_PROXY_BASE_URL` and `LLM_PROXY_API_KEY`. Update tool provider to point at `http://localhost:4000`. |
| Go back to BYOK | Clear `LLM_PROXY_BASE_URL`. Point tool provider back to direct API endpoints. |

---

## Tier 3 — Local / Offline Models

### Ollama

```bash
# Install and run a model locally
ollama pull llama3
ollama serve   # Starts on http://localhost:11434
```

In your AI tool, add as a provider:
- Base URL: `http://localhost:11434`
- No API key required
- Model ID: `llama3`, `mistral`, `codellama`, etc.

### LM Studio

Download from [lmstudio.ai](https://lmstudio.ai), load a model, and enable the local server. It runs on `http://localhost:1234/v1` by default with an OpenAI-compatible API.

---

## Security Notes

> [!CAUTION]
> - Never commit your `.env` file. It is already in `.gitignore`.
> - `litellm.config.yaml` (your live copy) is also gitignored. Only `litellm.config.example.yaml` is committed.
> - The Tier 2 proxy master key (`LLM_PROXY_API_KEY`) is a local auth mechanism — it is not your real provider key.

---

## References

- [`.env`](file:///c:/Users/Administrator/Desktop/GEMINI/projects/Ziury-mobile/.env) — Your local environment configuration
- [`.env.example`](file:///c:/Users/Administrator/Desktop/GEMINI/projects/Ziury-mobile/.env.example) — Template (safe to commit)
- [`.mcp/litellm.config.example.yaml`](file:///c:/Users/Administrator/Desktop/GEMINI/projects/Ziury-mobile/.mcp/litellm.config.example.yaml) — LiteLLM proxy config template
- [`.mcp/config.json`](file:///c:/Users/Administrator/Desktop/GEMINI/projects/Ziury-mobile/.mcp/config.json) — MCP server configuration
- [LiteLLM Docs](https://docs.litellm.ai/docs/proxy/quick_start)
