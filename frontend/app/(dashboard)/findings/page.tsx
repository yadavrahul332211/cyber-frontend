"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getAssets, getFindings } from "@/lib/api";
import type { Asset, Finding, Severity } from "@/lib/types";
import SeverityBadge from "@/components/SeverityBadge";

const levels: Severity[] = ["critical", "high", "medium", "low", "info"];

export default function FindingsPage() {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("all");
  const [assetId, setAssetId] = useState("all");

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

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return findings
      .filter((f) => severity === "all" || f.severity === severity)
      .filter((f) => assetId === "all" || String(f.asset_id) === assetId)
      .filter((f) => {
        if (!q) return true;
        return [f.title, f.host, f.scanner, assetName(f.asset_id)]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q));
      })
      .sort((a, b) => levels.indexOf(a.severity) - levels.indexOf(b.severity));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [findings, assets, search, severity, assetId]);

  const control = "rounded border bg-white p-2 text-sm";

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Findings</h1>

      <div className="flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title, host or scanner"
          className={`w-72 ${control}`}
        />
        <select value={severity} onChange={(e) => setSeverity(e.target.value)} className={control}>
          <option value="all">All severities</option>
          {levels.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={assetId} onChange={(e) => setAssetId(e.target.value)} className={control}>
          <option value="all">All assets</option>
          {assets.map((a) => (
            <option key={a.id} value={String(a.id)}>{a.name}</option>
          ))}
        </select>
        <button
          onClick={() => {
            setSearch("");
            setSeverity("all");
            setAssetId("all");
          }}
          className="rounded border px-3 text-sm text-gray-600"
        >
          Clear filters
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-500">Loading findings…</p>
      ) : findings.length === 0 ? (
        <p className="text-sm text-gray-500">No findings yet. Add an asset and run a scan.</p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-gray-500">No findings match your filters.</p>
      ) : (
        <>
          <p className="text-sm text-gray-500">
            Showing {visible.length} of {findings.length}
          </p>
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
              {visible.map((f) => (
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
        </>
      )}
    </div>
  );
}
