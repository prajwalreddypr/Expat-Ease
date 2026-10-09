from typing import List, Optional

from sqlmodel import Session, func, select

from app.models.forum import Answer, AnswerVote, Question, QuestionCategory, QuestionVote
from app.models.user import User


class QuestionNotFoundError(Exception):
    pass


class AnswerNotFoundError(Exception):
    pass


class AnswerAcceptanceForbiddenError(Exception):
    pass


def list_questions(
    session: Session,
    category: Optional[QuestionCategory],
    limit: int,
    offset: int,
) -> List[dict]:
    query = select(Question)
    if category:
        query = query.where(Question.category == category)
    questions = session.exec(
        query.order_by(Question.created_at.desc()).offset(offset).limit(limit)
    ).all()
    return [_question_summary(session, question) for question in questions]


def create_question(
    session: Session,
    user_id: int,
    title: str,
    content: str,
    category: QuestionCategory,
) -> dict:
    question = Question(title=title, content=content, category=category, user_id=user_id)
    session.add(question)
    session.commit()
    session.refresh(question)
    return _question_summary(session, question)


def get_question(session: Session, question_id: int) -> dict:
    question = session.get(Question, question_id)
    if not question:
        raise QuestionNotFoundError

    question.view_count += 1
    session.add(question)
    session.commit()
    session.refresh(question)

    answers = session.exec(
        select(Answer).where(Answer.question_id == question_id).order_by(Answer.created_at.asc())
    ).all()
    result = _question_summary(session, question)
    result["answers"] = [_answer_summary(session, answer) for answer in answers]
    return result


def create_answer(session: Session, question_id: int, user_id: int, content: str) -> dict:
    if not session.get(Question, question_id):
        raise QuestionNotFoundError
    answer = Answer(content=content, question_id=question_id, user_id=user_id)
    session.add(answer)
    session.commit()
    session.refresh(answer)
    return _answer_summary(session, answer)


def vote_question(session: Session, question_id: int, user_id: int, is_upvote: bool) -> None:
    if not session.get(Question, question_id):
        raise QuestionNotFoundError
    vote = session.exec(
        select(QuestionVote).where(
            QuestionVote.question_id == question_id, QuestionVote.user_id == user_id
        )
    ).first()
    if vote:
        vote.is_upvote = is_upvote
    else:
        vote = QuestionVote(question_id=question_id, user_id=user_id, is_upvote=is_upvote)
    session.add(vote)
    session.commit()


def vote_answer(session: Session, answer_id: int, user_id: int, is_upvote: bool) -> None:
    if not session.get(Answer, answer_id):
        raise AnswerNotFoundError
    vote = session.exec(
        select(AnswerVote).where(AnswerVote.answer_id == answer_id, AnswerVote.user_id == user_id)
    ).first()
    if vote:
        vote.is_upvote = is_upvote
    else:
        vote = AnswerVote(answer_id=answer_id, user_id=user_id, is_upvote=is_upvote)
    session.add(vote)
    session.commit()


def accept_answer(session: Session, answer_id: int, user_id: int) -> None:
    answer = session.get(Answer, answer_id)
    if not answer:
        raise AnswerNotFoundError
    question = session.get(Question, answer.question_id)
    if not question:
        raise QuestionNotFoundError
    if question.user_id != user_id:
        raise AnswerAcceptanceForbiddenError

    other_answers = session.exec(
        select(Answer).where(Answer.question_id == answer.question_id, Answer.id != answer_id)
    ).all()
    for other_answer in other_answers:
        other_answer.is_accepted = False
        session.add(other_answer)
    answer.is_accepted = True
    question.is_resolved = True
    session.add(answer)
    session.add(question)
    session.commit()


def _question_summary(session: Session, question: Question) -> dict:
    return {
        "id": question.id,
        "title": question.title,
        "content": question.content,
        "category": question.category,
        "created_at": question.created_at,
        "updated_at": question.updated_at,
        "is_resolved": question.is_resolved,
        "view_count": question.view_count,
        "answer_count": _count(session, Answer.id, Answer.question_id == question.id),
        "upvotes": _count(
            session,
            QuestionVote.id,
            QuestionVote.question_id == question.id,
            QuestionVote.is_upvote.is_(True),
        ),
        "downvotes": _count(
            session,
            QuestionVote.id,
            QuestionVote.question_id == question.id,
            QuestionVote.is_upvote.is_(False),
        ),
        "user": _user_summary(session, question.user_id),
    }


def _answer_summary(session: Session, answer: Answer) -> dict:
    return {
        "id": answer.id,
        "content": answer.content,
        "created_at": answer.created_at,
        "updated_at": answer.updated_at,
        "is_accepted": answer.is_accepted,
        "upvotes": _count(
            session,
            AnswerVote.id,
            AnswerVote.answer_id == answer.id,
            AnswerVote.is_upvote.is_(True),
        ),
        "downvotes": _count(
            session,
            AnswerVote.id,
            AnswerVote.answer_id == answer.id,
            AnswerVote.is_upvote.is_(False),
        ),
        "user": _user_summary(session, answer.user_id),
    }


def _count(session: Session, column, *criteria) -> int:
    return session.exec(select(func.count(column)).where(*criteria)).one()


def _user_summary(session: Session, user_id: int) -> dict:
    user = session.get(User, user_id)
    if not user:
        return {"id": user_id, "full_name": "Unknown", "profile_photo": None, "country": None}
    return {
        "id": user.id,
        "full_name": user.full_name or user.email,
        "profile_photo": user.profile_photo,
        "country": user.country,
    }
