from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status as http_status
from sqlmodel import Session
from app.db.session import get_session
from app.core.deps import get_current_user
from app.models.user import User
from app.models.task import Task, TaskCreate, TaskUpdate, TaskResponse, TaskStatus
from app.models.document import DocumentResponse
import app.crud.crud_task as task_crud
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
        tasks = task_crud.get_tasks_for_user(session, current_user.id, country)
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
        
        # Documents attached to tasks are temporarily disabled (schema mismatch)
        document_responses: List[DocumentResponse] = []
        
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
def create_task_endpoint(
    task_data: TaskCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Create a new task."""
    return task_crud.create_task(session, task_data, current_user.id)


@router.post("/initialize", response_model=List[Task])
def initialize_default_tasks(
    country: str = Form(...),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Initialize default tasks for a user's country."""
    # Check if user already has tasks for this country
    existing_tasks = task_crud.get_tasks_for_user(session, current_user.id, country)
    if existing_tasks:
        raise HTTPException(status_code=400, detail="Tasks already initialized for this country")
    
    return task_crud.create_default_tasks_for_user(session, current_user.id, country)


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
def update_task_status_endpoint(
    task_id: int,
    status: TaskStatus,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Update task status."""
    task = task_crud.update_task_status(session, task_id, current_user.id, status)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.delete("/{task_id}")
def delete_task_endpoint(
    task_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Delete a task."""
    success = task_crud.delete_task(session, task_id, current_user.id)
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
    """Upload a document for a task (temporarily disabled)."""
    raise HTTPException(status_code=http_status.HTTP_501_NOT_IMPLEMENTED,
                        detail="Task-attached documents are temporarily disabled")


@router.get("/{task_id}/documents", response_model=List[DocumentResponse])
def get_task_documents_endpoint(
    task_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get all documents for a task (temporarily disabled)."""
    raise HTTPException(status_code=http_status.HTTP_501_NOT_IMPLEMENTED,
                        detail="Task-attached documents are temporarily disabled")


@router.delete("/documents/{document_id}")
def delete_document_endpoint(
    document_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Delete a task document (temporarily disabled)."""
    raise HTTPException(status_code=http_status.HTTP_501_NOT_IMPLEMENTED,
                        detail="Task-attached documents are temporarily disabled")
