"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import CodeEditor from "@/components/ui/code-editor";
import Btn from "@/components/ui/btn";
import Toolbar from "@/components/ui/toolbar";
import PageHeader from "@/components/ui/page-header";
import SectionLabel from "@/components/ui/section-label";
import { T } from "@/lib/tokens";
import { beautifyXML, validateXML, xmlToCsvBestEffort, xmlToJson } from "@/lib/utils";

type Status = "valid" | "invalid" | null;
type ConvertTarget = "json" | "csv";

export default function XmlPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<Status>(null);
  const [target, setTarget] = useState<ConvertTarget>("json");

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", background: T.bg }}>
      <PageHeader title="XML Tools" subtitle="Validate, format, and convert XML documents" icon="<>" />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 16, borderRight: `1px solid ${T.border}` }}>
          <SectionLabel>Input</SectionLabel>
          <CodeEditor label="XML Input" value={input} onChange={setInput} placeholder={"<root>\n  <element>value</element>\n</root>"} />
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 16 }}>
          <SectionLabel>Output</SectionLabel>
          <CodeEditor label="Result" value={output} readOnly placeholder="Output will appear here..." status={status} />
        </div>
      </div>
      <Toolbar>
        <Btn
          variant="primary"
          onClick={() => {
            const r = validateXML(input);
            setStatus(r.valid ? "valid" : "invalid");
            setOutput(r.message);
            if (r.valid) {
              toast.success("XML is valid!");
            } else {
              toast.error("XML is invalid.");
            }
          }}
        >
          Validate XML
        </Btn>
        <Btn
          onClick={() => {
            const r = beautifyXML(input);
            setOutput(r.result);
            setStatus(r.ok ? "valid" : "invalid");
            if (r.ok) {
              toast.success("XML beautified successfully!");
            } else {
              toast.error("Failed to beautify XML.");
            }
          }}
        >
          Beautify
        </Btn>
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value as ConvertTarget)}
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            color: T.textPrimary,
            padding: "8px 10px",
            borderRadius: T.radiusSm,
            fontFamily: "'Inter', sans-serif",
            fontSize: 12
          }}
        >
          <option value="json">Convert to JSON</option>
          <option value="csv">Convert to CSV</option>
        </select>
        <Btn
          onClick={() => {
            const r = target === "json" ? xmlToJson(input) : xmlToCsvBestEffort(input);
            setOutput(r.result);
            setStatus(r.ok ? "valid" : "invalid");
            if (r.ok) {
              toast.success(`Converted to ${target.toUpperCase()} successfully!`);
            } else {
              toast.error(`Failed to convert to ${target.toUpperCase()}.`);
            }
          }}
        >
          Convert
        </Btn>
        <div style={{ flex: 1 }} />
        <Btn
          variant="ghost"
          onClick={() => {
            setInput("");
            setOutput("");
            setStatus(null);
            toast("Cleared all fields.");
          }}
        >
          Clear All
        </Btn>
      </Toolbar>
    </div>
  );
}
