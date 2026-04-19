"use client";

import { CSSProperties, useMemo, useState, useEffect } from "react";
import toast from "react-hot-toast";
import CodeEditor from "@/components/ui/code-editor";
import Btn from "@/components/ui/btn";
import Toolbar from "@/components/ui/toolbar";
import PageHeader from "@/components/ui/page-header";
import SectionLabel from "@/components/ui/section-label";
import TypeCell from "@/components/ui/type-cell";
import { T } from "@/lib/tokens";
import { ColumnConfig } from "@/lib/types";
import { buildTypeDef, parseDelimited } from "@/lib/utils";

export default function CsvPage() {
  const [csvInput, setCsvInput] = useState("");
  const [tableName, setTableName] = useState("");
  const [delimiter, setDelimiter] = useState(",");
  const [columns, setColumns] = useState<ColumnConfig[]>([]);
  const [output, setOutput] = useState("");
  const [parsed, setParsed] = useState(false);
  const [lastAction, setLastAction] = useState<"create" | "insert" | null>(null);
  const [primaryKeyColumnIndex, setPrimaryKeyColumnIndex] = useState<number | null>(null);
  const [sequenceName, setSequenceName] = useState("");
  const [sequenceDefaultColumnIndex, setSequenceDefaultColumnIndex] = useState<number | null>(null);

  const includedCols = useMemo(() => columns.filter((c) => c.include), [columns]);

  const handleParse = () => {
    const { headers } = parseDelimited(csvInput, delimiter);
    if (!headers.length) {
      toast.error("No headers found in the input data.");
      return;
    }
    setColumns(
      headers.map((h) => ({
        name: h.replace(/[^a-zA-Z0-9_]/g, "_").toUpperCase(),
        originalName: h,
        baseType: "VARCHAR2",
        typeSizeVal: "255",
        typeScaleVal: "",
        include: true,
        nullable: true,
        isPrimaryKey: false,
        useSequenceDefault: false
      }))
    );
    setParsed(true);
    setLastAction(null);
    setOutput("");
    setPrimaryKeyColumnIndex(null);
    setSequenceName("");
    setSequenceDefaultColumnIndex(null);
    toast.success("Headers parsed successfully!");
  };

  const updateColumn = (i: number, patch: Partial<ColumnConfig>) => {
    setColumns((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  };

  const toggleInclude = (i: number) => {
    setColumns((prev) => prev.map((c, idx) => (idx === i ? { ...c, include: !c.include } : c)));
  };

  const addColumn = () => {
    setColumns((prev) => [
      ...prev,
      {
        name: "NEW_COLUMN",
        originalName: "",
        baseType: "VARCHAR2",
        typeSizeVal: "255",
        typeScaleVal: "",
        include: true,
        nullable: true,
        isPrimaryKey: false,
        useSequenceDefault: false
      }
    ]);
  };

  const generateCreateOutput = () => {
    if (!parsed || !tableName.trim()) {
      return null;
    }
    const tName = tableName.trim().toUpperCase();
    const pkCol = primaryKeyColumnIndex !== null ? columns[primaryKeyColumnIndex] : null;
    
    const anySequenceDefault = includedCols.some((c) => c.useSequenceDefault);
    const lines = includedCols.map((c) => {
      let line = `  ${c.name.padEnd(32)} ${buildTypeDef(c).padEnd(28)}${c.nullable && !c.isPrimaryKey ? "" : "NOT NULL"}`;
      if (c.isPrimaryKey) {
        line += " PRIMARY KEY";
      }
      if (sequenceName.trim() && c.useSequenceDefault) {
        line += ` DEFAULT ${sequenceName.trim().toUpperCase()}.NEXTVAL`;
      }
      return line;
    });
    
    let result = `CREATE TABLE ${tName}\n(\n${lines.join(",\n")}\n);`;
    
    if (sequenceName.trim() && anySequenceDefault) {
      const seqName = sequenceName.trim().toUpperCase();
      result = `CREATE SEQUENCE ${seqName} START WITH 1 INCREMENT BY 1;\n\n${result}`;
    }
    
    return result;
  };

  const generateInsertsOutput = () => {
    if (!parsed || !tableName.trim()) {
      return null;
    }
    const { rows } = parseDelimited(csvInput, delimiter);
    if (!rows.length) {
      return "-- No data rows found.";
    }
    const tName = tableName.trim().toUpperCase();
    const defaultCol = columns.find((c) => c.useSequenceDefault);
    const colsForInsert = defaultCol ? includedCols.filter((c) => c.name !== defaultCol.name) : includedCols;
    const colNames = colsForInsert.map((c) => c.name).join(", ");
    const colIndices = colsForInsert.map((c) => columns.indexOf(c));
    
    const numTypes = new Set(["NUMBER", "INTEGER", "FLOAT", "BINARY_FLOAT", "BINARY_DOUBLE"]);
    const dateTypes = new Set(["DATE"]);
    const timestampTypes = new Set(["TIMESTAMP", "TIMESTAMP WITH TIME ZONE", "TIMESTAMP WITH LOCAL TIME ZONE"]);
    
    const formatValue = (val: string, col: ColumnConfig): string => {
      if (val === "" || val === null) return "NULL";
      
      const baseType = col.baseType;
      
      if (numTypes.has(baseType)) {
        return val;
      } else if (dateTypes.has(baseType)) {
        return `TO_DATE('${val}','YYYY-MM-DD')`;
      } else if (timestampTypes.has(baseType)) {
        return `TO_TIMESTAMP('${val}','YYYY-MM-DD HH24:MI:SS')`;
      } else {
        // VARCHAR2, CHAR, and other string types
        return `'${val.replace(/'/g, "''")}'`;
      }
    };
    
    const inserts = rows.map((row) => {
      const vals = colIndices.map((idx) => {
        const val = row[idx] || "";
        const col = columns[idx];
        return formatValue(val, col);
      });
      return `INSERT INTO ${tName} (${colNames}) VALUES (${vals.join(", ")});`;
    });
    return inserts.join("\n");
  };

  useEffect(() => {
    if (lastAction === "create") {
      const result = generateCreateOutput();
      if (result) {
        setOutput(result);
      }
    } else if (lastAction === "insert") {
      const result = generateInsertsOutput();
      if (result) {
        setOutput(result);
      }
    }
  }, [columns, tableName, includedCols, lastAction, parsed, csvInput, delimiter, primaryKeyColumnIndex, sequenceName]);

  const generateCreate = () => {
    if (!parsed) {
      toast.error("Please parse the headers first by clicking 'Parse Headers'.");
      return;
    }
    if (!tableName.trim()) {
      toast.error("Table name is required.");
      return;
    }
    setLastAction("create");
    toast.success("CREATE TABLE statement generated!");
  };

  const generateInserts = () => {
    if (!parsed) {
      toast.error("Please parse the headers first by clicking 'Parse Headers'.");
      return;
    }
    if (!tableName.trim()) {
      toast.error("Table name is required.");
      return;
    }
    const { rows } = parseDelimited(csvInput, delimiter);
    if (!rows.length) {
      toast.error("No data rows found.");
      return;
    }
    setLastAction("insert");
    toast.success("INSERT statements generated!");
  };

  const fieldStyle: CSSProperties = {
    background: T.surface,
    border: `1px solid ${T.border}`,
    color: T.textPrimary,
    padding: "7px 12px",
    borderRadius: T.radiusSm,
    fontFamily: "'Inter', sans-serif",
    fontSize: 13,
    outline: "none"
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", background: T.bg }}>
      <PageHeader title="CSV to SQL" subtitle="Generate Oracle DDL and DML from delimited files" icon="DB" />

      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 20px", background: T.surface, borderBottom: `1px solid ${T.border}`, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: T.textSecond, fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap" }}>Table Name</label>
          <input
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            placeholder="EMP_DATA"
            style={{ ...fieldStyle, width: 180, color: T.blue, fontWeight: 600, letterSpacing: "0.03em" }}
            onFocus={(e) => {
              e.target.style.borderColor = T.borderFocus;
              e.target.style.boxShadow = `0 0 0 3px ${T.blueLight}`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = T.border;
              e.target.style.boxShadow = "none";
            }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: T.textSecond, fontFamily: "'Inter', sans-serif" }}>Delimiter</label>
          <select value={delimiter} onChange={(e) => setDelimiter(e.target.value)} style={{ ...fieldStyle, cursor: "pointer" }}>
            <option value=",">Comma ( , )</option>
            <option value="|">Pipe ( | )</option>
            <option value=";">Semicolon ( ; )</option>
            <option value="tab">Tab</option>
          </select>
        </div>
        <Btn variant="primary" onClick={handleParse}>
          Parse Headers
        </Btn>
      </div>

      {parsed && (
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 20px", background: T.surface, borderBottom: `1px solid ${T.border}`, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              id="pkCheckbox"
              checked={primaryKeyColumnIndex !== null}
              onChange={(e) => {
                if (e.target.checked) {
                  setPrimaryKeyColumnIndex(0);
                } else {
                  setPrimaryKeyColumnIndex(null);
                }
              }}
              style={{ accentColor: T.blue, cursor: "pointer", width: 14, height: 14 }}
            />
            <label htmlFor="pkCheckbox" style={{ fontSize: 12, fontWeight: 500, color: T.textSecond, fontFamily: "'Inter', sans-serif", cursor: "pointer", whiteSpace: "nowrap" }}>
              Primary Key
            </label>
            {primaryKeyColumnIndex !== null && (
              <select
                value={primaryKeyColumnIndex}
                onChange={(e) => setPrimaryKeyColumnIndex(parseInt(e.target.value))}
                style={{ ...fieldStyle, cursor: "pointer" }}
              >
                {columns.map((col, idx) => (
                  <option key={idx} value={idx}>
                    {col.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: T.textSecond, fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap" }}>
              Sequence Name
            </label>
            <input
              value={sequenceName}
              onChange={(e) => {
                const value = e.target.value;
                setSequenceName(value);
                if (!value.trim()) {
                  setSequenceDefaultColumnIndex(null);
                  columns.forEach((_, idx) => updateColumn(idx, { useSequenceDefault: false }));
                }
              }}
              placeholder="SEQ_ID"
              style={{ ...fieldStyle, width: 140, color: T.blue, fontWeight: 600, letterSpacing: "0.03em" }}
              onFocus={(e) => {
                e.target.style.borderColor = T.borderFocus;
                e.target.style.boxShadow = `0 0 0 3px ${T.blueLight}`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = T.border;
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              id="seqDefaultCheckbox"
              checked={sequenceDefaultColumnIndex !== null}
              disabled={!sequenceName.trim()}
              onChange={(e) => {
                if (e.target.checked) {
                  const defaultIndex = sequenceDefaultColumnIndex !== null ? sequenceDefaultColumnIndex : 0;
                  setSequenceDefaultColumnIndex(defaultIndex);
                  columns.forEach((_, idx) => {
                    updateColumn(idx, { useSequenceDefault: idx === defaultIndex });
                  });
                } else {
                  setSequenceDefaultColumnIndex(null);
                  columns.forEach((_, idx) => {
                    updateColumn(idx, { useSequenceDefault: false });
                  });
                }
              }}
              style={{ accentColor: T.blue, cursor: sequenceName.trim() ? "pointer" : "not-allowed", width: 14, height: 14 }}
            />
            <label htmlFor="seqDefaultCheckbox" style={{ fontSize: 12, fontWeight: 500, color: T.textSecond, fontFamily: "'Inter', sans-serif", cursor: "pointer", whiteSpace: "nowrap" }}>
              Use Sequence as Default
            </label>
            {sequenceDefaultColumnIndex !== null && (
              <select
                value={sequenceDefaultColumnIndex}
                onChange={(e) => {
                  const newIdx = parseInt(e.target.value);
                  setSequenceDefaultColumnIndex(newIdx);
                  columns.forEach((_, idx) => {
                    updateColumn(idx, { useSequenceDefault: idx === newIdx });
                  });
                }}
                style={{ ...fieldStyle, cursor: "pointer" }}
              >
                {columns.map((col, idx) => (
                  <option key={idx} value={idx}>
                    {col.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      )}

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{ flex: "0 0 38%", display: "flex", flexDirection: "column", borderRight: `1px solid ${T.border}`, padding: 16 }}>
          <SectionLabel>Delimited Input</SectionLabel>
          <CodeEditor
            label="CSV / Delimited Data"
            value={csvInput}
            onChange={setCsvInput}
            placeholder={"ID,NAME,SALARY,HIRE_DATE\n1,Alice,75000,2020-01-15\n2,Bob,82000,2019-06-01"}
          />
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${T.border}`, background: T.surface, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "monospace" }}>
                Column Configuration
              </span>
              {parsed && <span style={{ fontSize: 11, fontWeight: 600, color: T.blue, background: T.blueLight, padding: "1px 9px", borderRadius: 20 }}>{includedCols.length} active</span>}
            </div>
            {parsed && (
              <Btn small onClick={addColumn}>
                + Add Column
              </Btn>
            )}
          </div>

          {!parsed ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, background: T.surfaceAlt }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: T.blueLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: T.blue }}>⊞</div>
              <span style={{ fontSize: 13, color: T.textMuted, fontFamily: "'Inter', sans-serif" }}>Paste data above and click Parse Headers</span>
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: "auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 220px 78px 32px", gap: 8, padding: "7px 14px", background: T.surfaceAlt, borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, zIndex: 2, fontSize: 10, fontWeight: 600, color: T.textMuted, fontFamily: "monospace", letterSpacing: "0.07em", textTransform: "uppercase" }}>
                <span>#</span>
                <span>Column Name</span>
                <span>Data Type / Size</span>
                <span>Nullable</span>
                <span />
              </div>
              {columns.map((col, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "28px 1fr 220px 78px 32px", gap: 8, padding: "9px 14px", alignItems: "start", opacity: col.include ? 1 : 0.28, borderBottom: `1px solid ${T.border}`, background: i % 2 === 0 ? T.surface : T.surfaceAlt, transition: "opacity 0.2s" }}>
                  <span style={{ fontSize: 11, color: T.textMuted, fontFamily: "monospace", textAlign: "center", paddingTop: 7 }}>{i + 1}</span>
                  <input
                    value={col.name}
                    disabled={!col.include}
                    onChange={(e) => updateColumn(i, { name: e.target.value.toUpperCase() })}
                    style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.textPrimary, padding: "5px 9px", borderRadius: T.radiusSm, fontFamily: "monospace", fontSize: 12, outline: "none", width: "100%", transition: "border-color 0.15s" }}
                    onFocus={(e) => {
                      e.target.style.borderColor = T.borderFocus;
                      e.target.style.boxShadow = `0 0 0 2px ${T.blueLight}`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = T.border;
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <TypeCell col={col} disabled={!col.include} onChange={(patch) => updateColumn(i, patch)} />
                  <div style={{ display: "flex", alignItems: "center", gap: 6, paddingTop: 7 }}>
                    <input type="checkbox" checked={col.nullable} disabled={!col.include} onChange={(e) => updateColumn(i, { nullable: e.target.checked })} style={{ accentColor: T.blue, cursor: "pointer", width: 14, height: 14 }} />
                    <span style={{ fontSize: 10, color: T.textMuted, fontFamily: "monospace" }}>NULL</span>
                  </div>
                  <button
                    onClick={() => toggleInclude(i)}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 17, fontWeight: 700, lineHeight: 1, padding: "2px 0", color: col.include ? T.textMuted : T.green, transition: "color 0.15s" }}
                    title={col.include ? "Exclude" : "Re-include"}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = col.include ? T.red : T.green;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = col.include ? T.textMuted : T.green;
                    }}
                  >
                    {col.include ? "×" : "↩"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ height: 200, display: "flex", flexDirection: "column", borderTop: `2px solid ${T.border}`, padding: "12px 16px 0", background: T.bg, gap: 6, flexShrink: 0 }}>
        <SectionLabel>SQL Output</SectionLabel>
        <CodeEditor label="Generated SQL" value={output} readOnly placeholder="-- Generated SQL will appear here..." />
      </div>

      <Toolbar>
        <Btn variant="primary" onClick={generateCreate}>
          Generate CREATE TABLE
        </Btn>
        <Btn onClick={generateInserts}>Generate INSERT Statements</Btn>
        <div style={{ flex: 1 }} />
        <Btn variant="ghost" onClick={() => { setOutput(""); toast("Output cleared."); }}>
          Clear Output
        </Btn>
        <Btn
          variant="ghost"
          onClick={() => {
            setCsvInput("");
            setColumns([]);
            setOutput("");
            setParsed(false);
            setTableName("");
            setPrimaryKeyColumnIndex(null);
            setSequenceName("");
            toast("All fields cleared.");
          }}
        >
          Reset All
        </Btn>
      </Toolbar>
    </div>
  );
}
