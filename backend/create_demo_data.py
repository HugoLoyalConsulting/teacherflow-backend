"""Create reasonable demo data with correct pricing"""
import uuid
from datetime import datetime, date, timedelta
import sys
sys.path.insert(0, '.')

from app.core.database import SessionLocal
from app.models import User, Group, Location, Student, GroupStudent, Payment

db = SessionLocal()

try:
    # Get teacher
    teacher = db.query(User).filter(User.email == "professor@teacherflow.com").first()
    if not teacher:
        print("✗ Teacher not found! Run create_demo_user.py first.")
        exit(1)
    
    print(f"✓ Found teacher: {teacher.email}")
    
    # Create location
    location = Location(
        id=str(uuid.uuid4()),
        teacher_id=teacher.id,
        name="Estúdio Central",
        address="Rua das Flores, 123",
        city="São Paulo",
        state="SP",
        capacity=15
    )
    db.add(location)
    db.flush()
    print(f"✓ Location created: {location.name}")
    
    # Create 3 groups with reasonable pricing
    groups_data = [
        {"name": "Iniciantes", "hourly_rate": 45.0, "desc": "Aulas para iniciantes"},
        {"name": "Intermediário", "hourly_rate": 55.0, "desc": "Nível intermediário"},
        {"name": "Avançado", "hourly_rate": 65.0, "desc": "Alunos avançados"}
    ]
    
    groups = []
    for gdata in groups_data:
        group = Group(
            id=str(uuid.uuid4()),
            teacher_id=teacher.id,
            location_id=location.id,
            name=gdata["name"],
            description=gdata["desc"],
            hourly_rate=gdata["hourly_rate"],
            max_students=8,
            active=True
        )
        db.add(group)
        groups.append(group)
        print(f"✓ Group created: {group.name} - R${group.hourly_rate:.2f}/hora")
    
    db.flush()
    
    # Create 6 students (2 per group)
    students_data = [
        {"name": "Ana Silva", "email": "ana.silva@email.com", "phone": "11-98765-4321"},
        {"name": "Bruno Costa", "email": "bruno.costa@email.com", "phone": "11-97654-3210"},
        {"name": "Carla Santos", "email": "carla.santos@email.com", "phone": "11-96543-2109"},
        {"name": "Daniel Oliveira", "email": "daniel.oliveira@email.com", "phone": "11-95432-1098"},
        {"name": "Elisa Ferreira", "email": "elisa.ferreira@email.com", "phone": "11-94321-0987"},
        {"name": "Felipe Gomes", "email": "felipe.gomes@email.com", "phone": "11-93210-9876"}
    ]
    
    for idx, sdata in enumerate(students_data):
        group = groups[idx % 3]  # Distribute across 3 groups
        
        student = Student(
            id=str(uuid.uuid4()),
            teacher_id=teacher.id,
            name=sdata["name"],
            email=sdata["email"],
            phone=sdata["phone"],
            profile_type="standard",
            payment_status="active",
            is_paused=False,
            created_at=datetime.utcnow()
        )
        db.add(student)
        db.flush()
        
        # Associate with group
        group_student = GroupStudent(
            id=str(uuid.uuid4()),
            group_id=group.id,
            student_id=student.id,
            joined_at=datetime.utcnow()
        )
        db.add(group_student)
        
        # Create monthly payment (4 classes per month)
        monthly_amount = group.hourly_rate * 4.0
        
        payment = Payment(
            id=str(uuid.uuid4()),
            teacher_id=teacher.id,
            student_id=student.id,
            amount=monthly_amount,
            currency="BRL",
            due_date=date.today(),
            payment_date=None,
            payment_method=None,
            status="PENDING",
            description=f"Mensalidade {datetime.now().strftime('%B/%Y')}",
            recurrence="MONTHLY"
        )
        db.add(payment)
        
        print(f"✓ Student: {student.name} - {group.name} - R${monthly_amount:.2f}/mês")
    
    db.commit()
    
    print("\n" + "="*60)
    print("✅ DEMO DATA CRIADO COM VALORES CORRETOS!")
    print("="*60)
    print("\n📊 RESUMO:")
    print(f"  • Turma Iniciantes: R$45/hora → R$180/mês (4 aulas)")
    print(f"  • Turma Intermediário: R$55/hora → R$220/mês (4 aulas)")
    print(f"  • Turma Avançado: R$65/hora → R$260/mês (4 aulas)")
    print(f"\n  • Total: 6 alunos")
    print(f"  • Receita mensal: R${(180*2 + 220*2 + 260*2):.2f}")
    print("="*60 + "\n")
    
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
finally:
    db.close()
