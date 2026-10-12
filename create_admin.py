from database.database import SessionLocal
from database.models import User

from security import hash_password

db = SessionLocal()

existing_admin = db.query(User).filter(
    User.username == "admin"
).first()

if existing_admin:

    print("Admin already exists")

else:

    admin = User(
        username="admin",
        email="admin@rag.com",
        password_hash=hash_password("Admin123"),
        role="admin",
        must_change_password=False
    )

    db.add(admin)
    db.commit()

    print("Admin created successfully")

db.close()