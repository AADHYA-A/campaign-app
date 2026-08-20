"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  BarChart3,
  BookOpen,
  Users,
  MessageSquare,
  Zap,
  Loader2,
  Download,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  Globe,
  Copy,
  CheckCheck,
  Wand2,
  Languages,
  UserCog,
  Volume2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { generateFullPipeline, FullPipelineResponse } from "@/services/api";

const weeklyData = [
  { name: "Mon", engagement: 4000, conversion: 2400, reach: 6200 },
  { name: "Tue", engagement: 3000, conversion: 1398, reach: 5100 },
  { name: "Wed", engagement: 5200, conversion: 3800, reach: 8700 },
  { name: "Thu", engagement: 2780, conversion: 3908, reach: 7100 },
  { name: "Fri", engagement: 4890, conversion: 4800, reach: 9200 },
  { name: "Sat", engagement: 3390, conversion: 3800, reach: 6900 },
  { name: "Sun", engagement: 5490, conversion: 5300, reach: 9800 },
];

const TONES = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "festive", label: "Festive 🎉" },
  { value: "formal", label: "Formal" },
  { value: "inspirational", label: "Inspirational ✨" },
  { value: "urgent", label: "Urgent" },
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
];

const AUDIENCE_TYPES = [
  { value: "general_public", label: "General Public" },
  { value: "students", label: "Students" },
  { value: "farmers", label: "Farmers" },
  { value: "healthcare_workers", label: "Healthcare Workers" },
  { value: "employees", label: "Corporate Employees" },
  { value: "senior_citizens", label: "Senior Citizens" },
  { value: "youth", label: "Youth" },
  { value: "women", label: "Women" },
];

