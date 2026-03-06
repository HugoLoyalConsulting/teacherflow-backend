# Scripts Hub

Automacoes do projeto agrupadas por finalidade.

## Estrutura

- `scripts/backup/`: backup e restore de banco/codigo
- `scripts/database/`: seed/populacao de dados
- `scripts/quality/`: validacao e smoke tests
- `scripts/deploy/`: utilitarios de deploy (reservado)

## Execucoes Mais Comuns

```powershell
# Smoke test backend
./scripts/quality/test-backend.ps1

# Backup de codigo
./scripts/backup/backup_code.ps1

# Backup de banco
python scripts/backup/backup_database.py

# Restore de banco
python scripts/backup/restore_database.py
```
