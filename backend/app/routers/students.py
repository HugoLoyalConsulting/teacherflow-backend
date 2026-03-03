"""Students routes"""
import uuid
from fastapi import APIRouter, HTTPException, status, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_token
from app.models import Student
from app.schemas.students import StudentCreate, StudentUpdate, StudentResponse

router = APIRouter(prefix="/students", tags=["students"])


@router.get("/", response_model=list[StudentResponse])
async def list_students(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    user_id: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """List all students for current user"""
    students = (
        db.query(Student)
        .filter(Student.teacher_id == user_id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return students


@router.get("/{student_id}", response_model=StudentResponse)
async def get_student(
    student_id: str,
    user_id: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Get student by ID"""
    student = db.query(Student).filter(
        Student.id == student_id,
        Student.teacher_id == user_id
    ).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    return student


@router.post("/", response_model=StudentResponse)
async def create_student(
    request: StudentCreate,
    user_id: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Create new student"""
    student = Student(
        id=str(uuid.uuid4()),
        teacher_id=user_id,
        **request.model_dump()
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


@router.put("/{student_id}", response_model=StudentResponse)
async def update_student(
    student_id: str,
    request: StudentUpdate,
    user_id: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Update student"""
    student = db.query(Student).filter(
        Student.id == student_id,
        Student.teacher_id == user_id
    ).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    for key, value in request.model_dump(exclude_unset=True).items():
        setattr(student, key, value)
    
    db.commit()
    db.refresh(student)
    return student


@router.delete("/{student_id}")
async def delete_student(
    student_id: str,
    user_id: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Delete student"""
    student = db.query(Student).filter(
        Student.id == student_id,
        Student.teacher_id == user_id
    ).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    db.delete(student)
    db.commit()
    return {"message": "Student deleted successfully"}
