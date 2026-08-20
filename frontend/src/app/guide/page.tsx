"use client";

import Link from "next/link";
import {
  BookOpen,
  Zap,
  Send,
  BarChart3,
  MessageSquare,
  Globe,
  Users,
  Radio,
  Calendar,
  Activity,
  Brain,
  ArrowRight,
  CheckCircle2,
  Star,
  Sparkles,
  LogIn,
} from "lucide-react";

const steps = [
  {
    step: "01",
    iconName: "LogIn",
    color: "#6366f1",
    bg: "rgba(99,102,241,0.1)",
    title: "Create Your Account",
    subtitle: "Sign Up / Sign In",
    description:
      "Click Sign Up on the top right or on the home page. Fill in your name, email and a secure password. You are instantly logged in and greeted by name in the navbar.",
    tips: [
      "Use a strong password with 8+ characters",
      "Your name appears as Hi, [Name] after login in the navbar",
      "No credit card required — always free",
    ],
  },
  {
    step: "02",
    iconName: "Zap",
    color: "#d97706",
    bg: "rgba(217,119,6,0.1)",
    title: "Generate AI Campaigns",
    subtitle: "Dashboard > New Campaign",
    description:
      "Head to the Dashboard and use the AI Campaign Generator. Enter your campaign topic, select your target audience, choose a tone and pick up to 9 Indic languages. The AI generates, translates, personalises, tone-optimises and quality-checks your message in one click.",
    tips: [
      "Try the Dengue Awareness preset for a quick demo",
      "Supports Hindi, Tamil, Telugu, Bengali, Marathi and 4 more",
      "Copy or export the result as JSON",
    ],
  },
  {
    step: "03",
    iconName: "Send",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.1)",
    title: "Multi-Channel Integration",
    subtitle: "Distribution > Module 1",
    description:
      "Toggle Email, SMS, WhatsApp, Push Notifications and Web Broadcast on or off. Enter API keys for each channel, then click Test Connection to verify. Each channel shows a live status badge.",
    tips: [
      "Test each channel before sending to avoid delivery failures",
      "API keys are stored securely in your session",
      "Use the Load Spec Scenario button to see a pre-filled demo",
    ],
  },
  {
    step: "04",
    iconName: "Calendar",
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
    title: "Campaign Scheduling",
    subtitle: "Distribution > Module 2",
    description:
      "Set the launch date, time, delivery frequency (immediate, daily or weekly) and bulk outreach size. A real-time queue preview shows estimated send volume and time-to-complete.",
    tips: [
      "Immediate dispatch sends within seconds of clicking Launch",
      "Daily and Weekly modes stagger sends to avoid spam filters",
      "Adjust the bulk slider to match your channel capacity",
    ],
  },
  {
    step: "05",
    iconName: "Activity",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    title: "Delivery Tracking",
    subtitle: "Distribution > Module 3",
    description:
      "Watch live Delivered, Failed, Pending and Retrying counts update in real-time. One-click Retry re-queues all failed messages instantly. Download a full audit CSV for reporting.",
    tips: [
      "Green cards show delivered; red cards show failed",
      "Click Retry Engine to re-send failed messages automatically",
      "CSV export includes timestamps, channel and recipient data",
    ],
  },
  {
    step: "06",
    iconName: "Brain",
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.1)",
    title: "Feedback and Sentiment Analysis",
    subtitle: "Distribution > Module 4",
    description:
      "View AI NLP sentiment analysis with a live donut chart (Positive, Neutral, Negative) and an engagement time-series chart. Filter by channel and date to identify which language and channel resonated most with your audience.",
    tips: [
      "Click Run AI Sentiment Analysis to refresh NLP scores",
      "Green = positive sentiment, amber = neutral, red = negative",
      "Export sentiment report to share with stakeholders",
    ],
  },
  {
    step: "07",
    iconName: "BarChart3",
    color: "#ec4899",
    bg: "rgba(236,72,153,0.1)",
    title: "Analytics Dashboard",
    subtitle: "Analytics > Engagement Intelligence",
    description:
      "The Analytics page shows overall engagement rates, reach, open rates, click-through rates and audience sentiment across all campaigns. Use filters to compare performance by language, channel or date range.",
    tips: [
      "Open Rate and CTR update every 30 seconds",
      "Compare campaigns side by side in the table view",
      "Click a data point on the chart to drill down",
    ],
  },
  {
    step: "08",
    iconName: "MessageSquare",
    color: "#059669",
    bg: "rgba(5,150,105,0.1)",
    title: "Manage All Campaigns",
    subtitle: "Campaigns and History",
    description:
      "The Campaigns page lists every campaign you have created with status, language count, reach and actions. History gives a full audit trail of every generation, distribution, retry and export.",
    tips: [
      "Filter by status: Draft, Scheduled, Sent or Failed",
      "Download campaign history as CSV",
      "Archive or delete old campaigns from the action menu",
    ],
  },
];

const iconMap: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  LogIn, Zap, Send, BarChart3, MessageSquare, Calendar, Activity, Brain,
};

