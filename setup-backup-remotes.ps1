# 🔄 Configuração de Múltiplos Remotes Git
# Script para adicionar repositórios backup (GitLab, Bitbucket, etc.)

Write-Host "🔄 CONFIGURAÇÃO DE BACKUP REMOTES GIT" -ForegroundColor Cyan
Write-Host "=" * 60
Write-Host ""

$repoPath = Get-Location

# Verificar se estamos em um repo git
if (-not (Test-Path ".git")) {
    Write-Host "❌ Este diretório não é um repositório Git!" -ForegroundColor Red
    exit 1
}

# Listar remotes atuais
Write-Host "📋 Remotes atuais:" -ForegroundColor Yellow
git remote -v
Write-Host ""

# Função para adicionar remote
function Add-BackupRemote {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Platform
    )
    
    Write-Host "Configurando backup remote: $Name ($Platform)" -NoNewline
    
    # Verificar se já existe
    $existing = git remote get-url $Name 2>$null
    
    if ($existing) {
        Write-Host " ⚠️ Já existe" -ForegroundColor Yellow
        $update = Read-Host "   Deseja atualizar? (s/N)"
        
        if ($update -eq 's' -or $update -eq 'S') {
            git remote set-url $Name $Url
            Write-Host "   ✅ URL atualizada" -ForegroundColor Green
        }
    } else {
        git remote add $Name $Url
        Write-Host " ✅ Adicionado" -ForegroundColor Green
    }
}

# Menu de opções
Write-Host "📦 Opções de backup remotes disponíveis:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. GitLab (https://gitlab.com)"
Write-Host "2. Bitbucket (https://bitbucket.org)"
Write-Host "3. Azure DevOps (https://dev.azure.com)"
Write-Host "4. GitHub (repositório secundário)"
Write-Host "5. Custom (seu próprio servidor Git)"
Write-Host "6. Configuração automática (recomendado)"
Write-Host "0. Pular configuração"
Write-Host ""

$choice = Read-Host "Selecione uma opção"

switch ($choice) {
    "1" {
        Write-Host "`n📝 Configurando GitLab..." -ForegroundColor Yellow
        Write-Host "Crie um repositório em: https://gitlab.com/projects/new" -ForegroundColor Gray
        Write-Host ""
        $gitlabUrl = Read-Host "Cole a URL do repositório GitLab (ex: https://gitlab.com/user/teacherflow.git)"
        
        if ($gitlabUrl) {
            Add-BackupRemote -Name "gitlab" -Url $gitlabUrl -Platform "GitLab"
        }
    }
    
    "2" {
        Write-Host "`n📝 Configurando Bitbucket..." -ForegroundColor Yellow
        Write-Host "Crie um repositório em: https://bitbucket.org/repo/create" -ForegroundColor Gray
        Write-Host ""
        $bitbucketUrl = Read-Host "Cole a URL do repositório Bitbucket (ex: https://bitbucket.org/user/teacherflow.git)"
        
        if ($bitbucketUrl) {
            Add-BackupRemote -Name "bitbucket" -Url $bitbucketUrl -Platform "Bitbucket"
        }
    }
    
    "3" {
        Write-Host "`n📝 Configurando Azure DevOps..." -ForegroundColor Yellow
        Write-Host "Crie um projeto em: https://dev.azure.com" -ForegroundColor Gray
        Write-Host ""
        $azureUrl = Read-Host "Cole a URL do repositório Azure DevOps"
        
        if ($azureUrl) {
            Add-BackupRemote -Name "azure" -Url $azureUrl -Platform "Azure DevOps"
        }
    }
    
    "4" {
        Write-Host "`n📝 Configurando GitHub secundário..." -ForegroundColor Yellow
        Write-Host "Crie um repositório privado em: https://github.com/new" -ForegroundColor Gray
        Write-Host ""
        $githubUrl = Read-Host "Cole a URL do repositório GitHub (ex: https://github.com/user/teacherflow-backup.git)"
        
        if ($githubUrl) {
            Add-BackupRemote -Name "github-backup" -Url $githubUrl -Platform "GitHub"
        }
    }
    
    "5" {
        Write-Host "`n📝 Configurando remote customizado..." -ForegroundColor Yellow
        $customName = Read-Host "Nome do remote (ex: my-server)"
        $customUrl = Read-Host "URL do remote (ex: user@server.com:/git/teacherflow.git)"
        
        if ($customName -and $customUrl) {
            Add-BackupRemote -Name $customName -Url $customUrl -Platform "Custom"
        }
    }
    
    "6" {
        Write-Host "`n🚀 Configuração automática..." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Esta opção criará URLs template para você preencher depois." -ForegroundColor Gray
        Write-Host ""
        
        # GitLab
        Write-Host "GitLab:" -NoNewline
        $gitlabUsername = Read-Host " Digite seu username GitLab (ou Enter para pular)"
        if ($gitlabUsername) {
            $gitlabUrl = "https://gitlab.com/$gitlabUsername/teacherflow-backend.git"
            Add-BackupRemote -Name "gitlab" -Url $gitlabUrl -Platform "GitLab"
        }
        
        # Bitbucket
        Write-Host "Bitbucket:" -NoNewline
        $bitbucketUsername = Read-Host " Digite seu username Bitbucket (ou Enter para pular)"
        if ($bitbucketUsername) {
            $bitbucketUrl = "https://bitbucket.org/$bitbucketUsername/teacherflow-backend.git"
            Add-BackupRemote -Name "bitbucket" -Url $bitbucketUrl -Platform "Bitbucket"
        }
    }
    
    "0" {
        Write-Host "`n⏭️ Pulando configuração de backups remotes" -ForegroundColor Yellow
    }
    
    default {
        Write-Host "`n❌ Opção inválida" -ForegroundColor Red
        exit 1
    }
}

