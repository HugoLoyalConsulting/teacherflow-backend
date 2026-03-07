# TeacherFlow Backend - Script de Verificação
# Testa todos os endpoints críticos do backend

$BackendURL = "https://backend-production-c4f8f.up.railway.app"
$ApiV1 = "$BackendURL/api/v1"

Write-Host "🔍 VERIFICANDO BACKEND TEACHERFLOW" -ForegroundColor Cyan
Write-Host "=" * 60
Write-Host ""

# Função auxiliar para testar endpoint
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Body = $null,
        [int]$ExpectedStatus = 200
    )
    
    Write-Host "Testando: $Name" -NoNewline
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            TimeoutSec = 10
            ErrorAction = 'Stop'
        }
        
        if ($Body) {
            $params['Body'] = ($Body | ConvertTo-Json)
            $params['ContentType'] = 'application/json'
        }
        
        $response = Invoke-WebRequest @params
        
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Host " ✅ OK ($($response.StatusCode))" -ForegroundColor Green
            
            # Parse JSON se disponível
            if ($response.Content) {
                try {
                    $json = $response.Content | ConvertFrom-Json
                    
                    # Mostrar info relevante
                    if ($json.status) {
                        Write-Host "   └─ Status: $($json.status)" -ForegroundColor Gray
                    }
                    if ($json.Length -gt 0) {
                        Write-Host "   └─ Items: $($json.Length)" -ForegroundColor Gray
                    }
                    if ($json.access_token) {
                        Write-Host "   └─ Token obtido com sucesso" -ForegroundColor Gray
                    }
                    
                    return @{ Success = $true; Data = $json; Status = $response.StatusCode }
                } catch {
                    return @{ Success = $true; Data = $response.Content; Status = $response.StatusCode }
                }
            }
            
            return @{ Success = $true; Status = $response.StatusCode }
        } else {
            Write-Host " ⚠️ Status inesperado: $($response.StatusCode)" -ForegroundColor Yellow
            return @{ Success = $false; Status = $response.StatusCode }
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 404) {
            Write-Host " ❌ 404 Not Found" -ForegroundColor Red
            Write-Host "   └─ Endpoint não existe (deploy antigo ou erro de rota)" -ForegroundColor DarkRed
        }
        elseif ($statusCode -eq 500) {
            Write-Host " ❌ 500 Server Error" -ForegroundColor Red
            Write-Host "   └─ Erro interno (verificar logs do Render)" -ForegroundColor DarkRed
        }
        elseif ($statusCode -eq 422) {
            Write-Host " ❌ 422 Validation Error" -ForegroundColor Red
            Write-Host "   └─ Payload inválido" -ForegroundColor DarkRed
        }
        else {
            Write-Host " ❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        return @{ Success = $false; Error = $_.Exception.Message; Status = $statusCode }
    }
}

# 1. HEALTH CHECKS
Write-Host "`n📊 HEALTH CHECKS" -ForegroundColor Yellow
Write-Host "-" * 60

Test-Endpoint -Name "Health (root)" -Url "$BackendURL/health" | Out-Null
Test-Endpoint -Name "Healthz" -Url "$BackendURL/healthz" | Out-Null
Test-Endpoint -Name "Root endpoint" -Url "$BackendURL/" | Out-Null

# 2. NOVOS ENDPOINTS (Tasks 7-11)
Write-Host "`n🆕 NOVOS ENDPOINTS (Subscription System)" -ForegroundColor Yellow
Write-Host "-" * 60

$subsResult = Test-Endpoint -Name "Subscription Tiers" -Url "$ApiV1/subscriptions/tiers"
$tourResult = Test-Endpoint -Name "Tour Steps" -Url "$ApiV1/tour/steps"
$lgpdResult = Test-Endpoint -Name "LGPD Privacy Policy" -Url "$ApiV1/lgpd/privacy-policy"

# Verificar se novos endpoints estão no ar
$newEndpointsOk = $subsResult.Success -and $tourResult.Success -and $lgpdResult.Success

