#!/bin/bash
# ==========================================
# Export Neon Database Backup
# ==========================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}
╔═══════════════════════════════════╗
║   Neon Database Backup Export    ║
╚═══════════════════════════════════╝
${NC}"

# Verificar se NEON_DATABASE_URL está definida
if [ -z "$NEON_DATABASE_URL" ]; then
    echo -e "${RED}❌ Erro: NEON_DATABASE_URL não definida${NC}"
    echo -e "${YELLOW}Configure a variável de ambiente:${NC}"
    echo -e "  export NEON_DATABASE_URL='postgresql://user:pass@host/db'"
    exit 1
fi

# Criar pasta de backups
BACKUP_DIR="backups"
mkdir -p "$BACKUP_DIR"

# Gerar nome do backup com timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/neon-backup-$TIMESTAMP.sql"

echo -e "${BLUE}📦 Exportando database Neon...${NC}"
echo -e "   Origem: Neon PostgreSQL"
echo -e "   Destino: $BACKUP_FILE"

# Exportar database usando pg_dump
pg_dump "$NEON_DATABASE_URL" \
  --no-owner \
  --no-acl \
  --clean \
  --if-exists \
  > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}✓ Backup criado com sucesso!${NC}"
    echo -e "   Arquivo: $BACKUP_FILE"
    echo -e "   Tamanho: $BACKUP_SIZE"
    
    # Comprimir backup (opcional)
    echo -e "${BLUE}🗜️  Comprimindo backup...${NC}"
    gzip -9 "$BACKUP_FILE"
    COMPRESSED_SIZE=$(du -h "$BACKUP_FILE.gz" | cut -f1)
    echo -e "${GREEN}✓ Backup comprimido!${NC}"
    echo -e "   Arquivo final: $BACKUP_FILE.gz"
    echo -e "   Tamanho: $COMPRESSED_SIZE"
    
    echo -e "
${GREEN}╔═══════════════════════════════════╗
║     ✅ Backup Concluído!          ║
╚═══════════════════════════════════╝${NC}

💡 Para restaurar no Railway:

  # 1. Obter Railway DATABASE_URL
  RAILWAY_DB_URL=\$(railway vars --service backend | grep DATABASE_URL | cut -d'=' -f2-)

  # 2. Descomprimir backup
  gunzip $BACKUP_FILE.gz

  # 3. Restaurar
  psql \"\$RAILWAY_DB_URL\" < $BACKUP_FILE

  # 4. Verificar dados
  railway connect Postgres
  SELECT COUNT(*) FROM users;
  \\q
"
else
    echo -e "${RED}❌ Erro ao criar backup${NC}"
    exit 1
fi
