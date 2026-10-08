def test_get_steps_initializes_country_specific_workflow(client, auth_headers):
    response = client.get("/api/v1/settlement-steps/", headers=auth_headers)

    assert response.status_code == 200
    steps = response.json()
    assert len(steps) == 7
    assert [step["step_number"] for step in steps] == list(range(1, 8))
    assert steps[0]["title"] == "Validate Your Visa"
    assert steps[0]["is_unlocked"] is True
    assert steps[1]["title"] == "Get a Local SIM Card"
    assert steps[1]["is_unlocked"] is False
    assert steps[0]["documents"] == []


def test_completing_step_unlocks_next_step(client, auth_headers):
    steps = client.get("/api/v1/settlement-steps/", headers=auth_headers).json()

    update = client.patch(
        f"/api/v1/settlement-steps/{steps[0]['id']}",
        headers=auth_headers,
        json={"is_completed": True, "notes": "Visa validated on October 9"},
    )

    assert update.status_code == 200
    updated_step = update.json()
    assert updated_step["title"] == "Validate Your Visa"
    assert updated_step["is_completed"] is True
    assert updated_step["is_skipped"] is False
    assert updated_step["notes"] == "Visa validated on October 9"

    refreshed_steps = client.get(
        "/api/v1/settlement-steps/", headers=auth_headers
    ).json()
    assert refreshed_steps[1]["title"] == "Get a Local SIM Card"
    assert refreshed_steps[1]["is_unlocked"] is True


def test_user_cannot_update_another_users_step(client, auth_headers, session, user_factory):
    other_user = user_factory(email="other@example.com", settlement_country="Germany")
    from app.models.settlement_step import SettlementStep

    other_step = SettlementStep(
        user_id=other_user.id,
        step_number=1,
        title="Find Permanent Accommodation",
        description="Secure an address",
        is_unlocked=True,
    )
    session.add(other_step)
    session.commit()
    session.refresh(other_step)

    response = client.patch(
        f"/api/v1/settlement-steps/{other_step.id}",
        headers=auth_headers,
        json={"is_completed": True},
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Settlement step not found"}
