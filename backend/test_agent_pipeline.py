#!/usr/bin/env python3
"""
Integration tests for the CareerPilot agent pipeline and DB layer.

Run with: python -m pytest backend/test_agent_pipeline.py -v
or directly: python backend/test_agent_pipeline.py
"""
import os
import sys
import json
import tempfile
import shutil
import sqlite3
from pathlib import Path

# Ensure we import from the backend directory
sys.path.insert(0, str(Path(__file__).parent))

# Use a temporary database for isolation
TEST_DB = os.path.join(tempfile.gettempdir(), f"career_test_{os.getpid()}.db")

# IMPORTANT: Do NOT set env vars or import the library here.
# The test framework will set env vars and call setup_test_environment()
# which handles module reload and global reinitialization.


def cleanup_test_db():
    """Remove or wipe the test database file."""
    if os.path.exists(TEST_DB):
        try:
            with sqlite3.connect(TEST_DB) as conn:
                for table in ("career_sessions", "mentor_messages", "interaction_traces"):
                    conn.execute(f"DELETE FROM {table}")
                conn.commit()
        except Exception:
            pass
    for ext in ("", "-wal", "-shm"):
        p = TEST_DB + ext
        if os.path.exists(p):
            try:
                os.remove(p)
            except Exception:
                pass


def setup_test_environment():
    """Reset module-level caches and set up test env vars."""
    # Set test env vars FIRST
    os.environ["DATABASE_PATH"] = TEST_DB
    os.environ["OFFLINE_MODE"] = "true"
    os.environ["JWT_SECRET"] = "test-secret-for-pytest-only-1234567890"
    # Remove the module from sys.modules so it gets freshly imported
    if "careerpilot_agent_library" in sys.modules:
        del sys.modules["careerpilot_agent_library"]
    # Fresh import - will pick up the new env vars
    import careerpilot_agent_library as cal
    return cal


def test_database_init_and_schema():
    """CareerDatabase creates tables with correct schema."""
    cleanup_test_db()
    cal = setup_test_environment()
    db = cal.CareerDatabase()
    with sqlite3.connect(TEST_DB) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # Check career_sessions table
        cursor.execute("PRAGMA table_info(career_sessions)")
        cols = {row["name"] for row in cursor.fetchall()}
        assert "session_id" in cols
        assert "user_email" in cols
        assert "created_at" in cols
        assert "updated_at" in cols

        # Check interaction_traces table
        cursor.execute("PRAGMA table_info(interaction_traces)")
        cols = {row["name"] for row in cursor.fetchall()}
        assert "session_id" in cols
        assert "agent_name" in cols

        # Check mentor_messages table
        cursor.execute("PRAGMA table_info(mentor_messages)")
        cols = {row["name"] for row in cursor.fetchall()}
        assert "session_id" in cols
        assert "user_email" in cols
        assert "role" in cols
        assert "content" in cols

    print("✓ Database schema test passed")


def test_reinitialize_globals_works():
    """reinitialize_globals picks up the new DATABASE_PATH."""
    cleanup_test_db()
    cal = setup_test_environment()
    # global_db should now point to TEST_DB
    db = cal.global_db
    assert db.db_path == TEST_DB, f"global_db.db_path={db.db_path}, expected {TEST_DB}"

    # Save a session
    state = {"profile": {"name": "Test", "stream": "PCM", "marks": "90%"}, "session_id": "test-global", "retry_count": 0, "interaction_log": [], "revision_notes": ""}
    db.save_session("test-global", state)

    # Load it back
    loaded = db.load_session("test-global")
    assert loaded is not None
    assert loaded["session_id"] == "test-global"

    print("✓ reinitialize_globals test passed")


def test_save_load_session_preserves_created_at():
    """save_session does not overwrite created_at on update."""
    cleanup_test_db()
    cal = setup_test_environment()
    db = cal.CareerDatabase()

    session_id = "test-session-1"
    state: cal.CareerState = {
        "profile": {"name": "Test Student", "stream": "PCM", "marks": "90%"},
        "session_id": session_id,
        "retry_count": 0,
        "interaction_log": [],
        "revision_notes": "",
    }

    # First save
    db.save_session(session_id, state)

    # Update with new confidence
    state["confidence"] = 0.85
    state["recommendation"] = {"recommended_degree": "B.Tech CSE"}
    db.save_session(session_id, state)

    # Verify created_at was preserved
    loaded = db.load_session(session_id)
    assert loaded is not None
    original_created = loaded["created_at"]
    assert original_created is not None

    # Third save
    state["confidence"] = 0.90
    db.save_session(session_id, state)

    loaded2 = db.load_session(session_id)
    assert loaded2["created_at"] == original_created, "created_at changed on update!"

    print("✓ created_at preservation test passed")


