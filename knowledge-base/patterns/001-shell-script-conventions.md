# PTN-001: Shell Scripting Conventions

All automation scripts within the `./scripts/` directory must conform to the safety and portability standards defined here.

## 1. Safety Options

Every shell script must begin with the following safety flags:

```bash
#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'
```

### Explanation of Flags:
- `-e`: Exit immediately if any command exits with a non-zero status.
- `-u`: Treat unset variables as an error and exit immediately.
- `-o pipefail`: Ensure that pipe commands return the exit status of the last command in the pipe that failed.
- `IFS=$'\n\t'`: Prevent word-splitting on spaces; only split fields on newlines and tabs.

---

## 2. Directory Context

Scripts must verify their execution context and always operate relative to the repository root. Never assume the user is running the script from a specific directory.

### Example pattern:
```bash
# Get the directory of the active script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Run commands within the repo root context
cd "$REPO_ROOT"
```
