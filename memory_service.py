from database.database import SessionLocal
from database.models import ChatMessage


def get_conversation_context(
    session_id: int,
    limit: int = 6
):

    db = SessionLocal()

    messages = (
        db.query(ChatMessage)
        .filter(
            ChatMessage.session_id == session_id
        )
        .order_by(
            ChatMessage.id.desc()
        )
        .limit(limit)
        .all()
    )

    db.close()

    messages.reverse()

    context = ""

    for msg in messages:

        if msg.role == "user":

            context += (
                f"User: {msg.content}\n"
            )

        else:

            context += (
                f"Assistant: {msg.content}\n"
            )

    return context