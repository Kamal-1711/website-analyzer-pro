"use client";

import { ReactNode } from "react";
import { ToastProvider, ToastInitializer } from "./Toast";
import { ErrorBoundary } from "./ErrorBoundary";

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Providers - Wraps the application with necessary providers
 *
 * Includes:
 * - ErrorBoundary - Catches render errors
 * - ToastProvider - Toast notifications
 */
export function Providers({ children }: ProvidersProps) {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <ErrorBoundary showDetails={isDev}>
      <ToastProvider position="bottom-right" maxToasts={5}>
        <ToastInitializer />
        {children}
      </ToastProvider>
    </ErrorBoundary>
  );
}

