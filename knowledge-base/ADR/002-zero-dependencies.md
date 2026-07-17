# ADR-002: Zero Dependencies by Default

* **Status**: Approved
* **Date**: 2026-07-17
* **Author**: AI Stack Contributors

## Context

AI Stack is intended to be cloned into *any* software project, regardless of stack (Python, Go, Node.js, C#, etc.). Introducing heavy framework requirements (like Node.js packages or Python library environments) to run basic automation checks would make the tool less portable and harder to integrate.

## Decision

We will design the automation layer of AI Stack with zero package dependencies by default. We will use native Unix shell scripts (`.sh`) utilizing system-standard commands (`grep`, `find`, `sed`, etc.) for bootstrapping, linting, formatting checks, and documentation generation.

## Consequences

* **Pros**:
  * High speed and minimal performance impact.
  * Universal compatibility across Git Bash (Windows), macOS Terminal, and Linux shells.
  * No `node_modules` or virtual environment bloat.
* **Cons**:
  * Bash syntax can be more difficult to maintain than high-level scripting languages for complex tasks.
  * Advanced formatting checks (e.g. checking specific formatting rules beyond basic file layout checks) will be limited to simple checks unless the developer explicitly chooses to install optional formatting packages.
