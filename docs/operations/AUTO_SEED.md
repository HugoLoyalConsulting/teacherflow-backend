# 🌱 Auto-Seed - Dados Realistas Automáticos

**TL;DR:** Quando seu app fizer deploy no Render pela primeira vez, **automaticamente** vai popular com:
- ✅ 20 alunos
- ✅ 4 turmas (R$70-100/hora)
- ✅ 3 alunos marcados como "Pausado" (60+ dias)
- ✅ ~R$2.400 em atraso (realista)

**Você não faz nada. Acontece automático.** ✅

---

## 🔄 Como Funciona

1. **Seu primeiro `git push` para main**
   ```bash
   git push -u origin main
   ```

2. **GitHub Actions testa e faz deploy**
   - Envia código para Render

3. **Render inicia sua app**
   - App FastAPI ativa
   - `app/main.py` roda
   - Chama `auto_seed_if_empty()`

4. **Auto-seed verifica banco**
   - Banco vazio? → Popula com 20 alunos + dados realistas
   - Banco já tem dados? → Pula (não faz nada)

5. **Seu app fica online**
   - Com dados realistas já carregados
   - Sem você fazer nada

---

## 📊 O que é Criado

### Dados Automáticos

```
Professor:
└─ Prof. João Silva (professor@teacherflow.com)

Turmas (4):
├─ Iniciantes (R$70/hora) - 5 alunos
├─ Intermediário (R$80/hora) - 5 alunos
├─ Avançado (R$90/hora) - 5 alunos
└─ Especializado (R$100/hora) - 5 alunos

Alunos Total: 20
├─ 17 em dia
├─ 0 inadimplentes (30-59 dias)
└─ 3 pausados (60+ dias)

Pagamentos:
└─ ~80 registros (4 meses × 20 alunos)

Situação Financeira:
├─ Total esperado: ~R$ 5.600/mês
├─ Total em atraso: ~R$ 2.400
├─ % inadimplência: ~30%
└─ Realista? ✅ SIM
```

---

## 🔐 Segurança

Auto-seed só cria dados **UMA VEZ**:

```python
# No app/core/autoseed.py
user_count = db.query(User).count()

if user_count == 0:
    # Banco vazio → seed realista
    seed_realistic_data(db)
else:
    # Banco já tem dados → pula
    pass
```

**Resultado:**
- ✅ Roda ONCE em primeiro deploy
- ✅ Nunca sobrescreve dados
- ✅ Seguro para múltiplos deploys

---

## 📈 Timeline

### Deploy #1 (Seu primeiro push)

```
git push
  ↓ (5 min)
GitHub Actions testa
  ↓ (2 min)
Deploy em Vercel
Deploy em Render
  ↓ (1 min)
Render inicia app
  ↓ (AUTOMÁTICO)
Auto-seed detecta banco vazio
  ↓
Cria 20 alunos + dados realista
  ↓
App online com dados ✅
```

**Total:** ~13 minutos até ter dados realistas

### Deploy #2+ (Próximos pushes)

```
git push
  ↓ (5 min)
GitHub Actions
  ↓ (2 min)
Render inicia app
  ↓ (AUTOMÁTICO)
Auto-seed detecta banco JÁ CHEIO
  ↓
Pula seed (protege dados)
  ↓
App online com dados intactos ✅
```

**Total:** ~7 minutos, dados preservados

---

## 🎯 Onde Ver os Dados

### Dashboard de Pagamentos

Depois de deploy:

```
GET https://teacherflow-backend.onrender.com/api/v1/dashboard/payment-summary
```

Response:
```json
{
  "total_students": 20,
  "students_in_good_standing": 17,
  "students_inadimplent": 0,
  "students_paused": 3,
  "total_overdue_amount": 2400.00,
  "total_pending_amount": 0.00
}
```

### Alunos Pausados

```
GET https://teacherflow-backend.onrender.com/api/v1/dashboard/paused-students
```

