"use client";

import { useState, FormEvent, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Globe,
  Languages,
  MessageSquare,
  Sparkles,
  Users,
  Zap,
  CheckCircle,
  TrendingUp,
  Shield,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  AlertCircle,
  Lock,
  Mail,
  User,
  Building,
  Crown,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Generation",
    description:
      "Leverage advanced LLMs to craft compelling campaign content tailored to your audience, tone, and topic — in seconds.",
    color: "#6366f1",
    bg: "rgba(99, 102, 241, 0.1)",
  },
  {
    icon: Languages,
    title: "Indic Translation",
    description:
      "Powered by IndicTrans2, translate campaigns into 20+ Indian languages with state-of-the-art accuracy and fluency.",
    color: "#7c3aed",
    bg: "rgba(124, 58, 237, 0.1)",
  },
  {
    icon: BarChart3,
    title: "Sentiment Analysis",
    description:
      "Instantly understand the emotional tone of your campaigns. Ensure the right message always reaches the right people.",
    color: "#059669",
    bg: "rgba(5, 150, 105, 0.1)",
  },
  {
    icon: TrendingUp,
    title: "Engagement Analytics",
    description:
      "Track reach, conversions, and engagement in real-time with beautiful charts and actionable insights.",
    color: "#d97706",
    bg: "rgba(217, 119, 6, 0.1)",
  },
  {
    icon: Users,
    title: "Multi-Audience Reach",
    description:
      "Create variants for different demographics, regions, and platforms from a single campaign brief.",
    color: "#3b82f6",
    bg: "rgba(59, 130, 246, 0.1)",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "Your campaign data stays yours. All content is stored securely with full control over export and deletion.",
    color: "#ec4899",
    bg: "rgba(236, 72, 153, 0.1)",
  },
];

const stats = [
  { value: "20+", label: "Indic Languages" },
  { value: "1M+", label: "Campaigns Generated" },
  { value: "99.9%", label: "Uptime" },
  { value: "< 2s", label: "Generation Time" },
];

const languages = [
  "हिंदी", "தமிழ்", "తెలుగు", "বাংলা", "मराठी",
  "ગુજરાતી", "ಕನ್ನಡ", "മലയാളം", "ਪੰਜਾਬੀ", "ଓଡ଼ିଆ",
];

