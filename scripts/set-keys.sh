#!/usr/bin/env bash
# Saves your API keys into .env.local without you having to find the file.
# Usage (from the project folder):  bash scripts/set-keys.sh
# Typing is hidden. Press Enter on a blank line to keep the current value.
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f .env.local ] || cp .env.example .env.local

set_key() {
  local name="$1" label="$2" value
  read -r -s -p "$label (Enter to skip): " value
  echo
  value="$(printf '%s' "$value" | tr -d '[:space:]"')" # strip stray spaces/quotes
  if [ -z "$value" ]; then
    echo "  skipped $name"
    return
  fi
  # Replace the existing line (or add one if missing). Uses a temp file so it works on macOS and Linux.
  if grep -q "^${name}=" .env.local; then
    awk -v n="$name" -v v="$value" 'BEGIN{FS=OFS="="} $1==n {print n "=" v; next} {print}' .env.local > .env.local.tmp
    mv .env.local.tmp .env.local
  else
    printf '%s=%s\n' "$name" "$value" >> .env.local
  fi
  echo "  saved $name (${#value} characters)"
}

set_key FRED_API_KEY "FRED API key"
set_key FMP_API_KEY "Financial Modeling Prep API key"
echo "Done. Restart the dev server (Ctrl-C, then npm run dev) to use the new keys."
