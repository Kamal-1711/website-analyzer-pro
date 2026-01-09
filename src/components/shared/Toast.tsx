"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// =============================================================================
// TYPES
// =============================================================================

export type ToastType = "success" | "error" | "warning" | "info" | "loading";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
  updateToast: (id: string, toast: Partial<Toast>) => void;
  clearToasts: () => void;
  // Convenience methods
  success: (title: string, message?: string) => string;
  error: (title: string, message?: string) => string;
  warning: (title: string, message?: string) => string;
  info: (title: string, message?: string) => string;
  loading: (title: string, message?: string) => string;
  promise: <T>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: unknown) => string);
    }
  ) => Promise<T>;
}

// =============================================================================
// CONTEXT
// =============================================================================

const ToastContext = createContext<ToastContextValue | null>(null);

// =============================================================================
// TOAST PROVIDER
// =============================================================================

interface ToastProviderProps {
  children: React.ReactNode;
  /** Position of toast container */
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";
  /** Maximum number of visible toasts */
  maxToasts?: number;
}

export function ToastProvider({
  children,
  position = "bottom-right",
  maxToasts = 5,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  /**
   * Generate unique toast ID
   */
  const generateId = useCallback(() => {
    toastIdRef.current += 1;
    return `toast-${toastIdRef.current}-${Date.now()}`;
  }, []);

  /**
   * Add a new toast
   */
  const addToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = generateId();
      const newToast: Toast = {
        id,
        duration: toast.type === "loading" ? Infinity : 4000,
        dismissible: true,
        ...toast,
      };

      setToasts((prev) => {
        const updated = [...prev, newToast];
        // Limit max toasts
        if (updated.length > maxToasts) {
          return updated.slice(-maxToasts);
        }
        return updated;
      });

      return id;
    },
    [generateId, maxToasts]
  );

  /**
   * Remove a toast by ID
   */
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /**
   * Update an existing toast
   */
  const updateToast = useCallback((id: string, updates: Partial<Toast>) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  }, []);

  /**
   * Clear all toasts
   */
  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const success = useCallback(
    (title: string, message?: string) =>
      addToast({ type: "success", title, message }),
    [addToast]
  );

  const error = useCallback(
    (title: string, message?: string) =>
      addToast({ type: "error", title, message }),
    [addToast]
  );

  const warning = useCallback(
    (title: string, message?: string) =>
      addToast({ type: "warning", title, message }),
    [addToast]
  );

  const info = useCallback(
    (title: string, message?: string) =>
      addToast({ type: "info", title, message }),
    [addToast]
  );

  const loading = useCallback(
    (title: string, message?: string) =>
      addToast({ type: "loading", title, message, dismissible: false }),
    [addToast]
  );

  /**
   * Handle promise with loading/success/error toasts
   */
  const promise = useCallback(
    async <T,>(
      promiseOrFn: Promise<T>,
      options: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((err: unknown) => string);
      }
    ): Promise<T> => {
      const toastId = addToast({
        type: "loading",
        title: options.loading,
        dismissible: false,
      });

      try {
        const result = await promiseOrFn;
        const successMessage =
          typeof options.success === "function"
            ? options.success(result)
            : options.success;

        updateToast(toastId, {
          type: "success",
          title: successMessage,
          dismissible: true,
          duration: 4000,
        });

        return result;
      } catch (err) {
        const errorMessage =
          typeof options.error === "function"
            ? options.error(err)
            : options.error;

        updateToast(toastId, {
          type: "error",
          title: errorMessage,
          dismissible: true,
          duration: 4000,
        });

        throw err;
      }
    },
    [addToast, updateToast]
  );

  const value: ToastContextValue = {
    toasts,
    addToast,
    removeToast,
    updateToast,
    clearToasts,
    success,
    error,
    warning,
    info,
    loading,
    promise,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} position={position} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

// =============================================================================
// USE TOAST HOOK
// =============================================================================

/**
 * Hook to access toast functionality
 *
 * @example
 * ```tsx
 * const toast = useToast();
 *
 * // Simple usage
 * toast.success("Website analyzed!", "Found 1,245 pages");
 * toast.error("Failed to analyze", "Please try again");
 * toast.info("Analyzing...");
 *
 * // With promise
 * await toast.promise(fetchData(), {
 *   loading: "Loading...",
 *   success: "Data loaded!",
 *   error: "Failed to load"
 * });
 * ```
 */
