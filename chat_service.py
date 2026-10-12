from database.database import SessionLocal
from database.models import ChatHistory


def save_chat(
    user_id,
    question,
    answer
):

    db = SessionLocal()

    chat = ChatHistory(
        user_id=user_id,
        question=question,
        answer=answer
    )

    db.add(chat)
    db.commit()

    db.close()