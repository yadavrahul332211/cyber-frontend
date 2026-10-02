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
  getFindings: vi.fn().mockResolvedValue([
    { id: 1, asset: "10.0.0.5", type: "server", source: "nmap", title: "SSH service exposed", severity: "high", evidence: "Port 22 open", status: "open" },
    { id: 2, asset: "https://example.com", type: "web", source: "nuclei", title: "Exposed admin panel", severity: "critical", evidence: "GET /admin 200", status: "open" },
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
