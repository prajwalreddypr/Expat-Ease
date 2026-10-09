from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlmodel import Session

from app.core.deps import get_current_user
from app.db.session import get_session
from app.models.task import Task, TaskStatus
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.document import DocumentResponse
from app.schemas.task import TaskCreate, TaskRead, TaskResponse, TaskUpdate
from app.services import tasks as task_service

router = APIRouter()


def _to_response(view: task_service.TaskView) -> TaskResponse:
    task = view.task
    return TaskResponse(
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
        unlocked=view.unlocked,
        documents=[],
    )


@router.get("/", response_model=List[TaskResponse])
def get_tasks(
    country: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> List[TaskResponse]:
    return [
        _to_response(view) for view in task_service.list_tasks(session, current_user.id, country)
    ]


@router.post("/", response_model=TaskRead)
def create_task_endpoint(
    task_data: TaskCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> Task:
    return task_service.create_task(session, current_user.id, task_data.model_dump())


@router.post("/initialize", response_model=List[TaskRead])
def initialize_default_tasks(
    country: str = Form(...),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> List[Task]:
    try:
        return task_service.initialize_tasks(session, current_user.id, country)
    except task_service.TasksAlreadyInitializedError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tasks already initialized for this country",
        ) from exc


@router.patch("/{task_id}", response_model=TaskRead)
def update_task(
    task_id: int,
    task_update: TaskUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> Task:
    try:
        return task_service.update_task(
            session, task_id, current_user.id, task_update.model_dump(exclude_unset=True)
        )
    except task_service.TaskNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Task not found") from exc


@router.patch("/{task_id}/status", response_model=TaskRead)
def update_task_status_endpoint(
    task_id: int,
    task_status: TaskStatus = Query(alias="status"),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> Task:
    try:
        return task_service.update_task_status(session, task_id, current_user.id, task_status)
    except task_service.TaskNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Task not found") from exc


@router.delete("/{task_id}", response_model=MessageResponse)
def delete_task_endpoint(
    task_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> dict:
    try:
        task_service.delete_task(session, task_id, current_user.id)
    except task_service.TaskNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Task not found") from exc
    return {"message": "Task deleted successfully"}


@router.post("/{task_id}/upload", response_model=DocumentResponse)
async def upload_document(
    task_id: int,
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Task-attached documents are temporarily disabled",
    )


@router.get("/{task_id}/documents", response_model=List[DocumentResponse])
def get_task_documents_endpoint(
    task_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Task-attached documents are temporarily disabled",
    )


@router.delete("/documents/{document_id}", response_model=MessageResponse)
def delete_document_endpoint(
    document_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Task-attached documents are temporarily disabled",
    )
