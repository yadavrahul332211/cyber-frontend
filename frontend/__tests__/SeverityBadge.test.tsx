import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import SeverityBadge from "@/components/SeverityBadge";

describe("SeverityBadge", () => {
  it("shows the severity text", () => {
    render(<SeverityBadge severity="critical" />);
    expect(screen.getByText("critical")).toBeInTheDocument();
  });
});
