import type { Asset } from "./types";

const API = process.env.NEXT_PUBLIC_API_URL;
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

let mockAssets: Asset[] = [
  { id: 1, name: "example.com", type: "web", created_at: "2026-10-01" },
  { id: 2, name: "10.0.0.5", type: "host", created_at: "2026-10-01" },
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
