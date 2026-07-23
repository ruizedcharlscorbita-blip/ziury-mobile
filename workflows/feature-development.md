# Workflow: Feature Development

## Purpose
Standard end-to-end recipe for implementing a new feature from initial design to merged pull request.

## Prerequisites
- Clear feature request or ticket defined
- Access to the repository and a working branch
- AI assistant loaded with context from `PROJECT.md`, `STYLEGUIDE.md`, and relevant `knowledge-base/` files

---

## Steps

### 1. Design & Document
- [ ] Create a design doc using the template: `bash ./scripts/docs.sh design-doc <feature-name>`
- [ ] Define inputs, outputs, edge cases, and acceptance criteria in the design doc
- [ ] Review against existing ADRs in `knowledge-base/ADR/` to avoid conflicting decisions
- [ ] If this is a significant architectural decision, create an ADR: `bash ./scripts/docs.sh adr <nnn-decision-title>`

### 2. Create a Feature Branch
- [ ] Checkout a new branch following the `STYLEGUIDE.md` naming convention:
  ```bash
  git checkout -b feat/<short-feature-name>
  ```

### 3. Implement the Feature
- [ ] Write code following `STYLEGUIDE.md` formatting and naming rules
- [ ] Keep commits atomic and use semantic commit messages:
  - `feat: add <description>` for new functionality
  - `chore: update <description>` for non-functional changes
- [ ] Add or update any affected `README.md` files per the `AGENTS.md` directive

### 4. Validate Locally
- [ ] Run the structural linter to ensure no directories are missing READMEs:
  ```bash
  bash ./scripts/lint.sh
  ```
- [ ] Run formatting checks:
  ```bash
  bash ./scripts/format.sh
  ```
- [ ] Regenerate the knowledge base index if ADRs or research logs were added:
  ```bash
  bash ./scripts/knowledge-base-index.sh
  ```

### 5. Open a Pull Request
- [ ] Generate a pull request document using the template in `templates/pull-request.md`
- [ ] Fill in: motivation, changes made, testing performed, and references to ADRs
- [ ] Request a code review per the `workflows/code-review.md` workflow

### 6. Merge & Close
- [ ] Address all review comments and re-run linting
- [ ] Merge using squash or merge commit per `STYLEGUIDE.md`
- [ ] Update `versions/CHANGELOG.md` with a brief entry for the change
- [ ] Delete the feature branch after merge

---

## References
- [STYLEGUIDE.md](file:///c:/Users/Administrator/Desktop/GEMINI/projects/Ziury-mobile/STYLEGUIDE.md)
- [templates/feature.md](file:///c:/Users/Administrator/Desktop/GEMINI/projects/Ziury-mobile/templates/feature.md)
- [templates/design-doc.md](file:///c:/Users/Administrator/Desktop/GEMINI/projects/Ziury-mobile/templates/design-doc.md)
- [templates/pull-request.md](file:///c:/Users/Administrator/Desktop/GEMINI/projects/Ziury-mobile/templates/pull-request.md)
