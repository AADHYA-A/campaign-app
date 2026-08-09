"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Search,
  Filter,
  Plus,
  Globe,
  Calendar,
  TrendingUp,
  BarChart3,
  ArrowUpRight,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { getCampaignHistory, CampaignResponse } from "@/services/api";

const LANG_LABELS: Record<string, string> = {
  hin: "Hindi",
  tam: "Tamil",
  tel: "Telugu",
  ben: "Bengali",
  mar: "Marathi",
  guj: "Gujarati",
  kan: "Kannada",
  mal: "Malayalam",
  pan: "Punjabi",
};

const SENTIMENT_BADGE: Record<string, string> = {
  positive: "badge-green",
  negative: "badge-red",
  neutral: "badge-slate",
};

function CampaignCard({ campaign }: { campaign: CampaignResponse }) {
  const langLabel = LANG_LABELS[campaign.target_language] ?? campaign.target_language;
  const sentimentClass = SENTIMENT_BADGE[campaign.sentiment.sentiment] ?? "badge-slate";
  const date = new Date(campaign.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="card micro-hover" style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
        <h3 style={{ fontWeight: 700, fontSize: "0.95rem", lineHeight: 1.4 }}>{campaign.topic}</h3>
        <span className={`badge ${sentimentClass}`} style={{ flexShrink: 0 }}>
          {campaign.sentiment.sentiment}
        </span>
      </div>

      <p
        style={{
          fontSize: "0.85rem",
          color: "#64748b",
          lineHeight: 1.65,
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {campaign.original_content}
      </p>

      <div
        style={{
          background: "var(--surface)",
          borderRadius: 10,
          padding: "0.75rem",
          border: "1px solid var(--border)",
        }}
      >
        <p style={{ fontSize: "0.7rem", color: "#94a3b8", marginBottom: "0.3rem", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
          {langLabel} Translation
        </p>
        <p
          style={{
            fontSize: "0.85rem",
            lineHeight: 1.6,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {campaign.translated_content || "—"}
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <span className="badge badge-blue" style={{ fontSize: "0.7rem" }}>
            <Globe size={10} /> {langLabel}
          </span>
          <span className="badge badge-slate" style={{ fontSize: "0.7rem" }}>
            <Calendar size={10} /> {date}
          </span>
          <span className="badge badge-purple" style={{ fontSize: "0.7rem" }}>
            <BarChart3 size={10} /> {(campaign.sentiment.confidence * 100).toFixed(0)}% conf.
          </span>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div
      style={{
        gridColumn: "1 / -1",
        textAlign: "center",
        padding: "4rem 1rem",
        color: "#64748b",
      }}
    >
      <MessageSquare size={48} color="#cbd5e1" style={{ margin: "0 auto 1rem" }} />
      <h3 style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.5rem" }}>
        {filtered ? "No campaigns match your filters" : "No campaigns yet"}
      </h3>
      <p style={{ fontSize: "0.875rem", marginBottom: "1.5rem" }}>
        {filtered
          ? "Try adjusting your search or filter criteria."
          : "Head to the Dashboard and generate your first campaign!"}
      </p>
      <Link href="/dashboard" className="btn btn-primary micro-hover">
        <Sparkles size={15} /> Generate a Campaign
      </Link>
    </div>
  );
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterLang, setFilterLang] = useState("all");
  const [filterSentiment, setFilterSentiment] = useState("all");

  const fetchCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCampaignHistory();
      setCampaigns(data);
    } catch {
      setError("Could not load campaigns. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const filtered = campaigns.filter((c) => {
    const matchSearch =
      !search ||
      c.topic.toLowerCase().includes(search.toLowerCase()) ||
      c.original_content.toLowerCase().includes(search.toLowerCase());
    const matchLang = filterLang === "all" || c.target_language === filterLang;
    const matchSentiment = filterSentiment === "all" || c.sentiment.sentiment === filterSentiment;
    return matchSearch && matchLang && matchSentiment;
  });

  return (
    <div className="gradient-bg-main" style={{ minHeight: "calc(100vh - var(--nav-height))", padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 className="page-title gradient-text" style={{ marginBottom: "0.25rem" }}>
              Campaigns
            </h1>
            <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
              {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""} total
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button onClick={fetchCampaigns} className="btn btn-secondary" disabled={loading}>
              <RefreshCw size={14} className={loading ? "animate-spin-slow" : ""} />
              Refresh
            </button>
            <Link href="/dashboard" className="btn btn-primary micro-hover">
              <Plus size={15} />
              New Campaign
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div
          className="glass-card"
          style={{
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
            alignItems: "center",
            padding: "1rem 1.25rem",
          }}
        >
          <div style={{ position: "relative", flex: "1 1 200px", minWidth: 180 }}>
            <Search
              size={15}
              color="#94a3b8"
              style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search campaigns..."
              className="input"
              style={{ paddingLeft: "2.5rem", borderRadius: 999 }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#64748b", fontSize: "0.85rem" }}>
            <Filter size={14} />
            Filters:
          </div>

          <select
            value={filterLang}
            onChange={(e) => setFilterLang(e.target.value)}
            className="input select"
            style={{ width: "auto", flex: "0 1 160px", padding: "0.55rem 2.2rem 0.55rem 0.875rem", fontSize: "0.85rem" }}
          >
            <option value="all">All Languages</option>
            {Object.entries(LANG_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>

          <select
            value={filterSentiment}
            onChange={(e) => setFilterSentiment(e.target.value)}
            className="input select"
            style={{ width: "auto", flex: "0 1 160px", padding: "0.55rem 2.2rem 0.55rem 0.875rem", fontSize: "0.85rem" }}
          >
            <option value="all">All Sentiments</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
          </select>

          {(search || filterLang !== "all" || filterSentiment !== "all") && (
            <button
              onClick={() => { setSearch(""); setFilterLang("all"); setFilterSentiment("all"); }}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: "0.8rem" }}
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div
            className="card"
            style={{
              background: "rgba(220,38,38,0.06)",
              border: "1px solid rgba(220,38,38,0.2)",
              color: "#dc2626",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <TrendingUp size={18} />
            <div>
              <strong>Backend not reachable</strong>
              <p style={{ fontSize: "0.85rem", margin: 0, opacity: 0.8 }}>{error}</p>
            </div>
            <button onClick={fetchCampaigns} className="btn btn-secondary btn-sm" style={{ marginLeft: "auto" }}>
              Retry
            </button>
          </div>
        )}

        {/* Loading shimmer */}
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card" style={{ height: 260 }}>
                <div className="shimmer" style={{ height: 20, borderRadius: 8, marginBottom: "0.75rem" }} />
                <div className="shimmer" style={{ height: 14, borderRadius: 8, marginBottom: "0.5rem" }} />
                <div className="shimmer" style={{ height: 14, borderRadius: 8, marginBottom: "0.5rem", width: "80%" }} />
                <div className="shimmer" style={{ height: 80, borderRadius: 10, marginTop: "1rem" }} />
              </div>
            ))}
          </div>
        )}

        {/* Grid */}
        {!loading && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {filtered.length === 0 ? (
              <EmptyState filtered={!!(search || filterLang !== "all" || filterSentiment !== "all")} />
            ) : (
              filtered.map((c) => <CampaignCard key={c.id} campaign={c} />)
            )}
          </div>
        )}

        {/* Footer link */}
        {!loading && filtered.length > 0 && (
          <div style={{ textAlign: "center", paddingTop: "0.5rem" }}>
            <Link href="/history" className="btn btn-ghost" style={{ color: "#64748b" }}>
              View full history table <ArrowUpRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
