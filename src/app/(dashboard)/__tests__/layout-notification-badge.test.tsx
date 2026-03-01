import React from "react";
import { render } from "@testing-library/react";
import DashboardLayout from "../layout";
import { useUnreadAlertsCount } from "@/lib/hooks/use-alerts";
import { Header } from "@/components/layout/header";
import { NavigationDock } from "@/components/layout/navigation-dock";

jest.mock("@/lib/hooks/use-alerts", () => ({
  useUnreadAlertsCount: jest.fn(),
}));

jest.mock("@/components/providers/websocket-provider", () => ({
  WebSocketProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

jest.mock("@/components/layout/header", () => ({
  Header: jest.fn(() => <div data-testid="header" />),
}));

jest.mock("@/components/layout/navigation-dock", () => ({
  NavigationDock: jest.fn(() => <div data-testid="navigation-dock" />),
}));

const mockedUseUnreadAlertsCount = useUnreadAlertsCount as jest.Mock;
const mockedHeader = Header as unknown as jest.Mock;
const mockedNavigationDock = NavigationDock as unknown as jest.Mock;

describe("DashboardLayout notifications", () => {
  it("passes backend unread count to header and navigation dock", () => {
    mockedUseUnreadAlertsCount.mockReturnValue({ data: 9 });

    render(
      <DashboardLayout>
        <div>content</div>
      </DashboardLayout>
    );

    expect(mockedHeader).toHaveBeenCalledWith(
      expect.objectContaining({ unreadCount: 9 }),
      undefined
    );
    expect(mockedNavigationDock).toHaveBeenCalledWith(
      expect.objectContaining({ unreadAlerts: 9 }),
      undefined
    );
  });
});
