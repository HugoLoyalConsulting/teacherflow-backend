#!/usr/bin/env pwsh

<#
  run-qa-headed.ps1 — Executa o QA E2E do TeacherFlow com navegador visível
  - Gera senha única por execução (sem segredo fixo em código)
  - Armazena artefatos em %LOCALAPPDATA%\TeacherFlowQA (fora do OneDrive)
  - Roda npm audit e bloqueia em vulnerabilidades críticas
  - Abre relatório HTML ao final
  - Remove artefatos com mais de 7 dias automaticamente
#>

$ErrorActionPreference = "Stop"

$frontendDir = "c:\Users\Hugo Souza\OneDrive\Documentos\Python Scripts\teacherflow\frontend"
$repoRoot    = "c:\Users\Hugo Souza\OneDrive\Documentos\Python Scripts\teacherflow"
$runtimeDir  = Join-Path $env:LOCALAPPDATA "TeacherFlowQA"
$artifactDir = Join-Path $runtimeDir "qa-artifacts"

# ─────────────────────────────────────────────────────────────────────────────
# 0. Load .env.qa if QA_SECRET not already set in session
#    File lives at repo root, is gitignored, and never pushed to GitHub.
# ─────────────────────────────────────────────────────────────────────────────
$envQaPath = Join-Path $repoRoot ".env.qa"
if (-not $env:QA_SECRET -and (Test-Path $envQaPath)) {
    Get-Content $envQaPath | ForEach-Object {
        if ($_ -match '^\s*([A-Z_]+)\s*=\s*(.+)\s*$') {
            $key   = $Matches[1]
            $value = $Matches[2].Trim()
            if (-not (Get-Item "Env:\$key" -ErrorAction SilentlyContinue)) {
                Set-Item -Path "Env:\$key" -Value $value
            }
        }
    }
    Write-Host "  Segredos carregados de .env.qa" -ForegroundColor DarkGray
}

# ─────────────────────────────────────────────────────────────────────────────
# Banner
# ─────────────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           TEACHERFLOW  ·  QA HEADED RUNNER                   ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ─────────────────────────────────────────────────────────────────────────────
# 1. Ensure runtime dir exists (outside OneDrive)
# ─────────────────────────────────────────────────────────────────────────────
Write-Host "1/5  Preparando diretório de artefatos..." -ForegroundColor Yellow
if (-not (Test-Path $runtimeDir)) {
    New-Item -ItemType Directory -Path $runtimeDir -Force | Out-Null
    Write-Host "     Criado: $runtimeDir" -ForegroundColor DarkGray
} else {
    Write-Host "     Já existe: $runtimeDir" -ForegroundColor DarkGray
}

# ─────────────────────────────────────────────────────────────────────────────
# 2. TTL cleanup — remove artifact folders older than 7 days
# ─────────────────────────────────────────────────────────────────────────────
Write-Host "2/5  Limpando artefatos com mais de 7 dias..." -ForegroundColor Yellow
if (Test-Path $artifactDir) {
    $cutoff = (Get-Date).AddDays(-7)
    $old = Get-ChildItem -Path $artifactDir -Directory |
           Where-Object { $_.CreationTime -lt $cutoff }
    if ($old.Count -gt 0) {
        $old | Remove-Item -Recurse -Force
        Write-Host "     Removidos: $($old.Count) diretório(s) antigos." -ForegroundColor DarkGray
    } else {
        Write-Host "     Nada a remover." -ForegroundColor DarkGray
    }
}

# ─────────────────────────────────────────────────────────────────────────────
# 3. npm audit — block on critical vulnerabilities
# ─────────────────────────────────────────────────────────────────────────────
Write-Host "3/5  Auditando dependências do frontend..." -ForegroundColor Yellow
Push-Location $frontendDir
try {
    $auditOutput = npm audit --audit-level=critical --json 2>&1
    $auditJson   = $auditOutput | ConvertFrom-Json -ErrorAction SilentlyContinue

    if ($null -ne $auditJson -and $null -ne $auditJson.metadata) {
        $critical = $auditJson.metadata.vulnerabilities.critical
        if ($critical -gt 0) {
            Write-Host ""
            Write-Host "  BLOQUEADO: $critical vulnerabilidade(s) CRÍTICA(S) encontrada(s)." -ForegroundColor Red
            Write-Host "  Execute 'npm audit fix' antes de prosseguir com o QA." -ForegroundColor Red
            Write-Host ""
            Pop-Location
            exit 1
        }
        $total = $auditJson.metadata.vulnerabilities.total
        Write-Host "     OK — sem críticas. Total de vulnerabilidades: $total" -ForegroundColor DarkGray
    } else {
        Write-Host "     Aviso: não foi possível parsear resultado do audit. Continuando..." -ForegroundColor DarkYellow
    }
} catch {
    Write-Host "     Aviso: npm audit falhou ($($_.Exception.Message)). Continuando..." -ForegroundColor DarkYellow
}
Pop-Location

