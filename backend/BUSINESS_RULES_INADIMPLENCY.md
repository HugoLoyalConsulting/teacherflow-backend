# 🎯 Regras de Negócio - Inadimplência e Alunos Pausados

**Implementado em:** 3 de Março de 2026  
**Status:** ✅ **Pronto para Usar**

---

## 📋 Regras Implementadas

### 1. ⏰ Cálculo de Inadimplência

Um aluno é considerado **inadimplente** quando:
- ✅ Não pagou nenhum pagamento há **30+ dias** → Status "Inadimplente"
- ✅ Não pagou nenhum pagamento há **60+ dias (2 meses)** → Status **"Pausado"**

```python
# Cálculo automático
days_without_payment = (hoje - último_pagamento).days

if days_without_payment >= 60:
    status = "PAUSADO"
elif days_without_payment >= 30:
    status = "INADIMPLENTE"
else:
    status = "EM DIA"
```

### 2. 🚫 Alunos Pausados Não Podem Agendar Aulas

Quando um aluno fica **pausado**:
- ✅ Campo `is_paused = True`
- ✅ `payment_status = "paused"`
- ✅ `paused_at = data/hora do pause`
- ✅ **Não pode agendar aulas** (erro 403 ao tentar criar aula com aluno pausado)

**Mensagem de erro:**
```
"Não é possível agendar aula com alunos pausados: [nome do aluno]. 
Solicite pagamento dos atrasados primeiro."
```

### 3. ✅ Retorno ao Status Normal

Um aluno **automaticamente volta ao status "ativo"** quando:
- ✅ Paga algum dos pagamentos vencidos
- ✅ Campo `is_paused = False`
- ✅ `payment_status = "active"`
- ✅ Pode agendar aulas novamente

```python
# Fluxo automático
pagamento.status = "PAID"
→ sistema detecta
→ update_student_payment_status(student_id)
→ is_paused = False
→ Aluno volta a poder agendar
```

---

## 📊 Dados de Seed (Realistas)

### Criado com:
- ✅ **20 alunos** distribuídos em 4 turmas
- ✅ **4 turmas** com preços de 70-100 R$/hora
  - Turma 1: Iniciantes (R$70/hora)
  - Turma 2: Intermediário (R$80/hora)
  - Turma 3: Avançado (R$90/hora)
  - Turma 4: Especializado (R$100/hora)
- ✅ **2 locais** diferentes
- ✅ **Pagamentos realistas:**
  - Maioria dos alunos em dia
  - 3 alunos pausados (2+ meses sem pagar)
  - Alguns alunos inadimplentes (30-60 dias)
  - Total pendências: ~R$ 2.000-3.000 (realista, não R$ 77.960)

---

## 🚀 Como Usar

### 1. Criar Seed Realista

```bash
cd teacherflow-backend

# Rodar o seed
python -m app.seeds.seed_realistic

# Output:
# ✅ SEED CRIADO COM SUCESSO!
# ✓ Professor: Prof. João Silva
# ✓ Turmas: 4 (Iniciantes R$70, Intermediário R$80, Avançado R$90, Especializado R$100)
# ✓ Alunos: 20 (5 por turma)
# ✓ Locais: 2
#
# 📊 ESTATÍSTICAS:
#   • Alunos Pausados: 3
#   • Alunos Inadimplentes: 5
```

### 2. Consultar Status de Pagamentos

#### 2a. Resumo Geral de Pagamentos
```bash
GET /api/dashboard/payment-summary
```

Response:
```json
{
  "total_students": 20,
  "students_in_good_standing": 15,
  "students_inadimplent": 5,
  "students_paused": 3,
  "total_overdue_amount": 2400.00,
  "total_pending_amount": 1200.00,
  "total_outstanding": 3600.00
}
```

#### 2b. Alunos Pausados (bloqueados)
```bash
GET /api/dashboard/paused-students
```

Response:
```json
{
  "total_paused": 3,
  "students": [
    {
      "student_id": "uuid-1",
      "student_name": "Ana Silva",
      "is_paused": true,
      "days_without_payment": 75,
      "last_payment_date": "2025-12-10",
      "total_overdue": 800.00,
      "overdue_payment_count": 3,
      "paused_since": "2026-01-15T10:30:00",
      "status_text": "Pausado (75 dias sem pagar)",
      "payment_status": "paused"
    }
  ]
}
```

#### 2c. Alunos Inadimplentes (30+ dias)
```bash
GET /api/dashboard/inadimplent-students
```

Response:
```json
{
  "total_inadimplent": 5,
  "students": [
    {
      "student_id": "uuid-2",
      "student_name": "Bruno Costa",
      "is_paused": false,
      "days_without_payment": 45,
      "total_overdue": 400.00,
      "status_text": "Inadimplente (45 dias)",
      "payment_status": "active"
    }
  ]
}
```

#### 2d. Status de Aluno Específico
```bash
GET /api/dashboard/payment-status/{student_id}
```

Response:
```json
{
  "student_id": "uuid-3",
  "student_name": "Carlos Santos",
  "is_paused": false,
  "days_without_payment": 22,
  "last_payment_date": "2026-01-10",
  "total_overdue": 0.00,
  "overdue_payment_count": 0,
  "paused_since": null,
  "status_text": "Em Dia",
  "payment_status": "active"
}
```

### 3. Tentar Agendar Aula (Com Validação)

#### ✅ Sucesso - Aluno em dia
```bash
POST /api/lessons
{
  "schedule_id": "schedule-1",
  "lesson_date": "2026-03-10",
  "start_time": "18:00",
  "end_time": "19:00"
}

# Retorna: 201 CREATED
```

