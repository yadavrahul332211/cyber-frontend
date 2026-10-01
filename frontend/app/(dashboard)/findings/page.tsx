"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAssets, getFindings } from "@/lib/api";
import type { Asset, Finding } from "@/lib/types";
import SeverityBadge from "@/components/SeverityBadge";

export default function FindingsPage() {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getFindings(), getAssets()])
      .then(([f, a]) => {
        setFindings(f);
        setAssets(a);
      })
      .catch(() => setError("Couldn't load findings. Try again."))
      .finally(() => setLoading(false));
  }, []);

  const assetName = (id: number | null) =>
    assets.find((a) => a.id === id)?.name ?? "-";

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Findings</h1>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-500">Loading findings…</p>
      ) : findings.length === 0 ? (
        <p className="text-sm text-gray-500">No findings yet. Add an asset and run a scan.</p>
      ) : (
        <table className="w-full rounded border bg-white text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="p-2">Title</th>
              <th className="p-2">Asset</th>
              <th className="p-2">Host</th>
              <th className="p-2">Scanner</th>
              <th className="p-2">Severity</th>
            </tr>
          </thead>
          <tbody>
            {findings.map((f) => (
              <tr key={f.id} className="border-b last:border-0">
                <td className="p-2">
                  <Link href={`/findings/${f.id}`} className="hover:underline">{f.title}</Link>
                </td>
                <td className="p-2">{assetName(f.asset_id)}</td>
                <td className="p-2">{f.host ? `${f.host}${f.port ? `:${f.port}` : ""}` : "-"}</td>
                <td className="p-2">{f.scanner ?? "-"}</td>
                <td className="p-2"><SeverityBadge severity={f.severity} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
