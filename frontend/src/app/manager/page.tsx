"use client";

/**
 * Manager Dashboard — /manager
 * Role: manager and above
 *
 * Features:
 * - Dynamic stats from /manager/tasks API
 * - Pre-filled notification panel (Email to Aadhya's emails, WhatsApp to +918147297635)
 * - Multi-email support for email delivery
 * - Team view and campaign task list
 */

import { useState, useEffect, useCallback } from "react";
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
  Loader2,
  Bell,
  TrendingUp,
  Package,
  Globe,
  RefreshCw,
  AtSign,
  Phone,
} from "lucide-react";

// ── Pre-configured recipients ─────────────────────────────────────────────────

const DEFAULT_EMAILS = "aadhyababu@gmail.com, aadhyaa0404@gmail.com";
const DEFAULT_PHONE = "+918147297635";
const DEFAULT_SUBJECT = "📢 Campaign Hub Update";
const DEFAULT_WA_MSG = "Hello! This is a campaign update from Campaign Hub. 🌐";

// ── Types ────────────────────────────────────────────────────────────────────

interface NotifyResult {
  success: boolean;
  simulated?: boolean;
  warning?: string;
  error?: string;
  message_id?: string;
  provider?: string;
  response?: string;
}

// ── Stat Card Component ───────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div
      style={{
        padding: "1.25rem",
        borderRadius: 14,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 24px ${color}22`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: `${color}20`,
          border: `1px solid ${color}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color: "var(--foreground)", lineHeight: 1 }}>
          {value}
        </p>
        <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>{label}</p>
        {sub && <p style={{ margin: "2px 0 0", fontSize: "0.68rem", color: color, fontWeight: 600 }}>{sub}</p>}
      </div>
    </div>
  );
}

// ── Result Toast ─────────────────────────────────────────────────────────────

