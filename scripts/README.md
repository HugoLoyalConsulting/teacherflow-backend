# Scripts Hub

Automacoes do projeto agrupadas por finalidade.

## Estrutura

- `scripts/backup/`: backup e restore de banco/codigo
- `scripts/database/`: utilitarios de dados ativos
- `scripts/database/cutover-neon-to-railway.ps1`: cutover controlado Neon -> Railway Postgres
- `scripts/quality/`: validacao e smoke tests
- `scripts/deploy/`: utilitarios de deploy
- `scripts/deploy/configure-railway-env.ps1`: configura variaveis de `staging`/`production` no Railway
- `scripts/migrate-to-railway.ps1`: setup completo no Railway (Windows)
- `scripts/migrate-to-railway.sh`: setup completo no Railway (Linux/Mac)

## Execucoes Mais Comuns

```powershell
# Smoke test backend
./scripts/quality/test-backend.ps1

# Validacao de stack (frontend + backend)
./scripts/quality/validate-stack.ps1

# Backup de codigo
./scripts/backup/backup_code.ps1

# Backup de banco
python scripts/backup/backup_database.py

# Restore de banco
python scripts/backup/restore_database.py

# Cutover de dados Neon -> Railway (PowerShell)
$env:NEON_DATABASE_URL="postgresql://..."
$env:RAILWAY_DATABASE_URL="postgresql://..."
./scripts/database/cutover-neon-to-railway.ps1

# Configurar ambiente staging no Railway
./scripts/deploy/configure-railway-env.ps1 `
	-BackendService "backend-staging" `
	-FrontendService "frontend-staging" `
	-Environment staging `
	-EnableAutoSeed

# Configurar ambiente production no Railway
./scripts/deploy/configure-railway-env.ps1 `
	-BackendService "backend-production" `
	-FrontendService "frontend-production" `
	-Environment production
```
