import { ColumnConfig, BeautifyResult, JsonObject, JsonValue, ParsedDelimited, ValidationResult, TYPE_MAP } from "@/lib/types";

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

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function valueToXml(value: JsonValue, nodeName: string): string {
  if (value === null) return `<${nodeName}></${nodeName}>`;
  if (Array.isArray(value)) return value.map((item) => valueToXml(item, nodeName)).join("");
  if (typeof value === "object") {
    const obj = value as JsonObject;
    const children = Object.entries(obj)
      .map(([key, child]) => valueToXml(child, key))
      .join("");
    return `<${nodeName}>${children}</${nodeName}>`;
  }
  return `<${nodeName}>${escapeXml(String(value))}</${nodeName}>`;
}

export function jsonToXml(text: string): BeautifyResult {
  if (!text.trim()) return { ok: false, result: "Error: Input is empty." };
  try {
    const parsed = JSON.parse(text) as JsonValue;
    const xmlBody =
      parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)
        ? Object.entries(parsed as JsonObject)
            .map(([key, value]) => valueToXml(value, key))
            .join("")
        : valueToXml(parsed, "item");
    return { ok: true, result: beautifyXML(`<root>${xmlBody}</root>`).result };
  } catch (error) {
    const e = error as Error;
    return { ok: false, result: `Error: ${e.message}` };
  }
}

function xmlElementToObject(element: Element): JsonValue {
  const childElements = Array.from(element.children);
  const hasChildren = childElements.length > 0;
  const text = element.textContent?.trim() ?? "";

  if (!hasChildren) {
    if (text === "") return "";
    if (text === "true") return true;
    if (text === "false") return false;
    const n = Number(text);
    return Number.isNaN(n) ? text : n;
  }

  const grouped: Record<string, JsonValue[]> = {};
  childElements.forEach((child) => {
    const key = child.tagName;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(xmlElementToObject(child));
  });

  const obj: JsonObject = {};
  Object.entries(grouped).forEach(([key, values]) => {
    obj[key] = values.length === 1 ? values[0] : values;
  });
  return obj;
}

export function xmlToJson(text: string): BeautifyResult {
  if (!text.trim()) return { ok: false, result: "Error: Input is empty." };
  const doc = new DOMParser().parseFromString(text, "application/xml");
  if (doc.querySelector("parsererror")) return { ok: false, result: "Error: Invalid XML." };

  const root = doc.documentElement;
  const output: JsonObject = { [root.tagName]: xmlElementToObject(root) };
  return { ok: true, result: JSON.stringify(output, null, 2) };
}

function flattenRecord(value: JsonValue, prefix = "", out: Record<string, string> = {}): Record<string, string> {
  if (value === null) {
    out[prefix || "value"] = "";
    return out;
  }
  if (Array.isArray(value)) {
    value.forEach((item, idx) => flattenRecord(item, prefix ? `${prefix}_${idx}` : String(idx), out));
    return out;
  }
  if (typeof value === "object") {
    Object.entries(value as JsonObject).forEach(([k, v]) => {
      const nextPrefix = prefix ? `${prefix}_${k}` : k;
      flattenRecord(v, nextPrefix, out);
    });
    return out;
  }
  out[prefix || "value"] = String(value);
  return out;
}

export function xmlToCsvBestEffort(text: string): BeautifyResult {
  const asJson = xmlToJson(text);
  if (!asJson.ok) return asJson;

  try {
    const parsed = JSON.parse(asJson.result) as JsonObject;
    const rootValue = Object.values(parsed)[0];

    let rowsCandidate: JsonValue[] = [];
    if (Array.isArray(rootValue)) {
      rowsCandidate = rootValue;
    } else if (rootValue && typeof rootValue === "object") {
      const rootObj = rootValue as JsonObject;
      const firstArrayEntry = Object.values(rootObj).find((v) => Array.isArray(v)) as JsonValue[] | undefined;
      rowsCandidate = firstArrayEntry ?? [rootObj];
    } else {
      rowsCandidate = [rootValue];
    }

    const rows = rowsCandidate.map((row) => flattenRecord(row));
    const headers = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
    if (!headers.length) return { ok: false, result: "Error: Could not derive tabular data from XML." };

    const csvLines = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((h) => {
            const raw = row[h] ?? "";
            return /[",\n]/.test(raw) ? `"${raw.replace(/"/g, '""')}"` : raw;
          })
          .join(",")
      )
    ];

    return { ok: true, result: csvLines.join("\n") };
  } catch (error) {
    const e = error as Error;
    return { ok: false, result: `Error: ${e.message}` };
  }
}
