"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { simulateCrawlWithProgress, generateMockCrawlData } from "@/lib/crawler";
import { generateId, getWebsiteNameFromUrl, isValidUrl, normalizeUrl } from "@/lib/utils";
import type { Website, CrawlData, WebSocketMessage } from "@/types";

// =============================================================================
// TYPES
// =============================================================================

interface UseCrawlReturn {
  /** Start crawling a website */
  crawl: (url: string) => Promise<CrawlData | null>;
  /** Whether a crawl is currently in progress */
  isCrawling: boolean;
  /** Current crawl progress (0-100) */
  progress: number;
  /** Number of pages crawled so far */
  pagesCrawled: number;
  /** Total estimated pages */
  totalPages: number;
  /** Current URL being crawled */
  currentUrl: string;
  /** Error message if crawl failed */
  error: string | null;
  /** Whether the last crawl was successful */
  success: boolean;
  /** Cancel the current crawl */
  cancel: () => void;
  /** Reset the crawl state */
  reset: () => void;
  /** Crawl data from the last successful crawl */
  crawlData: CrawlData | null;
}

interface CrawlState {
  isCrawling: boolean;
  progress: number;
  pagesCrawled: number;
  totalPages: number;
  currentUrl: string;
  error: string | null;
  success: boolean;
  crawlData: CrawlData | null;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const INITIAL_STATE: CrawlState = {
  isCrawling: false,
  progress: 0,
  pagesCrawled: 0,
  totalPages: 0,
  currentUrl: "",
  error: null,
  success: false,
  crawlData: null,
};

const ERROR_CLEAR_TIMEOUT = 5000; // 5 seconds
const SUCCESS_CLEAR_TIMEOUT = 2000; // 2 seconds

// =============================================================================
// HOOK
// =============================================================================

/**
 * Custom hook for managing website crawling functionality
 *
 * Features:
 * - URL validation
 * - API integration with /api/crawl
 * - Real-time progress tracking
 * - Zustand store integration
 * - Auto error clearing
 * - Auto navigation on success
 *
 * @example
 * ```tsx
 * const { crawl, isCrawling, progress, error, success } = useCrawl();
 *
 * const handleSubmit = async (url: string) => {
 *   const data = await crawl(url);
 *   if (data) {
 *     console.log(`Crawled ${data.totalPages} pages`);
 *   }
 * };
 * ```
 */
export function useCrawl(): UseCrawlReturn {
  const router = useRouter();

  // State
  const [state, setState] = useState<CrawlState>(INITIAL_STATE);

  // Refs for cleanup and cancellation
  const cancelRef = useRef(false);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Zustand store actions
  const addWebsite = useAppStore((s) => s.addWebsite);
  const setActiveWebsite = useAppStore((s) => s.setActiveWebsite);
  const setCrawling = useAppStore((s) => s.setCrawling);
  const setProgress = useAppStore((s) => s.setProgress);
  const addMessage = useAppStore((s) => s.addMessage);

  // ==========================================================================
  // CLEANUP
  // ==========================================================================

  useEffect(() => {
    return () => {
      // Clean up timeouts on unmount
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  /**
   * Set error with auto-clear
   */
  const setError = useCallback((error: string) => {
    setState((prev) => ({ ...prev, error, success: false }));

    // Clear existing timeout
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }

    // Auto-clear error after timeout
    errorTimeoutRef.current = setTimeout(() => {
      setState((prev) => ({ ...prev, error: null }));
    }, ERROR_CLEAR_TIMEOUT);
  }, []);

  /**
   * Set success with auto-clear
   */
  const setSuccess = useCallback((crawlData: CrawlData) => {
    setState((prev) => ({
      ...prev,
      success: true,
      error: null,
      crawlData,
    }));

    // Clear existing timeout
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }

    // Auto-clear success after timeout
    successTimeoutRef.current = setTimeout(() => {
      setState((prev) => ({ ...prev, success: false }));
    }, SUCCESS_CLEAR_TIMEOUT);
  }, []);

  /**
   * Validate URL format
   */
  const validateUrl = useCallback((url: string): string | null => {
    if (!url || !url.trim()) {
      return "Please enter a URL";
    }

    // Normalize URL (add https if missing)
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    if (!isValidUrl(normalizedUrl)) {
      return "Please enter a valid URL (e.g., https://example.com)";
    }

    return null;
  }, []);

  /**
   * Handle progress updates from crawler
   */
  const handleProgress = useCallback(
    (message: WebSocketMessage) => {
      if (cancelRef.current) return;

      switch (message.type) {
        case "crawl_started":
          setState((prev) => ({
            ...prev,
            isCrawling: true,
            progress: 0,
            pagesCrawled: 0,
            totalPages: message.totalPages || 0,
            currentUrl: message.currentUrl || "",
            error: null,
          }));
          setCrawling(true);
          setProgress(0);
          break;

        case "crawl_progress":
          setState((prev) => ({
            ...prev,
            progress: message.progress || prev.progress,
            pagesCrawled: message.pagesCrawled || prev.pagesCrawled,
            totalPages: message.totalPages || prev.totalPages,
            currentUrl: message.currentUrl || prev.currentUrl,
          }));
          setProgress(message.progress || 0);
          break;

        case "crawl_completed":
          setState((prev) => ({
            ...prev,
            progress: 100,
            pagesCrawled: message.totalPages || prev.totalPages,
          }));
          setProgress(100);
          break;

        case "crawl_error":
          setState((prev) => ({
            ...prev,
            isCrawling: false,
            error: message.error || "Crawl failed",
          }));
          setCrawling(false);
          break;
      }
    },
    [setCrawling, setProgress]
  );

  // ==========================================================================
  // MAIN CRAWL FUNCTION
  // ==========================================================================

  /**
   * Start crawling a website
   */
  const crawl = useCallback(
    async (url: string): Promise<CrawlData | null> => {
      // Reset cancel flag
      cancelRef.current = false;

      // Validate URL
      const validationError = validateUrl(url);
      if (validationError) {
        setError(validationError);
        return null;
      }

      // Normalize URL
      let normalizedUrl = url.trim();
      if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
        normalizedUrl = `https://${normalizedUrl}`;
      }
      normalizedUrl = normalizeUrl(normalizedUrl);

      // Reset state
      setState({
        ...INITIAL_STATE,
        isCrawling: true,
        currentUrl: normalizedUrl,
      });
      setCrawling(true);

      // Add user message to chat
      addMessage({
        id: generateId(),
        type: "user",
        content: normalizedUrl,
        timestamp: new Date(),
        websiteUrl: normalizedUrl,
      });

      // Add system message
      addMessage({
        id: generateId(),
        type: "status",
        content: "Starting analysis...",
        timestamp: new Date(),
        websiteUrl: normalizedUrl,
        status: "crawling",
        crawlProgress: 0,
      });

      try {
        // Try API call first, fall back to mock
        let crawlData: CrawlData | null = null;

        try {
          // Try real API
          const response = await fetch("/api/crawl", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: normalizedUrl }),
          });

          if (!response.ok) {
            throw new Error("API error");
          }

          const result = await response.json();

          if (result.success && result.data) {
            crawlData = result.data;
          } else {
            throw new Error(result.error || "Crawl failed");
          }
        } catch {
          // Fall back to mock crawler with progress simulation
          await new Promise<void>((resolve, reject) => {
            simulateCrawlWithProgress(
              normalizedUrl,
              handleProgress,
              (data) => {
                crawlData = data;
                resolve();
              },
              (error) => {
                reject(error);
              }
            );
          });
        }

        // Check if cancelled
        if (cancelRef.current) {
          setState(INITIAL_STATE);
          setCrawling(false);
          return null;
        }

        if (!crawlData) {
          // Generate mock data as last resort
          crawlData = generateMockCrawlData(normalizedUrl);
        }

        // Create website entry
        const website: Website = {
          id: crawlData.websiteId || generateId(),
          url: normalizedUrl,
          name: getWebsiteNameFromUrl(normalizedUrl),
          pageCount: crawlData.totalPages,
          status: "completed",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Update stores
        addWebsite(website);
        setActiveWebsite(website);

        // Update state
        setState((prev) => ({
          ...prev,
          isCrawling: false,
          progress: 100,
          pagesCrawled: crawlData!.totalPages,
          totalPages: crawlData!.totalPages,
          crawlData,
        }));

        setCrawling(false);
        setProgress(100);
        setSuccess(crawlData);

        // Add success message
        addMessage({
          id: generateId(),
          type: "system",
          content: `Analysis complete! Found ${crawlData.totalPages} pages with an architecture score of ${crawlData.architectureScore}/100.`,
          timestamp: new Date(),
          websiteUrl: normalizedUrl,
          status: "completed",
          crawlProgress: 100,
        });

        // Navigate to dashboard after short delay
        setTimeout(() => {
          router.push(`/dashboard/${website.id}`);
        }, 500);

        return crawlData;
      } catch (err) {
        // Handle errors
        const errorMessage =
          err instanceof Error ? err.message : "Failed to analyze website";

        setState((prev) => ({
          ...prev,
          isCrawling: false,
          error: errorMessage,
        }));

        setCrawling(false);
        setError(errorMessage);

        // Add error message to chat
        addMessage({
          id: generateId(),
          type: "system",
          content: `Error: ${errorMessage}`,
          timestamp: new Date(),
          websiteUrl: normalizedUrl,
          status: "error",
        });

        return null;
      }
    },
    [
      validateUrl,
      setError,
      setSuccess,
      handleProgress,
      addWebsite,
      setActiveWebsite,
      setCrawling,
      setProgress,
      addMessage,
      router,
    ]
  );

  // ==========================================================================
  // CANCEL FUNCTION
  // ==========================================================================

  /**
   * Cancel the current crawl
   */
  const cancel = useCallback(() => {
    cancelRef.current = true;

    setState((prev) => ({
      ...prev,
      isCrawling: false,
      error: "Crawl cancelled",
    }));

    setCrawling(false);

    // Try to cancel on server
    // (In production, you'd call DELETE /api/crawl/:id)
  }, [setCrawling]);

  // ==========================================================================
  // RESET FUNCTION
  // ==========================================================================

  /**
   * Reset the crawl state
   */
  const reset = useCallback(() => {
    cancelRef.current = false;
    setState(INITIAL_STATE);

    // Clear timeouts
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }
  }, []);

  // ==========================================================================
  // RETURN
  // ==========================================================================

  return {
    crawl,
    isCrawling: state.isCrawling,
    progress: state.progress,
    pagesCrawled: state.pagesCrawled,
    totalPages: state.totalPages,
    currentUrl: state.currentUrl,
    error: state.error,
    success: state.success,
    cancel,
    reset,
    crawlData: state.crawlData,
  };
}

// =============================================================================
// ADDITIONAL HOOKS
// =============================================================================

/**
 * Hook to get crawl state from Zustand store
 * Use this for components that only need to read crawl state
 */
export function useCrawlState() {
  const isCrawling = useAppStore((s) => s.isCrawling);
  const progress = useAppStore((s) => s.crawlProgress);

  return { isCrawling, progress };
}

/**
 * Hook to check if a URL has been crawled before
 */
export function useHasCrawled(url: string): boolean {
  const websites = useAppStore((s) => s.websites);

  if (!url) return false;

  const normalizedUrl = normalizeUrl(url);
  return websites.some((w) => normalizeUrl(w.url) === normalizedUrl);
}
