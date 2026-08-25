"use client";

/**
 * Admin Manager Tasks View — /admin/manager-tasks
 * Role: admin / superuser
 *
 * Allows Admin to:
 * - See all managers and their details (department, active status)
 * - View campaign distribution tasks launched by managers
 * - Manage and audit manager activities
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getAdminManagerTasks } from "@/services/notificationService";
import {
  Shield,
  Zap,
  Users,
  CheckCircle,
  Clock,
  Loader2,
  AlertTriangle,
  FileText,
  Mail,
  MessageSquare,
  Building,
} from "lucide-react";

export default function AdminManagerTasksPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const role = (user as any)?.role as string | undefined;
  const isAdmin = role === "admin" || user?.is_superuser;

  // Auth guard
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  // Load admin data
  useEffect(() => {
    if (!isLoading && isAuthenticated && isAdmin) {
      setLoading(true);
      getAdminManagerTasks()
        .then(setData)
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, [isLoading, isAuthenticated, isAdmin]);

  if (isLoading || !isAuthenticated) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "#4f46e5" }} />
      </div>
    );
  }

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 16px rgba(124,58,237,0.3)",
          }}>
            <Shield size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800, color: "var(--foreground)" }}>
              Manage Manager Tasks
            </h1>
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.875rem" }}>
              Oversee manager workloads, campaign distribution audits, and departments
            </p>
          </div>
          <span style={{
            marginLeft: "auto",
            padding: "0.3rem 0.85rem", borderRadius: 20,
            background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.3)",
            color: "#7c3aed", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase",
          }}>
            Admin Control Panel
          </span>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
          <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "#4f46e5" }} />
        </div>
      ) : error ? (
        <div className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
          <p style={{ color: "#ef4444", margin: 0 }}>Failed to load manager tasks: {error}</p>
        </div>
      ) : data ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* Managers Grid */}
          <div className="card" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem" }}>
              <Users size={18} color="#7c3aed" />
              <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--foreground)" }}>
                Registered Managers ({data.managers?.length || 0})
              </h2>
            </div>

            {data.managers?.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                <p style={{ margin: 0 }}>No managers registered in the platform yet.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
                {data.managers.map((m: any) => (
                  <div key={m.id} style={{
                    padding: "1rem 1.25rem", borderRadius: 12,
                    background: "rgba(124,58,237,0.04)", border: "1px solid rgba(124,58,237,0.12)",
                    display: "flex", flexDirection: "column", gap: "0.5rem",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%",
                        background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                        display: "flex", alignItems: "center", justifyItems: "center",
                        justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "0.85rem",
                      }}>
                        {(m.name || m.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: "0.9rem", color: "var(--foreground)" }}>{m.name || "Unnamed Manager"}</p>
                        <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b" }}>{m.email}</p>
                      </div>
                      <span style={{
                        marginLeft: "auto",
                        padding: "0.15rem 0.5rem", borderRadius: 12,
                        background: m.is_active ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                        color: m.is_active ? "#10b981" : "#ef4444",
                        fontSize: "0.68rem", fontWeight: 700,
                      }}>
                        {m.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem", borderTop: "1px dashed rgba(255,255,255,0.05)", paddingTop: "0.5rem" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", color: "#94a3b8" }}>
                        <Building size={12} /> {m.department || "No Department Assigned"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Distribution tasks audit */}
          <div className="card" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem" }}>
              <Zap size={18} color="#f59e0b" />
              <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--foreground)" }}>
                Distribution Jobs Launched by Managers ({data.manager_tasks?.length || 0})
              </h2>
            </div>

            {data.manager_tasks?.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                <Clock size={32} style={{ opacity: 0.3, marginBottom: "0.5rem" }} />
                <p style={{ margin: 0 }}>No distribution tasks launched by managers yet.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {data.manager_tasks.map((t: any) => (
                  <div key={t.id} style={{
                    padding: "1rem", borderRadius: 10,
                    background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)",
                    display: "flex", alignItems: "center", gap: "1rem",
                  }}>
                    <FileText size={20} color="#94a3b8" style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: "0.9rem", color: "var(--foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {t.title}
                      </p>
                      <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#64748b" }}>
                        Launched by: <strong style={{ color: "#e2e8f0" }}>{t.manager_name || t.manager_email}</strong> ({t.manager_email})
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: "0.35rem" }}>
                      {t.channels.map((ch: string) => (
                        <span key={ch} style={{
                          padding: "0.15rem 0.5rem", borderRadius: 12,
                          background: ch === "email" ? "rgba(59,130,246,0.1)" : "rgba(34,197,94,0.1)",
                          color: ch === "email" ? "#3b82f6" : "#22c55e",
                          fontSize: "0.7rem", fontWeight: 700,
                        }}>
                          {ch}
                        </span>
                      ))}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
                      <span style={{
                        padding: "0.2rem 0.6rem", borderRadius: 8,
                        background: t.status === "completed" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
                        color: t.status === "completed" ? "#10b981" : "#f59e0b",
                        fontSize: "0.75rem", fontWeight: 700,
                      }}>
                        {t.status}
                      </span>
                      <span style={{ fontSize: "0.68rem", color: "#64748b" }}>
                        {t.created_at ? new Date(t.created_at).toLocaleDateString() : ""}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      ) : null}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}
