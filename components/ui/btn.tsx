import { MouseEventHandler, ReactNode } from "react";
import { T } from "@/lib/tokens";

type ButtonVariant = "default" | "primary" | "ghost";

interface BtnProps {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  variant?: ButtonVariant;
  small?: boolean;
  disabled?: boolean;
}

export default function Btn({ children, onClick, variant = "default", small, disabled }: BtnProps) {
  const V = {
    default: {
      bg: T.surface,
      color: T.textSecond,
      border: `1px solid ${T.border}`,
      hbg: T.blueLight,
      hc: T.blue
    },
    primary: {
      bg: T.blue,
      color: "#fff",
      border: `1px solid ${T.blue}`,
      hbg: T.blueHover,
      hc: "#fff"
    },
    ghost: {
      bg: "transparent",
      color: T.textMuted,
      border: `1px solid ${T.border}`,
      hbg: T.surfaceAlt,
      hc: T.textSecond
    }
  }[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: small ? "4px 10px" : "8px 18px",
        background: V.bg,
        color: V.color,
        border: V.border,
        borderRadius: T.radiusSm,
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: small ? 11 : 12.5,
        fontFamily: "'Inter', sans-serif",
        fontWeight: 500,
        transition: "all 0.15s",
        whiteSpace: "nowrap",
        opacity: disabled ? 0.45 : 1,
        boxShadow: variant === "primary" ? "0 1px 4px rgba(37,99,235,0.28)" : "none"
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = V.hbg;
          e.currentTarget.style.color = V.hc;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = V.bg;
          e.currentTarget.style.color = V.color;
        }
      }}
    >
      {children}
    </button>
  );
}
