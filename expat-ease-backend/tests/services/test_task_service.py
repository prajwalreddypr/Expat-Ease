import pytest

from app.models.task import TaskStatus
from app.services import tasks


def task_values(title="First task", order_index=1):
    return {
        "title": title,
        "description": "Description",
        "priority": "medium",
        "country": "France",
        "order_index": order_index,
        "is_required": True,
        "estimated_days": 3,
    }


def test_task_unlocking_follows_previous_task_status(session, user_factory):
    user = user_factory()
    first = tasks.create_task(session, user.id, task_values())
    tasks.create_task(session, user.id, task_values("Second task", 2))

    initial = tasks.list_tasks(session, user.id, "France")
    assert [view.unlocked for view in initial] == [True, False]

    tasks.update_task_status(session, first.id, user.id, TaskStatus.COMPLETED)
    updated = tasks.list_tasks(session, user.id, "France")
    assert [view.unlocked for view in updated] == [True, True]


def test_task_mutations_enforce_ownership(session, user_factory):
    owner = user_factory()
    other = user_factory(email="other@example.com")
    task = tasks.create_task(session, other.id, task_values())

    with pytest.raises(tasks.TaskNotFoundError):
        tasks.update_task(session, task.id, owner.id, {"title": "Changed"})
    with pytest.raises(tasks.TaskNotFoundError):
        tasks.update_task_status(session, task.id, owner.id, TaskStatus.COMPLETED)
    with pytest.raises(tasks.TaskNotFoundError):
        tasks.delete_task(session, task.id, owner.id)


def test_default_tasks_cannot_be_initialized_twice(session, user_factory):
    user = user_factory()
    created = tasks.initialize_tasks(session, user.id, "Germany")

    assert len(created) == 8
    assert created[0].title == "Obtain Visa/Permit"
    with pytest.raises(tasks.TasksAlreadyInitializedError):
        tasks.initialize_tasks(session, user.id, "Germany")


def test_task_update_refreshes_updated_timestamp(session, user_factory):
    user = user_factory()
    task = tasks.create_task(session, user.id, task_values())
    original_updated_at = task.updated_at

    updated = tasks.update_task(session, task.id, user.id, {"title": "Updated title"})

    assert updated.title == "Updated title"
    assert updated.updated_at >= original_updated_at
