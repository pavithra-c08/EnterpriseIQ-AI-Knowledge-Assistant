from fastapi import APIRouter
from fastapi import Depends

from auth.dependencies import get_current_user

from database.database import SessionLocal
from database.models import User
from database.models import ChatSession

from pydantic import BaseModel

from database.models import ChatMessage

from services.memory_service import (
    get_conversation_context
)

from services.rag_service import (
    answer_question
)
router = APIRouter(
    tags=["Chat Sessions"]
)


class SessionCreate(BaseModel):
    title: str

class SessionUpdate(BaseModel):
    title: str

class AskRequest(BaseModel):
    question: str


@router.post("/sessions")
def create_session(
    data: SessionCreate,
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

    session = ChatSession(
        user_id=db_user.id,
        title=data.title
    )

    db.add(session)
    db.commit()
    db.refresh(session)

    return {
        "id": session.id,
        "title": session.title
    }
@router.get("/sessions")
def get_sessions(
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

    sessions = (
        db.query(ChatSession)
        .filter(
            ChatSession.user_id == db_user.id
        )
        .all()
    )

    result = []

    for session in sessions:

        result.append(
            {
                "id": session.id,
                "title": session.title,
                "created_at": session.created_at
            }
        )

    return result

@router.post("/sessions/{session_id}/ask")
def ask_in_session(
    session_id: int,
    data: AskRequest,
    user=Depends(get_current_user)
):

    db = SessionLocal()

    session = (
        db.query(ChatSession)
        .filter(
            ChatSession.id == session_id
        )
        .first()
    )

    if not session:

        return {
            "error": "Session not found"
        }
    
    db_user = (
        db.query(User)
        .filter(
            User.username == user["sub"]
        )
        .first()
    )

    if session.user_id != db_user.id:

        return {
            "error": "Access denied"
        }

    user_message = ChatMessage(
        session_id=session_id,
        role="user",
        content=data.question
    )

    db.add(user_message)
    db.commit()

    conversation_context = (
    get_conversation_context(
        session_id
    )
    )

    result = answer_question(
    data.question,
    conversation_context
    )
    

    assistant_message = ChatMessage(
        session_id=session_id,
        role="assistant",
        content=result["answer"]
    )

    db.add(assistant_message)

    db.commit()

    db.close()

    return {
        "answer": result["answer"],
        "sources": result["sources"]
    }
@router.get("/sessions/{session_id}/messages")
def get_messages(
    session_id: int,
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

    session = (
        db.query(ChatSession)
        .filter(
            ChatSession.id == session_id
        )
        .first()
    )

    if not session:

        return {
            "error": "Session not found"
        }

    if session.user_id != db_user.id:

        return {
            "error": "Access denied"
        }

    messages = (
        db.query(ChatMessage)
        .filter(
            ChatMessage.session_id == session_id
        )
        .order_by(
            ChatMessage.created_at
        )
        .all()
    )

    result = []

    for msg in messages:

        result.append(
            {
                "role": msg.role,
                "content": msg.content,
                "created_at": msg.created_at
            }
        )

    db.close()

    return result

@router.delete("/sessions/{session_id}")
def delete_session(
    session_id: int,
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

    session = (
        db.query(ChatSession)
        .filter(
            ChatSession.id == session_id
        )
        .first()
    )

    if not session:

        return {
            "error": "Session not found"
        }

    if session.user_id != db_user.id:

        return {
            "error": "Access denied"
        }

    messages = (
        db.query(ChatMessage)
        .filter(
            ChatMessage.session_id == session_id
        )
        .all()
    )

    for message in messages:

        db.delete(message)

    db.delete(session)

    db.commit()

    db.close()

    return {
        "message": "Session deleted successfully"
    }
@router.put("/sessions/{session_id}")
def rename_session(
    session_id: int,
    data: SessionUpdate,
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

    session = (
        db.query(ChatSession)
        .filter(
            ChatSession.id == session_id
        )
        .first()
    )

    if not session:

        db.close()

        return {
            "error": "Session not found"
        }

    if session.user_id != db_user.id:

        db.close()

        return {
            "error": "Access denied"
        }

    session.title = data.title

    db.commit()
    db.refresh(session)

    db.close()

    return {
        "message": "Session renamed successfully",
        "id": session.id,
        "title": session.title
    }