def test_create_and_list_task_with_concrete_values(client, auth_headers):
    created = client.post(
        "/api/v1/tasks/",
        headers=auth_headers,
        json={
            "title": "Register at city hall",
            "description": "Bring passport and proof of address",
            "priority": "high",
            "country": "France",
            "order_index": 3,
            "is_required": True,
            "estimated_days": 2,
        },
    )

    assert created.status_code == 200
    task = created.json()
    assert task["id"] == 1
    assert task["title"] == "Register at city hall"
    assert task["status"] == "pending"
    assert task["priority"] == "high"
    assert task["country"] == "France"
    assert task["order_index"] == 3
    assert task["estimated_days"] == 2
    assert set(task) == {
        "id",
        "title",
        "description",
        "status",
        "priority",
        "country",
        "user_id",
        "order_index",
        "is_required",
        "estimated_days",
        "created_at",
        "updated_at",
    }

    listed = client.get("/api/v1/tasks/?country=France", headers=auth_headers)
    assert listed.status_code == 200
    assert len(listed.json()) == 1
    assert listed.json()[0]["title"] == "Register at city hall"
    assert listed.json()[0]["unlocked"] is True


def test_user_cannot_update_another_users_task(client, auth_headers, session, user_factory):
    from app.models.task import Task

    other_user = user_factory(email="task.owner@example.com")
    task = Task(
        title="Private task",
        country="Germany",
        user_id=other_user.id,
    )
    session.add(task)
    session.commit()
    session.refresh(task)

    response = client.patch(
        f"/api/v1/tasks/{task.id}",
        headers=auth_headers,
        json={"title": "Changed title"},
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Task not found"}
