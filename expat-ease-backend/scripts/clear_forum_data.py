from pathlib import Path
import sys

# ensure repo root on path
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from sqlmodel import Session, select
from app.db.session import engine
# ensure all models are imported so mappers are configured (User is referenced by relationships)
import app.db.base  # registers all models
from app.models.forum import Question, Answer, QuestionVote, AnswerVote


def count_rows():
    with Session(engine) as session:
        q_count = len(session.exec(select(Question)).all())
        a_count = len(session.exec(select(Answer)).all())
        qv_count = len(session.exec(select(QuestionVote)).all())
        av_count = len(session.exec(select(AnswerVote)).all())
    return q_count, a_count, qv_count, av_count


def clear_forum():
    print('Counting rows before cleanup...')
    q_count, a_count, qv_count, av_count = count_rows()
    print(f'Questions: {q_count}, Answers: {a_count}, QuestionVotes: {qv_count}, AnswerVotes: {av_count}')

    with Session(engine) as session:
        # Delete votes first (foreign key dependencies)
        print('Deleting answer votes...')
        avs = session.exec(select(AnswerVote)).all()
        for v in avs:
            session.delete(v)
        print('Deleting question votes...')
        qvs = session.exec(select(QuestionVote)).all()
        for v in qvs:
            session.delete(v)
        print('Deleting answers...')
        ans = session.exec(select(Answer)).all()
        for a in ans:
            session.delete(a)
        print('Deleting questions...')
        qs = session.exec(select(Question)).all()
        for q in qs:
            session.delete(q)
        session.commit()

    print('Counting rows after cleanup...')
    q_count, a_count, qv_count, av_count = count_rows()
    print(f'Questions: {q_count}, Answers: {a_count}, QuestionVotes: {qv_count}, AnswerVotes: {av_count}')


if __name__ == '__main__':
    clear_forum()
