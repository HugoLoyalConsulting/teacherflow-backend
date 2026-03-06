# TeacherFlow Disaster Recovery Runbook

## Scope
This runbook covers recovery of:
- Code: backend + frontend + git history
- Data: Neon PostgreSQL
- Runtime config: Render + Vercel environment settings

## Recovery Targets (RPO/RTO)
- `RPO` (acceptable data loss): <= 24h (daily backups)
- `RTO` (time to recover): <= 2h for API + <= 3h for full app

## Backup Layers Implemented
- `Code history`: GitHub + optional mirror remotes + `.bundle`
- `Code snapshot`: tar.gz + optional working tree zip
- `Database`: SQL dump + JSON + CSV extracts (compressed)
- `Automation`: `.github/workflows/automated-backup.yml`

## Required Secrets/Configs
- GitHub Actions secret: `NEON_DATABASE_URL`
- Optional mirrors: `GITLAB_BACKUP_URL`, `BITBUCKET_BACKUP_URL`
- Render env: `DATABASE_URL`, `SECRET_KEY`, `API_V1_STR`, `CORS_ORIGINS`
- Vercel env: `VITE_API_URL`, `VITE_ENVIRONMENT`

## Daily Operations Checklist
1. Confirm nightly backup workflow success in GitHub Actions.
2. Verify latest artifact exists: `database-backup-*` and `code-backup-*`.
3. Run restore drill weekly in staging.

## Incident Types
### A) Accidental code deletion/corruption
1. Restore from GitHub latest commit.
2. If repository compromised, recover from `.bundle` or backup remote.
3. Redeploy Render + Vercel.

### B) Neon data corruption/loss
1. Put app in maintenance mode (optional but recommended).
2. Restore latest verified SQL backup to staging Neon.
3. Validate data consistency.
4. Restore to production Neon.
5. Run smoke tests.

### C) Full account lockout/provider outage
1. Recreate repo from local `.bundle`.
2. Provision new PostgreSQL and restore SQL backup.
3. Recreate Render service with `render.yaml`.
4. Recreate Vercel project and set required env vars.
5. Point DNS/app URLs to new environment.

## Recovery Procedures
### 1) Restore database from SQL backup
```bash
# local
python scripts/backup/restore_database.py
```
Select latest `teacherflow_backup_*.sql.gz` and confirm.

### 2) Restore code from git bundle
```bash
git clone teacherflow_history_YYYYMMDD_HHMMSS.bundle teacherflow-recovered
cd teacherflow-recovered
git remote add origin <new-or-existing-origin-url>
git push origin --all
git push origin --tags
```

### 3) Rebuild services
- Render backend deploy from `main` branch.
- Run Alembic migrations:
```bash
cd /opt/render/project/src/backend
alembic upgrade head
```
- Vercel redeploy after env var validation.

## Verification (Post-Recovery)
- Backend health: `GET /health` returns 200.
- Critical endpoints respond:
  - `/api/v1/subscriptions/tiers`
  - `/api/v1/tour/steps`
  - `/api/v1/lgpd/privacy-policy`
- Login + dashboard load successfully.
- Data counts look sane (students, lessons, payments).

## Drill Plan (Recommended)
- Weekly: restore latest SQL backup to staging and run smoke tests.
- Monthly: full simulation from `.bundle` + SQL backup.
- After each drill: record findings and improve runbook.

## Immediate Next Setup (Manual)
1. Add GitHub secret `NEON_DATABASE_URL`.
2. Optionally configure backup remotes with `scripts/backup/setup-backup-remotes.ps1`.
3. Run first local backups:
```powershell
.\scripts\backup\backup_code.ps1
python scripts/backup/backup_database.py
```
4. Trigger workflow manually: `Actions -> Automated Database & Code Backup -> Run workflow`.
