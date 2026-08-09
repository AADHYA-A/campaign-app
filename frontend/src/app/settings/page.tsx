"use client";

import { useState, useEffect } from "react";
import {
  Save,
  Globe,
  Sliders,
  Server,
  CheckCircle,
  RotateCcw,
} from "lucide-react";

const LANG_OPTIONS = [
  { value: "hin", label: "Hindi (हिंदी)" },
  { value: "tam", label: "Tamil (தமிழ்)" },
  { value: "tel", label: "Telugu (తెలుగు)" },
  { value: "ben", label: "Bengali (বাংলা)" },
  { value: "mar", label: "Marathi (मराठी)" },
  { value: "guj", label: "Gujarati (ગુજરાતી)" },
  { value: "kan", label: "Kannada (ಕನ್ನಡ)" },
  { value: "mal", label: "Malayalam (മലയാളം)" },
  { value: "pan", label: "Punjabi (ਪੰਜਾਬੀ)" },
];

const TONE_OPTIONS = [
  { value: "professional", label: "Professional", desc: "Formal, business-appropriate language" },
  { value: "casual", label: "Casual", desc: "Friendly and conversational tone" },
  { value: "festive", label: "Festive 🎉", desc: "Celebratory language for festivals and events" },
  { value: "formal", label: "Formal", desc: "Official and structured communication" },
  { value: "inspirational", label: "Inspirational ✨", desc: "Motivational and uplifting content" },
  { value: "urgent", label: "Urgent", desc: "Time-sensitive, action-driving copy" },
];

const DEFAULTS = {
  defaultLanguage: "hin",
  defaultTone: "professional",
  apiUrl: "http://localhost:8000/api",
  autoTranslate: true,
  showSentiment: true,
  enableHistory: true,
};

type Settings = typeof DEFAULTS;

function SettingSection({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <section className="card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", paddingBottom: "0.875rem", borderBottom: "1px solid var(--border)" }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "var(--primary-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={18} color="var(--primary)" />
        </div>
        <h2 className="section-title">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "1rem",
        cursor: "pointer",
        padding: "0.625rem 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div>
        <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{label}</div>
        {description && <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.1rem" }}>{description}</div>}
      </div>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 46,
          height: 26,
          borderRadius: 999,
          background: checked ? "var(--primary)" : "var(--border-strong)",
          position: "relative",
          transition: "background 0.22s",
          flexShrink: 0,
          boxShadow: checked ? "0 0 10px var(--primary-glow)" : "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 3,
            left: checked ? "calc(100% - 23px)" : 3,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#fff",
            transition: "left 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
        />
      </div>
    </label>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("campaign-hub-settings");
    if (stored) {
      try {
        setSettings({ ...DEFAULTS, ...JSON.parse(stored) });
      } catch { /* ignore */ }
    }
  }, []);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem("campaign-hub-settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setSettings(DEFAULTS);
    localStorage.removeItem("campaign-hub-settings");
    setSaved(false);
  };

  return (
    <div className="gradient-bg-main" style={{ minHeight: "calc(100vh - var(--nav-height))", padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 className="page-title gradient-text" style={{ marginBottom: "0.25rem" }}>Settings</h1>
            <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Configure your default preferences.</p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button onClick={handleReset} className="btn btn-secondary">
              <RotateCcw size={14} /> Reset Defaults
            </button>
            <button onClick={handleSave} className="btn btn-primary micro-hover">
              {saved ? <CheckCircle size={15} /> : <Save size={15} />}
              {saved ? "Saved!" : "Save Settings"}
            </button>
          </div>
        </div>

        {/* Saved Banner */}
        {saved && (
          <div
            className="animate-slide-down"
            style={{
              background: "rgba(5,150,105,0.08)",
              border: "1px solid rgba(5,150,105,0.25)",
              borderRadius: 12,
              padding: "0.875rem 1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              color: "#059669",
              fontWeight: 600,
              fontSize: "0.875rem",
            }}
          >
            <CheckCircle size={18} />
            Settings saved successfully!
          </div>
        )}

        {/* Language & Translation */}
        <SettingSection icon={Globe} title="Language & Translation">
          <div>
            <label style={{ fontWeight: 600, fontSize: "0.85rem", display: "block", marginBottom: "0.4rem" }}>
              Default Target Language
            </label>
            <select
              value={settings.defaultLanguage}
              onChange={(e) => update("defaultLanguage", e.target.value)}
              className="input select"
              style={{ maxWidth: 320 }}
            >
              {LANG_OPTIONS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>

          <Toggle
            label="Auto-Translate"
            description="Automatically translate generated content to your default language"
            checked={settings.autoTranslate}
            onChange={(v) => update("autoTranslate", v)}
          />
        </SettingSection>

        {/* Campaign Generation */}
        <SettingSection icon={Sliders} title="Campaign Generation">
          <div>
            <label style={{ fontWeight: 600, fontSize: "0.85rem", display: "block", marginBottom: "0.75rem" }}>
              Default Tone
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.625rem" }}>
              {TONE_OPTIONS.map((t) => (
                <label
                  key={t.value}
                  style={{
                    padding: "0.875rem",
                    borderRadius: 12,
                    border: `2px solid ${settings.defaultTone === t.value ? "var(--primary)" : "var(--border-strong)"}`,
                    background: settings.defaultTone === t.value ? "var(--primary-light)" : "var(--surface-elevated)",
                    cursor: "pointer",
                    transition: "all 0.18s ease",
                  }}
                >
                  <input
                    type="radio"
                    name="tone"
                    value={t.value}
                    checked={settings.defaultTone === t.value}
                    onChange={() => update("defaultTone", t.value)}
                    style={{ display: "none" }}
                  />
                  <div style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: "0.25rem" }}>{t.label}</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{t.desc}</div>
                </label>
              ))}
            </div>
          </div>

          <Toggle
            label="Show Sentiment Analysis"
            description="Display sentiment score alongside generated campaigns"
            checked={settings.showSentiment}
            onChange={(v) => update("showSentiment", v)}
          />

          <Toggle
            label="Save to History"
            description="Automatically save all generated campaigns to history"
            checked={settings.enableHistory}
            onChange={(v) => update("enableHistory", v)}
          />
        </SettingSection>

        {/* API Config */}
        <SettingSection icon={Server} title="API Configuration">
          <div>
            <label style={{ fontWeight: 600, fontSize: "0.85rem", display: "block", marginBottom: "0.4rem" }}>
              Backend API URL
            </label>
            <input
              type="url"
              value={settings.apiUrl}
              onChange={(e) => update("apiUrl", e.target.value)}
              className="input"
              placeholder="http://localhost:8000/api"
            />
            <p style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "0.4rem" }}>
              The base URL of the FastAPI backend. Change this if you're running the backend on a different host or port.
            </p>
          </div>
        </SettingSection>

        {/* Save button (bottom) */}
        <div style={{ display: "flex", justifyContent: "flex-end", paddingBottom: "1rem" }}>
          <button onClick={handleSave} className="btn btn-primary btn-lg micro-hover">
            {saved ? <CheckCircle size={16} /> : <Save size={16} />}
            {saved ? "Saved!" : "Save All Settings"}
          </button>
        </div>

      </div>
    </div>
  );
}
