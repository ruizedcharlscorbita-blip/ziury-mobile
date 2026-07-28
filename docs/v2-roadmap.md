# Ziury Mobile — Version 2.0 Roadmap & Specification

## Vision: Hands & Memory Acquisition

Version 2.0 evolves Ziury Mobile from an offline-first assistant into an autonomous contextual agent capable of structured memory acquisition, automated data categorization, and user-aligned action execution ("Hands").

---

## Core Objectives

### 1. Natural Language Contextual Extraction & Disambiguation
- **Contextual Categorization**: Automatically parse multi-domain user inputs into discrete entities (e.g., timeline entries, budget expenses, tasks, notes).
  - *Example*: User prompt: `"I had a walk today at UP Diliman and I bought a hotdog, it was expensive like 500k? grabi"`
  - *Extraction*:
    - **Timeline Entry**: Date = `Current Timestamp`, Title = `Walk at UP Diliman`
    - **Budget Expense**: Amount = `500,000`, Type = `Expense`, Category = `Food/Dining`, Note = `Hotdog at UP Diliman`
- **Confirmation Flow**: The AI prompts the user to confirm extracted records before writing to SQLite:
  - *Prompt*: `"Would you like to add 'Walk at UP Diliman' to your Timeline and log 500,000 as an expense in your Budget?"`

### 2. Autonomous Action Execution ("Hands")
- Direct write access to persistent SQLite database tables (`budget_items`, `timeline_items`, `tasks`, `notes`) upon user confirmation.
- Safe transactions and rollback support for AI-initiated actions.

### 3. Personalization & Preference Engine ("Brain")
- **AI Brain Memory Store**: Dedicated persistent storage table (`ai_memories`) for user preferences, styling guidelines, and behavior directives (e.g., `"User prefers non-bold text formatting"`).
- **Context Synthesizer**: Injects user preferences into system prompts prior to response generation to ensure custom alignment.
