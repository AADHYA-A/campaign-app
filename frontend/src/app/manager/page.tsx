"use client";

/**
 * Manager Dashboard — /manager
 * Role: manager and above
 *
 * Features:
 * - Task overview: campaigns to distribute, active jobs
 * - Send Email (Resend free API) and WhatsApp (CallMeBot free API)
 * - View team members
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  sendEmail,
  sendWhatsApp,
  getManagerTasks,
} from "@/services/notificationService";
import {
  Mail,
  MessageCircle,
  Users,
  Zap,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  BarChart3,
  FileText,
  ChevronRight,
  Loader2,
} from "lucide-react";

interface NotifyResult {
  success: boolean;
  simulated?: boolean;
  warning?: string;
  error?: string;
  message_id?: string;
  provider?: string;
  response?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ManagerDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = useState<any>(null);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState("");

  // Email form
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailResult, setEmailResult] = useState<NotifyResult | null>(null);

  // WhatsApp form
  const [waPhone, setWaPhone] = useState("");
  const [waMessage, setWaMessage] = useState("");
  const [waApikey, setWaApikey] = useState("");
  const [waLoading, setWaLoading] = useState(false);
  const [waResult, setWaResult] = useState<NotifyResult | null>(null);

  const role = (user as any)?.role as string | undefined;
  const isManager = role === "manager" || role === "admin" || user?.is_superuser;

  // Auth guard
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isManager)) {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, isManager, router]);

  // Load manager tasks
  useEffect(() => {
    if (!isLoading && isAuthenticated && isManager) {
      setTasksLoading(true);
      getManagerTasks()
        .then(setTasks)
        .catch((e) => setTasksError(e.message))
        .finally(() => setTasksLoading(false));
    }
  }, [isLoading, isAuthenticated, isManager]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailLoading(true);
    setEmailResult(null);
    try {
      const result = await sendEmail({
        to: emailTo,
        subject: emailSubject,
        html_body: `<div style="font-family:sans-serif;padding:20px;">${emailBody.replace(/\n/g, "<br/>")}</div>`,
        text_body: emailBody,
      });
      setEmailResult(result);
    } catch (err: any) {
      setEmailResult({ success: false, error: err.message });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleSendWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setWaLoading(true);
    setWaResult(null);
    try {
      const result = await sendWhatsApp({
        phone: waPhone,
        message: waMessage,
        apikey: waApikey || undefined,
      });
      setWaResult(result);
    } catch (err: any) {
      setWaResult({ success: false, error: err.message });
    } finally {
      setWaLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (isLoading || !isAuthenticated) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "#4f46e5" }} />
      </div>
    );
  }

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Page Title */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "linear-gradient(135deg, #0891b2, #0e7490)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 16px rgba(8,145,178,0.3)",
          }}>
            <Zap size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800, color: "var(--foreground)" }}>
              Manager Dashboard
            </h1>
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.875rem" }}>
              Send notifications, manage distributions, oversee team
            </p>
          </div>
          <span style={{
            marginLeft: "auto",
            padding: "0.3rem 0.85rem", borderRadius: 20,
            background: "rgba(8,145,178,0.12)", border: "1px solid rgba(8,145,178,0.3)",
            color: "#0891b2", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase",
          }}>
            {role?.toUpperCase() || "MANAGER"} ROLE
          </span>
        </div>

        {/* Permissions strip */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
          {["Send Email Notifications", "Send WhatsApp Messages", "Launch Distributions", "View Analytics", "Manage Recipients"].map((p) => (
            <span key={p} style={{
              padding: "0.2rem 0.65rem", borderRadius: 20,
              background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)",
              color: "#818cf8", fontSize: "0.75rem", fontWeight: 600,
            }}>
              ✓ {p}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>

        {/* ── Email Notification ─────────────────────────────────────────── */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem" }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #3b82f6, #2563eb)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Mail size={18} color="#fff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--foreground)" }}>
                Send Email
              </h2>
              <p style={{ margin: 0, fontSize: "0.73rem", color: "#64748b" }}>
                Resend API — Free: 3,000/month · 100/day
              </p>
            </div>
          </div>

          <form onSubmit={handleSendEmail} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#94a3b8", marginBottom: "0.3rem" }}>
                To (email address)
              </label>
              <input
                id="email-to"
                type="email"
                required
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                placeholder="recipient@example.com"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#94a3b8", marginBottom: "0.3rem" }}>
                Subject
              </label>
              <input
                id="email-subject"
                type="text"
                required
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Campaign Update"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#94a3b8", marginBottom: "0.3rem" }}>
                Message Body
              </label>
              <textarea
                id="email-body"
                required
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Your campaign message here..."
                rows={4}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            <button
              id="send-email-btn"
              type="submit"
              disabled={emailLoading}
              className="btn btn-primary"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}
            >
              {emailLoading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={16} />}
              {emailLoading ? "Sending..." : "Send Email"}
            </button>
          </form>

          {/* Email Result */}
          {emailResult && (
            <div style={{
              marginTop: "0.75rem",
              padding: "0.75rem 1rem",
              borderRadius: 10,
              background: emailResult.success
                ? "rgba(16,185,129,0.08)"
                : emailResult.simulated
                ? "rgba(245,158,11,0.08)"
                : "rgba(239,68,68,0.08)",
              border: `1px solid ${emailResult.success ? "rgba(16,185,129,0.25)" : emailResult.simulated ? "rgba(245,158,11,0.25)" : "rgba(239,68,68,0.25)"}`,
              display: "flex", alignItems: "flex-start", gap: "0.5rem",
            }}>
              {emailResult.success
                ? <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                : emailResult.simulated
                ? <AlertCircle size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
                : <XCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />}
              <div style={{ fontSize: "0.8rem" }}>
                {emailResult.success && <p style={{ margin: 0, color: "#10b981", fontWeight: 700 }}>Email sent! ID: {emailResult.message_id}</p>}
                {emailResult.simulated && (
                  <>
                    <p style={{ margin: 0, color: "#f59e0b", fontWeight: 700 }}>Simulated (key not configured)</p>
                    <p style={{ margin: "2px 0 0", color: "#94a3b8" }}>{emailResult.warning}</p>
                    <p style={{ margin: "4px 0 0", color: "#64748b" }}>Set RESEND_API_KEY in backend/.env → <a href="https://resend.com" target="_blank" rel="noopener" style={{ color: "#818cf8" }}>resend.com</a></p>
                  </>
                )}
                {emailResult.error && !emailResult.simulated && (
                  <p style={{ margin: 0, color: "#ef4444" }}>Error: {emailResult.error}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── WhatsApp Notification ──────────────────────────────────────── */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem" }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <MessageCircle size={18} color="#fff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--foreground)" }}>
                Send WhatsApp
              </h2>
              <p style={{ margin: 0, fontSize: "0.73rem", color: "#64748b" }}>
                CallMeBot — Free, no Meta account needed
              </p>
            </div>
          </div>

          {/* Activation instructions */}
          <div style={{
            padding: "0.65rem 0.9rem", borderRadius: 8, marginBottom: "1rem",
            background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)",
          }}>
            <p style={{ margin: 0, fontSize: "0.75rem", color: "#4ade80", fontWeight: 700 }}>📱 One-time activation required:</p>
            <p style={{ margin: "4px 0 0", fontSize: "0.73rem", color: "#94a3b8", lineHeight: 1.5 }}>
              Recipient must WhatsApp <strong style={{ color: "#e2e8f0" }}>+34 644 81 31 64</strong> with the text{" "}
              <em>"I allow callmebot to send me messages"</em> to receive their API key.
            </p>
          </div>

          <form onSubmit={handleSendWhatsApp} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#94a3b8", marginBottom: "0.3rem" }}>
                Phone Number (with country code)
              </label>
              <input
                id="wa-phone"
                type="text"
                required
                value={waPhone}
                onChange={(e) => setWaPhone(e.target.value)}
                placeholder="+919810123456"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#94a3b8", marginBottom: "0.3rem" }}>
                CallMeBot API Key (recipient's key)
              </label>
              <input
                id="wa-apikey"
                type="text"
                value={waApikey}
                onChange={(e) => setWaApikey(e.target.value)}
                placeholder="Leave blank to use default from .env"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#94a3b8", marginBottom: "0.3rem" }}>
                Message
              </label>
              <textarea
                id="wa-message"
                required
                value={waMessage}
                onChange={(e) => setWaMessage(e.target.value)}
                placeholder="Your campaign message..."
                rows={4}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            <button
              id="send-whatsapp-btn"
              type="submit"
              disabled={waLoading}
              className="btn btn-primary"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem",
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
              }}
            >
              {waLoading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <MessageCircle size={16} />}
              {waLoading ? "Sending..." : "Send WhatsApp"}
            </button>
          </form>

          {/* WhatsApp Result */}
          {waResult && (
            <div style={{
              marginTop: "0.75rem",
              padding: "0.75rem 1rem",
              borderRadius: 10,
              background: waResult.success
                ? "rgba(34,197,94,0.08)"
                : waResult.simulated
                ? "rgba(245,158,11,0.08)"
                : "rgba(239,68,68,0.08)",
              border: `1px solid ${waResult.success ? "rgba(34,197,94,0.25)" : waResult.simulated ? "rgba(245,158,11,0.25)" : "rgba(239,68,68,0.25)"}`,
              display: "flex", alignItems: "flex-start", gap: "0.5rem",
            }}>
              {waResult.success
                ? <CheckCircle2 size={16} color="#22c55e" style={{ flexShrink: 0, marginTop: 2 }} />
                : waResult.simulated
                ? <AlertCircle size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
                : <XCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />}
              <div style={{ fontSize: "0.8rem" }}>
                {waResult.success && <p style={{ margin: 0, color: "#22c55e", fontWeight: 700 }}>WhatsApp sent! {waResult.response}</p>}
                {waResult.simulated && (
                  <>
                    <p style={{ margin: 0, color: "#f59e0b", fontWeight: 700 }}>Simulated (key not configured)</p>
                    <p style={{ margin: "2px 0 0", color: "#94a3b8" }}>{waResult.warning}</p>
                    <p style={{ margin: "4px 0 0", color: "#64748b" }}>Set CALLMEBOT_DEFAULT_APIKEY in backend/.env</p>
                  </>
                )}
                {waResult.error && !waResult.simulated && (
                  <p style={{ margin: 0, color: "#ef4444" }}>Error: {waResult.error}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Task Summary ────────────────────────────────────────────────── */}
        <div className="card" style={{ padding: "1.5rem", gridColumn: "1 / -1" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem" }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <FileText size={18} color="#fff" />
            </div>
            <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--foreground)" }}>
              Campaign Tasks to Review
            </h2>
          </div>

          {tasksLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
              <Loader2 size={24} style={{ animation: "spin 1s linear infinite", color: "#4f46e5" }} />
            </div>
          ) : tasksError ? (
            <p style={{ color: "#ef4444", fontSize: "0.875rem" }}>Failed to load tasks: {tasksError}</p>
          ) : tasks ? (
            <div>
              {/* Campaign cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
                {tasks.tasks?.review_campaigns?.slice(0, 6).map((c: any) => (
                  <div key={c.id} style={{
                    padding: "0.9rem 1rem",
                    borderRadius: 10,
                    background: "rgba(99,102,241,0.05)",
                    border: "1px solid rgba(99,102,241,0.15)",
                    display: "flex", flexDirection: "column", gap: "0.4rem",
                  }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: "0.875rem", color: "var(--foreground)" }}>{c.topic}</p>
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                      <span style={tagStyle("#4f46e5")}>{c.tone}</span>
                      <span style={tagStyle("#0891b2")}>{c.target_language}</span>
                    </div>
                    <p style={{ margin: "4px 0 0", fontSize: "0.72rem", color: "#64748b" }}>
                      {c.action}
                    </p>
                  </div>
                ))}
              </div>

              {/* Team */}
              {tasks.team?.length > 0 && (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <Users size={16} color="#818cf8" />
                    <h3 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: "var(--foreground)" }}>
                      Your Team ({tasks.team.length})
                    </h3>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {tasks.team.map((u: any) => (
                      <div key={u.id} style={{
                        padding: "0.4rem 0.85rem", borderRadius: 20,
                        background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
                        display: "flex", alignItems: "center", gap: "0.4rem",
                      }}>
                        <span style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg,#4f46e5,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.7rem", fontWeight: 800 }}>
                          {(u.name || u.email)[0].toUpperCase()}
                        </span>
                        <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--foreground)" }}>{u.name || u.email}</span>
                        <span style={tagStyle("#10b981")}>{u.role}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.6rem 0.85rem",
  borderRadius: 8,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid var(--border)",
  color: "var(--foreground)",
  fontSize: "0.875rem",
  outline: "none",
  boxSizing: "border-box",
};

function tagStyle(color: string): React.CSSProperties {
  return {
    padding: "0.15rem 0.5rem",
    borderRadius: 12,
    background: `${color}15`,
    border: `1px solid ${color}30`,
    color,
    fontSize: "0.7rem",
    fontWeight: 700,
  };
}