def test_user_isolation_in_sessions():
    """Sessions are isolated by user_email."""
    cleanup_test_db()
    cal = setup_test_environment()
    db = cal.CareerDatabase()

    # Create sessions for two different users
    state1: cal.CareerState = {
        "profile": {"name": "Alice", "stream": "PCM", "marks": "90%", "user_email": "alice@test.com"},
        "session_id": "alice-session-1",
        "retry_count": 0,
        "interaction_log": [],
        "revision_notes": "",
    }
    state2: cal.CareerState = {
        "profile": {"name": "Bob", "stream": "PCB", "marks": "85%", "user_email": "bob@test.com"},
        "session_id": "bob-session-1",
        "retry_count": 0,
        "interaction_log": [],
        "revision_notes": "",
    }

    db.save_session("alice-session-1", state1)
    db.save_session("bob-session-1", state2)

    # list_recent_sessions with user_email should only return that user's sessions
    alice_sessions = db.list_recent_sessions(limit=10, user_email="alice@test.com")
    bob_sessions = db.list_recent_sessions(limit=10, user_email="bob@test.com")

    assert len(alice_sessions) == 1
    assert alice_sessions[0]["session_id"] == "alice-session-1"
    assert alice_sessions[0]["user_email"] == "alice@test.com"

    assert len(bob_sessions) == 1
    assert bob_sessions[0]["session_id"] == "bob-session-1"
    assert bob_sessions[0]["user_email"] == "bob@test.com"

    print("✓ User isolation test passed")


def test_mentor_history_scoped_to_user():
    """Mentor history is strictly scoped to user_email."""
    cleanup_test_db()
    cal = setup_test_environment()
    db = cal.CareerDatabase()

    # Save messages for two users
    db.save_mentor_message("session-1", "alice@test.com", "user", "Hello", "Career Mentor", [])
    db.save_mentor_message("session-1", "alice@test.com", "assistant", "Hi!", "Career Mentor", [])
    db.save_mentor_message("session-2", "bob@test.com", "user", "Hey", "Career Mentor", [])

    # Query for alice
    alice_history = db.get_mentor_history(session_id="session-1", user_email="alice@test.com")
    assert len(alice_history) == 2
    assert all(h["user_email"] == "alice@test.com" for h in alice_history)

    # Query for bob
    bob_history = db.get_mentor_history(session_id="session-2", user_email="bob@test.com")
    assert len(bob_history) == 1
    assert bob_history[0]["user_email"] == "bob@test.com"

    # Query without user_email (legacy) should still return by session_id
    legacy = db.get_mentor_history(session_id="session-1")
    assert len(legacy) == 2

    print("✓ Mentor history scoping test passed")


def test_mentor_history_clear_scoped():
    """Clearing mentor history requires user_email scope."""
    cleanup_test_db()
    cal = setup_test_environment()
    db = cal.CareerDatabase()

    db.save_mentor_message("session-1", "alice@test.com", "user", "Hello", "Career Mentor", [])
    db.save_mentor_message("session-2", "bob@test.com", "user", "Hey", "Career Mentor", [])

    # Clear only alice's messages
    db.clear_mentor_history(session_id="session-1", user_email="alice@test.com")

    alice_left = db.get_mentor_history(session_id="session-1", user_email="alice@test.com")
    bob_left = db.get_mentor_history(session_id="session-2", user_email="bob@test.com")

    assert len(alice_left) == 0
    assert len(bob_left) == 1

    print("✓ Mentor history clear scoping test passed")


def test_find_latest_session_requires_user_email():
    """find_latest_session_by_user returns None if no identifying info given."""
    cleanup_test_db()
    cal = setup_test_environment()
    db = cal.CareerDatabase()

    state: cal.CareerState = {
        "profile": {"name": "Test", "stream": "PCM", "marks": "90%"},
        "session_id": "test-session",
        "retry_count": 0,
        "interaction_log": [],
        "revision_notes": "",
    }
    db.save_session("test-session", state)

    # Should NOT return a session when no identifying info
    result = db.find_latest_session_by_user()
    assert result is None, "Should not leak sessions without user_email or user_name"

    # Should return session when user_email matches
    result = db.find_latest_session_by_user(user_email="test@test.com")
    # Note: user_email wasn't set in the profile, so this will be None
    # Let's set it and try again
    state["profile"]["user_email"] = "charlie@test.com"
    db.save_session("charlie-session", state)
    result = db.find_latest_session_by_user(user_email="charlie@test.com")
    assert result is not None
    assert result["session_id"] == "charlie-session"

    print("✓ find_latest_session_by_user scoping test passed")


