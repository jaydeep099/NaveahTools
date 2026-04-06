export type TypeSizeMode = "none" | "single" | "precision_scale";

export interface OracleBaseType {
  base: string;
  sizeMode: TypeSizeMode;
  sizeLabel?: string;
  defaultSize?: string;
  placeholder?: string;
  defaultScale?: string;
  scalePlaceholder?: string;
}

export interface ColumnConfig {
  name: string;
  originalName: string;
  baseType: string;
  typeSizeVal: string;
  typeScaleVal: string;
  include: boolean;
  nullable: boolean;
}

export interface ValidationResult {
  valid: boolean;
  message: string;
}

export interface BeautifyResult {
  ok: boolean;
  result: string;
}

export interface ParsedDelimited {
  headers: string[];
  rows: string[][];
}

export const ORACLE_BASE_TYPES: OracleBaseType[] = [
  { base: "VARCHAR2", sizeMode: "single", sizeLabel: "Length", defaultSize: "255", placeholder: "1-32767" },
  { base: "NVARCHAR2", sizeMode: "single", sizeLabel: "Length", defaultSize: "255", placeholder: "1-16383" },
  { base: "CHAR", sizeMode: "single", sizeLabel: "Length", defaultSize: "1", placeholder: "1-2000" },
  { base: "NCHAR", sizeMode: "single", sizeLabel: "Length", defaultSize: "1", placeholder: "1-1000" },
  { base: "NUMBER", sizeMode: "precision_scale", sizeLabel: "Precision", defaultSize: "", placeholder: "1-38", defaultScale: "", scalePlaceholder: "0-127" },
  { base: "FLOAT", sizeMode: "single", sizeLabel: "Precision", defaultSize: "", placeholder: "1-126" },
  { base: "BINARY_FLOAT", sizeMode: "none" },
  { base: "BINARY_DOUBLE", sizeMode: "none" },
  { base: "INTEGER", sizeMode: "none" },
  { base: "DATE", sizeMode: "none" },
  { base: "TIMESTAMP", sizeMode: "single", sizeLabel: "Frac. Secs", defaultSize: "6", placeholder: "0-9" },
  { base: "TIMESTAMP WITH TIME ZONE", sizeMode: "single", sizeLabel: "Frac. Secs", defaultSize: "6", placeholder: "0-9" },
  { base: "TIMESTAMP WITH LOCAL TIME ZONE", sizeMode: "single", sizeLabel: "Frac. Secs", defaultSize: "6", placeholder: "0-9" },
  { base: "INTERVAL YEAR TO MONTH", sizeMode: "single", sizeLabel: "Year Prec", defaultSize: "2", placeholder: "0-9" },
  { base: "INTERVAL DAY TO SECOND", sizeMode: "single", sizeLabel: "Day Prec", defaultSize: "2", placeholder: "0-9" },
  { base: "CLOB", sizeMode: "none" },
  { base: "NCLOB", sizeMode: "none" },
  { base: "BLOB", sizeMode: "none" },
  { base: "BFILE", sizeMode: "none" },
  { base: "RAW", sizeMode: "single", sizeLabel: "Length", defaultSize: "255", placeholder: "1-2000" },
  { base: "LONG RAW", sizeMode: "none" },
  { base: "XMLTYPE", sizeMode: "none" },
  { base: "ROWID", sizeMode: "none" }
];

export const TYPE_MAP: Record<string, OracleBaseType> = Object.fromEntries(
  ORACLE_BASE_TYPES.map((t) => [t.base, t])
);
