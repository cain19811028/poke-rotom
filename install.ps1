# SPDX-License-Identifier: MIT
# Copyright (c) 2026 cain19811028

# poke-rotom One-Click Installer for Windows
# Copies skill into Claude Code and Cursor user directories and displays MCP configuration.

$ErrorActionPreference = "Stop"
$SkillName = "poke-rotom"
$RepoRoot = $PSScriptRoot

Write-Host "⚡ Installing $SkillName..." -ForegroundColor Cyan

# Target directories
$ClaudeSkills = Join-Path $HOME ".claude\skills\$SkillName"
$CursorSkills = Join-Path $HOME ".cursor\skills\$SkillName"

function Copy-SkillDir ($Destination) {
    if (-not $Destination -or -not $Destination.EndsWith($SkillName)) {
        throw "Safety error: Invalid destination path $Destination"
    }
    if (Test-Path -LiteralPath $Destination) {
        $Existing = Get-Item -LiteralPath $Destination -Force
        # A symlink or junction points at someone's working copy; a recursive remove could delete that copy.
        if ($Existing.Attributes -band [IO.FileAttributes]::ReparsePoint) {
            Write-Warning "Skipped ${Destination}: it is a link, left untouched."
            return
        }
        if ($Existing.FullName.TrimEnd('\') -eq (Get-Item -LiteralPath $RepoRoot).FullName.TrimEnd('\')) {
            Write-Host "✔ Already installed in place: $Destination" -ForegroundColor Green
            return
        }
        # Only clear a directory that positively holds an earlier install of this skill.
        $Marker = Join-Path $Destination "SKILL.md"
        $IsPreviousInstall = (Test-Path -LiteralPath $Marker) -and
            (Select-String -LiteralPath $Marker -Pattern "^name:\s*$SkillName\s*$" -Quiet)
        $IsEmpty = -not (Get-ChildItem -LiteralPath $Destination -Force | Select-Object -First 1)
        if (-not $IsPreviousInstall -and -not $IsEmpty) {
            throw "Refusing to replace ${Destination}: it is not a $SkillName install."
        }
        Remove-Item -LiteralPath $Destination -Recurse -Force
    }
    New-Item -ItemType Directory -Force -Path $Destination | Out-Null
    Get-ChildItem -Path $RepoRoot -Exclude ".git" | Copy-Item -Destination $Destination -Recurse -Force
    Write-Host "✔ Installed skill to: $Destination" -ForegroundColor Green
}

Copy-SkillDir $ClaudeSkills
Copy-SkillDir $CursorSkills

Write-Host "`n🎉 Skill installation complete!" -ForegroundColor Cyan
Write-Host "Try querying with:" -ForegroundColor Yellow
Write-Host "  node `"$ClaudeSkills\index.mjs`" 噴火龍 --brief"

Write-Host "`n🔌 MCP Server Configuration snippet:" -ForegroundColor Cyan
$McpPath = "$RepoRoot\index.mjs".Replace('\', '/')
$McpConfig = @"
{
  "mcpServers": {
    "poke-rotom": {
      "command": "node",
      "args": ["$McpPath", "--mcp"]
    }
  }
}
"@
Write-Host $McpConfig -ForegroundColor Gray
