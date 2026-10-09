import pytest
from sqlmodel import func, select

from app.models.forum import Answer, QuestionCategory, QuestionVote
from app.services import forum


def test_changing_question_vote_updates_existing_row(session, user_factory):
    user = user_factory()
    question = forum.create_question(
        session, user.id, "Visa documents", "What should I bring?", QuestionCategory.LEGAL
    )

    forum.vote_question(session, question["id"], user.id, True)
    forum.vote_question(session, question["id"], user.id, False)

    votes = session.exec(
        select(QuestionVote).where(
            QuestionVote.question_id == question["id"], QuestionVote.user_id == user.id
        )
    ).all()
    assert len(votes) == 1
    assert votes[0].is_upvote is False


def test_only_question_author_can_accept_answer(session, user_factory):
    author = user_factory()
    contributor = user_factory(email="contributor@example.com")
    question = forum.create_question(
        session, author.id, "Bank account", "Which documents?", QuestionCategory.BANKING
    )
    answer = forum.create_answer(session, question["id"], contributor.id, "Bring your passport")

    with pytest.raises(forum.AnswerAcceptanceForbiddenError):
        forum.accept_answer(session, answer["id"], contributor.id)

    forum.accept_answer(session, answer["id"], author.id)
    detail = forum.get_question(session, question["id"])
    assert detail["is_resolved"] is True
    assert detail["answers"][0]["is_accepted"] is True


def test_accepting_new_answer_unaccepts_previous_answer(session, user_factory):
    author = user_factory()
    contributor = user_factory(email="contributor@example.com")
    question = forum.create_question(
        session, author.id, "Housing", "Where should I search?", QuestionCategory.HOUSING
    )
    first = forum.create_answer(session, question["id"], contributor.id, "Try option one")
    second = forum.create_answer(session, question["id"], contributor.id, "Try option two")

    forum.accept_answer(session, first["id"], author.id)
    forum.accept_answer(session, second["id"], author.id)

    accepted_count = session.exec(
        select(func.count(Answer.id)).where(
            Answer.question_id == question["id"], Answer.is_accepted.is_(True)
        )
    ).one()
    assert accepted_count == 1
    assert session.get(Answer, second["id"]).is_accepted is True


def test_missing_entities_raise_domain_errors(session, user_factory):
    user = user_factory()
    with pytest.raises(forum.QuestionNotFoundError):
        forum.get_question(session, 999)
    with pytest.raises(forum.QuestionNotFoundError):
        forum.create_answer(session, 999, user.id, "No question")
    with pytest.raises(forum.AnswerNotFoundError):
        forum.vote_answer(session, 999, user.id, True)
