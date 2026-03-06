# Realistic Demo Data & Business Rules

**Last Updated:** March 6, 2026

---

## 🎯 Overview

TeacherFlow now includes **realistic demo data** that follows real-world business rules for student payment statuses and inadimplency management.

---

## 📊 Payment Distribution

The seed data creates **20 students** distributed according to realistic payment patterns:

| Status | Count | Percentage | Description |
|--------|-------|------------|-------------|
| **Paid** | 14 students | 70% | All payments up-to-date |
| **Pending** | 4 students | 20% | Recent payment pending (not yet late) |
| **Overdue** | 1-2 students | 8% | Late < 30 days (warning) |
| **Paused** | 1 student | 2% | Late > 60 days (automatic schedule release) |

---

## ⚖️ Business Rules

### Payment Status Categories

TeacherFlow implements a **three-tier inadimplency system**:

#### 1. **Overdue** (Atrasado)
- **Days late:** < 30 days
- **Status:** Warning ⚠️
- **Action:** Student maintains class spot
- **UI:** Yellow indicator
- **Description:** Student has missed payment but is within grace period

#### 2. **Late** (Muito Atrasado)
- **Days late:** 30-60 days
- **Status:** Critical 🟠
- **Action:** Student at risk, teacher should follow up
- **UI:** Orange indicator
- **Description:** Serious payment delay, needs immediate attention

#### 3. **Paused** (Pausado)
- **Days late:** > 60 days
- **Status:** Suspended 🔴
- **Action:** **Automatic schedule release** - student loses class spot
- **UI:** Red indicator
- **Description:** Student automatically removed from groups/schedules

---

## 🔄 Automatic Schedule Release

**Critical Feature:** When a student reaches **60+ days** without payment:

1. Student status automatically changes to `paused`
2. Student is **removed from all groups** (`GroupStudent` records deleted)
3. Student **loses their schedule slots** (vacancies open for new students)
4. Teacher receives notification
5. Student can be re-added to groups after payment

**Implementation:**
```python
# Located in: backend/app/services/payment_status.py
def release_paused_student_schedules(student_id: str, db: Session) -> int:
    """
    Automatically releases schedule slots when student is paused
    """
    # Remove from all groups
    group_students = db.query(GroupStudent).filter(
        GroupStudent.student_id == student_id
    ).all()
    
    for gs in group_students:
        db.delete(gs)
```

---

## 👥 Demo Data Structure

### Professor (Teacher)
```
Email: professor@teacherflow.com
Password: password123
Name: Prof. João Silva
```

### Groups (4 turmas)

| Group | Hourly Rate | Monthly Cost* | Students | Location |
|-------|-------------|---------------|----------|----------|
| Iniciantes | R$ 50/h | R$ 200/month | 5 | Sala Centro |
| Intermediário | R$ 60/h | R$ 240/month | 5 | Sala Zona Norte |
| Avançado | R$ 70/h | R$ 280/month | 5 | Sala Centro |
| Especializado | R$ 80/h | R$ 320/month | 5 | Sala Zona Norte |

*Monthly cost assumes 4 classes/month (1 per week)

### Locations (2 locais)

1. **Sala Centro**
   - Address: Rua A, 123, São Paulo - SP
   - Capacity: 20 students

2. **Sala Zona Norte**
   - Address: Rua B, 456, São Paulo - SP
   - Capacity: 20 students

### Students (20 alunos)

**Distribution by payment status:**

- **Students 0-13** (14 students): Fully paid
  - All 4 months of payments marked as PAID
  - Payment dates: 1-5 days after due date
  - Methods: PIX, credit card, bank transfer

- **Students 14-17** (4 students): Pending
  - Old months paid, current month pending
  - Status: PENDING (not yet late)

- **Student 18** (1 student): Overdue < 30 days
  - Recent payment ~20 days late
  - Status: OVERDUE
  - Maintains class spot

- **Student 19** (1 student): Paused > 60 days
  - Last payment: 4 months ago
  - 3 months unpaid (~90 days)
  - Status: PAUSED
  - **Automatically removed from groups**

---

## 💰 Payment Logic

### Payment Creation

Each student has **4 months** of payment records:

```python
# Month distribution
month_4 (oldest) = 4 months ago
month_3 = 3 months ago
month_2 = 2 months ago
month_1 (current) = this month
```

### Status Assignment

**Paid Students (70%):**
- All months: `status = PAID`
- Payment dates: due_date + 1-5 days
- Methods: PIX, credit card, bank transfer

**Pending Students (20%):**
- Old months: `status = PAID`
- Recent months: `status = PENDING`

**Overdue Students (8%):**
- Oldest months: `status = PAID`
- Month 2: `status = OVERDUE`, due_date adjusted to ~20 days ago
- Current month: `status = PENDING`

**Paused Students (2%):**
- Month 4: `status = PAID` (last payment)
- Months 3, 2, 1: `status = OVERDUE`
- Due dates adjusted for ~90 days total delay

---

## 🔍 Status Update Logic

### Calculation Method

**Days without payment** is calculated from the **oldest unpaid due date**:

```python
def calculate_days_without_payment(student_id: str, db: Session) -> int:
    # Find oldest overdue payment
    oldest_overdue = db.query(Payment).filter(
        Payment.student_id == student_id,
        Payment.status.in_(["OVERDUE", "PENDING"]),
        Payment.due_date <= date.today()
    ).order_by(Payment.due_date.asc()).first()
    
    if oldest_overdue:
        return (date.today() - oldest_overdue.due_date).days
    
    return 0  # Fully paid
```

### Status Category Assignment

