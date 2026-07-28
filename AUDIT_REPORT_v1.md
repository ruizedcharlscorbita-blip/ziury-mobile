# AUDIT_REPORT_v1.md — Token Efficiency Audit: ZIUR-AI-STACK V1

**Audit Target:** `ZIUR-AI-STACK V1` Root & Infrastructure Subfolders  
**Audit Date:** July 26, 2026  
**Scope:** `.mcp`, `agents`, `docs`, `hooks`, `knowledge-base`, `prompts`, `scripts`, `templates`, `versions`, `workflows`, and root configuration files.  
**Mode:** Audit-only findings (no recommendations or file modifications included).

---

## Section 1 — Context Auto-Load Behavior

### 1. Auto-Loaded Files & Directories
At the start of an Antigravity session, the system automatically loads specific instructions, user rules, tool schemas, and skill definitions into the initial prompt context. Standard documentation and codebase files remain on disk and are only loaded on-demand when referenced or requested via tool calls.

| File / Component Path | Category / Source | File Size (KB) | File Size (Bytes) | Estimated Token Count | Auto-Loaded (Y/N) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `AGENTS.md` | Workspace Rules Directive | 2.51 KB | 2,510 B | ~628 tokens | **Y** |
| `C:\Users\Administrator\.gemini\config\AGENTS.md` | Global User Rule | 0.09 KB | 92 B | ~23 tokens | **Y** |
| Native & MCP Tool Schemas | Registered Tool Definitions | ~8.00 KB | ~8,192 B | ~2,000 tokens | **Y** |
| Installed Skill Summaries (21 skills) | Skill Frontmatter Metadata | ~9.50 KB | ~9,728 B | ~2,375 tokens | **Y** |
| System Identity & Instructions | Core System Prompt | ~12.50 KB | ~12,800 B | ~3,125 tokens | **Y** |
| `CLAUDE.md` | Root Assistant File | 2.05 KB | 2,047 B | ~512 tokens | **N** |
| `PROJECT.md` | Root Architecture Document | 2.55 KB | 2,548 B | ~637 tokens | **N** |
| `BOOTSTRAP.md` | Root Onboarding Checklist | 1.22 KB | 1,222 B | ~306 tokens | **N** |
| `README.md` | Root Readme File | 1.86 KB | 1,856 B | ~464 tokens | **N** |
| `STYLEGUIDE.md` | Root Style Guide | 2.24 KB | 2,237 B | ~559 tokens | **N** |
| `.mcp/config.json` | MCP Configuration | 0.36 KB | 360 B | ~90 tokens | **N** |
| `.mcp/README.md` | MCP Guidance | 2.67 KB | 2,669 B | ~667 tokens | **N** |
| `.mcp/litellm.config.example.yaml` | MCP Proxy Example | 4.33 KB | 4,331 B | ~1,083 tokens | **N** |

### 2. Auto-Loaded vs On-Demand Distinction
* **Always Loaded:** `AGENTS.md` (injected via `<RULE[AGENTS.md]>`), Global User Rules (`<RULE[user_global]>`), registered tool schemas, skill YAML frontmatter headers, and system instructions.
* **Loaded On-Demand By Path:** All remaining files (`CLAUDE.md`, `PROJECT.md`, `BOOTSTRAP.md`, `README.md`, `STYLEGUIDE.md`, `.mcp/*`, `agents/*`, `docs/*`, `hooks/*`, `knowledge-base/*`, `prompts/*`, `scripts/*`, `templates/*`, `versions/*`, `workflows/*`, and application source files). These enter context only when read via file tools (`view_file`, `grep_search`, `read_resource`), attached by user prompt, or opened as active IDE documents.

### 3. `.gitignore` Compliance
* **Search Tools (`grep_search` / `ripgrep`):** Respect `.gitignore` rules by default, filtering out ignored folders (e.g., `node_modules/`, `.expo/`, build outputs).
* **Direct File/Dir Operations (`list_dir`, `view_file`):** Do not enforce `.gitignore` filtering automatically when explicit paths are supplied.
* **Indexing Scripts (`scripts/knowledge-base-index.sh`):** Use explicit directory scanning rules defined within the scripts.

---

## Section 2 — Content Redundancy Check

### 1. Root File Summary (6 Key Files)

