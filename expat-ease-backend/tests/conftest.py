import os
from collections.abc import Callable, Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

os.environ["ENVIRONMENT"] = "test"
os.environ["DATABASE_URL"] = "sqlite://"
os.environ["SECRET_KEY"] = "test-secret-key"
os.environ["DEV_RETURN_RESET_TOKEN"] = "false"

from app.core.passwords import hash_password  # noqa: E402
from app.db import base  # noqa: E402, F401
from app.db.session import get_session  # noqa: E402
from app.main import app  # noqa: E402
from app.models.password_reset_token import PasswordResetToken  # noqa: E402, F401
from app.models.user import User  # noqa: E402


@pytest.fixture
def session() -> Generator[Session, None, None]:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)

    with Session(engine) as test_session:
        yield test_session

    SQLModel.metadata.drop_all(engine)


@pytest.fixture
def client(session: Session) -> Generator[TestClient, None, None]:
    def override_session() -> Generator[Session, None, None]:
        yield session

    app.dependency_overrides[get_session] = override_session
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def user_factory(session: Session) -> Callable[..., User]:
    def create_user(
        *,
        email: str = "prajwal@example.com",
        password: str = "ValidPass123!",
        full_name: str = "Prajwal Reddy",
        is_active: bool = True,
        settlement_country: str = "France",
        country_selected: bool = True,
    ) -> User:
        user = User(
            email=email,
            full_name=full_name,
            hashed_password=hash_password(password),
            is_active=is_active,
            settlement_country=settlement_country,
            country_selected=country_selected,
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        return user

    return create_user


@pytest.fixture
def auth_headers(client: TestClient, user_factory: Callable[..., User]) -> dict[str, str]:
    user_factory()
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "prajwal@example.com", "password": "ValidPass123!"},
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
