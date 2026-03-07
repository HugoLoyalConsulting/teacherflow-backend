#!/bin/bash
set -e

# ==========================================
# TeacherFlow - Migração para Railway
# Bash Script (Linux/Mac)
# ==========================================

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}
╔════════════════════════════════════════╗
║   TeacherFlow → Railway Migration     ║
╚════════════════════════════════════════╝
${NC}"

# Verificar se Railway CLI está instalado
echo -e "${BLUE}[1/8]${NC} Verificando Railway CLI..."
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}⚠️  Railway CLI não encontrado. Instalando...${NC}"
    npm install -g @railway/cli
fi
echo -e "${GREEN}✓${NC} Railway CLI encontrado"

# Login
echo -e "${BLUE}[2/8]${NC} Autenticando no Railway..."
echo -e "${YELLOW}Uma página do navegador será aberta para login...${NC}"
railway login

# Criar projeto
echo -e "${BLUE}[3/8]${NC} Criando projeto Railway..."
railway init --name teacherflow-prod

# Criar serviços
echo -e "${BLUE}[4/8]${NC} Adicionando PostgreSQL..."
railway add --database postgresql

# Deploy backend
echo -e "${BLUE}[5/8]${NC} Fazendo deploy do backend..."
cd backend
railway up --service backend --detach
cd ..
echo -e "${GREEN}✓${NC} Backend em deploy"

# Configurar variáveis backend
echo -e "${BLUE}[6/8]${NC} Configurando variáveis de ambiente (backend)..."

# Gerar SECRET_KEY seguro
SECRET_KEY=$(openssl rand -hex 32)

railway variables set \
  --service backend \
  DATABASE_URL='${{Postgres.DATABASE_URL}}' \
  SECRET_KEY="$SECRET_KEY" \
  ALGORITHM="HS256" \
  ACCESS_TOKEN_EXPIRE_MINUTES="30" \
  REFRESH_TOKEN_EXPIRE_DAYS="7" \
  DEBUG="false" \
  API_V1_STR="/api/v1" \
  ENVIRONMENT="production"

echo -e "${GREEN}✓${NC} Variáveis do backend configuradas"

# Aguardar backend ficar disponível
echo -e "${GREEN}Aguardando backend ficar disponível (30s)...${NC}"
sleep 30

# Obter URL do backend
echo -e "Obtendo URL do backend..."
BACKEND_URL=$(railway status --service backend --json 2>/dev/null | jq -r '.url' || echo "")

if [ -z "$BACKEND_URL" ]; then
  echo -e "${YELLOW}⚠️  Não foi possível obter URL automaticamente.${NC}"
  read -p "Cole a URL do backend do Railway Dashboard: " BACKEND_URL
fi

echo -e "${GREEN}✓ Backend URL: $BACKEND_URL${NC}"

# Deploy frontend
echo -e "${BLUE}[7/8]${NC} Fazendo deploy do frontend..."
cd frontend
railway up --service frontend --detach
cd ..
echo -e "${GREEN}✓${NC} Frontend em deploy"

# Configurar variáveis frontend
echo -e "${BLUE}[8/8]${NC} Configurando variáveis de ambiente (frontend)..."
railway variables set \
  --service frontend \
  VITE_API_URL="${BACKEND_URL}/api/v1" \
  VITE_ENVIRONMENT="production"

echo -e "${GREEN}✓${NC} Variáveis do frontend configuradas"

# Aguardar deploy
echo -e "Aguardando deploy do frontend (20s)..."
sleep 20

# Obter URL do frontend
FRONTEND_URL=$(railway status --service frontend --json 2>/dev/null | jq -r '.url' || echo "")

# Atualizar CORS no backend
if [ -n "$FRONTEND_URL" ]; then
  echo -e "${BLUE}Atualizando CORS origins...${NC}"
  railway variables set \
    --service backend \
    CORS_ORIGINS="$FRONTEND_URL,http://localhost:5173,http://localhost:3000"
  echo -e "${GREEN}✓ CORS atualizado${NC}"
fi

# Finalizar
echo -e "${GREEN}
╔════════════════════════════════════════╗
║     ✅ Migração Concluída!            ║
╚════════════════════════════════════════╝${NC}

📊 Resumo:
  🗄️  Database:  PostgreSQL (Railway)
  🔌 Backend:   $BACKEND_URL
  🌐 Frontend:  ${FRONTEND_URL:-"Verificar no dashboard"}

🎯 Próximos passos:
  1. Abrir dashboard: railway dashboard
  2. Verificar logs: railway logs --service backend
  3. Testar aplicação

💡 Comandos úteis:
  railway logs --service backend    # Ver logs backend
  railway logs --service frontend   # Ver logs frontend
  railway vars --service backend    # Ver variáveis
  railway dashboard                 # Abrir dashboard

💰 Custo estimado: \$5-20/mês
"
