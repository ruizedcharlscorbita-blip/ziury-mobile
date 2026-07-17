# ADR-001: Use Markdown-First Design System

* **Status**: Approved
* **Date**: 2026-07-17
* **Author**: AI Stack Contributors

## Context

Software projects require documentation, guidelines, templates, and agent instructions. Standardizing these formats is key to developer and AI-assistant efficiency. Historically, documentation has been split across external wikis, ticketing platforms, or databases, creating context gaps for AI agents.

## Decision

We will use plaintext Markdown (`.md`) as the primary documentation interface for AI Stack. All architecture decisions, project details, coding rules, and search patterns will be recorded in standard markdown files directly within the repository.

## Consequences

* **Pros**:
  * High readability for both humans and LLM systems.
  * Direct version-controlling along with project source code.
  * Zero setup or external infrastructure dependencies.
  * Integrates with Git for change tracking and reviews.
* **Cons**:
  * Markdown lacks built-in interactive features (like databases or spreadsheets) without external processors.