# Listar remotes configurados
Write-Host "`n" + ("=" * 60)
Write-Host "📋 Remotes configurados:" -ForegroundColor Cyan
Write-Host ("=" * 60)
git remote -v
Write-Host ""

# Instruções de push
$remotes = git remote
$backupRemotes = $remotes | Where-Object { $_ -ne "origin" }

if ($backupRemotes) {
    Write-Host "💡 Para fazer push para todos os remotes de backup:" -ForegroundColor Yellow
    Write-Host ""
    
    foreach ($remote in $backupRemotes) {
        Write-Host "   git push $remote main --all" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "   Ou use o script: .\push-all-remotes.ps1" -ForegroundColor Green
    Write-Host ""
    
    # Criar script de push automático
    $pushScript = @"
# Push para todos os remotes configurados
Write-Host "🚀 Pushing to all remotes..." -ForegroundColor Cyan

`$remotes = git remote
`$success = 0
`$failed = 0

foreach (`$remote in `$remotes) {
    Write-Host "`nPushing to: `$remote" -ForegroundColor Yellow
    
    try {
        git push `$remote --all
        git push `$remote --tags
        Write-Host "✅ `$remote: Success" -ForegroundColor Green
        `$success++
    } catch {
        Write-Host "❌ `$remote: Failed" -ForegroundColor Red
        `$failed++
    }
}

Write-Host "`n" + ("=" * 60)
Write-Host "Summary: `$success succeeded, `$failed failed" -ForegroundColor Cyan
"@
    
    $pushScript | Out-File -FilePath "push-all-remotes.ps1" -Encoding UTF8
    Write-Host "✅ Script criado: push-all-remotes.ps1" -ForegroundColor Green
}

# Configurar Git Secrets no GitHub Actions (se aplicável)
Write-Host "`n📝 CONFIGURAR SECRETS NO GITHUB ACTIONS:" -ForegroundColor Cyan
Write-Host ("=" * 60)
Write-Host ""
Write-Host "Para backups automáticos via GitHub Actions, adicione estes secrets:" -ForegroundColor Yellow
Write-Host ""

if ($gitlabUrl) {
    Write-Host "GITLAB_BACKUP_URL:" -ForegroundColor White
    Write-Host "   $gitlabUrl" -ForegroundColor Gray
    Write-Host ""
}

if ($bitbucketUrl) {
    Write-Host "BITBUCKET_BACKUP_URL:" -ForegroundColor White
    Write-Host "   $bitbucketUrl" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "Acesse: https://github.com/HugoLoyalConsulting/teacherflow-backend/settings/secrets/actions" -ForegroundColor Cyan
Write-Host ""

# Testar conectividade
$testRemote = Read-Host "Deseja testar conectividade com os remotes agora? (s/N)"

if ($testRemote -eq 's' -or $testRemote -eq 'S') {
    Write-Host "`n🔌 Testando conectividade..." -ForegroundColor Yellow
    
    foreach ($remote in $backupRemotes) {
        Write-Host "`nTesting $remote..." -NoNewline
        
        $result = git ls-remote $remote 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host " ✅ OK" -ForegroundColor Green
        } else {
            Write-Host " ❌ Falhou" -ForegroundColor Red
            Write-Host "   Verifique: autenticação, URL, permissões" -ForegroundColor Gray
        }
    }
}

Write-Host "`n" + ("=" * 60)
Write-Host "✅ CONFIGURAÇÃO COMPLETA!" -ForegroundColor Green
Write-Host ("=" * 60)
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Criar repositórios nos serviços configurados (se ainda não criou)"
Write-Host "2. Fazer primeiro push: .\push-all-remotes.ps1"
Write-Host "3. Configurar secrets no GitHub Actions (para backup automático)"
Write-Host "4. Testar restore de um backup"
Write-Host ""
