"""
=============================================================================
CAREERPILOT AI: FASTAPI ENTRY POINT (main.py)
=============================================================================
Minimal FastAPI Web Server.
Exposes REST API endpoints for:
  - POST /assessment : Takes student 12th profile, executes the LangGraph
                       agent pipeline, and returns guidance verdict + trace.
  - GET  /report/{session_id} : Returns the generated Markdown career guidance report.
  - GET  /report : Returns recent sessions or a specific session via query parameter.
  - GET  /health : Returns system and agent status.

All core intelligence and state logic is strictly imported from careerpilot_agent_library.py.
=============================================================================
"""

import os
from typing import Optional
from fastapi import FastAPI, HTTPException, Query  # type: ignore
from fastapi.middleware.cors import CORSMiddleware  # type: ignore
from fastapi.responses import PlainTextResponse  # type: ignore

from pydantic import BaseModel  # type: ignore
import hashlib
import sqlite3

# Import all core logic from our single-file agent library
from careerpilot_agent_library import (
    StudentProfileInput,
    run_career_guidance,
    get_stored_report,
    global_db,
    global_llm,
    global_search,
    global_mentor,
    run_career_mentor,
    DATABASE_PATH,
)

# Initialize FastAPI application
app = FastAPI(
    title="CareerPilot AI - 12th Career Guidance API",
    description="Agentic AI Backend for 12th Pass-out Career Guidance (LangGraph + Groq Llama-3.3-70B + Tavily + SQLite)",
    version="1.0.0"
)

# Ensure Users table exists for real authentication
def init_auth_db():
    with sqlite3.connect(DATABASE_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()

init_auth_db()

class AuthSignupInput(BaseModel):
    email: str
    password: str
    name: str

class AuthLoginInput(BaseModel):
    email: str
    password: str

# Enable CORS for React/Next.js frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust to frontend port in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    """Root status endpoint."""
    return {
        "service": "CareerPilot AI Backend",
        "status": "online",
        "endpoints": {
            "assessment": "POST /assessment",
            "report": "GET /report/{session_id}",
            "health": "GET /health"
        }
    }


@app.get("/health")
def health_check():
    """Returns runtime health, model status, and database info."""
    return {
        "status": "healthy",
        "llm_live": global_llm.is_live,
        "llm_model": global_llm.model,
        "search_live": global_search.is_live,
        "database": DATABASE_PATH
    }


@app.post("/auth/signup")
def signup(data: AuthSignupInput):
    """Registers a student user with email and secure password."""
    email = data.email.strip().lower()
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")
    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")
    
    pwd_hash = hashlib.sha256(data.password.encode()).hexdigest()
    try:
        with sqlite3.connect(DATABASE_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)",
                (email, data.name.strip(), pwd_hash)
            )
            conn.commit()
            user_id = cursor.lastrowid
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    
    token = f"cp_token_{user_id}_{hashlib.md5(email.encode()).hexdigest()[:8]}"
    return {
        "status": "success",
        "message": "Account created successfully.",
        "token": token,
        "user": {
            "id": user_id,
            "email": email,
            "name": data.name.strip()
        }
    }


