"use client";

import * as React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ChatErrorBoundaryProps {
  children: React.ReactNode;
}

interface ChatErrorBoundaryState {
  hasError: boolean;
}

/**
 * Error boundary that wraps the chat panel to prevent crashes from
 * taking down the entire dashboard page (blank screen).
 */
export class ChatErrorBoundary extends React.Component<
  ChatErrorBoundaryProps,
  ChatErrorBoundaryState
> {
  constructor(props: ChatErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ChatErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ChatErrorBoundary] Caught error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed bottom-24 right-6 z-50 w-[420px] rounded-2xl bg-white shadow-2xl border border-slate-200/60 p-6 flex flex-col items-center gap-3 text-center">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-sm font-medium text-slate-700">
            Something went wrong with the chat
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#D97706] text-white text-sm font-medium hover:bg-[#B45309] transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
