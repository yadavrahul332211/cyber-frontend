"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAssets, ingestFindings } from "@/lib/api";
import type { Asset, NewFinding } from "@/lib/types";

export default function ScanPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetId, setAssetId] = useState("");
  const [findings, setFindings] = useState<NewFinding[]>([]);
  const [inputKey, setInputKey] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getAssets()
      .then((a) => {
        setAssets(a);
        if (a[0]) setAssetId(String(a[0].id));
      })
      .catch(() => setError("Couldn't load assets. Try again."));
  }, []);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setResult("");
    setError("");
    setFindings([]);
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const list = Array.isArray(data) ? data : data.findings;
      const valid =
        Array.isArray(list) &&
        list.length > 0 &&
        list.every(
          (f) => f && typeof f.title === "string" && typeof f.severity === "string"
        );
      if (!valid) throw new Error("invalid");
      setFindings(list);
    } catch {
      setError(
        "That file isn't valid. Upload a JSON list of findings, each with a title and severity."
      );
    }
  }

  async function handleUpload() {
    if (!assetId) {
      setError("Choose an asset first");
      return;
    }
    if (findings.length === 0) {
      setError("Choose a findings file first");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await ingestFindings(Number(assetId), findings);
      setResult(`${res.created} findings added`);
      setFindings([]);
      setInputKey((k) => k + 1);
    } catch {
      setError("Couldn't upload the findings. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Upload scan</h1>
      <p className="text-sm text-gray-600">
        Upload a JSON file of normalized findings for one asset.
      </p>

      <div className="space-y-3 rounded border bg-white p-4">
        <div>
          <label className="mb-1 block text-sm text-gray-500">Asset</label>
          <select
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
            className="rounded border bg-white p-2 text-sm"
          >
            {assets.length === 0 && <option value="">No assets yet</option>}
            {assets.map((a) => (
              <option key={a.id} value={String(a.id)}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-500">Findings file (.json)</label>
          <input key={inputKey} type="file" accept=".json,application/json" onChange={handleFile} className="text-sm" />
          {findings.length > 0 && (
            <p className="mt-1 text-sm text-gray-600">{findings.length} findings ready to upload</p>
          )}
        </div>

        <button
          onClick={handleUpload}
          disabled={busy}
          className="rounded bg-black px-4 py-2 text-sm text-white"
        >
          {busy ? "Uploading…" : "Upload findings"}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {result && (
        <p className="text-sm text-green-700">
          {result}.{" "}
          <Link href="/findings" className="underline">
            View findings
          </Link>
        </p>
      )}
    </div>
  );
}
