# Workflow: Bug Fix

## Purpose
Structured recipe for identifying, reproducing, fixing, and validating a bug from first report to verified resolution.

## Prerequisites
- A bug report filed using `templates/bug-report.md` (or equivalent ticket)
- Access to the codebase on a clean branch

---

## Steps

### 1. Reproduce the Bug
- [ ] Read the bug report and clearly understand the expected vs. actual behavior
- [ ] Reproduce the bug locally in a clean environment
- [ ] Note the exact conditions, inputs, and steps that trigger the issue
- [ ] If this is a recurring or systemic issue, search `knowledge-base/research/` for prior investigations

### 2. Root Cause Analysis
- [ ] Trace the execution path to isolate the failing code
- [ ] Check `knowledge-base/ADR/` to verify the intended architectural decision that governs this area
- [ ] Confirm if this bug conflicts with a pattern in `knowledge-base/patterns/`

### 3. Create a Fix Branch
- [ ] Checkout a fix branch:
  ```bash
  git checkout -b fix/<short-bug-description>
  ```

### 4. Implement the Fix
- [ ] Write the minimal fix required — avoid scope creep
- [ ] Follow `STYLEGUIDE.md` conventions for code and commits:
  - `fix: <short description of what was broken and what you corrected>`
- [ ] If the fix changes behavior significantly, document the decision as an ADR:
  ```bash
  bash ./scripts/docs.sh adr <nnn-adr-title>
  ```

### 5. Validate
- [ ] Confirm the original bug no longer reproduces
- [ ] Run the structural linter:
  ```bash
  bash ./scripts/lint.sh
  ```
- [ ] Run formatting checks:
  ```bash
  bash ./scripts/format.sh
  ```

### 6. Open a Pull Request
- [ ] Use `templates/pull-request.md` to document the fix
- [ ] Link back to the original bug report
- [ ] Describe the root cause and how the fix addresses it

### 7. Post-Merge
- [ ] Update `versions/CHANGELOG.md`:
  - `- fix: <what was broken and resolved>`
- [ ] If the bug was complex or systemic, file a research note:
  ```bash
  bash ./scripts/research.sh <bug-topic-slug>
  ```
- [ ] Delete the fix branch

---

## References
- [STYLEGUIDE.md](file:///c:/Users/Administrator/Desktop/GEMINI/projects/Ziury-mobile/ZIUR-AI-STACK%20V1/STYLEGUIDE.md)
- [templates/bug-report.md](file:///c:/Users/Administrator/Desktop/GEMINI/projects/Ziury-mobile/ZIUR-AI-STACK%20V1/templates/bug-report.md)
- [templates/pull-request.md](file:///c:/Users/Administrator/Desktop/GEMINI/projects/Ziury-mobile/ZIUR-AI-STACK%20V1/templates/pull-request.md)