```python
def get_payment_status_category(days_without_payment: int) -> str:
    if days_without_payment == 0:
        return "active"       # Fully paid
    elif days_without_payment < 30:
        return "overdue"      # Warning
    elif days_without_payment < 60:
        return "late"         # Critical
    else:
        return "paused"       # Suspended
```

---

## 📈 Dashboard Statistics

After seeding, the dashboard shows:

```
📊 DISTRIBUIÇÃO DE PAGAMENTOS:
   ✅ Pagos: 14 alunos (70%)
   ⏳ Pendentes: 4 alunos (20%)
   ⚠️  Atrasados (< 30 dias): 1 aluno (5%)
   🟠 Muito Atrasados (30-60 dias): 0 alunos (0%)
   🔴 Pausados (> 60 dias): 1 aluno (5%)

💰 FINANCEIRO:
   • Total em aberto: R$ 960.00
   • Inadimplentes: 2 alunos
```

---

## 🚀 API Endpoints

### Get Payment Summary
```bash
GET /api/dashboard/summary

Response:
{
  "total_students": 20,
  "active_students": 14,
  "overdue_students": 1,
  "late_students": 0,
  "paused_students": 1,
  "total_overdue": 960.00,
  "pending_amount": 240.00
}
```

### Get Paused Students
```bash
GET /api/dashboard/paused-students

Response:
[
  {
    "student_id": "uuid",
    "student_name": "Tatiana Abreu",
    "days_without_payment": 90,
    "total_overdue": 960.00,
    "status_category": "paused",
    "status_text": "Pausado (90 dias sem pagar)",
    "paused_since": "2025-12-07T10:00:00"
  }
]
```

### Get Overdue Students
```bash
GET /api/dashboard/overdue-students

Response:
[
  {
    "student_id": "uuid",
    "student_name": "Samuel Correia",
    "days_without_payment": 20,
    "total_overdue": 280.00,
    "status_category": "overdue",
    "status_text": "Atrasado (20 dias)"
  }
]
```

### Get All Inadimplent Students
```bash
GET /api/students?inadimplent=true

# Returns all students with days_without_payment > 0
# Sorted by severity: paused > late > overdue
```

---

## 🔧 Implementation Files

### Backend Files

1. **seed_realistic.py**
   - Location: `backend/app/seeds/seed_realistic.py`
   - Creates 20 students with realistic payment distribution
   - Implements payment status logic

2. **payment_status.py**
   - Location: `backend/app/services/payment_status.py`
   - Manages payment status calculations
   - Implements automatic schedule release
   - Provides summary and reporting functions

3. **autoseed.py**
   - Location: `backend/app/core/autoseed.py`
   - Automatically seeds database on first deployment
   - Runs only once (checks if database is empty)

### Key Models

**Student Model:**
```python
class Student(Base):
    id: str
    teacher_id: str
    name: str
    email: str
    phone: str
    payment_status: str  # 'active' | 'overdue' | 'late' | 'paused'
    is_paused: bool
    paused_at: datetime
    last_payment_date: date
    days_without_payment: int
```

**Payment Model:**
```python
class Payment(Base):
    id: str
    teacher_id: str
    student_id: str
    amount: float
    currency: str = "BRL"
    due_date: date
    payment_date: date
    status: str  # 'PENDING' | 'PAID' | 'OVERDUE'
    payment_method: str  # 'pix' | 'credit_card' | 'bank_transfer'
```

---

## 🧪 Testing

### Run Seed Manually

```bash
# Backend directory
cd backend

# Run seed script
python -m app.seeds.seed_realistic

# Or use Python directly
python backend/app/seeds/seed_realistic.py
```

### Verify Data

```bash
# Check health
curl https://teacherflow-backend.onrender.com/health

# Get all students
curl https://teacherflow-backend.onrender.com/api/students \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get paused students
curl https://teacherflow-backend.onrender.com/api/dashboard/paused-students \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎨 Frontend Display

### Student Card Example

```tsx
// Paid student (green)
✅ Ana Silva
   Status: Em Dia
   Última mensalidade: 05/03/2026

// Overdue student (yellow)
⚠️ Samuel Correia
   Status: Atrasado (20 dias)
   Valor em aberto: R$ 280,00

// Paused student (red)
🔴 Tatiana Abreu
   Status: Pausado (90 dias sem pagar)
   Valor em aberto: R$ 960,00
   ⚠️ Vaga liberada automaticamente
```

---

## 🔄 Updating Student Status

Status updates happen automatically in two scenarios:

### 1. On Payment Record
```python
# When payment is recorded
payment.status = "PAID"
payment.payment_date = date.today()
db.commit()

# Automatically triggers status update
update_student_payment_status(student_id, db)
# → Student status recalculated
# → If was paused and now active, can rejoin groups
```

### 2. On Scheduled Job (Recommended)
```python
# Run daily via cron or scheduler
from app.services.payment_status import update_student_payment_status

def update_all_students():
    students = db.query(Student).all()
    for student in students:
        update_student_payment_status(student.id, db)
```

---

## 📚 Related Documentation

- [Architecture Overview](./architecture/ARCHITECTURE_STACK_INTEGRATION.md)
- [Database Models](./DATABASE_SCHEMA.md)
- [Payment Processing](./PAYMENT_PROCESSING.md)
- [Subscription System](./SUBSCRIPTION_SYSTEM.md)

---

## ✅ Success Metrics

After implementing realistic demo data, the application demonstrates:

- **70% retention rate** (paid students)
- **Automatic enforcement** of payment policies
- **Clear status visualization** for teachers
- **Realistic financial dashboard** with accurate metrics
- **Proper business logic** for inadimplency management

---

**Next Steps:** Configure email notifications for payment reminders and status changes.
