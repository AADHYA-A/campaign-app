"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  BarChart3,
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
} from "lucide-react";
import { generateCampaign, CampaignResponse } from "@/services/api";

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

const stats = [
  { label: "Total Reach", value: "2.4M", icon: Users, change: "+12%", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  { label: "Active Campaigns", value: "14", icon: Zap, change: "+3", color: "#d97706", bg: "rgba(217,119,6,0.1)" },
  { label: "Translations", value: "85K", icon: Globe, change: "+8%", color: "#059669", bg: "rgba(5,150,105,0.1)" },
  { label: "Avg Engagement", value: "68%", icon: BarChart3, change: "+4%", color: "#7c3aed", bg: "rgba(124,58,237,0.1)" },
];

export default function DashboardPage() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [targetLang, setTargetLang] = useState("hin");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CampaignResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await generateCampaign({ topic, tone, target_lang: targetLang });
      setResult(data);
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

  return (
    <div
      className="gradient-bg-main"
      style={{ minHeight: "calc(100vh - var(--nav-height))", padding: "2rem 1.5rem" }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem" }}>

        {/* Page Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 className="page-title gradient-text" style={{ marginBottom: "0.25rem" }}>
              Dashboard
            </h1>
            <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
              Multilingual reach and analytics at a glance.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button onClick={handleExport} className="btn btn-secondary" disabled={!result}>
              <Download size={15} />
              Export
            </button>
            <Link href="/campaigns" className="btn btn-primary micro-hover">
              <MessageSquare size={15} />
              View All Campaigns
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {stats.map((stat) => (
            <div key={stat.label} className="glass-card micro-hover" style={{ cursor: "default" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p className="stat-label">{stat.label}</p>
                  <p className="stat-value" style={{ marginTop: "0.5rem" }}>{stat.value}</p>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.2rem",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "#059669",
                      marginTop: "0.4rem",
                    }}
                  >
                    <TrendingUp size={12} />
                    {stat.change} this week
                  </span>
                </div>
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 12,
                    background: stat.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <stat.icon size={22} color={stat.color} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts & AI Panel */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 400px",
            gap: "1.5rem",
          }}
          className="dashboard-grid"
        >
          {/* Engagement Chart */}
          <div className="glass-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
              <h2 className="section-title">Engagement Trends</h2>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem", color: "#64748b" }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#6366f1", display: "inline-block" }} />
                  Engagement
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem", color: "#64748b" }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#7c3aed", display: "inline-block" }} />
                  Conversion
                </span>
                <select
                  className="input select"
                  style={{ width: "auto", padding: "0.3rem 2rem 0.3rem 0.75rem", fontSize: "0.8rem" }}
                >
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                </select>
              </div>
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
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid var(--border)",
                        background: "var(--surface-elevated)",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                      }}
                    />
                    <Area type="monotone" dataKey="engagement" stroke="#6366f1" strokeWidth={2.5} fill="url(#engGrad)" dot={{ r: 4, fill: "#6366f1" }} activeDot={{ r: 6 }} />
                    <Area type="monotone" dataKey="conversion" stroke="#7c3aed" strokeWidth={2.5} fill="url(#convGrad)" dot={{ r: 4, fill: "#7c3aed" }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* AI Campaign Assistant */}
          <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 className="section-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Sparkles size={18} color="#6366f1" />
                AI Assistant
              </h2>
              {result && (
                <Link href="/history" className="btn btn-ghost btn-sm" style={{ fontSize: "0.75rem" }}>
                  View History <ArrowUpRight size={12} />
                </Link>
              )}
            </div>

            {/* Chat area */}
            <div
              style={{
                flex: 1,
                background: "var(--surface)",
                borderRadius: 14,
                padding: "1rem",
                border: "1px solid var(--border)",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                minHeight: 200,
                maxHeight: 340,
              }}
            >
              {/* Bot greeting */}
              <div
                style={{
                  background: "var(--primary-light)",
                  borderRadius: "14px 14px 14px 0",
                  padding: "0.75rem 1rem",
                  maxWidth: "88%",
                  fontSize: "0.875rem",
                  lineHeight: 1.6,
                  color: "var(--foreground)",
                }}
              >
                <strong>👋 Hey!</strong> Enter a campaign topic below. Choose your tone and language, then hit <strong>Generate</strong>.
              </div>

              {/* Result */}
              {result && (
                <div
                  className="animate-slide-up card"
                  style={{ fontSize: "0.85rem", padding: "1rem", background: "var(--surface-elevated)" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <strong style={{ fontSize: "0.875rem" }}>✅ {result.topic}</strong>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <span
                        className={`badge ${result.sentiment.sentiment === "positive" ? "badge-green" : result.sentiment.sentiment === "negative" ? "badge-red" : "badge-slate"}`}
                      >
                        {result.sentiment.sentiment}
                      </span>
                    </div>
                  </div>
                  <p style={{ color: "#64748b", lineHeight: 1.6, marginBottom: "0.75rem" }}>
                    {result.original_content}
                  </p>
                  <div
                    style={{
                      borderTop: "1px solid var(--border)",
                      paddingTop: "0.75rem",
                    }}
                  >
                    <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.3rem" }}>
                      Translation ({LANGUAGES.find((l) => l.value === result.target_language)?.label ?? result.target_language})
                    </p>
                    <p style={{ lineHeight: 1.6 }}>{result.translated_content}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(result.original_content + "\n\n" + result.translated_content)}
                    className="btn btn-ghost btn-sm"
                    style={{ marginTop: "0.75rem", width: "100%" }}
                  >
                    {copied ? <><CheckCheck size={14} /> Copied!</> : <><Copy size={14} /> Copy Content</>}
                  </button>
                </div>
              )}
            </div>

            {/* Controls */}
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="input select"
                style={{ flex: 1, padding: "0.5rem 2rem 0.5rem 0.75rem", fontSize: "0.8rem" }}
              >
                {TONES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="input select"
                style={{ flex: 1, padding: "0.5rem 2rem 0.5rem 0.75rem", fontSize: "0.8rem" }}
              >
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>

            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                placeholder="e.g. Diwali sale for electronics..."
                className="input"
                style={{ borderRadius: 999, paddingRight: "3.5rem" }}
              />
              <button
                onClick={handleGenerate}
                disabled={loading || !topic.trim()}
                className="btn btn-primary"
                style={{
                  position: "absolute",
                  right: 4,
                  padding: "0.5rem",
                  borderRadius: "50%",
                  width: 38,
                  height: 38,
                }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
          }}
        >
          {[
            { href: "/campaigns", label: "Browse Campaigns", icon: MessageSquare, desc: "View and manage all your campaigns", color: "#6366f1" },
            { href: "/history", label: "Campaign History", icon: BarChart3, desc: "Past campaigns sorted by date", color: "#7c3aed" },
            { href: "/settings", label: "Settings", icon: Globe, desc: "Configure defaults and preferences", color: "#059669" },
          ].map(({ href, label, icon: Icon, desc, color }) => (
            <Link
              key={href}
              href={href}
              className="card micro-hover"
              style={{ textDecoration: "none", color: "inherit", cursor: "pointer", display: "block" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: `${color}18`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
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
