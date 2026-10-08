def test_health_reports_application_status(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "healthy",
        "message": "Expat Ease API is running",
    }
