# Model Context Protocol (MCP) Configuration (Layer 5)

This folder contains Model Context Protocol (MCP) configurations and guidelines to connect your local development environment tools directly to LLMs.

---

## 1. What is MCP?

Model Context Protocol (MCP) is an open standard that enables AI clients (like Claude Code, Cursor, Windsurf, or Claude Desktop) to connect securely to local API servers. These servers expose file searching, command execution, database querying, or third-party web search as tools the AI can call.

---

## 2. Recommended MCP Servers

You can configure the following servers depending on your workspace needs:

1. **Filesystem Server (`@modelcontextprotocol/server-filesystem`)**
   - **Purpose**: Gives the AI safe, fast access to read, search, and write files in specified directories.
   - **Installation**: `npm install -g @modelcontextprotocol/server-filesystem` (or run via `npx`).
2. **Git Server (`@modelcontextprotocol/server-git`)**
   - **Purpose**: Exposes git tools like `git diff`, `git log`, and `git commit` to the AI.
   - **Installation**: `npm install -g @modelcontextprotocol/server-git`.
3. **Database Servers (SQLite / Postgres)**
   - **Purpose**: Allows direct querying of local development databases for schema inspections and troubleshooting.

---

## 3. Configuration Setup

To load MCP servers in your editor or client:

### Cursor Setup
1. Go to **Cursor Settings** > **Features** > **MCP**.
2. Click **+ Add New MCP Server**.
3. Choose type `command` or `sse`.
4. Define the command (e.g. `npx -y @modelcontextprotocol/server-filesystem /path/to/workspace`).

### Claude Desktop Setup
Modify your Claude Desktop configuration file (typically at `%APPDATA%\Claude\claude_desktop_config.json` on Windows or `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS) by copying the template in `[config.json](file:///c:/Users/Administrator/Desktop/GEMINI/projects/ai%20stack/.mcp/config.json)`.