def test_offline_llm_produces_valid_json():
    """LLMClient in offline mode returns parseable JSON for aptitude/guidance prompts."""
    cal = setup_test_environment()
    llm = cal.LLMClient()

    # Aptitude-style prompt
    system = "You are an expert AI Career Psychologist. Return JSON only."
    user = "Student: PCM, 90%, Math/Physics, wants AI career"
    result = llm.complete_json(system, user)

    assert isinstance(result, dict)
    assert "recommended_degree" in result
    assert "confidence" in result
    assert isinstance(result["confidence"], (int, float))
    assert 0 <= result["confidence"] <= 1

    # Guidance-style prompt
    system2 = "You are a Master Career Counsellor. Write a Markdown report."
    user2 = "Student profile and recommendation here"
    report = llm.complete(system2, user2)
    assert isinstance(report, str)
    assert len(report) > 100

    print("✓ Offline LLM JSON test passed")


def test_full_pipeline_offline():
    """End-to-end run_career_guidance in offline mode."""
    cal = setup_test_environment()

    student = {
        "name": "Test Student",
        "stream": "PCM (Physics, Chemistry, Maths)",
        "marks": "92%",
        "favorite_subjects": "Mathematics, Physics, Computer Science",
        "interests": "Python coding, robotics, building web apps",
        "career_goals": "AI researcher at top tech company",
        "budget": "INR 3-4 Lakhs per year",
        "preferred_location": "Bengaluru, Pune",
        "user_email": "test@student.com",
    }

    result = cal.run_career_guidance(student)

    assert "session_id" in result
    assert "recommendation" in result
    assert "confidence" in result
    assert isinstance(result["confidence"], float)
    assert 0 <= result["confidence"] <= 1
    assert "report_markdown" in result
    assert len(result["report_markdown"]) > 500
    assert "interaction_log" in result
    assert len(result["interaction_log"]) >= 4  # Planner, Aptitude, Pathway, Guidance

    # Verify the session was saved and is loadable
    loaded = cal.CareerDatabase().load_session(result["session_id"])
    assert loaded is not None
    assert loaded["user_email"] == "test@student.com"

    print("✓ Full offline pipeline test passed")


def test_pipeline_enforces_domain_exclusive_exams():
    """MBBS/PCB recommendations never include JEE; Engineering/PCM never include NEET."""
    cal = setup_test_environment()

    student_pcb = {
        "name": "Med Student",
        "stream": "PCB (Physics, Chemistry, Biology)",
        "marks": "88%",
        "favorite_subjects": "Biology, Chemistry",
        "interests": "Clinical medicine, patient care",
        "career_goals": "Become a doctor",
        "budget": "INR 2-5 Lakhs per year",
        "preferred_location": "Chennai",
        "user_email": "med@student.com",
    }

    result = cal.run_career_guidance(student_pcb)
    pathway = result.get("pathway_research", {})
    exams = pathway.get("entrance_exams_data", [])
    exam_names = " ".join([e.get("title", "") for e in exams]).lower()

    # MBBS track must have NEET, must NOT have JEE
    assert any("neet" in n for n in exam_names.split()), "PCB student missing NEET"
    assert "jee" not in exam_names, f"PCB student got engineering exams: {exam_names}"

    student_pcm = {
        "name": "Eng Student",
        "stream": "PCM (Physics, Chemistry, Maths)",
        "marks": "90%",
        "favorite_subjects": "Mathematics, Physics",
        "interests": "Software engineering",
        "career_goals": "Software engineer",
        "budget": "INR 3-4 Lakhs per year",
        "preferred_location": "Bengaluru",
        "user_email": "eng@student.com",
    }

    result = cal.run_career_guidance(student_pcm)
    pathway = result.get("pathway_research", {})
    exams = pathway.get("entrance_exams_data", [])
    exam_names = " ".join([e.get("title", "") for e in exams]).lower()

    # Engineering track must have JEE, must NOT have NEET
    assert any("jee" in n for n in exam_names.split()), "PCM student missing JEE"
    assert "neet" not in exam_names, f"PCM student got medical exams: {exam_names}"

    print("✓ Domain-exclusive exams test passed")


