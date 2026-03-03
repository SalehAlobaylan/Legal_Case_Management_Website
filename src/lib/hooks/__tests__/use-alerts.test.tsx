import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUnreadAlertsCount } from "@/lib/hooks/use-alerts";
import { alertsApi } from "@/lib/api/alerts";

jest.mock("@/lib/api/alerts", () => ({
  alertsApi: {
    getUnreadCount: jest.fn(),
    getAlerts: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
  },
}));

const mockedAlertsApi = alertsApi as jest.Mocked<typeof alertsApi>;

describe("useUnreadAlertsCount", () => {
  it("fetches unread count from alerts API", async () => {
    mockedAlertsApi.getUnreadCount.mockResolvedValueOnce(7);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useUnreadAlertsCount(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBe(7);
    expect(mockedAlertsApi.getUnreadCount).toHaveBeenCalledTimes(1);
  });
});
