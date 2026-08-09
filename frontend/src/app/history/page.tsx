"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  Calendar,
  Copy,
  CheckCheck,
  Globe,
  Search,
  RefreshCw,
  Sparkles,
  ArrowUp,
  ArrowDown,
  MessageSquare,
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

type SortField = "created_at" | "topic" | "sentiment" | "language";
type SortDir = "asc" | "desc";

export default function HistoryPage() {
  const [campaigns, setCampaigns] = useState<CampaignResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCampaignHistory();
      setCampaigns(data);
    } catch {
      setError("Could not reach the backend. Make sure the server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = campaigns
    .filter(
      (c) =>
        !search ||
        c.topic.toLowerCase().includes(search.toLowerCase()) ||
        c.original_content.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === "created_at") {
        cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortField === "topic") {
        cmp = a.topic.localeCompare(b.topic);
      } else if (sortField === "sentiment") {
        cmp = a.sentiment.sentiment.localeCompare(b.sentiment.sentiment);
      } else if (sortField === "language") {
        cmp = a.target_language.localeCompare(b.target_language);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown size={12} color="#cbd5e1" />;
    return sortDir === "asc" ? <ArrowUp size={12} color="#6366f1" /> : <ArrowDown size={12} color="#6366f1" />;
  };

  const thStyle: React.CSSProperties = {
    padding: "0.75rem 1rem",
    fontWeight: 700,
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    color: "#94a3b8",
    background: "var(--surface)",
    whiteSpace: "nowrap",
    userSelect: "none",
    cursor: "pointer",
  };

  return (
    <div className="gradient-bg-main" style={{ minHeight: "calc(100vh - var(--nav-height))", padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 className="page-title gradient-text" style={{ marginBottom: "0.25rem" }}>History</h1>
            <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
              {filtered.length} record{filtered.length !== 1 ? "s" : ""}
              {search ? " (filtered)" : ""}
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button onClick={fetchData} className="btn btn-secondary" disabled={loading}>
              <RefreshCw size={14} className={loading ? "animate-spin-slow" : ""} />
              Refresh
            </button>
            <Link href="/dashboard" className="btn btn-primary micro-hover">
              <Sparkles size={15} /> New Campaign
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="glass-card" style={{ padding: "0.875rem 1.25rem" }}>
          <div style={{ position: "relative", maxWidth: 400 }}>
            <Search
              size={15}
              color="#94a3b8"
              style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by topic or content..."
              className="input"
              style={{ paddingLeft: "2.5rem", borderRadius: 999 }}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="card" style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)", color: "#dc2626" }}>
            <strong>Error: </strong>{error}
            <button onClick={fetchData} className="btn btn-secondary btn-sm" style={{ marginLeft: "1rem" }}>Retry</button>
          </div>
        )}

        {/* Loading shimmer */}
        {loading && (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)" }}>
                <div className="shimmer" style={{ height: 16, borderRadius: 6, marginBottom: "0.5rem", width: "30%" }} />
                <div className="shimmer" style={{ height: 12, borderRadius: 6, width: "70%" }} />
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        {!loading && (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "4rem 1rem", textAlign: "center", color: "#64748b" }}>
                <MessageSquare size={40} color="#cbd5e1" style={{ margin: "0 auto 1rem" }} />
                <p style={{ fontWeight: 600 }}>No campaigns found</p>
                <Link href="/dashboard" className="btn btn-primary micro-hover" style={{ marginTop: "1rem" }}>
                  <Sparkles size={14} /> Generate one
                </Link>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      <th style={thStyle} onClick={() => handleSort("topic")}>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                          Topic {renderSortIcon("topic")}
                        </span>
                      </th>
                      <th style={thStyle} onClick={() => handleSort("language")}>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                          <Globe size={12} /> Language {renderSortIcon("language")}
                        </span>
                      </th>
                      <th style={thStyle} onClick={() => handleSort("sentiment")}>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                          Sentiment {renderSortIcon("sentiment")}
                        </span>
                      </th>
                      <th style={{ ...thStyle, cursor: "default" }}>Content Preview</th>
                      <th style={thStyle} onClick={() => handleSort("created_at")}>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                          <Calendar size={12} /> Date {renderSortIcon("created_at")}
                        </span>
                      </th>
                      <th style={{ ...thStyle, cursor: "default" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c, idx) => (
                      <>
                        <tr
                          key={c.id}
                          style={{
                            borderBottom: "1px solid var(--border)",
                            background: idx % 2 === 0 ? "transparent" : "var(--surface)",
                            cursor: "pointer",
                            transition: "background 0.15s",
                          }}
                          onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--primary-light)")}
                          onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.background = idx % 2 === 0 ? "transparent" : "var(--surface)")}
                          onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                        >
                          <td style={{ padding: "0.875rem 1rem", fontWeight: 600, fontSize: "0.875rem", maxWidth: 200 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <span
                                style={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  maxWidth: 160,
                                  display: "block",
                                }}
                              >
                                {c.topic}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: "0.875rem 1rem" }}>
                            <span className="badge badge-blue" style={{ fontSize: "0.7rem" }}>
                              {LANG_LABELS[c.target_language] ?? c.target_language}
                            </span>
                          </td>
                          <td style={{ padding: "0.875rem 1rem" }}>
                            <span className={`badge ${SENTIMENT_BADGE[c.sentiment.sentiment] ?? "badge-slate"}`} style={{ fontSize: "0.7rem" }}>
                              {c.sentiment.sentiment}
                              <span style={{ opacity: 0.7, marginLeft: "0.25rem" }}>
                                ({(c.sentiment.confidence * 100).toFixed(0)}%)
                              </span>
                            </span>
                          </td>
                          <td style={{ padding: "0.875rem 1rem", maxWidth: 280 }}>
                            <p style={{ fontSize: "0.8rem", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 260 }}>
                              {c.original_content}
                            </p>
                          </td>
                          <td style={{ padding: "0.875rem 1rem", whiteSpace: "nowrap" }}>
                            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                              {new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          </td>
                          <td style={{ padding: "0.875rem 1rem" }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(c.original_content, c.id);
                              }}
                              className="btn btn-ghost btn-sm"
                              style={{ fontSize: "0.75rem" }}
                            >
                              {copiedId === c.id ? <CheckCheck size={14} color="#059669" /> : <Copy size={14} />}
                            </button>
                          </td>
                        </tr>

                        {expanded === c.id && (
                          <tr key={`${c.id}-expanded`} style={{ background: "var(--primary-light)" }}>
                            <td colSpan={6} style={{ padding: "1rem 1.25rem" }}>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="expanded-grid">
                                <div>
                                  <p style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.07em", color: "#94a3b8", marginBottom: "0.4rem", fontWeight: 700 }}>
                                    Original (English)
                                  </p>
                                  <p style={{ fontSize: "0.875rem", lineHeight: 1.7 }}>{c.original_content}</p>
                                </div>
                                <div>
                                  <p style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.07em", color: "#94a3b8", marginBottom: "0.4rem", fontWeight: 700 }}>
                                    Translation ({LANG_LABELS[c.target_language] ?? c.target_language})
                                  </p>
                                  <p style={{ fontSize: "0.875rem", lineHeight: 1.7 }}>{c.translated_content || "—"}</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .expanded-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
