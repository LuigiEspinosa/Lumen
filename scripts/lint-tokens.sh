#!/usr/bash/env bash
# Ensure every var(--...) in theme.ts exists in tokens.css
# Fail with diff output if any mismatch is found
set -euo pipefail

CSS_VARS=$(grep -oE '\-\-[a-z][a-z0-9-]+' src/styles/tokens.css | sort -u)
TS_REFS=$(grep -oE 'var\(--[a-z][a-z0-9-]+\)' src/styles/theme.ts | sed 's/var(//;s/)//' | sort -u)

MISSING=$(comm -23 <(echo "$TS_REFS") <(echo "$CSS_VARS"))

if [ -n "$MISSING" ]; then
  echo "ERROR: theme.ts references CSS vars not defined in tokens.css:"
  echo "$MISSING"
  exit 1
fi

echo "OK: all theme.ts var() references exist in tokens.css"
