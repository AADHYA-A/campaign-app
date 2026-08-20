"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Globe, UserPlus, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", ok: password.length >= 8 },
    { label: "Uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /\d/.test(password) },
    { label: "Special character", ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ["#dc2626", "#d97706", "#d97706", "#059669", "#059669"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];

  if (!password) return null;

  return (
    <div style={{ marginTop: "0.5rem" }}>
      <div style={{ display: "flex", gap: "4px", marginBottom: "0.4rem" }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 999,
              background: i <= score ? colors[score] : "var(--border-strong)",
              transition: "background 0.3s ease",
            }}
          />
        ))}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "0.75rem", color: colors[score], fontWeight: 600 }}>
          {labels[score]}
        </span>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          {checks.map((c) => (
            <span
              key={c.label}
              style={{
                fontSize: "0.7rem",
                color: c.ok ? "#059669" : "#94a3b8",
                display: "flex",
                alignItems: "center",
                gap: "0.2rem",
              }}
            >
              {c.ok ? "✓" : "·"} {c.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [fullName, setFullName] = useState("");
  const [organization, setOrganization] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!agreed) {
      setError("Please agree to the Terms of Service.");
      return;
    }

    setLoading(true);
    try {
      await register(email, password, fullName || undefined, organization || undefined);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputRow = (
    label: string,
    id: string,
    type: string,
    value: string,
    onChange: (v: string) => void,
    placeholder: string,
    required = false,
    extra?: React.ReactNode
  ) => (
    <div style={{ marginBottom: "1rem" }}>
      <label
        htmlFor={id}
        style={{
          display: "block",
          fontSize: "0.82rem",
          fontWeight: 600,
          marginBottom: "0.4rem",
          color: "var(--foreground)",
        }}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          id={id}
          type={type}
          className="input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          style={extra ? { paddingRight: "2.75rem" } : undefined}
        />
        {extra}
      </div>
    </div>
  );

  const eyeBtn = (show: boolean, toggle: () => void) => (
    <button
      type="button"
      onClick={toggle}
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
    >
      {show ? <EyeOff size={17} /> : <Eye size={17} />}
    </button>
  );

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
      <div className="orb orb-1" />
      <div className="orb orb-3" />

      <div
        className="animate-scale-in"
        style={{ width: "100%", maxWidth: 460, position: "relative", zIndex: 1 }}
      >
        <div
          className="glass-card"
          style={{
            padding: "2.5rem 2rem",
            borderRadius: "var(--radius-xl)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.12), 0 0 0 1px var(--glass-border)",
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
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
              Create your account
            </h1>
            <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
              Join Campaigns Hub — free forever
            </p>
          </div>

          {/* Error */}
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
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Name + Org row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {inputRow("Full name", "reg-name", "text", fullName, setFullName, "Aadhya Sharma")}
              {inputRow("Organization", "reg-org", "text", organization, setOrganization, "Optional")}
            </div>

            {inputRow("Email address", "reg-email", "email", email, setEmail, "you@example.com", true)}

            {/* Password */}
            <div style={{ marginBottom: "1rem" }}>
              <label
                htmlFor="reg-password"
                style={{
                  display: "block",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  marginBottom: "0.4rem",
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  className="input"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: "2.75rem" }}
                  autoComplete="new-password"
                />
                {eyeBtn(showPassword, () => setShowPassword(!showPassword))}
              </div>
              <PasswordStrength password={password} />
            </div>

            {/* Confirm password */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label
                htmlFor="reg-confirm"
                style={{
                  display: "block",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  marginBottom: "0.4rem",
                }}
              >
                Confirm password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="reg-confirm"
                  type={showConfirm ? "text" : "password"}
                  className="input"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{
                    paddingRight: "2.75rem",
                    borderColor:
                      confirmPassword && confirmPassword !== password
                        ? "#dc2626"
                        : undefined,
                  }}
                  autoComplete="new-password"
                />
                {eyeBtn(showConfirm, () => setShowConfirm(!showConfirm))}
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p style={{ fontSize: "0.78rem", color: "#dc2626", marginTop: "0.35rem" }}>
                  Passwords do not match
                </p>
              )}
            </div>

            {/* Terms */}
            <label
              htmlFor="reg-terms"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.6rem",
                marginBottom: "1.5rem",
                cursor: "pointer",
              }}
            >
              <input
                id="reg-terms"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                style={{ marginTop: "2px", accentColor: "var(--primary)", width: 15, height: 15 }}
              />
              <span style={{ fontSize: "0.82rem", color: "#64748b", lineHeight: 1.5 }}>
                I agree to the{" "}
                <Link href="/terms" style={{ color: "var(--primary)", textDecoration: "none" }}>
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" style={{ color: "var(--primary)", textDecoration: "none" }}>
                  Privacy Policy
                </Link>
              </span>
            </label>

            {/* Submit */}
            <button
              id="register-submit"
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
                  Creating account…
                </span>
              ) : (
                <>
                  <UserPlus size={17} />
                  Sign Up
                </>
              )}
            </button>
          </form>

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
              Already have an account?
            </span>
            <div className="divider" style={{ flex: 1, margin: 0 }} />
          </div>

          <Link
            href="/login"
            className="btn btn-secondary"
            style={{ width: "100%", justifyContent: "center" }}
          >
            Sign in instead
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
