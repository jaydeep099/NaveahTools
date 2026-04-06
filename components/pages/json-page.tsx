"use client";

import { useState } from "react";
import CodeEditor from "@/components/ui/code-editor";
import Btn from "@/components/ui/btn";
import Toolbar from "@/components/ui/toolbar";
import PageHeader from "@/components/ui/page-header";
import SectionLabel from "@/components/ui/section-label";
import { T } from "@/lib/tokens";
import { beautifyJSON, jsonToXml, validateJSON } from "@/lib/utils";

type Status = "valid" | "invalid" | null;

export default function JsonPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<Status>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", background: T.bg }}>
      <PageHeader title="JSON Tools" subtitle="Validate syntax, format, and convert JSON documents" icon="{}" />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 16, borderRight: `1px solid ${T.border}` }}>
          <SectionLabel>Input</SectionLabel>
          <CodeEditor label="JSON Input" value={input} onChange={setInput} placeholder={'{\n  "key": "value"\n}'} />
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
            const r = validateJSON(input);
            setStatus(r.valid ? "valid" : "invalid");
            setOutput(r.message);
          }}
        >
          Validate JSON
        </Btn>
        <Btn
          onClick={() => {
            const r = beautifyJSON(input);
            setOutput(r.result);
            setStatus(r.ok ? "valid" : "invalid");
          }}
        >
          Beautify
        </Btn>
        <Btn
          onClick={() => {
            const r = jsonToXml(input);
            setOutput(r.result);
            setStatus(r.ok ? "valid" : "invalid");
          }}
        >
          Convert to XML
        </Btn>
        <div style={{ flex: 1 }} />
        <Btn
          variant="ghost"
          onClick={() => {
            setInput("");
            setOutput("");
            setStatus(null);
          }}
        >
          Clear All
        </Btn>
      </Toolbar>
    </div>
  );
}
