import type { Asset, Finding, NewAsset, NewFinding, Severity } from "./types";

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
  { id: 1, asset_id: 1, title: "Missing security header", severity: "medium", description: "The site does not send X-Frame-Options.", scanner: "nuclei", host: "example.com", port: 443, evidence: "Response has no X-Frame-Options header", remediation: "Add the X-Frame-Options header to all responses.", created_at: now },
  { id: 2, asset_id: 2, title: "SSH service exposed", severity: "high", description: "SSH is reachable from the network.", scanner: "nmap", host: "10.0.0.5", port: 22, evidence: "22/tcp open ssh OpenSSH 7.4", remediation: "Restrict SSH to trusted IPs and disable password login.", created_at: now },
  { id: 3, asset_id: 1, title: "Exposed admin panel", severity: "critical", description: "The admin panel is open to anyone.", scanner: "nuclei", host: "example.com", port: 443, evidence: "GET /admin returned 200 without authentication", remediation: "Put the admin panel behind authentication and a VPN.", created_at: now },
  { id: 4, asset_id: 2, title: "Outdated web server version", severity: "low", description: "Old nginx version in use.", scanner: "nmap", host: "10.0.0.5", port: 80, evidence: "80/tcp open http nginx 1.14", remediation: "Upgrade nginx to the latest stable version.", created_at: now },
];

export async function getAssets(): Promise<Asset[]> {
  if (USE_MOCK) return mockAssets;
  return request<Asset[]>("/assets");
}

export async function getAsset(id: number): Promise<Asset> {
  if (USE_MOCK) {
    const a = mockAssets.find((x) => x.id === id);
    if (!a) throw new Error("Not found");
    return a;
  }
  return request<Asset>(`/assets/${id}`);
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
  if (USE_MOCK) return mockFindings;
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

export async function ingestFindings(
  assetId: number,
  findings: NewFinding[]
): Promise<{ asset_id: number; created: number }> {
  if (USE_MOCK) {
    for (const f of findings) {
      mockFindings.push(
        toFinding({
          id: mockFindings.length + 1,
          asset_id: assetId,
          description: null,
          scanner: null,
          host: null,
          port: null,
          evidence: null,
          remediation: null,
          created_at: new Date().toISOString(),
          ...f,
        })
      );
    }
    return { asset_id: assetId, created: findings.length };
  }
  return request("/findings/ingest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ asset_id: assetId, findings }),
  });
}
