import React from "react";
import { act, render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useWebSocket } from "@/lib/hooks/use-websocket";
import { useAuthStore } from "@/lib/store/auth-store";
import { toast } from "@/components/ui/use-toast";

const socketHandlers: Record<string, (data?: any) => void> = {};
const mockSocket = {
  connected: false,
  on: jest.fn((event: string, handler: (data?: any) => void) => {
    socketHandlers[event] = handler;
    return mockSocket;
  }),
  disconnect: jest.fn(),
};

const ioMock = jest.fn(() => mockSocket);

jest.mock("socket.io-client", () => ({
  io: (...args: unknown[]) => ioMock(...args),
}));

jest.mock("@/components/ui/use-toast", () => ({
  toast: jest.fn(),
}));

function TestComponent() {
  useWebSocket();
  return null;
}

describe("useWebSocket", () => {
  beforeEach(() => {
    Object.keys(socketHandlers).forEach((key) => {
      delete socketHandlers[key];
    });
    ioMock.mockClear();
    mockSocket.on.mockClear();
    mockSocket.disconnect.mockClear();
    (toast as jest.Mock).mockClear();

    useAuthStore.setState({
      token: "test-token",
      user: {
        id: "u1",
        email: "u1@example.com",
        fullName: "User One",
        role: "lawyer",
        organizationId: 1,
      },
      isAuthenticated: true,
    });

    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3000";
  });

  it("invalidates alerts and unread-count queries on notification event", () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { unmount } = render(
      <QueryClientProvider client={queryClient}>
        <TestComponent />
      </QueryClientProvider>
    );

    act(() => {
      socketHandlers.notification?.({
        title: "New notification",
        message: "Body",
      });
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["alerts"] });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["alerts-unread-count"],
    });
    expect(toast).toHaveBeenCalledWith({
      title: "New notification",
      description: "Body",
    });

    unmount();
  });
});
