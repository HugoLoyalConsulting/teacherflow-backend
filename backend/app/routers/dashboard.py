"""Dashboard and reporting routes for payment status and inadimplency"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import verify_token
from app.services.payment_status import (
    get_student_payment_summary,
    get_all_inadimplent_students,
    get_paused_students,
)

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/payment-status/{student_id}")
async def get_student_status(
    student_id: str,
    user_id: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """
    Obtém o status de pagamento de um aluno específico
    
    Response:
    {
        'student_id': str,
        'student_name': str,
        'is_paused': bool,
        'days_without_payment': int,
        'last_payment_date': date | None,
        'total_overdue': float,
        'overdue_payment_count': int,
        'paused_since': datetime | None,
        'status_text': str  # 'Em Dia' | 'Inadimplente (X dias)' | 'Pausado (X dias)'
    }
    """
    summary = get_student_payment_summary(student_id, db)
    
    if not summary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    # Verificar se o aluno pertence ao professor
    from app.models import Student
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student or student.teacher_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this student"
        )
    
    return summary


@router.get("/inadimplent-students")
async def list_inadimplent_students(
    user_id: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """
    Lista todos os alunos inadimplentes (30+ dias sem pagar)
    
    Response: Lista de resumos de pagamento, ordenados por dias sem pagar
    """
    students = get_all_inadimplent_students(user_id, db)
    
    return {
        "total_inadimplent": len(students),
        "students": students
    }


@router.get("/paused-students")
async def list_paused_students(
    user_id: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """
    Lista todos os alunos pausados por inadimplência (2+ meses)
    
    Esses alunos não podem agendar novas aulas até pagarem os atrasados
    
    Response: Lista de alunos pausados com resumo de pagamento
    """
    students = get_paused_students(user_id, db)
    
    return {
        "total_paused": len(students),
        "students": students
    }


@router.get("/payment-summary")
async def get_payment_summary(
    user_id: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """
    Obtém um resumo geral de pagamentos do professor
    
    Response:
    {
        'total_students': int,
        'students_in_good_standing': int,  # Em dia
        'students_inadimplent': int,  # 30+ dias
        'students_paused': int,  # Pausados (2+ meses)
        'total_overdue_amount': float,
        'total_pending_amount': float
    }
    """
    from app.models import Student, Payment
    
    # Contar alunos
    all_students = db.query(Student).filter(Student.teacher_id == user_id).all()
    total_students = len(all_students)
    
    # Contar por status
    paused = get_paused_students(user_id, db)
    inadimplent = get_all_inadimplent_students(user_id, db)
    students_in_good_standing = total_students - len(inadimplent)
    
    # Somar valores
    overdue_payments = db.query(Payment).filter(
        Payment.teacher_id == user_id,
        Payment.status == "OVERDUE"
    ).all()
    total_overdue = sum(p.amount for p in overdue_payments)
    
    pending_payments = db.query(Payment).filter(
        Payment.teacher_id == user_id,
        Payment.status == "PENDING"
    ).all()
    total_pending = sum(p.amount for p in pending_payments)
    
    return {
        'total_students': total_students,
        'students_in_good_standing': students_in_good_standing,
        'students_inadimplent': len(inadimplent),
        'students_paused': len(paused),
        'total_overdue_amount': total_overdue,
        'total_pending_amount': total_pending,
        'total_outstanding': total_overdue + total_pending,
    }
