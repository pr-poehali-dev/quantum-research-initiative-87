const AUTH_URL = "https://functions.poehali.dev/99a434cd-ceec-495f-8833-26113bdb87f7";
const MSG_URL = "https://functions.poehali.dev/e96979cb-4ab9-4fa3-84c6-4b1ca08c1d85";

function getToken() {
  return localStorage.getItem("sera_token") || "";
}

export function saveSession(token: string, user: SeraUser) {
  localStorage.setItem("sera_token", token);
  localStorage.setItem("sera_user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("sera_token");
  localStorage.removeItem("sera_user");
}

export function getSavedUser(): SeraUser | null {
  const raw = localStorage.getItem("sera_user");
  return raw ? JSON.parse(raw) : null;
}

export interface SeraUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export async function register(first_name: string, last_name: string, email: string, password: string) {
  const res = await fetch(`${AUTH_URL}?action=register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ first_name, last_name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Ошибка регистрации");
  return data as { token: string; user: SeraUser };
}

export async function login(email: string, password: string) {
  const res = await fetch(`${AUTH_URL}?action=login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Ошибка входа");
  return data as { token: string; user: SeraUser };
}

export async function getUsers(): Promise<SeraUser[]> {
  const res = await fetch(`${MSG_URL}?action=users`, {
    headers: { "X-Session-Token": getToken() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.users;
}

export interface SeraMessage {
  id: number;
  sender_id: number;
  text: string;
  time: string;
}

export async function getChat(withId: number): Promise<{ messages: SeraMessage[]; my_id: number }> {
  const res = await fetch(`${MSG_URL}?action=chat&with=${withId}`, {
    headers: { "X-Session-Token": getToken() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function sendMessage(receiver_id: number, text: string) {
  const res = await fetch(`${MSG_URL}?action=send`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Session-Token": getToken() },
    body: JSON.stringify({ receiver_id, text }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}
