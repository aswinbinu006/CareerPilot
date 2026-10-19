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
import sqlite3
import datetime
import time
import threading
from collections import defaultdict
from typing import Optional, List
from dotenv import load_dotenv  # type: ignore
import jwt  # type: ignore
from passlib.hash import bcrypt  # type: ignore

from fastapi import FastAPI, HTTPException, Query, Request, Depends  # type: ignore
from fastapi.middleware.cors import CORSMiddleware  # type: ignore
from fastapi.responses import PlainTextResponse  # type: ignore
from pydantic import BaseModel, field_validator  # type: ignore

# Ensure .env configuration is loaded
env_backend = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(env_backend):
    load_dotenv(dotenv_path=env_backend, override=True)
else:
    load_dotenv()

# Secure JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "").strip()
if not JWT_SECRET:
    raise RuntimeError(
        "CRITICAL SECURITY CONFIGURATION ERROR: 'JWT_SECRET' environment variable is not set. "
        "Set a high-entropy secret string in backend/.env before running the server."
    )
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

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
    get_database_path,
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
    with sqlite3.connect(DATABASE_PATH()) as conn:
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

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = (v or "").strip().lower()
        if not v or "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("Please enter a valid email address.")
        return v

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = (v or "").strip()
        if not v:
            raise ValueError("Name is required.")
        return v

class AuthLoginInput(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = (v or "").strip().lower()
        if not v or "@" not in v:
            raise ValueError("Please enter a valid email address.")
        return v


# --------------------------------------------------------------------------- #
# Authentication Dependency
# --------------------------------------------------------------------------- #
# Every protected endpoint must pass through `get_current_user`. This is the
# single chokepoint that verifies the JWT signature, expiry, and that the
# account still exists in the database. Relying on client-side checks alone
# means anyone who can send a raw HTTP request bypasses all access control.
def get_current_user(request: Request) -> dict:
    auth_header = request.headers.get("Authorization", "")
    token = None
    if auth_header.startswith("Bearer "):
        token = auth_header[7:].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required. Please log in.")

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired. Please log in again.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid or tampered token. Access denied.")

    token_email = (payload.get("email") or "").strip().lower()
    token_user_id = payload.get("user_id")

    with sqlite3.connect(DATABASE_PATH()) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        user = None
        if token_user_id:
            cursor.execute("SELECT id, email, name FROM users WHERE id = ?", (token_user_id,))
            user = cursor.fetchone()
        if not user and token_email:
            cursor.execute("SELECT id, email, name FROM users WHERE email = ?", (token_email,))
            user = cursor.fetchone()

    if not user:
        raise HTTPException(status_code=401, detail="User account no longer found in database.")

    return {
        "user_id": user["id"],
        "email": user["email"],
        "name": user["name"],
    }


# --------------------------------------------------------------------------- #
# Rate Limiting
# --------------------------------------------------------------------------- #
# Per-IP sliding-window limiter. The assessment and mentor endpoints are
# expensive (multiple LLM calls + searches), so we cap them to stop abuse
# and to protect the free-tier API credits.
class RateLimiter:
    """Simple per-key fixed-window rate limiter (in-memory, process-local)."""

    def __init__(self, max_calls: int, window_seconds: int):
        self.max_calls = max_calls
        self.window_seconds = window_seconds
        self._buckets: dict = defaultdict(list)
        self._lock = threading.Lock()

    def allow(self, key: str) -> bool:
        now = time.time()
        with self._lock:
            window_start = now - self.window_seconds
            self._buckets[key] = [t for t in self._buckets[key] if t > window_start]
            if len(self._buckets[key]) >= self.max_calls:
                return False
            self._buckets[key].append(now)
            return True

    def reset(self, key: str) -> None:
        with self._lock:
            self._buckets.pop(key, None)


ASSESSMENT_LIMITER = RateLimiter(max_calls=10, window_seconds=3600)   # 10 assessments / hour
MENTOR_LIMITER = RateLimiter(max_calls=60, window_seconds=3600)       # 60 mentor chats / hour


def rate_limit(request: Request, limiter: RateLimiter, detail: str) -> None:
    """Raises 429 when the caller has exceeded their quota."""
    client_ip = request.client.host if request.client else "unknown"
    if not limiter.allow(client_ip):
        raise HTTPException(status_code=429, detail=detail)


# --------------------------------------------------------------------------- #
# Input Validation for the Assessment Intake
# --------------------------------------------------------------------------- #
VALID_STREAMS = {"PCM", "PCB", "Commerce", "Arts", "PCM (Physics, Chemistry, Maths)",
                 "PCB (Physics, Chemistry, Biology)", "Commerce with Maths",
                 "Arts / Humanities"}
MAX_FIELD_LENGTH = 500


def validate_assessment_fields(profile: dict) -> None:
    """Rejects malformed or over-long intake fields before they reach the LLM."""
    required = ["name", "stream", "marks", "favorite_subjects", "interests",
                "career_goals", "budget", "preferred_location"]
    for field in required:
        val = profile.get(field)
        if val is None or not str(val).strip():
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        if len(str(val)) > MAX_FIELD_LENGTH:
            raise HTTPException(
                status_code=400,
                detail=f"Field '{field}' exceeds the {MAX_FIELD_LENGTH} character limit.",
            )

    stream = str(profile.get("stream", "")).strip()
    if stream not in VALID_STREAMS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid stream '{stream}'. Must be one of: PCM, PCB, Commerce, Arts.",
        )

