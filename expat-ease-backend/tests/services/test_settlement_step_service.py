from sqlmodel import select

from app.models.document import Document
from app.models.settlement_step import SettlementStep
from app.services import settlement_steps

TEMPLATES = [
    {"step_number": 1, "title": "First", "description": "First step", "is_unlocked": True},
    {
        "step_number": 2,
        "title": "Second",
        "description": "Second step",
        "is_unlocked": False,
    },
]


class FakeStorage:
    def __init__(self) -> None:
        self.deletions = []

    def delete(self, file_url, content_type):
        self.deletions.append((file_url, content_type))


def test_skipping_step_unlocks_next_step(session, user_factory):
    user = user_factory()
    bundles = settlement_steps.initialize_steps(session, user.id, TEMPLATES)

    updated = settlement_steps.update_step(
        session,
        user.id,
        bundles[0].step.id,
        is_completed=None,
        is_skipped=True,
        skip_reason="Already completed abroad",
        notes=None,
    )

    assert updated.step.is_skipped is True
    assert updated.step.is_completed is False
    assert updated.step.skip_reason == "Already completed abroad"
    next_step = session.exec(select(SettlementStep).where(SettlementStep.step_number == 2)).one()
    assert next_step.is_unlocked is True


def test_reset_replaces_only_users_steps_and_cleans_documents(session, user_factory):
    user = user_factory()
    other = user_factory(email="other@example.com")
    user_steps = settlement_steps.initialize_steps(session, user.id, TEMPLATES)
    other_steps = settlement_steps.initialize_steps(session, other.id, TEMPLATES)
    document = Document(
        filename="stored.pdf",
        original_filename="document.pdf",
        file_path="https://files.example/document.pdf",
        file_size=10,
        content_type="application/pdf",
        settlement_step_id=user_steps[0].step.id,
        user_id=user.id,
    )
    session.add(document)
    session.commit()
    old_step_ids = {bundle.step.id for bundle in user_steps}
    storage = FakeStorage()

    reset = settlement_steps.reset_steps(session, user.id, TEMPLATES, storage)

    assert old_step_ids.isdisjoint({bundle.step.id for bundle in reset})
    assert session.exec(select(Document).where(Document.user_id == user.id)).all() == []
    assert session.get(SettlementStep, other_steps[0].step.id) is not None
    assert storage.deletions == [("https://files.example/document.pdf", "application/pdf")]


def test_update_rejects_another_users_step(session, user_factory):
    owner = user_factory()
    other = user_factory(email="other@example.com")
    other_step = settlement_steps.initialize_steps(session, other.id, TEMPLATES)[0].step

    try:
        settlement_steps.update_step(
            session,
            owner.id,
            other_step.id,
            is_completed=True,
            is_skipped=None,
            skip_reason=None,
            notes=None,
        )
    except settlement_steps.SettlementStepNotFoundError:
        pass
    else:
        raise AssertionError("Expected cross-user update to be rejected")
