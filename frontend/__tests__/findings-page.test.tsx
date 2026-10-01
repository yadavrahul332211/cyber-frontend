import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import FindingsPage from "@/app/(dashboard)/findings/page";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/lib/api", () => ({
  getAssets: vi.fn().mockResolvedValue([
    { id: 1, name: "Local test server", type: "server", url: null, ip: "10.0.0.5", created_at: "2026-10-01", updated_at: "2026-10-01" },
    { id: 2, name: "Example website", type: "web", url: "https://example.com", ip: null, created_at: "2026-10-01", updated_at: "2026-10-01" },
  ]),
  getFindings: vi.fn().mockResolvedValue([
    { id: 1, asset_id: 1, title: "SSH service exposed", severity: "high", description: null, scanner: "nmap", host: "10.0.0.5", port: 22, evidence: null, remediation: null, created_at: "2026-10-01" },
    { id: 2, asset_id: 2, title: "Exposed admin panel", severity: "critical", description: null, scanner: "nuclei", host: "example.com", port: 443, evidence: null, remediation: null, created_at: "2026-10-01" },
  ]),
}));

describe("FindingsPage", () => {
  it("lists findings with the most severe first", async () => {
    render(<FindingsPage />);
    const links = await screen.findAllByRole("link");
    expect(links[0]).toHaveTextContent("Exposed admin panel");
    expect(links[1]).toHaveTextContent("SSH service exposed");
  });

  it("filters by search text", async () => {
    const user = userEvent.setup();
    render(<FindingsPage />);
    await screen.findByText("SSH service exposed");
    await user.type(screen.getByPlaceholderText(/search/i), "ssh");
    expect(screen.queryByText("Exposed admin panel")).not.toBeInTheDocument();
    expect(screen.getByText("SSH service exposed")).toBeInTheDocument();
  });

  it("filters by severity", async () => {
    const user = userEvent.setup();
    render(<FindingsPage />);
    await screen.findByText("SSH service exposed");
    await user.selectOptions(screen.getAllByRole("combobox")[0], "high");
    expect(screen.queryByText("Exposed admin panel")).not.toBeInTheDocument();
    expect(screen.getByText("SSH service exposed")).toBeInTheDocument();
  });

  it("shows a message when nothing matches", async () => {
    const user = userEvent.setup();
    render(<FindingsPage />);
    await screen.findByText("SSH service exposed");
    await user.type(screen.getByPlaceholderText(/search/i), "zzz");
    expect(screen.getByText("No findings match your filters.")).toBeInTheDocument();
  });
});
