from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.core.deps import get_current_user
from app.db.session import get_session
from app.models.forum import QuestionCategory
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.forum import (
    AnswerCreate,
    AnswerCreated,
    QuestionCreate,
    QuestionCreated,
    QuestionDetail,
    QuestionSummary,
)
from app.services import forum as forum_service

router = APIRouter()


@router.get("/questions", response_model=List[QuestionSummary])
def get_questions(
    category: Optional[QuestionCategory] = None,
    limit: int = 20,
    offset: int = 0,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return forum_service.list_questions(session, category, limit, offset)


@router.post("/questions", response_model=QuestionCreated)
def create_question(
    question_data: QuestionCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return forum_service.create_question(
        session,
        current_user.id,
        question_data.title,
        question_data.content,
        question_data.category,
    )


@router.get("/questions/{question_id}", response_model=QuestionDetail)
def get_question(
    question_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    try:
        return forum_service.get_question(session, question_id)
    except forum_service.QuestionNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Question not found") from exc


@router.post("/questions/{question_id}/answers", response_model=AnswerCreated)
def create_answer(
    question_id: int,
    answer_data: AnswerCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    try:
        return forum_service.create_answer(
            session, question_id, current_user.id, answer_data.content
        )
    except forum_service.QuestionNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Question not found") from exc


@router.post("/questions/{question_id}/vote", response_model=MessageResponse)
def vote_question(
    question_id: int,
    is_upvote: bool,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    try:
        forum_service.vote_question(session, question_id, current_user.id, is_upvote)
    except forum_service.QuestionNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Question not found") from exc
    return {"message": "Vote recorded successfully"}


@router.post("/answers/{answer_id}/vote", response_model=MessageResponse)
def vote_answer(
    answer_id: int,
    is_upvote: bool,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    try:
        forum_service.vote_answer(session, answer_id, current_user.id, is_upvote)
    except forum_service.AnswerNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Answer not found") from exc
    return {"message": "Vote recorded successfully"}


@router.post("/answers/{answer_id}/accept", response_model=MessageResponse)
def accept_answer(
    answer_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    try:
        forum_service.accept_answer(session, answer_id, current_user.id)
    except forum_service.AnswerNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Answer not found") from exc
    except forum_service.AnswerAcceptanceForbiddenError as exc:
        raise HTTPException(
            status_code=403, detail="Only the question author can accept answers"
        ) from exc
    return {"message": "Answer accepted successfully"}
