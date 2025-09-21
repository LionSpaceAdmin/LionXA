import { render, screen } from "@testing-library/react";
import Header from "@/components/dashboard/Header";

describe("Header Component", () => {
  it("shows connected state and formatted uptime", () => {
    // 1 hour, 1 minute, 1 second in ms
    const uptimeMs = 1 * 3600 * 1000 + 1 * 60 * 1000 + 1 * 1000; // 3661000

    render(<Header uptime={uptimeMs} isConnected={true} />);

    expect(screen.getByText("XAgent Control")).toBeInTheDocument();
    expect(screen.getByText("מחובר")).toBeInTheDocument();
    expect(screen.getByText("זמן פעולה:")).toBeInTheDocument();
    expect(screen.getByText("01:01:01")).toBeInTheDocument();
  });

  it("shows disconnected state", () => {
    render(<Header uptime={0} isConnected={false} />);
    expect(screen.getByText("מנותק")).toBeInTheDocument();
  });
});
