"use client";

/**
 * User Task View — /user/tasks
 * Role: any authenticated user
 *
 * Shows:
 * - Own campaigns to review
 * - Feedback pending on completed distributions
 * - Manager info (if assigned)
 * - Role permissions summary
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getUserTasks } from "@/services/notificationService";
import {
  MessageSquare,
  FileText,
  CheckCircle2,
  Clock,
  User,
  ChevronRight,
  Loader2,
  Shield,
  Star,
} from "lucide-react";

export default function UserTasksPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const role = (user as any)?.role as string | undefined;

  // Auth guard
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Load tasks
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLoading(true);
      getUserTasks()
        .then(setTasks)
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading || !isAuthenticated) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "#4f46e5" }} />
      </div>
    );
  }

  const roleBadge =
    role === "admin"
      ? { label: "Admin", color: "#7c3aed", bg: "rgba(124,58,237,0.12)" }
      : role === "manager"
      ? { label: "Manager", color: "#0891b2", bg: "rgba(8,145,178,0.12)" }
      : { label: "User", color: "#10b981", bg: "rgba(16,185,129,0.12)" };

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 16px rgba(16,185,129,0.3)",
          }}>
            <User size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800, color: "var(--foreground)" }}>
              My Tasks
            </h1>
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.875rem" }}>
              Your campaigns, feedback queue, and permissions
            </p>
          </div>
          <span style={{
            marginLeft: "auto",
            padding: "0.3rem 0.85rem", borderRadius: 20,
            background: roleBadge.bg,
            color: roleBadge.color, fontWeight: 700, fontSize: "0.78rem",
            textTransform: "uppercase", border: `1px solid ${roleBadge.color}40`,
          }}>
            {roleBadge.label}
          </span>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
          <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "#4f46e5" }} />
        </div>
      ) : error ? (
        <div className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
          <p style={{ color: "#ef4444", margin: 0 }}>Failed to load tasks: {error}</p>
        </div>
      ) : tasks ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* Manager Info */}
          {tasks.manager && (
            <div className="card" style={{ padding: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <Shield size={18} color="#0891b2" />
                <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "var(--foreground)" }}>
                  Your Manager
                </h2>
              </div>
              <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "linear-gradient(135deg, #0891b2, #0e7490)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 800, fontSize: "1rem",
                }}>
                  {(tasks.manager.name || tasks.manager.email)[0].toUpperCase()}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, color: "var(--foreground)" }}>{tasks.manager.name || "—"}</p>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>{tasks.manager.email}</p>
                </div>
                <span style={{ marginLeft: "auto", padding: "0.2rem 0.6rem", borderRadius: 20, background: "rgba(8,145,178,0.1)", color: "#0891b2", fontSize: "0.75rem", fontWeight: 700 }}>Manager</span>
              </div>
            </div>
          )}

          {/* My Campaigns */}
          <div className="card" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem" }}>
              <MessageSquare size={18} color="#818cf8" />
              <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--foreground)" }}>
                My Campaigns ({tasks.tasks?.my_campaigns?.length || 0})
              </h2>
              <Link href="/campaigns" style={{ marginLeft: "auto", fontSize: "0.8rem", color: "#818cf8", textDecoration: "none", display: "flex", alignItems: "center", gap: 2 }}>
                Create New <ChevronRight size={14} />
              </Link>
            </div>

            {tasks.tasks?.my_campaigns?.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                <MessageSquare size={32} style={{ opacity: 0.3, marginBottom: "0.5rem" }} />
                <p style={{ margin: 0 }}>No campaigns yet.</p>
                <Link href="/campaigns" style={{ color: "#818cf8", fontSize: "0.875rem" }}>Create your first campaign →</Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {tasks.tasks.my_campaigns.map((c: any) => (
                  <div key={c.id} style={{
                    padding: "0.9rem 1rem", borderRadius: 10,
                    background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.12)",
                    display: "flex", alignItems: "center", gap: "0.75rem",
                  }}>
                    <FileText size={16} color="#818cf8" style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: "0.875rem", color: "var(--foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.topic}
                      </p>
                      <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginTop: "0.3rem" }}>
                        <span style={badgeStyle("#4f46e5")}>{c.tone}</span>
                        <span style={badgeStyle("#0891b2")}>{c.target_language}</span>
                        {c.sentiment && <span style={badgeStyle(c.sentiment === "positive" ? "#10b981" : c.sentiment === "negative" ? "#ef4444" : "#f59e0b")}>{c.sentiment}</span>}
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.72rem", color: "#64748b", flexShrink: 0 }}>
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Feedback */}
          <div className="card" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem" }}>
              <Star size={18} color="#f59e0b" />
              <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--foreground)" }}>
                Pending Feedback ({tasks.tasks?.pending_feedback?.length || 0})
              </h2>
            </div>

            {tasks.tasks?.pending_feedback?.length === 0 ? (
              <div style={{ textAlign: "center", padding: "1.5rem", color: "#64748b" }}>
                <CheckCircle2 size={28} color="#10b981" style={{ opacity: 0.5, marginBottom: "0.4rem" }} />
                <p style={{ margin: 0 }}>All caught up! No pending feedback.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {tasks.tasks.pending_feedback.map((d: any) => (
                  <div key={d.distribution_id} style={{
                    padding: "0.9rem 1rem", borderRadius: 10,
                    background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)",
                    display: "flex", alignItems: "center", gap: "0.75rem",
                  }}>
                    <Clock size={16} color="#f59e0b" style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: "0.875rem", color: "var(--foreground)" }}>{d.title}</p>
                      <p style={{ margin: "3px 0 0", fontSize: "0.75rem", color: "#64748b" }}>
                        Completed: {d.completed_at ? new Date(d.completed_at).toLocaleDateString() : "—"}
                      </p>
                    </div>
                    <Link href={`/distribution`} style={{
                      padding: "0.3rem 0.75rem", borderRadius: 8,
                      background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)",
                      color: "#f59e0b", fontSize: "0.78rem", fontWeight: 700, textDecoration: "none",
                    }}>
                      Give Feedback
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Permissions */}
          <div className="card" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
              <Shield size={18} color="#818cf8" />
              <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--foreground)" }}>
                Your Permissions
              </h2>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {tasks.permissions?.map((p: string) => (
                <span key={p} style={{
                  padding: "0.3rem 0.75rem", borderRadius: 20,
                  background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
                  color: "#10b981", fontSize: "0.78rem", fontWeight: 600,
                  display: "flex", alignItems: "center", gap: "0.3rem",
                }}>
                  <CheckCircle2 size={12} /> {p}
                </span>
              ))}
            </div>
          </div>

        </div>
      ) : null}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}

function badgeStyle(color: string): React.CSSProperties {
  return {
    padding: "0.15rem 0.5rem", borderRadius: 12,
    background: `${color}15`, border: `1px solid ${color}30`,
    color, fontSize: "0.7rem", fontWeight: 700,
  };
}
