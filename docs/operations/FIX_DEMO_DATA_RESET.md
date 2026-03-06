# 🔄 FIX: Reset Demo Data - Guia Rápido

**Problema**: Demo em produção mostra dados não realistas (62 pagamentos vencidos, R$ 77.960,00)

**Solução**: Implementado sistema automático + endpoint manual para reset

---

## ✅ O QUE FOI IMPLEMENTADO

### 1. **Auto-Detection de Dados Ruins** ✅
O sistema agora detecta automaticamente dados não realistas ao iniciar:
- Se houver > 10 pagamentos vencidos (> 30 dias), faz reset automático
- Roda no próximo deploy ou restart do Render

**Arquivo**: [autoseed.py](../../backend/create_demo_data.py)

### 2. **Endpoint Administrativo para Reset Manual** ✅
Novo endpoint para forçar reset imediatamente:

```
POST /api/v1/admin/reset-demo-data
```

**Arquivo**: [admin.py](../../backend/app/routers/admin.py)

### 3. **Endpoint para Verificar Status** ✅
Verificar se dados precisam de reset:

```
GET /api/v1/admin/demo-status
```

---

## 🚀 COMO USAR (Método Rápido)

### Opção 1: Forçar Reset Imediatamente (Recomendado)

```bash
# 1. Fazer login e obter token
curl -X POST https://teacherflow-backend.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "professor@teacherflow.com",
    "password": "password123"
  }' | jq -r '.access_token'

# Copie o token e use abaixo

# 2. Verificar status atual (opcional)
curl -X GET https://teacherflow-backend.onrender.com/api/v1/admin/demo-status \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

# 3. Fazer reset dos dados
curl -X POST https://teacherflow-backend.onrender.com/api/v1/admin/reset-demo-data \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json"
```

**Resultado esperado**:
```json
{
  "success": true,
  "message": "Demo data reset successfully with realistic distribution",
  "details": {
    "students": 20,
    "groups": 4,
    "distribution": {
      "paid": "70% (14 students)",
      "pending": "20% (4 students)",
      "overdue": "8% (1-2 students)",
      "paused": "2% (1 student)"
    },
    "pricing": {
      "iniciantes": "R$ 50/hour",
      "intermediario": "R$ 60/hour",
      "avancado": "R$ 70/hour",
      "especializado": "R$ 80/hour"
    }
  }
}
```

### Opção 2: Aguardar Reset Automático (no próximo deploy)

Basta fazer commit e push. O sistema detectará automaticamente no startup:

```bash
git add .
git commit -m "fix: auto-detect and reset unrealistic demo data"
git push origin main
```

O Render vai:
1. Detectar > 10 pagamentos vencidos
2. Automaticamente fazer reset com dados realistas
3. Aplicação fica pronta em ~2 minutos

---

## 📊 DADOS REALISTAS (Após Reset)

### Distribuição de Alunos
- **Total**: 20 alunos em 4 turmas
- **70% Pagos** (14 alunos): Status "paid", sem débitos
- **20% Pendentes** (4 alunos): Pagamento atual pendente (< 30 dias)
- **8% Atrasados** (1-2 alunos): Vencido há 15-25 dias
- **2% Pausados** (1 aluno): > 60 dias sem pagar, status "paused"

### Turmas e Preços
| Turma | Preço/hora | Pagamento Mensal (4 aulas) |
|-------|------------|---------------------------|
| Iniciantes | R$ 50 | R$ 200 |
| Intermediário | R$ 60 | R$ 240 |
| Avançado | R$ 70 | R$ 280 |
| Especializado | R$ 80 | R$ 320 |

### Métricas Esperadas no Dashboard
- **Total Pendente**: ~R$ 960 (4 alunos com R$ 200-320 cada)
- **Alunos Pausados**: 1 aluno
- **Inadimplência**: 5-10% (realista para educação)

---

## 🔍 VERIFICAÇÃO

### 1. Verificar via API
```bash
# Check dashboard statistics
curl https://teacherflow-backend.onrender.com/api/v1/dashboard/statistics \
  -H "Authorization: Bearer SEU_TOKEN"

# Check demo status
curl https://teacherflow-backend.onrender.com/api/v1/admin/demo-status \
  -H "Authorization: Bearer SEU_TOKEN"
```

### 2. Verificar via Frontend
1. Acesse: https://teacherflow-app.vercel.app/
2. Login: `professor@teacherflow.com` / `password123`
3. Dashboard deve mostrar:
   - **Alunos Ativos**: ~19
   - **Alunos Pausados**: ~1
   - **Pendente**: ~R$ 960 (não mais R$ 77.960!)

---

## ⚠️ IMPORTANTE

### Permissões Necessárias
- Endpoint `/admin/reset-demo-data` requer:
  - Usuário autenticado
  - Campo `is_admin = true` no banco de dados

### Tornar Usuário Admin (se necessário)
```sql
-- Conecte no Neon dashboard → SQL Editor
UPDATE users 
SET is_admin = true 
WHERE email = 'professor@teacherflow.com';
```

### Pode Usar Quantas Vezes Quiser
- Não há limite de uso
- Processo é idempotente (pode rodar múltiplas vezes)
- Sempre cria dados limpos e realistas

---

## 🎯 RESUMO DO FIX

| Item | Status | Detalhes |
|------|--------|----------|
| Auto-detecção | ✅ | Detecta > 10 pagamentos vencidos |
| Reset automático | ✅ | Roda no próximo deploy/restart |
| Endpoint manual | ✅ | `/api/v1/admin/reset-demo-data` |
| Endpoint status | ✅ | `/api/v1/admin/demo-status` |
| Dados realistas | ✅ | 70/20/8/2 distribuição |

---

## 📞 TROUBLESHOOTING

### "403 Forbidden - Not admin"
**Solução**: Tornar usuário admin no banco (SQL acima)

### "401 Unauthorized"
**Solução**: Fazer login novamente, token pode ter expirado

### "500 Internal Server Error"
**Solução**: Verificar logs do Render, pode ser problema de conexão com banco

### Dados ainda aparecem errados após reset
**Solução**: 
1. Limpar cache do navegador (Ctrl + Shift + R)
2. Fazer logout e login novamente
3. Verificar se API retorna dados corretos via curl

---

## 🚀 AÇÃO RECOMENDADA AGORA

**Método Mais Rápido** (2 minutos):

```bash
# 1. Commit e push (trigger auto-reset no Render)
cd teacherflow
git add .
git commit -m "fix: auto-reset unrealistic demo data on startup"
git push origin main

# 2. Aguardar deploy do Render (~2 min)
# 3. Verificar: https://teacherflow-app.vercel.app/
```

Ou use o endpoint manual se quiser reset imediato sem deploy.

---

**Implementado em**: March 6, 2026  
**Arquivos modificados**: 3  
**Endpoints novos**: 2  
**Tempo de fix**: ~5 minutos
