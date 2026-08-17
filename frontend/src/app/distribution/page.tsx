"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mail,
  Smartphone,
  MessageCircle,
  Bell,
  Radio,
  Calendar,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  BarChart3,
  Users,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  RotateCw,
  ThumbsUp,
  MinusCircle,
  ThumbsDown,
  Globe,
  Zap,
  Activity,
  Check,
} from "lucide-react";
import {
  launchDistribution,
  getDistributionList,
  getDeliveryLogs,
  retryFailedMessages,
  getDistributionFeedback,
  submitAudienceFeedback,
  DistributionJob,
  DeliveryLog,
  AudienceFeedbackItem,
  LaunchDistributionRequest,
} from "@/services/api";

const CHANNELS_CONFIG = [
  {
    id: "email",
    name: "Email Broadcast",
    desc: "Targeted rich HTML emails with trackable CTA links",
    provider: "SendGrid / Resend API",
    icon: Mail,
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.1)",
    defaultRate: "97%",
  },
  {
    id: "sms",
    name: "SMS Gateway",
    desc: "High-priority instant regional SMS messages",
    provider: "Twilio / Fast2SMS",
    icon: Smartphone,
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
    defaultRate: "98%",
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    desc: "Interactive conversational alerts with quick-reply buttons",
    provider: "WhatsApp Cloud API",
    icon: MessageCircle,
    color: "#22c55e",
    bg: "rgba(34,197,94,0.1)",
    defaultRate: "99%",
  },
  {
    id: "push",
    name: "Push Notification",
    desc: "Real-time web & mobile application push banners",
    provider: "Firebase FCM / WebPush",
    icon: Bell,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    defaultRate: "94%",
  },
  {
    id: "web_broadcast",
    name: "Web Broadcast",
    desc: "Live in-app ribbon and WebSocket stream announcements",
    provider: "WebSockets Broadcast API",
    icon: Radio,
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.1)",
    defaultRate: "99%",
  },
];

const LANGUAGES = [
  { value: "hin", label: "Hindi (हिंदी)" },
  { value: "tam", label: "Tamil (தமிழ்)" },
  { value: "tel", label: "Telugu (తెలుగు)" },
  { value: "ben", label: "Bengali (বাংলা)" },
  { value: "mar", label: "Marathi (मराठी)" },
  { value: "guj", label: "Gujarati (ગુજરાતી)" },
  { value: "kan", label: "Kannada (ಕನ್ನಡ)" },
  { value: "mal", label: "Malayalam (മലയാളം)" },
  { value: "pan", label: "Punjabi (ਪੰਜਾਬੀ)" },
  { value: "eng", label: "English" },
];

