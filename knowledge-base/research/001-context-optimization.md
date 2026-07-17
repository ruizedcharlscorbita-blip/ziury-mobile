# RES-001: Context Window Optimization Strategy

* **Date**: 2026-07-17
* **Researchers**: AI Stack Contributors
* **Focus Area**: Large Language Model context packing and token management.

---

## Executive Summary

As codebase size increases, feeding entire workspaces to AI coding assistants degrades model performance and increases API costs. This research reviews strategies to optimize codebase representation inside the AI context window.

---

## 1. Background & Challenge

Typical LLM tools (e.g. Cursor, Claude Code) need access to code files. However:
1. **Context Window Limits**: While Gemini supports 1M-2M tokens, many models are capped at 128k-200k.
2. **Attention Degradation (Needle in a Haystack)**: Model reasoning accuracy declines when context is packed with irrelevant file contents.
3. **Cost**: Higher token counts translate directly to increased latency and operational costs.

---

## 2. Analyzed Tools

| Tool | Approach | Pros | Cons |
|---|---|---|---|
| **Repomix** | Pack entire repository into single XML/Markdown file. | Highly portable, simple file input, handles directory tree. | Large file sizes, easily overflows smaller contexts. |
| **RTK** | Custom file listing, excludes node_modules/builds. | Customizable filters, lightweight syntax. | Requires custom regex setups, no built-in schema formatting. |
| **Local File Watcher (Caveman)** | Watch open files and feed local active context only. | Minimizes tokens, maintains laser focus. | Lacks context about non-open files or dependencies. |

---

## 3. Conclusions & Recommendations

- **Use Repomix for full codebase review**: Highly effective for initial onboarding or architecture rewrites.
- **Use RTK / fd search for incremental modifications**: Keeps context limited to target files and direct dependencies.
- **Implement a Strict `.gitignore` policy**: Ensuring build caches, logs, and venvs are never packaged is the single most effective way to optimize token cost.
