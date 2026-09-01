const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/backend";

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  organization?: string | null;
  preferred_language?: string | null;
  department?: string | null;
  manager_id?: string | null;
  /** "user" | "manager" | "admin" */
  role?: string | null;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

// ── Login ─────────────────────────────────────────────────────────────────────
export async function login(email: string, password: string): Promise<LoginResponse> {
  const body = new URLSearchParams({ username: email, password });
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail ?? "Login failed");
  }
  return res.json();
}

// ── Register ──────────────────────────────────────────────────────────────────
export async function register(
  email: string,
  password: string,
  full_name?: string,
  organization?: string
): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, full_name, organization }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail ?? "Registration failed");
  }
  return res.json();
}

// ── Logout ────────────────────────────────────────────────────────────────────
export async function logout(token: string): Promise<void> {
  await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ── Get Current User ──────────────────────────────────────────────────────────
export async function getMe(token: string): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
}

// ── Update Profile ────────────────────────────────────────────────────────────
export async function updateProfile(
  token: string,
  data: Partial<{
    full_name: string;
    bio: string;
    avatar_url: string;
    organization: string;
    preferred_language: string;
    password: string;
  }>
): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/users/me`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail ?? "Update failed");
  }
  return res.json();
}