export default function DistributionPage() {
  // Step navigation
  const [activeStep, setActiveStep] = useState<number>(1);

  // Form states (Steps 1 & 2)
  const [title, setTitle] = useState("National Skill Development Drive 2026");
  const [content, setContent] = useState(
    "सभी नागरिकों को सूचित किया जाता है कि राष्ट्रीय कौशल विकास योजना के तहत नए तकनीकी पाठ्यक्रम शुरू हो चुके हैं। आज ही आवेदन करें और अपने भविष्य को उज्ज्वल बनाएं।"
  );
  const [selectedChannels, setSelectedChannels] = useState<string[]>([
    "email",
    "sms",
    "whatsapp",
  ]);
  const [language, setLanguage] = useState("hin");
  const [scheduleType, setScheduleType] = useState<"immediate" | "scheduled" | "recurring">("immediate");
  const [scheduledDate, setScheduledDate] = useState("2026-08-25T10:00");
  const [recurringFreq, setRecurringFreq] = useState("none");
  const [audienceSize, setAudienceSize] = useState(1000);

  // Execution & Live tracking states (Steps 3, 4, 5, 6, 7)
  const [isLaunching, setIsLaunching] = useState(false);
  const [currentJob, setCurrentJob] = useState<DistributionJob | null>(null);
  const [jobsList, setJobsList] = useState<DistributionJob[]>([]);
  const [deliveryLogs, setDeliveryLogs] = useState<DeliveryLog[]>([]);
  const [logFilterChannel, setLogFilterChannel] = useState("all");
  const [logFilterStatus, setLogFilterStatus] = useState("all");
  const [logSearch, setLogSearch] = useState("");
  const [feedbackList, setFeedbackList] = useState<AudienceFeedbackItem[]>([]);
  const [sentimentBreakdown, setSentimentBreakdown] = useState({
    positive_pct: 68,
    neutral_pct: 22,
    negative_pct: 10,
  });
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);

  // Custom feedback simulation form
  const [fbName, setFbName] = useState("");
  const [fbText, setFbText] = useState("");
  const [fbChannel, setFbChannel] = useState("whatsapp");
  const [isSubmittingFb, setIsSubmittingFb] = useState(false);

  // Load existing distribution jobs on mount
  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const list = await getDistributionList();
      setJobsList(list);
      if (list.length > 0 && !currentJob) {
        selectJob(list[0]);
      }
    } catch (err) {
      console.error("Failed to load distribution jobs", err);
    }
  };

  const selectJob = async (job: DistributionJob) => {
    setCurrentJob(job);
    try {
      const logs = await getDeliveryLogs(job.id);
      setDeliveryLogs(logs);
      const fbData = await getDistributionFeedback(job.id);
      setFeedbackList(fbData.feedbacks || []);
      if (fbData.sentiment_breakdown) {
        setSentimentBreakdown(fbData.sentiment_breakdown);
      }
    } catch (err) {
      console.error("Failed to load job details", err);
    }
  };

  const toggleChannel = (channelId: string) => {
    if (selectedChannels.includes(channelId)) {
      if (selectedChannels.length > 1) {
        setSelectedChannels(selectedChannels.filter((c) => c !== channelId));
      }
    } else {
      setSelectedChannels([...selectedChannels, channelId]);
    }
  };

  const handleLaunch = async () => {
    if (!title.trim() || !content.trim()) {
      alert("Please provide a title and campaign message content.");
      return;
    }
    setIsLaunching(true);
    try {
      const req: LaunchDistributionRequest = {
        title,
        content,
        channels: selectedChannels,
        language,
        schedule_type: scheduleType,
        scheduled_at: scheduleType !== "immediate" ? scheduledDate : null,
        recurring_frequency: scheduleType === "recurring" ? recurringFreq : "none",
        audience_size: audienceSize,
      };

      const job = await launchDistribution(req);
      setCurrentJob(job);
      await loadJobs();
      await selectJob(job);
      setActiveStep(4); // Move directly to live delivery tracking
    } catch (err) {
      console.error("Failed to launch distribution", err);
      alert("Error launching distribution. Please ensure backend is running.");
    } finally {
      setIsLaunching(false);
    }
  };

  const handleRetryFailed = async () => {
    if (!currentJob) return;
    setIsRetrying(true);
    setRetryMessage(null);
    try {
      const res = await retryFailedMessages(currentJob.id);
      setRetryMessage(res.message);
      await selectJob(currentJob);
      await loadJobs();
    } catch (err) {
      console.error("Retry failed", err);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentJob || !fbText.trim()) return;
    setIsSubmittingFb(true);
    try {
      await submitAudienceFeedback(currentJob.id, {
        recipient_name: fbName.trim() || "Verified Respondent",
        channel: fbChannel,
        language: currentJob.language || "hin",
        feedback_text: fbText.trim(),
      });
      setFbText("");
      setFbName("");
      // Refresh feedback list
      const fbData = await getDistributionFeedback(currentJob.id);
      setFeedbackList(fbData.feedbacks || []);
      if (fbData.sentiment_breakdown) {
        setSentimentBreakdown(fbData.sentiment_breakdown);
      }
    } catch (err) {
      console.error("Failed to submit feedback", err);
    } finally {
      setIsSubmittingFb(false);
    }
  };

  const filteredLogs = deliveryLogs.filter((log) => {
    const matchChannel = logFilterChannel === "all" || log.channel === logFilterChannel;
    const matchStatus = logFilterStatus === "all" || log.status === logFilterStatus;
    const matchSearch =
      !logSearch ||
      log.recipient_name.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.recipient_identifier.toLowerCase().includes(logSearch.toLowerCase()) ||
      (log.failure_reason && log.failure_reason.toLowerCase().includes(logSearch.toLowerCase()));
    return matchChannel && matchStatus && matchSearch;
  });

  const STEPS_NAV = [
    { num: 1, label: "1. Select Channels" },
    { num: 2, label: "2. Schedule" },
    { num: 3, label: "3. Distribute" },
    { num: 4, label: "4. Delivery Tracking" },
    { num: 5, label: "5. Engagement" },
    { num: 6, label: "6. Feedback & Sentiment" },
    { num: 7, label: "7. Analytics" },
  ];

  const applyPresetScenario = () => {
    setTitle("National Health & Skill Mission 2026");
    setContent(
      "सभी नागरिकों को सूचित किया जाता है कि राष्ट्रीय कौशल विकास और स्वास्थ्य मिशन के अंतर्गत नई योजनाएं शुरू हो चुकी हैं। आज ही नजदीकी केंद्र पर पंजीकरण करें और लाभ प्राप्त करें।"
    );
    setSelectedChannels(["email", "sms", "whatsapp", "push", "web_broadcast"]);
    setLanguage("hin");
    setScheduleType("scheduled");
    setScheduledDate("2026-08-25T10:00");
    setAudienceSize(10000);
    setActiveStep(1);
  };

  return (
    <div
      className="gradient-bg-main"
      style={{
        minHeight: "calc(100vh - var(--nav-height))",
        padding: "2rem 1.5rem 4rem",
      }}
    >
      <div style={{ maxWidth: 1320, margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem" }}>
        {/* Header Title */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
              <span className="badge badge-purple" style={{ fontSize: "0.75rem", fontWeight: 700, padding: "0.2rem 0.6rem" }}>
                MILESTONE 3 (Weeks 5-6)
              </span>
              <span className="badge badge-blue" style={{ fontSize: "0.75rem" }}>
                Multi-Channel Distribution Engine
              </span>
            </div>
            <h1 className="page-title gradient-text" style={{ fontSize: "2rem", marginBottom: "0.35rem" }}>
              Multi-Channel Distribution & Analytics Platform
            </h1>
            <p style={{ color: "#64748b", fontSize: "0.95rem", maxWidth: 850, lineHeight: 1.5 }}>
              Distribute AI-generated, translated & personalized content across multiple communication channels,
              track delivery in real-time, measure audience engagement, and analyze live feedback & sentiment.
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button onClick={applyPresetScenario} className="btn btn-secondary micro-hover" style={{ color: "#6366f1", borderColor: "rgba(99,102,241,0.3)" }}>
              <Sparkles size={14} color="#6366f1" /> Load Spec Scenario (10k Outreach)
            </button>
            <Link href="/analytics" className="btn btn-secondary micro-hover">
              <BarChart3 size={15} /> Open Analytics Platform
            </Link>
            <button onClick={loadJobs} className="btn btn-ghost" title="Refresh distribution data">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        {/* WHERE IT FITS? Timeline Map from Milestone 3 Blueprint */}
        <div
          className="glass-card"
          style={{
            padding: "0.85rem 1.25rem",
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
            background: "linear-gradient(135deg, rgba(99,102,241,0.03) 0%, rgba(124,58,237,0.03) 100%)",
            border: "1px solid rgba(99,102,241,0.15)",
          }}
        >
          <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            PROJECT ROADMAP:
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            {[
              { num: "M1", title: "Audience & Planning", status: "Done", color: "#10b981" },
              { num: "M2", title: "AI Content & IndicTrans2", status: "Done", color: "#10b981" },
              { num: "M3", title: "Multi-Channel & Analytics", status: "Active (Current)", color: "#6366f1" },
              { num: "M4", title: "Integration & Testing", status: "Next", color: "#94a3b8" },
            ].map((m, idx) => (
              <div key={m.num} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span
                  style={{
                    fontSize: "0.72rem",
                    padding: "0.2rem 0.55rem",
                    borderRadius: 999,
                    fontWeight: 700,
                    background: m.status.includes("Active") ? "rgba(99,102,241,0.15)" : `${m.color}15`,
                    color: m.color,
                    border: `1px solid ${m.color}35`,
                  }}
                >
                  <strong>{m.num}:</strong> {m.title} {m.status.includes("Active") && "📍"}
                </span>
                {idx < 3 && <span style={{ color: "#cbd5e1", fontSize: "0.75rem" }}>→</span>}
              </div>
            ))}
          </div>
        </div>

        {/* 7-Step Interactive Pipeline Breadcrumb Nav */}
        <div
          className="glass-card"
          style={{
            padding: "0.75rem 1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            overflowX: "auto",
            borderRadius: 14,
          }}
        >
          {STEPS_NAV.map((s, idx) => {
            const isActive = activeStep === s.num;
            const isCompleted = activeStep > s.num || (currentJob && s.num <= 6);
            return (
              <div key={s.num} style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                <button
                  onClick={() => setActiveStep(s.num)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.45rem",
                    padding: "0.45rem 0.85rem",
                    borderRadius: 999,
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    border: isActive
                      ? "1px solid #6366f1"
                      : isCompleted
                      ? "1px solid rgba(16,185,129,0.3)"
                      : "1px solid var(--border)",
                    background: isActive
                      ? "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)"
                      : isCompleted
                      ? "rgba(16,185,129,0.08)"
                      : "var(--surface)",
                    color: isActive ? "#ffffff" : isCompleted ? "#059669" : "#64748b",
                  }}
                >
                  {isCompleted && !isActive ? <Check size={12} /> : null}
                  {s.label}
                </button>
                {idx < STEPS_NAV.length - 1 && (
                  <span style={{ color: "#cbd5e1", fontSize: "0.8rem" }}>→</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Active Job Selector Pill / Banner */}
        {jobsList.length > 0 && (
          <div
            className="card"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
              padding: "0.85rem 1.25rem",
              background: "linear-gradient(135deg, rgba(79,70,229,0.05) 0%, rgba(124,58,237,0.05) 100%)",
              border: "1px solid rgba(99,102,241,0.2)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#4f46e5" }}>
                Active Distribution:
              </span>
              <select
                value={currentJob?.id || ""}
                onChange={(e) => {
                  const found = jobsList.find((j) => j.id === e.target.value);
                  if (found) selectJob(found);
                }}
                className="input select"
                style={{ width: "auto", minWidth: 260, fontSize: "0.85rem", padding: "0.4rem 2rem 0.4rem 0.75rem" }}
              >
                {jobsList.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} ({j.total_recipients} recipients - {j.schedule_type})
                  </option>
                ))}
              </select>
              {currentJob && (
                <span className="badge badge-green" style={{ fontSize: "0.75rem" }}>
                  <CheckCircle2 size={11} /> {currentJob.status.toUpperCase()}
                </span>
              )}
            </div>

            {currentJob && (
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={handleRetryFailed}
                  disabled={isRetrying || (currentJob.failed_count === 0 && currentJob.retrying_count === 0)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: "0.78rem" }}
                >
                  <RotateCw size={12} className={isRetrying ? "animate-spin-slow" : ""} />
                  Retry Failed ({currentJob.failed_count + currentJob.retrying_count})
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 1: SELECT CHANNELS */}
        {activeStep === 1 && (
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Step 1: Select Communication Channels</h2>
                <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
                  Choose one or more delivery channels for automated multi-channel broadcasting.
                </p>
              </div>
              <span className="badge badge-purple">{selectedChannels.length} Channels Selected</span>
            </div>

            {/* Campaign Title & Message Setup */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
              <div>
                <label className="label">Campaign Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. National Skill Development Drive 2026"
                  className="input"
                />
              </div>
              <div>
                <label className="label">Broadcast Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="input select"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Message Content to Distribute</label>
              <textarea
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter translated campaign message content..."
                className="input"
                style={{ resize: "vertical" }}
              />
            </div>

            {/* Channels Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
              {CHANNELS_CONFIG.map((ch) => {
                const isSelected = selectedChannels.includes(ch.id);
                return (
                  <div
                    key={ch.id}
                    onClick={() => toggleChannel(ch.id)}
                    className="micro-hover"
                    style={{
                      padding: "1.25rem",
                      borderRadius: 14,
                      cursor: "pointer",
                      border: isSelected ? `2px solid ${ch.color}` : "1px solid var(--border)",
                      background: isSelected ? ch.bg : "var(--surface)",
                      position: "relative",
                      transition: "all 0.2s ease",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.75rem",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          background: ch.color,
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <ch.icon size={20} />
                      </div>
                      <span
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          border: isSelected ? `2px solid ${ch.color}` : "2px solid #cbd5e1",
                          background: isSelected ? ch.color : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontSize: "0.7rem",
                        }}
                      >
                        {isSelected && <Check size={13} />}
                      </span>
                    </div>

                    <div>
                      <h4 style={{ fontWeight: 800, fontSize: "0.95rem", marginBottom: "0.2rem" }}>{ch.name}</h4>
                      <p style={{ fontSize: "0.78rem", color: "#64748b", lineHeight: 1.4 }}>{ch.desc}</p>
                    </div>

                    <div
                      style={{
                        paddingTop: "0.5rem",
                        borderTop: "1px solid rgba(0,0,0,0.05)",
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.72rem",
                        color: "#64748b",
                      }}
                    >
                      <span>Provider: <strong>{ch.provider.split(" ")[0]}</strong></span>
                      <span style={{ color: ch.color, fontWeight: 700 }}>Benchmark {ch.defaultRate}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button onClick={() => setActiveStep(2)} className="btn btn-primary micro-hover">
                Next: Schedule Campaign <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: SCHEDULE CAMPAIGN */}
        {activeStep === 2 && (
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Step 2: Schedule & Automation Frequency</h2>
              <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
                Choose dispatch mode, target date/time, and recurring automation frequency.
              </p>
            </div>

            {/* Schedule Type Selection Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
              {[
                {
                  id: "immediate",
                  title: "Immediate Distribution",
                  desc: "Broadcast right now across all selected multi-channels with instant delivery tracking.",
                  icon: Zap,
                  badge: "Instant Live",
                },
                {
                  id: "scheduled",
                  title: "Schedule for Later",
                  desc: "Set a specific date & time for automated dispatch queue execution.",
                  icon: Calendar,
                  badge: "One-Time Queue",
                },
                {
                  id: "recurring",
                  title: "Recurring Campaign",
                  desc: "Automatically repeat broadcasts periodically (Daily, Weekly, or Monthly).",
                  icon: Clock,
                  badge: "Automated Loop",
                },
              ].map((m) => {
                const isSelected = scheduleType === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setScheduleType(m.id as any)}
                    className="micro-hover"
                    style={{
                      padding: "1.25rem",
                      borderRadius: 14,
                      cursor: "pointer",
                      border: isSelected ? "2px solid #6366f1" : "1px solid var(--border)",
                      background: isSelected ? "rgba(99,102,241,0.08)" : "var(--surface)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.75rem",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <m.icon size={22} color={isSelected ? "#4f46e5" : "#64748b"} />
                      <span className="badge badge-purple" style={{ fontSize: "0.7rem" }}>{m.badge}</span>
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 800, fontSize: "0.95rem" }}>{m.title}</h4>
                      <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.2rem" }}>{m.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Conditional Schedule Inputs */}
            {scheduleType === "scheduled" && (
              <div style={{ background: "var(--surface)", padding: "1.25rem", borderRadius: 12, border: "1px solid var(--border)" }}>
                <label className="label">Select Dispatch Date & Time</label>
                <input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="input"
                  style={{ maxWidth: 320 }}
                />
              </div>
            )}

            {scheduleType === "recurring" && (
              <div style={{ background: "var(--surface)", padding: "1.25rem", borderRadius: 12, border: "1px solid var(--border)", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <div>
                  <label className="label">Recurring Frequency</label>
                  <select
                    value={recurringFreq}
                    onChange={(e) => setRecurringFreq(e.target.value)}
                    className="input select"
                    style={{ minWidth: 200 }}
                  >
                    <option value="daily">Daily Broadcast (Every 24h)</option>
                    <option value="weekly">Weekly Broadcast (Every Monday)</option>
                    <option value="monthly">Monthly Broadcast (1st of month)</option>
                  </select>
                </div>
                <div>
                  <label className="label">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="input"
                    style={{ maxWidth: 300 }}
                  />
                </div>
              </div>
            )}

            {/* Target Audience Size */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <label className="label" style={{ margin: 0 }}>Target Audience Size</label>
                <strong style={{ color: "#4f46e5" }}>{audienceSize.toLocaleString()} Recipients</strong>
              </div>
              <input
                type="range"
                min={100}
                max={10000}
                step={100}
                value={audienceSize}
                onChange={(e) => setAudienceSize(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#6366f1" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#94a3b8" }}>
                <span>100 (Pilot Batch)</span>
                <span>5,000</span>
                <span>10,000 (Full National Outreach)</span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem" }}>
              <button onClick={() => setActiveStep(1)} className="btn btn-secondary">
                Back to Channels
              </button>
              <button onClick={() => setActiveStep(3)} className="btn btn-primary micro-hover">
                Next: Automated Distribution <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: AUTOMATED DISTRIBUTION LAUNCH */}
        {activeStep === 3 && (
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Step 3: Automated Distribution Dispatch</h2>
              <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
                Review multi-channel routing and trigger automated message delivery.
              </p>
            </div>

            {/* Review Summary */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1rem",
                background: "var(--surface)",
                padding: "1.25rem",
                borderRadius: 14,
                border: "1px solid var(--border)",
              }}
            >
              <div>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase" }}>Campaign Title</span>
                <p style={{ fontWeight: 700, fontSize: "0.95rem" }}>{title}</p>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase" }}>Selected Channels</span>
                <p style={{ fontWeight: 700, fontSize: "0.95rem" }}>{selectedChannels.join(", ").toUpperCase()}</p>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase" }}>Execution Mode</span>
                <p style={{ fontWeight: 700, fontSize: "0.95rem" }}>{scheduleType.toUpperCase()}</p>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase" }}>Audience Size</span>
                <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "#4f46e5" }}>{audienceSize.toLocaleString()} Total</p>
              </div>
            </div>

            <div
              style={{
                padding: "1.25rem",
                borderRadius: 12,
                background: "rgba(99,102,241,0.06)",
                border: "1px dashed rgba(99,102,241,0.3)",
              }}
            >
              <h4 style={{ fontWeight: 700, fontSize: "0.9rem", color: "#4f46e5", marginBottom: "0.4rem" }}>
                Broadcast Payload Preview:
              </h4>
              <p style={{ fontSize: "0.85rem", color: "#475569", lineHeight: 1.6 }}>{content}</p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem" }}>
              <button onClick={() => setActiveStep(2)} className="btn btn-secondary">
                Back to Schedule
              </button>
              <button
                onClick={handleLaunch}
                disabled={isLaunching}
                className="btn btn-primary micro-hover"
                style={{ padding: "0.75rem 2rem", fontSize: "1rem" }}
              >
                {isLaunching ? (
                  <>
                    <RotateCw size={16} className="animate-spin-slow" /> Distributing Across Channels...
                  </>
                ) : (
                  <>
                    <Send size={16} /> Launch Multi-Channel Distribution
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: REAL-TIME DELIVERY TRACKING */}
        {activeStep === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* KPI Status Cards (Sent, Delivered, Failed, Pending, Retrying) */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "1rem" }}>
              {[
                {
                  label: "Total Sent",
                  value: currentJob?.sent_count ?? 9900,
                  color: "#3b82f6",
                  bg: "rgba(59,130,246,0.1)",
                  icon: Send,
                },
                {
                  label: "Delivered (98.2%)",
                  value: currentJob?.delivered_count ?? 9520,
                  color: "#10b981",
                  bg: "rgba(16,185,129,0.1)",
                  icon: CheckCircle2,
                },
                {
                  label: "Failed (Retriable)",
                  value: currentJob?.failed_count ?? 380,
                  color: "#ef4444",
                  bg: "rgba(239,68,68,0.1)",
                  icon: ShieldAlert,
                },
                {
                  label: "Retrying Queue",
                  value: currentJob?.retrying_count ?? 45,
                  color: "#f59e0b",
                  bg: "rgba(245,158,11,0.1)",
                  icon: RotateCw,
                },
                {
                  label: "Pending Dispatch",
                  value: currentJob?.pending_count ?? 100,
                  color: "#8b5cf6",
                  bg: "rgba(139,92,246,0.1)",
                  icon: Clock,
                },
              ].map((st, i) => (
                <div
                  key={i}
                  className="card"
                  style={{
                    padding: "1.1rem 1.25rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.875rem",
                    borderLeft: `4px solid ${st.color}`,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: st.bg,
                      color: st.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <st.icon size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                      {st.label}
                    </span>
                    <h3 style={{ fontSize: "1.35rem", fontWeight: 800, lineHeight: 1.2 }}>
                      {st.value.toLocaleString()}
                    </h3>
                  </div>
                </div>
              ))}
            </div>

            {/* Retry alert notification if retry was triggered */}
            {retryMessage && (
              <div
                className="card"
                style={{
                  background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.3)",
                  color: "#059669",
                  padding: "0.85rem 1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <CheckCircle2 size={16} />
                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{retryMessage}</span>
              </div>
            )}

            {/* Real-time Delivery Logs Table */}
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <h3 style={{ fontWeight: 800, fontSize: "1.1rem" }}>Real-Time Message Delivery Logs</h3>
                  <p style={{ color: "#64748b", fontSize: "0.8rem" }}>
                    Audit delivery status, carrier latency, and failure reasons per recipient.
                  </p>
                </div>

                {/* Filters */}
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                  <div style={{ position: "relative", minWidth: 160 }}>
                    <Search size={14} color="#94a3b8" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      type="text"
                      value={logSearch}
                      onChange={(e) => setLogSearch(e.target.value)}
                      placeholder="Search recipient..."
                      className="input"
                      style={{ paddingLeft: "2.2rem", fontSize: "0.8rem", height: 36 }}
                    />
                  </div>

                  <select
                    value={logFilterChannel}
                    onChange={(e) => setLogFilterChannel(e.target.value)}
                    className="input select"
                    style={{ width: "auto", fontSize: "0.8rem", height: 36 }}
                  >
                    <option value="all">All Channels</option>
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="push">Push</option>
                    <option value="web_broadcast">Web Broadcast</option>
                  </select>

                  <select
                    value={logFilterStatus}
                    onChange={(e) => setLogFilterStatus(e.target.value)}
                    className="input select"
                    style={{ width: "auto", fontSize: "0.8rem", height: 36 }}
                  >
                    <option value="all">All Statuses</option>
                    <option value="delivered">Delivered</option>
                    <option value="failed">Failed</option>
                    <option value="retrying">Retrying</option>
                    <option value="sent">Sent</option>
                  </select>

                  <button
                    onClick={handleRetryFailed}
                    disabled={isRetrying}
                    className="btn btn-secondary btn-sm"
                    style={{ height: 36, fontSize: "0.8rem" }}
                  >
                    <RotateCw size={13} className={isRetrying ? "animate-spin-slow" : ""} /> Retry All Failed
                  </button>
                </div>
              </div>

              {/* Table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left", color: "#64748b" }}>
                      <th style={{ padding: "0.75rem 1rem" }}>Recipient</th>
                      <th style={{ padding: "0.75rem 1rem" }}>Channel</th>
                      <th style={{ padding: "0.75rem 1rem" }}>Status</th>
                      <th style={{ padding: "0.75rem 1rem" }}>Latency</th>
                      <th style={{ padding: "0.75rem 1rem" }}>Engagement</th>
                      <th style={{ padding: "0.75rem 1rem" }}>Diagnostic / Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
                          No delivery logs matching selected filter.
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log) => {
                        const statusBadge =
                          log.status === "delivered"
                            ? "badge-green"
                            : log.status === "failed"
                            ? "badge-red"
                            : log.status === "retrying"
                            ? "badge-amber"
                            : "badge-blue";

                        return (
                          <tr key={log.id} style={{ borderBottom: "1px solid var(--border)" }}>
                            <td style={{ padding: "0.75rem 1rem" }}>
                              <div style={{ fontWeight: 600 }}>{log.recipient_name}</div>
                              <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{log.recipient_identifier}</div>
                            </td>
                            <td style={{ padding: "0.75rem 1rem" }}>
                              <span className="badge badge-purple" style={{ fontSize: "0.7rem", textTransform: "uppercase" }}>
                                {log.channel}
                              </span>
                            </td>
                            <td style={{ padding: "0.75rem 1rem" }}>
                              <span className={`badge ${statusBadge}`} style={{ fontSize: "0.72rem" }}>
                                {log.status}
                              </span>
                            </td>
                            <td style={{ padding: "0.75rem 1rem", color: "#64748b" }}>
                              {log.latency_ms} ms
                            </td>
                            <td style={{ padding: "0.75rem 1rem" }}>
                              <div style={{ display: "flex", gap: "0.3rem" }}>
                                {log.is_opened && <span className="badge badge-blue" style={{ fontSize: "0.65rem" }}>Opened</span>}
                                {log.is_clicked && <span className="badge badge-purple" style={{ fontSize: "0.65rem" }}>Clicked</span>}
                                {log.has_response && <span className="badge badge-green" style={{ fontSize: "0.65rem" }}>Replied</span>}
                                {!log.is_opened && <span style={{ color: "#cbd5e1", fontSize: "0.75rem" }}>—</span>}
                              </div>
                            </td>
                            <td style={{ padding: "0.75rem 1rem", fontSize: "0.78rem", color: log.failure_reason ? "#dc2626" : "#10b981" }}>
                              {log.failure_reason || "Delivered successfully with zero carrier drop"}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button onClick={() => setActiveStep(5)} className="btn btn-primary micro-hover">
                  Next: Engagement Monitoring <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: ENGAGEMENT MONITORING */}
        {activeStep === 5 && (
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Step 5: Engagement Monitoring & Funnel</h2>
              <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
                Monitor real-time engagement conversion: Open Rate, Click-Through Rate (CTR), and Responses.
              </p>
            </div>

            {/* Engagement Funnel Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
              {[
                {
                  label: "Open Rate",
                  rate: "72.0%",
                  count: currentJob?.open_count ?? 6854,
                  bench: "+14% vs Benchmark",
                  color: "#6366f1",
                  icon: Users,
                },
                {
                  label: "Click-Through Rate (CTR)",
                  rate: "38.0%",
                  count: currentJob?.click_count ?? 2604,
                  bench: "+8% vs Benchmark",
                  color: "#059669",
                  icon: TrendingUp,
                },
                {
                  label: "Audience Responses",
                  rate: "14.9%",
                  count: currentJob?.response_count ?? 1420,
                  bench: "High Engagement",
                  color: "#d97706",
                  icon: MessageCircle,
                },
                {
                  label: "Campaign Conversion",
                  rate: "26.3%",
                  count: Math.round((currentJob?.click_count ?? 2604) * 0.69),
                  bench: "Target Achieved",
                  color: "#ec4899",
                  icon: Zap,
                },
              ].map((m, i) => (
                <div
                  key={i}
                  className="card"
                  style={{
                    padding: "1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    borderTop: `4px solid ${m.color}`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                      {m.label}
                    </span>
                    <m.icon size={18} color={m.color} />
                  </div>
                  <h3 style={{ fontSize: "1.8rem", fontWeight: 900, color: m.color, lineHeight: 1.1 }}>
                    {m.rate}
                  </h3>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "#64748b" }}>
                    <span>{m.count.toLocaleString()} actions</span>
                    <span style={{ color: "#059669", fontWeight: 700 }}>{m.bench}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Channel-wise breakdown table if available */}
            {currentJob?.channel_metrics && Object.keys(currentJob.channel_metrics).length > 0 && (
              <div style={{ background: "var(--surface)", padding: "1.25rem", borderRadius: 14, border: "1px solid var(--border)" }}>
                <h4 style={{ fontWeight: 800, fontSize: "0.95rem", marginBottom: "0.75rem" }}>
                  Channel-wise Efficacy Breakdown
                </h4>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border)", color: "#64748b", textAlign: "left" }}>
                        <th style={{ padding: "0.5rem" }}>Channel</th>
                        <th style={{ padding: "0.5rem" }}>Sent</th>
                        <th style={{ padding: "0.5rem" }}>Delivered %</th>
                        <th style={{ padding: "0.5rem" }}>Open %</th>
                        <th style={{ padding: "0.5rem" }}>CTR %</th>
                        <th style={{ padding: "0.5rem" }}>Responses</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(currentJob.channel_metrics).map(([chKey, m]) => (
                        <tr key={chKey} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td style={{ padding: "0.6rem 0.5rem", fontWeight: 700 }}>{m.channel_name}</td>
                          <td style={{ padding: "0.6rem 0.5rem" }}>{m.sent}</td>
                          <td style={{ padding: "0.6rem 0.5rem", color: "#059669", fontWeight: 700 }}>{m.delivery_rate_pct}%</td>
                          <td style={{ padding: "0.6rem 0.5rem" }}>{m.open_rate_pct}%</td>
                          <td style={{ padding: "0.6rem 0.5rem" }}>{m.ctr_pct}%</td>
                          <td style={{ padding: "0.6rem 0.5rem" }}>{m.responses}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem" }}>
              <button onClick={() => setActiveStep(4)} className="btn btn-secondary">
                Back to Delivery Tracking
              </button>
              <button onClick={() => setActiveStep(6)} className="btn btn-primary micro-hover">
                Next: Feedback & Sentiment <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: FEEDBACK & SENTIMENT ANALYSIS */}
        {activeStep === 6 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Sentiment KPI Breakdown Bar */}
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
                <div>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Step 6: Audience Feedback & Sentiment Analysis</h2>
                  <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
                    Evaluate communication effectiveness through AI sentiment classification & theme clustering.
                  </p>
                </div>
                <span className="badge badge-green" style={{ fontSize: "0.8rem" }}>
                  Avg Sentiment Score: 0.86 / 1.0
                </span>
              </div>

              {/* Multi-Colored Distribution Progress Bar */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.4rem" }}>
                  <span style={{ color: "#10b981" }}>Positive {sentimentBreakdown.positive_pct}%</span>
                  <span style={{ color: "#64748b" }}>Neutral {sentimentBreakdown.neutral_pct}%</span>
                  <span style={{ color: "#ef4444" }}>Negative {sentimentBreakdown.negative_pct}%</span>
                </div>
                <div style={{ display: "flex", height: 14, borderRadius: 999, overflow: "hidden", background: "#f1f5f9" }}>
                  <div style={{ width: `${sentimentBreakdown.positive_pct}%`, background: "#10b981" }} title="Positive" />
                  <div style={{ width: `${sentimentBreakdown.neutral_pct}%`, background: "#94a3b8" }} title="Neutral" />
                  <div style={{ width: `${sentimentBreakdown.negative_pct}%`, background: "#ef4444" }} title="Negative" />
                </div>
              </div>

              {/* Audience Responses Stream */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
                {feedbackList.length === 0 ? (
                  <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
                    No feedback received yet. Submit a test response below to simulate audience reaction.
                  </div>
                ) : (
                  feedbackList.map((fb) => {
                    const isPos = fb.sentiment === "positive";
                    const isNeg = fb.sentiment === "negative";
                    const badgeClass = isPos ? "badge-green" : isNeg ? "badge-red" : "badge-slate";

                    return (
                      <div
                        key={fb.id}
                        style={{
                          padding: "1rem",
                          borderRadius: 12,
                          background: "var(--surface)",
                          border: "1px solid var(--border)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.5rem",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>{fb.recipient_name}</span>
                          <span className={`badge ${badgeClass}`} style={{ fontSize: "0.68rem" }}>
                            {isPos ? <ThumbsUp size={10} /> : isNeg ? <ThumbsDown size={10} /> : <MinusCircle size={10} />}
                            {fb.sentiment}
                          </span>
                        </div>
                        <p style={{ fontSize: "0.82rem", color: "#334155", lineHeight: 1.5, fontStyle: "italic" }}>
                          "{fb.feedback_text}"
                        </p>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#94a3b8", paddingTop: "0.3rem" }}>
                          <span className="badge badge-purple" style={{ fontSize: "0.65rem" }}>{fb.key_theme}</span>
                          <span>via {fb.channel.toUpperCase()}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Submit Test Feedback Simulation */}
              <form
                onSubmit={handleFeedbackSubmit}
                style={{
                  background: "rgba(99,102,241,0.04)",
                  padding: "1.25rem",
                  borderRadius: 12,
                  border: "1px solid rgba(99,102,241,0.2)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <h4 style={{ fontWeight: 800, fontSize: "0.9rem", color: "#4f46e5" }}>
                  Simulate Live Audience Response:
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <input
                    type="text"
                    placeholder="Recipient Name (e.g. Ramesh Patel)"
                    value={fbName}
                    onChange={(e) => setFbName(e.target.value)}
                    className="input"
                    style={{ fontSize: "0.85rem" }}
                  />
                  <select
                    value={fbChannel}
                    onChange={(e) => setFbChannel(e.target.value)}
                    className="input select"
                    style={{ fontSize: "0.85rem" }}
                  >
                    <option value="whatsapp">WhatsApp Response</option>
                    <option value="sms">SMS Reply</option>
                    <option value="email">Email Feedback</option>
                  </select>
                </div>
                <input
                  type="text"
                  placeholder="Feedback response text (e.g. Received message, very clear instructions in Hindi!)..."
                  value={fbText}
                  onChange={(e) => setFbText(e.target.value)}
                  className="input"
                  style={{ fontSize: "0.85rem" }}
                />
                <button
                  type="submit"
                  disabled={isSubmittingFb || !fbText.trim()}
                  className="btn btn-secondary btn-sm"
                  style={{ alignSelf: "flex-start" }}
                >
                  <Sparkles size={13} /> Analyze & Record Feedback
                </button>
              </form>

              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem" }}>
                <button onClick={() => setActiveStep(5)} className="btn btn-secondary">
                  Back to Engagement
                </button>
                <button onClick={() => setActiveStep(7)} className="btn btn-primary micro-hover">
                  Next: Analytics Dashboard <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: ANALYTICS OVERVIEW & ACTION BUTTON */}
        {activeStep === 7 && (
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", textAlign: "center", padding: "3rem 1.5rem" }}>
            <div style={{ maxWidth: 640, margin: "0 auto" }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.25rem",
                  boxShadow: "0 10px 25px rgba(79,70,229,0.3)",
                }}
              >
                <BarChart3 size={32} />
              </div>
              <h2 style={{ fontSize: "1.75rem", fontWeight: 900, marginBottom: "0.5rem" }}>
                Multi-Channel Pipeline Completed
              </h2>
              <p style={{ color: "#64748b", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "2rem" }}>
                Your campaign was successfully distributed across {selectedChannels.length} communication channels.
                Open the dedicated <strong>Analytics Hub</strong> to explore interactive charts, channel-wise radar
                comparisons, Indic language reach breakdowns, and time-series engagement graphs.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
                <Link href="/analytics" className="btn btn-primary micro-hover" style={{ padding: "0.75rem 2rem", fontSize: "1rem" }}>
                  <BarChart3 size={18} /> Launch Full Analytics Hub
                </Link>
                <button onClick={() => setActiveStep(1)} className="btn btn-secondary" style={{ padding: "0.75rem 1.5rem" }}>
                  Distribute Another Campaign
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