@app.post("/auth/login")
def login(data: AuthLoginInput):
    """Authenticates student user and returns session token."""
    email = data.email.strip().lower()
    pwd_hash = hashlib.sha256(data.password.encode()).hexdigest()
    
    with sqlite3.connect(DATABASE_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()
        
        if not user or user["password_hash"] != pwd_hash:
            raise HTTPException(status_code=401, detail="Invalid email or password.")
        
        token = f"cp_token_{user['id']}_{hashlib.md5(email.encode()).hexdigest()[:8]}"
        return {
            "status": "success",
            "message": "Logged in successfully.",
            "token": token,
            "user": {
                "id": user["id"],
                "email": user["email"],
                "name": user["name"]
            }
        }


@app.get("/auth/validate")
def validate_session(
    email: Optional[str] = Query(None, description="User email"),
    token: Optional[str] = Query(None, description="Token")
):
    """
    Validates whether the user account actually exists in SQLite.
    If the database was cleared or account deleted, returns 401 so the frontend logs out immediately.
    """
    user = None
    with sqlite3.connect(DATABASE_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        if email:
            cursor.execute("SELECT id, email, name FROM users WHERE email = ?", (email.strip().lower(),))
            user = cursor.fetchone()

        if not user and token and token.startswith("cp_token_"):
            parts = token.split("_")
            if len(parts) >= 3 and parts[2].isdigit():
                uid = int(parts[2])
                cursor.execute("SELECT id, email, name FROM users WHERE id = ?", (uid,))
                user = cursor.fetchone()

    if not user:
        raise HTTPException(status_code=401, detail="Session expired or user account not found in database.")

    return {
        "valid": True,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"]
        }
    }


@app.post("/assessment")
def create_career_assessment(profile: StudentProfileInput):
    """
    Submits student profile and runs the 4-agent LangGraph workflow:
    Planner -> Aptitude -> (Conditional Check) -> Pathway -> Guidance.
    Returns complete recommendation, confidence score, and blackboard execution logs.
    """
    try:
        # Extract student dictionary from Pydantic model
        student_data = profile.model_dump() if hasattr(profile, "model_dump") else profile.__dict__
        
        # Execute LangGraph pipeline from careerpilot_agent_library
        result = run_career_guidance(student_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Assessment workflow error: {str(e)}")


@app.get("/report/{session_id}")
def get_report_by_path(session_id: str, format: Optional[str] = Query("json", description="'json', 'markdown', or 'raw'")):
    """
    Retrieves the complete generated Career Guidance report by session_id from SQLite.
    Returns full structured object containing recommendation, pathway_research, and markdown.
    """
    session_record = global_db.load_session(session_id)
    if not session_record:
        raise HTTPException(status_code=404, detail=f"No career guidance dossier found for session ID: {session_id}")
    
    report_markdown = session_record.get("report_markdown") or ""
    
    if format == "text" or format == "raw":
        return PlainTextResponse(content=report_markdown, media_type="text/markdown")

    state = session_record.get("state") or {}
    recommendation = state.get("recommendation") or {
        "recommended_degree": session_record.get("recommended_degree", "Career Guidance Trajectory"),
        "career_stream": session_record.get("stream", "Class 12 Pathway"),
        "confidence": session_record.get("confidence", 0.0),
        "primary_job_roles": [],
        "reasoning": "",
        "backup_degrees": []
    }
    pathway_research = state.get("pathway") or {}

    return {
        "session_id": session_record.get("session_id", session_id),
        "student_name": session_record.get("student_name", "Student Candidate"),
        "stream": session_record.get("stream", "Class 12 Stream"),
        "confidence": session_record.get("confidence", 0.0),
        "recommendation": recommendation,
        "pathway_research": pathway_research,
        "report_markdown": report_markdown,
        "created_at": session_record.get("created_at", "")
    }


@app.get("/report")
def get_report_query(session_id: Optional[str] = Query(None, description="Session ID")):
    """
    Alternative query-parameter endpoint for /report?session_id=...
    If session_id is omitted, returns the latest recent counseling sessions.
    """
    if session_id:
        return get_report_by_path(session_id)
    
    recent_sessions = global_db.list_recent_sessions(limit=5)
    return {
        "message": "Specify ?session_id=... to fetch a specific report",
        "recent_sessions": recent_sessions
    }


# --------------------------------------------------------------------------- #
# Career Mentor AI Endpoints
# --------------------------------------------------------------------------- #

class MentorChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    user_email: Optional[str] = None


@app.post("/mentor/chat")
def mentor_chat(req: MentorChatRequest):
    """
    Career Mentor AI: Conversational Guidance Endpoint.
    Context-aware dialogue answering student follow-up questions,
    explaining recommendations, providing study roadmaps, and utilizing Pathway Agent tools.
    """
    if not req.message or not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")
    
    return run_career_mentor(
        user_message=req.message.strip(),
        session_id=req.session_id,
        user_email=req.user_email
    )


@app.get("/mentor/history")
def get_mentor_history(
    session_id: Optional[str] = Query(None, description="Session ID"),
    user_email: Optional[str] = Query(None, description="User Email")
):
    """
    Retrieves preserved conversation memory for the Career Mentor.
    """
    history = global_db.get_mentor_history(session_id=session_id, user_email=user_email, limit=30)
    return {"history": history}


@app.delete("/mentor/history")
def clear_mentor_history(
    session_id: Optional[str] = Query(None, description="Session ID"),
    user_email: Optional[str] = Query(None, description="User Email")
):
    """
    Clears preserved conversation memory for the Career Mentor.
    """
    success = global_db.clear_mentor_history(session_id=session_id, user_email=user_email)
    return {"status": "cleared" if success else "failed"}


@app.get("/mentor/starters")
def get_mentor_starters(
    session_id: Optional[str] = Query(None, description="Session ID"),
    user_email: Optional[str] = Query(None, description="User Email")
):
    """
    Returns dynamically tailored conversation starters based on the student's 12th stream.
    """
    stream = "PCM"
    degree = ""
    session = None
    if session_id:
        session = global_db.load_session(session_id)
    if not session and user_email:
        session = global_db.find_latest_session_by_user(user_email=user_email)
    
    if session:
        stream = session.get("stream") or session.get("state", {}).get("profile", {}).get("stream", "PCM")
        degree = session.get("recommended_degree") or ""

    starters = global_mentor.get_dynamic_starters(stream, degree)
    return {"starters": starters, "stream": stream, "recommended_degree": degree}


if __name__ == "__main__":
    import uvicorn  # type: ignore
    # Allows running directly via `python main.py`
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

