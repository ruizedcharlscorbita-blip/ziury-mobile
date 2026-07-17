# Search Reference Guide (Layer 8)

This guide documents how to utilize search tools like `ripgrep` (`rg`), `fd`, and `ast-grep` (`sg`) to locate files, text, and syntactic structures.

---

## 1. ripgrep (`rg`) — Text Searching

`ripgrep` is a line-oriented search tool that respects gitignore rules.

### Common Commands:
```bash
# Find exact string 'TODO' across all files
rg "TODO"

# Case-insensitive search for a word, showing only filenames containing it
rg -i -l "database"

# Search for a regex pattern in only Markdown files
rg -t md "\[.*\]\(.*\)"

# Search excluding specific directories
rg "auth" --glob "!**/node_modules/**"
```

---

## 2. fd — File and Folder Searching

`fd` is a simple, fast alternative to the `find` command.

### Common Commands:
```bash
# Search for files with 'config' in the name
fd config

# Find only directories with 'docs'
fd -t d docs

# Find files with a specific extension (e.g. '.sh')
fd -e sh

# Include hidden and ignored files in search
fd -H -I "secret"
```

---

## 3. ast-grep (`sg`) — Structural Code Searching

`ast-grep` is a tool for scanning code bases using syntax trees rather than regex.

### Common Commands:
```bash
# Find any javascript/typescript function named 'login'
sg -p "function login($$$) { $$$ }"

# Find all console.log calls
sg -p "console.log($$$)"

# Search for specific pattern and rewrite it (e.g. change var to const)
sg -p "var $VAR = $VAL" -r "const $VAR = $VAL"
```