# ─────────────────────────────────────────────────────────────────────────────
# 4. Generate unique per-run test password (must meet >=12 char strength policy)
# ─────────────────────────────────────────────────────────────────────────────
Write-Host "4/5  Gerando senha única para esta execução..." -ForegroundColor Yellow
$upper   = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
$lower   = 'abcdefghjkmnpqrstuvwxyz'
$digits  = '23456789'
$special = '!@#$'
$extra   = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
# Build guaranteed-valid password: 1 upper + 1 lower + 1 digit + 1 special + 8 extra = 12 chars
$runPass = $upper[(Get-Random -Maximum $upper.Length)] +
           $lower[(Get-Random -Maximum $lower.Length)] +
           $digits[(Get-Random -Maximum $digits.Length)] +
           $special[(Get-Random -Maximum $special.Length)] +
           (-join ((0..7) | ForEach-Object { $extra[(Get-Random -Maximum $extra.Length)] }))
$env:QA_TEST_PASSWORD = $runPass
Write-Host "     Gerada (mascarada): $($runPass.Substring(0,2))$('*' * ($runPass.Length - 4))$($runPass.Substring($runPass.Length - 2))" -ForegroundColor DarkGray

# ─────────────────────────────────────────────────────────────────────────────
# 5. Launch headed Playwright run
# ─────────────────────────────────────────────────────────────────────────────
Write-Host "5/5  Iniciando Playwright com navegador visível..." -ForegroundColor Yellow
Write-Host ""
Write-Host "  Frontend: https://frontend-production-a7c5.up.railway.app" -ForegroundColor DarkGray
Write-Host "  Backend:  https://backend-production-c4f8f.up.railway.app" -ForegroundColor DarkGray
Write-Host "  Artefatos: $artifactDir" -ForegroundColor DarkGray
Write-Host ""

# Inject QA_SECRET if already defined globally (loaded from .env.qa above, or set manually)
if (-not $env:QA_SECRET) {
    Write-Host ""
    Write-Host "  AVISO: QA_SECRET não encontrado em .env.qa nem na sessão." -ForegroundColor DarkYellow
    Write-Host "  O debug OTP endpoint não será usado — verifique se precisa de verificação de email." -ForegroundColor DarkGray
    Write-Host "  Para configurar: adicione QA_SECRET=<valor> em $envQaPath" -ForegroundColor DarkGray
    Write-Host "  E o mesmo valor em Railway > Variables > QA_SECRET" -ForegroundColor DarkGray
    Write-Host ""
}

$env:QA_RUNTIME_DIR = $runtimeDir

Push-Location $frontendDir
try {
    npx playwright test e2e/auth.production.spec.ts `
        --config=playwright.config.ts `
        --headed `
        --reporter=list

    $exitCode = $LASTEXITCODE
} catch {
    Write-Host "  Erro inesperado ao rodar Playwright: $($_.Exception.Message)" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

# ─────────────────────────────────────────────────────────────────────────────
# Report
# ─────────────────────────────────────────────────────────────────────────────
Write-Host ""
if ($exitCode -eq 0) {
    Write-Host "  RESULTADO: PASSOU ✔" -ForegroundColor Green
} else {
    Write-Host "  RESULTADO: FALHOU ✖  (exit $exitCode)" -ForegroundColor Red
}
Write-Host ""

$htmlReport = Join-Path $artifactDir "html-report\index.html"
if (Test-Path $htmlReport) {
    Write-Host "  Abrindo relatório HTML..." -ForegroundColor Cyan
    Start-Process $htmlReport
}

# Clear per-run secret from env so it doesn't linger in the shell session
Remove-Item Env:\QA_TEST_PASSWORD -ErrorAction SilentlyContinue
Remove-Item Env:\QA_RUNTIME_DIR   -ErrorAction SilentlyContinue

exit $exitCode