def test_session_pruning():
    """Old sessions are pruned when MAX_SESSIONS_PER_USER is exceeded."""
    cleanup_test_db()
    cal = setup_test_environment()
    # Temporarily lower the cap for testing
    original_cap = cal.CareerDatabase.MAX_SESSIONS_PER_USER
    cal.CareerDatabase.MAX_SESSIONS_PER_USER = 3
    try:
        db = cal.CareerDatabase()

        for i in range(5):
            state: cal.CareerState = {
                "profile": {"name": f"Student {i}", "stream": "PCM", "marks": "80%", "user_email": "test@prune.com"},
                "session_id": f"session-{i}",
                "retry_count": 0,
                "interaction_log": [],
                "revision_notes": "",
            }
            db.save_session(f"session-{i}", state)

        sessions = db.list_recent_sessions(limit=10, user_email="test@prune.com")
        assert len(sessions) <= 3, f"Expected ≤3 sessions after pruning, got {len(sessions)}"

        # The remaining should be the 3 most recent
        session_ids = {s["session_id"] for s in sessions}
        assert "session-4" in session_ids
        assert "session-3" in session_ids
        assert "session-2" in session_ids
        assert "session-0" not in session_ids
    finally:
        cal.CareerDatabase.MAX_SESSIONS_PER_USER = original_cap

    print("✓ Session pruning test passed")


def test_rate_limiter_basic():
    """RateLimiter allows up to max_calls then blocks."""
    from main import RateLimiter
    limiter = RateLimiter(max_calls=3, window_seconds=60)

    key = "test-ip"
    assert limiter.allow(key) is True
    assert limiter.allow(key) is True
    assert limiter.allow(key) is True
    assert limiter.allow(key) is False  # 4th call blocked

    limiter.reset(key)
    assert limiter.allow(key) is True

    print("✓ Rate limiter test passed")


def test_mentor_agent_empty_state():
    """CareerMentorAgent returns helpful message when no assessment exists."""
    cleanup_test_db()
    cal = setup_test_environment()
    db = cal.CareerDatabase()
    llm = cal.LLMClient()
    search = cal.TavilySearchTool()
    mentor = cal.CareerMentorAgent(llm, db, search)

    resp = mentor.chat("What should I study?", session_id=None, user_email="new@student.com")
    assert resp["has_assessment"] is False
    assert "assessment first" in resp["response"].lower()
    assert "starters" in resp

    print("✓ Mentor empty-state test passed")


def test_mentor_agent_with_assessment():
    """CareerMentorAgent uses assessment context when session exists."""
    cleanup_test_db()
    cal = setup_test_environment()
    db = cal.CareerDatabase()
    llm = cal.LLMClient()
    search = cal.TavilySearchTool()
    mentor = cal.CareerMentorAgent(llm, db, search)

    # First run an assessment to create a session
    student = {
        "name": "Test Student",
        "stream": "PCM",
        "marks": "90%",
        "favorite_subjects": "Math, Physics",
        "interests": "AI, robotics",
        "career_goals": "AI engineer",
        "budget": "INR 3L/yr",
        "preferred_location": "Bengaluru",
        "user_email": "mentor@test.com",
    }
    result = cal.run_career_guidance(student)
    session_id = result["session_id"]

    # Now ask the mentor
    resp = mentor.chat("Why did you recommend this career?", session_id=session_id, user_email="mentor@test.com")
    assert resp["has_assessment"] is True
    assert resp["session_id"] == session_id
    assert "recommended_degree" in resp
    assert "starters" in resp

    print("✓ Mentor with assessment test passed")


def run_all_tests():
    """Run all tests in sequence."""
    tests = [
        test_database_init_and_schema,
        test_save_load_session_preserves_created_at,
        test_user_isolation_in_sessions,
        test_mentor_history_scoped_to_user,
        test_mentor_history_clear_scoped,
        test_find_latest_session_requires_user_email,
        test_offline_llm_produces_valid_json,
        test_full_pipeline_offline,
        test_pipeline_enforces_domain_exclusive_exams,
        test_session_pruning,
        test_rate_limiter_basic,
        test_mentor_agent_empty_state,
        test_mentor_agent_with_assessment,
    ]

    passed = 0
    failed = 0

    for test in tests:
        try:
            cleanup_test_db()
            setup_test_environment()
            test()
            passed += 1
        except Exception as e:
            print(f"[FAIL] {test.__name__} FAILED: {e}")
            import traceback
            traceback.print_exc()
            failed += 1
        finally:
            cleanup_test_db()

    print(f"\n{'='*50}")
    print(f"Tests run: {passed + failed}, Passed: {passed}, Failed: {failed}")
    print(f"{'='*50}")

    if failed > 0:
        sys.exit(1)


if __name__ == "__main__":
    run_all_tests()