"use client";

import Link from "next/link";
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
} from "lucide-react";

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

export default function HomePage() {
  return (
    <div style={{ overflow: "hidden" }}>

      {/* ===== HERO ===== */}
      <section
        style={{
          position: "relative",
          minHeight: "calc(100vh - var(--nav-height))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "5rem 1.5rem",
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

          {/* Trust badges */}
          <div
            className="animate-fade-in delay-500"
            style={{
              display: "flex",
              gap: "1.5rem",
              justifyContent: "center",
              flexWrap: "wrap",
              marginTop: "2.5rem",
              opacity: 0,
            }}
          >
            {["No sign-up required", "Open source", "Free to use"].map((item) => (
              <span
                key={item}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontSize: "0.85rem",
                  color: "#64748b",
                }}
              >
                <CheckCircle size={15} color="#059669" />
                {item}
              </span>
            ))}
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
            <Link href="/history" className="btn btn-secondary btn-lg micro-hover">
              View Examples
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
