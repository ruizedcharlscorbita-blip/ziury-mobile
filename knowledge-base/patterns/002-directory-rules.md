# PTN-002: Directory Structure Rules

To ensure a self-documenting and organized codebase, this pattern defines structure rules for all directories.

## Mandatory README Requirement

Every directory (and subdirectory) containing source code, configurations, templates, or instructions **must** contain a `README.md` file.

### README structure requirements:
1. **Title**: The main header (`#`) must match the folder name or function.
2. **Purpose**: A clear 1-2 sentence description explaining why this directory exists.
3. **Contents Table**: A list or table linking to the files and subfolders.
4. **Best Practices**: Guidelines on how to add or modify files in this directory.

## Enforcement
The `lint.sh` script scans the project and fails if any folder contains code or configs but lacks a `README.md` file.
