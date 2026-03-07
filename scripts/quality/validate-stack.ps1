param(
    [string]$BackendUrl = "https://backend-production-c4f8f.up.railway.app",
    [string]$FrontendUrl = "https://frontend-production-a7c5.up.railway.app",
    [int]$TimeoutSec = 30
)

$ErrorActionPreference = 'Stop'
$ApiBase = "$BackendUrl/api/v1"
$hadError = $false

function Test-Url {
    param(
        [string]$Name,
        [string]$Url,
        [int]$ExpectedStatus = 200
    )

    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec $TimeoutSec -ErrorAction Stop
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Host "[OK] $Name -> $($response.StatusCode)" -ForegroundColor Green
            return @{ Ok = $true; Response = $response }
        }

        Write-Host "[FAIL] $Name -> status $($response.StatusCode) (expected $ExpectedStatus)" -ForegroundColor Red
        return @{ Ok = $false; Response = $response }
    }
    catch {
        Write-Host "[FAIL] $Name -> $($_.Exception.Message)" -ForegroundColor Red
        return @{ Ok = $false; Response = $null }
    }
}

Write-Host "=== TeacherFlow Stack Validation ===" -ForegroundColor Cyan
Write-Host "Backend:  $BackendUrl"
Write-Host "Frontend: $FrontendUrl"
Write-Host ""

# 1) Frontend availability
$frontend = Test-Url -Name "Frontend" -Url $FrontendUrl
if (-not $frontend.Ok) { $hadError = $true }

# 2) Backend baseline
$healthz = Test-Url -Name "Backend /healthz" -Url "$BackendUrl/healthz"
if (-not $healthz.Ok) { $hadError = $true }

$openapi = Test-Url -Name "Backend /api/v1/openapi.json" -Url "$ApiBase/openapi.json"
if (-not $openapi.Ok) {
    $hadError = $true
} else {
    try {
        $doc = $openapi.Response.Content | ConvertFrom-Json
        $paths = @($doc.paths.PSObject.Properties.Name)

        Write-Host ""
        Write-Host "OpenAPI path count: $($paths.Count)"

        $requiredPaths = @(
            '/api/v1/subscriptions/tiers',
            '/api/v1/tour/steps',
            '/api/v1/lgpd/privacy-policy',
            '/api/v1/feedback'
        )

        foreach ($p in $requiredPaths) {
            if ($paths -contains $p) {
                Write-Host "[OK] Path present: $p" -ForegroundColor Green
            } else {
                Write-Host "[FAIL] Path missing: $p" -ForegroundColor Red
                $hadError = $true
            }
        }
    }
    catch {
        Write-Host "[FAIL] Could not parse OpenAPI JSON: $($_.Exception.Message)" -ForegroundColor Red
        $hadError = $true
    }
}

Write-Host ""
if ($hadError) {
    Write-Host "RESULT: FAIL" -ForegroundColor Red
    exit 1
}

Write-Host "RESULT: PASS" -ForegroundColor Green
exit 0