const steps = [
  { step: "01", title: "Enter Your Topic", description: "Describe your campaign goal — a product launch, a festival offer, a social cause." },
  { step: "02", title: "Choose Tone & Language", description: "Pick your tone (Professional, Casual, Festive) and target Indic language." },
  { step: "03", title: "Generate & Review", description: "AI generates the content and translates it. Review sentiment and make edits." },
  { step: "04", title: "Launch & Measure", description: "Publish your campaign and track engagement analytics in real-time." },
];

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", ok: password.length >= 8 },
    { label: "Uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /\d/.test(password) },
    { label: "Special char", ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ["#dc2626", "#d97706", "#d97706", "#059669", "#059669"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];

  if (!password) return null;

  return (
    <div style={{ marginTop: "0.5rem" }}>
      <div style={{ display: "flex", gap: "4px", marginBottom: "0.35rem" }}>
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
        <div style={{ display: "flex", gap: "0.6rem" }}>
          {checks.map((c) => (
            <span
              key={c.label}
              style={{
                fontSize: "0.68rem",
                color: c.ok ? "#059669" : "#94a3b8",
                display: "flex",
                alignItems: "center",
                gap: "0.15rem",
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

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, login, register } = useAuth();

  // Auth Mode: "signin" | "signup" | "admin"
  const [authMode, setAuthMode] = useState<"signin" | "signup" | "admin">("signin");

  // Sign In Form States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Sign Up Form States
  const [regFullName, setRegFullName] = useState("");
  const [regOrg, setRegOrg] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Admin Form States
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Feedback States
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Check URL query params for admin mode on start
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("tab") === "signup" || urlParams.get("mode") === "signup") {
        setAuthMode("signup");
      } else if (urlParams.get("role") === "admin" || urlParams.get("mode") === "admin") {
        setAuthMode("admin");
      }
    }
  }, []);

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setFormLoading(true);
    try {
      await login(loginEmail, loginPassword);
      setFormSuccess("Welcome back! Loading your dashboard…");
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Sign in failed. Please check credentials.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (regPassword !== regConfirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }
    if (!agreedTerms) {
      setFormError("Please agree to the Terms of Service.");
      return;
    }

    setFormLoading(true);
    try {
      await register(regEmail, regPassword, regFullName || undefined, regOrg || undefined);
      setFormSuccess("Account created successfully! Welcome to Campaigns Hub.");
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleAdminSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setFormLoading(true);
    try {
      await login(adminEmail, adminPassword);
      setFormSuccess("Admin authenticated! Redirecting to Admin Panel…");
      setTimeout(() => {
        router.push("/admin");
      }, 500);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Admin login failed. Please verify credentials.");
    } finally {
      setFormLoading(false);
    }
  };

  // Demo auto-fill helpers
  const fillDemoUser = () => {
    setAuthMode("signin");
    setLoginEmail("user@example.com");
    setLoginPassword("demo12345");
    setFormError(null);
  };

  const fillDemoAdmin = () => {
    setAuthMode("admin");
    setAdminEmail("admin@campaigns.hub");
    setAdminPassword("admin123");
    setFormError(null);
  };

  // 1. Loading state
  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - var(--nav-height))",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            border: "3px solid rgba(99, 102, 241, 0.2)",
            borderTopColor: "var(--primary)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p style={{ color: "#64748b", fontSize: "0.9rem", fontWeight: 500 }}>
          Connecting to Campaigns Hub…
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // 2. Unauthenticated State: Start Page Authentication Gateway
  if (!isAuthenticated) {
    return (
      <div style={{ overflow: "hidden", minHeight: "calc(100vh - var(--nav-height))" }} className="gradient-bg-hero">
        {/* Background Decorative Orbs */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "3.5rem 1.5rem 5rem",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
              gap: "3.5rem",
              alignItems: "center",
            }}
          >
            {/* Left Column: Value Proposition & Hero Showcase */}
            <div>
              {/* Badge */}
              <div
                className="animate-slide-down badge badge-purple"
                style={{ display: "inline-flex", marginBottom: "1.25rem", fontSize: "0.85rem", padding: "0.4rem 1.2rem" }}
              >
                <Sparkles size={14} />
                Powered by IndicTrans2 × AI
              </div>

              {/* Title */}
              <h1
                style={{
                  fontSize: "clamp(2.4rem, 5vw, 4rem)",
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                  lineHeight: 1.1,
                  marginBottom: "1.25rem",
                }}
              >
                Campaigns that speak{" "}
                <span className="gradient-text">every language</span>
                <br />
                <span style={{ color: "#64748b", fontWeight: 700 }}>of India.</span>
              </h1>

              {/* Sub-text */}
              <p
                style={{
                  fontSize: "1.1rem",
                  color: "#64748b",
                  lineHeight: 1.7,
                  marginBottom: "2rem",
                  maxWidth: 520,
                }}
              >
                Create AI-powered marketing campaigns and instantly translate them
                into 20+ Indian languages with state-of-the-art IndicTrans2 translation,
                sentiment analysis, and engagement analytics.
              </p>

              {/* Floating language pills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "2.5rem" }}>
                {languages.map((lang) => (
                  <span
                    key={lang}
                    style={{
                      padding: "0.35rem 0.85rem",
                      borderRadius: 999,
                      background: "var(--glass-bg)",
                      border: "1px solid var(--glass-border)",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "var(--primary)",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    {lang}
                  </span>
                ))}
              </div>

              {/* 3 Key feature badges */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                {[
                  {
                    icon: Zap,
                    title: "Instant Multilingual Campaign Generation",
                    desc: "From idea to full Indic campaign in under 2 seconds.",
                    color: "#4f46e5",
                  },
                  {
                    icon: BarChart3,
                    title: "AI Sentiment & Engagement Tracking",
                    desc: "Ensure maximum resonance and emotional reach across states.",
                    color: "#059669",
                  },
                  {
                    icon: Shield,
                    title: "Admin & Team Collaboration",
                    desc: "Enterprise control, role permissions, and full audit history.",
                    color: "#d97706",
                  },
                ].map(({ icon: Icon, title, desc, color }) => (
                  <div
                    key={title}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.85rem",
                      padding: "0.75rem 1rem",
                      borderRadius: "var(--radius-md)",
                      background: "rgba(255, 255, 255, 0.4)",
                      border: "1px solid var(--border)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: `${color}15`,
                        color: color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{title}</div>
                      <div style={{ fontSize: "0.8rem", color: "#64748b" }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Start Page Auth Portal */}
            <div style={{ width: "100%", maxWidth: 480, margin: "0 auto" }}>
              <div
                className="glass-card animate-scale-in"
                style={{
                  padding: "2.25rem 2rem",
                  borderRadius: "var(--radius-xl)",
                  boxShadow: "0 24px 60px rgba(0,0,0,0.14), 0 0 0 1px var(--glass-border)",
                }}
              >
                {/* Brand Logo & Welcome */}
                <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background:
                        authMode === "admin"
                          ? "linear-gradient(135deg, #d97706 0%, #b45309 100%)"
                          : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 0.75rem",
                      boxShadow:
                        authMode === "admin"
                          ? "0 8px 24px rgba(217,119,6,0.4)"
                          : "0 8px 24px rgba(79,70,229,0.4)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {authMode === "admin" ? (
                      <Shield size={22} color="#fff" />
                    ) : (
                      <Globe size={22} color="#fff" />
                    )}
                  </div>
                  <h2
                    style={{
                      fontSize: "1.45rem",
                      fontWeight: 800,
                      letterSpacing: "-0.03em",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {authMode === "signin" && "Sign In to Campaigns Hub"}
                    {authMode === "signup" && "Create Free Account"}
                    {authMode === "admin" && "Administrator Portal"}
                  </h2>
                  <p style={{ color: "#64748b", fontSize: "0.85rem" }}>
                    {authMode === "signin" && "Enter your details below to access your campaigns"}
                    {authMode === "signup" && "Get started with 20+ Indic languages in seconds"}
                    {authMode === "admin" && "Authorized personnel only — System & user management"}
                  </p>
                </div>

                {/* 3-Tab Selector */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "0.35rem",
                    padding: "0.3rem",
                    background: "var(--surface)",
                    borderRadius: "var(--radius-md)",
                    marginBottom: "1.5rem",
                    border: "1px solid var(--border)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signin");
                      setFormError(null);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.35rem",
                      padding: "0.6rem 0.5rem",
                      borderRadius: "calc(var(--radius-md) - 3px)",
                      border: "none",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      background: authMode === "signin" ? "#fff" : "transparent",
                      color: authMode === "signin" ? "var(--primary)" : "#64748b",
                      boxShadow: authMode === "signin" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                    }}
                  >
                    <LogIn size={14} />
                    Sign In
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signup");
                      setFormError(null);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.35rem",
                      padding: "0.6rem 0.5rem",
                      borderRadius: "calc(var(--radius-md) - 3px)",
                      border: "none",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      background: authMode === "signup" ? "#fff" : "transparent",
                      color: authMode === "signup" ? "var(--primary)" : "#64748b",
                      boxShadow: authMode === "signup" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                    }}
                  >
                    <UserPlus size={14} />
                    Register
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("admin");
                      setFormError(null);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.35rem",
                      padding: "0.6rem 0.5rem",
                      borderRadius: "calc(var(--radius-md) - 3px)",
                      border: "none",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      background: authMode === "admin" ? "#fff" : "transparent",
                      color: authMode === "admin" ? "#d97706" : "#64748b",
                      boxShadow: authMode === "admin" ? "0 2px 8px rgba(217,119,6,0.15)" : "none",
                    }}
                  >
                    <Shield size={14} color={authMode === "admin" ? "#d97706" : "#64748b"} />
                    Admin
                  </button>
                </div>

                {/* Error Alert */}
                {formError && (
                  <div
                    className="animate-slide-down"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.75rem 1rem",
                      borderRadius: "var(--radius-md)",
                      background: "rgba(220, 38, 38, 0.08)",
                      border: "1px solid rgba(220, 38, 38, 0.2)",
                      color: "#dc2626",
                      fontSize: "0.82rem",
                      marginBottom: "1.25rem",
                    }}
                  >
                    <AlertCircle size={15} style={{ flexShrink: 0 }} />
                    {formError}
                  </div>
                )}

                {/* Success Alert */}
                {formSuccess && (
                  <div
                    className="animate-slide-down"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.75rem 1rem",
                      borderRadius: "var(--radius-md)",
                      background: "rgba(5, 150, 105, 0.08)",
                      border: "1px solid rgba(5, 150, 105, 0.2)",
                      color: "#059669",
                      fontSize: "0.82rem",
                      marginBottom: "1.25rem",
                    }}
                  >
                    <CheckCircle size={15} style={{ flexShrink: 0 }} />
                    {formSuccess}
                  </div>
                )}

                {/* ── TAB 1: SIGN IN FORM ── */}
                {authMode === "signin" && (
                  <form onSubmit={handleSignIn}>
                    <div style={{ marginBottom: "1rem" }}>
                      <label
                        htmlFor="start-login-email"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          marginBottom: "0.4rem",
                        }}
                      >
                        <Mail size={13} color="#64748b" />
                        Email address
                      </label>
                      <input
                        id="start-login-email"
                        type="email"
                        className="input"
                        placeholder="you@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </div>

                    <div style={{ marginBottom: "1.25rem" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "0.4rem",
                        }}
                      >
                        <label
                          htmlFor="start-login-pass"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            fontSize: "0.82rem",
                            fontWeight: 600,
                          }}
                        >
                          <Lock size={13} color="#64748b" />
                          Password
                        </label>
                        <Link
                          href="/forgot-password"
                          style={{ fontSize: "0.78rem", color: "var(--primary)", textDecoration: "none" }}
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <div style={{ position: "relative" }}>
                        <input
                          id="start-login-pass"
                          type={showLoginPassword ? "text" : "password"}
                          className="input"
                          placeholder="Enter your password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                          autoComplete="current-password"
                          style={{ paddingRight: "2.75rem" }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
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
                          }}
                        >
                          {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={formLoading}
                      style={{ width: "100%", padding: "0.85rem", fontSize: "0.92rem", justifyContent: "center", gap: "0.5rem" }}
                    >
                      {formLoading ? (
                        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span
                            style={{
                              width: 16,
                              height: 16,
                              border: "2px solid rgba(255,255,255,0.3)",
                              borderTopColor: "#fff",
                              borderRadius: "50%",
                              animation: "spin 0.8s linear infinite",
                            }}
                          />
                          Signing in…
                        </span>
                      ) : (
                        <>
                          <LogIn size={16} />
                          Sign In
                        </>
                      )}
                    </button>

                    {/* Demo Quick Fill */}
                    <div style={{ marginTop: "1rem", textAlign: "center" }}>
                      <button
                        type="button"
                        onClick={fillDemoUser}
                        className="btn btn-ghost"
                        style={{ fontSize: "0.78rem", padding: "0.35rem 0.75rem", color: "var(--primary)" }}
                      >
                        ⚡ Fill Demo Credentials
                      </button>
                    </div>
                  </form>
                )}

                {/* ── TAB 2: SIGN UP / REGISTER FORM ── */}
                {authMode === "signup" && (
                  <form onSubmit={handleSignUp}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem", marginBottom: "0.85rem" }}>
                      <div>
                        <label
                          htmlFor="start-reg-name"
                          style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.35rem" }}
                        >
                          <User size={12} color="#64748b" />
                          Full Name
                        </label>
                        <input
                          id="start-reg-name"
                          type="text"
                          className="input"
                          placeholder="Aadhya Sharma"
                          value={regFullName}
                          onChange={(e) => setRegFullName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="start-reg-org"
                          style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.35rem" }}
                        >
                          <Building size={12} color="#64748b" />
                          Organization
                        </label>
                        <input
                          id="start-reg-org"
                          type="text"
                          className="input"
                          placeholder="Acme Inc."
                          value={regOrg}
                          onChange={(e) => setRegOrg(e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: "0.85rem" }}>
                      <label
                        htmlFor="start-reg-email"
                        style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.35rem" }}
                      >
                        <Mail size={12} color="#64748b" />
                        Email address
                      </label>
                      <input
                        id="start-reg-email"
                        type="email"
                        className="input"
                        placeholder="you@example.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </div>

                    <div style={{ marginBottom: "0.85rem" }}>
                      <label
                        htmlFor="start-reg-password"
                        style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.35rem" }}
                      >
                        <Lock size={12} color="#64748b" />
                        Password
                      </label>
                      <div style={{ position: "relative" }}>
                        <input
                          id="start-reg-password"
                          type={showRegPassword ? "text" : "password"}
                          className="input"
                          placeholder="Create password"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          required
                          style={{ paddingRight: "2.75rem" }}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
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
                          }}
                        >
                          {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <PasswordStrength password={regPassword} />
                    </div>

                    <div style={{ marginBottom: "1.1rem" }}>
                      <label
                        htmlFor="start-reg-confirm"
                        style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.35rem" }}
                      >
                        <Lock size={12} color="#64748b" />
                        Confirm password
                      </label>
                      <div style={{ position: "relative" }}>
                        <input
                          id="start-reg-confirm"
                          type={showRegConfirm ? "text" : "password"}
                          className="input"
                          placeholder="Repeat password"
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          required
                          style={{
                            paddingRight: "2.75rem",
                            borderColor:
                              regConfirmPassword && regConfirmPassword !== regPassword
                                ? "#dc2626"
                                : undefined,
                          }}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegConfirm(!showRegConfirm)}
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
                          }}
                        >
                          {showRegConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <label
                      htmlFor="start-reg-terms"
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.5rem",
                        marginBottom: "1.25rem",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        id="start-reg-terms"
                        type="checkbox"
                        checked={agreedTerms}
                        onChange={(e) => setAgreedTerms(e.target.checked)}
                        style={{ marginTop: "2px", accentColor: "var(--primary)", width: 14, height: 14 }}
                      />
                      <span style={{ fontSize: "0.78rem", color: "#64748b", lineHeight: 1.4 }}>
                        I agree to the Terms of Service & Privacy Policy
                      </span>
                    </label>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={formLoading}
                      style={{ width: "100%", padding: "0.85rem", fontSize: "0.92rem", justifyContent: "center", gap: "0.5rem" }}
                    >
                      {formLoading ? (
                        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span
                            style={{
                              width: 16,
                              height: 16,
                              border: "2px solid rgba(255,255,255,0.3)",
                              borderTopColor: "#fff",
                              borderRadius: "50%",
                              animation: "spin 0.8s linear infinite",
                            }}
                          />
                          Creating account…
                        </span>
                      ) : (
                        <>
                          <UserPlus size={16} />
                          Sign Up & Register
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* ── TAB 3: ADMIN LOGIN FORM ── */}
                {authMode === "admin" && (
                  <form onSubmit={handleAdminSignIn}>
                    <div
                      style={{
                        padding: "0.75rem 1rem",
                        borderRadius: "var(--radius-md)",
                        background: "rgba(217, 119, 6, 0.08)",
                        border: "1px solid rgba(217, 119, 6, 0.25)",
                        marginBottom: "1.25rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                      }}
                    >
                      <Crown size={18} color="#d97706" style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: "0.78rem", color: "#92400e", lineHeight: 1.4 }}>
                        Admin portal grants full access to user management, system metrics, and campaign moderation.
                      </span>
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                      <label
                        htmlFor="start-admin-email"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          marginBottom: "0.4rem",
                        }}
                      >
                        <Shield size={13} color="#d97706" />
                        Admin ID / Email
                      </label>
                      <input
                        id="start-admin-email"
                        type="email"
                        className="input"
                        placeholder="admin@campaigns.hub"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div style={{ marginBottom: "1.25rem" }}>
                      <label
                        htmlFor="start-admin-pass"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          marginBottom: "0.4rem",
                        }}
                      >
                        <Lock size={13} color="#d97706" />
                        Admin Password
                      </label>
                      <div style={{ position: "relative" }}>
                        <input
                          id="start-admin-pass"
                          type={showAdminPassword ? "text" : "password"}
                          className="input"
                          placeholder="Enter admin password"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          required
                          style={{ paddingRight: "2.75rem" }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowAdminPassword(!showAdminPassword)}
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
                          }}
                        >
                          {showAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={formLoading}
                      style={{
                        width: "100%",
                        padding: "0.85rem",
                        fontSize: "0.92rem",
                        justifyContent: "center",
                        gap: "0.5rem",
                        background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
                        boxShadow: "0 4px 14px rgba(217,119,6,0.35)",
                      }}
                    >
                      {formLoading ? (
                        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span
                            style={{
                              width: 16,
                              height: 16,
                              border: "2px solid rgba(255,255,255,0.3)",
                              borderTopColor: "#fff",
                              borderRadius: "50%",
                              animation: "spin 0.8s linear infinite",
                            }}
                          />
                          Authenticating Admin…
                        </span>
                      ) : (
                        <>
                          <Shield size={16} />
                          Admin Sign In
                        </>
                      )}
                    </button>

                    {/* Demo Admin Quick Fill */}
                    <div style={{ marginTop: "1rem", textAlign: "center" }}>
                      <button
                        type="button"
                        onClick={fillDemoAdmin}
                        className="btn btn-ghost"
                        style={{ fontSize: "0.78rem", padding: "0.35rem 0.75rem", color: "#d97706" }}
                      >
                        🛡️ Fill Demo Admin Credentials
                      </button>
                    </div>
                  </form>
                )}

                {/* Footer trust row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "1rem",
                    marginTop: "1.5rem",
                    paddingTop: "1.25rem",
                    borderTop: "1px solid var(--border)",
                    flexWrap: "wrap",
                  }}
                >
                  {["Free forever", "IndicTrans2 AI", "Instant Access"].map((item) => (
                    <span
                      key={item}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        fontSize: "0.75rem",
                        color: "#64748b",
                      }}
                    >
                      <CheckCircle size={12} color="#059669" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  // 3. Authenticated State: Full Platform Website & Dashboard Experience
  const isAdmin =
    user?.is_superuser || (user as unknown as { role?: string })?.role === "admin";

  return (
    <div style={{ overflow: "hidden" }}>
      {/* ===== WELCOME BACK ACTION BAR ===== */}
      <section
        style={{
          background: "linear-gradient(135deg, rgba(79,70,229,0.06) 0%, rgba(124,58,237,0.06) 100%)",
          borderBottom: "1px solid var(--border)",
          padding: "1.25rem 1.5rem",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 800,
                fontSize: "0.95rem",
                boxShadow: "0 4px 12px rgba(79,70,229,0.35)",
              }}
            >
              {(user?.full_name || user?.email || "U")[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "1.05rem" }}>
                Welcome back, {user?.full_name || user?.email?.split("@")[0]}!
              </div>
              <div style={{ fontSize: "0.8rem", color: "#64748b", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span>Signed in as {user?.email}</span>
                {isAdmin && (
                  <span
                    style={{
                      fontSize: "0.68rem",
                      padding: "0.1rem 0.45rem",
                      borderRadius: 999,
                      background: "rgba(217,119,6,0.15)",
                      color: "#d97706",
                      fontWeight: 700,
                    }}
                  >
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
            <Link
              href="/dashboard"
              className="btn btn-primary"
              style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.88rem" }}
            >
              <Zap size={15} />
              + Create Campaign
            </Link>
            <Link
              href="/campaigns"
              className="btn btn-secondary"
              style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.88rem" }}
            >
              <MessageSquare size={15} />
              All Campaigns
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="btn btn-ghost"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontSize: "0.88rem",
                  color: "#d97706",
                  border: "1px solid rgba(217,119,6,0.25)",
                  background: "rgba(217,119,6,0.06)",
                }}
              >
                <Shield size={15} color="#d97706" />
                Admin Panel
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ===== HERO ===== */}
      <section
        style={{
          position: "relative",
          minHeight: "calc(80vh - var(--nav-height))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "4.5rem 1.5rem",
          overflow: "hidden",
        }}
        className="gradient-bg-hero"
      >
        {/* Orbs */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        {/* Floating language pills */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          {languages.map((lang, i) => (
            <div
              key={lang}
              className="animate-fade-in"
              style={{
                position: "absolute",
                padding: "0.4rem 1rem",
                borderRadius: 999,
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
                backdropFilter: "blur(10px)",
                fontSize: "1rem",
                fontWeight: 600,
                color: "var(--primary)",
                animationDelay: `${i * 0.15}s`,
                opacity: 0,
                top: `${10 + (i % 5) * 18}%`,
                left: i < 5 ? `${2 + i * 4}%` : `${60 + (i - 5) * 7}%`,
              }}
            >
              {lang}
            </div>
          ))}
        </div>

        {/* Hero Content */}
        <div
          style={{
            maxWidth: 860,
            textAlign: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Badge */}
          <div
            className="animate-slide-down badge badge-purple"
            style={{ display: "inline-flex", marginBottom: "1.5rem", fontSize: "0.85rem", padding: "0.4rem 1.2rem" }}
          >
            <Sparkles size={14} />
            Powered by IndicTrans2 × AI
          </div>

          {/* Headline */}
          <h1
            className="animate-slide-up delay-100"
            style={{
              fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1.08,
              marginBottom: "1.5rem",
              opacity: 0,
            }}
          >
            Campaigns that speak{" "}
            <span className="gradient-text">every language</span>
            <br />
            <span style={{ color: "#64748b", fontWeight: 700 }}>of India.</span>
          </h1>

          {/* Sub-copy */}
          <p
            className="animate-slide-up delay-200"
            style={{
              fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
              color: "#64748b",
              maxWidth: 620,
              margin: "0 auto 2.5rem",
              lineHeight: 1.7,
              opacity: 0,
            }}
          >
            Generate AI-powered marketing campaigns and instantly translate them
            into 20+ Indian languages using IndicTrans2 — the most accurate Indic
            translation model available.
          </p>

          {/* CTA Buttons */}
          <div
            className="animate-slide-up delay-300"
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              flexWrap: "wrap",
              opacity: 0,
            }}
          >
            <Link href="/dashboard" className="btn btn-primary btn-lg glow-lg micro-hover">
              <Zap size={18} />
              Start Generating
              <ArrowRight size={16} />
            </Link>
            <Link href="/campaigns" className="btn btn-secondary btn-lg micro-hover">
              <MessageSquare size={18} />
              View Campaigns
            </Link>
          </div>
        </div>
      </section>

      {/* ===== STATS BANNER ===== */}
      <section
        style={{
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          padding: "3rem 1.5rem",
        }}
      >
        <div
          style={{
            maxWidth: 1000,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "2rem",
            textAlign: "center",
          }}
        >
          {stats.map(({ value, label }) => (
            <div key={label} className="micro-hover">
              <div
                style={{
                  fontSize: "2.5rem",
                  fontWeight: 900,
                  color: "#fff",
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                }}
              >
                {value}
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "rgba(255,255,255,0.7)",
                  marginTop: "0.4rem",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section style={{ padding: "6rem 1.5rem" }} className="gradient-bg-main">
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <span className="badge badge-blue" style={{ marginBottom: "1rem", display: "inline-flex" }}>
              Features
            </span>
            <h2
              className="page-title"
              style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", marginBottom: "1rem" }}
            >
              Everything you need to{" "}
              <span className="gradient-text">reach India</span>
            </h2>
            <p style={{ color: "#64748b", fontSize: "1.05rem", maxWidth: 560, margin: "0 auto" }}>
              A complete platform for creating, translating, and analyzing multilingual campaigns.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {features.map(({ icon: Icon, title, description, color, bg }) => (
              <div
                key={title}
                className="card micro-hover"
                style={{ cursor: "default" }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1.25rem",
                  }}
                >
                  <Icon size={24} color={color} />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: "0.5rem" }}>
                  {title}
                </h3>
                <p style={{ color: "#64748b", fontSize: "0.9rem", lineHeight: 1.7 }}>
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section
        style={{
          padding: "6rem 1.5rem",
          background: "var(--surface)",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <span className="badge badge-green" style={{ marginBottom: "1rem", display: "inline-flex" }}>
              How it works
            </span>
            <h2
              className="page-title"
              style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}
            >
              From idea to campaign in{" "}
              <span className="gradient-text">4 simple steps</span>
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "2rem",
            }}
          >
            {steps.map(({ step, title, description }) => (
              <div
                key={step}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: "1rem",
                    boxShadow: "0 8px 20px rgba(79,70,229,0.35)",
                  }}
                >
                  {step}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: "1rem" }}>{title}</h3>
                <p style={{ color: "#64748b", fontSize: "0.875rem", lineHeight: 1.7 }}>
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== LANGUAGES STRIP ===== */}
      <section style={{ padding: "5rem 1.5rem" }} className="gradient-bg-main">
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <span className="badge badge-purple" style={{ marginBottom: "1rem", display: "inline-flex" }}>
            <Globe size={13} /> 20+ Languages
          </span>
          <h2
            className="page-title"
            style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.5rem)", marginBottom: "0.75rem" }}
          >
            Speak the language of your customers
          </h2>
          <p style={{ color: "#64748b", marginBottom: "2.5rem", fontSize: "0.95rem" }}>
            Powered by AI4Bharat&apos;s IndicTrans2 — the most accurate multilingual translation model for Indian languages.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center" }}>
            {[
              "Hindi", "Tamil", "Telugu", "Bengali", "Marathi",
              "Gujarati", "Kannada", "Malayalam", "Punjabi", "Odia",
              "Urdu", "Assamese", "Maithili", "Sindhi", "Sanskrit",
            ].map((lang) => (
              <span
                key={lang}
                className="badge badge-purple micro-hover"
                style={{ padding: "0.5rem 1.2rem", fontSize: "0.85rem", cursor: "default" }}
              >
                {lang}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section
        style={{
          padding: "6rem 1.5rem",
          borderTop: "1px solid var(--border)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="orb" style={{ width: 400, height: 400, top: "-50px", right: "-100px", background: "radial-gradient(circle, rgba(99,102,241,0.3), transparent 70%)", animation: "orb-float 6s ease-in-out infinite" }} />
        <div
          style={{
            maxWidth: 700,
            margin: "0 auto",
            textAlign: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          <h2
            className="page-title"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", marginBottom: "1rem" }}
          >
            Ready to reach{" "}
            <span className="gradient-text">1.4 billion</span> people?
          </h2>
          <p style={{ color: "#64748b", fontSize: "1.05rem", marginBottom: "2.5rem", lineHeight: 1.7 }}>
            Join thousands of marketers, NGOs, and businesses using Campaigns Hub
            to connect with India in its own languages.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/dashboard" className="btn btn-primary btn-lg glow micro-hover">
              <Zap size={18} />
              Create Your First Campaign
              <ArrowRight size={16} />
            </Link>
            <Link href="/campaigns" className="btn btn-secondary btn-lg micro-hover">
              View All Campaigns
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
