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
        
        # 7. Criar pagamentos com maioria em dia, alguns vencidos
        print("💰 Criando pagamentos...")
        
        for i, (student_obj, group) in enumerate(students):
            # Preço da turma
            price_per_hour = prices[groups.index(group)]
            
            # Assumir 4 aulas por mês (1 por semana)
            monthly_amount = price_per_hour * 4
            
            # Criar 4 meses de pagamentos
            # Maioria paga, alguns com atraso
            is_inadimplent = i < 3  # Primeiros 3 alunos ficarão inadimplentes
            
            for month in range(4, 0, -1):  # 4 meses atrás até agora
                due_date = date.today() - relativedelta(months=month)
                
                if is_inadimplent and month == 4:
                    # Aluno inadimplente - não pagou 2+ meses atrás
                    status = "OVERDUE"
                    payment_date = None
                elif month <= 2:
                    # Recentes - pagou
                    status = "PAID"
                    payment_date = due_date + timedelta(days=random.randint(1, 5))
                elif month == 3:
                    # 1 mês atrás - alguns não pagaram ainda
                    if random.random() < 0.7:  # 70% pagou
                        status = "PAID"
                        payment_date = due_date + timedelta(days=random.randint(1, 5))
                    else:
                        status = "OVERDUE"
                        payment_date = None
                else:
                    status = "PENDING"
                    payment_date = None
                
                payment = Payment(
                    id=str(uuid.uuid4()),
                    teacher_id=teacher.id,
                    student_id=student_obj.id,
                    amount=monthly_amount,
                    currency="BRL",
                    due_date=due_date,
                    payment_date=payment_date,
                    payment_method="pix" if payment_date else None,
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
        
        for student, _ in students:
            update_student_payment_status(student.id, db)
        
        db.commit()
        
        # 9. Exibir resumo
        print("\n" + "="*60)
        print("✅ SEED CRIADO COM SUCESSO!")
        print("="*60)
        print(f"✓ Professor: {teacher.full_name}")
        print(f"✓ Turmas: 4 (Iniciantes R$50/h, Intermediário R$60/h, Avançado R$70/h, Especializado R$80/h)")
        print(f"✓ Alunos: 20 (5 por turma)")
        print(f"✓ Locais: 2")
        print(f"✓ Pagamentos mensais: R$200, R$240, R$280, R$320 (4 aulas/mês)")
        
        # Estatísticas de inadimplência
        from app.services.payment_status import get_paused_students, get_all_inadimplent_students
        
        paused = get_paused_students(teacher.id, db)
        all_inadimplent = get_all_inadimplent_students(teacher.id, db)
        
        print(f"\n📊 ESTATÍSTICAS:")
        print(f"  • Alunos Pausados: {len(paused)}")
        print(f"  • Alunos Inadimplentes: {len(all_inadimplent)}")
        
        if paused:
            print(f"\n🔴 ALUNOS PAUSADOS:")
            for p in paused:
                print(f"  • {p['student_name']}: {p['days_without_payment']} dias sem pagar")
        
        if all_inadimplent:
            print(f"\n⚠️ ALUNOS INADIMPLENTES (30+ dias):")
            for a in all_inadimplent[:5]:
                print(f"  • {a['student_name']}: {a['days_without_payment']} dias, R${a['total_overdue']:.2f} vencido")
        
        print("\n" + "="*60)
        
    except Exception as e:
        print(f"❌ Erro ao criar seed: {e}")
        db.rollback()
        raise
    finally:
        if db:
            db.close()


if __name__ == "__main__":
    seed_realistic_data()
