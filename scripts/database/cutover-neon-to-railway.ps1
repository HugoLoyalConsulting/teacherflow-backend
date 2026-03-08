# Requires: pg_dump and psql in PATH
# Purpose: Controlled DB cutover from Neon PostgreSQL to Railway PostgreSQL

param(
    [Parameter(Mandatory = $false)]
    [string]$SourceDatabaseUrl = $env:NEON_DATABASE_URL,

    [Parameter(Mandatory = $false)]
    [string]$TargetDatabaseUrl = $env:RAILWAY_DATABASE_URL,

    [Parameter(Mandatory = $false)]
    [string]$BackupDir = "backups/database/cutover",

    [Parameter(Mandatory = $false)]
    [switch]$SkipConfirm,

    [Parameter(Mandatory = $false)]
    [switch]$SchemaOnly
)

$ErrorActionPreference = "Stop"

function Write-Info($msg) { Write-Host $msg -ForegroundColor Cyan }
function Write-Warn($msg) { Write-Host $msg -ForegroundColor Yellow }
function Write-Ok($msg) { Write-Host $msg -ForegroundColor Green }
function Write-Fail($msg) { Write-Host $msg -ForegroundColor Red }

function Assert-Command($name) {
    if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
        throw "Command '$name' not found in PATH"
    }
}

Write-Info "=== TeacherFlow DB Cutover: Neon -> Railway ==="

if ([string]::IsNullOrWhiteSpace($SourceDatabaseUrl)) {
    throw "Source DB URL missing. Set -SourceDatabaseUrl or NEON_DATABASE_URL"
}
if ([string]::IsNullOrWhiteSpace($TargetDatabaseUrl)) {
    throw "Target DB URL missing. Set -TargetDatabaseUrl or RAILWAY_DATABASE_URL"
}

Assert-Command "pg_dump"
Assert-Command "psql"

$resolvedBackupDir = Resolve-Path -LiteralPath "." | ForEach-Object { Join-Path $_.Path $BackupDir }
if (-not (Test-Path $resolvedBackupDir)) {
    New-Item -Path $resolvedBackupDir -ItemType Directory -Force | Out-Null
}

$ts = Get-Date -Format "yyyyMMdd_HHmmss"
$dumpFile = Join-Path $resolvedBackupDir "teacherflow_cutover_${ts}.sql"
$schemaFile = Join-Path $resolvedBackupDir "teacherflow_schema_${ts}.sql"
$checksumFile = Join-Path $resolvedBackupDir "teacherflow_cutover_${ts}.sha256"

Write-Info "Source: [provided via parameter/env]"
Write-Info "Target: [provided via parameter/env]"
Write-Info "Backup directory: $resolvedBackupDir"

if (-not $SkipConfirm) {
    Write-Warn "This operation writes data into target DB."
    Write-Warn "Recommended: run first against STAGING target."
    $answer = Read-Host "Type CUTOVER to continue"
    if ($answer -ne "CUTOVER") {
        Write-Fail "Aborted by user."
        exit 1
    }
}

Write-Info "[1/6] Exporting source schema backup..."
& pg_dump --schema-only --no-owner --no-acl "$SourceDatabaseUrl" | Out-File -FilePath $schemaFile -Encoding utf8
if ($LASTEXITCODE -ne 0) { throw "Schema backup failed" }
Write-Ok "Schema backup created: $schemaFile"

Write-Info "[2/6] Exporting source full backup..."
if ($SchemaOnly) {
    Copy-Item -Path $schemaFile -Destination $dumpFile -Force
} else {
    & pg_dump --format=plain --verbose --no-owner --no-acl "$SourceDatabaseUrl" | Out-File -FilePath $dumpFile -Encoding utf8
    if ($LASTEXITCODE -ne 0) { throw "Full backup failed" }
}
Write-Ok "Data dump created: $dumpFile"

Write-Info "[3/6] Generating checksum..."
$hash = Get-FileHash -Path $dumpFile -Algorithm SHA256
"$($hash.Hash)  $dumpFile" | Out-File -FilePath $checksumFile -Encoding ascii
Write-Ok "Checksum saved: $checksumFile"

Write-Info "[4/6] Verifying target connectivity..."
& psql "$TargetDatabaseUrl" -c "SELECT version();" 1>$null
if ($LASTEXITCODE -ne 0) { throw "Target DB connectivity check failed" }
Write-Ok "Target connectivity OK"

Write-Info "[5/6] Restoring dump into target DB..."
& psql "$TargetDatabaseUrl" -v ON_ERROR_STOP=1 -f "$dumpFile"
if ($LASTEXITCODE -ne 0) { throw "Restore failed" }
Write-Ok "Restore completed"

Write-Info "[6/6] Running post-restore sanity checks..."
& psql "$TargetDatabaseUrl" -c "SELECT 'users' AS table_name, COUNT(*) AS total FROM users UNION ALL SELECT 'students', COUNT(*) FROM students UNION ALL SELECT 'groups', COUNT(*) FROM groups UNION ALL SELECT 'subscriptions', COUNT(*) FROM subscriptions;"
if ($LASTEXITCODE -ne 0) { throw "Post-restore validation failed" }
Write-Ok "Sanity checks complete"

Write-Host ""
Write-Ok "Cutover data copy finished successfully."
Write-Info "Next steps:"
Write-Host "1. Update backend DATABASE_URL in Railway service to target DB." -ForegroundColor White
Write-Host "2. Redeploy backend service." -ForegroundColor White
Write-Host "3. Run smoke tests (auth/subscriptions/onboarding/dashboard)." -ForegroundColor White
Write-Host "4. Keep Neon DB read-only standby for rollback window." -ForegroundColor White
