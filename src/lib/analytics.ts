/**
 * Simple Analytics Tracking
 *
 * Stores user events in localStorage for usage tracking.
 * Can be extended to integrate with external services later.
 */

// =============================================================================
// TYPES
// =============================================================================

export interface AnalyticsEvent {
  id: string;
  name: string;
  data?: Record<string, unknown>;
  timestamp: string;
  sessionId: string;
}

export interface AnalyticsStats {
  totalCrawls: number;
  completedCrawls: number;
  failedCrawls: number;
  totalWebsites: number;
  totalPagesAnalyzed: number;
  averagePagesPerCrawl: number;
  tabViews: Record<string, number>;
  exports: Record<string, number>;
  lastCrawlDate: string | null;
  firstEventDate: string | null;
  totalEvents: number;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const STORAGE_KEY = "wap_analytics";
const SESSION_KEY = "wap_session_id";
const MAX_EVENTS = 1000; // Limit stored events to prevent localStorage overflow

// Event names
export const EVENTS = {
  // Crawl events
  CRAWL_STARTED: "crawl_started",
  CRAWL_COMPLETED: "crawl_completed",
  CRAWL_FAILED: "crawl_failed",
  CRAWL_CANCELLED: "crawl_cancelled",

  // Navigation events
  TAB_VIEWED: "tab_viewed",
  PAGE_VIEWED: "page_viewed",
  DASHBOARD_OPENED: "dashboard_opened",

  // Action events
  EXPORT_CLICKED: "export_clicked",
  SHARE_CLICKED: "share_clicked",
  WEBSITE_DELETED: "website_deleted",
  WEBSITE_SELECTED: "website_selected",

  // UI events
  THEME_CHANGED: "theme_changed",
  EXAMPLE_CLICKED: "example_clicked",
  ERROR_OCCURRED: "error_occurred",
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get or create session ID
 */
function getSessionId(): string {
  if (typeof window === "undefined") return "server";

  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = generateId();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

/**
 * Check if we're in a browser environment
 */
function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

// =============================================================================
// STORAGE FUNCTIONS
// =============================================================================

/**
 * Get all stored events
 */
function getStoredEvents(): AnalyticsEvent[] {
  if (!isBrowser()) return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn("Failed to read analytics:", error);
    return [];
  }
}

/**
 * Save events to storage
 */
function saveEvents(events: AnalyticsEvent[]): void {
  if (!isBrowser()) return;

  try {
    // Limit stored events
    const limitedEvents = events.slice(-MAX_EVENTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedEvents));
  } catch (error) {
    console.warn("Failed to save analytics:", error);
  }
}

// =============================================================================
// MAIN TRACKING FUNCTIONS
// =============================================================================

/**
 * Track an event
 *
 * @param eventName - Name of the event (use EVENTS constants)
 * @param data - Optional data associated with the event
 *
 * @example
 * ```ts
 * trackEvent(EVENTS.CRAWL_STARTED, { url: 'https://example.com' });
 * trackEvent(EVENTS.TAB_VIEWED, { tab: 'overview' });
 * ```
 */
export function trackEvent(
  eventName: EventName | string,
  data?: Record<string, unknown>
): void {
  if (!isBrowser()) return;

  const event: AnalyticsEvent = {
    id: generateId(),
    name: eventName,
    data,
    timestamp: new Date().toISOString(),
    sessionId: getSessionId(),
  };

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log(
      `📊 Analytics: ${eventName}`,
      data ? data : ""
    );
  }

  // Store event
  const events = getStoredEvents();
  events.push(event);
  saveEvents(events);
}

/**
 * Get all tracked events
 */
export function getEvents(): AnalyticsEvent[] {
  return getStoredEvents();
}

/**
 * Get events filtered by name
 */
export function getEventsByName(eventName: string): AnalyticsEvent[] {
  return getStoredEvents().filter((e) => e.name === eventName);
}

/**
 * Get events from the last N days
 */
export function getRecentEvents(days: number = 7): AnalyticsEvent[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return getStoredEvents().filter(
    (e) => new Date(e.timestamp) >= cutoff
  );
}

/**
 * Clear all analytics data
 */
export function clearAnalytics(): void {
  if (!isBrowser()) return;

  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log("📊 Analytics cleared");
  } catch (error) {
    console.warn("Failed to clear analytics:", error);
  }
}

// =============================================================================
// STATISTICS
// =============================================================================

/**
 * Get usage statistics
 *
 * @returns Analytics statistics object
 *
 * @example
 * ```ts
 * const stats = getAnalytics();
 * console.log(`Total crawls: ${stats.totalCrawls}`);
 * ```
 */