export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}

// =============================================================================
// TOAST CONTAINER
// =============================================================================

interface ToastContainerProps {
  toasts: Toast[];
  position: ToastProviderProps["position"];
  onRemove: (id: string) => void;
}

function ToastContainer({ toasts, position, onRemove }: ToastContainerProps) {
  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-center": "top-4 left-1/2 -translate-x-1/2",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
  };

  const isTop = position?.startsWith("top");

  return (
    <div
      className={cn(
        "fixed z-[100] flex flex-col gap-2 pointer-events-none",
        positionClasses[position || "bottom-right"],
        isTop ? "flex-col" : "flex-col-reverse"
      )}
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// TOAST ITEM
// =============================================================================

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const { id, type, title, message, duration, dismissible, action } = toast;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-dismiss logic
  useEffect(() => {
    if (duration && duration !== Infinity && !isHovered) {
      timerRef.current = setTimeout(() => {
        onRemove(id);
      }, duration);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [id, duration, onRemove, isHovered]);

  // Pause timer on hover
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
    loading: <Loader2 className="h-5 w-5 text-violet-500 animate-spin" />,
  };

  const backgrounds = {
    success: "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/50",
    error: "bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800/50",
    warning: "bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800/50",
    info: "bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800/50",
    loading: "bg-violet-50 dark:bg-violet-950/50 border-violet-200 dark:border-violet-800/50",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "pointer-events-auto w-80 max-w-[calc(100vw-2rem)]",
        "rounded-lg border shadow-lg backdrop-blur-sm",
        backgrounds[type]
      )}
      role="alert"
      aria-live={type === "error" ? "assertive" : "polite"}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground text-sm">{title}</p>
          {message && (
            <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className="mt-2 text-sm font-medium text-violet-600 dark:text-violet-400 hover:underline"
            >
              {action.label}
            </button>
          )}
        </div>

        {/* Close button */}
        {dismissible && (
          <button
            onClick={() => onRemove(id)}
            className="flex-shrink-0 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Progress bar for timed toasts */}
      {duration && duration !== Infinity && !isHovered && (
        <motion.div
          className="h-1 bg-current opacity-20 rounded-b-lg origin-left"
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: duration / 1000, ease: "linear" }}
        />
      )}
    </motion.div>
  );
}

// =============================================================================
// STANDALONE TOAST FUNCTIONS (for use outside React components)
// =============================================================================

let toastFunctions: ToastContextValue | null = null;

export function setToastFunctions(fns: ToastContextValue) {
  toastFunctions = fns;
}

/**
 * Standalone toast function for use outside components
 * Note: Must be used after ToastProvider is mounted
 */
export const toast = {
  success: (title: string, message?: string) => {
    if (!toastFunctions) {
      console.warn("Toast not initialized. Wrap your app in ToastProvider.");
      return "";
    }
    return toastFunctions.success(title, message);
  },
  error: (title: string, message?: string) => {
    if (!toastFunctions) {
      console.warn("Toast not initialized. Wrap your app in ToastProvider.");
      return "";
    }
    return toastFunctions.error(title, message);
  },
  warning: (title: string, message?: string) => {
    if (!toastFunctions) {
      console.warn("Toast not initialized. Wrap your app in ToastProvider.");
      return "";
    }
    return toastFunctions.warning(title, message);
  },
  info: (title: string, message?: string) => {
    if (!toastFunctions) {
      console.warn("Toast not initialized. Wrap your app in ToastProvider.");
      return "";
    }
    return toastFunctions.info(title, message);
  },
  loading: (title: string, message?: string) => {
    if (!toastFunctions) {
      console.warn("Toast not initialized. Wrap your app in ToastProvider.");
      return "";
    }
    return toastFunctions.loading(title, message);
  },
  dismiss: (id: string) => {
    toastFunctions?.removeToast(id);
  },
  clearAll: () => {
    toastFunctions?.clearToasts();
  },
};

// =============================================================================
// TOAST INITIALIZER COMPONENT
// =============================================================================

/**
 * Component to initialize standalone toast functions
 * Place inside ToastProvider
 */
export function ToastInitializer() {
  const toastContext = useToast();

  useEffect(() => {
    setToastFunctions(toastContext);
  }, [toastContext]);

  return null;
}