| File Name | Size (Bytes) | Summary of Actual Content |
| :--- | :--- | :--- |
| `AGENTS.md` | 2,510 B | Shared AI assistant directives (capability-first, simplicity first), directory `README.md` self-documentation requirement, Expo v57 docs directive, zero-dependency policy, and semantic git commit format rules. |
| `CLAUDE.md` | 2,047 B | AI coding assistant guidelines targeted at Claude Code / CLI tools, listing standard bash execution commands (`./scripts/bootstrap.sh`, `lint.sh`, `format.sh`), language preferences, and concise response formatting. |
| `PROJECT.md` | 2,548 B | Technical architecture overview of Ziury Mobile, Mermaid architecture diagram, folder structure breakdown, and complete tech stack version manifest (Expo v57, React Native 0.86, Drizzle ORM v0.38, SQLite v15, Vercel AI SDK v4, NativeWind v4, Zustand v5). |
| `BOOTSTRAP.md` | 1,222 B | Step-by-step developer onboarding checklist covering prerequisite tools (Git, VS Code, Docker), AI helper utilities (Claude Code, MCP, RTK, Repomix), and running setup scripts (`bootstrap.sh`, `lint.sh`). |
| `README.md` | 1,856 B | Mobile application directory layout (`app/`, `components/`, `db/`, `services/`, `stores/`), setup commands (`npm install`, `npm run start`, `npm run android/ios/web`), database migration commands, and technology versions. |
| `STYLEGUIDE.md` | 2,237 B | File/folder naming conventions (kebab-case for folders/docs, uppercase for AI stack root files), Markdown formatting standards (alerts, headers, code block flags), and semantic commit message specifications (`feat`, `docs`, `fix`, `refactor`, `chore`). |

### 2. Root File Content Overlaps
* **`AGENTS.md` vs. `CLAUDE.md`**: High redundancy on AI behavior rules (simplicity first, directory `README.md` enforcement, using `./scripts/` scripts, semantic commit formatting).
* **`PROJECT.md` vs. `README.md`**: Direct overlap on technology stack versions (Expo 57, React Native 0.86, Drizzle ORM, SQLite, Vercel AI SDK, Zustand, NativeWind) and folder structure breakdown.
* **`BOOTSTRAP.md` vs. `CLAUDE.md`**: Both detail running setup scripts (`./scripts/bootstrap.sh`, `./scripts/lint.sh`) and developer tool setup.
* **`AGENTS.md` vs. `STYLEGUIDE.md`**: Both mandate semantic git commit rules (`feat:`, `docs:`, `fix:`, etc.) and markdown linking rules.

### 3. `docs/` vs. `knowledge-base/` Comparison

| Category | `docs/` Folder | `knowledge-base/` Folder |
| :--- | :--- | :--- |
| **Total Files** | 7 files | 13 files (across 4 subdirectories: `ADR/`, `patterns/`, `research/`, `snippets/`) |
| **Total Size** | 16,693 bytes (~16.69 KB, ~4,173 tokens) | 15,478 bytes (~15.48 KB, ~3,871 tokens) |
| **Content Purpose** | Developer manuals (`development-environment.md`, `llm-setup.md`, `context-optimization.md`, `security.md`, `search.md`, `observability.md`). | Architecture decision records (`ADR/`), coding pattern rules (`patterns/`), research notes (`research/`), and script snippets (`snippets/`). |
| **Identified Overlaps** | • `docs/context-optimization.md` duplicates `knowledge-base/research/001-context-optimization.md` (both detail RTK, repomix, and token optimization).<br>• `docs/development-environment.md` duplicates `knowledge-base/patterns/001-shell-script-conventions.md` and `patterns/002-directory-rules.md` (shell conventions and directory rules). |

---

## Section 3 — Size & Growth

### 1. Total Auto-Load Context Estimate
* **Workspace Auto-Loaded Rules (`AGENTS.md`):** 2.51 KB (~628 tokens)
* **Global User Rule (`C:\Users\Administrator\.gemini\config\AGENTS.md`):** ~0.09 KB (~23 tokens)
* **System Prompt + MCP Tool Schemas + Skill Headers:** ~30.00 KB (~7,500 tokens)
* **Combined Total Auto-Load Overhead:** **~32.60 KB (~8,151 tokens)**

### 2. Breakdown of All Subfolders

