import type { Asset, Finding } from "./types";

const API = process.env.NEXT_PUBLIC_API_URL;
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

let mockAssets: Asset[] = [
  { id: 1, name: "example.com", type: "web", created_at: "2026-10-01" },
  { id: 2, name: "10.0.0.5", type: "host", created_at: "2026-10-01" },
];

const mockFindings: Finding[] = [
  {
    id: 1,
    asset: "example.com",
    type: "web",
    source: "nuclei",
    title: "Missing security header",
    severity: "medium",
    evidence: "Response has no X-Frame-Options header",
    remediation: "Add the X-Frame-Options header to all responses.",
    status: "open",
  },
  {
    id: 2,
    asset: "10.0.0.5",
    type: "host",
    source: "nmap",
    title: "SSH exposed on port 22",
    severity: "high",
    evidence: "22/tcp open ssh OpenSSH 7.4",
    remediation: "Restrict SSH to trusted IPs and disable password login.",
    status: "open",
  },
  {
    id: 3,
    asset: "example.com",
    type: "web",
    source: "nuclei",
    title: "Exposed admin panel",
    severity: "critical",
    evidence: "GET /admin returned 200 without authentication",
    remediation: "Put the admin panel behind authentication and a VPN.",
    status: "open",
  },
  {
    id: 4,
    asset: "10.0.0.5",
    type: "host",
    source: "nmap",
    title: "Outdated web server version",
    severity: "low",
    evidence: "80/tcp open http nginx 1.14",
    remediation: "Upgrade nginx to the latest stable version.",
    status: "resolved",
  },
];

export async function getAssets(): Promise<Asset[]> {
  if (USE_MOCK) return mockAssets;
  const res = await fetch(`${API}/assets`);
  if (!res.ok) throw new Error("Couldn't load assets");
  return res.json();
}

export async function createAsset(name: string, type: string): Promise<Asset> {
  if (USE_MOCK) {
    const asset: Asset = {
      id: mockAssets.length + 1,
      name,
      type,
      created_at: new Date().toISOString().slice(0, 10),
    };
    mockAssets = [...mockAssets, asset];
    return asset;
  }
  const res = await fetch(`${API}/assets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, type }),
  });
  if (!res.ok) throw new Error("Couldn't create asset");
  return res.json();
}

export async function getFindings(): Promise<Finding[]> {
  if (USE_MOCK) return mockFindings;
  const res = await fetch(`${API}/findings`);
  if (!res.ok) throw new Error("Couldn't load findings");
  return res.json();
}
