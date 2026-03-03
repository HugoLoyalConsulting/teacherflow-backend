# 🏗️ Arquitetura das Mudanças - Inadimplência

**Implementação:** 3 de Março de 2026  
**Versão:** 1.0

---

## 📊 Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                        CAMADAS DA APLICAÇÃO                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  🎯 API Layer (FastAPI Routers)                                   │
│  ├─ POST /lessons     ← Cria aula (validação de pausados)        │
│  ├─ GET /dashboard/*  ← Monitora pagamentos                      │
│  └─ (outros routers)                                             │
│                                                                   │
│  📦 Service Layer (Business Logic)                               │
│  ├─ payment_status.py ← Calcula dias, detecta pausados, etc     │
│  └─ (outros serviços)                                            │
│                                                                   │
│  💾 Data Layer (SQLAlchemy ORM)                                  │
│  ├─ models.py        ← Student, Payment, Schedule, etc          │
│  └─ database.py      ← Conexão PostgreSQL/SQLite                │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Dados - Quando um Aluno Fica Pausado

```
│
├─ 1️⃣ TRIGGER: 60+ dias sem pagamento
│
├─ 2️⃣ Cálculo (payment_status.py)
│    └─ calculate_days_without_payment(student_id)
│       └─ Retorna: 65 dias
│
├─ 3️⃣ Decisão
│    └─ is_student_inadimplent(student_id, threshold=60)
│       └─ Retorna: True (65 > 60)
│
├─ 4️⃣ Atualização
│    └─ update_student_payment_status(student_id)
│       ├─ is_paused = True
│       ├─ paused_at = 2026-03-03 10:30:00
│       ├─ payment_status = "paused"
│       └─ Salva em database
│
├─ 5️⃣ Validação na API
│    └─ POST /lessons
│       ├─ Verifica se estudante da turma tem is_paused=True
│       ├─ Se sim: retorna 403 FORBIDDEN
│       └─ Se não: cria aula normalmente
│
└─ 6️⃣ Dashboard mostra
    └─ GET /dashboard/paused-students
       └─ Mostra: Ana Silva (pausada 65 dias, R$ 800 pendente)
```

---

## 📁 Estrutura de Arquivos

### Pasta: `app/services/`

```
payment_status.py (121 linhas)
├─ Função 1: calculate_days_without_payment()
│  └─ Calcula quantos dias desde último pagamento PAID
│
├─ Função 2: is_student_inadimplent()
│  └─ Verifica se está inadimplente (30+ dias)
│  └─ Ou se está pausado (60+ dias)
│
├─ Função 3: update_student_payment_status()
│  └─ ⭐ CORE: Aplica a lógica de pausado/ativo
│  └─ Pode ser chamada a qualquer momento
│  └─ Sempre retorna estado correto
│
├─ Função 4: get_student_payment_summary()
│  └─ Retorna dict com tudo: dias, pausado, total atraso, etc
│
├─ Função 5: get_all_inadimplent_students()
│  └─ Lista todos os >30 dias
│
└─ Função 6: get_paused_students()
   └─ Lista todos os pausados (is_paused=True)
```

### Pasta: `app/routers/`

```
lessons.py (modificado)
├─ POST /lessons
│  ├─ Busca schedule
│  ├─ ⭐ VALIDAÇÃO: Verifica se algum estudante está pausado
│  ├─ Se sim: 403 FORBIDDEN com nome dos pausados
│  └─ Se não: 201 CREATED com a aula

dashboard.py (novo, 140 linhas)
├─ GET /dashboard/payment-summary
│  └─ Total alunos, quantos pausados, quanto em atraso
│
├─ GET /dashboard/paused-students
│  └─ Lista detalhada de alunos pausados (is_paused=True)
│
├─ GET /dashboard/inadimplent-students
│  └─ Lista alunos entre 30-60 dias
│
└─ GET /dashboard/payment-status/{id}
   └─ Detalhe completo de 1 aluno específico
```

### Pasta: `app/seeds/`

```
seed_realistic.py (novo, 280+ linhas)
├─ Cria: 1 Professor
├─ Cria: 4 Turmas (Iniciantes, Intermediário, Avançado, Especializado)
├─ Cria: 20 Alunos (5 por turma)
├─ Cria: 2 Locais
├─ Cria: 4 Schedules (1 por turma)
├─ Cria: ~80 Pagamentos (aleatórios, realistas)
├─ Marca: Os 3 primeiros alunos como pausados
└─ Exibe: Relatório de tudo que foi criado
```

### Arquivo: `app/models.py` (modificado)

```
class Student (modificado)
├─ Campos novos:
│  ├─ is_paused: Boolean = False
│  │  └─ True se está pausado (60+ dias sem pagar)
│  │
│  ├─ paused_at: DateTime (nullable)
│  │  └─ Quando ficou pausado
│  │
│  ├─ inadimplency_start_date: DateTime (nullable)
│  │  └─ Quando começou a ficar inexquitável
│  │
│  ├─ last_payment_date: Date (nullable)
│  │  └─ Data do último pagamento recebido
│  │
│  └─ days_without_payment: Integer (default 0)
│     └─ Dias desde último pagamento (redundante, calcula-se)
│
└─ payment_status: String (expandido)
   ├─ "active" - Em dia
   ├─ "pending" - Aguardando
   ├─ "inactive" - Inativo
   └─ "paused" - Pausado por inadimplência ⭐
```

---

## 🔗 Dependências Entre Funções

```
┌────────────────────────────────────────────┐
│   update_student_payment_status()          │ ← Chamada por:
│   (Função CORE de inadimplência)           │
└────────────────────────────────────────────┘
         ↑           ↑           ↑
         │           │           │
    Seed  │    Dashboard Routes   │  Manual (cronjob)
         │           │           │
         └───────────────────────┘

calculate_days_without_payment()
├─ Consultada por: update_student_payment_status()
├─ Consultada por: get_student_payment_summary()
└─ Consultada por: Dashboard endpoints

is_student_inadimplent()
├─ Consultada por: create_lesson validation
└─ Consultada por: Dashboard endpoints
```

---

## 📤 Fluxos de Dados (HTTP)

### Fluxo 1: Listar Alunos Pausados
```
Cliente HTTP
    ↓
GET /api/v1/dashboard/paused-students
    ↓
routers/dashboard.py → paused_students()
    ↓
services/payment_status.py → get_paused_students(teacher_id)
    ↓
models.py → Student (query: is_paused=True)
    ↓
database.db (SQLite/PostgreSQL)
    ↓
Retorna: [
    {
        student_name: "Ana Silva",
        is_paused: true,
        days_without_payment: 75,
        ...
    }
]
    ↓
Cliente recebe JSON
```

### Fluxo 2: Tentar Agendar Aula (Com Pausado)
```
Cliente HTTP
    ↓
POST /api/v1/lessons
Body: {schedule_id: "xyz", lesson_date: "2026-03-10"}
    ↓
routers/lessons.py → create_lesson()
    ↓
Valida: Existem estudantes pausados nesta turma?
    ├─ Query: Group → GroupStudent → Student (is_paused=True)
    ├─ Se SIM:
    │  └─ 403 FORBIDDEN
    │     "Não é possível agendar com pausados: Ana Silva"
    │
    └─ Se NÃO:
       └─ 201 CREATED
          Aula criada com sucesso
    ↓
Cliente recebe resposta
```

### Fluxo 3: Seed Realista
```
Executar: python -m app.seeds.seed_realistic
    ↓
seeds/seed_realistic.py → seed_realistic_data()
    ↓
Cria 20 alunos em 4 turmas
    ↓
Cria ~80 pagamentos (aleatórios)
    ↓
Para cada aluno:
    └─ services/payment_status.py → update_student_payment_status()
       └─ Atualiza is_paused baseado em dias sem pagar
    ↓
Salva tudo em models.py (Student, Payment, etc)
    ↓
Exibe relatório no console
```

---

## 🔐 Validações

### Onde São Feitas

```
┌─────────────────────────────────────────────┐
│     VALIDAÇÕES NO SISTEMA                   │
├─────────────────────────────────────────────┤
│                                              │
│  1️⃣ Models (ORM)                            │
│     └─ is_paused: Boolean = False            │
│     └─ Garante tipo de dados                │
│                                              │
│  2️⃣ Services (Business Logic)               │
│     └─ update_student_payment_status()       │
│     └─ Valida threshold 60 dias              │
│     └─ Atualiza estado correto               │
│                                              │
│  3️⃣ Routers (API Layer)                     │
│     └─ POST /lessons verifica is_paused      │
│     └─ Rejeita com 403 se pausado            │
│                                              │
│  4️⃣ Dados (Seed)                            │
│     └─ seed_realistic.py cria dados válidos  │
│     └─ Nunca cria inconsistências            │
│                                              │
└─────────────────────────────────────────────┘
```

---

## 💾 Estratégia de Banco de Dados

### Campos Redundantes?

**Pergunta:** Por que guardar `days_without_payment` se pode calcular?

**Resposta:** Trade-off entre performance e simplicicidade
- ✅ Guarda: Facilita dashboards (não precisa calcular)
- ✅ Calcula: Sempre atualizado (nunca fica desatualizado)

**Solução:** Recalcular na função `get_student_payment_summary()`

```python
# Sempre fresco, nunca stale
days = (date.today() - student.last_payment_date).days
student.days_without_payment = days
```

### Migrations (Alembic)

Se usar PostgreSQL e migration necessária:

```bash
# Dentro do backend:
alembic revision --autogenerate -m "Add payment status fields"
alembic upgrade head
```

Se usar SQLite (default), não precisa - ORM cria tabelas automaticamente.

---

## 🎯 Casos de Uso Implementados

### Caso 1: Monitoramento
```
Professor abre dashboard
→ Vê Ana Silva Pausada (75 dias)
→ Clica no nome
→ Vê: R$ 800 em atraso, 3 aulas perdidas
→ Liga para Ana cobrando
```

### Caso 2: Proteção
```
Professor tenta agendar aula para turma
Sistema detecta: Ana Silva (aluna da turma) está pausada
Sistema bloqueia: 403 FORBIDDEN
Professor só pode agendar quando Ana pagar
```

### Caso 3: Recuperação
```
Ana paga os atrasados
Sistema processa pagamento → status = PAID
Sistema roda: update_student_payment_status()
Sistema detecta: agora tem só 1 dia sem pagar
Sistema atualiza: is_paused = False
Professor consegue agendar aulas novamente
AUTOMÁTICO!
```

---

## ⚙️ Configuração

### Constantes Importantes

```python
# Em services/payment_status.py
INADIMPLENCY_THRESHOLD = 60  # dias para pausado
INADIMPLENCY_WARNING = 30    # dias para "oferecido"

# Mudar é fácil:
is_student_inadimplent(
    student_id, 
    db,
    days_threshold=90  # 3 meses em vez de 2
)
```

---

## 🧪 Testes

Para testar manualmente:

```python
# Script Python para testar:
from app.services.payment_status import get_student_payment_summary
from app.database import SessionLocal

db = SessionLocal()
student_id = "algum-uuid-do-student"
summary = get_student_payment_summary(student_id, db)

print(f"Is Paused: {summary['is_paused']}")
print(f"Days: {summary['days_without_payment']}")
print(f"Status: {summary['status_text']}")
```

---

## 📈 Diagrama ER (Entidades e Relações)

```
┌──────────────────┐
│ STUDENT          │
├──────────────────┤
│ id               │
│ name             │─┐
│ is_paused ⭐     │ │
│ paused_at ⭐     │ │
│ last_payment...⭐ │ │
│ payment_status⭐ │ │
└──────────────────┘ │
        │            │
        │ belongs to │
        │            │
        └──→ ┌──────────────────┐
             │ GROUP_STUDENT    │
             ├──────────────────┤
             │ id               │
             │ student_id (FK)  │
             │ group_id (FK)    │
             └──────────────────┘
                    │
                    │ references
                    │
             ┌──────────────────┐
             │ GROUP            │
             ├──────────────────┤
             │ id               │
             │ name             │
             │ price_per_hour   │
             └──────────────────┘

┌──────────────────┐
│ PAYMENT          │
├──────────────────┤
│ id               │
│ student_id (FK)  │─→ STUDENT
│ amount           │
│ due_date         │
│ status           │
│ payment_date     │
└──────────────────┘
```

---

## 🚀 Escalabilidade

Se crescer para 1000 alunos:

```
Current: Calcula dias em tempo real
├─ ✅ Sempre atualizado
└─ ❌ Pode ficar lento se muitos queries

Solução: Cache redis
├─ Calcula dias 1x por dia
├─ Armazena em cache
└─ Endpoints retornam do cache (rápido)

Implementação futura (if needed):
- redis client em settings.py
- Cache decorator em payment_status.py
- Cache invalidation ao processar pagamento
```

---

## 📝 Conclusão

**Arquitetura implementada:**
- ✅ Service layer lida com lógica de inadimplência
- ✅ Routers usam o service para validação
- ✅ Models guardam o estado
- ✅ Dashboard monitora tudo
- ✅ Seed popula com dados realistas

**Resultado:**
- ✅ Código testável (funções puras em services)
- ✅ Reutilizável (mesmas funções em seed e routers)
- ✅ Escalável (fácil adicionar mais validações)
- ✅ Manutenível (lógica centralizada)

---

*Documentação: 3 de Março de 2026*