#### ❌ Erro - Aluno pausado
```bash
POST /api/lessons
{
  "schedule_id": "schedule-2",  # Turma com aluno pausado
  "lesson_date": "2026-03-10",
  "start_time": "18:00",
  "end_time": "19:00"
}

# Retorna: 403 FORBIDDEN
# {
#   "detail": "Não é possível agendar aula com alunos pausados: Ana Silva. 
#             Solicite pagamento dos atrasados primeiro."
# }
```

---

## 🔄 Fluxo De Um Aluno Pausado Voltando

### Dia 1: Aluno Fica Pausado
```
1. Aluno está com 75 dias sem pagar
2. Sistema detecta e marca: is_paused = True
3. Professor tenta agendar aula → ERRO 403
4. Professor vê no dashboard: "Ana Silva: Pausada (75 dias)"
```

### Dia 2: Professor Cobra o Aluno
```
1. Professor contacta Ana Silva
2. Ana concorda em pagar os atrasados
3. Aluno faz um pagamento de R$ 800 (atrasados)
```

### Dia 3: Aluno Volta ao Normal
```
1. Sistema processa pagamento → status = PAID
2. update_student_payment_status() roda automaticamente
3. Sistema detecta: "Agora tem 1 dia desde último pagamento"
4. is_paused = False
5. payment_status = "active"
6. Professor consegue agendar aulas novamente
```

---

## 📝 Campos Novos em Student

```python
class Student(Base):
    # Novos campos adicionados:
    is_paused: Boolean           # True se pausado
    paused_at: DateTime          # Quando ficou pausado
    inadimplency_start_date: DateTime    # Quando começou a inadimplência
    last_payment_date: Date      # Data último pagamento recebido
    days_without_payment: Integer # Dias desde último pagamento
    payment_status: String       # "pending", "active", "inactive", "paused"
```

---

## 🛠️ Serviços Disponíveis

### `app/services/payment_status.py`

#### Funções:
```python
# Calcular dias sem pagar
days = calculate_days_without_payment(student_id, db)

# Verificar se está inadimplente (60+ dias)
is_inadimplent = is_student_inadimplent(student_id, db)

# Atualizar status automaticamente
update_student_payment_status(student_id, db)

# Obter resumo completo
summary = get_student_payment_summary(student_id, db)

# Listar todos inadimplentes
all_inad = get_all_inadimplent_students(teacher_id, db)

# Listar todos pausados
paused = get_paused_students(teacher_id, db)
```

---

## 📊 Dashboard Endpoints

```
GET  /api/dashboard/payment-summary          → Resumo geral
GET  /api/dashboard/paused-students          → Alunos pausados
GET  /api/dashboard/inadimplent-students    → Alunos inadimplentes
GET  /api/dashboard/payment-status/{id}     → Status de um aluno
```

---

## ✨ Casos de Uso

### 1. Professor vendo inadimplentes
```
Dashboard mostra:
- Felipe: Pausado (70 dias)
- Mariana: Inadimplente (45 dias)
- João: Em dia (5 dias)

Professor sabe exatamente quem cobrar!
```

### 2. Evitar agenda com pausados
```
Professor clica "Agendar aula para Felipe"
↓
Sistema bloqueia: "Felipe está pausado"
↓
Professor marca para depois dele pagar
```

### 3. Reativar aluno automaticamente
```
Felipe paga os R$ 1.200 atrasados
↓
Sistema processa pagamento (PAID)
↓
Sistema recalcula: "Felipe agora está em dia!"
↓
Felipe pode agendar aulas novamente
↓
Automático, sem ação manual!
```

---

## 🧪 Testar Localmente

```bash
# 1. Limpar seed antigo
rm database.db 2>/dev/null || true

# 2. Criar new seed realista
python -m app.seeds.seed_realistic

# 3. Rodar backend
python main.py

# 4. Acessar documentação
# http://localhost:8000/api/docs

# 5. Testar endpoints em Swagger:
# GET /api/dashboard/payment-summary
# GET /api/dashboard/paused-students
# GET /api/dashboard/inadimplent-students
# GET /api/dashboard/payment-status/{id}
```

---

## 📈 Métricas Esperadas Após Seed

```
Total: 20 alunos
├─ Em dia: ~15 (75%)
├─ Inadimplentes 30-59d: ~2 (10%)
└─ Pausados 60+d: ~3 (15%)

Valores:
├─ Total de aulas/mês: ~80 (4 turmas × ~20 aulas)
├─ Receita esperada/mês: ~6.000-7.000 R$
├─ Atrasados: ~2.000-3.000 R$
└─ Taxas atraso: ~25-35% da receita
```

---

## ✅ Checklist

- [x] Modelo Student atualizado com campos de inadimplência
- [x] Serviço de payment_status criado
- [x] Lógica de "Pausado" implementada
- [x] Validação de aulas com pausados
- [x] Seed realista criado (20 alunos, 4 turmas)
- [x] Dashboard endpoints criados
- [x] Documentação completa

---

## 🎉 Resultado

Você agora tem:
1. ✅ **Dados realistas** (não mais R$ 77.960 em atraso!)
2. ✅ **Regra de "Pausado"** automática (60+ dias)
3. ✅ **Proteção** contra agendar com pausados
4. ✅ **Dashboard** para monitorar inadimplência
5. ✅ **Reativação automática** quando paga
6. ✅ **Números viáveis** (R$ 2-3K em atraso no máximo)

**Status:** 🟢 Pronto para usar em produção!

---

*Implementação: 3 de Março de 2026*
