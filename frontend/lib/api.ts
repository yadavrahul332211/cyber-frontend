import type { Asset, Finding, NewAsset, Scanner, Severity } from "./types";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";
const BASE = "/api";
const SEVERITIES: Severity[] = ["critical", "high", "medium", "low", "info"];

type RawFinding = Omit<Finding, "severity"> & { severity: string };

export function toFinding(raw: RawFinding): Finding {
  const s = String(raw.severity).toLowerCase() as Severity;
  return { ...raw, severity: SEVERITIES.includes(s) ? s : "info" };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

const now = "2026-10-01T09:00:00";

let mockAssets: Asset[] = [
  { id: 1, name: "Example website", type: "web", url: "https://example.com", ip: null, created_at: now, updated_at: now },
  { id: 2, name: "Local test server", type: "server", url: null, ip: "10.0.0.5", created_at: now, updated_at: now },
];

const mockFindings: Finding[] = [
  { id: 1, asset: "https://example.com", type: "web", source: "nuclei", title: "Missing security header", severity: "medium", evidence: "Host: https://example.com, Port: 443, Remediation: Add the X-Frame-Options header to all responses.", status: "open" },
  { id: 2, asset: "10.0.0.5", type: "server", source: "nmap", title: "Open ssh service on port 22", severity: "medium", evidence: "Host: 10.0.0.5, Protocol: tcp, Port: 22, State: open, Service: ssh", status: "open" },
  { id: 3, asset: "https://example.com", type: "web", source: "nuclei", title: "Exposed admin panel", severity: "critical", evidence: "Host: https://example.com, Matched-At: https://example.com/admin, Remediation: Put the admin panel behind authentication.", status: "open" },
  { id: 4, asset: "10.0.0.5", type: "server", source: "nmap", title: "Open http service on port 80", severity: "low", evidence: "Host: 10.0.0.5, Protocol: tcp, Port: 80, State: open, Service: http", status: "resolved" },
];

export async function getAssets(): Promise<Asset[]> {
  if (USE_MOCK) return [...mockAssets];
  return request<Asset[]>("/assets");
}

export async function createAsset(input: NewAsset): Promise<Asset> {
  if (USE_MOCK) {
    const stamp = new Date().toISOString();
    const asset: Asset = {
      id: mockAssets.length + 1,
      ...input,
      created_at: stamp,
      updated_at: stamp,
    };
    mockAssets = [...mockAssets, asset];
    return asset;
  }
  return request<Asset>("/assets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function getFindings(): Promise<Finding[]> {
  if (USE_MOCK) return [...mockFindings];
  const raw = await request<RawFinding[]>("/findings");
  return raw.map(toFinding);
}

export async function getFinding(id: number): Promise<Finding> {
  if (USE_MOCK) {
    const f = mockFindings.find((x) => x.id === id);
    if (!f) throw new Error("Not found");
    return f;
  }
  return toFinding(await request<RawFinding>(`/findings/${id}`));
}

export async function ingestScan(
  scanner: Scanner,
  payload: string
): Promise<{ created: number }> {
  if (USE_MOCK) {
    const count =
      scanner === "nmap"
        ? (payload.match(/<port\s/g) ?? []).length
        : payload.split("\n").filter((l) => l.trim()).length;
    for (let i = 0; i < count; i++) {
      mockFindings.push({
        id: mockFindings.length + 1,
        asset: "mock-target",
        type: scanner === "nmap" ? "server" : "web",
        source: scanner,
        title: `Imported ${scanner} finding ${i + 1}`,
        severity: "low",
        evidence: "Imported in mock mode",
        status: "open",
      });
    }
    return { created: count };
  }
  const qs = new URLSearchParams({ payload });
  return request(`/findings/ingest/${scanner}?${qs.toString()}`, {
    method: "POST",
  });
}
