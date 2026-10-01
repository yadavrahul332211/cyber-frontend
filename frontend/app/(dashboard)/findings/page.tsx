"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getFindings } from "@/lib/api";
import type { Finding } from "@/lib/types";
import SeverityBadge from "@/components/SeverityBadge";

export default function FindingsPage() {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getFindings()
      .then(setFindings)
      .catch(() => setError("Couldn't load findings. Try again."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Findings</h1>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-500">Loading findings…</p>
      ) : findings.length === 0 ? (
        <p className="text-sm text-gray-500">
          No findings yet. Add an asset and run a scan.
        </p>
      ) : (
        <table className="w-full rounded border bg-white text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="p-2">Title</th>
              <th className="p-2">Asset</th>
              <th className="p-2">Source</th>
              <th className="p-2">Severity</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {findings.map((f) => (
              <tr key={f.id} className="border-b last:border-0">
                <td className="p-2">
                  <Link href={`/findings/${f.id}`} className="hover:underline">
                    {f.title}
                  </Link>
                </td>
                <td className="p-2">{f.asset}</td>
                <td className="p-2">{f.source}</td>
                <td className="p-2">
                  <SeverityBadge severity={f.severity} />
                </td>
                <td className="p-2">{f.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
