import { describe, it, expect } from "vitest";
import { toFinding } from "@/lib/api";

const base = {
  id: 1,
  asset_id: 1,
  title: "SSH service exposed",
  description: null,
  scanner: "nmap",
  host: "10.0.0.5",
  port: 22,
  evidence: null,
  remediation: null,
  created_at: "2026-10-01T09:00:00",
};

describe("toFinding", () => {
  it("lowercases the severity from the backend", () => {
    expect(toFinding({ ...base, severity: "MEDIUM" }).severity).toBe("medium");
  });

  it("falls back to info for unknown severities", () => {
    expect(toFinding({ ...base, severity: "weird" }).severity).toBe("info");
  });
});