# Enable CORS for the React frontend integration.
# allow_origins MUST be an explicit list when allow_credentials=True. A wildcard
# origin with credentials is rejected by browsers and effectively grants every
# site credentialed access to this API.
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "https://careerpilot-frontend.vercel.app",
    "https://careerpilot-frontend-1.onrender.com",
]
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()] or CORS_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "HEAD", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With"],
)


@app.api_route("/", methods=["GET", "HEAD"])
def root():
    """Root status endpoint supporting GET and HEAD for uptime monitors."""
    return {
        "service": "CareerPilot AI Backend",
        "status": "online",
        "endpoints": {
            "assessment": "POST /assessment",
            "report": "GET /report/{session_id}",
            "health": "GET /health"
        }
    }


@app.api_route("/health", methods=["GET", "HEAD"])
def health_check():
    """Returns runtime health, model status, and database info supporting GET and HEAD."""
    return {
        "status": "healthy",
        "llm_live": global_llm.is_live,
        "llm_model": global_llm.model,
        "search_live": global_search.is_live,
        "database": DATABASE_PATH
    }


@app.post("/auth/signup")
def signup(data: AuthSignupInput):
    """Registers a student user with email and salted bcrypt password hash."""
    email = data.email.strip().lower()
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")
    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")
    
    # Securely hash password using bcrypt (automatic per-user random salt)
    pwd_hash = bcrypt.hash(data.password)
    try:
        with sqlite3.connect(DATABASE_PATH()) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)",
                (email, data.name.strip(), pwd_hash)
            )
            conn.commit()
            user_id = cursor.lastrowid
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    
    # Issue cryptographically signed JWT valid for 24 hours
    now_utc = datetime.datetime.now(datetime.timezone.utc)
    token_payload = {
        "user_id": user_id,
        "email": email,
        "exp": now_utc + datetime.timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    token = jwt.encode(token_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

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


# Rate-limiting / Account Lockout Defense Configuration
FAILED_LOGIN_ATTEMPTS: dict = {}
MAX_FAILED_ATTEMPTS = 5
LOCKOUT_DURATION_MINUTES = 30


@app.post("/auth/login")
def login(data: AuthLoginInput):
    """Authenticates student user and returns signed JWT session token with lockout defense."""
    email = data.email.strip().lower()
    now_utc = datetime.datetime.now(datetime.timezone.utc)

    # 1. Check if account is currently under defensive security lockout
    attempt_info = FAILED_LOGIN_ATTEMPTS.get(email)
    if attempt_info:
        locked_until = attempt_info.get("locked_until")
        if locked_until and now_utc < locked_until:
            remaining_mins = max(1, int((locked_until - now_utc).total_seconds() / 60))
            raise HTTPException(
                status_code=423,
                detail=f"Account temporarily locked due to consecutive failed login attempts. Please try again after {remaining_mins} minutes or reset your password."
            )
        elif locked_until and now_utc >= locked_until:
            # Lockout period expired; reset attempt counter
            FAILED_LOGIN_ATTEMPTS.pop(email, None)

    with sqlite3.connect(DATABASE_PATH()) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()

        is_valid = False
        if user:
            try:
                is_valid = bcrypt.verify(data.password, user["password_hash"])
            except Exception:
                is_valid = False

        if not is_valid:
            # Increment failed attempt counter
            entry = FAILED_LOGIN_ATTEMPTS.setdefault(email, {"count": 0, "locked_until": None})
            entry["count"] += 1
            if entry["count"] >= MAX_FAILED_ATTEMPTS:
                entry["locked_until"] = now_utc + datetime.timedelta(minutes=LOCKOUT_DURATION_MINUTES)
                raise HTTPException(
                    status_code=423,
                    detail=f"Account locked due to {MAX_FAILED_ATTEMPTS} consecutive failed attempts. Your account has been suspended for {LOCKOUT_DURATION_MINUTES} minutes."
                )
            remaining = MAX_FAILED_ATTEMPTS - entry["count"]
            raise HTTPException(
                status_code=401,
                detail=f"Invalid email or password. {remaining} attempt(s) remaining before security lockout."
            )

        # Successful login: reset failed attempts counter
        FAILED_LOGIN_ATTEMPTS.pop(email, None)

        # Issue cryptographically signed JWT valid for 24 hours
        token_payload = {
            "user_id": user["id"],
            "email": user["email"],
            "exp": now_utc + datetime.timedelta(hours=JWT_EXPIRATION_HOURS)
        }
        token = jwt.encode(token_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

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
    request: Request,
    email: Optional[str] = Query(None, description="User email"),
    token: Optional[str] = Query(None, description="Deprecated: use the Authorization header instead"),
):
    """
    Validates JWT signature and expiry, and verifies user exists in SQLite.
    Returns 401 on expired, malformed, or tampered tokens.

    The token is read from the `Authorization: Bearer <token>` header. Passing
    it as a query parameter is deprecated: query strings are written to browser
    history, server logs, and Referer headers, which is a session-leak vector.
    """
    # Prefer the Authorization header; fall back to the query string only for
    # legacy clients so existing integrations don't silently break.
    auth_header = request.headers.get("Authorization", "")
    active_token = None
    if auth_header.startswith("Bearer "):
        active_token = auth_header[7:].strip()
    elif token:
        active_token = token.strip()

    if not active_token:
        raise HTTPException(status_code=401, detail="Authentication token required.")

    # Decode and verify JWT signature and expiration
    try:
        payload = jwt.decode(active_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired. Please log in again.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid or tampered token. Access denied.")

    token_email = payload.get("email")
    token_user_id = payload.get("user_id")

    # If email query parameter was provided, confirm it matches the token identity
    if email and token_email and email.strip().lower() != token_email.strip().lower():
        raise HTTPException(status_code=401, detail="Token does not match provided user identity.")

    # Confirm user still exists in the database (e.g. not deleted or cleared)
    user = None
    with sqlite3.connect(DATABASE_PATH()) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        if token_user_id:
            cursor.execute("SELECT id, email, name FROM users WHERE id = ?", (token_user_id,))
            user = cursor.fetchone()
        if not user and token_email:
            cursor.execute("SELECT id, email, name FROM users WHERE email = ?", (token_email.strip().lower(),))
            user = cursor.fetchone()

    if not user:
        raise HTTPException(status_code=401, detail="User account no longer found in database.")

    return {
        "valid": True,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"]
        }
    }


@app.post("/assessment")
def create_career_assessment(
    profile: StudentProfileInput,
    request: Request,
    current_user: dict = Depends(get_current_user),
):
    """
    Submits student profile and runs the 4-agent LangGraph workflow:
    Planner -> Aptitude -> (Conditional Check) -> Pathway -> Guidance.
    Returns complete recommendation, confidence score, and blackboard execution logs.

    AUTHENTICATED ONLY. The student's identity is taken from the JWT, not from
    the request body: a client-supplied `user_email` is treated as a hint at
    most, and a mismatch with the token is rejected. This is what makes session
    isolation real instead of merely claimed.
    """
    # Rate limit the expensive multi-agent pipeline per caller
    rate_limit(request, ASSESSMENT_LIMITER,
               "Too many assessments. Please wait before running another evaluation.")

    try:
        # Extract student dictionary from Pydantic model
        student_data = profile.model_dump() if hasattr(profile, "model_dump") else profile.__dict__

        # Bind the session to the authenticated user's identity.
        body_email = (student_data.get("user_email") or "").strip().lower()
        token_email = (current_user.get("email") or "").strip().lower()
        if body_email and body_email != token_email:
            raise HTTPException(
                status_code=403,
                detail="The user_email in your request does not match your logged-in account.",
            )
        student_data["user_email"] = token_email
        student_data["user_id"] = current_user.get("user_id")

        # Validate field shapes before they reach the LLM
        validate_assessment_fields(student_data)

        # Execute LangGraph pipeline from careerpilot_agent_library
        result = run_career_guidance(student_data)
        return result
    except HTTPException:
        raise
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
def get_report_query(
    session_id: Optional[str] = Query(None, description="Session ID"),
    user_email: Optional[str] = Query(None, description="Filter sessions by student email")
):
    """
    Alternative query-parameter endpoint for /report?session_id=...
    If session_id is omitted, returns recent counseling sessions, optionally filtered by user_email.
    """
    if session_id:
        return get_report_by_path(session_id)
    
    recent_sessions = global_db.list_recent_sessions(limit=10, user_email=user_email)
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
def mentor_chat(
    req: MentorChatRequest,
    request: Request,
    current_user: dict = Depends(get_current_user),
):
    """
    Career Mentor AI: Conversational Guidance Endpoint.
    Context-aware dialogue answering student follow-up questions,
    explaining recommendations, providing study roadmaps, and utilizing Pathway Agent tools.

    AUTHENTICATED ONLY. The caller's identity comes from the JWT; a client-supplied
    `user_email` is a hint at most and a mismatch is rejected, so one student can
    never read or steer another student's mentor conversation.
    """
    if not req.message or not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    rate_limit(request, MENTOR_LIMITER,
               "Too many mentor messages. Please slow down and try again shortly.")

    token_email = (current_user.get("email") or "").strip().lower()
    body_email = (req.user_email or "").strip().lower()
    if body_email and body_email != token_email:
        raise HTTPException(
            status_code=403,
            detail="The user_email in your request does not match your logged-in account.",
        )

    return run_career_mentor(
        user_message=req.message.strip(),
        session_id=req.session_id,
        user_email=token_email,
    )


@app.get("/mentor/history")
def get_mentor_history(
    request: Request,
    session_id: Optional[str] = Query(None, description="Session ID"),
    user_email: Optional[str] = Query(None, description="User Email"),
    current_user: dict = Depends(get_current_user),
):
    """
    Retrieves preserved conversation memory for the Career Mentor.
    Scoped to the authenticated user only.
    """
    token_email = (current_user.get("email") or "").strip().lower()
    body_email = (user_email or "").strip().lower()
    if body_email and body_email != token_email:
        raise HTTPException(
            status_code=403,
            detail="The user_email in your request does not match your logged-in account.",
        )

    history = global_db.get_mentor_history(session_id=session_id, user_email=token_email, limit=30)
    return {"history": history}


@app.delete("/mentor/history")
def clear_mentor_history(
    request: Request,
    session_id: Optional[str] = Query(None, description="Session ID"),
    user_email: Optional[str] = Query(None, description="User Email"),
    current_user: dict = Depends(get_current_user),
):
    """
    Clears preserved conversation memory for the Career Mentor.
    Scoped to the authenticated user only.
    """
    token_email = (current_user.get("email") or "").strip().lower()
    body_email = (user_email or "").strip().lower()
    if body_email and body_email != token_email:
        raise HTTPException(
            status_code=403,
            detail="The user_email in your request does not match your logged-in account.",
        )

    success = global_db.clear_mentor_history(session_id=session_id, user_email=token_email)
    return {"status": "cleared" if success else "failed"}


@app.get("/mentor/starters")
def get_mentor_starters(
    request: Request,
    session_id: Optional[str] = Query(None, description="Session ID"),
    user_email: Optional[str] = Query(None, description="User Email"),
    current_user: dict = Depends(get_current_user),
):
    """
    Returns dynamically tailored conversation starters based on the student's 12th stream.
    Scoped to the authenticated user's latest session.
    """
    token_email = (current_user.get("email") or "").strip().lower()
    body_email = (user_email or "").strip().lower()
    if body_email and body_email != token_email:
        raise HTTPException(
            status_code=403,
            detail="The user_email in your request does not match your logged-in account.",
        )

    stream = "PCM"
    degree = ""
    session = None
    if session_id:
        session = global_db.load_session(session_id)
    if not session:
        session = global_db.find_latest_session_by_user(user_email=token_email)

    if session:
        stream = session.get("stream") or session.get("state", {}).get("profile", {}).get("stream", "PCM")
        degree = session.get("recommended_degree") or ""

    starters = global_mentor.get_dynamic_starters(stream, degree)
    return {"starters": starters, "stream": stream, "recommended_degree": degree}


if __name__ == "__main__":
    import uvicorn  # type: ignore
    # Allows running directly via `python main.py`
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

