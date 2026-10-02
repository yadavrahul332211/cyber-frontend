import { describe, it, expect } from "vitest";
import { toFinding } from "@/lib/api";

const base = {
  id: 1,
  asset: "10.0.0.5",
  type: "server",
  source: "nmap",
  title: "Open ssh service on port 22",
  evidence: "Port: 22",
  status: "open" as const,
};

describe("toFinding", () => {
  it("lowercases the severity from the backend", () => {
    expect(toFinding({ ...base, severity: "MEDIUM" }).severity).toBe("medium");
  });

  it("falls back to info for unknown severities", () => {
    expect(toFinding({ ...base, severity: "weird" }).severity).toBe("info");
  });
});
