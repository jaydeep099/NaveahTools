import { ChangeEvent } from "react";
import { ORACLE_BASE_TYPES, TYPE_MAP, ColumnConfig } from "@/lib/types";
import { buildTypeDef } from "@/lib/utils";
import { T } from "@/lib/tokens";

interface TypeCellProps {
  col: ColumnConfig;
  disabled?: boolean;
  onChange: (patch: Partial<ColumnConfig>) => void;
}

export default function TypeCell({ col, disabled, onChange }: TypeCellProps) {
  const def = TYPE_MAP[col.baseType] ?? { sizeMode: "none" };
  const inputStyle = {
    background: T.surface,
    border: `1px solid ${T.border}`,
    color: T.blue,
    padding: "4px 7px",
    borderRadius: T.radiusSm,
    fontFamily: "monospace",
    fontSize: 11,
    outline: "none"
  };

  const onBaseTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newBase = e.target.value;
    const nextDef = TYPE_MAP[newBase] ?? { sizeMode: "none" };
    onChange({
      baseType: newBase,
      typeSizeVal: nextDef.defaultSize ?? "",
      typeScaleVal: nextDef.defaultScale ?? ""
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 0 }}>
      <select
        value={col.baseType}
        disabled={disabled}
        onChange={onBaseTypeChange}
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          color: T.textPrimary,
          padding: "5px 7px",
          borderRadius: T.radiusSm,
          fontFamily: "monospace",
          fontSize: 11,
          outline: "none",
          cursor: "pointer",
          width: "100%"
        }}
      >
        {ORACLE_BASE_TYPES.map((t) => (
          <option key={t.base} value={t.base}>
            {t.base}
          </option>
        ))}
      </select>

      {def.sizeMode === "single" && (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10, color: T.textMuted, fontFamily: "monospace", minWidth: 46 }}>{def.sizeLabel}</span>
          <input
            type="number"
            min={1}
            value={col.typeSizeVal}
            disabled={disabled}
            placeholder={def.placeholder}
            onChange={(e) => onChange({ typeSizeVal: e.target.value })}
            style={{ ...inputStyle, width: 72 }}
          />
        </div>
      )}

      {def.sizeMode === "precision_scale" && (
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 10, color: T.textMuted, fontFamily: "monospace" }}>Prec</span>
          <input
            type="number"
            min={1}
            max={38}
            value={col.typeSizeVal}
            disabled={disabled}
            placeholder="1-38"
            onChange={(e) => onChange({ typeSizeVal: e.target.value })}
            style={{ ...inputStyle, width: 50 }}
          />
          <span style={{ fontSize: 10, color: T.textMuted, fontFamily: "monospace" }}>Scale</span>
          <input
            type="number"
            min={0}
            max={127}
            value={col.typeScaleVal}
            disabled={disabled || !col.typeSizeVal}
            placeholder="0-127"
            onChange={(e) => onChange({ typeScaleVal: e.target.value })}
            style={{ ...inputStyle, width: 50, opacity: col.typeSizeVal ? 1 : 0.35 }}
          />
        </div>
      )}

      {def.sizeMode !== "none" && (
        <span
          style={{
            fontSize: 10,
            color: T.blue,
            fontFamily: "monospace",
            fontWeight: 600,
            background: T.blueLight,
            padding: "1px 7px",
            borderRadius: 3,
            display: "inline-block",
            width: "fit-content"
          }}
        >
          {buildTypeDef(col)}
        </span>
      )}
    </div>
  );
}
