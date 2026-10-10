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
    if (Test-Path $Destination) {
        Remove-Item -Recurse -Force $Destination
    }
    New-Item -ItemType Directory -Force -Path $Destination | Out-Null
    Copy-Item -Recurse -Force "$RepoRoot\*" $Destination
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
