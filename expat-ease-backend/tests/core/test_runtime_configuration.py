from app.core.config import Settings, cors_origins


def test_cors_origins_are_normalized_and_deduplicated():
    config = Settings(
        _env_file=None,
        FRONTEND_URL="https://custom.example/",
        FRONTEND_URLS="https://second.example, https://custom.example/",
    )

    origins = cors_origins(config)

    assert origins[0:2] == ["https://custom.example", "https://second.example"]
    assert origins.count("https://custom.example") == 1
    assert "http://localhost:5173" in origins


def test_allowed_hosts_are_not_treated_as_browser_origins():
    config = Settings(
        _env_file=None,
        FRONTEND_URL="https://frontend.example",
        ALLOWED_HOSTS=["api.example.com"],
    )

    assert "api.example.com" not in cors_origins(config)