| Folder Path | File Count | Size (Bytes) | Size (KB) | Estimated Tokens | Auto-Loaded (Y/N) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `scripts/` | 9 files | 23,653 B | 23.65 KB | ~5,913 tokens | **N** |
| `docs/` | 7 files | 16,693 B | 16.69 KB | ~4,173 tokens | **N** |
| `knowledge-base/` | 13 files | 15,478 B | 15.48 KB | ~3,871 tokens | **N** |
| `workflows/` | 5 files | 11,534 B | 11.53 KB | ~2,884 tokens | **N** |
| `templates/` | 12 files | 9,009 B | 9.01 KB | ~2,252 tokens | **N** |
| `agents/` | 7 files | 7,350 B | 7.35 KB | ~1,838 tokens | **N** |
| `prompts/` | 3 files | 6,046 B | 6.05 KB | ~1,512 tokens | **N** |
| `versions/` | 3 files | 3,090 B | 3.09 KB | ~773 tokens | **N** |
| `hooks/` | 2 files | 2,432 B | 2.43 KB | ~608 tokens | **N** |
| `.mcp/` | 3 files | 7,360 B | 7.36 KB | ~1,840 tokens | **N** |

### 3. Status of `versions/` Folder
* **Size:** 3 files (`CHANGELOG.md`, `README.md`, `v1.0.md`), 3,090 bytes (~3.09 KB, ~773 tokens).
* **Context Active Status:** `versions/` is **NOT** loaded into session context automatically. It remains strictly on disk as static archival storage and is only read if explicitly queried by path.

### 4. Folder Growth & Hot vs. Cold Status
* **Largest Non-App Folder:** `scripts/` (23.65 KB, 9 files), followed by `docs/` (16.69 KB, 7 files) and `knowledge-base/` (15.48 KB, 13 files).
* **Hot vs. Cold Assessment:**
  * `scripts/`: Shell scripts are executed via terminal commands; script source code does not need to be loaded into LLM context.
  * `docs/` & `knowledge-base/`: Contain static reference guides that accumulate duplicate material. They do not need to stay "hot" in context and are accessed on-demand by path.

---

## Section 4 — Actual Usage Patterns

### 1. Multi-Session Historical Telemetry Access
* **System Log Access Constraints:** Historical session transcript logs across separate past conversation IDs outside the current session directory are isolated within system-protected boundaries.
* **Current Active Session Usage:** During active operations, the files explicitly referenced/loaded into context are:
  * `AGENTS.md` (Auto-loaded via system workspace rules directive)
  * `CLAUDE.md`, `PROJECT.md`, `BOOTSTRAP.md`, `README.md`, `STYLEGUIDE.md` (Read on-demand during audit inspection)
  * Folder structures for `.mcp/`, `agents/`, `docs/`, `hooks/`, `knowledge-base/`, `prompts/`, `scripts/`, `templates/`, `versions/`, `workflows/` (Enumerated via file system directory inspection)
* **Log Status Statement:** No cross-session historical aggregate log parser exists within the user workspace to measure 7-day file reference frequencies; per audit guidelines, this limit is reported directly.

---

## Section 5 — Structural Fit

### 1. Folder Structure vs. Actual Operational Usage

| Folder Path | Original Intended Purpose | Actual Operational Usage & Drift |
| :--- | :--- | :--- |
| `agents/` | Persona prompt files (`architect.md`, `frontend.md`, `backend.md`, `reviewer.md`, `tester.md`, `researcher.md`) for manual persona copy-pasting. | **Drifted:** Antigravity operates using native subagent tools and system skills (`.gemini/config/skills/` / `.agents/skills/`). The static `.md` files in `agents/` are never auto-invoked as active subagents by the runner. |
| `prompts/` | System prompt headers (`system-header.md`, `context-pack.md`) for manual prompt assembly. | **Drifted:** Antigravity handles system headers, identity injection, and context packing dynamically. Static header text files in `prompts/` remain unused reference assets. |
| `workflows/` | Standard operating procedure guides (`feature-development.md`, `bug-fix.md`, `code-review.md`, `release.md`). | **Partial Fit:** Operational steps are followed on-demand during specific development phases, but significantly overlap with rules in `AGENTS.md` and `CLAUDE.md`. |
| `templates/` | Markdown skeleton templates for ADRs, bugs, features, pull requests, meeting notes. | **Fit:** Referenced and instantiated by helper scripts (`scripts/docs.sh`). |
| `hooks/` | Git pre-commit hook script (`hooks/pre-commit`). | **Fit:** Installed to `.git/hooks/pre-commit` by `scripts/bootstrap.sh`. Contains 1 hook file. |