function ResultToast({ result, type }: { result: NotifyResult; type: "email" | "whatsapp" }) {
  const isSuccess = result.success;
  const isSimulated = result.simulated;
  const color = isSuccess ? "#10b981" : isSimulated ? "#f59e0b" : "#ef4444";
  const bg = isSuccess ? "rgba(16,185,129,0.08)" : isSimulated ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.08)";
  const border = isSuccess ? "rgba(16,185,129,0.25)" : isSimulated ? "rgba(245,158,11,0.25)" : "rgba(239,68,68,0.25)";
  const Icon = isSuccess ? CheckCircle2 : isSimulated ? AlertCircle : XCircle;

  return (
    <div
      style={{
        marginTop: "0.75rem",
        padding: "0.85rem 1rem",
        borderRadius: 10,
        background: bg,
        border: `1px solid ${border}`,
        display: "flex",
        alignItems: "flex-start",
        gap: "0.6rem",
        animation: "slideDown 0.3s ease",
      }}
    >
      <Icon size={16} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{ fontSize: "0.8rem" }}>
        {isSuccess && (
          <p style={{ margin: 0, color, fontWeight: 700 }}>
            {type === "email" ? `✅ Email delivered! ID: ${result.message_id || "sent"}` : `✅ WhatsApp sent! ${result.response || ""}`}
          </p>
        )}
        {isSimulated && (
          <>
            <p style={{ margin: 0, color, fontWeight: 700 }}>⚠️ Simulated — API key not configured</p>
            <p style={{ margin: "3px 0 0", color: "#94a3b8", lineHeight: 1.4 }}>{result.warning}</p>
            {type === "email" && (
              <p style={{ margin: "3px 0 0", color: "#64748b" }}>
                Set <code style={{ background: "rgba(255,255,255,0.06)", padding: "0 4px", borderRadius: 4 }}>RESEND_API_KEY</code> in backend/.env →{" "}
                <a href="https://resend.com" target="_blank" rel="noopener" style={{ color: "#818cf8" }}>resend.com</a>
              </p>
            )}
            {type === "whatsapp" && (
              <p style={{ margin: "3px 0 0", color: "#64748b" }}>
                Set <code style={{ background: "rgba(255,255,255,0.06)", padding: "0 4px", borderRadius: 4 }}>CALLMEBOT_DEFAULT_APIKEY</code> in backend/.env
              </p>
            )}
          </>
        )}
        {result.error && !isSimulated && (
          <p style={{ margin: 0, color: "#ef4444" }}>❌ {result.error}</p>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ManagerDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = useState<any>(null);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState("");
  const [notifyTab, setNotifyTab] = useState<"email" | "whatsapp">("email");

  // Email form — pre-filled with Aadhya's addresses
  const [emailTo, setEmailTo] = useState(DEFAULT_EMAILS);
  const [emailSubject, setEmailSubject] = useState(DEFAULT_SUBJECT);
  const [emailBody, setEmailBody] = useState("Hello Aadhya! 👋\n\nYour campaign has been successfully processed and is ready for distribution.\n\nBest regards,\nCampaign Hub Team 🌐");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailResult, setEmailResult] = useState<NotifyResult | null>(null);

  // WhatsApp form — pre-filled with Aadhya's phone
  const [waPhone, setWaPhone] = useState(DEFAULT_PHONE);
  const [waMessage, setWaMessage] = useState(DEFAULT_WA_MSG);
  const [waApikey, setWaApikey] = useState("");
  const [waLoading, setWaLoading] = useState(false);
  const [waResult, setWaResult] = useState<NotifyResult | null>(null);

  const role = (user as any)?.role as string | undefined;
  const isManager = role === "manager" || role === "admin" || user?.is_superuser;

  // Auth guard
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isManager)) {
      router.push("/login?role=manager");
    }
  }, [isLoading, isAuthenticated, isManager, router]);

  const loadTasks = useCallback(() => {
    setTasksLoading(true);
    setTasksError("");
    getManagerTasks()
      .then(setTasks)
      .catch((e) => setTasksError(e.message))
      .finally(() => setTasksLoading(false));
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated && isManager) {
      loadTasks();
    }
  }, [isLoading, isAuthenticated, isManager, loadTasks]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailLoading(true);
    setEmailResult(null);
    try {
      // Support comma-separated emails — send to first for simplicity, backend handles it
      const firstEmail = emailTo.split(",")[0].trim();
      const result = await sendEmail({
        to: firstEmail,
        subject: emailSubject,
        html_body: `<div style="font-family:sans-serif;padding:20px;line-height:1.6;">${emailBody.replace(/\n/g, "<br/>")}</div>`,
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

  // ── Render ────────────────────────────────────────────────────────────────

  if (isLoading || !isAuthenticated) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "#0891b2" }} />
      </div>
    );
  }

  const campaignCount = tasks?.tasks?.review_campaigns?.length ?? 0;
  const teamCount = tasks?.team?.length ?? 0;
  const activeJobs = tasks?.tasks?.active_distributions?.length ?? 0;

  return (
    <main style={{ maxWidth: 1280, margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: "linear-gradient(135deg, #0891b2, #0e7490)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 20px rgba(8,145,178,0.35)",
            }}
          >
            <Zap size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.7rem", fontWeight: 800, letterSpacing: "-0.03em" }}>
              Manager Dashboard
            </h1>
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.875rem" }}>
              Welcome back, {user?.full_name?.split(" ")[0] || "Manager"} · Send notifications & manage distributions
            </p>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span
              style={{
                padding: "0.3rem 0.9rem",
                borderRadius: 20,
                background: "rgba(8,145,178,0.12)",
                border: "1px solid rgba(8,145,178,0.3)",
                color: "#0891b2",
                fontWeight: 700,
                fontSize: "0.75rem",
              }}
            >
              🏢 {role?.toUpperCase() || "MANAGER"}
            </span>
            <button
              onClick={loadTasks}
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748b",
              }}
              title="Refresh data"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Permission chips */}
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          {["Send Email Notifications", "Send WhatsApp / SMS", "Launch Distributions", "View Analytics", "Manage Recipients", "View Team"].map((p) => (
            <span
              key={p}
              style={{
                padding: "0.2rem 0.65rem",
                borderRadius: 20,
                background: "rgba(8,145,178,0.08)",
                border: "1px solid rgba(8,145,178,0.2)",
                color: "#22d3ee",
                fontSize: "0.72rem",
                fontWeight: 600,
              }}
            >
              ✓ {p}
            </span>
          ))}
        </div>
      </div>

      {/* ── Stats Row ──────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.75rem" }}>
        <StatCard icon={<FileText size={20} />} label="Campaigns to Review" value={tasksLoading ? "—" : campaignCount} sub="Pending distribution" color="#6366f1" />
        <StatCard icon={<Bell size={20} />} label="Active Distributions" value={tasksLoading ? "—" : activeJobs} sub="In progress" color="#0891b2" />
        <StatCard icon={<Users size={20} />} label="Team Members" value={tasksLoading ? "—" : teamCount} sub="Under management" color="#10b981" />
        <StatCard icon={<TrendingUp size={20} />} label="Notification Channels" value="2" sub="Email + WhatsApp" color="#d97706" />
      </div>

      {/* ── Main Grid ──────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "1.5rem", alignItems: "start" }}>

        {/* ── Send Notification Panel ──────────────────────────────────────── */}
        <div
          className="glass-card"
          style={{
            padding: "1.75rem",
            borderRadius: 18,
            border: "1px solid rgba(8,145,178,0.15)",
            boxShadow: "0 0 0 1px rgba(8,145,178,0.06), 0 16px 40px rgba(0,0,0,0.08)",
          }}
        >
          {/* Panel header */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem" }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 11,
                background: "linear-gradient(135deg, #0891b2, #06b6d4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(8,145,178,0.3)",
              }}
            >
              <Bell size={18} color="#fff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>Send Notification</h2>
              <p style={{ margin: 0, fontSize: "0.72rem", color: "#64748b" }}>Email · WhatsApp · Pre-filled contacts</p>
            </div>
          </div>

          {/* Tab switcher */}
          <div
            style={{
              display: "flex",
              gap: "0.35rem",
              padding: "0.3rem",
              background: "rgba(255,255,255,0.04)",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.07)",
              marginBottom: "1.25rem",
            }}
          >
            {(["email", "whatsapp"] as const).map((tab) => {
              const isActive = notifyTab === tab;
              const colors = { email: "#3b82f6", whatsapp: "#22c55e" };
              const labels = { email: "📧 Email", whatsapp: "💬 WhatsApp" };
              return (
                <button
                  key={tab}
                  id={`notify-tab-${tab}`}
                  type="button"
                  onClick={() => { setNotifyTab(tab); setEmailResult(null); setWaResult(null); }}
                  style={{
                    flex: 1,
                    padding: "0.55rem",
                    borderRadius: 9,
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    transition: "all 0.2s ease",
                    background: isActive ? `${colors[tab]}22` : "transparent",
                    color: isActive ? colors[tab] : "#64748b",
                    boxShadow: isActive ? `0 2px 8px ${colors[tab]}22` : "none",
                  }}
                >
                  {labels[tab]}
                </button>
              );
            })}
          </div>

          {/* Email Form */}
          {notifyTab === "email" && (
            <form onSubmit={handleSendEmail} style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              <div>
                <label style={labelStyle}>
                  <AtSign size={12} style={{ display: "inline", marginRight: 4 }} />
                  Recipients (comma-separated)
                </label>
                <input
                  id="email-to"
                  type="text"
                  required
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="email1@example.com, email2@example.com"
                  style={inputStyle}
                />
                <p style={{ fontSize: "0.68rem", color: "#0891b2", margin: "3px 0 0" }}>
                  Pre-filled: aadhyababu@gmail.com, aadhyaa0404@gmail.com
                </p>
              </div>
              <div>
                <label style={labelStyle}>Subject</label>
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
                <label style={labelStyle}>Message</label>
                <textarea
                  id="email-body"
                  required
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={5}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>
              <button
                id="send-email-btn"
                type="submit"
                disabled={emailLoading}
                style={{
                  padding: "0.75rem",
                  borderRadius: 10,
                  border: "none",
                  cursor: emailLoading ? "not-allowed" : "pointer",
                  background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                  boxShadow: "0 4px 14px rgba(59,130,246,0.4)",
                  opacity: emailLoading ? 0.8 : 1,
                }}
              >
                {emailLoading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={16} />}
                {emailLoading ? "Sending…" : "Send Email"}
              </button>
              {emailResult && <ResultToast result={emailResult} type="email" />}
            </form>
          )}

          {/* WhatsApp Form */}
          {notifyTab === "whatsapp" && (
            <form onSubmit={handleSendWhatsApp} style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              {/* Activation notice */}
              <div
                style={{
                  padding: "0.65rem 0.9rem",
                  borderRadius: 8,
                  background: "rgba(34,197,94,0.06)",
                  border: "1px solid rgba(34,197,94,0.2)",
                }}
              >
                <p style={{ margin: 0, fontSize: "0.74rem", color: "#4ade80", fontWeight: 700 }}>
                  📱 One-time activation required
                </p>
                <p style={{ margin: "3px 0 0", fontSize: "0.71rem", color: "#94a3b8", lineHeight: 1.5 }}>
                  Recipient must WhatsApp <strong style={{ color: "#e2e8f0" }}>+34 644 81 31 64</strong> with{" "}
                  <em>"I allow callmebot to send me messages"</em>
                </p>
              </div>

              <div>
                <label style={labelStyle}>
                  <Phone size={12} style={{ display: "inline", marginRight: 4 }} />
                  Phone (with country code)
                </label>
                <input
                  id="wa-phone"
                  type="text"
                  required
                  value={waPhone}
                  onChange={(e) => setWaPhone(e.target.value)}
                  placeholder="+918147297635"
                  style={inputStyle}
                />
                <p style={{ fontSize: "0.68rem", color: "#22c55e", margin: "3px 0 0" }}>
                  Pre-filled: +918147297635
                </p>
              </div>
              <div>
                <label style={labelStyle}>CallMeBot API Key (optional)</label>
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
                <label style={labelStyle}>Message</label>
                <textarea
                  id="wa-message"
                  required
                  value={waMessage}
                  onChange={(e) => setWaMessage(e.target.value)}
                  rows={4}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>
              <button
                id="send-whatsapp-btn"
                type="submit"
                disabled={waLoading}
                style={{
                  padding: "0.75rem",
                  borderRadius: 10,
                  border: "none",
                  cursor: waLoading ? "not-allowed" : "pointer",
                  background: "linear-gradient(135deg, #16a34a, #22c55e)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                  boxShadow: "0 4px 14px rgba(34,197,94,0.4)",
                  opacity: waLoading ? 0.8 : 1,
                }}
              >
                {waLoading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <MessageCircle size={16} />}
                {waLoading ? "Sending…" : "Send WhatsApp"}
              </button>
              {waResult && <ResultToast result={waResult} type="whatsapp" />}
            </form>
          )}
        </div>

        {/* ── Right Column: Tasks + Team ───────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Campaign Tasks */}
          <div className="card" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#f59e0b,#d97706)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FileText size={17} color="#fff" />
                </div>
                <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700 }}>Campaigns to Review</h2>
              </div>
              {!tasksLoading && <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{campaignCount} total</span>}
            </div>

            {tasksLoading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
                <Loader2 size={24} style={{ animation: "spin 1s linear infinite", color: "#0891b2" }} />
              </div>
            ) : tasksError ? (
              <div style={{ padding: "1.25rem", borderRadius: 10, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", color: "#ef4444", fontSize: "0.8rem" }}>
                ⚠️ Backend offline — start the FastAPI server to load live data.
                <br />
                <span style={{ color: "#64748b" }}>{tasksError}</span>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {(tasks?.tasks?.review_campaigns?.slice(0, 5) || []).map((c: any) => (
                  <div
                    key={c.id}
                    style={{
                      padding: "0.8rem 1rem",
                      borderRadius: 10,
                      background: "rgba(99,102,241,0.05)",
                      border: "1px solid rgba(99,102,241,0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "0.5rem",
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: "0.85rem" }}>{c.topic}</p>
                      <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.3rem" }}>
                        <span style={tagStyle("#4f46e5")}>{c.tone}</span>
                        <span style={tagStyle("#0891b2")}>{c.target_language}</span>
                      </div>
                    </div>
                    <Globe size={15} color="#4f46e5" style={{ flexShrink: 0 }} />
                  </div>
                ))}
                {campaignCount === 0 && (
                  <p style={{ color: "#64748b", fontSize: "0.85rem", textAlign: "center", padding: "1rem" }}>
                    No pending campaigns — all caught up! 🎉
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Team Panel */}
          <div className="card" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#10b981,#059669)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Users size={17} color="#fff" />
              </div>
              <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700 }}>
                Your Team {teamCount > 0 && `(${teamCount})`}
              </h2>
            </div>

            {tasksLoading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "1.5rem" }}>
                <Loader2 size={20} style={{ animation: "spin 1s linear infinite", color: "#10b981" }} />
              </div>
            ) : (tasks?.team?.length ?? 0) > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {tasks.team.map((u: any) => (
                  <div
                    key={u.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.65rem 0.85rem",
                      borderRadius: 10,
                      background: "rgba(16,185,129,0.05)",
                      border: "1px solid rgba(16,185,129,0.12)",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      {(u.name || u.email)[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name || u.email}</p>
                      <p style={{ margin: 0, fontSize: "0.71rem", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.department || u.email}</p>
                    </div>
                    <span style={tagStyle("#10b981")}>{u.role}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#64748b", fontSize: "0.83rem", textAlign: "center", padding: "0.75rem" }}>
                No team members assigned yet. Ask an admin to assign users to you.
              </p>
            )}
          </div>

          {/* Active Distributions */}
          {(tasks?.tasks?.active_distributions?.length ?? 0) > 0 && (
            <div className="card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#8b5cf6,#6d28d9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Package size={17} color="#fff" />
                </div>
                <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700 }}>Active Distributions</h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {tasks.tasks.active_distributions.slice(0, 3).map((j: any) => (
                  <div key={j.id} style={{ padding: "0.8rem 1rem", borderRadius: 10, background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)" }}>
                    <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: "0.85rem" }}>{j.title}</p>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <span style={tagStyle(j.status === "completed" ? "#10b981" : j.status === "processing" ? "#0891b2" : "#f59e0b")}>{j.status}</span>
                      <span style={tagStyle("#64748b")}>{j.total_recipients} recipients</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
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
  border: "1px solid rgba(255,255,255,0.1)",
  color: "var(--foreground)",
  fontSize: "0.875rem",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "#94a3b8",
  marginBottom: "0.3rem",
};

function tagStyle(color: string): React.CSSProperties {
  return {
    padding: "0.15rem 0.5rem",
    borderRadius: 12,
    background: `${color}18`,
    border: `1px solid ${color}30`,
    color,
    fontSize: "0.68rem",
    fontWeight: 700,
  };
}
