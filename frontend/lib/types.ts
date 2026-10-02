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
export type FindingStatus = "open" | "resolved" | "ignored";
export type Scanner = "nmap" | "nuclei";

export type Finding = {
  id: number;
  asset: string;
  type: string;
  source: string;
  title: string;
  severity: Severity;
  evidence: string;
  status: FindingStatus;
};