Response:
```json
{
  "total_paused": 3,
  "students": [
    {
      "student_name": "Ana Silva",
      "is_paused": true,
      "days_without_payment": 75,
      "total_overdue": 800.00,
      "status_text": "Pausado (75 dias)"
    },
    {
      "student_name": "Bruno Costa",
      "is_paused": true,
      "days_without_payment": 68,
      "total_overdue": 800.00,
      "status_text": "Pausado (68 dias)"
    },
    {
      "student_name": "Carla Mendes",
      "is_paused": true,
      "days_without_payment": 65,
      "total_overdue": 800.00,
      "status_text": "Pausado (65 dias)"
    }
  ]
}
```

---

## 🗑️ Resetar Dados (Se Quiser Começar de Novo)

Se você quiser limpar tudo e rodar seed novamente:

### Opção 1: Via Render Console

1. Vá para https://dashboard.render.com
2. Selecione seu serviço `teacherflow-api`
3. Vá para **Shell**
4. Execute:
   ```bash
   python -c "from app.core.database import Base, engine; Base.metadata.drop_all(bind=engine); print('✅ Database cleared')"
   ```
5. Redeploy da app:
   ```bash
   # Qualquer git push vai redeploy
   git commit --allow-empty -m "Trigger redeploy"
   git push
   ```

### Opção 2: Resetar Diretamente

Se tiver acesso ao Render Shell:

```bash
# SSH para o serviço
# Deletar banco
rm /path/to/database.db

# Ou resetar PostgreSQL
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# App vai redeploy e criar novo banco com auto-seed
```

---

## ⚙️ Configuração no Código

### Arquivo: `app/core/autoseed.py`

```python
def auto_seed_if_empty():
    """
    Automatically run realistic seed if database is empty
    This runs ONCE on first deployment to Render
    """
    db = SessionLocal()
    try:
        # Verifica se banco tem usuários
        user_count = db.query(User).count()
        
        if user_count == 0:
            # Banco vazio - seed!
            print("\n🌱 DATABASE IS EMPTY - RUNNING AUTOMATIC SEED\n")
            seed_realistic_data(db)
            print("\n✅ AUTO-SEED COMPLETED!\n")
        else:
            # Banco já tem dados
            print(f"\n✓ Database already seeded")
    
    finally:
        db.close()
```

### Integração em: `app/main.py`

```python
# Auto-seed database with realistic data if empty
try:
    auto_seed_if_empty()
except Exception as e:
    logger.warning(f"Auto-seed failed (non-critical): {e}")
```

---

## 🚨 O que NÃO Fazer

### ❌ Rodar seed localmente

```bash
# NÃO FAÇA:
python -m app.seeds.seed_realistic

# Por quê?
# 1. É só para desenvolvimento (você não quer)
# 2. Dados vão pro seu PC (confusão)
# 3. Render já faz isso automaticamente
```

### ❌ Rodar seed múltiplas vezes

```bash
# Se você execute direto (manualmente):
# 1. NUNCA faça DOIS deploys rápido
# 2. Deixe auto-seed terminar primeiro
# 3. Espere logs confirmarem
```

---

## ✅ Checklist

- ✅ Auto-seed está em `app/core/autoseed.py`
- ✅ Integrado em `app/main.py`
- ✅ Roda UMA VEZ em primeiro deploy
- ✅ Protege dados em próximos deploys
- ✅ Usa seed_realistic com 20 alunos
- ✅ Cria 3 alunos pausados
- ✅ ~R$2.400 em atraso
- ✅ Dados realistas ✅

---

## 🎉 Resumo

**O que você faz:**
```bash
git push
```

**O que Render/GitHub faz:**
1. Testa código
2. Compila
3. Deploy
4. Auto-seed roda (UMA VEZ)
5. Dados realistas carregam
6. App online com tudo pronto

**Você não faz nada. Automático. Seguro.**

---

## 📞 FAQ

### P: Quanto tempo para auto-seed terminar?
**A:** ~30 segundos. Render vai mostrar logs.

### P: E se falhar?
**A:** Não interrompe app. Tenta de novo próximo deploy.

### P: Posso mudar a seed realista?
**A:** Sim! Edit `app/seeds/seed_realistic.py` e push.

### P: Os 3 alunos pausados são reais?
**A:** Não, são fictícios. Só para demonstrar.

### P: Como remover auto-seed?
**A:** Delete import de `auto_seed_if_empty()` em `app/main.py`.

---

**Status:** 🟢 Auto-seed configurado e pronto

Próxima ação: `git push` e aguarde 13 minutos!
