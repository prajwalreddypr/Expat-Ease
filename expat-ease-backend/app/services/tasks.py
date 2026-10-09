from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional

from sqlmodel import Session, select

from app.models.task import Task, TaskStatus

DEFAULT_TASKS = [
    (
        "Obtain Visa/Permit",
        "Apply for and obtain the necessary visa or residence permit",
        "high",
        1,
        30,
    ),
    (
        "Register with Local Authorities",
        "Register your address with local government offices",
        "high",
        2,
        7,
    ),
    ("Open Bank Account", "Open a local bank account for financial transactions", "medium", 3, 14),
    ("Get Health Insurance", "Obtain health insurance coverage", "high", 4, 7),
    ("Find Housing", "Secure permanent accommodation", "high", 5, 30),
    ("Get Tax ID", "Obtain tax identification number", "medium", 6, 14),
    ("Register for Utilities", "Set up electricity, water, internet services", "medium", 7, 7),
    ("Learn Local Language", "Enroll in language classes or self-study", "low", 8, 90),
]


class TaskNotFoundError(Exception):
    pass


class TasksAlreadyInitializedError(Exception):
    pass


@dataclass(frozen=True)
class TaskView:
    task: Task
    unlocked: bool


def list_tasks(session: Session, user_id: int, country: Optional[str] = None) -> List[TaskView]:
    query = select(Task).where(Task.user_id == user_id)
    if country:
        query = query.where(Task.country == country)
    tasks = list(session.exec(query.order_by(Task.order_index, Task.created_at)).all())
    return [
        TaskView(task=task, unlocked=index == 0 or tasks[index - 1].status == TaskStatus.COMPLETED)
        for index, task in enumerate(tasks)
    ]


def create_task(session: Session, user_id: int, values: dict) -> Task:
    task = Task(**values, user_id=user_id)
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


def initialize_tasks(session: Session, user_id: int, country: str) -> List[Task]:
    if list_tasks(session, user_id, country):
        raise TasksAlreadyInitializedError
    tasks = [
        Task(
            title=title,
            description=description,
            priority=priority,
            country=country,
            user_id=user_id,
            order_index=order_index,
            estimated_days=estimated_days,
        )
        for title, description, priority, order_index, estimated_days in DEFAULT_TASKS
    ]
    session.add_all(tasks)
    session.commit()
    for task in tasks:
        session.refresh(task)
    return tasks


def update_task(session: Session, task_id: int, user_id: int, values: dict) -> Task:
    task = _owned_task(session, task_id, user_id)
    for field, value in values.items():
        setattr(task, field, value)
    if values:
        task.updated_at = datetime.utcnow()
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


def update_task_status(session: Session, task_id: int, user_id: int, status: TaskStatus) -> Task:
    return update_task(session, task_id, user_id, {"status": status})


def delete_task(session: Session, task_id: int, user_id: int) -> None:
    task = _owned_task(session, task_id, user_id)
    session.delete(task)
    session.commit()


def _owned_task(session: Session, task_id: int, user_id: int) -> Task:
    task = session.get(Task, task_id)
    if not task or task.user_id != user_id:
        raise TaskNotFoundError
    return task
