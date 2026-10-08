def test_question_vote_counts_use_boolean_database_predicates(client, auth_headers):
    created = client.post(
        "/api/v1/forum/questions",
        headers=auth_headers,
        json={
            "title": "How do I validate my visa?",
            "content": "Which documents should I prepare?",
            "category": "legal",
        },
    )
    assert created.status_code == 200
    question_id = created.json()["id"]

    vote = client.post(
        f"/api/v1/forum/questions/{question_id}/vote?is_upvote=true",
        headers=auth_headers,
    )
    assert vote.status_code == 200
    assert vote.json() == {"message": "Vote recorded successfully"}

    questions = client.get("/api/v1/forum/questions", headers=auth_headers)
    assert questions.status_code == 200
    assert questions.json()[0]["title"] == "How do I validate my visa?"
    assert questions.json()[0]["upvotes"] == 1
    assert questions.json()[0]["downvotes"] == 0
