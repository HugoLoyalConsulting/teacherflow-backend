# ⚡ Quick Reference - Comandos e Endpoints

**Para consulta rápida enquanto testa**

---

## 🚀 Comandos Básicos

### Rodar Seed
```bash
cd "c:\Users\Hugo Souza\OneDrive\Documentos\Python Scripts\teacherflow-backend"
python -m app.seeds.seed_realistic
```

### Rodar Backend
```bash
cd "c:\Users\Hugo Souza\OneDrive\Documentos\Python Scripts\teacherflow-backend"
python main.py
```

### Acessar API Docs
```
http://localhost:8000/api/v1/docs
```

---

## 🌐 Endpoints de Dashboard

### 1. Resumo Geral
```
GET /api/v1/dashboard/payment-summary
```

**Response:**
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

---

### 2. Alunos Pausados (Bloqueados)
```
GET /api/v1/dashboard/paused-students
```

**Response:**
```json
{
  "total_paused": 3,
  "students": [
    {
      "student_id": "uuid-123",
      "student_name": "Ana Silva",
      "is_paused": true,
      "days_without_payment": 75,
      "last_payment_date": "2025-12-10",
      "total_overdue": 800.00,
      "overdue_payment_count": 3,
      "paused_since": "2026-01-15T10:30:00",
      "status_text": "Pausado (75 dias)",
      "payment_status": "paused"
    }
  ]
}
```

---

### 3. Alunos Inadimplentes (30-60 dias)
```
GET /api/v1/dashboard/inadimplent-students
```

