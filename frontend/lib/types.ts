export type Asset = {
  id: number;
  name: string;
  type: string;
  created_at: string;
};

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export type Finding = {
  id: number;
  asset: string;
  type: string;
  source: string;
  title: string;
  severity: Severity;
  evidence: string;
  remediation: string;
  status: "open" | "resolved";
};