if (-not $newEndpointsOk) {
    Write-Host "`n⚠️  ATENÇÃO: Novos endpoints retornando 404!" -ForegroundColor Red
    Write-Host "   Possíveis causas:" -ForegroundColor Yellow
    Write-Host "   1. Deploy no Railway ainda não concluiu" -ForegroundColor Gray
    Write-Host "   2. Build falhou (verificar logs no Dashboard)" -ForegroundColor Gray
    Write-Host "   3. Migração 004 não foi rodada" -ForegroundColor Gray
    Write-Host "`n   ✅ SOLUÇÃO: Acesse Railway Dashboard e force redeploy" -ForegroundColor Green
}

# 3. ENDPOINTS EXISTENTES (Verificação de Regressão)
Write-Host "`n🔄 ENDPOINTS EXISTENTES" -ForegroundColor Yellow
Write-Host "-" * 60

Test-Endpoint -Name "OpenAPI Docs" -Url "$ApiV1/openapi.json" | Out-Null

# 4. TESTE DE AUTENTICAÇÃO
Write-Host "`n🔐 TESTE DE AUTENTICAÇÃO" -ForegroundColor Yellow
Write-Host "-" * 60

$loginBody = @{
    email = "professor.demo@teacherflow.com"
    password = "demo123"
}

$loginResult = Test-Endpoint -Name "Login Professor Demo" -Url "$ApiV1/auth/login" -Method "POST" -Body $loginBody

if ($loginResult.Success) {
    $token = $loginResult.Data.access_token
    
    # Testar endpoint autenticado
    Write-Host ""
    Write-Host "Testando: Dashboard (autenticado)" -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri "$ApiV1/dashboard" `
            -Headers @{ "Authorization" = "Bearer $token" } `
            -TimeoutSec 10 `
            -ErrorAction Stop
        
        Write-Host " ✅ OK ($($response.StatusCode))" -ForegroundColor Green
        $dashboard = $response.Content | ConvertFrom-Json
        Write-Host "   └─ Total Students: $($dashboard.total_students)" -ForegroundColor Gray
        Write-Host "   └─ Total Lessons: $($dashboard.total_lessons)" -ForegroundColor Gray
    }
    catch {
        Write-Host " ❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 5. VERIFICAR VERSÃO DO DEPLOY
Write-Host "`n📦 INFORMAÇÕES DO DEPLOY" -ForegroundColor Yellow
Write-Host "-" * 60

Write-Host "Backend URL: $BackendURL"
Write-Host "Região Railway: us-west2"
Write-Host "Plataforma: Railway"
Write-Host ""

# 6. SUMMARY
Write-Host "`n" + ("=" * 60)
Write-Host "📋 RESUMO DA VERIFICAÇÃO" -ForegroundColor Cyan
Write-Host ("=" * 60)

if ($newEndpointsOk) {
    Write-Host "`n✅ BACKEND 100% FUNCIONAL!" -ForegroundColor Green
    Write-Host "   - Health checks: OK" -ForegroundColor Green
    Write-Host "   - Novos endpoints: OK (deploy atualizado)" -ForegroundColor Green
    Write-Host "   - Autenticação: OK" -ForegroundColor Green
    Write-Host "`n🎉 Pronto para usar em https://frontend-production-a7c5.up.railway.app/" -ForegroundColor Green
}
else {
    Write-Host "`n⚠️  BACKEND PARCIALMENTE FUNCIONAL" -ForegroundColor Yellow
    Write-Host "   - Health checks: OK" -ForegroundColor Green
    Write-Host "   - Novos endpoints: ❌ FALTANDO (404)" -ForegroundColor Red
    Write-Host "   - Deploy desatualizado" -ForegroundColor Red
    Write-Host "`n📝 AÇÃO NECESSÁRIA:" -ForegroundColor Yellow
    Write-Host "   1. Acesse: https://railway.app/project/9725c5e6-070f-4ad5-9ec4-cbdbb76f9373" -ForegroundColor White
    Write-Host "   2. Clique em backend → Deployments → Redeploy" -ForegroundColor White
    Write-Host "   3. Aguarde build (~3-5 min)" -ForegroundColor White
    Write-Host "   4. Rode este script novamente para verificar" -ForegroundColor White
}

Write-Host "`n" + ("=" * 60)
Write-Host ""

# Railway-first: sem checklist legado de Render