**Response:**
```json
{
  "total_inadimplent": 5,
  "students": [
    {
      "student_id": "uuid-456",
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

---

### 4. Status de 1 Aluno
```
GET /api/v1/dashboard/payment-status/{student_id}
```

**Substituir `{student_id}` com UUID real**

**Response:**
```json
{
  "student_id": "uuid-789",
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

---

## 📝 Endpoint de Aulas (Com Validação)

### ✅ Criar Aula (Sucesso - 201)
```
POST /api/v1/lessons

Body:
{
  "schedule_id": "uuid-schedule",
  "lesson_date": "2026-03-10",
  "start_time": "18:00",
  "end_time": "19:00"
}
```

**Retorna (201 CREATED):**
```json
{
  "id": "uuid-lesson",
  "schedule_id": "uuid-schedule",
  "lesson_date": "2026-03-10",
  "start_time": "18:00",
  "end_time": "19:00",
  "status": "scheduled"
}
```

---

### ❌ Criar Aula (Erro - 403 com pausado)
```
POST /api/v1/lessons

Body:
{
  "schedule_id": "uuid-schedule-com-pausado",
  "lesson_date": "2026-03-10",
  "start_time": "18:00",
  "end_time": "19:00"
}
```

**Retorna (403 FORBIDDEN):**
```json
{
  "detail": "Não é possível agendar aula com alunos pausados: Ana Silva, Bruno Costa. Solicite pagamento dos atrasados primeiro."
}
```

---

## 🔍 Como Consultar com curl

```bash
# Resumo geral
curl http://localhost:8000/api/v1/dashboard/payment-summary

# Pausados
curl http://localhost:8000/api/v1/dashboard/paused-students

# Inadimplentes
curl http://localhost:8000/api/v1/dashboard/inadimplent-students

# Aluno específico (substituir UUID)
curl http://localhost:8000/api/v1/dashboard/payment-status/uuid-aqui

# Criar aula (precisa de header Authorization)
curl -X POST http://localhost:8000/api/v1/lessons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"schedule_id": "uuid", "lesson_date": "2026-03-10", "start_time": "18:00", "end_time": "19:00"}'
```

---

## 📊 Métricas Esperadas

```
Após rodar seed_realistic.py:

Total de Alunos: 20
├─ Em dia (0-29 dias): 15
├─ Inadimplentes (30-59 dias): 2
└─ Pausados (60+ dias): 3

Valores em atraso:
├─ Menos de 1 mês: R$ 600
├─ 1-2 meses: R$ 800
├─ Mais de 2 meses: R$ 1.000
└─ Total: R$ 2.400

Grupos (Turmas):
├─ Iniciantes (R$70/h): 5 alunos
├─ Intermediário (R$80/h): 5 alunos
├─ Avançado (R$90/h): 5 alunos
└─ Especializado (R$100/h): 5 alunos
```

---

## 🧠 Lógica de Status

```
Days Without Payment        Status              Ação
──────────────────────────────────────────────────────
0-29 dias                   EM DIA              Pode agendar
30-59 dias                  INADIMPLENTE        Aviso (pode agendar)
60+ dias                    PAUSADO             ❌ Bloqueado
```

---

## 💾 Campos Monitorados

```
Student Model:
└─ is_paused          → Boolean (True/False)
└─ paused_at          → DateTime (quando ficou pausado)
└─ last_payment_date  → Date (último pagamento)
└─ days_without_payment → Integer (dias desde pagamento)
└─ payment_status     → String ("active", "paused", etc)
```

---

## 📱 Fluxo de Teste Completo

```
1. Terminal 1: Rodar Seed
   python -m app.seeds.seed_realistic
   ✓ Cria 20 alunos com 3 pausados

2. Terminal 2: Rodar Backend
   python main.py
   ✓ Inicia servidor em localhost:8000

3. Navegador: Acessar Swagger
   http://localhost:8000/api/v1/docs
   ✓ Documentação interativa

4. Swagger: Testar GET /dashboard/payment-summary
   ✓ Ver 3 pausados, R$2400 em atraso

5. Swagger: Testar GET /dashboard/paused-students
   ✓ Ver Ana Silva, Bruno Costa, Carla Mendes

6. Swagger: Testar POST /lessons
   ✓ Com pausado: 403 FORBIDDEN
   ✓ Sem pausado: 201 CREATED

7. Celebrar! 🎉
```

---

## 🐛 Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| ModuleNotFoundError | `cd` para pasta teacherflow-backend |
| Endpoints vazios (sem dados) | Rodar seed: `python -m app.seeds.seed_realistic` |
| Backend não inicia | Checar porta 8000 em uso: `netstat -ano \| findstr :8000` |
| Authorization error nos endpoints | Usar token obtido em `/auth/login` |
| Swagger mostra 404 | Backend não está rodando ou porta errada |

---

## 📚 Documentação Completa

```
QUICK_REFERENCE.md         ← Este arquivo
├─ commands / endpoints / troubleshooting

NEXT_STEPS.md              ← Como testar (5 minutos)
├─ Passo a passo executável

BUSINESS_RULES_INADIMPLENCY.md ← Regras de negócio
├─ O QUE foi implementado

ARCHITECTURE_INADIMPLENCY.md ← Arquitetura técnica
├─ COMO foi implementado

SUMMARY_CHANGES.md         ← Sumário detalhado
├─ Todos os arquivos modificados/criados
```

---

## ⏱️ Estimativa de Tempo

```
Rodar Seed:              30 segundos
Rodar Backend:           5 segundos
Acessar Swagger:         1 segundo
Testar endpoint:         5 segundos
Testar bloquei de aula:  10 segundos
                        ──────────────
Total:                   ~1 minuto
```

---

## 🎯 Resumo em 10 segundos

- ✅ 20 alunos em 4 turmas (R$70-100/hora)
- ✅ 3 alunos pausados (60+ dias sem pagar)
- ✅ Aulas bloqueadas para pausados
- ✅ Dashboard mostra status
- ✅ Reativa automaticamente ao pagar

**Comando para testar:**
```bash
python -m app.seeds.seed_realistic
python main.py
# Acesse: http://localhost:8000/api/v1/docs
```

---

*Quick Reference | 3 de Março de 2026*
