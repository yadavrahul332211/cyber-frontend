import { describe, it, expect } from "vitest";
import { splitEvidence } from "@/lib/evidence";

describe("splitEvidence", () => {
  it("separates remediation from evidence", () => {
    const r = splitEvidence("Host: a, Port: 80, Remediation: Fix it");
    expect(r.evidence).toBe("Host: a, Port: 80");
    expect(r.remediation).toBe("Fix it");
  });

  it("returns null remediation when there is none", () => {
    const r = splitEvidence("Host: a, Port: 80");
    expect(r.evidence).toBe("Host: a, Port: 80");
    expect(r.remediation).toBeNull();
  });
});
