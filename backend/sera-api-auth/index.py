import json
import os
import hashlib
import secrets
import psycopg2

SCHEMA = "t_p87846200_quantum_research_ini"

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def handler(event: dict, context) -> dict:
    """Регистрация и вход пользователей Sera. action=register|login|me"""
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Session-Token",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": headers, "body": ""}

    method = event.get("httpMethod")
    qs = event.get("queryStringParameters") or {}
    action = qs.get("action", "")
    body = json.loads(event.get("body") or "{}")

    conn = get_conn()
    cur = conn.cursor()

    if action == "register":
        first_name = body.get("first_name", "").strip()
        last_name = body.get("last_name", "").strip()
        email = body.get("email", "").strip().lower()
        password = body.get("password", "")

        if not all([first_name, last_name, email, password]):
            cur.close(); conn.close()
            return {"statusCode": 400, "headers": headers, "body": json.dumps({"error": "Заполните все поля"})}

        cur.execute(f"SELECT id FROM {SCHEMA}.sera_users WHERE email = '{email}'")
        if cur.fetchone():
            cur.close(); conn.close()
            return {"statusCode": 409, "headers": headers, "body": json.dumps({"error": "Email уже зарегистрирован"})}

        token = secrets.token_hex(32)
        pw_hash = hash_password(password)
        fn = first_name.replace("'", "''")
        ln = last_name.replace("'", "''")
        em = email.replace("'", "''")
        cur.execute(
            f"INSERT INTO {SCHEMA}.sera_users (first_name, last_name, email, password_hash, session_token) "
            f"VALUES ('{fn}', '{ln}', '{em}', '{pw_hash}', '{token}') "
            f"RETURNING id, first_name, last_name, email"
        )
        row = cur.fetchone()
        conn.commit()
        cur.close(); conn.close()
        return {"statusCode": 200, "headers": headers,
                "body": json.dumps({"token": token, "user": {"id": row[0], "first_name": row[1], "last_name": row[2], "email": row[3]}})}

    if action == "login":
        email = body.get("email", "").strip().lower()
        password = body.get("password", "")
        pw_hash = hash_password(password)
        em = email.replace("'", "''")

        cur.execute(f"SELECT id, first_name, last_name, email FROM {SCHEMA}.sera_users WHERE email = '{em}' AND password_hash = '{pw_hash}'")
        row = cur.fetchone()
        if not row:
            cur.close(); conn.close()
            return {"statusCode": 401, "headers": headers, "body": json.dumps({"error": "Неверный email или пароль"})}

        token = secrets.token_hex(32)
        cur.execute(f"UPDATE {SCHEMA}.sera_users SET session_token = '{token}' WHERE id = {row[0]}")
        conn.commit()
        cur.close(); conn.close()
        return {"statusCode": 200, "headers": headers,
                "body": json.dumps({"token": token, "user": {"id": row[0], "first_name": row[1], "last_name": row[2], "email": row[3]}})}

    if action == "me":
        token = (event.get("headers") or {}).get("X-Session-Token", "")
        if not token:
            cur.close(); conn.close()
            return {"statusCode": 401, "headers": headers, "body": json.dumps({"error": "Нет токена"})}
        cur.execute(f"SELECT id, first_name, last_name, email FROM {SCHEMA}.sera_users WHERE session_token = '{token}'")
        row = cur.fetchone()
        cur.close(); conn.close()
        if not row:
            return {"statusCode": 401, "headers": headers, "body": json.dumps({"error": "Сессия устарела"})}
        return {"statusCode": 200, "headers": headers,
                "body": json.dumps({"user": {"id": row[0], "first_name": row[1], "last_name": row[2], "email": row[3]}})}

    cur.close(); conn.close()
    return {"statusCode": 400, "headers": headers, "body": json.dumps({"error": "Укажите action"})}
