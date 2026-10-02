"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getFindings } from "@/lib/api";
import type { Finding, Severity } from "@/lib/types";
import SeverityBadge from "@/components/SeverityBadge";

const levels: Severity[] = ["critical", "high", "medium", "low", "info"];

export default function FindingsPage() {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("all");
  const [asset, setAsset] = useState("all");

  useEffect(() => {
    getFindings()
      .then(setFindings)
      .catch(() => setError("Couldn't reach the server. Check that the backend is running."))
      .finally(() => setLoading(false));
  }, []);

  const assetOptions = useMemo(
    () => Array.from(new Set(findings.map((f) => f.asset))).sort(),
    [findings]
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return findings
      .filter((f) => severity === "all" || f.severity === severity)
      .filter((f) => asset === "all" || f.asset === asset)
      .filter(
        (f) =>
          !q ||
          [f.title, f.asset, f.source].some((v) => v.toLowerCase().includes(q))
      )
      .sort((a, b) => levels.indexOf(a.severity) - levels.indexOf(b.severity));
  }, [findings, search, severity, asset]);

  const control = "rounded border bg-white p-2 text-sm";

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Findings</h1>

      <div className="flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title, asset or scanner"
          className={`w-72 ${control}`}
        />
        <select value={severity} onChange={(e) => setSeverity(e.target.value)} className={control}>
          <option value="all">All severities</option>
          {levels.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={asset} onChange={(e) => setAsset(e.target.value)} className={control}>
          <option value="all">All assets</option>
          {assetOptions.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <button
          onClick={() => {
            setSearch("");
            setSeverity("all");
            setAsset("all");
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
        <p className="text-sm text-gray-500">No findings yet. Upload a scan to get started.</p>
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
                <th className="p-2">Scanner</th>
                <th className="p-2">Severity</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((f) => (
                <tr key={f.id} className="border-b last:border-0">
                  <td className="p-2">
                    <Link href={`/findings/${f.id}`} className="hover:underline">{f.title}</Link>
                  </td>
                  <td className="p-2">{f.asset}</td>
                  <td className="p-2">{f.source}</td>
                  <td className="p-2"><SeverityBadge severity={f.severity} /></td>
                  <td className="p-2">{f.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
