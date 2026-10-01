"use client";

import { useEffect, useState } from "react";
import { getAssets, createAsset } from "@/lib/api";
import type { Asset } from "@/lib/types";

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("web");

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
      const asset = await createAsset(name.trim(), type);
      setAssets((prev) => [...prev, asset]);
      setName("");
      setError("");
    } catch {
      setError("Couldn't add the asset. Try again.");
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Assets</h1>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="example.com"
          className="w-64 rounded border bg-white p-2 text-sm"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded border bg-white p-2 text-sm"
        >
          <option value="web">web</option>
          <option value="network">network</option>
          <option value="host">host</option>
        </select>
        <button className="rounded bg-black px-4 text-sm text-white">
          Add asset
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-500">Loading assets…</p>
      ) : assets.length === 0 ? (
        <p className="text-sm text-gray-500">
          Add your first asset to start scanning.
        </p>
      ) : (
        <table className="w-full rounded border bg-white text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="p-2">Name</th>
              <th className="p-2">Type</th>
              <th className="p-2">Added</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((a) => (
              <tr key={a.id} className="border-b last:border-0">
                <td className="p-2">{a.name}</td>
                <td className="p-2">{a.type}</td>
                <td className="p-2">{a.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
