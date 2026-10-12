from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from database.database import SessionLocal
from database.models import User
from security import verify_password, hash_password
from auth.jwt_handler import create_access_token
from auth.dependencies import get_current_user

router = APIRouter()


class LoginRequest(BaseModel):
    username: str
    password: str

class ChangePasswordRequest(BaseModel):
    new_password: str

@router.post("/login")
def login(data: LoginRequest):

    db = SessionLocal()

    user = (
        db.query(User)
        .filter(
            User.username == data.username
        )
        .first()
    )

    if not user or not verify_password(data.password, user.password_hash):
        db.close()
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    token = create_access_token(
        {
            "sub": user.username,
            "role": user.role
        }
    )

    result = {
        "message": "Login successful",
        "access_token": token,
        "username": user.username,
        "role": user.role,
        "must_change_password": user.must_change_password
    }

    db.close()
    return result

@router.post("/change-password")
def change_password(
    data: ChangePasswordRequest,
    current_user=Depends(get_current_user)
):

    db = SessionLocal()

    user = (
    db.query(User)
    .filter(
        User.username == current_user["sub"]
    )
    .first()
)

    if not user:

        return {
            "error": "User not found"
        }

    user.password_hash = hash_password(
        data.new_password
    )

    user.must_change_password = False

    db.commit()

    return {
        "message": "Password changed successfully"
    }