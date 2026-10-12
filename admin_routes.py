from fastapi import APIRouter
from pydantic import BaseModel

from database.database import SessionLocal
from database.models import User

from security import hash_password
from fastapi import Depends
from auth.admin_required import admin_required

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


class CreateUserRequest(BaseModel):
    username: str
    email: str

@router.post("/users")
def create_user(
    data: CreateUserRequest,
    admin=Depends(admin_required)
):
    db = SessionLocal()

    existing_user = db.query(User).filter(
        User.username == data.username
    ).first()

    if existing_user:

        return {
            "error": "Username already exists"
        }

    user = User(
        username=data.username,
        email=data.email,
        password_hash=hash_password(
            "Welcome123!"
        ),
        role="user",
        must_change_password=True
    )

    db.add(user)
    db.commit()

    return {
        "message": "User created successfully",
        "default_password": "Welcome123!"
    }

@router.get("/users")
def get_users(
    admin=Depends(admin_required)
):

    db = SessionLocal()

    users = db.query(User).all()

    result = []

    for user in users:

        result.append(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "must_change_password": user.must_change_password
            }
        )

    return result

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    current_admin=Depends(admin_required)
):

    db = SessionLocal()

    admin = (
        db.query(User)
        .filter(
            User.username == current_admin["sub"]
        )
        .first()
    )

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:

        return {
            "error": "User not found"
        }

    if admin.id == user.id:

        return {
            "error": "You cannot delete your own account"
        }

    db.delete(user)
    db.commit()
    db.close()

    return {
        "message": "User deleted successfully"
    }

@router.post("/users/{user_id}/reset-password")
def reset_password(
    user_id: int,
    admin=Depends(admin_required)
):

    db = SessionLocal()

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:

        return {
            "error": "User not found"
        }

    user.password_hash = hash_password(
        "Welcome123!"
    )

    user.must_change_password = True

    db.commit()

    return {
        "message": "Password reset successfully",
        "default_password": "Welcome123!"
    }