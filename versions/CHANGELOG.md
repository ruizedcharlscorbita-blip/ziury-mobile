# Changelog

All notable changes to this project will be documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-07-17

### Added
- Completed initial release of AI Stack layers 1 through 12.
- Added `versions/` folder containing release specifications and changelogs.
- Created `BOOTSTRAP.md` providing a comprehensive step-by-step onboarding checklist.
- Integrated automated formatting, indexing, and structure linting scripts in `scripts/`.
- Set up git commit hooks protecting against credential leakage and structural failures in `hooks/`.

### Changed
- Renamed `knowledge/` directory to `knowledge-base/` for increased explicitness.
- Renamed indexing script to `knowledge-base-index.sh` to match directory structure changes.
