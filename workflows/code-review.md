# Workflow: Code Review

## Purpose
Consistent process for requesting, performing, and completing code reviews before merging any changes into the main branch.

## Prerequisites
- A pull request is open with a completed PR description using `templates/pull-request.md`
- The submitter has confirmed that all automated checks (`lint.sh`, `format.sh`) pass

---

## For the Submitter

### Before Requesting Review
- [ ] Self-review the diff — read every changed line as if you are the reviewer
- [ ] Verify: `bash ./scripts/lint.sh` passes with zero errors
- [ ] Verify: `bash ./scripts/format.sh` passes with zero errors
- [ ] Ensure the PR description clearly explains **why** the change was made, not just **what** changed
- [ ] Reference any relevant ADRs or research notes that informed the decision
- [ ] Mark the PR as "Ready for Review" only after all checks pass

---

## For the Reviewer

### Checklist
- [ ] **Correctness**: Does the code do what the PR description claims?
- [ ] **Simplicity**: Does the solution introduce unnecessary complexity? (Refer to `AGENTS.md` Simplicity Guideline)
- [ ] **Style**: Does the code follow `STYLEGUIDE.md` conventions (naming, formatting, commit style)?
- [ ] **Documentation**: Are all new or modified folders accompanied by an updated `README.md`?
- [ ] **ADR Compliance**: Does the change align with existing Architecture Decision Records in `knowledge-base/ADR/`?
- [ ] **No Placeholders**: Are there any `TODO`, `FIXME`, or placeholder stubs left in the code?
- [ ] **Security**: Does the change introduce any secrets, keys, or sensitive data (`.env`, `*.key`, `*.pem`)?

### Providing Feedback
- Frame all feedback as questions or suggestions, not directives
- Use comment prefixes for clarity:
  - `nit:` — Minor style or wording suggestion, submitter's discretion
  - `must:` — Required change before merge
  - `question:` — Seeking clarification, not necessarily a change

---

## Merge Criteria
A PR may be merged only when:
1. All `must:` comments are resolved
2. `lint.sh` and `format.sh` both pass
3. At least one reviewer has approved
4. `versions/CHANGELOG.md` entry is added

---

## References
- [AGENTS.md](file:///c:/Users/Administrator/Desktop/GEMINI/projects/Ziury-mobile/ZIUR-AI-STACK%20V1/AGENTS.md)
- [STYLEGUIDE.md](file:///c:/Users/Administrator/Desktop/GEMINI/projects/Ziury-mobile/ZIUR-AI-STACK%20V1/STYLEGUIDE.md)
- [templates/pull-request.md](file:///c:/Users/Administrator/Desktop/GEMINI/projects/Ziury-mobile/ZIUR-AI-STACK%20V1/templates/pull-request.md)
- [agents/reviewer.md](file:///c:/Users/Administrator/Desktop/GEMINI/projects/Ziury-mobile/ZIUR-AI-STACK%20V1/agents/reviewer.md)
