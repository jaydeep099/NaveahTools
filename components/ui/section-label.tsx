import { ReactNode } from "react";
import { T } from "@/lib/tokens";

interface SectionLabelProps {
  children: ReactNode;
}

export default function SectionLabel({ children }: SectionLabelProps) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: T.textMuted,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        fontFamily: "monospace",
        marginBottom: 7,
        paddingLeft: 1
      }}
    >
      {children}
    </div>
  );
}
