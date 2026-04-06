import { T } from "@/lib/tokens";

const navItems = ["JSON", "XML", "CSV to SQL"] as const;
export type ActivePage = (typeof navItems)[number];

interface HeaderProps {
  active: ActivePage;
  setActive: (item: ActivePage) => void;
}

export default function Header({ active, setActive }: HeaderProps) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        background: T.navy,
        height: 54,
        flexShrink: 0,
        boxShadow: "0 2px 8px rgba(15,37,84,0.22)"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 36 }}>
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
      <nav style={{ display: "flex", alignItems: "stretch", height: "100%", gap: 2 }}>
        {navItems.map((item) => {
          const isActive = active === item;
          return (
            <button
              key={item}
              onClick={() => setActive(item)}
              style={{
                background: isActive ? "rgba(255,255,255,0.12)" : "none",
                border: "none",
                cursor: "pointer",
                padding: "0 16px",
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#fff" : "rgba(255,255,255,0.52)",
                borderRadius: 6,
                borderBottom: isActive ? "2px solid #93C5FD" : "2px solid transparent",
                transition: "all 0.15s"
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = "rgba(255,255,255,0.85)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = "rgba(255,255,255,0.52)";
                  e.currentTarget.style.background = "none";
                }
              }}
            >
              {item}
            </button>
          );
        })}
      </nav>
      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 11,
          fontFamily: "'Inter', sans-serif",
          color: "rgba(255,255,255,0.3)"
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