// Animated Dynamic Stat Number Component
function AnimatedStatNumber({
  target,
  prefix = "",
  suffix = "",
  decimals = 0,
}: {
  target: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1100;
    const stepTime = 20;
    const totalSteps = duration / stepTime;
    const increment = target / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [target]);

  const formatted = decimals > 0 ? count.toFixed(decimals) : Math.round(count).toLocaleString();

  return (
    <span className="animate-pop" style={{ display: "inline-block" }}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

const stats = [
  { label: "Total Reach", target: 2.4, suffix: "M", decimals: 1, icon: Users, change: "+12%", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  { label: "Active Campaigns", target: 18, suffix: "", decimals: 0, isLive: true, icon: Zap, change: "+4", color: "#d97706", bg: "rgba(217,119,6,0.1)" },
  { label: "Translations", target: 85.6, suffix: "K", decimals: 1, icon: Globe, change: "+8%", color: "#059669", bg: "rgba(5,150,105,0.1)" },
  { label: "Avg Engagement", target: 68.4, suffix: "%", decimals: 1, icon: BarChart3, change: "+4%", color: "#7c3aed", bg: "rgba(124,58,237,0.1)" },
];

// Pipeline step config
const PIPELINE_STEPS = [
  { key: "generate", label: "Generate", icon: Wand2, color: "#6366f1" },
  { key: "translate", label: "Translate", icon: Languages, color: "#059669" },
  { key: "personalize", label: "Personalise", icon: UserCog, color: "#d97706" },
  { key: "tone_optimize", label: "Tone", icon: Volume2, color: "#7c3aed" },
  { key: "quality_check", label: "QC", icon: ShieldCheck, color: "#0ea5e9" },
];

function PipelineProgress({ steps }: { steps: FullPipelineResponse["pipeline_steps"] }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", flexWrap: "wrap", margin: "0.75rem 0" }}>
      {PIPELINE_STEPS.map((ps, idx) => {
        const found = steps.find((s) => s.step === ps.key);
        const status = found?.status ?? "pending";
        return (
          <div key={ps.key} style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                padding: "0.25rem 0.6rem",
                borderRadius: 999,
                fontSize: "0.72rem",
                fontWeight: 700,
                background:
                  status === "success"
                    ? `${ps.color}18`
                    : status === "error"
                    ? "rgba(220,38,38,0.1)"
                    : "var(--surface)",
                color:
                  status === "success"
                    ? ps.color
                    : status === "error"
                    ? "#dc2626"
                    : "#94a3b8",
                border: `1px solid ${
                  status === "success"
                    ? `${ps.color}30`
                    : status === "error"
                    ? "rgba(220,38,38,0.2)"
                    : "var(--border)"
                }`,
              }}
            >
              <ps.icon size={11} />
              {ps.label}
              {status === "success" && <CheckCircle2 size={10} />}
              {status === "error" && <XCircle size={10} />}
            </div>
            {idx < PIPELINE_STEPS.length - 1 && (
              <span style={{ color: "#94a3b8", fontSize: "0.7rem" }}>→</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function QCPanel({ qc }: { qc: FullPipelineResponse["quality_check"] }) {
  const [open, setOpen] = useState(false);

  const checks = [
    { label: "Grammar", data: qc.grammar, icon: "✏️" },
    { label: "Clarity", data: { pass: qc.clarity.pass, issues: qc.clarity.issues }, icon: "💡", extra: `Score: ${qc.clarity.score}/100` },
    { label: "Tone", data: qc.tone_appropriateness, icon: "🎯" },
    { label: "Sensitive Content", data: { pass: qc.sensitive_content.pass, issues: qc.sensitive_content.flags }, icon: "🛡️" },
    { label: "Facts", data: { pass: qc.facts_verification.pass, issues: qc.facts_verification.unverifiable_claims }, icon: "🔍" },
    { label: "Policy", data: { pass: qc.policy_compliance.pass, issues: qc.policy_compliance.violations }, icon: "📋" },
  ];

  const recColor =
    qc.recommendation === "approve"
      ? "#059669"
      : qc.recommendation === "reject"
      ? "#dc2626"
      : "#d97706";

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.6rem 0.85rem",
          background: "var(--surface)",
          border: "none",
          cursor: "pointer",
          color: "var(--foreground)",
          fontSize: "0.82rem",
          fontWeight: 700,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <ShieldCheck size={14} />
          Quality Check — Score: {qc.overall_score}/100
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.7rem", fontWeight: 800, color: recColor, textTransform: "uppercase" }}>
            {qc.recommendation}
          </span>
          {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </span>
      </button>

      {open && (
        <div style={{ padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          {checks.map((c) => (
            <div
              key={c.label}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.5rem",
                fontSize: "0.78rem",
                padding: "0.4rem 0.5rem",
                borderRadius: "var(--radius-sm)",
                background: c.data.pass ? "rgba(5,150,105,0.06)" : "rgba(220,38,38,0.06)",
              }}
            >
              <span>{c.icon}</span>
              <span style={{ fontWeight: 600, flexShrink: 0, color: c.data.pass ? "#059669" : "#dc2626" }}>
                {c.label}
              </span>
              {c.extra && <span style={{ color: "#64748b", fontSize: "0.72rem" }}>({c.extra})</span>}
              {c.data.issues && c.data.issues.length > 0 && (
                <span style={{ color: "#dc2626", fontSize: "0.72rem" }}>
                  — {c.data.issues.slice(0, 2).join("; ")}
                </span>
              )}
              <span style={{ marginLeft: "auto", flexShrink: 0 }}>
                {c.data.pass ? (
                  <CheckCircle2 size={13} color="#059669" />
                ) : (
                  <AlertTriangle size={13} color="#d97706" />
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [targetLang, setTargetLang] = useState("hin");
  const [audienceType, setAudienceType] = useState("general_public");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FullPipelineResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState<"original" | "personalized" | "translated">("personalized");

  useEffect(() => { setMounted(true); }, []);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await generateFullPipeline({
        topic,
        tone,
        target_lang: targetLang,
        audience_type: audienceType,
        location,
      });
      setResult(data);
      setActiveTab("personalized");
    } catch (err) {
      console.error(err);
      alert("Failed to generate campaign. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campaign-${result.topic.replace(/\s+/g, "-")}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayContent =
    result
      ? activeTab === "original"
        ? result.original_content
        : activeTab === "translated"
        ? result.translated_content
        : result.final_content
      : "";

  return (
    <div className="gradient-bg-main" style={{ minHeight: "calc(100vh - var(--nav-height))", padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem" }}>

        {/* Page Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 className="page-title gradient-text" style={{ marginBottom: "0.25rem" }}>Dashboard</h1>
            <p style={{ color: "#64748b", fontSize: "0.9rem" }}>AI-powered multilingual campaign creation & management engine.</p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
            <Link
              href="/guide"
              className="btn btn-secondary micro-hover"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                background: "rgba(99,102,241,0.06)",
                borderColor: "rgba(99,102,241,0.25)",
                color: "#6366f1",
                fontWeight: 600,
              }}
            >
              <BookOpen size={15} color="#6366f1" />
              How to Use
            </Link>
            <button onClick={handleExport} className="btn btn-secondary" disabled={!result}>
              <Download size={15} />
              Export JSON
            </button>
            <Link href="/campaigns" className="btn btn-primary micro-hover">
              <MessageSquare size={15} />
              View All Campaigns
            </Link>
          </div>
        </div>

        {/* Stats Row with Dynamic Animated Numbers & Live Badges */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem" }}>
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="glass-card micro-hover"
              style={{
                cursor: "default",
                position: "relative",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.6)",
                boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <p className="stat-label">{stat.label}</p>
                    {stat.isLive && <span className="live-dot" title="Live real-time active dispatch" />}
                  </div>
                  <p className="stat-value" style={{ marginTop: "0.4rem", color: stat.color, fontWeight: 900 }}>
                    <AnimatedStatNumber target={stat.target} suffix={stat.suffix} decimals={stat.decimals} />
                  </p>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.2rem", fontSize: "0.75rem", fontWeight: 700, color: "#059669", marginTop: "0.4rem" }}>
                    <TrendingUp size={12} />
                    {stat.change} live
                  </span>
                </div>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 4px 14px ${stat.bg}` }}>
                  <stat.icon size={22} color={stat.color} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart + AI Panel */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: "1.5rem" }} className="dashboard-grid">

          {/* Engagement Chart */}
          <div className="glass-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
              <h2 className="section-title">Engagement Trends</h2>
              <select className="input select" style={{ width: "auto", padding: "0.3rem 2rem 0.3rem 0.75rem", fontSize: "0.8rem" }}>
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select>
            </div>
            <div style={{ height: 280 }}>
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyData}>
                    <defs>
                      <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface-elevated)" }} />
                    <Area type="monotone" dataKey="engagement" stroke="#6366f1" strokeWidth={2.5} fill="url(#engGrad)" dot={{ r: 4, fill: "#6366f1" }} activeDot={{ r: 6 }} />
                    <Area type="monotone" dataKey="conversion" stroke="#7c3aed" strokeWidth={2.5} fill="url(#convGrad)" dot={{ r: 4, fill: "#7c3aed" }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* AI Campaign Engine */}
          <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 className="section-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Sparkles size={18} color="#6366f1" />
                AI Engine
              </h2>
              {result && (
                <Link href="/history" className="btn btn-ghost btn-sm" style={{ fontSize: "0.75rem" }}>
                  History <ArrowUpRight size={12} />
                </Link>
              )}
            </div>

            {/* Pipeline Steps Indicator */}
            {result && <PipelineProgress steps={result.pipeline_steps} />}

            {/* Output area */}
            <div style={{ flex: 1, background: "var(--surface)", borderRadius: 14, border: "1px solid var(--border)", overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 180, maxHeight: 320 }}>
              {/* Bot greeting or content */}
              {!result ? (
                <div style={{ padding: "1rem", fontSize: "0.875rem", lineHeight: 1.6, color: "var(--foreground)" }}>
                  <div style={{ background: "var(--primary-light)", borderRadius: "14px 14px 14px 0", padding: "0.75rem 1rem", maxWidth: "88%", marginBottom: "0.75rem" }}>
                    <strong>👋 Hey!</strong> Enter a topic, choose tone, language & audience — then hit <strong>Generate</strong> for the full AI generation pipeline.
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginTop: "0.5rem" }}>
                    {PIPELINE_STEPS.map((ps) => (
                      <span key={ps.key} style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.7rem", color: "#94a3b8", background: "var(--surface-elevated)", padding: "0.2rem 0.5rem", borderRadius: 999, border: "1px solid var(--border)" }}>
                        <ps.icon size={10} />
                        {ps.label}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                  {/* Tabs */}
                  <div style={{ display: "flex", borderBottom: "1px solid var(--border)" }}>
                    {(["personalized", "translated", "original"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                          flex: 1,
                          padding: "0.5rem",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          borderBottom: activeTab === tab ? "2px solid var(--primary)" : "2px solid transparent",
                          color: activeTab === tab ? "var(--primary)" : "#64748b",
                          textTransform: "capitalize",
                        }}
                      >
                        {tab === "personalized" ? "Final" : tab}
                      </button>
                    ))}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, overflowY: "auto", padding: "0.85rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                      <span style={{ fontWeight: 700, fontSize: "0.82rem" }}>✅ {result.topic}</span>
                      <span className={`badge ${result.sentiment.sentiment === "positive" ? "badge-green" : result.sentiment.sentiment === "negative" ? "badge-red" : "badge-slate"}`}>
                        {result.sentiment.sentiment}
                      </span>
                    </div>
                    <p style={{ color: "#64748b", lineHeight: 1.65, fontSize: "0.83rem" }}>{displayContent}</p>

                    {/* Tone analysis */}
                    {activeTab === "personalized" && result.tone_analysis.tone_score && (
                      <div style={{ marginTop: "0.75rem", padding: "0.5rem 0.75rem", background: "rgba(124,58,237,0.07)", borderRadius: "var(--radius-sm)", fontSize: "0.75rem", color: "#7c3aed" }}>
                        🎯 Tone score: <strong>{result.tone_analysis.tone_score}/100</strong>
                        {result.tone_analysis.analysis && ` — ${result.tone_analysis.analysis}`}
                      </div>
                    )}

                    {/* QC panel */}
                    {activeTab === "personalized" && (
                      <div style={{ marginTop: "0.75rem" }}>
                        <QCPanel qc={result.quality_check} />
                      </div>
                    )}
                  </div>

                  {/* Copy & Distribute buttons */}
                  <div style={{ padding: "0.5rem 0.75rem", borderTop: "1px solid var(--border)", display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() => handleCopy(displayContent)}
                      className="btn btn-ghost btn-sm"
                      style={{ flex: 1 }}
                    >
                      {copied ? <><CheckCheck size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
                    </button>
                    <Link
                      href="/distribution"
                      className="btn btn-primary btn-sm micro-hover"
                      style={{ flex: 1, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem" }}
                    >
                      <Zap size={13} /> Distribute (M3)
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
              <select value={tone} onChange={(e) => setTone(e.target.value)} className="input select" style={{ padding: "0.45rem 2rem 0.45rem 0.7rem", fontSize: "0.78rem" }}>
                {TONES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)} className="input select" style={{ padding: "0.45rem 2rem 0.45rem 0.7rem", fontSize: "0.78rem" }}>
                {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>

            {/* Audience selector */}
            <select value={audienceType} onChange={(e) => setAudienceType(e.target.value)} className="input select" style={{ padding: "0.45rem 2rem 0.45rem 0.7rem", fontSize: "0.78rem" }}>
              {AUDIENCE_TYPES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>

            {/* Advanced toggle */}
            <button onClick={() => setShowAdvanced(!showAdvanced)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.3rem", padding: 0 }}>
              {showAdvanced ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              Advanced options
            </button>
            {showAdvanced && (
              <input
                type="text"
                className="input"
                placeholder="Location (e.g. Maharashtra, Rural)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{ fontSize: "0.8rem" }}
              />
            )}

            {/* Topic input + submit */}
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                placeholder="e.g. Dengue prevention awareness…"
                className="input"
                style={{ borderRadius: 999, paddingRight: "3.5rem" }}
              />
              <button
                onClick={handleGenerate}
                disabled={loading || !topic.trim()}
                className="btn btn-primary"
                style={{ position: "absolute", right: 4, padding: "0.5rem", borderRadius: "50%", width: 38, height: 38 }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          {[
            { href: "/distribution", label: "Multi-Channel Distribution", icon: Zap, desc: "Broadcast across Email, SMS, WhatsApp & Push", color: "#3b82f6" },
            { href: "/analytics", label: "Analytics Platform", icon: BarChart3, desc: "Channel-wise reach, Indic breakdown & sentiment", color: "#10b981" },
            { href: "/campaigns", label: "Browse Campaigns", icon: MessageSquare, desc: "View and manage all your generated campaigns", color: "#6366f1" },
            { href: "/history", label: "Campaign History", icon: TrendingUp, desc: "Past campaigns sorted with audit logs", color: "#7c3aed" },
          ].map(({ href, label, icon: Icon, desc, color }) => (
            <Link key={href} href={href} className="card micro-hover" style={{ textDecoration: "none", color: "inherit", cursor: "pointer", display: "block" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={18} color={color} />
                </div>
                <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>{label}</span>
              </div>
              <p style={{ fontSize: "0.8rem", color: "#64748b" }}>{desc}</p>
              <ArrowUpRight size={14} color={color} style={{ marginTop: "0.5rem" }} />
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .dashboard-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
