param(
    [Parameter(Mandatory = $true)]
    [string]$BackendService,

    [Parameter(Mandatory = $true)]
    [string]$FrontendService,

    [Parameter(Mandatory = $true)]
    [ValidateSet("staging", "production")]
    [string]$Environment,

    [Parameter(Mandatory = $false)]
    [string]$FrontendDomain,

    [Parameter(Mandatory = $false)]
    [switch]$EnableAutoSeed
)

$ErrorActionPreference = "Stop"

function Write-Info($msg) { Write-Host $msg -ForegroundColor Cyan }
function Write-Ok($msg) { Write-Host $msg -ForegroundColor Green }
function Write-Warn($msg) { Write-Host $msg -ForegroundColor Yellow }

if (-not (Get-Command railway -ErrorAction SilentlyContinue)) {
    throw "Railway CLI not found. Install with: npm i -g @railway/cli"
}

$isProd = $Environment -eq "production"
$autoSeedValue = if ($isProd) { "false" } elseif ($EnableAutoSeed) { "true" } else { "false" }
$frontendRefApi = "https://`${{$BackendService.RAILWAY_PUBLIC_DOMAIN}}/api/v1"

if ([string]::IsNullOrWhiteSpace($FrontendDomain)) {
    $FrontendDomain = "https://`${{$FrontendService.RAILWAY_PUBLIC_DOMAIN}}"
}

Write-Info "Configuring backend service: $BackendService"
railway variables set --service $BackendService `
  "DATABASE_URL=`${{Postgres.DATABASE_URL}}" `
  "ENVIRONMENT=$Environment" `
  "DEBUG=false" `
  "API_V1_STR=/api/v1" `
  "ALGORITHM=HS256" `
  "ACCESS_TOKEN_EXPIRE_MINUTES=30" `
  "REFRESH_TOKEN_EXPIRE_DAYS=7" `
  "ENABLE_AUTOSEED=$autoSeedValue" `
  "CORS_ORIGINS=[\"$FrontendDomain\",\"http://localhost:5173\",\"http://localhost:3000\"]"

Write-Ok "Backend variables configured"

Write-Info "Configuring frontend service: $FrontendService"
railway variables set --service $FrontendService `
  "VITE_ENVIRONMENT=$Environment" `
  "VITE_API_URL=$frontendRefApi"

Write-Ok "Frontend variables configured"

Write-Host ""
Write-Ok "Done."
Write-Host "- Backend:  $BackendService" -ForegroundColor White
Write-Host "- Frontend: $FrontendService" -ForegroundColor White
Write-Host "- Env:      $Environment" -ForegroundColor White
Write-Host "- FE API:   $frontendRefApi" -ForegroundColor White
Write-Host ""
Write-Warn "Remember to set SECRET_KEY and SMTP_* manually as Railway Secrets if not already configured."
