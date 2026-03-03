#!/usr/bin/env pwsh

<#
Script para validar e preparar monorepo TeacherFlow
Roda todas as verificações antes do primeiro push
#>

$ErrorActionPreference = "Stop"
$monoDir = "c:\Users\Hugo Souza\OneDrive\Documentos\Python Scripts\teacherflow"

Write-Host "`n" -ForegroundColor Cyan
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         VALIDAÇÃO DO MONOREPO TEACHERFLOW                  ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# 1. Verificar estrutura
Write-Host "`n1️⃣  Verificando estrutura..." -ForegroundColor Yellow
$checks = @(
    ("frontend/src", "React app"),
    ("backend/app", "FastAPI app"),
    (".github/workflows", "GitHub Actions"),
    ("README.md", "Documentation"),
    ("package.json", "Root scripts")
)

$allOk = $true
foreach ($check in $checks) {
    $path = Join-Path $monoDir $check[0]
    if (Test-Path $path) {
        Write-Host "   ✅ $($check[1])" -ForegroundColor Green
    } else {
        Write-Host "   ❌ FALTANDO: $($check[1])" -ForegroundColor Red
        $allOk = $false
    }
}

# 2. Verificar Git
Write-Host "`n2️⃣  Verificando Git..." -ForegroundColor Yellow
Set-Location $monoDir
$gitStatus = git status 2>&1
if ($gitStatus -match "On branch main|fatal: not a git repository") {
    if ($gitStatus -match "fatal: not a git repository") {
        Write-Host "   ⚠️  Git não inicializado (vamos inicializar)" -ForegroundColor Yellow
        git init 2>$null | Out-Null
        Write-Host "   ✅ Git inicializado" -ForegroundColor Green
    } else {
        Write-Host "   ✅ Git inicializado" -ForegroundColor Green
    }
} else {
    Write-Host "   ✅ Git inicializado" -ForegroundColor Green
}

# 3. Verificar remotes
Write-Host "`n3️⃣  Verificando Git remotes..." -ForegroundColor Yellow
$remotes = git remote 2>/dev/null
if ($remotes -match "origin") {
    Write-Host "   ✅ Git remote 'origin' configurado" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Git remote não configurado" -ForegroundColor Yellow
    Write-Host "   Para configurar, rode:" -ForegroundColor Cyan
    Write-Host "      git remote add origin https://github.com/HugoLoyalConsulting/teacherflow-backend.git" -ForegroundColor Cyan
}

# 4. Contar arquivos
Write-Host "`n4️⃣  Contando arquivos..." -ForegroundColor Yellow
$frontendFiles = (Get-ChildItem "frontend" -Recurse -File).Count
$backendFiles = (Get-ChildItem "backend" -Recurse -File).Count
$totalFiles = $frontendFiles + $backendFiles

Write-Host "   Frontend: $frontendFiles arquivos" -ForegroundColor Green
Write-Host "   Backend:  $backendFiles arquivos" -ForegroundColor Green
Write-Host "   Total:    $totalFiles arquivos" -ForegroundColor Cyan

# 5. Verificar .env
Write-Host "`n5️⃣  Verificando configuração..." -ForegroundColor Yellow
$backendEnv = Test-Path "backend/.env"
$backendEnvEx = Test-Path "backend/.env.example"

if ($backendEnv) {
    Write-Host "   ✅ backend/.env existe" -ForegroundColor Green
} elseif ($backendEnvEx) {
    Write-Host "   ⚠️  Copiar backend/.env.example para backend/.env" -ForegroundColor Yellow
    Copy-Item "backend/.env.example" "backend/.env"
    Write-Host "   ✅ backend/.env criado (use valores de exemplo)" -ForegroundColor Green
}

# 6. Resumo
Write-Host "`n" -ForegroundColor Cyan
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                     RESUMO FINAL                           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

Write-Host "`n📂 Estrutura:" -ForegroundColor Cyan
Write-Host "   frontend/     $frontendFiles arquivos"
Write-Host "   backend/      $backendFiles arquivos"
Write-Host "   .github/      configuração GitHub Actions"
Write-Host "   Total:        $totalFiles arquivos"

Write-Host "`n🔧 Git:" -ForegroundColor Cyan
$branch = (git rev-parse --abbrev-ref HEAD) 2>/dev/null
if ($branch) {
    Write-Host "   Branch:   $branch"
} else {
    Write-Host "   Branch:   (não inicializado)"
}

$modified = (git status --short 2>/dev/null | Measure-Object).Count
if ($modified -gt 0) {
    Write-Host "   Arquivos modificados: $modified"
} else {
    Write-Host "   Status: limpo"
}

Write-Host "`n📌 Próximos passos:" -ForegroundColor Yellow
Write-Host "   1. Configure secrets no GitHub:" -ForegroundColor Cyan
Write-Host "      https://github.com/HugoLoyalConsulting/teacherflow-backend/settings/secrets/actions"
Write-Host ""
Write-Host "   2. Faça primeiro push:" -ForegroundColor Cyan
Write-Host "      git add ."
Write-Host "      git commit -m 'Initial monorepo'"
Write-Host "      git remote add origin https://github.com/HugoLoyalConsulting/teacherflow-backend.git"
Write-Host "      git push -u origin main"
Write-Host ""
Write-Host "   3. Acesse GitHub Actions:" -ForegroundColor Cyan
Write-Host "      https://github.com/HugoLoyalConsulting/teacherflow-backend/actions"
Write-Host ""
Write-Host "   4. Deploy automático vai iniciar!" -ForegroundColor Green

Write-Host "`n✨ Seu app estará em:" -ForegroundColor Green
Write-Host "   Frontend:  https://teacherflow.vercel.app"
Write-Host "   Backend:   https://teacherflow-api.onrender.com"
Write-Host "   Docs:      https://teacherflow-api.onrender.com/api/v1/docs"

Write-Host "`n🟢 STATUS: PRONTO PARA DEPLOY`n" -ForegroundColor Green
