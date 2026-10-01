"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getAsset, getFinding } from "@/lib/api";
import type { Finding } from "@/lib/types";
import SeverityBadge from "@/components/SeverityBadge";

export default function FindingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [finding, setFinding] = useState<Finding | null>(null);
  const [assetName, setAssetName] = useState("-");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getFinding(Number(id))
      .then(async (f) => {
        setFinding(f);
        if (f.asset_id) {
          try {
            setAssetName((await getAsset(f.asset_id)).name);
          } catch {}
        }
      })
      .catch(() => setError("Couldn't load this finding."))
      .finally(() => setLoading(false));
  }, [id]);

  const label = "text-sm text-gray-500";

  return (
    <div className="space-y-4">
      <Link href="/findings" className="text-sm text-gray-600 hover:underline">
        ← Back to findings
      </Link>

      {loading && <p className="text-sm text-gray-500">Loading…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {finding && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">{finding.title}</h1>
            <SeverityBadge severity={finding.severity} />
          </div>

          <div className="grid grid-cols-2 gap-3 rounded border bg-white p-4 md:grid-cols-4">
            <div><p className={label}>Asset</p><p className="text-sm">{assetName}</p></div>
            <div><p className={label}>Host</p><p className="text-sm">{finding.host ? `${finding.host}${finding.port ? `:${finding.port}` : ""}` : "-"}</p></div>
            <div><p className={label}>Scanner</p><p className="text-sm">{finding.scanner ?? "-"}</p></div>
            <div><p className={label}>Found on</p><p className="text-sm">{finding.created_at.slice(0, 10)}</p></div>
          </div>

          {finding.description && (
            <div className="rounded border bg-white p-4">
              <h2 className="mb-2 text-sm font-medium">Description</h2>
              <p className="text-sm">{finding.description}</p>
            </div>
          )}

          <div className="rounded border bg-white p-4">
            <h2 className="mb-2 text-sm font-medium">Evidence</h2>
            <pre className="whitespace-pre-wrap rounded bg-gray-50 p-3 text-xs">
              {finding.evidence || "No evidence recorded."}
            </pre>
          </div>

          <div className="rounded border bg-white p-4">
            <h2 className="mb-2 text-sm font-medium">Remediation</h2>
            <p className="text-sm">{finding.remediation || "No remediation provided."}</p>
          </div>
        </div>
      )}
    </div>
  );
}
