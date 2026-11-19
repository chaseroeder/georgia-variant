#!/usr/bin/env bash
# Saves whatever API key is on your clipboard into .env.local (macOS).
# Usage:  bash scripts/key-from-clipboard.sh FRED_API_KEY
#         bash scripts/key-from-clipboard.sh FMP_API_KEY
# The key is never printed, only its length.
set -euo pipefail
cd "$(dirname "$0")/.."

name="${1:-}"
case "$name" in
  FRED_API_KEY|FMP_API_KEY|RESEND_API_KEY) ;;
  *) echo "Usage: bash scripts/key-from-clipboard.sh FRED_API_KEY|FMP_API_KEY"; exit 1 ;;
esac

value="$(pbpaste | tr -d '[:space:]"')"
if [ -z "$value" ]; then
  echo "Your clipboard is empty. Copy the key first, then run this again."
  exit 1
fi
if ! printf '%s' "$value" | grep -Eq '^[A-Za-z0-9_-]{16,80}$'; then
  echo "That doesn't look like an API key (${#value} characters copied). Copy just the key and try again."
  exit 1
fi

[ -f .env.local ] || cp .env.example .env.local
if grep -q "^${name}=" .env.local; then
  awk -v n="$name" -v v="$value" 'BEGIN{FS=OFS="="} $1==n {print n "=" v; next} {print}' .env.local > .env.local.tmp
  mv .env.local.tmp .env.local
else
  printf '%s=%s\n' "$name" "$value" >> .env.local
fi
echo "Saved $name (${#value} characters)."
