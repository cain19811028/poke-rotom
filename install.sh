#!/usr/bin/env bash
# poke-rotom One-Click Installer for macOS / Linux
set -euo pipefail

SKILL_NAME="poke-rotom"
SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "⚡ Installing $SKILL_NAME..."

copy_to() {
  local dst="$1"
  if [[ -z "$dst" || "$dst" != *"$SKILL_NAME"* ]]; then
    echo "❌ Safety check failed: invalid destination path: $dst" >&2
    exit 1
  fi
  mkdir -p "$dst"
  rm -rf "$dst"/*
  for item in "$SRC"/*; do
    local base="$(basename "$item")"
    if [[ "$base" != ".git" ]]; then
      cp -R "$item" "$dst/"
    fi
  done
  echo "✔ Installed skill to: $dst"
}

copy_to "$HOME/.claude/skills/$SKILL_NAME"
copy_to "$HOME/.cursor/skills/$SKILL_NAME"

echo ""
echo "🎉 Skill installation complete!"
echo "Try querying with:"
echo "  node ~/.claude/skills/$SKILL_NAME/index.mjs 噴火龍 --brief"
echo ""
echo "🔌 MCP Server Configuration snippet:"
cat << EOF
{
  "mcpServers": {
    "poke-rotom": {
      "command": "node",
      "args": ["$SRC/index.mjs", "--mcp"]
    }
  }
}
EOF
