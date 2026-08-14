"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  BarChart3,
  Globe,
  History,
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Shield,
  UserCircle,
  UserPlus,
  X,
  Zap,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/campaigns", label: "Campaigns", icon: MessageSquare },
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
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
        width: 34,
        height: 34,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 800,
        fontSize: "0.8rem",
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
          <nav
            style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
            className="desktop-nav"
          >
            {navLinks.map(({ href, label, icon: Icon }) => {
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
            {isAdmin && (
              <Link
                href="/admin"
                className={`nav-link${pathname === "/admin" ? " active" : ""}`}
                style={{ color: "#d97706" }}
              >
                <Shield size={15} />
                Admin
              </Link>
            )}
          </nav>

          {/* Right Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexShrink: 0 }}>
            {/* Campaign CTA */}
            <Link
              href="/dashboard"
              className="btn btn-primary"
              style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
            >
              <Zap size={15} />
              New Campaign
            </Link>

            {/* Auth area */}
            {!isLoading && (
              <>
                {isAuthenticated && user ? (
                  /* ── Authenticated: avatar dropdown ── */
                  <div style={{ position: "relative" }} ref={userMenuRef}>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center" }}
                      aria-label="User menu"
                      aria-expanded={userMenuOpen}
                    >
                      <AvatarBadge name={user.full_name} email={user.email} />
                    </button>

                    {/* Dropdown */}
                    {userMenuOpen && (
                      <div
                        className="animate-scale-in"
                        style={{
                          position: "absolute",
                          right: 0,
                          top: "calc(100% + 0.5rem)",
                          minWidth: 220,
                          background: "var(--surface-elevated)",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius-lg)",
                          boxShadow: "0 16px 40px rgba(0,0,0,0.15)",
                          overflow: "hidden",
                          zIndex: 100,
                        }}
                      >
                        {/* User info header */}
                        <div
                          style={{
                            padding: "1rem 1rem 0.75rem",
                            borderBottom: "1px solid var(--border)",
                          }}
                        >
                          <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.15rem" }}>
                            {user.full_name || "User"}
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {user.email}
                          </div>
                          {isAdmin && (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.25rem",
                                marginTop: "0.4rem",
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                color: "#d97706",
                                background: "rgba(217,119,6,0.1)",
                                padding: "0.15rem 0.5rem",
                                borderRadius: 999,
                              }}
                            >
                              <Shield size={10} />
                              Admin
                            </span>
                          )}
                        </div>

                        {/* Menu items */}
                        <div style={{ padding: "0.4rem 0" }}>
                          <Link
                            href="/profile"
                            onClick={() => setUserMenuOpen(false)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.6rem",
                              padding: "0.6rem 1rem",
                              fontSize: "0.85rem",
                              color: "var(--foreground)",
                              textDecoration: "none",
                              transition: "background 0.15s",
                            }}
                            className="dropdown-item"
                          >
                            <UserCircle size={15} />
                            My Profile
                          </Link>
                          <Link
                            href="/settings"
                            onClick={() => setUserMenuOpen(false)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.6rem",
                              padding: "0.6rem 1rem",
                              fontSize: "0.85rem",
                              color: "var(--foreground)",
                              textDecoration: "none",
                            }}
                            className="dropdown-item"
                          >
                            <Settings size={15} />
                            Settings
                          </Link>
                          {isAdmin && (
                            <Link
                              href="/admin"
                              onClick={() => setUserMenuOpen(false)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.6rem",
                                padding: "0.6rem 1rem",
                                fontSize: "0.85rem",
                                color: "#d97706",
                                textDecoration: "none",
                              }}
                              className="dropdown-item"
                            >
                              <Shield size={15} />
                              Admin Panel
                            </Link>
                          )}
                        </div>

                        <div style={{ borderTop: "1px solid var(--border)", padding: "0.4rem 0" }}>
                          <button
                            onClick={handleLogout}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.6rem",
                              padding: "0.6rem 1rem",
                              fontSize: "0.85rem",
                              color: "#dc2626",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              width: "100%",
                              textAlign: "left",
                            }}
                            className="dropdown-item"
                          >
                            <LogOut size={15} />
                            Sign out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* ── Unauthenticated: Login + Register buttons ── */
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }} className="desktop-nav">
                    <Link
                      href="/login"
                      className="btn btn-ghost"
                      style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem" }}
                    >
                      <LogIn size={15} />
                      Sign in
                    </Link>
                    <Link
                      href="/register"
                      className="btn btn-secondary"
                      style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem" }}
                    >
                      <UserPlus size={15} />
                      Register
                    </Link>
                  </div>
                )}
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
            {navLinks.map(({ href, label, icon: Icon }) => {
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
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className={`nav-link${pathname === "/admin" ? " active" : ""}`}
                style={{ padding: "0.75rem 1rem", fontSize: "0.95rem", color: "#d97706" }}
              >
                <Shield size={18} />
                Admin Panel
              </Link>
            )}

            {/* Mobile auth actions */}
            {!isLoading && (
              <div style={{ borderTop: "1px solid var(--border)", marginTop: "0.5rem", paddingTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="nav-link"
                      style={{ padding: "0.75rem 1rem", fontSize: "0.95rem" }}
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
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="btn btn-secondary"
                      style={{ justifyContent: "center" }}
                    >
                      <LogIn size={17} />
                      Sign in
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileOpen(false)}
                      className="btn btn-primary"
                      style={{ justifyContent: "center" }}
                    >
                      <UserPlus size={17} />
                      Create account
                    </Link>
                  </>
                )}
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
