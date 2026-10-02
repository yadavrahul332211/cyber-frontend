"use client";

import { useState } from "react";
import Link from "next/link";
import { ingestScan } from "@/lib/api";
import type { Scanner } from "@/lib/types";

export default function ScanPage() {
  const [scanner, setScanner] = useState<Scanner>("nmap");
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [inputKey, setInputKey] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setResult("");
    setError("");
    setText("");
    setFileName("");
    if (!file) return;
    setText(await file.text());
    setFileName(file.name);
  }

  async function handleUpload() {
    if (!text.trim()) {
      setError("Choose a scan file first");
      return;
    }
    setBusy(true);
    setError("");
    setResult("");
    try {
      const res = await ingestScan(scanner, text);
      setResult(`${res.created} findings added`);
      setText("");
      setFileName("");
      setInputKey((k) => k + 1);
    } catch {
      setError(
        scanner === "nmap"
          ? "Couldn't read that file. Upload valid Nmap XML output."
          : "Couldn't read that file. Upload valid Nuclei JSONL output."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Upload scan</h1>
      <p className="text-sm text-gray-600">
        Upload raw scan output. Findings are parsed and saved by the backend.
      </p>

      <div className="space-y-3 rounded border bg-white p-4">
        <div>
          <label className="mb-1 block text-sm text-gray-500">Scanner</label>
          <select
            value={scanner}
            onChange={(e) => setScanner(e.target.value as Scanner)}
            className="rounded border bg-white p-2 text-sm"
          >
            <option value="nmap">Nmap (XML)</option>
            <option value="nuclei">Nuclei (JSONL)</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-500">Scan file</label>
          <input key={inputKey} type="file" accept=".xml,.json,.jsonl,.txt" onChange={handleFile} className="text-sm" />
          {fileName && <p className="mt-1 text-sm text-gray-600">{fileName} ready to upload</p>}
        </div>

        <button onClick={handleUpload} disabled={busy} className="rounded bg-black px-4 py-2 text-sm text-white">
          {busy ? "Uploading…" : "Upload scan"}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {result && (
        <p className="text-sm text-green-700">
          {result}.{" "}
          <Link href="/findings" className="underline">View findings</Link>
        </p>
      )}
    </div>
  );
}
