import { ColumnConfig, BeautifyResult, ParsedDelimited, ValidationResult, TYPE_MAP } from "@/lib/types";

export function buildTypeDef(col: Pick<ColumnConfig, "baseType" | "typeSizeVal" | "typeScaleVal">): string {
  const def = TYPE_MAP[col.baseType] ?? { sizeMode: "none" };
  if (def.sizeMode === "none") return col.baseType;
  if (def.sizeMode === "single") return col.typeSizeVal ? `${col.baseType}(${col.typeSizeVal})` : col.baseType;
  if (def.sizeMode === "precision_scale") {
    if (!col.typeSizeVal) return col.baseType;
    return col.typeScaleVal !== "" ? `${col.baseType}(${col.typeSizeVal},${col.typeScaleVal})` : `${col.baseType}(${col.typeSizeVal})`;
  }
  return col.baseType;
}

export function validateJSON(text: string): ValidationResult {
  if (!text.trim()) return { valid: false, message: "Input is empty." };
  try {
    JSON.parse(text);
    return { valid: true, message: "Your JSON is valid." };
  } catch (error) {
    const e = error as Error;
    const match = e.message.match(/position (\d+)/);
    if (match) {
      const pos = parseInt(match[1], 10);
      const lines = text.substring(0, pos).split("\n");
      return {
        valid: false,
        message: `Syntax error at line ${lines.length}, column ${lines[lines.length - 1].length + 1}:\n${e.message}`
      };
    }
    return { valid: false, message: e.message };
  }
}

export function beautifyJSON(text: string): BeautifyResult {
  try {
    return { ok: true, result: JSON.stringify(JSON.parse(text), null, 2) };
  } catch (error) {
    const e = error as Error;
    return { ok: false, result: `Error: ${e.message}` };
  }
}

export function validateXML(text: string): ValidationResult {
  if (!text.trim()) return { valid: false, message: "Input is empty." };
  const doc = new DOMParser().parseFromString(text, "application/xml");
  const err = doc.querySelector("parsererror");
  if (err) {
    const msg = err.textContent ?? "Unknown XML error";
    const line = (msg.match(/line[:\s]+(\d+)/i) ?? [])[1] ?? "?";
    const col = (msg.match(/column[:\s]+(\d+)/i) ?? [])[1] ?? "?";
    return { valid: false, message: `XML error at line ${line}, column ${col}:\n${msg.split("\n")[0].trim()}` };
  }
  return { valid: true, message: "Your XML is valid." };
}

export function beautifyXML(text: string): BeautifyResult {
  const doc = new DOMParser().parseFromString(text, "application/xml");
  if (doc.querySelector("parsererror")) return { ok: false, result: "Error: Invalid XML, cannot beautify." };

  let indent = 0;
  const result = new XMLSerializer()
    .serializeToString(doc)
    .replace(/></g, ">\n<")
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith("</")) {
        indent = Math.max(0, indent - 1);
        return `${"  ".repeat(indent)}${trimmed}`;
      }
      if (trimmed.endsWith("/>")) return `${"  ".repeat(indent)}${trimmed}`;
      if (trimmed.match(/^<[^?!][^>]*[^/]>/) && !trimmed.match(/<.*>.*<.*>/)) {
        const out = `${"  ".repeat(indent)}${trimmed}`;
        indent += 1;
        return out;
      }
      return `${"  ".repeat(indent)}${trimmed}`;
    })
    .filter(Boolean)
    .join("\n");

  return { ok: true, result };
}

export function parseDelimited(text: string, delimiter: string): ParsedDelimited {
  const sep = delimiter === "tab" ? "\t" : delimiter;
  const lines = text.trim().split("\n").filter(Boolean);
  if (!lines.length) return { headers: [], rows: [] };
  const headers = lines[0].split(sep).map((h) => h.trim().replace(/^["']|["']$/g, ""));
  const rows = lines.slice(1).map((l) => l.split(sep).map((v) => v.trim().replace(/^["']|["']$/g, "")));
  return { headers, rows };
}
