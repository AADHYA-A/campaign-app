"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  sendCampaignBlast,
  CampaignBlastResponse,
} from "@/services/api";
import {
  Mail,
  Send,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Eye,
  Plus,
  Trash2,
  ArrowLeft,
  Clock,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface DispatchLog {
  id: string;
  timestamp: string;
  subject: string;
  recipients: string[];
  success: boolean;
  simulated: boolean;
  results: Array<{
    email: string;
    recipient_name: string;
    result: {
      success: boolean;
      message_id?: string;
      simulated?: boolean;
      warning?: string;
      error?: string;
    };
  }>;
}

const TEMPLATES = [
  {
    name: "🚀 Campaign Launch Awareness",
    title: "New Awareness Campaign: Digital Empowerment Initiative 2026",
    content: "We are excited to announce the launch of the National Digital Empowerment Campaign! Join our interactive workshops, learn in your regional language, and unlock new opportunities for your community.",
    target_lang: "Hindi",
    translated: "हम राष्ट्रीय डिजिटल सशक्तिकरण अभियान शुरू करने की घोषणा करते हुए बेहद उत्साहित हैं! अपनी क्षेत्रीय भाषा में सीखने के लिए हमारी कार्यशालाओं में भाग लें।",
  },
  {
    name: "📢 Public Health & Safety Update",
    title: "Seasonal Health Advisory: Clean Water & Wellness Guidelines",
    content: "Important awareness advisory for all community members regarding monsoon health precautions, safe drinking water practices, and local healthcare center contact numbers.",
    target_lang: "Hindi",
    translated: "मानसून स्वास्थ्य सावधानियों, सुरक्षित पेयजल और स्थानीय स्वास्थ्य केंद्र संपर्क नंबरों के संबंध में सभी नागरिकों के लिए महत्वपूर्ण जागरूकता सलाह।",
  },
  {
    name: "🎉 Festive Community Greeting",
    title: "Festive Greetings & Community Discount Programme",
    content: "Wishing you and your loved ones joyous celebrations! As part of our community outreach initiative, explore special benefits and multilingual support available throughout this festive season.",
    target_lang: "Hindi",
    translated: "आपको और आपके प्रियजनों को उत्सव की हार्दिक शुभकामनाएं! इस त्योहारी सीजन में विशेष लाभों और बहुभाषी सहायता का लाभ उठाएं।",
  },
];

export default function EmailBlastPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const isAdmin = (user as any)?.is_superuser || (user as any)?.role === "admin";

  const [recipients, setRecipients] = useState<string[]>([
    "aadhyababu@gmail.com",
    "aadhyaa0404@gmail.com",
  ]);
  const [newRecipient, setNewRecipient] = useState("");

  const [title, setTitle] = useState(
    "Public Awareness Campaign: Multilingual Community Outreach"
  );
  const [customSubject, setCustomSubject] = useState("");
  const [content, setContent] = useState(
    "Welcome to the Campaign Awareness Hub. We are communicating real-time updates directly to your registered inboxes in your preferred language to ensure everyone stays informed."
  );
  const [targetLang, setTargetLang] = useState("Hindi");
  const [translatedContent, setTranslatedContent] = useState(
    "कैंपेन अवेयरनेस हब में आपका स्वागत है। हम आपकी पसंदीदा भाषा में सीधे आपके इनबॉक्स पर महत्वपूर्ण अपडेट भेज रहे हैं ताकि हर कोई सूचित रहे।"
  );

  const [sending, setSending] = useState(false);
  const [lastResponse, setLastResponse] = useState<CampaignBlastResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dispatchLogs, setDispatchLogs] = useState<DispatchLog[]>([]);
  const [activeTab, setActiveTab] = useState<"compose" | "preview">("compose");

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) router.push("/dashboard");
  }, [isLoading, isAuthenticated, isAdmin, router]);

  const handleAddRecipient = () => {
    const clean = newRecipient.trim();
    if (clean && clean.includes("@") && !recipients.includes(clean)) {
      setRecipients([...recipients, clean]);
      setNewRecipient("");
    }
  };

  const handleRemoveRecipient = (email: string) => {
    if (recipients.length <= 1) return;
    setRecipients(recipients.filter((r) => r !== email));
  };

  const handleApplyTemplate = (tmpl: typeof TEMPLATES[0]) => {
    setTitle(tmpl.title);
    setContent(tmpl.content);
    setTargetLang(tmpl.target_lang);
    setTranslatedContent(tmpl.translated);
  };

  const handleSendBlast = async () => {
    if (!title.trim() || !content.trim() || recipients.length === 0) {
      setErrorMsg("Please provide a campaign title, content, and at least one recipient.");
      return;
    }

    setSending(true);
    setErrorMsg(null);
    setLastResponse(null);

    try {
      const response = await sendCampaignBlast({
        campaign_title: title,
        campaign_content: content,
        target_language: targetLang,
        translated_content: translatedContent || undefined,
        recipients: recipients,
        custom_subject: customSubject.trim() || undefined,
        recipient_names: {
          "aadhyababu@gmail.com": "Aadhya Babu",
          "aadhyaa0404@gmail.com": "Aadhya",
        },
      });

      setLastResponse(response);

      const newLog: DispatchLog = {
        id: `blast-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        subject: customSubject.trim() || `📢 Campaign Awareness: ${title}`,
        recipients: [...recipients],
        success: response.success || response.simulated,
        simulated: response.simulated,
        results: response.results,
      };

      setDispatchLogs((prev) => [newLog, ...prev]);
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to dispatch real-time campaign email blast."
      );
    } finally {
      setSending(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <Loader2 size={36} style={{ animation: "spin 1s linear infinite", color: "var(--primary)" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div className="gradient-bg-main" style={{ minHeight: "calc(100vh - var(--nav-height))", padding: "3rem 1.5rem" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Link
            href="/admin/campaigns"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              color: "#64748b",
              textDecoration: "none",
              fontSize: "0.85rem",
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={16} /> Back to Campaign Review
          </Link>
        </div>

        {/* Page Header */}
        <div className="animate-slide-down" style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                  <Mail size={22} />
                </div>
                <h1 className="page-title" style={{ margin: 0 }}>Real-Time Campaign Email Blast</h1>
              </div>
              <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
                Instant awareness message dispatch to registered recipient inboxes via Resend API.
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => setActiveTab("compose")}
                className="btn"
                style={{
                  background: activeTab === "compose" ? "#4f46e5" : "transparent",
                  color: activeTab === "compose" ? "#fff" : "#64748b",
                  border: `1px solid ${activeTab === "compose" ? "#4f46e5" : "var(--border)"}`,
                  fontSize: "0.85rem",
                }}
              >
                ✏️ Compose
              </button>
              <button
                onClick={() => setActiveTab("preview")}
                className="btn"
                style={{
                  background: activeTab === "preview" ? "#4f46e5" : "transparent",
                  color: activeTab === "preview" ? "#fff" : "#64748b",
                  border: `1px solid ${activeTab === "preview" ? "#4f46e5" : "var(--border)"}`,
                  fontSize: "0.85rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                <Eye size={14} /> Preview Email
              </button>
            </div>
          </div>
        </div>

        {/* Status / Error feedback */}
        {errorMsg && (
          <div className="animate-slide-down" style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.85rem 1rem", borderRadius: "var(--radius-md)", background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)", color: "#dc2626", fontSize: "0.88rem", marginBottom: "1.5rem" }}>
            <AlertCircle size={16} />{errorMsg}
          </div>
        )}

        {lastResponse && (
          <div className="animate-slide-down" style={{
            padding: "1rem 1.25rem",
            borderRadius: "var(--radius-md)",
            background: lastResponse.simulated ? "rgba(245,158,11,0.08)" : "rgba(16,185,129,0.08)",
            border: `1px solid ${lastResponse.simulated ? "rgba(245,158,11,0.3)" : "rgba(16,185,129,0.3)"}`,
            color: lastResponse.simulated ? "#d97706" : "#059669",
            fontSize: "0.88rem",
            marginBottom: "1.5rem"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, marginBottom: "0.4rem" }}>
              <CheckCircle size={18} />
              {lastResponse.simulated
                ? "Awareness Email simulated (Set RESEND_API_KEY in backend/.env for live delivery)"
                : `Successfully dispatched to ${lastResponse.total_sent} recipient(s) in real time!`}
            </div>
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
              {lastResponse.results.map((r) => (
                <div key={r.email} style={{ background: "rgba(0,0,0,0.04)", padding: "0.3rem 0.6rem", borderRadius: 6, fontSize: "0.78rem" }}>
                  <strong>{r.recipient_name} ({r.email})</strong>: {r.result.success ? "✅ Delivered" : r.result.simulated ? "⚡ Simulated" : "❌ " + (r.result.error || "Failed")}
                  {r.result.message_id && <span style={{ opacity: 0.6 }}> — ID: {r.result.message_id}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>

          {/* Recipient Target Section */}
          <div className="glass-card" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.8rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ShieldCheck size={18} color="#4f46e5" />
                <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: 0 }}>Target Inboxes</h2>
              </div>
              <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                {recipients.length} Recipient(s) configured
              </span>
            </div>

            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginBottom: "1rem" }}>
              {recipients.map((email) => (
                <div
                  key={email}
                  style={{
                    background: "rgba(79,70,229,0.08)",
                    border: "1px solid rgba(79,70,229,0.25)",
                    borderRadius: 20,
                    padding: "0.35rem 0.85rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "#4f46e5",
                  }}
                >
                  <Mail size={13} />
                  {email}
                  <button
                    onClick={() => handleRemoveRecipient(email)}
                    style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}
                    title="Remove recipient"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "0.5rem", maxWidth: 450 }}>
              <input
                type="email"
                placeholder="Add another email (e.g. user@domain.com)"
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddRecipient(); }}
                className="input"
                style={{ fontSize: "0.85rem" }}
              />
              <button
                onClick={handleAddRecipient}
                className="btn btn-secondary"
                style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.82rem" }}
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </div>

          {/* Template Quick Selection */}
          <div className="glass-card" style={{ padding: "1.25rem 1.5rem" }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Sparkles size={14} color="#7c3aed" /> Quick Awareness Templates
            </div>
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
              {TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.name}
                  onClick={() => handleApplyTemplate(tmpl)}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "0.45rem 0.85rem",
                    fontSize: "0.8rem",
                    color: "var(--foreground)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    textAlign: "left",
                  }}
                >
                  {tmpl.name}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "compose" ? (
            /* Compose Form */
            <div className="glass-card" style={{ padding: "1.75rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#64748b", display: "block", marginBottom: "0.4rem" }}>
                    Campaign Title / Topic
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="E.g. National Health Awareness Initiative"
                    style={{ fontSize: "0.92rem", fontWeight: 600 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#64748b", display: "block", marginBottom: "0.4rem" }}>
                    Custom Email Subject (Optional — overrides default)
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder={`📢 Campaign Awareness: ${title}`}
                    style={{ fontSize: "0.88rem" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#64748b", display: "block", marginBottom: "0.4rem" }}>
                    Campaign Awareness Message (English / Primary)
                  </label>
                  <textarea
                    rows={4}
                    className="input"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter the primary campaign awareness body..."
                    style={{ fontSize: "0.88rem", resize: "vertical" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: "1rem" }}>
                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#64748b", display: "block", marginBottom: "0.4rem" }}>
                      Target Language
                    </label>
                    <select
                      className="input"
                      value={targetLang}
                      onChange={(e) => setTargetLang(e.target.value)}
                      style={{ fontSize: "0.88rem" }}
                    >
                      <option value="Hindi">Hindi (हिंदी)</option>
                      <option value="Tamil">Tamil (தமிழ்)</option>
                      <option value="Telugu">Telugu (తెలుగు)</option>
                      <option value="Bengali">Bengali (বাংলা)</option>
                      <option value="Marathi">Marathi (मराठी)</option>
                      <option value="Gujarati">Gujarati (ગુજરાતી)</option>
                      <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
                      <option value="Malayalam">Malayalam (മലയാളം)</option>
                      <option value="Punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#64748b", display: "block", marginBottom: "0.4rem" }}>
                      Regional Language Translation (Optional)
                    </label>
                    <textarea
                      rows={2}
                      className="input"
                      value={translatedContent}
                      onChange={(e) => setTranslatedContent(e.target.value)}
                      placeholder="Regional translation to be included in the email body..."
                      style={{ fontSize: "0.88rem", resize: "vertical" }}
                    />
                  </div>
                </div>

                {/* Dispatch Button */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                  <button
                    onClick={handleSendBlast}
                    disabled={sending}
                    className="btn btn-primary"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.75rem 1.75rem",
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                      boxShadow: "0 4px 14px rgba(79,70,229,0.35)",
                    }}
                  >
                    {sending ? (
                      <>
                        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                        Dispatching Real-Time Emails…
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Dispatch Campaign Awareness Blast
                      </>
                    )}
                  </button>
                </div>

              </div>
            </div>
          ) : (
            /* Email Live Preview */
            <div className="glass-card" style={{ padding: "1.75rem" }}>
              <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "#64748b", fontSize: "0.85rem" }}>
                <Eye size={16} /> Live HTML Email Preview (What recipients receive):
              </div>
              <div style={{ maxWidth: 600, margin: "0 auto", background: "#0f172a", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(99,102,241,0.25)", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
                {/* Email Header */}
                <div style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", padding: "28px", textAlign: "center" }}>
                  <div style={{ display: "inline-block", padding: "4px 12px", background: "rgba(255,255,255,0.18)", borderRadius: 20, color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                    📢 Campaign Awareness Broadcast
                  </div>
                  <h2 style={{ color: "#fff", margin: 0, fontSize: 22, fontWeight: 800 }}>🌐 Campaign Hub</h2>
                  <p style={{ color: "rgba(255,255,255,0.85)", margin: "6px 0 0", fontSize: 13 }}>Multilingual Communication & Awareness Engine</p>
                </div>
                {/* Email Body */}
                <div style={{ padding: "28px", color: "#e2e8f0" }}>
                  <p style={{ color: "#94a3b8", fontSize: 13, margin: "0 0 4px" }}>Hello</p>
                  <h3 style={{ color: "#e2e8f0", fontSize: 18, margin: "0 0 20px", fontWeight: 700 }}>Aadhya / Recipient</h3>
                  <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 12, padding: "20px", marginBottom: "16px" }}>
                    <p style={{ color: "#94a3b8", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px", fontWeight: 600 }}>Campaign Subject</p>
                    <h4 style={{ color: "#c7d2fe", fontSize: 16, margin: "0 0 12px", fontWeight: 700 }}>{title}</h4>
                    <p style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{content}</p>
                  </div>
                  {translatedContent && (
                    <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 12, padding: "18px", marginBottom: "16px" }}>
                      <p style={{ color: "#34d399", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px", fontWeight: 700 }}>🌐 Regional Content ({targetLang})</p>
                      <p style={{ color: "#e2e8f0", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{translatedContent}</p>
                    </div>
                  )}
                  <div style={{ padding: "12px", background: "rgba(255,255,255,0.03)", borderRadius: 8, border: "1px dashed rgba(255,255,255,0.1)", textAlign: "center" }}>
                    <p style={{ color: "#64748b", fontSize: 11, margin: 0 }}>
                      This is a real-time awareness update dispatched directly to your inbox.
                    </p>
                  </div>
                </div>
                {/* Email Footer */}
                <div style={{ background: "rgba(0,0,0,0.3)", padding: "16px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <p style={{ color: "#64748b", fontSize: 11, margin: "0 0 4px" }}>Powered by <strong>Campaign Hub</strong></p>
                  <p style={{ color: "#475569", fontSize: 10, margin: 0 }}>Real-time Campaign Awareness Notification</p>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "center", marginTop: "1.5rem" }}>
                <button
                  onClick={handleSendBlast}
                  disabled={sending}
                  className="btn btn-primary"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.75rem 2rem",
                    fontSize: "0.95rem",
                    fontWeight: 700,
                  }}
                >
                  <Send size={16} /> Send This Preview Email Now
                </button>
              </div>
            </div>
          )}

          {/* Recent Dispatch Audit Log */}
          {dispatchLogs.length > 0 && (
            <div className="glass-card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <Clock size={16} color="#64748b" />
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0 }}>Session Dispatch History</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {dispatchLogs.map((log) => (
                  <div
                    key={log.id}
                    style={{
                      padding: "0.85rem 1rem",
                      borderRadius: 8,
                      background: "rgba(0,0,0,0.02)",
                      border: "1px solid var(--border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "0.6rem",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--foreground)" }}>
                        {log.subject}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.2rem" }}>
                        Sent at {log.timestamp} to {log.recipients.join(", ")}
                      </div>
                    </div>
                    <div>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          padding: "0.25rem 0.6rem",
                          borderRadius: 12,
                          background: log.success
                            ? log.simulated ? "rgba(245,158,11,0.12)" : "rgba(16,185,129,0.12)"
                            : "rgba(220,38,38,0.12)",
                          color: log.success
                            ? log.simulated ? "#d97706" : "#059669"
                            : "#dc2626",
                        }}
                      >
                        {log.success ? (log.simulated ? "⚡ Simulated" : "✅ Dispatched") : "❌ Failed"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
