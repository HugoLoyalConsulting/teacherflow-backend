# ==========================================
# TeacherFlow - Migração para Railway
# PowerShell Script (Windows)
# ==========================================

$ErrorActionPreference = "Stop"

# Cores
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

Write-Info @"

╔════════════════════════════════════════╗
║   TeacherFlow → Railway Migration     ║
╚════════════════════════════════════════╝

"@

# Verificar se Railway CLI está instalado
Write-Info "[1/8] Verificando Railway CLI..."
if (-not (Get-Command railway -ErrorAction SilentlyContinue)) {
    Write-Warning "Railway CLI não encontrado. Instalando..."
    npm install -g @railway/cli
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Falha ao instalar Railway CLI"
        exit 1
    }
}
Write-Success "✓ Railway CLI encontrado"

# Login
Write-Info "`n[2/8] Autenticando no Railway..."
Write-Warning "Uma página do navegador será aberta para login..."
railway login
if ($LASTEXITCODE -ne 0) {
    Write-Error "Falha ao fazer login"
    exit 1
}
Write-Success "✓ Login realizado"

# Criar projeto
Write-Info "`n[3/8] Criando projeto Railway..."
railway init --name teacherflow-prod
if ($LASTEXITCODE -ne 0) {
    Write-Error "Falha ao criar projeto"
    exit 1
}
Write-Success "✓ Projeto criado"

# Criar serviço PostgreSQL
Write-Info "`n[4/8] Adicionando PostgreSQL..."
railway add --database postgresql
if ($LASTEXITCODE -ne 0) {
    Write-Error "Falha ao adicionar PostgreSQL"
    exit 1
}
Write-Success "✓ PostgreSQL adicionado"

# Deploy backend
Write-Info "`n[5/8] Fazendo deploy do backend..."
Push-Location backend
railway up --service backend --detach
if ($LASTEXITCODE -ne 0) {
    Pop-Location
    Write-Error "Falha no deploy do backend"
    exit 1
}
Pop-Location
Write-Success "✓ Backend em deploy"

# Configurar variáveis backend
Write-Info "`n[6/8] Configurando variáveis de ambiente (backend)..."

# Gerar SECRET_KEY seguro (32 bytes hex)
$secretKey = -join ((0..31) | ForEach-Object { '{0:x2}' -f (Get-Random -Maximum 256) })

# Configurar variáveis
railway variables set --service backend `
  "DATABASE_URL=`${{Postgres.DATABASE_URL}}" `
  "SECRET_KEY=$secretKey" `
  "ALGORITHM=HS256" `
  "ACCESS_TOKEN_EXPIRE_MINUTES=30" `
  "REFRESH_TOKEN_EXPIRE_DAYS=7" `
  "DEBUG=false" `
  "API_V1_STR=/api/v1" `
  "ENVIRONMENT=production"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Falha ao configurar variáveis do backend"
    exit 1
}
Write-Success "✓ Variáveis do backend configuradas"

# Aguardar backend ficar disponível
Write-Info "`nAguardando backend ficar disponível (30s)..."
Start-Sleep -Seconds 30

# Referência interna do Railway para criar dependência FE -> BE
$backendRefApi = 'https://${{backend.RAILWAY_PUBLIC_DOMAIN}}/api/v1'
Write-Success "✓ Backend API Reference: $backendRefApi"

# Deploy frontend
Write-Info "`n[7/8] Fazendo deploy do frontend..."
Push-Location frontend
railway up --service frontend --detach
if ($LASTEXITCODE -ne 0) {
    Pop-Location
    Write-Error "Falha no deploy do frontend"
    exit 1
}
Pop-Location
Write-Success "✓ Frontend em deploy"

# Configurar variáveis frontend
Write-Info "`n[8/8] Configurando variáveis de ambiente (frontend)..."
railway variables set --service frontend `
    "VITE_API_URL=$backendRefApi" `
  "VITE_ENVIRONMENT=production"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Falha ao configurar variáveis do frontend"
    exit 1
}
Write-Success "✓ Variáveis do frontend configuradas"

# Atualizar CORS no backend
Write-Info "`nAtualizando CORS origins..."
Start-Sleep -Seconds 20

$frontendStatus = railway status --service frontend --json 2>$null | ConvertFrom-Json
$frontendUrl = $frontendStatus.url

if ($frontendUrl) {
    railway variables set --service backend `
      "CORS_ORIGINS=$frontendUrl,http://localhost:5173,http://localhost:3000"
    Write-Success "✓ CORS atualizado"
} else {
    Write-Warning "Configure CORS manualmente no Railway Dashboard"
}

# Finalizar
Write-Success @"

╔════════════════════════════════════════╗
║     ✅ Migração Concluída!            ║
╚════════════════════════════════════════╝

"@

Write-Info "📊 Resumo:"
Write-Host "  🗄️  Database:  PostgreSQL (Railway)" -ForegroundColor White
Write-Host "  🔌 Backend API Ref:   $backendRefApi" -ForegroundColor White
if ($frontendUrl) {
    Write-Host "  🌐 Frontend:  $frontendUrl" -ForegroundColor White
}

Write-Info "`n🎯 Próximos passos:"
Write-Host "  1. Abrir dashboard: " -NoNewline -ForegroundColor White
Write-Host "railway dashboard" -ForegroundColor Yellow
Write-Host "  2. Verificar logs: " -NoNewline -ForegroundColor White
Write-Host "railway logs --service backend" -ForegroundColor Yellow
Write-Host "  3. Testar aplicação nos URLs acima" -ForegroundColor White

Write-Info "`n💡 Comandos úteis:"
Write-Host "  railway dashboard              " -NoNewline -ForegroundColor Yellow
Write-Host "# Abrir dashboard web" -ForegroundColor Gray
Write-Host "  railway logs --service backend " -NoNewline -ForegroundColor Yellow
Write-Host "# Ver logs" -ForegroundColor Gray
Write-Host "  railway vars --service backend " -NoNewline -ForegroundColor Yellow
Write-Host "# Ver variáveis" -ForegroundColor Gray

Write-Info "`n💰 Custo estimado: `$5-20/mês"
