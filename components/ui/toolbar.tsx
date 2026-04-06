import { ReactNode } from "react";
import { T } from "@/lib/tokens";

interface ToolbarProps {
  children: ReactNode;
}

export default function Toolbar({ children }: ToolbarProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "11px 20px",
        background: T.surface,
        borderTop: `1px solid ${T.border}`,
        flexWrap: "wrap"
      }}
    >
      {children}
    </div>
  );
}
