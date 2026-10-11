#!/usr/bin/env bash
# SPDX-License-Identifier: MIT
# Copyright (c) 2026 cain19811028
# voltdex One-Click Installer for macOS / Linux
set -euo pipefail

SKILL_NAME="voltdex"
SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"

echo "⚡ Installing $SKILL_NAME..."

is_previous_install() {
  grep -qE "^name:[[:space:]]*$SKILL_NAME[[:space:]]*$" "$1/SKILL.md" 2>/dev/null
}

copy_to() {
  local dst="$1"
  if [[ -z "$dst" || "$dst" != *"$SKILL_NAME"* ]]; then
    echo "❌ Safety check failed: invalid destination path: $dst" >&2
    exit 1
  fi
  # A symlinked skill dir points at someone's working copy; clearing it would delete that copy.
  if [[ -L "$dst" ]]; then
    echo "⚠ Skipped $dst: it is a symlink to $(readlink "$dst"), left untouched."
    return
  fi
  if [[ -d "$dst" ]]; then
    if [[ "$(cd "$dst" && pwd -P)" == "$SRC" ]]; then
      echo "✔ Already installed in place: $dst"
      return
    fi
    # Only clear a directory that positively holds an earlier install of this skill.
    if [[ -n "$(ls -A "$dst")" ]] && ! is_previous_install "$dst"; then
      echo "❌ Refusing to replace $dst: it is not a $SKILL_NAME install." >&2
      exit 1
    fi
    rm -rf "$dst"
  fi
  mkdir -p "$dst"
  # The glob skips dotfiles, so .git and other local state never get copied.
  for item in "$SRC"/*; do
    cp -R "$item" "$dst/"
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
    "voltdex": {
      "command": "node",
      "args": ["$SRC/index.mjs", "--mcp"]
    }
  }
}
EOF
