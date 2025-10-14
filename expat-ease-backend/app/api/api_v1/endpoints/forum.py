from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, func, Field, SQLModel
from typing import List, Optional
from datetime import datetime

from app.core.deps import get_current_user
from app.db.session import get_session
from app.models.user import User
from app.models.forum import Question, Answer, QuestionVote, AnswerVote, QuestionCategory

router = APIRouter()


def _user_summary(session: Session, user_id: int) -> dict:
    """Return a minimal public user summary dict for embedding in responses."""
    user = session.get(User, user_id)
    if not user:
        return {"id": user_id, "full_name": "Unknown", "profile_photo": None, "country": None}
    return {
        "id": user.id,
        "full_name": user.full_name or user.email,
        "profile_photo": user.profile_photo,
        "country": user.country,
    }


# Question endpoints
@router.get("/questions", response_model=List[dict])
def get_questions(
    category: Optional[QuestionCategory] = None,
    limit: int = 20,
    offset: int = 0,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get all questions with optional filtering by category"""
    query = select(Question)
    
    if category:
        query = query.where(Question.category == category)
    
    query = query.order_by(Question.created_at.desc()).offset(offset).limit(limit)
    questions = session.exec(query).all()
    
    result = []
    for question in questions:
        # Get answer count
        answer_count = session.exec(select(func.count(Answer.id)).where(Answer.question_id == question.id)).first()
        
        # Get vote counts
        upvotes = session.exec(select(func.count(QuestionVote.id)).where(
            QuestionVote.question_id == question.id,
            QuestionVote.is_upvote == True
        )).first()
        downvotes = session.exec(select(func.count(QuestionVote.id)).where(
            QuestionVote.question_id == question.id,
            QuestionVote.is_upvote == False
        )).first()
        
        result.append({
            "id": question.id,
            "title": question.title,
            "content": question.content,
            "category": question.category,
            "created_at": question.created_at,
            "updated_at": question.updated_at,
            "is_resolved": question.is_resolved,
            "view_count": question.view_count,
            "answer_count": answer_count,
            "upvotes": upvotes,
            "downvotes": downvotes,
            "user": _user_summary(session, question.user_id),
        })
    
    return result


class QuestionCreate(SQLModel):
    title: str = Field(max_length=200)
    content: str = Field(max_length=2000)
    category: QuestionCategory = Field(default=QuestionCategory.GENERAL)

@router.post("/questions", response_model=dict)
def create_question(
    question_data: QuestionCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Create a new question"""
    question = Question(
        title=question_data.title,
        content=question_data.content,
        category=question_data.category,
        user_id=current_user.id,
    )
    
    session.add(question)
    session.commit()
    session.refresh(question)
    
    return {
        "id": question.id,
        "title": question.title,
        "content": question.content,
        "category": question.category,
        "created_at": question.created_at,
        "is_resolved": question.is_resolved,
        "view_count": question.view_count,
        "answer_count": 0,
        "upvotes": 0,
        "downvotes": 0,
        "user": _user_summary(session, current_user.id),
    }


@router.get("/questions/{question_id}", response_model=dict)
def get_question(
    question_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get a specific question with its answers"""
    question = session.get(Question, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Increment view count
    question.view_count += 1
    session.add(question)
    session.commit()
    
    # Get answers
    answers = session.exec(
        select(Answer).where(Answer.question_id == question_id).order_by(Answer.created_at.asc())
    ).all()
    
    answer_list = []
    for answer in answers:
        # Get vote counts for answer
        upvotes = session.exec(select(func.count(AnswerVote.id)).where(
            AnswerVote.answer_id == answer.id,
            AnswerVote.is_upvote == True
        )).first()
        downvotes = session.exec(select(func.count(AnswerVote.id)).where(
            AnswerVote.answer_id == answer.id,
            AnswerVote.is_upvote == False
        )).first()
        
        answer_list.append({
            "id": answer.id,
            "content": answer.content,
            "created_at": answer.created_at,
            "updated_at": answer.updated_at,
            "is_accepted": answer.is_accepted,
            "upvotes": upvotes,
            "downvotes": downvotes,
            "user": _user_summary(session, answer.user_id),
        })
    
    # Get vote counts for question
    upvotes = session.exec(select(func.count(QuestionVote.id)).where(
        QuestionVote.question_id == question_id,
        QuestionVote.is_upvote == True
    )).first()
    downvotes = session.exec(select(func.count(QuestionVote.id)).where(
        QuestionVote.question_id == question_id,
        QuestionVote.is_upvote == False
    )).first()
    
    return {
        "id": question.id,
        "title": question.title,
        "content": question.content,
        "category": question.category,
        "created_at": question.created_at,
        "updated_at": question.updated_at,
        "is_resolved": question.is_resolved,
        "view_count": question.view_count,
        "answer_count": len(answer_list),
        "upvotes": upvotes,
        "downvotes": downvotes,
        "user": _user_summary(session, question.user_id),
        "answers": answer_list,
    }


# Answer endpoints
class AnswerCreate(SQLModel):
    content: str = Field(max_length=2000)

@router.post("/questions/{question_id}/answers", response_model=dict)
def create_answer(
    question_id: int,
    answer_data: AnswerCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Create a new answer to a question"""
    # Check if question exists
    question = session.get(Question, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    answer = Answer(
        content=answer_data.content,
        question_id=question_id,
        user_id=current_user.id
    )
    
    session.add(answer)
    session.commit()
    session.refresh(answer)
    
    return {
        "id": answer.id,
        "content": answer.content,
        "created_at": answer.created_at,
        "is_accepted": answer.is_accepted,
        "upvotes": 0,
        "downvotes": 0,
        "user": _user_summary(session, current_user.id),
    }


@router.post("/questions/{question_id}/vote")
def vote_question(
    question_id: int,
    is_upvote: bool,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Vote on a question (upvote or downvote)"""
    # Check if question exists
    question = session.get(Question, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Check if user already voted
    existing_vote = session.exec(select(QuestionVote).where(
        QuestionVote.question_id == question_id,
        QuestionVote.user_id == current_user.id
    )).first()
    
    if existing_vote:
        # Update existing vote
        existing_vote.is_upvote = is_upvote
        session.add(existing_vote)
    else:
        # Create new vote
        vote = QuestionVote(
            question_id=question_id,
            user_id=current_user.id,
            is_upvote=is_upvote
        )
        session.add(vote)
    
    session.commit()
    return {"message": "Vote recorded successfully"}


@router.post("/answers/{answer_id}/vote")
def vote_answer(
    answer_id: int,
    is_upvote: bool,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Vote on an answer (upvote or downvote)"""
    # Check if answer exists
    answer = session.get(Answer, answer_id)
    if not answer:
        raise HTTPException(status_code=404, detail="Answer not found")
    
    # Check if user already voted
    existing_vote = session.exec(select(AnswerVote).where(
        AnswerVote.answer_id == answer_id,
        AnswerVote.user_id == current_user.id
    )).first()
    
    if existing_vote:
        # Update existing vote
        existing_vote.is_upvote = is_upvote
        session.add(existing_vote)
    else:
        # Create new vote
        vote = AnswerVote(
            answer_id=answer_id,
            user_id=current_user.id,
            is_upvote=is_upvote
        )
        session.add(vote)
    
    session.commit()
    return {"message": "Vote recorded successfully"}


@router.post("/answers/{answer_id}/accept")
def accept_answer(
    answer_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Accept an answer (only question author can do this)"""
    answer = session.get(Answer, answer_id)
    if not answer:
        raise HTTPException(status_code=404, detail="Answer not found")
    
    # Check if current user is the question author
    question = session.get(Question, answer.question_id)
    if question.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the question author can accept answers")
    
    # Unaccept all other answers for this question
    other_answers = session.exec(select(Answer).where(
        Answer.question_id == answer.question_id,
        Answer.id != answer_id
    )).all()
    
    for other_answer in other_answers:
        other_answer.is_accepted = False
        session.add(other_answer)
    
    # Accept this answer
    answer.is_accepted = True
    
    # Mark question as resolved
    question.is_resolved = True
    
    session.add(answer)
    session.add(question)
    session.commit()
    
    return {"message": "Answer accepted successfully"}
