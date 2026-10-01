"use client";

import { useEffect, useState } from "react";
import { getAssets, createAsset } from "@/lib/api";
import type { Asset } from "@/lib/types";

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("server");
  const [ip, setIp] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    getAssets()
      .then(setAssets)
      .catch(() => setError("Couldn't load assets. Try again."))
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Enter an asset name");
      return;
    }
    try {
      const asset = await createAsset({
        name: name.trim(),
        type,
        ip: ip.trim() || null,
        url: url.trim() || null,
      });
      setAssets((prev) => [...prev, asset]);
      setName("");
      setIp("");
      setUrl("");
      setError("");
    } catch {
      setError("Couldn't add the asset. Try again.");
    }
  }

  const input = "rounded border bg-white p-2 text-sm";

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Assets</h1>

      <form onSubmit={handleAdd} className="flex flex-wrap gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Local test server" className={`w-56 ${input}`} />
        <select value={type} onChange={(e) => setType(e.target.value)} className={input}>
          <option value="server">server</option>
          <option value="web">web</option>
          <option value="network">network</option>
        </select>
        <input value={ip} onChange={(e) => setIp(e.target.value)} placeholder="127.0.0.1" className={`w-40 ${input}`} />
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" className={`w-56 ${input}`} />
        <button className="rounded bg-black px-4 text-sm text-white">Add asset</button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-500">Loading assets…</p>
      ) : assets.length === 0 ? (
        <p className="text-sm text-gray-500">Add your first asset to start scanning.</p>
      ) : (
        <table className="w-full rounded border bg-white text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="p-2">Name</th>
              <th className="p-2">Type</th>
              <th className="p-2">IP / URL</th>
              <th className="p-2">Added</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((a) => (
              <tr key={a.id} className="border-b last:border-0">
                <td className="p-2">{a.name}</td>
                <td className="p-2">{a.type}</td>
                <td className="p-2">{a.ip ?? a.url ?? "-"}</td>
                <td className="p-2">{a.created_at.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
