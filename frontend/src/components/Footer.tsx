"use client";

import Link from "next/link";
import { Globe, MessageSquare, Heart } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Campaigns", href: "/campaigns" },
    { label: "History", href: "/history" },
    { label: "Settings", href: "/settings" },
  ],
  Technology: [
    { label: "IndicTrans2", href: "https://github.com/AI4Bharat/IndicTrans2", external: true },
    { label: "Supported Languages", href: "#" },
    { label: "API Reference", href: "#" },
    { label: "Open Source", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Contact", href: "#" },
  ],
};

const languages = ["Hindi", "Tamil", "Telugu", "Bengali", "Marathi", "Gujarati", "Kannada", "Malayalam", "Punjabi"];

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        background: "var(--surface)",
        marginTop: "auto",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "3rem 1.5rem 1.5rem",
        }}
      >
        {/* Top Section */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto auto auto",
            gap: "3rem",
            marginBottom: "3rem",
          }}
          className="footer-grid"
        >
          {/* Brand */}
          <div>
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                textDecoration: "none",
                marginBottom: "1rem",
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
                  boxShadow: "0 4px 12px rgba(79,70,229,0.3)",
                }}
              >
                <Globe size={18} color="#fff" />
              </div>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: "1rem",
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
            <p style={{ fontSize: "0.875rem", color: "#64748b", lineHeight: 1.7, maxWidth: 280 }}>
              AI-powered multilingual campaign generator with IndicTrans2. Reach millions across India in their native language.
            </p>

            {/* Language Tags */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "1rem" }}>
              {languages.map((lang) => (
                <span
                  key={lang}
                  className="badge badge-purple"
                  style={{ fontSize: "0.7rem" }}
                >
                  {lang}
                </span>
              ))}
            </div>

            {/* Social Links */}
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
              {[
                { icon: MessageSquare, href: "https://github.com/AI4Bharat/IndicTrans2", label: "GitHub" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="btn btn-ghost btn-icon micro-hover"
                  style={{
                    border: "1px solid var(--border-strong)",
                    width: 36,
                    height: 36,
                  }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4
                style={{
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "#94a3b8",
                  marginBottom: "1rem",
                }}
              >
                {category}
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={"external" in link && link.external ? "_blank" : undefined}
                      rel={"external" in link && link.external ? "noopener noreferrer" : undefined}
                      style={{
                        fontSize: "0.875rem",
                        color: "#64748b",
                        textDecoration: "none",
                        transition: "color 0.18s ease",
                        display: "inline-block",
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.color = "var(--primary)")}
                      onMouseOut={(e) => (e.currentTarget.style.color = "#64748b")}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="divider" />

        {/* Bottom Row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            paddingTop: "0.5rem",
          }}
        >
          <p style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
            © {new Date().getFullYear()} Campaigns Hub. Powered by IndicTrans2 & AI4Bharat.
          </p>
          <p style={{ fontSize: "0.8rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: "0.35rem" }}>
            Built with <Heart size={12} color="#ef4444" fill="#ef4444" /> for India
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 500px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
