from fastapi import Depends
from fastapi import HTTPException

from auth.dependencies import get_current_user


def admin_required(
    user=Depends(get_current_user)
):

    if user["role"] != "admin":

        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return user