const features = [
  { icon: Globe, label: "20+ Indic Languages", color: "#6366f1" },
  { icon: Radio, label: "5 Distribution Channels", color: "#3b82f6" },
  { icon: Calendar, label: "Smart Scheduling", color: "#10b981" },
  { icon: Activity, label: "Real-Time Tracking", color: "#f59e0b" },
  { icon: Brain, label: "AI Sentiment NLP", color: "#7c3aed" },
  { icon: Users, label: "Audience Targeting", color: "#ec4899" },
];

export default function GuidePage() {
  return (
    <main
      style={{
        minHeight: "calc(100vh - var(--nav-height))",
        background:
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.18) 0%, transparent 60%), var(--background)",
        padding: "3rem 1.5rem 5rem",
      }}
    >
      <div style={{ maxWidth: 880, margin: "0 auto", display: "flex", flexDirection: "column", gap: "3rem" }}>

        {/* Hero */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(124,58,237,0.12))",
              border: "1px solid rgba(99,102,241,0.25)",
              borderRadius: 999,
              padding: "0.35rem 1rem",
              marginBottom: "1.5rem",
            }}
          >
            <BookOpen size={15} color="#6366f1" />
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#6366f1" }}>USER GUIDE</span>
          </div>

          <h1
            style={{
              fontSize: "2.6rem",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1.15,
              background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #ec4899 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "1rem",
            }}
          >
            How to Use Campaigns Hub
          </h1>
          <p style={{ color: "#64748b", fontSize: "1rem", maxWidth: 600, margin: "0 auto", lineHeight: 1.7 }}>
            From account creation to real-time multilingual distribution and AI sentiment analysis — a complete walkthrough including all 4 distribution modules.
          </p>
        </div>

        {/* Feature Pills */}
        <div className="glass-card" style={{ display: "flex", flexWrap: "wrap", gap: "0.65rem", justifyContent: "center", padding: "1.25rem" }}>
          {features.map((f) => (
            <div
              key={f.label}
              style={{
                display: "flex", alignItems: "center", gap: "0.45rem",
                padding: "0.4rem 0.85rem", borderRadius: 999,
                background: f.color + "12", border: "1px solid " + f.color + "30",
                fontSize: "0.8rem", fontWeight: 700, color: f.color,
              }}
            >
              <f.icon size={13} />
              {f.label}
            </div>
          ))}
        </div>

        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 800, letterSpacing: "-0.02em", textAlign: "center", color: "var(--foreground)", margin: 0 }}>
            Step-by-Step Walkthrough
          </h2>

          {steps.map((s) => {
            const Icon = iconMap[s.iconName] || Zap;
            return (
              <div
                key={s.step}
                className="glass-card micro-hover"
                style={{
                  display: "flex", gap: "1.25rem", alignItems: "flex-start",
                  border: "1px solid " + s.color + "20",
                  boxShadow: "0 4px 24px " + s.color + "0a",
                  position: "relative", overflow: "hidden",
                }}
              >
                <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "radial-gradient(circle, " + s.color + "15, transparent 70%)", pointerEvents: "none" }} />

                <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: s.bg, border: "2px solid " + s.color + "30", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px " + s.color + "25" }}>
                    <Icon size={22} color={s.color} />
                  </div>
                  <span style={{ fontSize: "0.65rem", fontWeight: 900, color: s.color, letterSpacing: "0.08em" }}>STEP {s.step}</span>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.25rem", flexWrap: "wrap" }}>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--foreground)", margin: 0 }}>{s.title}</h3>
                    <span style={{ fontSize: "0.68rem", fontWeight: 700, color: s.color, background: s.bg, padding: "0.12rem 0.5rem", borderRadius: 999 }}>{s.subtitle}</span>
                  </div>
                  <p style={{ color: "#64748b", fontSize: "0.875rem", lineHeight: 1.65, marginBottom: "0.75rem" }}>{s.description}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    {s.tips.map((tip) => (
                      <div key={tip} style={{ display: "flex", alignItems: "flex-start", gap: "0.45rem" }}>
                        <CheckCircle2 size={13} color={s.color} style={{ marginTop: 2, flexShrink: 0 }} />
                        <span style={{ fontSize: "0.8rem", color: "#475569", lineHeight: 1.5 }}>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="glass-card" style={{ textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
            <Sparkles size={18} color="#6366f1" />
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0 }}>Ready to get started?</h2>
          </div>
          <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "1.25rem" }}>Jump directly to any section of the app.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.65rem", justifyContent: "center" }}>
            {[
              { href: "/register", label: "Sign Up Free", icon: Star, primary: true },
              { href: "/dashboard", label: "Dashboard", icon: Zap, primary: false },
              { href: "/distribution", label: "Distribution", icon: Send, primary: false },
              { href: "/analytics", label: "Analytics", icon: BarChart3, primary: false },
              { href: "/campaigns", label: "Campaigns", icon: MessageSquare, primary: false },
            ].map((link) => (
              <Link key={link.href} href={link.href} className={"btn " + (link.primary ? "btn-primary" : "btn-secondary") + " micro-hover"} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <link.icon size={15} />
                {link.label}
                {link.primary && <ArrowRight size={13} />}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}