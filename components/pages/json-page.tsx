"use client";

import { useState } from "react";
import toast from "react-hot-toast";
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
            if (r.valid) {
              toast.success("JSON is valid!");
            } else {
              toast.error("JSON is invalid.");
            }
          }}
        >
          Validate JSON
        </Btn>
        <Btn
          onClick={() => {
            const r = beautifyJSON(input);
            setOutput(r.result);
            setStatus(r.ok ? "valid" : "invalid");
            if (r.ok) {
              toast.success("JSON beautified successfully!");
            } else {
              toast.error("Failed to beautify JSON.");
            }
          }}
        >
          Beautify
        </Btn>
        <Btn
          onClick={() => {
            const r = jsonToXml(input);
            setOutput(r.result);
            setStatus(r.ok ? "valid" : "invalid");
            if (r.ok) {
              toast.success("Converted to XML successfully!");
            } else {
              toast.error("Failed to convert to XML.");
            }
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
            toast("Cleared all fields.");
          }}
        >
          Clear All
        </Btn>
      </Toolbar>
    </div>
  );
}
