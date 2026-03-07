"""Payment status and inadimplency service

Business Rules:
- Overdue (Atrasado): < 30 days late → warning status, still active
- Late (Inadimplente): 30-60 days late → critical status, needs urgent attention
- Paused (Pausado): 60+ days late → automatic removal from groups/schedules

Definition:
- Inadimplent (Inadimplente) = Late OR Paused (>= 30 days without payment)
"""
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from app.models import Student, Payment, GroupStudent


def calculate_days_without_payment(student_id: str, db: Session) -> int:
    """
    Calcula quantos dias um aluno está sem pagar baseado no último pagamento vencido
    
    Returns:
        Número de dias desde o vencimento do último pagamento não pago
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        return 0
    
    # Buscar o pagamento vencido mais antigo
    oldest_overdue = db.query(Payment).filter(
        Payment.student_id == student_id,
        Payment.status.in_(["OVERDUE", "PENDING"]),
        Payment.due_date <= date.today()
    ).order_by(Payment.due_date.asc()).first()
    
    if oldest_overdue:
        # Calcular dias desde o vencimento
        return (date.today() - oldest_overdue.due_date).days
    
    # Se não há pagamentos vencidos, retornar 0
    return 0


def is_student_inadimplent(student_id: str, db: Session, days_threshold: int = 30) -> bool:
    """
    Verifica se um aluno está inadimplente (30+ dias sem pagar)
    
    Args:
        student_id: ID do aluno
        db: Database session
        days_threshold: Dias sem pagar para ser considerado inadimplente (default 30)
    
    Returns:
        True se está inadimplente
    """
    return calculate_days_without_payment(student_id, db) >= days_threshold


def get_payment_status_category(days_without_payment: int) -> str:
    """
    Determina a categoria de status baseado nos dias sem pagar
    
    Returns:
        - 'active': 0 dias (em dia)
        - 'overdue': 1-29 dias (atrasado, alerta)
        - 'late': 30-59 dias (inadimplente, crítico)
        - 'paused': 60+ dias (pausado, removido de turmas)
    """
    if days_without_payment == 0:
        return "active"
    elif days_without_payment < 30:
        return "overdue"  # Atrasado (< 30 dias)
    elif days_without_payment < 60:
        return "late"  # Muito atrasado (30-60 dias)
    else:
        return "paused"  # Pausado (> 60 dias)


def release_paused_student_schedules(student_id: str, db: Session) -> int:
    """
    Libera automaticamente as vagas de horários de alunos pausados
    Remove o aluno das turmas (GroupStudent) quando pausado por > 60 dias
    
    Returns:
        Número de turmas das quais o aluno foi removido
    """
    from app.models import GroupStudent
    
    # Buscar todas as associações do aluno com turmas
    group_students = db.query(GroupStudent).filter(
        GroupStudent.student_id == student_id
    ).all()
    
    removed_count = 0
    for gs in group_students:
        db.delete(gs)
        removed_count += 1
    
    if removed_count > 0:
        db.commit()
    
    return removed_count


def update_student_payment_status(student_id: str, db: Session) -> None:
    """
    Atualiza o status de pagamento do aluno conforme regras de negócio
    
    Regras:
    - Overdue (atrasado): < 30 dias sem pagar
    - Late (muito atrasado): 30-60 dias sem pagar
    - Paused (pausado): > 60 dias sem pagar
      → Aluno pausado perde automaticamente sua vaga em turmas
    
    Args:
        student_id: ID do aluno
        db: Database session
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        return
    
    # Buscar último pagamento recebido (PAID)
    last_payment = db.query(Payment).filter(
        Payment.student_id == student_id,
        Payment.status == "PAID"
    ).order_by(Payment.payment_date.desc()).first()
    
    if last_payment:
        student.last_payment_date = last_payment.payment_date
    
    # Calcular dias sem pagar
    days_without_payment = calculate_days_without_payment(student_id, db)
    student.days_without_payment = days_without_payment
    
    # Determinar categoria de status
    status_category = get_payment_status_category(days_without_payment)
    old_status = student.payment_status
    
    # Atualizar status do estudante
    student.payment_status = status_category
    
    # Aplicar lógica de pausado (> 60 dias)
    if status_category == "paused":
        if not student.is_paused:
            # Primeira vez que é pausado
            student.is_paused = True
            student.paused_at = datetime.utcnow()
            student.inadimplency_start_date = datetime.utcnow()
            
            # **REGRA CRÍTICA**: Liberar vaga automaticamente
            removed_from_groups = release_paused_student_schedules(student_id, db)
            print(f"⚠️  Aluno {student.name} pausado! Removido de {removed_from_groups} turma(s).")
    else:
        # Não está mais pausado (voltou a pagar)
        if student.is_paused:
            student.is_paused = False
            student.paused_at = None
            student.inadimplency_start_date = None
            print(f"✓ Aluno {student.name} reativado (voltou a pagar)!")
    
    db.commit()


