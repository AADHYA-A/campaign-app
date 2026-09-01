"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  BarChart3,
  BookOpen,
  TrendingUp,
  Users,
  Send,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Mail,
  Smartphone,
  MessageCircle,
  Bell,
  Radio,
  Globe,
  Download,
  Filter,
  Sparkles,
  ArrowUpRight,
  ThumbsUp,
  MinusCircle,
  ThumbsDown,
  Activity,
  Layers,
} from "lucide-react";
import { getAnalyticsOverview, AnalyticsOverviewResponse } from "@/services/api";

const emptyAnalyticsData: AnalyticsOverviewResponse = {
  summary: { total_campaigns: 0, total_distributions: 0, total_audience_reach: 0, total_delivered: 0, total_failed: 0, total_retrying: 0, total_pending: 0, delivery_rate_pct: 0, open_rate_pct: 0, ctr_pct: 0, response_rate_pct: 0 },
  sentiment_overview: { positive_pct: 0, neutral_pct: 0, negative_pct: 0, average_score: 0, total_feedback_count: 0 },
  hourly_trends: [],
  channels: [],
  languages: [],
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsOverviewResponse>(emptyAnalyticsData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [channelView, setChannelView] = useState<"reach" | "open_rate" | "ctr">("reach");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAnalyticsOverview();
      if (res && res.summary) {
        setData(res);
      }
    } catch (err) {
      setError("Analytics could not be loaded. Check that the backend and database are available.");
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Metric,Value\n" +
      `Total Audience Reach,${data.summary.total_audience_reach}\n` +
      `Total Delivered,${data.summary.total_delivered}\n` +
      `Delivery Rate,${data.summary.delivery_rate_pct}%\n` +
      `Open Rate,${data.summary.open_rate_pct}%\n` +
      `Click Through Rate,${data.summary.ctr_pct}%\n` +
      `Response Rate,${data.summary.response_rate_pct}%\n` +
      `Positive Feedback,${data.sentiment_overview.positive_pct}%\n` +
      `Neutral Feedback,${data.sentiment_overview.neutral_pct}%\n` +
      `Negative Feedback,${data.sentiment_overview.negative_pct}%\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Campaign_Analytics_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              <span className="badge badge-purple" style={{ fontSize: "0.75rem", fontWeight: 700 }}>
                ENGAGEMENT INTELLIGENCE
              </span>
              <span className="badge badge-green" style={{ fontSize: "0.75rem" }}>
                Live Analytics
              </span>
            </div>
            <h1 className="page-title gradient-text" style={{ fontSize: "2rem", marginBottom: "0.35rem" }}>
              Engagement Analytics Platform
            </h1>
            <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
              Comprehensive performance visualizations: multi-channel distribution, Indic language reach, and audience sentiment trends.
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
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
                fontSize: "0.85rem",
              }}
            >
              <BookOpen size={14} color="#6366f1" />
              How to Use
            </Link>
            <button onClick={exportReport} className="btn btn-secondary micro-hover">
              <Download size={14} /> Export CSV Report
            </button>
            <Link href="/distribution" className="btn btn-primary micro-hover">
              <Send size={14} /> Distribution Control Center
            </Link>
          </div>
        </div>

        {error && (
          <div role="alert" className="card" style={{ padding: "1rem", borderColor: "rgba(220,38,38,0.35)", color: "#b91c1c" }}>
            {error}
          </div>
        )}

        {/* Global Summary KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          {[
            {
              label: "Total Audience Reach",
              value: data.summary.total_audience_reach.toLocaleString(),
              sub: "100% Target Base",
              icon: Users,
              color: "#3b82f6",
              bg: "rgba(59,130,246,0.1)",
            },
            {
              label: "Delivery Rate",
              value: `${data.summary.delivery_rate_pct}%`,
              sub: `${data.summary.total_delivered.toLocaleString()} delivered`,
              icon: CheckCircle2,
              color: "#10b981",
              bg: "rgba(16,185,129,0.1)",
            },
            {
              label: "Avg Open Rate",
              value: `${data.summary.open_rate_pct}%`,
              sub: "+12.4% vs Industry",
              icon: Activity,
              color: "#6366f1",
              bg: "rgba(99,102,241,0.1)",
            },
            {
              label: "Click-Through Rate",
              value: `${data.summary.ctr_pct}%`,
              sub: "High Intent Actions",
              icon: TrendingUp,
              color: "#ec4899",
              bg: "rgba(236,72,153,0.1)",
            },
            {
              label: "Positive Sentiment",
              value: `${data.sentiment_overview.positive_pct}%`,
              sub: `Score: ${data.sentiment_overview.average_score}/1.0`,
              icon: ThumbsUp,
              color: "#059669",
              bg: "rgba(5,150,105,0.1)",
            },
          ].map((kpi, i) => (
            <div
              key={i}
              className="card micro-hover"
              style={{
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                borderTop: `4px solid ${kpi.color}`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                  {kpi.label}
                </span>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: kpi.bg,
                    color: kpi.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <kpi.icon size={16} />
                </div>
              </div>
              <h3 style={{ fontSize: "1.75rem", fontWeight: 900, color: kpi.color, lineHeight: 1.1 }}>
                {kpi.value}
              </h3>
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{kpi.sub}</span>
            </div>
          ))}
        </div>

        {/* Charts Row 1: Time-Series Engagement & Sentiment Distribution */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>
          {/* Hourly Trends Chart */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: "1.1rem" }}>Audience Engagement Curve (Time-Series)</h3>
                <p style={{ color: "#64748b", fontSize: "0.8rem" }}>
                  Real-time broadcast progression: Sent vs Delivered vs Opened vs Clicked.
                </p>
              </div>
              <span className="badge badge-purple" style={{ fontSize: "0.72rem" }}>Hourly Velocity</span>
            </div>

            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.hourly_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorOpened" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card-bg, #fff)",
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "0.8rem", paddingTop: 10 }} />
                  <Area type="monotone" dataKey="sent" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSent)" name="Sent" />
                  <Area type="monotone" dataKey="delivered" stroke="#10b981" fillOpacity={1} fill="url(#colorDelivered)" name="Delivered" />
                  <Area type="monotone" dataKey="opened" stroke="#6366f1" fillOpacity={1} fill="url(#colorOpened)" name="Opened" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Audience Feedback & Sentiment Gauge Card */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <h3 style={{ fontWeight: 800, fontSize: "1.1rem" }}>Feedback Sentiment</h3>
              <p style={{ color: "#64748b", fontSize: "0.8rem" }}>
                AI sentiment classification of audience feedback.
              </p>
            </div>

            {/* Sentiment Gauge Stats */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.3rem" }}>
                  <span style={{ color: "#10b981", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <ThumbsUp size={13} /> Positive
                  </span>
                  <span>{data.sentiment_overview.positive_pct}%</span>
                </div>
                <div style={{ height: 8, borderRadius: 999, background: "#f1f5f9", overflow: "hidden" }}>
                  <div style={{ width: `${data.sentiment_overview.positive_pct}%`, height: "100%", background: "#10b981" }} />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.3rem" }}>
                  <span style={{ color: "#64748b", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <MinusCircle size={13} /> Neutral
                  </span>
                  <span>{data.sentiment_overview.neutral_pct}%</span>
                </div>
                <div style={{ height: 8, borderRadius: 999, background: "#f1f5f9", overflow: "hidden" }}>
                  <div style={{ width: `${data.sentiment_overview.neutral_pct}%`, height: "100%", background: "#94a3b8" }} />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.3rem" }}>
                  <span style={{ color: "#ef4444", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <ThumbsDown size={13} /> Negative
                  </span>
                  <span>{data.sentiment_overview.negative_pct}%</span>
                </div>
                <div style={{ height: 8, borderRadius: 999, background: "#f1f5f9", overflow: "hidden" }}>
                  <div style={{ width: `${data.sentiment_overview.negative_pct}%`, height: "100%", background: "#ef4444" }} />
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: "auto",
                padding: "1rem",
                borderRadius: 10,
                background: "rgba(16,185,129,0.06)",
                border: "1px solid rgba(16,185,129,0.2)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#059669" }}>COMMUNICATION INDEX</span>
                <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#059669" }}>
                  {(data.sentiment_overview.average_score * 100).toFixed(0)}/100
                </span>
              </div>
              <p style={{ fontSize: "0.78rem", color: "#64748b", margin: 0, lineHeight: 1.4 }}>
                Strong positive sentiment driven by multilingual clarity in Hindi and Tamil regional broadcasts.
              </p>
            </div>
          </div>
        </div>

        {/* Charts Row 2: Channel-Wise Comparison & Indic Languages Reach */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          {/* Channel Comparison Chart */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: "1.1rem" }}>Channel-Wise Reach & Efficacy</h3>
                <p style={{ color: "#64748b", fontSize: "0.8rem" }}>
                  Comparison across Email, SMS, WhatsApp, Push Notification, and Web Broadcast.
                </p>
              </div>
              <div style={{ display: "flex", gap: "0.3rem" }}>
                <button
                  onClick={() => setChannelView("reach")}
                  className={`btn btn-sm ${channelView === "reach" ? "btn-primary" : "btn-secondary"}`}
                  style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem" }}
                >
                  Reach
                </button>
                <button
                  onClick={() => setChannelView("open_rate")}
                  className={`btn btn-sm ${channelView === "open_rate" ? "btn-primary" : "btn-secondary"}`}
                  style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem" }}
                >
                  Open %
                </button>
              </div>
            </div>

            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.channels} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="channel" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card-bg, #fff)",
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                    }}
                  />
                  <Bar
                    dataKey={channelView === "reach" ? "reach" : "open_rate"}
                    fill="#6366f1"
                    radius={[6, 6, 0, 0]}
                    name={channelView === "reach" ? "Audience Reach" : "Open Rate %"}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Indic Language Breakdown Table */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: "1.1rem" }}>Language-Wise Reach & Engagement</h3>
                <p style={{ color: "#64748b", fontSize: "0.8rem" }}>
                  Performance breakdown across Indian languages powered by IndicTrans2.
                </p>
              </div>
              <span className="badge badge-blue" style={{ fontSize: "0.72rem" }}>
                <Globe size={11} /> 9 Languages
              </span>
            </div>

            <div style={{ overflowY: "auto", maxHeight: 260 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)", color: "#64748b", textAlign: "left" }}>
                    <th style={{ padding: "0.5rem" }}>Language</th>
                    <th style={{ padding: "0.5rem" }}>Reach</th>
                    <th style={{ padding: "0.5rem" }}>Delivery %</th>
                    <th style={{ padding: "0.5rem" }}>Open %</th>
                    <th style={{ padding: "0.5rem" }}>Sentiment</th>
                  </tr>
                </thead>
                <tbody>
                  {data.languages.map((l) => (
                    <tr key={l.code} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "0.55rem 0.5rem", fontWeight: 700 }}>{l.language}</td>
                      <td style={{ padding: "0.55rem 0.5rem" }}>{l.reach.toLocaleString()}</td>
                      <td style={{ padding: "0.55rem 0.5rem", color: "#059669", fontWeight: 700 }}>{l.delivery_rate}%</td>
                      <td style={{ padding: "0.55rem 0.5rem", color: "#4f46e5", fontWeight: 700 }}>{l.open_rate}%</td>
                      <td style={{ padding: "0.55rem 0.5rem" }}>
                        <span className="badge badge-green" style={{ fontSize: "0.65rem" }}>
                          {(l.sentiment_score * 100).toFixed(0)}% Pos
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Live Channel Status Grid */}
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 style={{ fontWeight: 800, fontSize: "1.1rem" }}>Communication Channel Health & Dispatch Stats</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
            {data.channels.map((ch, i) => (
              <div
                key={i}
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
                  <span style={{ fontWeight: 800, fontSize: "0.9rem" }}>{ch.channel}</span>
                  <span className="badge badge-green" style={{ fontSize: "0.65rem" }}>
                    {ch.status}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "#64748b" }}>
                  <span>Reach: <strong>{ch.reach.toLocaleString()}</strong></span>
                  <span>Delivery: <strong style={{ color: "#059669" }}>{ch.delivery_rate}%</strong></span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "#64748b" }}>
                  <span>Open Rate: <strong style={{ color: "#4f46e5" }}>{ch.open_rate}%</strong></span>
                  <span>CTR: <strong style={{ color: "#ec4899" }}>{ch.ctr}%</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