export function getAnalytics(): AnalyticsStats {
  const events = getStoredEvents();

  // Count crawl events
  const crawlStarted = events.filter((e) => e.name === EVENTS.CRAWL_STARTED);
  const crawlCompleted = events.filter((e) => e.name === EVENTS.CRAWL_COMPLETED);
  const crawlFailed = events.filter((e) => e.name === EVENTS.CRAWL_FAILED);

  // Calculate total pages analyzed
  const totalPagesAnalyzed = crawlCompleted.reduce((sum, e) => {
    const pages = (e.data?.pages as number) || (e.data?.pageCount as number) || 0;
    return sum + pages;
  }, 0);

  // Average pages per crawl
  const averagePagesPerCrawl =
    crawlCompleted.length > 0
      ? Math.round(totalPagesAnalyzed / crawlCompleted.length)
      : 0;

  // Count tab views
  const tabViews: Record<string, number> = {};
  events
    .filter((e) => e.name === EVENTS.TAB_VIEWED)
    .forEach((e) => {
      const tab = (e.data?.tab as string) || "unknown";
      tabViews[tab] = (tabViews[tab] || 0) + 1;
    });

  // Count exports
  const exports: Record<string, number> = {};
  events
    .filter((e) => e.name === EVENTS.EXPORT_CLICKED)
    .forEach((e) => {
      const format = (e.data?.format as string) || "unknown";
      exports[format] = (exports[format] || 0) + 1;
    });

  // Get unique websites (from crawl completed events)
  const uniqueWebsites = new Set(
    crawlCompleted.map((e) => e.data?.url || e.data?.websiteId)
  );

  // Get dates
  const lastCrawl = crawlCompleted.length > 0
    ? crawlCompleted[crawlCompleted.length - 1].timestamp
    : null;

  const firstEvent = events.length > 0 ? events[0].timestamp : null;

  return {
    totalCrawls: crawlStarted.length,
    completedCrawls: crawlCompleted.length,
    failedCrawls: crawlFailed.length,
    totalWebsites: uniqueWebsites.size,
    totalPagesAnalyzed,
    averagePagesPerCrawl,
    tabViews,
    exports,
    lastCrawlDate: lastCrawl,
    firstEventDate: firstEvent,
    totalEvents: events.length,
  };
}

// =============================================================================
// CONVENIENCE TRACKING FUNCTIONS
// =============================================================================

/**
 * Track crawl started
 */
export function trackCrawlStarted(url: string): void {
  trackEvent(EVENTS.CRAWL_STARTED, { url });
}

/**
 * Track crawl completed
 */
export function trackCrawlCompleted(
  url: string,
  pageCount: number,
  duration?: number
): void {
  trackEvent(EVENTS.CRAWL_COMPLETED, {
    url,
    pageCount,
    duration,
  });
}

/**
 * Track crawl failed
 */
export function trackCrawlFailed(url: string, error: string): void {
  trackEvent(EVENTS.CRAWL_FAILED, { url, error });
}

/**
 * Track tab view
 */
export function trackTabViewed(tab: string, websiteId?: string): void {
  trackEvent(EVENTS.TAB_VIEWED, { tab, websiteId });
}

/**
 * Track export action
 */
export function trackExportClicked(format: string, websiteName?: string): void {
  trackEvent(EVENTS.EXPORT_CLICKED, { format, websiteName });
}

/**
 * Track website deleted
 */
export function trackWebsiteDeleted(websiteId: string, websiteName?: string): void {
  trackEvent(EVENTS.WEBSITE_DELETED, { websiteId, websiteName });
}

/**
 * Track page view
 */
export function trackPageViewed(page: string): void {
  trackEvent(EVENTS.PAGE_VIEWED, { page });
}

/**
 * Track error
 */
export function trackError(error: string, context?: string): void {
  trackEvent(EVENTS.ERROR_OCCURRED, { error, context });
}

// =============================================================================
// DEBUG UTILITIES
// =============================================================================

/**
 * Get analytics summary for debugging
 */
export function getAnalyticsSummary(): string {
  const stats = getAnalytics();
  const events = getStoredEvents();

  return `
📊 Analytics Summary
═══════════════════════════════════════

Crawls
  Total Started:    ${stats.totalCrawls}
  Completed:        ${stats.completedCrawls}
  Failed:           ${stats.failedCrawls}
  Success Rate:     ${stats.totalCrawls > 0 ? Math.round((stats.completedCrawls / stats.totalCrawls) * 100) : 0}%

Pages Analyzed
  Total Pages:      ${stats.totalPagesAnalyzed.toLocaleString()}
  Average/Crawl:    ${stats.averagePagesPerCrawl}

Tab Views
${Object.entries(stats.tabViews)
    .map(([tab, count]) => `  ${tab}: ${count}`)
    .join("\n") || "  No tab views recorded"}

Exports
${Object.entries(stats.exports)
    .map(([format, count]) => `  ${format}: ${count}`)
    .join("\n") || "  No exports recorded"}

Timeline
  First Event:      ${stats.firstEventDate ? new Date(stats.firstEventDate).toLocaleString() : "N/A"}
  Last Crawl:       ${stats.lastCrawlDate ? new Date(stats.lastCrawlDate).toLocaleString() : "N/A"}
  Total Events:     ${stats.totalEvents}

Recent Events (Last 5)
${events
    .slice(-5)
    .reverse()
    .map((e) => `  [${new Date(e.timestamp).toLocaleTimeString()}] ${e.name}`)
    .join("\n") || "  No events recorded"}
═══════════════════════════════════════
  `.trim();
}

/**
 * Print analytics to console (for debugging)
 */
export function debugAnalytics(): void {
  console.log(getAnalyticsSummary());
}

// Export for window access in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as unknown as Record<string, unknown>).analytics = {
    track: trackEvent,
    getStats: getAnalytics,
    getEvents,
    clear: clearAnalytics,
    debug: debugAnalytics,
    summary: getAnalyticsSummary,
  };
}

