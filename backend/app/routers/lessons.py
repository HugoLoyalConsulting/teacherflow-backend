"""Lessons routes"""
import uuid
from fastapi import APIRouter, HTTPException, status, Depends, Query
from sqlalchemy.orm import Session
from datetime import date
from app.core.database import get_db
from app.core.security import verify_token
from app.models import Lesson, Schedule, Group, GroupStudent, Student
from app.schemas.lessons import (
    LessonCreate, LessonUpdate, LessonAttendanceUpdate, LessonResponse
)
from app.services.payment_status import is_student_inadimplent

router = APIRouter(prefix="/lessons", tags=["lessons"])


@router.get("/", response_model=list[LessonResponse])
async def list_lessons(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    date_from: date = None,
    date_to: date = None,
    user_id: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """List lessons for current user"""
    query = db.query(Lesson).filter(Lesson.teacher_id == user_id)
    
    if date_from:
        query = query.filter(Lesson.lesson_date >= date_from)
    if date_to:
        query = query.filter(Lesson.lesson_date <= date_to)
    
    lessons = query.offset(skip).limit(limit).all()
    return lessons


@router.get("/{lesson_id}", response_model=LessonResponse)
async def get_lesson(
    lesson_id: str,
    user_id: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Get lesson by ID"""
    lesson = db.query(Lesson).filter(
        Lesson.id == lesson_id,
        Lesson.teacher_id == user_id
    ).first()
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found"
        )
    return lesson


@router.post("/", response_model=LessonResponse)
async def create_lesson(
    request: LessonCreate,
    user_id: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """
    Create new lesson
    
    Validação: Rejeita criação de aula se algum aluno da turma estiver pausado
    """
    # Verify schedule belongs to user
    schedule = db.query(Schedule).filter(
        Schedule.id == request.schedule_id,
        Schedule.teacher_id == user_id
    ).first()
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Schedule not found"
        )
    
    # Validação: Verificar se algum aluno da turma está pausado
    group = db.query(Group).filter(Group.id == schedule.group_id).first()
    if group:
        group_students = db.query(GroupStudent).filter(
            GroupStudent.group_id == group.id,
            GroupStudent.left_at == None  # Apenas alunos ativos
        ).all()
        
        paused_students = []
        for gs in group_students:
            student = db.query(Student).filter(Student.id == gs.student_id).first()
            if student and student.is_paused:
                paused_students.append(student.name)
        
        if paused_students:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Não é possível agendar aula com alunos pausados: {', '.join(paused_students)}. "
                       f"Solicite pagamento dos atrasados primeiro."
            )
    
    lesson = Lesson(
        id=str(uuid.uuid4()),
        teacher_id=user_id,
        **request.model_dump()
    )
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return lesson


@router.put("/{lesson_id}", response_model=LessonResponse)
async def update_lesson(
    lesson_id: str,
    request: LessonUpdate,
    user_id: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Update lesson"""
    lesson = db.query(Lesson).filter(
        Lesson.id == lesson_id,
        Lesson.teacher_id == user_id
    ).first()
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found"
        )
    
    for key, value in request.model_dump(exclude_unset=True).items():
        setattr(lesson, key, value)
    
    db.commit()
    db.refresh(lesson)
    return lesson


@router.patch("/{lesson_id}/attendance", response_model=LessonResponse)
async def update_attendance(
    lesson_id: str,
    request: LessonAttendanceUpdate,
    user_id: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Update lesson attendance"""
    lesson = db.query(Lesson).filter(
        Lesson.id == lesson_id,
        Lesson.teacher_id == user_id
    ).first()
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found"
        )
    
    lesson.attendance_data = request.attendance_data
    if request.status:
        lesson.status = request.status
    
    db.commit()
    db.refresh(lesson)
    return lesson


@router.delete("/{lesson_id}")
async def delete_lesson(
    lesson_id: str,
    user_id: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Delete lesson"""
    lesson = db.query(Lesson).filter(
        Lesson.id == lesson_id,
        Lesson.teacher_id == user_id
    ).first()
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found"
        )
    
    db.delete(lesson)
    db.commit()
    return {"message": "Lesson deleted successfully"}
