/**
 * notificationService.ts — Frontend API wrappers for Email & WhatsApp notifications
 *
 * Email  : Resend (free — 3,000 emails/month) — requires RESEND_API_KEY in backend .env
 * WhatsApp: CallMeBot (free, no Meta account) — requires recipient activation + CALLMEBOT_DEFAULT_APIKEY
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SendEmailRequest {
  to: string;
  subject: string;
  html_body: string;
  text_body?: string;
}

export interface SendWhatsAppRequest {
  phone: string;
  message: string;
  apikey?: string; // recipient's CallMeBot API key
}

export interface BulkNotifyRequest {
  recipient_ids: string[];
  campaign_title: string;
  campaign_content: string;
  channels: ("email" | "whatsapp")[];
}

export interface NotificationResult {
  success: boolean;
  simulated?: boolean;
  warning?: string;
  error?: string;
  message_id?: string;
  provider?: string;
  to?: string | string[];
  phone?: string;
  response?: string;
}

export interface BulkNotifyResult {
  campaign_title: string;
  total_recipients: number;
  channels: string[];
  results: Array<{
    recipient_id: string;
    recipient_name: string;
    results: Record<string, NotificationResult>;
  }>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") return { "Content-Type": "application/json" };
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ── Email — Resend ────────────────────────────────────────────────────────────

/**
 * Send a transactional email via the Resend free API (manager+ role required).
 * Free tier: 3,000 emails/month, 100/day. Sign up at https://resend.com
 */
export async function sendEmail(req: SendEmailRequest): Promise<NotificationResult> {
  const resp = await fetch(`${API_BASE}/notify/email`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(req),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.detail || `Email API error ${resp.status}`);
  }

  return resp.json();
}

// ── WhatsApp — CallMeBot ─────────────────────────────────────────────────────

/**
 * Send a WhatsApp message via the CallMeBot free API (manager+ role required).
 * Completely free — no Meta Business account needed.
 * Recipients must activate once by messaging +34 644 81 31 64 on WhatsApp.
 */
export async function sendWhatsApp(req: SendWhatsAppRequest): Promise<NotificationResult> {
  const resp = await fetch(`${API_BASE}/notify/whatsapp`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(req),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.detail || `WhatsApp API error ${resp.status}`);
  }

  return resp.json();
}

// ── Bulk Notify ───────────────────────────────────────────────────────────────

/**
 * Send campaign notifications to multiple saved recipients via Email and/or WhatsApp.
 * Requires manager or admin role.
 */
export async function bulkNotify(req: BulkNotifyRequest): Promise<BulkNotifyResult> {
  const resp = await fetch(`${API_BASE}/notify/bulk`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(req),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.detail || `Bulk notify error ${resp.status}`);
  }

  return resp.json();
}

// ── Manager Tasks ─────────────────────────────────────────────────────────────

export async function getManagerTasks() {
  const resp = await fetch(`${API_BASE}/manager/tasks`, {
    headers: getAuthHeaders(),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.detail || `Manager tasks error ${resp.status}`);
  }

  return resp.json();
}

// ── User Tasks ────────────────────────────────────────────────────────────────

export async function getUserTasks() {
  const resp = await fetch(`${API_BASE}/user/tasks`, {
    headers: getAuthHeaders(),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.detail || `User tasks error ${resp.status}`);
  }

  return resp.json();
}
