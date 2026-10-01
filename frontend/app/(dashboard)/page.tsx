"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAssets, getFindings } from "@/lib/api";
import type { Asset, Finding, Severity } from "@/lib/types";
import SeverityBadge from "@/components/SeverityBadge";

const levels: Severity[] = ["critical", "high", "medium", "low", "info"];

export default function OverviewPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getAssets(), getFindings()])
      .then(([a, f]) => {
        setAssets(a);
        setFindings(f);
      })
      .catch(() => setError("Couldn't load the overview. Try again."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-gray-500">Loading…</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  const open = findings.filter((f) => f.status === "open");
  const count = (s: Severity) => open.filter((f) => f.severity === s).length;
  const max = Math.max(1, ...levels.map(count));

  const tiles = [
    { label: "Assets", value: assets.length },
    { label: "Open findings", value: open.length },
    { label: "Critical", value: count("critical") },
    { label: "High", value: count("high") },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Security overview</h1>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="rounded border bg-white p-4">
            <p className="text-sm text-gray-500">{t.label}</p>
            <p className="text-2xl font-semibold">{t.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded border bg-white p-4">
        <h2 className="mb-3 text-sm font-medium">Open findings by severity</h2>
        <div className="space-y-2">
          {levels.map((s) => (
            <div key={s} className="flex items-center gap-3 text-sm">
              <span className="w-16 text-gray-600">{s}</span>
              <div className="h-3 flex-1 rounded bg-gray-100">
                <div
                  className="h-3 rounded bg-gray-700"
                  style={{ width: `${(count(s) / max) * 100}%` }}
                />
              </div>
              <span className="w-6 text-right">{count(s)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded border bg-white p-4">
        <h2 className="mb-3 text-sm font-medium">Recent findings</h2>
        {findings.length === 0 ? (
          <p className="text-sm text-gray-500">
            No findings yet. Add an asset and run a scan.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {findings.slice(0, 5).map((f) => (
              <li key={f.id} className="flex items-center justify-between">
                <Link href={`/findings/${f.id}`} className="hover:underline">
                  {f.title}
                </Link>
                <SeverityBadge severity={f.severity} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
