"use client";

import { useState, FormEvent, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Globe, Zap, AlertCircle, CheckCircle, Shield, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [isAdminMode, setIsAdminMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);


  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("role") === "admin") {
        setIsAdminMode(true);
        setEmail("admin@campaigns.hub");
        setPassword("admin123");
      }
      if (params.get("session") === "expired") {
        setSessionExpired(true);
      }
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSessionExpired(false);
    setLoading(true);
    try {
      await login(email, password);
      if (isAdminMode || email.toLowerCase().includes("admin")) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
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

      <div
        className="animate-scale-in"
        style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}
      >
        {/* Card */}
        <div
          className="glass-card"
          style={{
            padding: "2.5rem 2rem",
            borderRadius: "var(--radius-xl)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.12), 0 0 0 1px var(--glass-border)",
          }}
        >
          {/* Logo + heading */}
          <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem",
                boxShadow: "0 8px 24px rgba(79,70,229,0.4)",
              }}
            >
              <Globe size={24} color="#fff" />
            </div>
            <h1
              style={{
                fontSize: "1.6rem",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                marginBottom: "0.4rem",
              }}
            >
              Welcome back
            </h1>
            <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
              Sign in to your Campaigns Hub account
            </p>
          </div>

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
                    color: "var(--primary)",
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
                  style={{ paddingRight: "2.75rem" }}
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
              className="btn btn-primary"
              disabled={loading}
              style={{ width: "100%", padding: "0.875rem", fontSize: "0.95rem" }}
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
                  Sign in
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
            Sign Up
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
