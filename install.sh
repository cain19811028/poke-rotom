#!/usr/bin/env bash
# poke-rotom One-Click Installer for macOS / Linux
set -euo pipefail

SKILL_NAME="poke-rotom"
SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "⚡ Installing $SKILL_NAME..."

copy_to() {
  local dst="$1"
  mkdir -p "$dst"
  rm -rf "$dst"/*
  cp -R "$SRC"/* "$dst/"
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
