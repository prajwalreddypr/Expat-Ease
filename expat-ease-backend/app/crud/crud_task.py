from typing import List, Optional
from sqlmodel import Session, select
from app.models.task import Task, TaskCreate, TaskUpdate, TaskStatus
from app.models.document import Document, DocumentCreate
from app.core.storage import save_upload_file
from fastapi import UploadFile, HTTPException


def get_tasks_for_user(session: Session, user_id: int, country: Optional[str] = None) -> List[Task]:
    """Get all tasks for a user, optionally filtered by country."""
    query = select(Task).where(Task.user_id == user_id)
    
    if country:
        query = query.where(Task.country == country)
    
    query = query.order_by(Task.order_index, Task.created_at)
    
    tasks = session.exec(query).all()
    
    return tasks


def create_default_tasks_for_user(session: Session, user_id: int, country: str) -> List[Task]:
    """Create default tasks for a user based on their country."""
    
    # Default tasks template - can be customized per country
    default_tasks = [
        {
            "title": "Obtain Visa/Permit",
            "description": "Apply for and obtain the necessary visa or residence permit",
            "priority": "high",
            "order_index": 1,
            "estimated_days": 30
        },
        {
            "title": "Register with Local Authorities",
            "description": "Register your address with local government offices",
            "priority": "high", 
            "order_index": 2,
            "estimated_days": 7
        },
        {
            "title": "Open Bank Account",
            "description": "Open a local bank account for financial transactions",
            "priority": "medium",
            "order_index": 3,
            "estimated_days": 14
        },
        {
            "title": "Get Health Insurance",
            "description": "Obtain health insurance coverage",
            "priority": "high",
            "order_index": 4,
            "estimated_days": 7
        },
        {
            "title": "Find Housing",
            "description": "Secure permanent accommodation",
            "priority": "high",
            "order_index": 5,
            "estimated_days": 30
        },
        {
            "title": "Get Tax ID",
            "description": "Obtain tax identification number",
            "priority": "medium",
            "order_index": 6,
            "estimated_days": 14
        },
        {
            "title": "Register for Utilities",
            "description": "Set up electricity, water, internet services",
            "priority": "medium",
            "order_index": 7,
            "estimated_days": 7
        },
        {
            "title": "Learn Local Language",
            "description": "Enroll in language classes or self-study",
            "priority": "low",
            "order_index": 8,
            "estimated_days": 90
        }
    ]
    
    created_tasks = []
    
    for task_data in default_tasks:
        task = Task(
            title=task_data["title"],
            description=task_data["description"],
            priority=task_data["priority"],
            country=country,
            user_id=user_id,
            order_index=task_data["order_index"],
            estimated_days=task_data["estimated_days"]
        )
        session.add(task)
        created_tasks.append(task)
    
    session.commit()
    
    # Refresh to get IDs
    for task in created_tasks:
        session.refresh(task)
    
    return created_tasks


def create_task(session: Session, task_data: TaskCreate, user_id: int) -> Task:
    """Create a new task for a user."""
    task = Task(
        **task_data.dict(),
        user_id=user_id
    )
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


def update_task_status(session: Session, task_id: int, user_id: int, status: TaskStatus) -> Optional[Task]:
    """Update task status."""
    task = session.get(Task, task_id)
    
    if not task or task.user_id != user_id:
        return None
    
    task.status = status
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


def delete_task(session: Session, task_id: int, user_id: int) -> bool:
    """Delete a task."""
    task = session.get(Task, task_id)
    
    if not task or task.user_id != user_id:
        return False
    
    session.delete(task)
    session.commit()
    return True


async def save_document_record(
    session: Session, 
    task_id: int, 
    user_id: int, 
    upload_file: UploadFile
) -> Document:
    """Save uploaded document and create database record."""
    
    # Verify task exists and belongs to user
    task = session.get(Task, task_id)
    if not task or task.user_id != user_id:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Save file to storage
    relative_path, filename, file_size, content_type = await save_upload_file(user_id, upload_file)
    
    # Create document record
    document = Document(
        filename=filename,
        original_filename=upload_file.filename or "unknown",
        file_path=relative_path,
        file_size=file_size,
        content_type=content_type,
        task_id=task_id,
        user_id=user_id
    )
    
    session.add(document)
    session.commit()
    session.refresh(document)
    
    return document


def get_task_documents(session: Session, task_id: int, user_id: int) -> List[Document]:
    """Get all documents for a specific task."""
    query = select(Document).where(
        Document.task_id == task_id,
        Document.user_id == user_id
    ).order_by(Document.created_at)
    
    return session.exec(query).all()


def delete_document(session: Session, document_id: int, user_id: int) -> bool:
    """Delete a document."""
    document = session.get(Document, document_id)
    
    if not document or document.user_id != user_id:
        return False
    
    # TODO: Also delete the physical file
    session.delete(document)
    session.commit()
    return True
