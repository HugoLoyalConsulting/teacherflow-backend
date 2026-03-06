# TeacherFlow Code Backup (backend + frontend + git history)
# Creates local immutable-style archives for disaster recovery.

param(
    [string]$OutputDir = "backups/code",
    [bool]$IncludeWorkingTree = $true
)

$ErrorActionPreference = "Stop"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

Write-Host "== TeacherFlow Code Backup ==" -ForegroundColor Cyan

if (-not (Test-Path ".git")) {
    Write-Error "Execute this script from the repository root (teacherflow)."
}

New-Item -Path $OutputDir -ItemType Directory -Force | Out-Null

$bundlePath = Join-Path $OutputDir "teacherflow_history_$timestamp.bundle"
$snapshotPath = Join-Path $OutputDir "teacherflow_snapshot_$timestamp.tar.gz"
$metaPath = Join-Path $OutputDir "teacherflow_metadata_$timestamp.txt"

Write-Host "Creating full git history bundle..."
git bundle create "$bundlePath" --all

Write-Host "Creating source snapshot from HEAD..."
git archive --format=tar.gz --prefix=teacherflow/ HEAD -o "$snapshotPath"

if ($IncludeWorkingTree) {
    $wtPath = Join-Path $OutputDir "teacherflow_workingtree_$timestamp.zip"
    Write-Host "Creating working tree zip (without .git)..."
    $exclude = @(".git", "node_modules", "__pycache__", ".venv", "dist", "build")
    Get-ChildItem -Force | Where-Object { $exclude -notcontains $_.Name } | Compress-Archive -DestinationPath $wtPath -Force
}

$branch = (git branch --show-current)
$head = (git rev-parse HEAD)
$remote = (git remote get-url origin)
$gitStatus = (git status --short)

@(
    "timestamp=$timestamp",
    "branch=$branch",
    "head=$head",
    "origin=$remote",
    "bundle=$bundlePath",
    "snapshot=$snapshotPath",
    "working_tree_included=$IncludeWorkingTree",
    "dirty_worktree=$([string]::IsNullOrWhiteSpace($gitStatus) -eq $false)",
    "--- git status --short ---",
    $gitStatus
) | Set-Content -Path $metaPath -Encoding UTF8

Write-Host ""
Write-Host "Backup finished:" -ForegroundColor Green
Write-Host " - $bundlePath"
Write-Host " - $snapshotPath"
Write-Host " - $metaPath"
if ($IncludeWorkingTree) { Write-Host " - $wtPath" }
Write-Host ""
Write-Host "Restore test commands:" -ForegroundColor Yellow
Write-Host "  git clone teacherflow_history_$timestamp.bundle teacherflow-restore-test"
Write-Host "  tar -xzf teacherflow_snapshot_$timestamp.tar.gz"