def get_student_payment_summary(student_id: str, db: Session) -> dict:
    """
    Retorna um resumo do status de pagamento do aluno
    
    Returns:
        {
            'student_id': str,
            'student_name': str,
            'is_paused': bool,
            'days_without_payment': int,
            'last_payment_date': date | None,
            'total_overdue': float,
            'overdue_payment_count': int,
            'paused_since': datetime | None,
            'status_category': str,  # 'active' | 'overdue' | 'late' | 'paused'
            'status_text': str,  # 'Em Dia' | 'Atrasado (X dias)' | 'Muito Atrasado (X dias)' | 'Pausado (X dias)'
            'payment_status': str
        }
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        return None
    
    # Atualizar status
    update_student_payment_status(student_id, db)
    
    # Recarregar student após update
    db.refresh(student)
    
    # Buscar pagamentos vencidos
    overdue_payments = db.query(Payment).filter(
        Payment.student_id == student_id,
        Payment.status == "OVERDUE"
    ).all()
    
    total_overdue = sum(p.amount for p in overdue_payments)
    
    # Determinar categoria e texto de status
    days = student.days_without_payment
    status_category = get_payment_status_category(days)
    
    if status_category == "paused":
        status_text = f"Pausado ({days} dias sem pagar)"
    elif status_category == "late":
        status_text = f"Muito Atrasado ({days} dias)"
    elif status_category == "overdue":
        status_text = f"Atrasado ({days} dias)"
    else:
        status_text = "Em Dia"
    
    return {
        'student_id': student.id,
        'student_name': student.name,
        'is_paused': student.is_paused,
        'days_without_payment': days,
        'last_payment_date': student.last_payment_date,
        'total_overdue': total_overdue,
        'overdue_payment_count': len(overdue_payments),
        'paused_since': student.paused_at,
        'status_category': status_category,
        'status_text': status_text,
        'payment_status': student.payment_status
    }


def get_all_inadimplent_students(teacher_id: str, db: Session) -> list:
    """
    Retorna todos os alunos inadimplentes (>= 30 dias sem pagar)
    Inclui categorias: 'late' (30-60 dias) e 'paused' (60+ dias)
    Ordenados por gravidade: pausados primeiro, depois por dias sem pagar
    
    Returns:
        Lista de resumos de pagamento ordenada por gravidade
    """
    students = db.query(Student).filter(
        Student.teacher_id == teacher_id
    ).all()
    
    inadimplent = []
    for student in students:
        summary = get_student_payment_summary(student.id, db)
        # Inadimplente = late OR paused (>= 30 dias)
        if summary and summary['status_category'] in ['late', 'paused']:
            inadimplent.append(summary)
    
    # Ordenar por gravidade (pausado > late > overdue) e depois por dias
    def sort_key(s):
        category_priority = {
            'paused': 3,
            'late': 2,
            'overdue': 1,
            'active': 0
        }
        return (category_priority.get(s['status_category'], 0), s['days_without_payment'])
    
    return sorted(inadimplent, key=sort_key, reverse=True)


def get_overdue_students(teacher_id: str, db: Session) -> list:
    """
    Retorna alunos atrasados (< 30 dias)
    
    Returns:
        Lista de alunos atrasados
    """
    students = db.query(Student).filter(
        Student.teacher_id == teacher_id
    ).all()
    
    overdue_list = []
    for student in students:
        summary = get_student_payment_summary(student.id, db)
        if summary and summary['status_category'] == 'overdue':
            overdue_list.append(summary)
    
    return sorted(overdue_list, key=lambda x: x['days_without_payment'], reverse=True)


def get_late_students(teacher_id: str, db: Session) -> list:
    """
    Retorna alunos muito atrasados (30-60 dias)
    
    Returns:
        Lista de alunos muito atrasados
    """
    students = db.query(Student).filter(
        Student.teacher_id == teacher_id
    ).all()
    
    late_list = []
    for student in students:
        summary = get_student_payment_summary(student.id, db)
        if summary and summary['status_category'] == 'late':
            late_list.append(summary)
    
    return sorted(late_list, key=lambda x: x['days_without_payment'], reverse=True)


def get_paused_students(teacher_id: str, db: Session) -> list:
    """
    Retorna todos os alunos pausados por inadimplência
    
    Returns:
        Lista de alunos pausados com resumo
    """
    students = db.query(Student).filter(
        Student.teacher_id == teacher_id,
        Student.is_paused == True
    ).all()
    
    paused_list = []
    for student in students:
        summary = get_student_payment_summary(student.id, db)
        paused_list.append(summary)
    
    return sorted(paused_list, key=lambda x: x['paused_since'], reverse=True)
