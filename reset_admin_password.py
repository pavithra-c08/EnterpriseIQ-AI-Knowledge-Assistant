from database.database import SessionLocal
from database.models import User
from security import hash_password

db = SessionLocal()

admin = (
    db.query(User)
    .filter(User.username == "admin")
    .first()
)

if not admin:
    print("Admin user not found.")
else:
    admin.password_hash = hash_password("Welcome123!")
    admin.must_change_password = True

    db.commit()

    print("Admin password reset successfully!")