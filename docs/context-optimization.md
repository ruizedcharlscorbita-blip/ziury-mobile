# Context Optimization Guide (Layer 2)

This guide documents how to package, filter, and optimize codebase context for Large Language Models (LLMs) and AI coding assistants. Using these tools avoids context window overflows and improves AI accuracy.

---

## 1. Repomix (Codebase Bundler)

### Purpose
Repomix (formerly Repopack) packs your entire repository into a single, well-structured text file. This is ideal for onboarding an AI agent or performing large-scale refactorings.

### Installation
Do not install automatically. Developers can run:
```bash
# Run via npx without local installation
npx repomix
```

### Configuration
Create a `repomix.config.json` in the root:
```json
{
  "output": {
    "filePath": "repomix-output.txt",
    "style": "xml",
    "removeComments": false,
    "showLineNumbers": true
  },
  "include": ["**/*"],
  "exclude": [
    "node_modules/**",
    "dist/**",
    "build/**",
    ".git/**",
    "repomix-output.txt"
  ]
}
```

### Usage
Run the tool using:
```bash
npx repomix --config repomix.config.json
```

---

## 2. RTK (Repo-To-Text / Repo-To-Context)

### Purpose
RTK is a lightweight alternative to bundle selected parts of your codebase using custom patterns.

### Installation
Run without installation:
```bash
npx repo-to-text
```

### Usage Example
```bash
# Pack src and docs folders only
npx repo-to-text --include="src,docs" --output="rtk-output.txt"
```

---

## 3. Caveman (Watcher-based Context)

### Purpose
Caveman is a local, minimal watcher-based prompt assembler. It tracks files opened in your editor and appends them to a running context file for the AI.

### Implementation Pattern
Save the following local watcher snippet in your workspace environment if needed:
```bash
# Simple watcher concept: watch active files directory and dump names
find . -name "*.md" -mmin -60 > active-files.txt
```

---

## 4. MCP (Model Context Protocol)

### Purpose
MCP allows LLM clients (like Cursor or Claude Code) to directly read, search, and edit files using secure local APIs.

### Usage
See the detailed guide in `[.mcp/README.md](file:///c:/Users/Administrator/Desktop/GEMINI/projects/ai%20stack/.mcp/README.md)` for configuration.
