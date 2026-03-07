"""ICS Calendar Export Service"""
from icalendar import Calendar, Event
from datetime import datetime, timedelta
from typing import List, Dict, Any
import pytz
import logging
from dateutil import parser as dateutil_parser

logger = logging.getLogger(__name__)


class ICSExportService:
    """Generate iCalendar (.ics) files from lessons"""
    
    @staticmethod
    def create_calendar(
        lessons: List[Any],
        teacher_name: str,
        calendar_name: str = None,
        teacher_email: str = None
    ) -> str:
        """
        Create an iCalendar object from lessons
        
        Args:
            lessons: List of Lesson objects or dicts
            teacher_name: Name of the teacher (organizer)
            calendar_name: Name of the calendar
            teacher_email: Email of the teacher
        
        Returns:
            ICS file content as string
        """
        cal = Calendar()
        cal.add('prodid', '-//TeacherFlow//Lesson Calendar//EN')
        cal.add('version', '2.0')
        cal.add('calscale', 'GREGORIAN')
        cal.add('method', 'PUBLISH')
        cal.add('x-wr-calname', calendar_name or f'Aulas - {teacher_name}')
        cal.add('x-wr-timezone', 'America/Sao_Paulo')
        cal.add('x-wr-caldesc', 'Calendário de aulas')
        
        # Add each lesson as an event
        for lesson in lessons:
            event = Event()
            
            # Handle both dict and ORM object
            if isinstance(lesson, dict):
                title = lesson.get('title', 'Aula')
                student_name = lesson.get('student_name', 'N/A')
                location = lesson.get('location', '')
                duration_minutes = lesson.get('duration_minutes', 60)
                start_time = lesson.get('date') or lesson.get('lesson_date')
                lesson_id = lesson.get('id', '')
            else:
                # ORM object
                title = lesson.title or 'Aula'
                student_name = lesson.student.name if hasattr(lesson, 'student') and lesson.student else 'N/A'
                location = lesson.location.name if hasattr(lesson, 'location') and lesson.location else ''
                duration_minutes = lesson.duration_minutes or 60
                start_time = lesson.lesson_date or lesson.date
                lesson_id = lesson.id
            
            # Parse datetime if needed
            if isinstance(start_time, str):
                start_time = dateutil_parser.parse(start_time)
            
            end_time = start_time + timedelta(minutes=duration_minutes)
            
            # Basic info
            event.add('summary', f"Aula: {title}")
            event.add('description', f"Aluno: {student_name}\nLocal: {location or 'A informar'}")
            
            # Date and time
            event.add('dtstart', start_time)
            event.add('dtend', end_time)
            
            # Location
            if location:
                event.add('location', location)
            
            # Organizer
            if teacher_email:
                event.add('organizer', teacher_email, parameters={'cn': teacher_name})
            
            # Unique ID
            event.add('uid', f"{lesson_id}@teacherflow.app")
            
            # Status and categories
            event.add('status', 'CONFIRMED')
            event.add('categories', 'Aula')
            
            # Timestamp
            event.add('dtstamp', datetime.utcnow())
            
            # Add to calendar
            cal.add_component(event)
        
        # Return ICS as string
        return cal.to_ical().decode('utf-8')
    
    @staticmethod
    def get_filename(teacher_name: str = "aulas") -> str:
        """Generate a filename for the ICS export"""
        timestamp = datetime.now().strftime("%Y%m%d")
        safe_name = teacher_name.lower().replace(' ', '_')
        return f"{safe_name}_aulas_{timestamp}.ics"
