"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  BarChart3,
  BookOpen,
  FileText,
  Globe,
  History,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Send,
  Settings,
  Shield,
  UserCircle,
  X,
  Zap,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const adminNavLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/admin", label: "Admin Panel", icon: Shield },
  { href: "/admin/campaigns", label: "Campaign Review", icon: FileText },
  { href: "/admin/manager-tasks", label: "Manager Tasks", icon: Zap },
  { href: "/settings", label: "Settings", icon: Settings },
];

const managerNavLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/manager", label: "User Tasks", icon: Zap },
  { href: "/distribution", label: "Distribution", icon: Send },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

const userNavLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/campaigns", label: "Campaigns", icon: MessageSquare },
  { href: "/distribution", label: "Distribution", icon: Send },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
];

const authNavLinks = userNavLinks; // fallback

const publicNavLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/guide", label: "How to Use", icon: BookOpen },
];

function AvatarBadge({ name, email }: { name?: string | null; email: string }) {
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
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 800,
        fontSize: "0.82rem",
        letterSpacing: "-0.03em",
        boxShadow: "0 4px 12px rgba(79,70,229,0.35)",
        userSelect: "none",
        flexShrink: 0,
        cursor: "pointer",
      }}
      aria-label={`User avatar for ${name || email}`}
    >
      {initials}
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    setMobileOpen(false);
    await logout();
    router.push("/");
  };

  const isAdmin =
    user?.is_superuser || (user as unknown as { role?: string })?.role === "admin";
  const isManager = (user as unknown as { role?: string })?.role === "manager";

  // Choose nav links based on role
  const roleNavLinks = isAdmin
    ? adminNavLinks
    : isManager
    ? managerNavLinks
    : isAuthenticated
    ? userNavLinks
    : publicNavLinks;

  // Role badge config
  const roleBadge = isAdmin
    ? { label: "Admin", color: "#7c3aed", bg: "rgba(124,58,237,0.12)", border: "rgba(124,58,237,0.3)" }
    : isManager
    ? { label: "Manager", color: "#0891b2", bg: "rgba(8,145,178,0.12)", border: "rgba(8,145,178,0.3)" }
    : null;

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          height: "var(--nav-height)",
          borderBottom: "1px solid var(--border)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          background: "var(--glass-bg)",
          display: "flex",
          alignItems: "center",
          padding: "0 1.5rem",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            width: "100%",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(79,70,229,0.4)",
              }}
            >
              <Globe size={18} color="#fff" />
            </div>
            <span
              style={{
                fontWeight: 800,
                fontSize: "1.1rem",
                letterSpacing: "-0.03em",
                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Campaigns Hub
            </span>
          </Link>

          {/* Desktop Nav */}
          {isAuthenticated ? (
            <nav
              style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
              className="desktop-nav"
            >
              {roleNavLinks.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`nav-link${isActive ? " active" : ""}`}
                  >
                    <Icon size={15} />
                    {label}
                  </Link>
                );
              })}
            </nav>
          ) : (
            <nav
              style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
              className="desktop-nav"
            >
              {publicNavLinks.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`nav-link${isActive ? " active" : ""}`}
                  >
                    <Icon size={15} />
                    {label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexShrink: 0 }}>
            {/* Auth area */}
            {!isLoading && (
              <>
                {isAuthenticated && user ? (
                  /* ── Authenticated: Hi greeting + Logout ── */
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {/* Hi, Name greeting */}
                    <Link
                      href="/profile"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        textDecoration: "none",
                        padding: "0.3rem 0.75rem 0.3rem 0.4rem",
                        borderRadius: "var(--radius-md)",
                        background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(124,58,237,0.08))",
                        border: "1px solid rgba(99,102,241,0.18)",
                        transition: "all 0.18s ease",
                      }}
                      title="View Profile"
                      className="desktop-nav"
                    >
                      <AvatarBadge name={user.full_name} email={user.email} />
                      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--foreground)" }}>
                          Hi, {(user.full_name || user.email.split("@")[0]).split(" ")[0]}!
                        </span>
                        {roleBadge && (
                          <span style={{
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            color: roleBadge.color,
                            background: roleBadge.bg,
                            border: `1px solid ${roleBadge.border}`,
                            borderRadius: 4,
                            padding: "0 5px",
                            lineHeight: "1.4",
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                          }}>
                            {roleBadge.label}
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="btn btn-secondary btn-sm"
                      style={{
                        fontSize: "0.82rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        color: "#dc2626",
                        borderColor: "rgba(220, 38, 38, 0.3)",
                      }}
                      title="Log out"
                    >
                      <LogOut size={15} />
                      <span className="desktop-nav">Logout</span>
                    </button>
                  </div>
                ) : null}
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="btn btn-ghost btn-icon mobile-menu-btn"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      {mobileOpen && (
        <div
          style={{
            position: "fixed",
            top: "var(--nav-height)",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 40,
            background: "rgba(10, 15, 30, 0.6)",
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="animate-slide-down"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--surface-elevated)",
              borderBottom: "1px solid var(--border)",
              padding: "1rem 1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
            }}
          >
            {isAuthenticated ? (
              <>
                {roleNavLinks.map(({ href, label, icon: Icon }) => {
                  const isActive = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={`nav-link${isActive ? " active" : ""}`}
                      style={{ padding: "0.75rem 1rem", fontSize: "0.95rem" }}
                    >
                      <Icon size={18} />
                      {label}
                    </Link>
                  );
                })}
              </>
            ) : (
              <>
                {publicNavLinks.map(({ href, label, icon: Icon }) => {
                  const isActive = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={`nav-link${isActive ? " active" : ""}`}
                      style={{ padding: "0.75rem 1rem", fontSize: "0.95rem" }}
                    >
                      <Icon size={18} />
                      {label}
                    </Link>
                  );
                })}
              </>
            )}

            {/* Mobile auth actions */}
            {!isLoading && (
              <div style={{ borderTop: "1px solid var(--border)", marginTop: "0.5rem", paddingTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {isAuthenticated && user ? (
                  <>
                    <div style={{ padding: "0.65rem 1rem", display: "flex", alignItems: "center", gap: "0.6rem", background: "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(124,58,237,0.06))", borderRadius: "var(--radius-md)", margin: "0 0 0.25rem" }}>
                      <AvatarBadge name={user.full_name} email={user.email} />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--foreground)" }}>
                          Hi, {(user.full_name || user.email.split("@")[0]).split(" ")[0]}!
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{user.email}</div>
                      </div>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="nav-link"
                      style={{ padding: "0.75rem 1rem", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
                    >
                      <UserCircle size={18} />
                      My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="nav-link"
                      style={{ padding: "0.75rem 1rem", fontSize: "0.95rem", color: "#dc2626", background: "none", border: "none", cursor: "pointer", textAlign: "left", width: "100%", display: "flex", alignItems: "center", gap: "0.5rem" }}
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </>
                ) : null}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; }
        }
        .dropdown-item:hover {
          background: var(--surface) !important;
        }
      `}</style>
    </>
  );
}
