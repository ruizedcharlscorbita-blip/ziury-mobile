# Workflow: Release

## Purpose
Step-by-step release process for cutting a new version of the project — from validation through changelog and tagging.

## Prerequisites
- All planned features and fixes for this version are merged to the main branch
- All automated checks pass on main
- Version number decided following Semantic Versioning (`MAJOR.MINOR.PATCH`)

---

## Steps

### 1. Pre-Release Validation
- [ ] Pull the latest main branch:
  ```bash
  git checkout main && git pull
  ```
- [ ] Run the full validation suite:
  ```bash
  bash ./scripts/lint.sh
  bash ./scripts/format.sh
  bash ./scripts/knowledge-base-index.sh
  ```
- [ ] Confirm all checks pass with zero errors

### 2. Update the Changelog
- [ ] Open `versions/CHANGELOG.md`
- [ ] Add a new version section at the top with today's date:
  ```markdown
  ## [vX.Y.Z] — YYYY-MM-DD
  ### Added
  - feat: <description>
  ### Fixed
  - fix: <description>
  ### Changed
  - chore: <description>
  ```

### 3. Create a Release Specification
- [ ] Copy `templates/project.md` or `versions/v1.0.md` as a model:
  ```bash
  cp versions/v1.0.md versions/vX.Y.Z.md
  ```
- [ ] Update the new file with this version's goals, features completed, and known limitations

### 4. Commit the Release
- [ ] Stage and commit all version-related files:
  ```bash
  git add versions/ knowledge-base/INDEX.md
  git commit -m "chore: release vX.Y.Z"
  ```

### 5. Tag the Release
- [ ] Create an annotated git tag:
  ```bash
  git tag -a vX.Y.Z -m "Release vX.Y.Z — <one line summary>"
  ```
- [ ] Push the tag:
  ```bash
  git push origin main --tags
  ```

### 6. Post-Release
- [ ] Update `knowledge-base/MEMORY.md` with the new milestone entry:
  ```markdown
  - **Milestone**: Released vX.Y.Z — <brief summary of what shipped>
  ```
- [ ] Notify stakeholders / team of the new release

---

## References
- [versions/CHANGELOG.md](file:///c:/Users/Administrator/Desktop/GEMINI/projects/Ziury-mobile/ZIUR-AI-STACK%20V1/versions/CHANGELOG.md)
- [versions/v1.0.md](file:///c:/Users/Administrator/Desktop/GEMINI/projects/Ziury-mobile/ZIUR-AI-STACK%20V1/versions/v1.0.md)
- [knowledge-base/MEMORY.md](file:///c:/Users/Administrator/Desktop/GEMINI/projects/Ziury-mobile/ZIUR-AI-STACK%20V1/knowledge-base/MEMORY.md)
- [STYLEGUIDE.md](file:///c:/Users/Administrator/Desktop/GEMINI/projects/Ziury-mobile/ZIUR-AI-STACK%20V1/STYLEGUIDE.md)
