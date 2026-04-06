import { ReactNode } from "react";
import { T } from "@/lib/tokens";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon: ReactNode;
}

export default function PageHeader({ title, subtitle, icon }: PageHeaderProps) {
  return (
    <div
      style={{
        padding: "15px 24px 13px",
        background: T.surface,
        borderBottom: `1px solid ${T.border}`,
        display: "flex",
        alignItems: "center",
        gap: 12
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          background: T.blueLight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 15,
          flexShrink: 0,
          color: T.blue,
          fontWeight: 700
        }}
      >
        {icon}
      </div>
      <div>
        <h2
          style={{
            margin: 0,
            fontSize: 15,
            fontWeight: 700,
            color: T.navy,
            fontFamily: "'Inter', sans-serif",
            letterSpacing: "-0.01em"
          }}
        >
          {title}
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: 12,
            color: T.textMuted,
            fontFamily: "'Inter', sans-serif",
            marginTop: 1
          }}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
}
