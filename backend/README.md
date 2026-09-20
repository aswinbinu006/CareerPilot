# CareerPilot AI — Backend Architecture & API Documentation

> The core intelligence layer of CareerPilot AI, featuring a self-contained multi-agent pipeline built on **LangGraph**, **Model Context Protocol (MCP)**, **Groq Llama-3.3-70B / Qwen**, **Tavily Search**, and **FastAPI**.

---

## Technical Highlights

- **Single-File Core Engine**: [`careerpilot_agent_library.py`](file:///careerpilot_agent_library.py) contains all agent logic, state management, SQLite persistence, MCP tools, and interactive CLI demo routines.
- **LangGraph StateGraph Workflow**: Formal state graph with conditional feedback routing (`confidence < 0.65` triggers revision by `PlannerAgent`).
- **Model Context Protocol (MCP) Server**: Lightweight `TinyMCPServer` exposing registered educational tools called by `PathwayAgent` via standard `mcp.call_tool()`.
- **Zero-Failure Offline Resilience**: If network or API credits are unavailable, the system transparently activates offline fallback heuristic engines without crashing.
- **Cryptographic JWT + Salted Bcrypt Auth**: Implements `passlib.hash.bcrypt` with automatic per-user salt and signed `PyJWT` session tokens.

---

## Agent Pipeline Overview

| Agent | Class | Responsibility |
| :--- | :--- | :--- |
| **PlannerAgent** | `PlannerAgent` | Ingests raw student 12th profile (stream, marks, subjects, budget, location) and normalizes state in SQLite. |
| **AptitudeAgent** | `AptitudeAgent` | Applies psychometric and academic reasoning to determine high-demand degree recommendations and outputs a confidence score (0.00 – 1.00). |
| **Router** | `check_confidence` | Conditional edge: routes back to `Planner` if confidence < 0.65 (retry limit: 1); otherwise routes forward to `Pathway`. |
| **PathwayAgent** | `PathwayAgent` | Formulates targeted search queries and queries the **MCP Server** (`search_colleges`, `search_entrance_exams`, `search_scholarships`). |
| **GuidanceAgent** | `GuidanceAgent` | Synthesizes all gathered intelligence into an empathetic, rigorous 10-heading Markdown career guidance report. |
| **Career Mentor AI** | `CareerMentor` | Context-aware conversational chatbot with conversation memory in SQLite and intelligent query routing. |

---

## Model Context Protocol (MCP) Server

The backend instantiates a `TinyMCPServer("CareerPilotEducationalMCP")` that registers three core educational search tools via `@mcp.tool()`:

1. **`search_colleges(query: str)`**: Retrieves top universities, fee tiers, NIRF rankings, and cutoffs.
2. **`search_entrance_exams(stream: str, degree: str)`**: Retrieves current entrance exams, conducting bodies, and eligibility criteria.
3. **`search_scholarships(stream: str, budget: str)`**: Retrieves merit and need-based government and private scholarships.

At server boot, registered MCP tools are verified and logged:
```text
[MCP SERVER] 'CareerPilotEducationalMCP' online. Registered tools (3):
   * Tool: 'search_colleges' -> MCP Tool: Search top universities, colleges, fee structures, and location cutoffs.
   * Tool: 'search_entrance_exams' -> MCP Tool: Search 2025/2026 entrance exams, eligibility dates, and conducting bodies.
   * Tool: 'search_scholarships' -> MCP Tool: Search merit and need-based government and private scholarships.
```

In runtime, `PathwayAgent.execute()` routes all research through `mcp.call_tool(...)` and records each call in the Blackboard audit trace (`state["interaction_log"]`).

---

## Authentication & Security

- **Password Hashing**: Uses `passlib.hash.bcrypt.hash(password)` with automatically generated per-user cryptographic salt.
- **JWT Issuance**: Issues signed HS256 JWT tokens containing `{"user_id": ..., "email": ..., "exp": <now + 24 hours>}`.
- **JWT Validation**: `/auth/validate` decodes tokens via `jwt.decode()`, catching `jwt.ExpiredSignatureError` and `jwt.InvalidTokenError`, returning `401 Unauthorized`.
- **Inactivity & Session Protection**: Designed to interface with the frontend idle timer and browser close listener for immediate invalidation.

---

## REST API Reference

Base URL: `http://127.0.0.1:8000`

### 1. Health Check
- **`GET /health`**
- **Response**:
  ```json
  {
    "status": "healthy",
    "llm_live": true,
    "llm_model": "qwen/qwen3.8-27b",
    "search_live": true,
    "database": "career_guidance.db"
  }
  ```

### 2. User Authentication
- **`POST /auth/signup`**
  - **Body**: `{"email": "student@example.com", "password": "securepassword", "name": "Student Name"}`
  - **Response**: `{"status": "success", "token": "<JWT>", "user": {"id": 1, "email": "...", "name": "..."}}`
- **`POST /auth/login`**
  - **Body**: `{"email": "student@example.com", "password": "securepassword"}`
  - **Response**: `{"status": "success", "token": "<JWT>", "user": {"id": 1, "email": "...", "name": "..."}}`
- **`GET /auth/validate?email={email}&token={token}`**
  - **Response**: `{"valid": true, "user": {"id": 1, "email": "...", "name": "..."}}`

### 3. Career Assessment Pipeline
- **`POST /assessment`**
  - **Body**:
    ```json
    {
      "name": "Aryan Sharma",
      "stream": "PCM (Physics, Chemistry, Maths)",
      "marks": "92% in 12th Board",
      "favorite_subjects": "Mathematics, Physics, Computer Science",
      "interests": "Python coding, robotics, competitive gaming",
      "career_goals": "Want to build innovative AI products",
      "budget": "INR 3 to 4 Lakhs per year",
      "preferred_location": "Bengaluru, Pune, or Hyderabad"
    }
    ```
  - **Response**: Contains `session_id`, `recommendation`, `confidence`, `interaction_log`, and `report_markdown`.

### 4. Career Guidance Report
- **`GET /report/{session_id}`**: Retrieves stored session report and trace logs.
- **`GET /report`**: Retrieves recent sessions.

### 5. Career Mentor Chat
- **`POST /mentor/chat`**
  - **Body**: `{"message": "Why was this career recommended?", "session_id": "...", "user_email": "..."}`
  - **Response**: Returns contextual conversational advice, sources, and suggested follow-ups.

---

## Environment Variables (`.env`)

```ini
# Groq LLM API Key (https://console.groq.com)
GROQ_API_KEY=gsk_...

# Groq Model Identifier
GROQ_MODEL=llama-3.3-70b-versatile

# Tavily Web Search API Key (https://tavily.com)
TAVILY_API_KEY=tvly-...

# SQLite Database Location
DATABASE_PATH=career_guidance.db

# Offline Mode Switch (true for simulation without external APIs)
OFFLINE_MODE=false

# Secret key for signing JWT tokens (HS256)
JWT_SECRET=your_secure_256bit_random_secret_here
```

---

## Verification & Testing

### 1. Automated Auth & JWT Test Suite
Run the test suite to verify bcrypt password hashing, JWT encoding, expiry, and anti-tampering:
```bash
python test_auth_jwt.py
```

### 2. Interactive CLI Demo
Run the CLI demo to test all 4 streams offline or live:
```bash
python careerpilot_agent_library.py
```

### 3. Start Backend Server
```bash
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

---

## Cloud Deployment (Render)

When deploying this backend to **Render** as a Python Web Service:
1. **Root Directory**: Set to `backend` in Service Settings.
2. **Build Command**: `pip install -r requirements.txt`
3. **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. **Environment Variables**: Add the following in Render's Environment tab:
   - `JWT_SECRET`: Random secure string (HS256)
   - `GROQ_API_KEY`: Your Groq API key
   - `GROQ_MODEL`: `llama-3.3-70b-versatile` or `qwen/qwen3.8-27b`
   - `TAVILY_API_KEY`: Your Tavily API key
   - `OFFLINE_MODE`: `false`
