# 🔄 COMO RESETAR O BANCO NO RENDER

## ⚠️ Problema Identificado

O Render ainda tem dados antigos com valores absurdos:
- **Valores antigos**: R$70-100/hora → R$280-400/mês
- **Resultado**: 62 pagamentos vencidos = R$77.960,00 ❌

## ✅ Solução Aplicada (Código Corrigido)

**Commit**: `a20001d` - "fix: corrigir valores absurdos"
- ✓ Campo `hourly_rate` adicionado
- ✓ Valores ajustados: R$50-80/hora → R$200-320/mês
- ✓ Seed corrigido

**Status**: ✅ Código enviado para GitHub e Main branch

---

## 🚀 PRÓXIMOS PASSOS (VOCÊ PRECISA FAZER)

### Opção 1: Reset via Dashboard Render (RECOMENDADO)

1. **Acesse o Render Dashboard**:
   ```
   https://dashboard.render.com/
   ```

2. **Vá para seu serviço**:
   - Clique em `teacherflow-backend`
   - Service ID: `srv-d6h09fhaae7s73bl4v6g`

3. **Force Redeploy COM RESET de Banco**:
   - Clique em **"Manual Deploy"** → **"Deploy latest commit"**
   - ⚠️ **IMPORTANTE**: O Render detectará o novo commit automaticamente
   - Aguarde ~2-3 minutos para o deploy completar

4. **Reset do Banco PostgreSQL (Neon)**:
   
   **Opção A - Via Neon Dashboard (RECOMENDADO)**:
   ```
   🔗 Link direto do seu projeto:
   https://console.neon.tech/app/projects/rapid-forest-55425359
   
   Passos:
   1. Clique no link acima (já vai abrir seu projeto!)
   2. No menu lateral esquerdo, clique em "SQL Editor"
   3. Cole e execute este comando:
      
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO neondb_owner;
   
   4. ✅ Pronto! O banco está limpo
   ```

   **Opção B - Via Script Python no Render**:
   ```bash
   # No Render Shell (disponível no dashboard):
   python -c "from app.core.database import Base, engine; from app.models import *; Base.metadata.drop_all(bind=engine); Base.metadata.create_all(bind=engine); print('Database resetado')"
   ```

5. **Reinicie o Service**:
   - Clique em **"Restart"**
   - O autoseed vai rodar automaticamente com valores corretos
   - Aguarde 1-2 minutos

---

### Opção 2: Reset via API (Mais Rápido)

Se você tiver acesso SSH ou conseguir executar um script:

```bash
# 1. Fazer login
curl -X POST https://teacherflow-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"professor@teacherflow.com","password":"password123"}' \
  | jq -r '.access_token'

# 2. Deletar TODOS os pagamentos (use o token acima)
curl -X DELETE https://teacherflow-backend.onrender.com/api/admin/reset-payments \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

**Nota**: Esse endpoint não existe ainda, portanto use a Opção 1.

---

### Opção 3: Reset Manual (Sem Acesso ao Dashboard)

Se você não tem acesso ao Render Dashboard, pode:

1. **Criar novo branch para forçar redeploy**:
   ```bash
   git checkout -b redeploy-fix
   git push origin redeploy-fix
   ```

2. **Configurar Render para usar novo branch**:
   - Vá para Settings → Branch → Mudar para `redeploy-fix`
   - Isso força um redeploy completo

---

## ✅ Como Verificar se Funcionou

Após o reset e redeploy:

```bash
# 1. Verificar valores das turmas
curl https://teacherflow-backend.onrender.com/api/groups/ \
  -H "Authorization: Bearer TOKEN"

# Deve retornar valores entre R$50-80/hora
```

```bash
# 2. Verificar dashboard de pagamentos
curl https://teacherflow-backend.onrender.com/api/dashboard/payment-summary \
  -H "Authorization: Bearer TOKEN"

# Deve mostrar valores razoáveis (não mais R$77.960!)
```

---

## 📊 Valores Esperados Após Reset

| Turma          | Por Hora  | Por Mês    | Alunos |
|----------------|-----------|------------|--------|
| Iniciantes     | R$ 50     | R$ 200     | 5      |
| Intermediário  | R$ 60     | R$ 240     | 5      |
| Avançado       | R$ 70     | R$ 280     | 5      |
| Especializado  | R$ 80     | R$ 320     | 5      |

**Total**: 20 alunos × ~4 pagamentos cada = 80 pagamentos
**Receita mensal**: ~R$ 5.000,00 (razoável!)

---

## 🆘 Se Ainda Ver Valores Absurdos

1. **Verifique se o commit foi deployado**:
   - Dashboard Render → Logs → Procure por "a20001d"
   - Deve aparecer "✓ Database already seeded" ou "AUTO-SEED COMPLETED"

2. **Force outro deploy**:
   - No Render Dashboard: "Manual Deploy" → "Clear build cache & deploy"

3. **Entre em contato comigo** se o problema persistir!

---

## 💡 Dica Final

O autoseed **só roda se o banco estiver vazio** (0 usuários). Se você fizer apenas o redeploy sem resetar o banco, os valores antigos vão permanecer.

**Solução definitiva**: Reset do banco (Opção 1) + Aguardar redeploy automático.

---

**Última atualização**: 03/03/2026 - Commit a20001d
