from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from routes.auth_routes import router as auth_router
from fastapi import Depends
from auth.dependencies import get_current_user
from routes.admin_routes import router as admin_router
import shutil
import os

from build_index import build_index
from services.rag_service import answer_question
from routes.chat_routes import router as chat_router

from database.database import SessionLocal
from database.models import User
from services.chat_service import save_chat

from auth.admin_required import admin_required
from routes.session_routes import router as session_router
from prometheus_fastapi_instrumentator import Instrumentator



app = FastAPI(
    title="EnterpriseIQ API",
    version="1.0.0"
)
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(chat_router)
app.include_router(session_router)

Instrumentator().instrument(app).expose(app)
# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# REQUEST MODEL
# =========================

class Question(BaseModel):
    question: str


# =========================
# HOME
# =========================

@app.get("/")
def home():

    return {
        "message": "EnterpriseIQ API Running"
    }


# =========================
# HEALTH CHECK
# =========================
# CI/CD deployment testing002
@app.get("/health")
def health():

    return {
        "status": "healthy"
    }
@app.get("/me")
def me(
    user=Depends(get_current_user)
):

    db = SessionLocal()
    db_user = db.query(User).filter(User.username == user["sub"]).first()
    db.close()
    return {
        "username": user["sub"],
        "role": user["role"],
        "must_change_password": db_user.must_change_password if db_user else False
    }

# =========================
# ASK QUESTION
# =========================

@app.post("/ask")
def ask(
    data: Question,
    user=Depends(get_current_user)
):

    result = answer_question(
        data.question
    )

    db = SessionLocal()

    db_user = (
        db.query(User)
        .filter(
            User.username == user["sub"]
        )
        .first()
    )

    if db_user:

        save_chat(
            db_user.id,
            data.question,
            result["answer"]
        )

    db.close()

    return {
        "question": data.question,
        "answer": result["answer"],
        "sources": result["sources"]
    }

# =========================
# UPLOAD PDF
# =========================

@app.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    admin=Depends(admin_required)
):

    # Allow only PDF files

    if not file.filename.lower().endswith(".pdf"):

        return {
            "error": "Only PDF files are allowed"
        }

    os.makedirs(
        "uploads",
        exist_ok=True
    )

    file_path = os.path.join(
        "uploads",
        file.filename
    )

    with open(
        file_path,
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )

    # Rebuild vector database

    build_index()

    return {
        "message": "PDF uploaded and indexed successfully",
        "filename": file.filename
    }


# =========================
# REBUILD INDEX MANUALLY
# =========================

@app.post("/rebuild")
def rebuild(
    admin=Depends(admin_required)
):

    build_index()

    return {
        "message": "Vector database rebuilt successfully"
    }


# =========================
# LIST DOCUMENTS
# =========================

@app.get("/documents")
def list_documents():

    os.makedirs(
        "uploads",
        exist_ok=True
    )

    files = os.listdir(
        "uploads"
    )

    pdfs = [
        file
        for file in files
        if file.lower().endswith(".pdf")
    ]

    return {
        "documents": pdfs,
        "count": len(pdfs)
    }
# =========================
# DELETE DOCUMENT
# =========================

@app.delete("/documents/{filename}")
def delete_document(
    filename: str,
    admin=Depends(admin_required)
):

    file_path = os.path.join(
        "uploads",
        filename
    )

    if not os.path.exists(file_path):

        return {
            "error": "Document not found"
        }

    os.remove(file_path)

    # Rebuild vector database
    build_index()

    return {
        "message": "Document deleted and vector database rebuilt successfully",
        "filename": filename
    }
# =========================
# START SERVER
# =========================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )