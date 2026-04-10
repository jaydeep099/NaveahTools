import { T } from "@/lib/tokens";

export default function Footer() {
  return (
    <footer
      style={{
        height: 34,
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        background: T.surface,
        borderTop: `1px solid ${T.border}`,
        flexShrink: 0,
        justifyContent: "space-between"
      }}
    >
      <span style={{ fontSize: 11, fontFamily: "'Inter', sans-serif", color: T.textMuted }}>NevaehTools - Consultant Utilities</span>
      <span style={{ fontSize: 11, fontFamily: "monospace", color: T.textMuted }}>v1.0.0</span>
    </footer>
  );
}
