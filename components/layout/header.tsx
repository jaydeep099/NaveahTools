"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { T } from "@/lib/tokens";

const navItems = [
  { label: "JSON Tools", href: "/json" },
  { label: "XML Tools", href: "/xml" },
  { label: "CSV to SQL", href: "/csv" }
] as const;

export default function Header() {
  const pathname = usePathname();
  const normalizedPath = pathname.toLowerCase();
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        background: T.navy,
        height: 60,
        flexShrink: 0,
        boxShadow: "0 2px 8px rgba(15,37,84,0.22)"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 20 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.25)",
            background: "rgba(255,255,255,0.08)",
            flexShrink: 0
          }}
        />
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>
          naveah<span style={{ color: "#93C5FD" }}>tools</span>
        </span>
      </div>
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginLeft: 8,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.14)",
          borderRadius: 999,
          padding: "5px"
        }}
      >
        {navItems.map((item) => {
          const isActive = normalizedPath === item.href.toLowerCase();
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 96,
                background: isActive ? "#fff" : "transparent",
                border: "none",
                cursor: "pointer",
                padding: "8px 14px",
                fontFamily: "'Inter', sans-serif",
                fontSize: 12.5,
                fontWeight: isActive ? 700 : 500,
                lineHeight: 1,
                color: isActive ? T.navy : "rgba(255,255,255,0.78)",
                borderRadius: 999,
                textDecoration: "none",
                boxShadow: isActive ? "0 2px 8px rgba(15,37,84,0.25)" : "none",
                transition: "all 0.15s ease"
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = "#ffffff";
                  e.currentTarget.style.background = "rgba(255,255,255,0.18)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = "rgba(255,255,255,0.78)";
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 11,
          fontFamily: "'Inter', sans-serif",
          color: "rgba(255,255,255,0.45)"
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#34D399",
            display: "inline-block",
            boxShadow: "0 0 5px #34D399"
          }}
        />
        Ready
      </div>
    </header>
  );
}
