from app.main import app


def _response_schema(path: str, method: str = "get") -> dict:
    return app.openapi()["paths"][path][method]["responses"]["200"]["content"]["application/json"][
        "schema"
    ]


def test_routes_publish_explicit_transport_schemas():
    login_schema = _response_schema("/api/v1/auth/login", "post")
    task_schema = _response_schema("/api/v1/tasks/", "post")
    forum_list_schema = _response_schema("/api/v1/forum/questions")
    forgot_password_schema = _response_schema("/api/v1/auth/forgot-password", "post")

    assert login_schema["$ref"].endswith("/Token")
    assert task_schema["$ref"].endswith("/TaskRead")
    assert forum_list_schema["items"]["$ref"].endswith("/QuestionSummary")
    assert forgot_password_schema["$ref"].endswith("/PasswordResetRequestResponse")
