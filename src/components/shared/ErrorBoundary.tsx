"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home, Bug, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// =============================================================================
// TYPES
// =============================================================================

interface ErrorBoundaryProps {
  /** Child components to wrap */
  children: ReactNode;
  /** Custom fallback component */
  fallback?: ReactNode;
  /** Called when error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Whether to show detailed error info (dev mode) */
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

// =============================================================================
// ERROR FALLBACK COMPONENT
// =============================================================================

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
  showDetails?: boolean;
}

function ErrorFallback({
  error,
  errorInfo,
  onReset,
  showDetails = false,
}: ErrorFallbackProps) {
  const [copied, setCopied] = React.useState(false);
  const [showStack, setShowStack] = React.useState(false);

  const errorMessage = error?.message || "An unexpected error occurred";
  const errorStack = error?.stack || "";
  const componentStack = errorInfo?.componentStack || "";

  const handleCopyError = async () => {
    const errorDetails = `
Error: ${errorMessage}

Stack Trace:
${errorStack}

Component Stack:
${componentStack}
    `.trim();

    try {
      await navigator.clipboard.writeText(errorDetails);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy error:", err);
    }
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full text-center"
      >
        {/* Error Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="mx-auto w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6"
        >
          <AlertTriangle className="h-10 w-10 text-red-500" />
        </motion.div>

        {/* Error Title */}
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Oops! Something went wrong
        </h2>

        {/* Error Message */}
        <p className="text-muted-foreground mb-6">
          {errorMessage}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <Button
            onClick={onReset}
            className="gap-2 bg-violet-600 hover:bg-violet-700"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </Link>
        </div>

        {/* Show Details Toggle (Dev Mode) */}
        {showDetails && (
          <div className="text-left">
            <button
              onClick={() => setShowStack(!showStack)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
            >
              <Bug className="h-4 w-4" />
              {showStack ? "Hide" : "Show"} Error Details
            </button>

            {showStack && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="relative"
              >
                <div className="rounded-lg bg-muted/50 border border-border p-4 text-left overflow-auto max-h-60">
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
                    <strong className="text-red-500">Error:</strong> {errorMessage}
                    {"\n\n"}
                    <strong>Stack Trace:</strong>
                    {"\n"}
                    {errorStack}
                    {componentStack && (
                      <>
                        {"\n\n"}
                        <strong>Component Stack:</strong>
                        {"\n"}
                        {componentStack}
                      </>
                    )}
                  </pre>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyError}
                  className="absolute top-2 right-2 h-8 gap-1"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copy
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </div>
        )}

        {/* Help Text */}
        <p className="text-xs text-muted-foreground mt-6">
          If this problem persists, please refresh the page or contact support.
        </p>
      </motion.div>
    </div>
  );
}

// =============================================================================
// ERROR BOUNDARY CLASS COMPONENT
// =============================================================================

/**
 * ErrorBoundary - Catches JavaScript errors in child components
 *
 * Features:
 * - Catches render errors
 * - Shows friendly fallback UI
 * - Provides reset functionality
 * - Optional error logging
 *
 * @example
 * ```tsx
 * <ErrorBoundary
 *   onError={(error) => logError(error)}
 *   showDetails={process.env.NODE_ENV === 'development'}
 * >
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Update state with error info
    this.setState({ errorInfo });

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
          showDetails={this.props.showDetails}
        />
      );
    }

    return this.props.children;
  }
}

// =============================================================================
// FUNCTIONAL ERROR BOUNDARY WRAPPER
// =============================================================================

interface WithErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * Functional wrapper for ErrorBoundary
 */
export function WithErrorBoundary({
  children,
  fallback,
  onError,
}: WithErrorBoundaryProps) {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <ErrorBoundary fallback={fallback} onError={onError} showDetails={isDev}>
      {children}
    </ErrorBoundary>
  );
}

// =============================================================================
// ERROR MESSAGE COMPONENT
// =============================================================================

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: "error" | "warning" | "info";
  className?: string;
}

/**
 * Inline error message component
 */
export function ErrorMessage({
  title,
  message,
  onRetry,
  onDismiss,
  variant = "error",
  className,
}: ErrorMessageProps) {
  const variants = {
    error: {
      bg: "bg-red-50 dark:bg-red-950/30",
      border: "border-red-200 dark:border-red-800/50",
      text: "text-red-700 dark:text-red-300",
      icon: "text-red-500",
    },
    warning: {
      bg: "bg-amber-50 dark:bg-amber-950/30",
      border: "border-amber-200 dark:border-amber-800/50",
      text: "text-amber-700 dark:text-amber-300",
      icon: "text-amber-500",
    },
    info: {
      bg: "bg-blue-50 dark:bg-blue-950/30",
      border: "border-blue-200 dark:border-blue-800/50",
      text: "text-blue-700 dark:text-blue-300",
      icon: "text-blue-500",
    },
  };

  const styles = variants[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`rounded-lg ${styles.bg} ${styles.border} border p-4 ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className={`h-5 w-5 flex-shrink-0 ${styles.icon}`} />
        <div className="flex-1">
          {title && (
            <h4 className={`font-medium ${styles.text} mb-1`}>{title}</h4>
          )}
          <p className={`text-sm ${styles.text}`}>{message}</p>
        </div>
        {(onRetry || onDismiss) && (
          <div className="flex gap-2">
            {onRetry && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRetry}
                className="h-8 px-2"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="h-8 px-2"
              >
                ✕
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// =============================================================================
// INPUT ERROR COMPONENT
// =============================================================================

interface InputErrorProps {
  message: string;
  className?: string;
}

/**
 * Error message for form inputs
 */
export function InputError({ message, className }: InputErrorProps) {
  return (
    <motion.p
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className={`text-sm text-red-500 mt-1 flex items-center gap-1 ${className}`}
      role="alert"
    >
      <AlertTriangle className="h-3 w-3" />
      {message}
    </motion.p>
  );
}

export default ErrorBoundary;

