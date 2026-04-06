import { ChangeEventHandler } from "react";
import { T } from "@/lib/tokens";

type EditorStatus = "valid" | "invalid" | null;

interface CodeEditorProps {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  status?: EditorStatus;
}

export default function CodeEditor({
  label,
  value,
  onChange,
  placeholder,
  readOnly,
  status
}: CodeEditorProps) {
  const statusColor = status === "valid" ? T.green : status === "invalid" ? T.red : null;
  const statusBg = status === "valid" ? T.greenLight : status === "invalid" ? T.redLight : null;

  const handleChange: ChangeEventHandler<HTMLTextAreaElement> | undefined = onChange
    ? (e) => onChange(e.target.value)
    : undefined;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minWidth: 0,
        background: T.surface,
        borderRadius: T.radius,
        boxShadow: T.shadow,
        overflow: "hidden",
        border: `1px solid ${T.border}`
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 14px",
          background: T.surfaceAlt,
          borderBottom: `1px solid ${T.border}`
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: T.textMuted,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontFamily: "monospace"
          }}
        >
          {label}
        </span>
        {statusColor && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: statusColor,
              background: statusBg ?? "transparent",
              padding: "2px 10px",
              borderRadius: 20,
              fontFamily: "monospace"
            }}
          >
            {status === "valid" ? "Valid" : "Error"}
          </span>
        )}
      </div>
      <textarea
        value={value}
        onChange={handleChange}
        readOnly={readOnly}
        placeholder={placeholder}
        spellCheck={false}
        style={{
          flex: 1,
          resize: "none",
          border: "none",
          outline: "none",
          background: readOnly ? T.surfaceAlt : T.surface,
          color: T.textCode,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: 13,
          lineHeight: 1.75,
          padding: "14px 16px",
          caretColor: T.blue
        }}
      />
    </div>
  );
}
