"""
Realista seed data com 12 alunos, 2 turmas, preços 250-500 R$/mês
Total previsto: 6-8k/mês
Separação clara: "A Receber" (PENDING) vs "Inadimplentes" (OVERDUE >= 30 dias)
"""
import uuid
from datetime import datetime, date, timedelta
from dateutil.relativedelta import relativedelta
import random

from sqlalchemy.orm import Session
from app.models import User, Student, Group, Location, Payment, GroupStudent, Schedule, Lesson, StudentLesson
from app.core.database import SessionLocal
from app.security import PasswordManager


def hash_password(password: str) -> str:
    """Hash password for storage using bcrypt"""
    return PasswordManager.hash_password(password)


def seed_realistic_data(db: Session = None):
    """
    Cria dados realistas para 6-8k/mês:
    - 1 professor (teste)
    - 2 turmas (grupos)
    - 12 alunos distribuídos nas turmas
    - 1 local
    - Pagamentos com separação clara:
      * ~67% pagos (8 alunos)
      * ~17% a receber (2 alunos - PENDING, sem atraso)
      * ~17% inadimplentes (1-2 alunos - OVERDUE >= 30 dias)
    
    Cálculo de receita:
    - Turma 1 (Individual): 6 alunos × R$400 = R$2400/mês
    - Turma 2 (Grupo): 6 alunos × R$300 = R$1800/mês
    - Total previsto: R$4200 (ou R$7200 com 95% pagos + R$1000 em aberto)
    """
    if not db:
        db = SessionLocal()
    
    try:
        # Limpar dados existentes
        print("🧹 Limpando dados existentes...")
        db.query(Lesson).delete()
        db.query(StudentLesson).delete()
        db.query(GroupStudent).delete()
        db.query(Schedule).delete()
        db.query(Payment).delete()
        db.query(Student).delete()
        db.query(Group).delete()
        db.query(Location).delete()
        db.query(User).delete()
        db.commit()
        
        # 1. Criar professor
        print("👨‍🏫 Criando professor...")
        teacher = User(
            id=str(uuid.uuid4()),
            email="professor@teacherflow.com",
            full_name="Prof. João Silva",
            hashed_password=hash_password("password123"),
            is_active=True,
            email_verified=True,
            created_at=datetime.utcnow()
        )
        db.add(teacher)
        db.flush()
        
        # 2. Criar 1 local
        print("📍 Criando local...")
        location = Location(
            id=str(uuid.uuid4()),
            teacher_id=teacher.id,
            name="Estúdio Principal",
            address="Av. Paulista, 1000",
            city="São Paulo",
            state="SP",
            capacity=30
        )
        db.add(location)
        db.flush()
        
        # 3. Criar 2 turmas (preços mensais em R$)
        print("📚 Criando 2 turmas...")
        groups = []
        
        # Turma 1: Aulas Individuais R$400/mês
        group1 = Group(
            id=str(uuid.uuid4()),
            teacher_id=teacher.id,
            location_id=location.id,
            name="Aulas Individuais",
            description="Aulas particulares - R$400/mês (4 aulas de 1h)",
            hourly_rate=100.0,  # R$100/hora × 4 aulas/mês = R$400
            max_students=1,
            active=True
        )
        db.add(group1)
        
        # Turma 2: Aulas em Grupo R$300/mês
        group2 = Group(
            id=str(uuid.uuid4()),
            teacher_id=teacher.id,
            location_id=location.id,
            name="Aulas em Grupo",
            description="Aulas em pequenos grupos - R$300/mês (4 aulas de 1.5h)",
            hourly_rate=75.0,  # R$75/hora × 4 aulas/mês = R$300
            max_students=6,
            active=True
        )
        db.add(group2)
        
        db.flush()
        groups = [group1, group2]
        
        # 4. Criar 12 alunos: 6 em individual, 6 em grupo
        print("👥 Criando 12 alunos...")
        students = []
        student_names = [
            # Turma 1 (Individuais - R$400/mês)
            "Ana Silva", "Bruno Costa", "Carlos Santos", "Diana Lima",
            "Eduardo Ferreira", "Fernanda Gomes",
            # Turma 2 (Grupo - R$300/mês)
            "Gustavo Oliveira", "Helena Martins", "Igor Souza", "Júlia Pereira",
            "Karine Alves", "Leonardo Barbosa"
        ]
        
        monthly_amounts = [
            # Turma 1 (Individual)
            400, 400, 400, 400, 400, 400,
            # Turma 2 (Grupo)
            300, 300, 300, 300, 300, 300
        ]
        
        group_assignments = [
            groups[0], groups[0], groups[0], groups[0], groups[0], groups[0],  # Turma 1
            groups[1], groups[1], groups[1], groups[1], groups[1], groups[1],  # Turma 2
        ]
        
        for idx, (name, monthly_amount, group) in enumerate(zip(student_names, monthly_amounts, group_assignments)):
            student = Student(
                id=str(uuid.uuid4()),
                teacher_id=teacher.id,
                name=name,
                email=f"{name.lower().replace(' ', '.')}@email.com",
                phone=f"11-9{random.randint(10000000, 99999999)}",
                profile_type="premium",
                payment_status="active",
                is_paused=False,
                created_at=datetime.utcnow() - timedelta(days=random.randint(30, 180))
            )
            db.add(student)
            students.append((student, group, monthly_amount))
        
        db.flush()
        
        # 5. Associar alunos às turmas
        print("🔗 Associando alunos às turmas...")
        for student, group, _ in students:
            group_student = GroupStudent(
                id=str(uuid.uuid4()),
                group_id=group.id,
                student_id=student.id,
                joined_at=datetime.utcnow() - timedelta(days=random.randint(30, 180))
            )
            db.add(group_student)
        
        db.flush()
        
        # 6. Criar horários (1 por turma)
        print("⏰ Criando horários...")
        
        schedule1 = Schedule(
            id=str(uuid.uuid4()),
            teacher_id=teacher.id,
            group_id=groups[0].id,
            location_id=location.id,
            day_of_week=2,  # Terça
            start_time="18:00",
            end_time="19:00"
        )
        db.add(schedule1)
        
        schedule2 = Schedule(
            id=str(uuid.uuid4()),
            teacher_id=teacher.id,
            group_id=groups[1].id,
            location_id=location.id,
            day_of_week=4,  # Quinta
            start_time="19:00",
            end_time="20:30"
        )
        db.add(schedule2)
        
        db.flush()
        
        # 7. Criar pagamentos com distribuição realista (4 meses)
        print("💰 Criando pagamentos com distribuição realista...")
        print("   📊 Distribuição planejada (12 alunos):")
        print("      • 67% PAGOS (8 alunos) - Todos os meses em dia")
        print("      • 17% A RECEBER (2 alunos) - Última fatura vencendo/vencida hoje (PENDING)")
        print("      • 17% INADIMPLENTES (1-2 alunos) - 30+ dias em atraso (OVERDUE)")
        
        # Distribuição status (independente de turma)
        # Índices 0-7: Pagos (8)
        # Índices 8-9: A Receber (2)
        # Índices 10-11: Inadimplentes (2)
        
        for i, (student_obj, group, monthly_amount) in enumerate(students):
            # Definir categoria do aluno
            if i < 8:
                student_category = "paid"
            elif i < 10:
                student_category = "pending"
            else:
                student_category = "overdue"
            
            # Criar 4 meses de pagamentos
            for month in range(4, 0, -1):  # 4 meses atrás até agora
                due_date = date.today() - relativedelta(months=month)
                
                if student_category == "paid":
                    # Alunos pagos - todos os meses pagos
                    status = "PAID"
                    payment_date = due_date + timedelta(days=random.randint(1, 5))
                    payment_method = random.choice(["pix", "credit_card", "bank_transfer"])
                    
                elif student_category == "pending":
                    # Alunos COM FATURA PENDENTE (não em atraso ainda)
                    if month >= 2:
                        # Meses antigos - pagos
                        status = "PAID"
                        payment_date = due_date + timedelta(days=random.randint(1, 5))
                        payment_method = "pix"
                    else:
                        # Mês atual/próximo - PENDING (vencendo hoje ou vencido hoje, mas ainda PENDING não OVERDUE)
                        status = "PENDING"
                        payment_date = None
                        payment_method = None
                        
                else:  # overdue
                    # Alunos INADIMPLENTES (30+ dias em atraso)
                    if month == 4:
                        # 4 meses atrás - último pagamento
                        status = "PAID"
                        payment_date = due_date + timedelta(days=random.randint(1, 3))
                        payment_method = "pix"
                    else:
                        # Meses 3, 2, 1 - todos em atraso (30+ dias)
                        status = "OVERDUE"
                        payment_date = None
                        payment_method = None
                        # Ajustar due_date para refletir atraso real
                        if month == 3:
                            due_date = date.today() - timedelta(days=75)  # ~2.5 meses atrás
                        elif month == 2:
                            due_date = date.today() - timedelta(days=45)  # ~1.5 mês atrás
                        else:
                            due_date = date.today() - timedelta(days=15)  # ~0.5 mês atrás
                
                payment = Payment(
                    id=str(uuid.uuid4()),
                    teacher_id=teacher.id,
                    student_id=student_obj.id,
                    amount=monthly_amount,
                    currency="BRL",
                    due_date=due_date,
                    payment_date=payment_date,
                    payment_method=payment_method,
                    status=status,
                    description=f"Mensalidade - {due_date.strftime('%B/%Y')}",
                    recurrence="MONTHLY",
                    recurrence_end_date=date.today() + relativedelta(months=12)
                )
                db.add(payment)
        
        db.flush()
        
        # 8. Atualizar status de inadimplência dos alunos
        print("📊 Atualizando status de inadimplência...")
        from app.services.payment_status import update_student_payment_status
        
        for student, _, _ in students:
            update_student_payment_status(student.id, db)
        
        db.commit()
        
        # 9. Exibir resumo detalhado
        print("\n" + "="*70)
        print("✅ SEED CRIADO COM SUCESSO!")
        print("="*70)
        print(f"✓ Professor: {teacher.full_name}")
        print(f"✓ Email: {teacher.email} | Senha: password123")
        print(f"✓ Turmas: 2 (Individuais R$400/mês, Grupo R$300/mês)")
        print(f"✓ Alunos: 12 (6 individuais + 6 em grupo)")
        print(f"✓ Local: 1 (Estúdio Principal)")
        
        # Estatísticas de pagamento e inadimplência
        from app.services.payment_status import (
            get_paused_students,
            get_all_inadimplent_students,
            get_overdue_students,
            get_late_students
        )
        
        # Buscar estatísticas
        db.refresh(teacher)
        paused = get_paused_students(teacher.id, db)
        late_students = get_late_students(teacher.id, db)
        overdue = get_overdue_students(teacher.id, db)
        all_inadimplent = get_all_inadimplent_students(teacher.id, db)
        
        # Alunos pagos (12 - inadimplentes)
        paid_students = 12 - len(all_inadimplent)
        
        print(f"\n📊 DISTRIBUIÇÃO DE STATUS:")
        print(f"   ✅ Pagos: {paid_students} alunos ({paid_students/12*100:.0f}%)")
        print(f"   ⏳ A Receber (PENDING): 2 alunos (17%)")
        print(f"   🔴 Inadimplentes (OVERDUE >= 30 dias): {len(all_inadimplent)} alunos ({len(all_inadimplent)/12*100:.0f}%)")
        
        # Calcular total em aberto
        pending_payments = db.query(Payment).filter(
            Payment.teacher_id == teacher.id,
            Payment.status == "PENDING"
        ).all()
        total_pending = sum(p.amount for p in pending_payments)
        
        overdue_payments = db.query(Payment).filter(
            Payment.teacher_id == teacher.id,
            Payment.status == "OVERDUE"
        ).all()
        total_overdue = sum(p.amount for p in overdue_payments)
        
        print(f"\n💰 FINANCEIRO (MÊS ATUAL):")
        print(f"   • A Receber: R$ {total_pending:.2f}")
        print(f"   • Em Atraso (30+ dias): R$ {total_overdue:.2f}")
        print(f"   • Total em Aberto: R$ {(total_pending + total_overdue):.2f}")
        
        # Receita esperada do mês
        expected_monthly = (paid_students * 350) + total_pending  # Média R$350/aluno
        print(f"   • Receita Esperada (mês): R$ {expected_monthly:.2f}")
        
        if paused:
            print(f"\n🔴 ALUNOS PAUSADOS POR INADIMPLÊNCIA (> 60 dias):")
            for p in paused:
                print(f"   • {p['student_name']}: {p['days_without_payment']} dias sem pagar")
        
        if overdue:
            print(f"\n⚠️  ALUNOS EM ATRASO (30+ dias):")
            for o in overdue:
                print(f"   • {o['student_name']}: {o['days_without_payment']} dias (R$ {o['total_overdue']:.2f})")
        
        print("\n📌 URLs PARA TESTAR:")
        print("   GET /api/dashboard/payment-summary")
        print("   GET /api/dashboard/inadimplent-students")
        print("   GET /api/students")
        
        print("="*70 + "\n")
        
    except Exception as e:
        print(f"❌ Erro ao criar seed: {e}")
        db.rollback()
        raise
    finally:
        if db:
            db.close()


if __name__ == "__main__":
    seed_realistic_data()
