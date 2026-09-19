import os
import sys
import datetime
import urllib.request
import urllib.error
import json
import jwt

BASE_URL = "http://127.0.0.1:8000"
JWT_SECRET = "cp_super_secret_jwt_key_2026_careerpilot_production_safe_token_998877"

def request(endpoint, method="GET", data=None):
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    body = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            res_data = response.read().decode("utf-8")
            return response.status, json.loads(res_data)
    except urllib.error.HTTPError as e:
        res_data = e.read().decode("utf-8")
        try:
            return e.code, json.loads(res_data)
        except Exception:
            return e.code, {"detail": res_data}

def run_tests():
    print("=== STARTING AUTH JWT & BCRYPT VERIFICATION TESTS ===")
    test_email = f"test_jwt_{int(datetime.datetime.now().timestamp())}@careerpilot.edu"
    test_password = "SecurePassword@123"
    test_name = "JWT Student"

    # Test 1: Signup
    print("\n[Test 1] POST /auth/signup...")
    status, res = request("/auth/signup", method="POST", data={
        "email": test_email,
        "password": test_password,
        "name": test_name
    })
    print(f"Status: {status}, Response: {res}")
    assert status == 200, f"Expected 200, got {status}"
    token = res.get("token")
    assert token and len(token.split(".")) == 3, f"Expected 3-part JWT token, got: {token}"
    print("[PASS] Signup succeeded with valid JWT token.")

    # Test 2: Login with correct password
    print("\n[Test 2] POST /auth/login with valid password...")
    status, res = request("/auth/login", method="POST", data={
        "email": test_email,
        "password": test_password
    })
    print(f"Status: {status}, Response: {res}")
    assert status == 200, f"Expected 200, got {status}"
    login_token = res.get("token")
    assert login_token and len(login_token.split(".")) == 3
    print("[PASS] Login succeeded with valid JWT token.")

    # Test 3: Login with invalid password
    print("\n[Test 3] POST /auth/login with wrong password...")
    status, res = request("/auth/login", method="POST", data={
        "email": test_email,
        "password": "WrongPassword!456"
    })
    print(f"Status: {status}, Detail: {res.get('detail')}")
    assert status == 401, f"Expected 401, got {status}"
    print("[PASS] Wrong password correctly rejected with 401.")

    # Test 4: Validate valid token
    print("\n[Test 4] GET /auth/validate with valid token...")
    status, res = request(f"/auth/validate?email={urllib.parse.quote(test_email)}&token={urllib.parse.quote(token)}")
    print(f"Status: {status}, Response: {res}")
    assert status == 200, f"Expected 200, got {status}"
    assert res.get("valid") is True
    print("[PASS] Valid JWT session successfully validated.")

    # Test 5: Validate tampered token
    print("\n[Test 5] GET /auth/validate with tampered token...")
    tampered_token = token[:-6] + "xxxxxx"
    status, res = request(f"/auth/validate?email={urllib.parse.quote(test_email)}&token={urllib.parse.quote(tampered_token)}")
    print(f"Status: {status}, Detail: {res.get('detail')}")
    assert status == 401, f"Expected 401, got {status}"
    print("[PASS] Tampered token correctly rejected with 401.")

    # Test 6: Validate expired token
    print("\n[Test 6] GET /auth/validate with expired token...")
    expired_payload = {
        "user_id": 9999,
        "email": test_email,
        "exp": datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=2)
    }
    expired_token = jwt.encode(expired_payload, JWT_SECRET, algorithm="HS256")
    status, res = request(f"/auth/validate?email={urllib.parse.quote(test_email)}&token={urllib.parse.quote(expired_token)}")
    print(f"Status: {status}, Detail: {res.get('detail')}")
    assert status == 401, f"Expected 401, got {status}"
    print("[PASS] Expired token correctly rejected with 401.")

    # Test 7: Validate token with mismatched email
    print("\n[Test 7] GET /auth/validate with mismatched email...")
    status, res = request(f"/auth/validate?email=other_student@careerpilot.edu&token={urllib.parse.quote(token)}")
    print(f"Status: {status}, Detail: {res.get('detail')}")
    assert status == 401, f"Expected 401, got {status}"
    print("[PASS] Mismatched email correctly rejected with 401.")

    print("\nALL AUTH TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    run_tests()
