export type Asset = {
  id: number;
  name: string;
  type: string;
  url: string | null;
  ip: string | null;
  created_at: string;
  updated_at: string;
};

export type NewAsset = {
  name: string;
  type: string;
  url: string | null;
  ip: string | null;
};

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export type Finding = {
  id: number;
  asset_id: number | null;
  title: string;
  severity: Severity;
  description: string | null;
  scanner: string | null;
  host: string | null;
  port: number | null;
  evidence: string | null;
  remediation: string | null;
  created_at: string;
};

export type NewFinding = {
  title: string;
  severity: string;
  description?: string | null;
  scanner?: string | null;
  host?: string | null;
  port?: number | null;
  evidence?: string | null;
  remediation?: string | null;
};
