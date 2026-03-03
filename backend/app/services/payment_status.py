"""Payment status and inadimplency service"""
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from app.models import Student, Payment


def calculate_days_without_payment(student_id: str, db: Session) -> int:
    """
    Calcula quantos dias um aluno está sem pagar
    
    Returns:
        Número de dias desde o último pagamento
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student or not student.last_payment_date:
        # Se nunca pagou, contar desde criação
        return (date.today() - student.created_at.date()).days if student else 0
    
    return (date.today() - student.last_payment_date).days


def is_student_inadimplent(student_id: str, db: Session, days_threshold: int = 60) -> bool:
    """
    Verifica se um aluno está inadimplente (2+ meses sem pagar)
    
    Args:
        student_id: ID do aluno
        db: Database session
        days_threshold: Dias sem pagar para ser considerado inadimplente (default 60 = 2 meses)
    
    Returns:
        True se está inadimplente
    """
    return calculate_days_without_payment(student_id, db) >= days_threshold


def update_student_payment_status(student_id: str, db: Session, days_threshold: int = 60) -> None:
    """
    Atualiza o status de pagamento do aluno e aplica lógica de "Pausado"
    
    Regra: Se > 2 meses (60 dias) sem pagar:
       - Status muda para 'paused'
       - is_paused = True
       - paused_at = agora
    
    Se voltar a pagar:
       - Status volta para 'active'
       - is_paused = False
       - paused_at = None
    
    Args:
        student_id: ID do aluno
        db: Database session
        days_threshold: Dias sem pagar para pausar (default 60 = 2 meses)
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
    
    # Aplicar lógica de "Pausado"
    if days_without_payment >= days_threshold:
        # Está inadimplente - marcar como pausado
        if not student.is_paused:
            student.is_paused = True
            student.paused_at = datetime.utcnow()
            student.payment_status = "paused"
            student.inadimplency_start_date = datetime.utcnow()
    else:
        # Está em dia - desmarcar como pausado
        if student.is_paused:
            student.is_paused = False
            student.paused_at = None
            student.payment_status = "active"
            student.inadimplency_start_date = None
    
    db.commit()


def get_student_payment_summary(student_id: str, db: Session) -> dict:
    """
    Retorna um resumo do status de pagamento do aluno
    
    Returns:
        {
            'student_id': str,
            'is_paused': bool,
            'days_without_payment': int,
            'last_payment_date': date | None,
            'total_overdue': float,
            'overdue_payment_count': int,
            'paused_since': datetime | None,
            'status_text': str  # 'Em Dia' | 'Inadimplente (X dias)' | 'Pausado (X dias)'
        }
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        return None
    
    # Atualizar status
    update_student_payment_status(student_id, db)
    
    # Buscar pagamentos vencidos
    overdue_payments = db.query(Payment).filter(
        Payment.student_id == student_id,
        Payment.status == "OVERDUE"
    ).all()
    
    total_overdue = sum(p.amount for p in overdue_payments)
    
    # Determinar texto de status
    if student.is_paused:
        days = student.days_without_payment
        status_text = f"Pausado ({days} dias sem pagar)"
    elif student.days_without_payment > 30:
        days = student.days_without_payment
        status_text = f"Inadimplente ({days} dias)"
    else:
        status_text = "Em Dia"
    
    return {
        'student_id': student.id,
        'student_name': student.name,
        'is_paused': student.is_paused,
        'days_without_payment': student.days_without_payment,
        'last_payment_date': student.last_payment_date,
        'total_overdue': total_overdue,
        'overdue_payment_count': len(overdue_payments),
        'paused_since': student.paused_at,
        'status_text': status_text,
        'payment_status': student.payment_status
    }


def get_all_inadimplent_students(teacher_id: str, db: Session) -> list:
    """
    Retorna todos os alunos inadimplentes (todos os status > 30 dias)
    
    Returns:
        Lista de resumos de pagamento
    """
    students = db.query(Student).filter(
        Student.teacher_id == teacher_id
    ).all()
    
    inadimplent = []
    for student in students:
        summary = get_student_payment_summary(student.id, db)
        if summary and summary['days_without_payment'] > 30:
            inadimplent.append(summary)
    
    return sorted(inadimplent, key=lambda x: x['days_without_payment'], reverse=True)


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
