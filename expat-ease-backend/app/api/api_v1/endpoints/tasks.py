from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlmodel import Session
from app.db.session import get_session
from app.core.deps import get_current_user
from app.models.user import User
from app.models.task import Task, TaskCreate, TaskUpdate, TaskResponse, TaskStatus
from app.models.document import Document, DocumentResponse
from app.crud.crud_task import (
    get_tasks_for_user, 
    create_default_tasks_for_user, 
    create_task, 
    update_task_status, 
    delete_task, 
    save_document_record,
    get_task_documents,
    delete_document
)
from app.core.storage import is_valid_file_type, get_max_file_size

router = APIRouter()


@router.get("/", response_model=List[TaskResponse])
def get_tasks(
    country: str = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get all tasks for the current user."""
    try:
        tasks = get_tasks_for_user(session, current_user.id, country)
    except Exception as e:
        print(f"Error fetching tasks: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    # Convert to response format with unlocked status
    task_responses = []
    for i, task in enumerate(tasks):
        # Calculate unlocked status
        unlocked = True
        if i > 0:
            prev_task = tasks[i - 1]
            unlocked = prev_task.status == TaskStatus.COMPLETED
        
        # Get documents for this task
        documents = get_task_documents(session, task.id, current_user.id)
        document_responses = [
            DocumentResponse(
                id=doc.id,
                filename=doc.filename,
                original_filename=doc.original_filename,
                file_path=doc.file_path,
                file_size=doc.file_size,
                content_type=doc.content_type,
                task_id=doc.task_id,
                user_id=doc.user_id,
                created_at=doc.created_at,
                download_url=f"/uploads/{doc.file_path}"
            )
            for doc in documents
        ]
        
        task_response = TaskResponse(
            id=task.id,
            title=task.title,
            description=task.description,
            status=task.status,
            priority=task.priority,
            country=task.country,
            user_id=task.user_id,
            order_index=task.order_index,
            is_required=task.is_required,
            estimated_days=task.estimated_days,
            created_at=task.created_at,
            updated_at=task.updated_at,
            unlocked=unlocked,
            documents=document_responses
        )
        task_responses.append(task_response)
    
    return task_responses


@router.post("/", response_model=Task)
def create_task(
    task_data: TaskCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Create a new task."""
    return create_task(session, task_data, current_user.id)


@router.post("/initialize", response_model=List[Task])
def initialize_default_tasks(
    country: str = Form(...),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Initialize default tasks for a user's country."""
    # Check if user already has tasks for this country
    existing_tasks = get_tasks_for_user(session, current_user.id, country)
    if existing_tasks:
        raise HTTPException(status_code=400, detail="Tasks already initialized for this country")
    
    return create_default_tasks_for_user(session, current_user.id, country)


@router.patch("/{task_id}", response_model=Task)
def update_task(
    task_id: int,
    task_update: TaskUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Update a task."""
    task = session.get(Task, task_id)
    if not task or task.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Update fields
    update_data = task_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)
    
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@router.patch("/{task_id}/status", response_model=Task)
def update_task_status(
    task_id: int,
    status: TaskStatus,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Update task status."""
    task = update_task_status(session, task_id, current_user.id, status)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Delete a task."""
    success = delete_task(session, task_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}


@router.post("/{task_id}/upload", response_model=DocumentResponse)
async def upload_document(
    task_id: int,
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Upload a document for a task."""
    
    # Validate file type
    if not is_valid_file_type(file.content_type or ""):
        raise HTTPException(
            status_code=400, 
            detail="Invalid file type. Only PDF and image files are allowed."
        )
    
    # Validate file size
    if file.size and file.size > get_max_file_size():
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size is 5MB."
        )
    
    # Save document
    document = await save_document_record(session, task_id, current_user.id, file)
    
    return DocumentResponse(
        id=document.id,
        filename=document.filename,
        original_filename=document.original_filename,
        file_path=document.file_path,
        file_size=document.file_size,
        content_type=document.content_type,
        task_id=document.task_id,
        user_id=document.user_id,
        created_at=document.created_at,
        download_url=f"/uploads/{document.file_path}"
    )


@router.get("/{task_id}/documents", response_model=List[DocumentResponse])
def get_task_documents(
    task_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get all documents for a task."""
    documents = get_task_documents(session, task_id, current_user.id)
    
    return [
        DocumentResponse(
            id=doc.id,
            filename=doc.filename,
            original_filename=doc.original_filename,
            file_path=doc.file_path,
            file_size=doc.file_size,
            content_type=doc.content_type,
            task_id=doc.task_id,
            user_id=doc.user_id,
            created_at=doc.created_at,
            download_url=f"/uploads/{doc.file_path}"
        )
        for doc in documents
    ]


@router.delete("/documents/{document_id}")
def delete_document(
    document_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Delete a document."""
    success = delete_document(session, document_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"message": "Document deleted successfully"}
