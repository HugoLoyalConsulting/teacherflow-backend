"""Payment recurrence service - generates recurring payments"""
import uuid
from datetime import date, timedelta
from dateutil.relativedelta import relativedelta
from app.models import Payment
from app.schemas.payments import PaymentResponse


def generate_recurring_payments(
    base_payment: Payment,
    teacher_id: str,
    student_id: str,
    amount: float,
    recurrence: str,
    due_date: date,
    recurrence_end_date: date = None,
    **kwargs
) -> list[Payment]:
    """
    Gera pagamentos recorrentes a partir de um pagamento base
    
    Args:
        base_payment: Pagamento base com recorrência configurada
        teacher_id: ID do professor
        student_id: ID do aluno
        amount: Valor do pagamento
        recurrence: Tipo de recorrência (WEEKLY, BIWEEKLY, MONTHLY, ONCE)
        due_date: Data de vencimento inicial
        recurrence_end_date: Até quando repetir (ex: quando aluno sair da turma)
        **kwargs: Outros campos do pagamento
    
    Returns:
        Lista de objetos Payment gerados
    """
    if not recurrence or recurrence == 'ONCE':
        payment = Payment(
            id=str(uuid.uuid4()),
            teacher_id=teacher_id,
            student_id=student_id,
            amount=amount,
            due_date=due_date,
            recurrence=recurrence,
            recurrence_end_date=recurrence_end_date,
            **kwargs
        )
        return [payment]
    
    payments = []
    current_date = due_date
    
    # Se não há data de fim, assume 12 meses a partir de agora
    if not recurrence_end_date:
        recurrence_end_date = due_date + relativedelta(months=12)
    
    payment_index = 0
    
    while current_date <= recurrence_end_date:
        payment = Payment(
            id=str(uuid.uuid4()),
            teacher_id=teacher_id,
            student_id=student_id,
            amount=amount,
            due_date=current_date,
            recurrence=recurrence,
            recurrence_end_date=recurrence_end_date,
            status='PENDING' if current_date > date.today() else 'OVERDUE',
            **kwargs
        )
        payments.append(payment)
        
        # Calcula próxima data baseado na recorrência
        if recurrence == 'WEEKLY':
            current_date += timedelta(weeks=1)
        elif recurrence == 'BIWEEKLY':
            current_date += timedelta(weeks=2)
        elif recurrence == 'MONTHLY':
            current_date += relativedelta(months=1)
        
        payment_index += 1
        
        # Segurança: máximo 100 recorrências
        if payment_index > 100:
            break
    
    return payments


def expand_recurring_payments(payments: list[Payment]) -> list[Payment]:
    """
    Expande todos os payments com recorrência
    
    Args:
        payments: Lista de payments potencialmente com recorrência
    
    Returns:
        Lista expandida com todos os pagamentos gerados
    """
    expanded = []
    
    for payment in payments:
        if payment.recurrence and payment.recurrence != 'ONCE':
            expanded.extend(generate_recurring_payments(
                base_payment=payment,
                teacher_id=payment.teacher_id,
                student_id=payment.student_id,
                amount=payment.amount,
                recurrence=payment.recurrence,
                due_date=payment.due_date,
                recurrence_end_date=payment.recurrence_end_date,
                payment_date=payment.payment_date,
                payment_method=payment.payment_method,
                description=payment.description,
                status=payment.status,
                reference=payment.reference,
                notes=payment.notes,
            ))
        else:
            expanded.append(payment)
    
    return expanded
