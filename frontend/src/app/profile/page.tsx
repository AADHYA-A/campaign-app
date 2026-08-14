"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Building2,
  Globe,
  Save,
  Lock,
  CheckCircle,
  AlertCircle,
  LogOut,
  Edit3,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const LANGUAGE_OPTIONS = [
  { code: "eng", label: "English" },
  { code: "hin", label: "Hindi (हिंदी)" },
  { code: "tam", label: "Tamil (தமிழ்)" },
  { code: "tel", label: "Telugu (తెలుగు)" },
  { code: "ben", label: "Bengali (বাংলা)" },
  { code: "mar", label: "Marathi (मराठी)" },
  { code: "guj", label: "Gujarati (ગુજરાતી)" },
  { code: "kan", label: "Kannada (ಕನ್ನಡ)" },
  { code: "mal", label: "Malayalam (മലയാളം)" },
  { code: "pan", label: "Punjabi (ਪੰਜਾਬੀ)" },
];

function AvatarInitials({ name, email, size = 80 }: { name?: string | null; email: string; size?: number }) {
  const initials = name
    ? name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : email[0].toUpperCase();

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 800,
        fontSize: size * 0.35,
        letterSpacing: "-0.03em",
        boxShadow: "0 8px 24px rgba(79,70,229,0.4)",
        flexShrink: 0,
        userSelect: "none",
      }}
    >
      {initials}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, updateProfile, logout } = useAuth();

  // Profile form state
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [organization, setOrganization] = useState("");
  const [preferredLang, setPreferredLang] = useState("eng");

  // Password form state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI state
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Populate form when user loads
  useEffect(() => {
    if (user) {
      setFullName(user.full_name ?? "");
      setBio(user.bio ?? "");
      setOrganization(user.organization ?? "");
      setPreferredLang(user.preferred_language ?? "eng");
    }
  }, [user]);

  const handleProfileSave = async (e: FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      await updateProfile({ full_name: fullName, bio, organization, preferred_language: preferredLang });
      setProfileMsg({ type: "success", text: "Profile updated successfully!" });
    } catch (err: unknown) {
      setProfileMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Update failed",
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSave = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "Passwords do not match." });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }
    setPasswordSaving(true);
    try {
      await updateProfile({ password: newPassword });
      setPasswordMsg({ type: "success", text: "Password changed successfully!" });
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setPasswordMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Password change failed",
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (isLoading || !user) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - var(--nav-height))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: "3px solid var(--border-strong)",
            borderTopColor: "var(--primary)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const msgBox = (msg: typeof profileMsg) =>
    msg ? (
      <div
        className="animate-slide-down"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          padding: "0.75rem 1rem",
          borderRadius: "var(--radius-md)",
          background:
            msg.type === "success"
              ? "rgba(5,150,105,0.08)"
              : "rgba(220,38,38,0.08)",
          border: `1px solid ${msg.type === "success" ? "rgba(5,150,105,0.25)" : "rgba(220,38,38,0.25)"}`,
          color: msg.type === "success" ? "#059669" : "#dc2626",
          fontSize: "0.85rem",
          marginBottom: "1rem",
        }}
      >
        {msg.type === "success" ? (
          <CheckCircle size={16} />
        ) : (
          <AlertCircle size={16} />
        )}
        {msg.text}
      </div>
    ) : null;

  return (
    <div
      className="gradient-bg-main"
      style={{ minHeight: "calc(100vh - var(--nav-height))", padding: "3rem 1.5rem" }}
    >
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* Page header */}
        <div
          className="animate-slide-down"
          style={{ marginBottom: "2.5rem" }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h1 className="page-title" style={{ marginBottom: "0.35rem" }}>
                Your Profile
              </h1>
              <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
                Manage your account details and preferences
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>

        {/* Avatar + identity card */}
        <div
          className="card animate-slide-up"
          style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}
        >
          <AvatarInitials name={user.full_name} email={user.email} size={76} />
          <div>
            <div style={{ fontWeight: 800, fontSize: "1.2rem", letterSpacing: "-0.02em" }}>
              {user.full_name || "Unnamed User"}
            </div>
            <div style={{ color: "#64748b", fontSize: "0.9rem", marginTop: "0.25rem" }}>
              {user.email}
            </div>
            {user.organization && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  marginTop: "0.5rem",
                  fontSize: "0.8rem",
                  background: "var(--primary-light)",
                  color: "var(--primary)",
                  padding: "0.2rem 0.65rem",
                  borderRadius: 999,
                  fontWeight: 600,
                }}
              >
                <Building2 size={12} />
                {user.organization}
              </div>
            )}
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ textAlign: "center" }}>
              <div className="stat-value" style={{ fontSize: "1.5rem", color: "var(--primary)" }}>
                {user.is_verified ? "✓" : "—"}
              </div>
              <div className="stat-label">Verified</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div className="stat-value" style={{ fontSize: "1.5rem" }}>
                {user.preferred_language?.toUpperCase() ?? "ENG"}
              </div>
              <div className="stat-label">Language</div>
            </div>
          </div>
        </div>

        {/* Profile edit form */}
        <div className="card animate-slide-up" style={{ marginBottom: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              marginBottom: "1.5rem",
              paddingBottom: "1rem",
              borderBottom: "1px solid var(--border)",
            }}
          >
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
              <Edit3 size={17} color="var(--primary)" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "1rem" }}>Edit Profile</div>
              <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                Update your personal information
              </div>
            </div>
          </div>

          {msgBox(profileMsg)}

          <form onSubmit={handleProfileSave}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              {/* Full Name */}
              <div>
                <label
                  htmlFor="profile-name"
                  style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.4rem" }}
                >
                  Full name
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="profile-name"
                    type="text"
                    className="input"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{ paddingLeft: "2.5rem" }}
                  />
                  <User size={15} color="#94a3b8" style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)" }} />
                </div>
              </div>

              {/* Organization */}
              <div>
                <label
                  htmlFor="profile-org"
                  style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.4rem" }}
                >
                  Organization
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="profile-org"
                    type="text"
                    className="input"
                    placeholder="Your company or org"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    style={{ paddingLeft: "2.5rem" }}
                  />
                  <Building2 size={15} color="#94a3b8" style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)" }} />
                </div>
              </div>
            </div>

            {/* Email (read-only) */}
            <div style={{ marginBottom: "1rem" }}>
              <label
                htmlFor="profile-email"
                style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.4rem" }}
              >
                Email address
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="profile-email"
                  type="email"
                  className="input"
                  value={user.email}
                  readOnly
                  style={{
                    paddingLeft: "2.5rem",
                    opacity: 0.7,
                    cursor: "not-allowed",
                    background: "var(--surface)",
                  }}
                />
                <Mail size={15} color="#94a3b8" style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)" }} />
              </div>
              <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.3rem" }}>
                Email cannot be changed after registration.
              </p>
            </div>

            {/* Bio */}
            <div style={{ marginBottom: "1rem" }}>
              <label
                htmlFor="profile-bio"
                style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.4rem" }}
              >
                Bio
              </label>
              <textarea
                id="profile-bio"
                className="input"
                placeholder="Tell us a little about yourself…"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                style={{ resize: "vertical", fontFamily: "inherit" }}
              />
            </div>

            {/* Preferred Language */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                htmlFor="profile-lang"
                style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.4rem" }}
              >
                Preferred campaign language
              </label>
              <div style={{ position: "relative" }}>
                <select
                  id="profile-lang"
                  className="input select"
                  value={preferredLang}
                  onChange={(e) => setPreferredLang(e.target.value)}
                  style={{ paddingLeft: "2.5rem" }}
                >
                  {LANGUAGE_OPTIONS.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.label}
                    </option>
                  ))}
                </select>
                <Globe size={15} color="#94a3b8" style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              </div>
            </div>

            <button
              id="profile-save"
              type="submit"
              className="btn btn-primary"
              disabled={profileSaving}
            >
              {profileSaving ? (
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
                  Saving…
                </span>
              ) : (
                <>
                  <Save size={16} />
                  Save changes
                </>
              )}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="card animate-slide-up" style={{ marginBottom: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              marginBottom: "1.5rem",
              paddingBottom: "1rem",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "rgba(217, 119, 6, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Lock size={17} color="#d97706" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "1rem" }}>Change Password</div>
              <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                Choose a strong, unique password
              </div>
            </div>
          </div>

          {msgBox(passwordMsg)}

          <form onSubmit={handlePasswordSave}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
              <div>
                <label
                  htmlFor="pwd-new"
                  style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.4rem" }}
                >
                  New password
                </label>
                <input
                  id="pwd-new"
                  type="password"
                  className="input"
                  placeholder="Min. 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label
                  htmlFor="pwd-confirm"
                  style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.4rem" }}
                >
                  Confirm new password
                </label>
                <input
                  id="pwd-confirm"
                  type="password"
                  className="input"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              id="pwd-save"
              type="submit"
              className="btn btn-secondary"
              disabled={passwordSaving || !newPassword}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
            >
              {passwordSaving ? (
                <>
                  <span style={{ width: 14, height: 14, border: "2px solid var(--border-strong)", borderTopColor: "var(--foreground)", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
                  Updating…
                </>
              ) : (
                <>
                  <Lock size={15} />
                  Update password
                </>
              )}
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div
          className="card animate-slide-up"
          style={{
            border: "1px solid rgba(220, 38, 38, 0.25)",
            background: "rgba(220, 38, 38, 0.03)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              marginBottom: "1rem",
              paddingBottom: "1rem",
              borderBottom: "1px solid rgba(220, 38, 38, 0.15)",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "rgba(220, 38, 38, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AlertCircle size={17} color="#dc2626" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "1rem", color: "#dc2626" }}>
                Danger Zone
              </div>
              <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                Irreversible actions — proceed with caution
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>Delete account</div>
              <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                Permanently removes your account and all associated data.
              </div>
            </div>
            <button
              className="btn"
              style={{
                background: "rgba(220, 38, 38, 0.08)",
                color: "#dc2626",
                border: "1px solid rgba(220, 38, 38, 0.3)",
                flexShrink: 0,
              }}
              onClick={() =>
                window.confirm("Are you sure? This cannot be undone.") &&
                alert("Contact support to delete your account.")
              }
            >
              Delete account
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
