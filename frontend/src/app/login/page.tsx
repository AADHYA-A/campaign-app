"use client";

import { useState, FormEvent, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Globe,
  Zap,
  AlertCircle,
  CheckCircle,
  Shield,
  Crown,
  UserCircle,
  Briefcase,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// ── Role configuration ────────────────────────────────────────────────────────

type RoleKey = "user" | "manager" | "admin";

const ROLES: {
  key: RoleKey;
  label: string;
  icon: React.ReactNode;
  email: string;
  password: string;
  color: string;
  accentColor: string;
  gradient: string;
  description: string;
  permissions: string[];
  redirectTo: string;
}[] = [
  {
    key: "user",
    label: "User",
    icon: <UserCircle size={18} />,
    email: "user@campaigns.hub",
    password: "user123",
    color: "#6366f1",
    accentColor: "rgba(99,102,241,0.15)",
    gradient: "linear-gradient(135deg,#4f46e5,#6366f1)",
    description: "Create campaigns, view history, submit feedback",
    permissions: ["Create Campaigns", "View History", "Submit Feedback"],
    redirectTo: "/dashboard",
  },
  {
    key: "manager",
    label: "Manager",
    icon: <Briefcase size={18} />,
    email: "manager@campaigns.hub",
    password: "manager123",
    color: "#0891b2",
    accentColor: "rgba(8,145,178,0.15)",
    gradient: "linear-gradient(135deg,#0891b2,#06b6d4)",
    description: "Send notifications, launch distributions, view analytics",
    permissions: ["Send Notifications", "Launch Distributions", "View Analytics", "Manage Team"],
    redirectTo: "/manager",
  },
  {
    key: "admin",
    label: "Admin",
    icon: <Crown size={18} />,
    email: "admin@campaigns.hub",
    password: "admin123",
    color: "#d97706",
    accentColor: "rgba(217,119,6,0.15)",
    gradient: "linear-gradient(135deg,#d97706,#f59e0b)",
    description: "Full platform access — user management & configuration",
    permissions: ["Manage All Users", "Assign Roles", "System Config", "All Manager Access"],
    redirectTo: "/admin",
  },
];

// ── Component ────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [activeRole, setActiveRole] = useState<RoleKey>("user");
  const [email, setEmail] = useState(ROLES[0].email);
  const [password, setPassword] = useState(ROLES[0].password);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  const currentRole = ROLES.find((r) => r.key === activeRole)!;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const roleParam = params.get("role") as RoleKey | null;
      if (roleParam && ROLES.find((r) => r.key === roleParam)) {
        switchRole(roleParam);
      }
      if (params.get("session") === "expired") {
        setSessionExpired(true);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const switchRole = (role: RoleKey) => {
    const r = ROLES.find((x) => x.key === role)!;
    setActiveRole(role);
    setEmail(r.email);
    setPassword(r.password);
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSessionExpired(false);
    setLoading(true);
    try {
      await login(email, password);
      router.push(currentRole.redirectTo);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - var(--nav-height))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.5rem",
        position: "relative",
        overflow: "hidden",
      }}
      className="gradient-bg-hero"
    >
      {/* Background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      {/* Animated role-color orb */}
      <div
        style={{
          position: "absolute",
          width: 380,
          height: 380,
          borderRadius: "50%",
          background: currentRole.color,
          opacity: 0.06,
          top: "30%",
          right: "20%",
          filter: "blur(80px)",
          transition: "background 0.5s ease",
          pointerEvents: "none",
        }}
      />

      <div
        className="animate-scale-in"
        style={{ width: "100%", maxWidth: 480, position: "relative", zIndex: 1 }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: currentRole.gradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 0.75rem",
              boxShadow: `0 8px 24px ${currentRole.color}55`,
              transition: "all 0.4s ease",
            }}
          >
            <Globe size={24} color="#fff" />
          </div>
          <h1
            style={{
              fontSize: "1.6rem",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              marginBottom: "0.25rem",
            }}
          >
            Campaign Hub
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.88rem" }}>
            Sign in to your account
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            padding: "0.35rem",
            background: "rgba(255,255,255,0.05)",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.08)",
            marginBottom: "1.25rem",
          }}
        >
          {ROLES.map((role) => {
            const isActive = activeRole === role.key;
            return (
              <button
                key={role.key}
                type="button"
                id={`role-tab-${role.key}`}
                onClick={() => switchRole(role.key)}
                style={{
                  flex: 1,
                  padding: "0.6rem 0.5rem",
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.3rem",
                  transition: "all 0.25s ease",
                  background: isActive ? role.gradient : "transparent",
                  color: isActive ? "#fff" : "#64748b",
                  boxShadow: isActive ? `0 4px 16px ${role.color}44` : "none",
                  transform: isActive ? "translateY(-1px)" : "translateY(0)",
                }}
              >
                {role.icon}
                <span style={{ fontSize: "0.75rem", fontWeight: 700 }}>{role.label}</span>
              </button>
            );
          })}
        </div>

        {/* Role description card */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "0.75rem",
            padding: "0.85rem 1rem",
            borderRadius: 12,
            background: currentRole.accentColor,
            border: `1px solid ${currentRole.color}33`,
            marginBottom: "1.25rem",
            transition: "all 0.3s ease",
          }}
        >
          <Shield size={16} style={{ color: currentRole.color, marginTop: 2, flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: "0.8rem", color: currentRole.color, fontWeight: 700, margin: "0 0 0.3rem" }}>
              {currentRole.label} Access
            </p>
            <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: 0, lineHeight: 1.5 }}>
              {currentRole.description}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginTop: "0.5rem" }}>
              {currentRole.permissions.map((perm) => (
                <span
                  key={perm}
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 600,
                    padding: "0.15rem 0.5rem",
                    borderRadius: 99,
                    background: `${currentRole.color}22`,
                    color: currentRole.color,
                  }}
                >
                  {perm}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Card */}
        <div
          className="glass-card"
          style={{
            padding: "2rem",
            borderRadius: "var(--radius-xl)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.12), 0 0 0 1px var(--glass-border)",
          }}
        >
          {/* Session expired banner */}
          {sessionExpired && (
            <div
              className="animate-slide-down"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.85rem 1rem",
                borderRadius: "var(--radius-md)",
                background: "rgba(245, 158, 11, 0.08)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                color: "#f59e0b",
                fontSize: "0.85rem",
                marginBottom: "1rem",
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              Your session has expired. Please log in again.
            </div>
          )}

          {/* Error alert */}
          {error && (
            <div
              className="animate-slide-down"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.85rem 1rem",
                borderRadius: "var(--radius-md)",
                background: "rgba(220, 38, 38, 0.08)",
                border: "1px solid rgba(220, 38, 38, 0.2)",
                color: "#dc2626",
                fontSize: "0.85rem",
                marginBottom: "1.5rem",
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: "1rem" }}>
              <label
                htmlFor="login-email"
                style={{
                  display: "block",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  marginBottom: "0.4rem",
                  color: "var(--foreground)",
                }}
              >
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={{
                  borderColor: `${currentRole.color}44`,
                  transition: "border-color 0.3s ease",
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.4rem",
                }}
              >
                <label
                  htmlFor="login-password"
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "var(--foreground)",
                  }}
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  style={{
                    fontSize: "0.8rem",
                    color: currentRole.color,
                    textDecoration: "none",
                  }}
                >
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  className="input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: "2.75rem", borderColor: `${currentRole.color}44`, transition: "border-color 0.3s ease" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "0.85rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#64748b",
                    display: "flex",
                    padding: 0,
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.875rem",
                fontSize: "0.95rem",
                fontWeight: 700,
                border: "none",
                borderRadius: "var(--radius-md)",
                cursor: loading ? "not-allowed" : "pointer",
                background: currentRole.gradient,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                boxShadow: `0 4px 16px ${currentRole.color}55`,
                transition: "all 0.3s ease",
                opacity: loading ? 0.8 : 1,
              }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                      display: "inline-block",
                    }}
                  />
                  Signing in…
                </span>
              ) : (
                <>
                  <Zap size={17} />
                  Sign in as {currentRole.label}
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              margin: "1.5rem 0",
            }}
          >
            <div className="divider" style={{ flex: 1, margin: 0 }} />
            <span style={{ fontSize: "0.78rem", color: "#94a3b8", whiteSpace: "nowrap" }}>
              New to Campaigns Hub?
            </span>
            <div className="divider" style={{ flex: 1, margin: 0 }} />
          </div>

          {/* Sign Up link */}
          <Link
            href="/register"
            className="btn btn-secondary"
            style={{ width: "100%", justifyContent: "center", gap: "0.4rem" }}
          >
            Create an account
          </Link>
        </div>

        {/* Trust row */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1.5rem",
            marginTop: "1.25rem",
            flexWrap: "wrap",
          }}
        >
          {["Free to use", "Open source", "No card required"].map((item) => (
            <span
              key={item}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                fontSize: "0.78rem",
                color: "#64748b",
              }}
            >
              <CheckCircle size={13} color="#059669" />
              {item}
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
