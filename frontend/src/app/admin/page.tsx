"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Users,
  Search,
  Trash2,
  CheckCircle,
  XCircle,
  Edit3,
  AlertCircle,
  Loader2,
  Crown,
  UserCircle,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { adminGetUsers, adminUpdateUser, adminDeleteUser, AdminUser } from "@/services/api";

const ROLE_OPTIONS = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
];

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.25rem",
        fontSize: "0.72rem",
        fontWeight: 700,
        padding: "0.2rem 0.55rem",
        borderRadius: 999,
        background: active ? "rgba(5,150,105,0.1)" : "rgba(220,38,38,0.1)",
        color: active ? "#059669" : "#dc2626",
      }}
    >
      {active ? <CheckCircle size={11} /> : <XCircle size={11} />}
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function RoleBadge({ role, isSuperuser }: { role?: string; isSuperuser: boolean }) {
  const isAdmin = isSuperuser || role === "admin";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.25rem",
        fontSize: "0.72rem",
        fontWeight: 700,
        padding: "0.2rem 0.55rem",
        borderRadius: 999,
        background: isAdmin ? "rgba(217,119,6,0.1)" : "rgba(79,70,229,0.1)",
        color: isAdmin ? "#d97706" : "#4f46e5",
      }}
    >
      {isAdmin ? <Crown size={11} /> : <UserCircle size={11} />}
      {isSuperuser ? "Superuser" : isAdmin ? "Admin" : "User"}
    </span>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const isAdmin = user?.is_superuser || (user as unknown as { role?: string })?.role === "admin";

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filtered, setFiltered] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ role: string; is_active: boolean }>({
    role: "user",
    is_active: true,
  });

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push("/dashboard");
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  const fetchUsers = async () => {
    setFetchLoading(true);
    setError(null);
    try {
      const data = await adminGetUsers();
      setUsers(data);
      setFiltered(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchUsers();
    }
  }, [isAuthenticated, isAdmin]);

  // Filter on search
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      q
        ? users.filter(
            (u) =>
              u.email.toLowerCase().includes(q) ||
              u.full_name?.toLowerCase().includes(q) ||
              u.organization?.toLowerCase().includes(q)
          )
        : users
    );
  }, [search, users]);

  const startEdit = (u: AdminUser) => {
    setEditingId(u.id);
    setEditValues({ role: u.role ?? "user", is_active: u.is_active });
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (userId: string) => {
    setSavingId(userId);
    try {
      const updated = await adminUpdateUser(userId, editValues);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updated } : u)));
      setEditingId(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSavingId(null);
    }
  };

  const deleteUser = async (userId: string, email: string) => {
    if (!window.confirm(`Delete user "${email}"? This cannot be undone.`)) return;
    setDeletingId(userId);
    try {
      await adminDeleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading || !user) {
    return (
      <div style={{ minHeight: "calc(100vh - var(--nav-height))", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={36} style={{ animation: "spin 1s linear infinite", color: "var(--primary)" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="gradient-bg-main" style={{ minHeight: "calc(100vh - var(--nav-height))", padding: "3rem 1.5rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div className="animate-slide-down" style={{ marginBottom: "2.5rem" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(217,119,6,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Shield size={20} color="#d97706" />
                </div>
                <h1 className="page-title" style={{ margin: 0 }}>Admin Panel</h1>
              </div>
              <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
                Manage users, roles, and access control.
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                <strong style={{ color: "var(--foreground)" }}>{users.length}</strong> users total
              </span>
              <button onClick={fetchUsers} className="btn btn-secondary" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <RefreshCw size={15} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="animate-slide-down" style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.85rem 1rem", borderRadius: "var(--radius-md)", background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)", color: "#dc2626", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { label: "Total Users", value: users.length, color: "#4f46e5", bg: "rgba(79,70,229,0.1)" },
            { label: "Active", value: users.filter((u) => u.is_active).length, color: "#059669", bg: "rgba(5,150,105,0.1)" },
            { label: "Admins", value: users.filter((u) => u.is_superuser || u.role === "admin").length, color: "#d97706", bg: "rgba(217,119,6,0.1)" },
            { label: "Verified", value: users.filter((u) => u.is_verified).length, color: "#7c3aed", bg: "rgba(124,58,237,0.1)" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card" style={{ cursor: "default" }}>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value" style={{ color: stat.color, marginTop: "0.35rem" }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: "1.25rem" }}>
          <input
            type="text"
            className="input"
            placeholder="Search by email, name, or organisation…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "2.6rem" }}
          />
          <Search size={16} color="#94a3b8" style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)" }} />
        </div>

        {/* Users table */}
        <div className="glass-card animate-slide-up" style={{ padding: 0, overflow: "hidden" }}>
          {fetchLoading ? (
            <div style={{ padding: "4rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", color: "#64748b" }}>
              <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} />
              Loading users…
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "4rem", textAlign: "center", color: "#64748b" }}>
              <Users size={32} style={{ margin: "0 auto 1rem", opacity: 0.4 }} />
              <p>No users found{search ? ` matching "${search}"` : ""}.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["User", "Organisation", "Role", "Status", "Verified", "Actions"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "0.85rem 1.25rem",
                          textAlign: "left",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          color: "#64748b",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, idx) => {
                    const isEditing = editingId === u.id;
                    const isSaving = savingId === u.id;
                    const isDeleting = deletingId === u.id;
                    const isSelf = user?.id === u.id;

                    return (
                      <tr
                        key={u.id}
                        style={{
                          borderBottom: idx < filtered.length - 1 ? "1px solid var(--border)" : "none",
                          background: isEditing ? "rgba(79,70,229,0.04)" : "transparent",
                          transition: "background 0.15s",
                        }}
                      >
                        {/* User info */}
                        <td style={{ padding: "1rem 1.25rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <div
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#fff",
                                fontWeight: 800,
                                fontSize: "0.8rem",
                                flexShrink: 0,
                              }}
                            >
                              {u.full_name ? u.full_name[0].toUpperCase() : u.email[0].toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                                {u.full_name || <span style={{ color: "#94a3b8" }}>No name</span>}
                                {isSelf && (
                                  <span style={{ marginLeft: "0.4rem", fontSize: "0.7rem", color: "#64748b", fontWeight: 400 }}>
                                    (you)
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: "0.78rem", color: "#64748b" }}>{u.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Organisation */}
                        <td style={{ padding: "1rem 1.25rem", fontSize: "0.85rem", color: u.organization ? "var(--foreground)" : "#94a3b8" }}>
                          {u.organization || "—"}
                        </td>

                        {/* Role — editable */}
                        <td style={{ padding: "1rem 1.25rem" }}>
                          {isEditing ? (
                            <select
                              className="input select"
                              value={editValues.role}
                              onChange={(e) => setEditValues((v) => ({ ...v, role: e.target.value }))}
                              style={{ width: "auto", padding: "0.3rem 2rem 0.3rem 0.6rem", fontSize: "0.8rem" }}
                              disabled={u.is_superuser}
                            >
                              {ROLE_OPTIONS.map((r) => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                              ))}
                            </select>
                          ) : (
                            <RoleBadge role={u.role} isSuperuser={u.is_superuser} />
                          )}
                        </td>

                        {/* Status — editable */}
                        <td style={{ padding: "1rem 1.25rem" }}>
                          {isEditing ? (
                            <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontSize: "0.82rem" }}>
                              <input
                                type="checkbox"
                                checked={editValues.is_active}
                                onChange={(e) => setEditValues((v) => ({ ...v, is_active: e.target.checked }))}
                                style={{ accentColor: "var(--primary)", width: 15, height: 15 }}
                              />
                              Active
                            </label>
                          ) : (
                            <StatusBadge active={u.is_active} />
                          )}
                        </td>

                        {/* Verified */}
                        <td style={{ padding: "1rem 1.25rem" }}>
                          {u.is_verified ? (
                            <CheckCircle size={17} color="#059669" />
                          ) : (
                            <XCircle size={17} color="#94a3b8" />
                          )}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: "1rem 1.25rem" }}>
                          {isEditing ? (
                            <div style={{ display: "flex", gap: "0.4rem" }}>
                              <button
                                onClick={() => saveEdit(u.id)}
                                disabled={isSaving}
                                className="btn btn-primary"
                                style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem" }}
                              >
                                {isSaving ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : "Save"}
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="btn btn-secondary"
                                style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem" }}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: "flex", gap: "0.4rem" }}>
                              <button
                                onClick={() => startEdit(u)}
                                disabled={isSelf && !user?.is_superuser}
                                className="btn btn-ghost btn-icon"
                                title="Edit user"
                                style={{ width: 32, height: 32 }}
                              >
                                <Edit3 size={15} />
                              </button>
                              <button
                                onClick={() => deleteUser(u.id, u.email)}
                                disabled={isSelf || isDeleting}
                                className="btn btn-ghost btn-icon"
                                title={isSelf ? "Cannot delete yourself" : "Delete user"}
                                style={{ width: 32, height: 32, color: isSelf ? "#94a3b8" : "#dc2626" }}
                              >
                                {isDeleting ? (
                                  <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
                                ) : (
                                  <Trash2 size={15} />
                                )}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "0.78rem", marginTop: "1.5rem" }}>
          Admin actions are permanent. Deleting a user also anonymises their campaigns.
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
