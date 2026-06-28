import json
import os
import psycopg2

SCHEMA = "t_p87846200_quantum_research_ini"

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def get_user_by_token(cur, token):
    cur.execute(f"SELECT id, first_name, last_name FROM {SCHEMA}.sera_users WHERE session_token = '{token}'")
    return cur.fetchone()

def handler(event: dict, context) -> dict:
    """Сообщения Sera. action=users|chat|send"""
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Session-Token",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": headers, "body": ""}

    qs = event.get("queryStringParameters") or {}
    action = qs.get("action", "")
    token = (event.get("headers") or {}).get("X-Session-Token", "")

    conn = get_conn()
    cur = conn.cursor()

    me = get_user_by_token(cur, token)
    if not me:
        cur.close(); conn.close()
        return {"statusCode": 401, "headers": headers, "body": json.dumps({"error": "Не авторизован"})}

    my_id = me[0]

    if action == "users":
        cur.execute(f"SELECT id, first_name, last_name FROM {SCHEMA}.sera_users WHERE id != {my_id} ORDER BY first_name")
        rows = cur.fetchall()
        users = [{"id": r[0], "first_name": r[1], "last_name": r[2]} for r in rows]
        cur.close(); conn.close()
        return {"statusCode": 200, "headers": headers, "body": json.dumps({"users": users})}

    if action == "chat":
        with_id = qs.get("with", "")
        if not with_id:
            cur.close(); conn.close()
            return {"statusCode": 400, "headers": headers, "body": json.dumps({"error": "Укажите with"})}
        cur.execute(
            f"SELECT id, sender_id, text, created_at FROM {SCHEMA}.sera_messages "
            f"WHERE (sender_id = {my_id} AND receiver_id = {with_id}) "
            f"OR (sender_id = {with_id} AND receiver_id = {my_id}) "
            f"ORDER BY created_at ASC LIMIT 100"
        )
        rows = cur.fetchall()
        messages = [{"id": r[0], "sender_id": r[1], "text": r[2], "time": r[3].strftime("%H:%M")} for r in rows]
        cur.close(); conn.close()
        return {"statusCode": 200, "headers": headers, "body": json.dumps({"messages": messages, "my_id": my_id})}

    if action == "send":
        body = json.loads(event.get("body") or "{}")
        receiver_id = body.get("receiver_id")
        text = body.get("text", "").strip()
        if not receiver_id or not text:
            cur.close(); conn.close()
            return {"statusCode": 400, "headers": headers, "body": json.dumps({"error": "Укажите receiver_id и text"})}
        safe_text = text.replace("'", "''")
        cur.execute(
            f"INSERT INTO {SCHEMA}.sera_messages (sender_id, receiver_id, text) "
            f"VALUES ({my_id}, {receiver_id}, '{safe_text}') RETURNING id, created_at"
        )
        row = cur.fetchone()
        conn.commit()
        cur.close(); conn.close()
        return {"statusCode": 200, "headers": headers,
                "body": json.dumps({"id": row[0], "time": row[1].strftime("%H:%M"), "my_id": my_id})}

    cur.close(); conn.close()
    return {"statusCode": 400, "headers": headers, "body": json.dumps({"error": "Укажите action"})}
