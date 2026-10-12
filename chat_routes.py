from fastapi import APIRouter
from fastapi import Depends

from auth.dependencies import get_current_user

from database.database import SessionLocal
from database.models import User
from database.models import ChatHistory

router = APIRouter(
    tags=["Chat History"]
)


@router.get("/chat-history")
def get_chat_history(
    user=Depends(get_current_user)
):

    db = SessionLocal()

    db_user = (
        db.query(User)
        .filter(
            User.username == user["sub"]
        )
        .first()
    )

    chats = (
        db.query(ChatHistory)
        .filter(
            ChatHistory.user_id == db_user.id
        )
        .order_by(
            ChatHistory.created_at.desc()
        )
        .all()
    )

    result = []

    for chat in chats:

        result.append(
            {
                "id": chat.id,
                "question": chat.question,
                "answer": chat.answer,
                "created_at": chat.created_at
            }
        )

    db.close()

    return result
@router.delete("/chat-history")
def clear_chat_history(
    user=Depends(get_current_user)
):

    db = SessionLocal()

    db_user = (
        db.query(User)
        .filter(
            User.username == user["sub"]
        )
        .first()
    )

    db.query(ChatHistory).filter(
        ChatHistory.user_id == db_user.id
    ).delete()

    db.commit()

    db.close()

    return {
        "message": "Chat history cleared successfully"
    }