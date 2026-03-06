"""
Realista seed data com 20 alunos, 4 turmas, preços 70-100 R$/hora
Poucos pagamentos vencidos, regra de inadimplência implementada
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
    Cria dados realistas:
    - 1 professor (teste)
    - 4 turmas (grupos)
    - 20 alunos distribuídos nas turmas
    - 2 locais
    - Horários de aulas
    - Pagamentos com alguns inadimplentes (2-3 alunos com > 60 dias)
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
        
        # 2. Criar 2 locais
        print("📍 Criando locais...")
        locations = []
        
        location1 = Location(
            id=str(uuid.uuid4()),
            teacher_id=teacher.id,
            name="Sala Centro",
            address="Rua A, 123",
            city="São Paulo",
            state="SP",
            capacity=20
        )
        db.add(location1)
        
        location2 = Location(
            id=str(uuid.uuid4()),
            teacher_id=teacher.id,
            name="Sala Zona Norte",
            address="Rua B, 456",
            city="São Paulo",
            state="SP",
            capacity=20
        )
        db.add(location2)
        db.flush()
        locations = [location1, location2]
        
        # 3. Criar 4 turmas
        print("📚 Criando 4 turmas...")
        prices = [50, 60, 70, 80]  # R$/hora para cada turma (valores razoáveis)
        groups = []
        
        group_names = ["Iniciantes", "Intermediário", "Avançado", "Especializado"]
        
        for i, (name, price) in enumerate(zip(group_names, prices)):
            group = Group(
                id=str(uuid.uuid4()),
                teacher_id=teacher.id,
                location_id=locations[i % 2].id,
                name=name,
                description=f"Turma de {name} - R${price}/hora",
                hourly_rate=float(price),
                max_students=10,
                active=True
            )
            db.add(group)
            groups.append(group)
        
        db.flush()
        
        # 4. Criar 20 alunos distribuídos nas turmas
        print("👥 Criando 20 alunos...")
        students = []
        student_names = [
            "Ana Silva", "Bruno Costa", "Carlos Santos", "Diana Lima",
            "Eduardo Ferreira", "Fernanda Gomes", "Gustavo Oliveira", "Helena Martins",
            "Igor Souza", "Júlia Pereira", "Karine Alves", "Leonardo Barbosa",
            "Marina Cavalcanti", "Nícolas Rocha", "Olivia Mendes", "Paulo Ribeiro",
            "Quentin Dupree", "Rafaela Teixeira", "Samuel Correia", "Tatiana Abreu"
        ]
        
        # Distribuir 5 alunos por turma
        for idx, name in enumerate(student_names):
            group_idx = idx % 4
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
            students.append((student, groups[group_idx]))
        
        db.flush()
        
        # 5. Associar alunos às turmas
        print("🔗 Associando alunos às turmas...")
        for student, group in students:
            group_student = GroupStudent(
                id=str(uuid.uuid4()),
                group_id=group.id,
                student_id=student.id,
                joined_at=datetime.utcnow() - timedelta(days=random.randint(30, 180))
            )
            db.add(group_student)
        
        db.flush()
        
        # 6. Criar horários (2 horários por turma)
        print("⏰ Criando horários...")
        schedules = []
        
        time_slots = [
            ("18:00", "19:00"),
            ("19:00", "20:00"),
            ("20:00", "21:00"),
            ("14:00", "15:00")
        ]
        
        for i, group in enumerate(groups):
            schedule = Schedule(
                id=str(uuid.uuid4()),
                teacher_id=teacher.id,
                group_id=group.id,
                location_id=group.location_id,
                day_of_week=1,  # Segunda
                start_time=time_slots[i][0],
                end_time=time_slots[i][1]
            )
            db.add(schedule)
            schedules.append(schedule)
        
        db.flush()
        
        # 7. Criar pagamentos com distribuição realista
        print("💰 Criando pagamentos com distribuição realista...")
        print("   📊 Distribuição planejada:")
        print("      • 70% pagos (14 alunos)")
        print("      • 20% pendentes (4 alunos)")
        print("      • 8% atrasados < 30 dias (1-2 alunos)")
        print("      • 2% pausados > 60 dias (1 aluno)")
        
        # Definir status para cada aluno conforme distribuição
        # Total: 20 alunos
        # 70% paid = 14 students (indices 0-13)
        # 20% pending = 4 students (indices 14-17)
        # 8% overdue < 30 days = 1-2 students (indices 18)
        # 2% paused > 60 days = 1 student (index 19)
        
        for i, (student_obj, group) in enumerate(students):
            # Preço da turma
            price_per_hour = prices[groups.index(group)]
            
            # Assumir 4 aulas por mês (1 por semana)
            monthly_amount = price_per_hour * 4
            
            # Definir status do aluno baseado no índice
            if i < 14:
                # 70% - Alunos pagos (14 students)
                student_category = "paid"
            elif i < 18:
                # 20% - Alunos com pagamentos pendentes (4 students)
                student_category = "pending"
            elif i < 19:
                # 8% - Aluno atrasado < 30 dias (1-2 students)
                student_category = "overdue"
            else:
                # 2% - Aluno pausado > 60 dias (1 student)
                student_category = "paused"
            
            # Criar 4 meses de pagamentos
            for month in range(4, 0, -1):  # 4 meses atrás até agora
                due_date = date.today() - relativedelta(months=month)
                
                if student_category == "paid":
                    # Alunos pagos - todos os meses pagos
                    status = "PAID"
                    payment_date = due_date + timedelta(days=random.randint(1, 5))
                    payment_method = random.choice(["pix", "credit_card", "bank_transfer"])
                    
                elif student_category == "pending":
                    # Alunos com pagamentos pendentes
                    if month >= 2:  # Meses antigos pagos
                        status = "PAID"
                        payment_date = due_date + timedelta(days=random.randint(1, 5))
                        payment_method = random.choice(["pix", "credit_card"])
                    else:  # Mês atual pendente
                        status = "PENDING"
                        payment_date = None
                        payment_method = None
                        
                elif student_category == "overdue":
                    # Aluno atrasado < 30 dias
                    if month >= 3:  # Meses muito antigos pagos
                        status = "PAID"
                        payment_date = due_date + timedelta(days=random.randint(1, 5))
                        payment_method = "pix"
                    elif month == 2:  # Mês passado - atrasado
                        status = "OVERDUE"
                        payment_date = None
                        payment_method = None
                        # Ajustar due_date para ter ~20 dias de atraso
                        due_date = date.today() - timedelta(days=20)
                    else:  # Mês atual - pendente
                        status = "PENDING"
                        payment_date = None
                        payment_method = None
                        
                else:  # paused
                    # Aluno pausado > 60 dias sem pagar
                    if month == 4:  # 4 meses atrás - último pagamento
                        status = "PAID"
                        payment_date = due_date + timedelta(days=random.randint(1, 3))
                        payment_method = "pix"
                    else:
                        # Todos os outros meses sem pagar (3 meses = ~90 dias)
                        status = "OVERDUE"
                        payment_date = None
                        payment_method = None
                        # Ajustar due_date para refletir atraso real
                        if month == 3:
                            due_date = date.today() - timedelta(days=75)  # ~2.5 meses
                        elif month == 2:
                            due_date = date.today() - timedelta(days=45)  # ~1.5 meses
                        else:
                            due_date = date.today() - timedelta(days=15)  # ~0.5 mês
                
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
        print("📊 Atualizando status de inadimplência e aplicando regras de negócio...")
        print("   ⚙️  Regras:")
        print("      • Overdue: < 30 dias atrasado")
        print("      • Late: 30-60 dias atrasado")
        print("      • Paused: > 60 dias (libera vaga automaticamente)")
        
        from app.services.payment_status import update_student_payment_status
        
        for student, _ in students:
            update_student_payment_status(student.id, db)
        
        db.commit()
        
        # 9. Exibir resumo detalhado
        print("\n" + "="*70)
        print("✅ SEED CRIADO COM SUCESSO!")
        print("="*70)
        print(f"✓ Professor: {teacher.full_name}")
        print(f"✓ Email: {teacher.email} | Senha: password123")
        print(f"✓ Turmas: 4 (Iniciantes R$50/h, Intermediário R$60/h,")
        print(f"            Avançado R$70/h, Especializado R$80/h)")
        print(f"✓ Alunos: 20 (5 por turma)")
        print(f"✓ Locais: 2 (Sala Centro, Sala Zona Norte)")
        print(f"✓ Pagamentos mensais: R$200, R$240, R$280, R$320 (4 aulas/mês)")
        
        # Estatísticas de pagamento e inadimplência
        from app.services.payment_status import (
            get_paused_students,
            get_all_inadimplent_students,
            get_overdue_students,
            get_late_students
        )
        
        # Buscar estatísticas
        db.refresh(teacher)  # Recarregar para pegar dados atualizados
        paused = get_paused_students(teacher.id, db)
        late_students = get_late_students(teacher.id, db)
        overdue = get_overdue_students(teacher.id, db)
        all_inadimplent = get_all_inadimplent_students(teacher.id, db)
        
        # Alunos pagos (20 - inadimplentes)
        paid_students = 20 - len(all_inadimplent)
        
        print(f"\n📊 DISTRIBUIÇÃO DE PAGAMENTOS:")
        print(f"   ✅ Pagos: {paid_students} alunos ({paid_students/20*100:.0f}%)")
        print(f"   ⏳ Pendentes: {20 - len(all_inadimplent) - paid_students} alunos")
        print(f"   ⚠️  Atrasados (< 30 dias): {len(overdue)} alunos ({len(overdue)/20*100:.0f}%)")
        print(f"   🟠 Muito Atrasados (30-60 dias): {len(late_students)} alunos ({len(late_students)/20*100:.0f}%)")
        print(f"   🔴 Pausados (> 60 dias): {len(paused)} alunos ({len(paused)/20*100:.0f}%)")
        
        # Calcular total em aberto
        total_overdue = sum(p.get('total_overdue', 0) for p in all_inadimplent)
        
        print(f"\n💰 FINANCEIRO:")
        print(f"   • Total em aberto: R$ {total_overdue:.2f}")
        print(f"   • Inadimplentes: {len(all_inadimplent)} alunos")
        
        if paused:
            print(f"\n🔴 ALUNOS PAUSADOS (Vaga liberada automaticamente):")
            for p in paused:
                print(f"   • {p['student_name']}: {p['days_without_payment']} dias sem pagar")
                print(f"     R$ {p['total_overdue']:.2f} em aberto")
        
        if late_students:
            print(f"\n🟠 ALUNOS MUITO ATRASADOS (30-60 dias - Risco de pausar):")
            for l in late_students:
                print(f"   • {l['student_name']}: {l['days_without_payment']} dias")
        
        if overdue:
            print(f"\n⚠️  ALUNOS ATRASADOS (< 30 dias):")
            for o in overdue[:3]:  # Mostrar só os 3 primeiros
                print(f"   • {o['student_name']}: {o['days_without_payment']} dias")
        
        print("\n📌 ENDPOINTS DISPONÍVEIS:")
        print("   GET /api/dashboard/summary")
        print("   GET /api/dashboard/paused-students")
        print("   GET /api/dashboard/overdue-students")
        print("   GET /api/students")
        
        print("\n🔗 TESTE RÁPIDO:")
        print("   curl https://teacherflow-backend.onrender.com/health")
        
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
