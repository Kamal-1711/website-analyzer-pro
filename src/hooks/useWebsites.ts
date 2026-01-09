"use client";

import { useCallback, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import type { Website } from "@/types";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Group label for website categorization by date
 */
export type WebsiteGroupLabel = "Today" | "Yesterday" | "This Week" | "This Month" | "Earlier";

/**
 * A group of websites with a label and list
 */
export interface WebsiteGroup {
  /** Group label (e.g., "Today", "Yesterday") */
  label: WebsiteGroupLabel;
  /** Websites in this group */
  websites: Website[];
}

/**
 * Return type for useWebsites hook
 */
export interface UseWebsitesReturn {
  /** All websites in the store */
  websites: Website[];
  /** Currently selected/active website */
  activeWebsite: Website | null;
  /** Websites sorted by date (newest first) */
  sortedWebsites: Website[];
  /** Websites grouped by date */
  groupedWebsites: WebsiteGroup[];
  /** Select/set active website */
  selectWebsite: (website: Website | null) => void;
  /** Delete a website by ID */
  deleteWebsite: (id: string) => void;
  /** Add a new website */
  addWebsite: (website: Website) => void;
  /** Update an existing website */
  updateWebsite: (id: string, updates: Partial<Website>) => void;
  /** Clear all websites */
  clearAll: () => void;
  /** Get a website by ID */
  getWebsite: (id: string) => Website | null;
  /** Check if a URL has been analyzed */
  hasWebsite: (url: string) => boolean;
  /** Get website count */
  count: number;
  /** Check if there are any websites */
  isEmpty: boolean;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get the start of today (midnight)
 */
function getStartOfDay(date: Date): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

/**
 * Get the start of this week (Sunday)
 */
function getStartOfWeek(date: Date): Date {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day;
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

/**
 * Get the start of this month
 */
function getStartOfMonth(date: Date): Date {
  const start = new Date(date);
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  return start;
}

/**
 * Determine which group a date belongs to
 */
function getDateGroup(date: Date): WebsiteGroupLabel {
  const now = new Date();
  const startOfToday = getStartOfDay(now);
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfWeek = getStartOfWeek(now);
  const startOfMonth = getStartOfMonth(now);

  const websiteDate = new Date(date);

  if (websiteDate >= startOfToday) {
    return "Today";
  } else if (websiteDate >= startOfYesterday) {
    return "Yesterday";
  } else if (websiteDate >= startOfWeek) {
    return "This Week";
  } else if (websiteDate >= startOfMonth) {
    return "This Month";
  } else {
    return "Earlier";
  }
}

/**
 * Sort websites by date (newest first)
 *
 * @param websites - Array of websites to sort
 * @returns Sorted array (does not mutate original)
 *
 * @example
 * ```ts
 * const sorted = sortWebsitesByDate(websites);
 * // sorted[0] is the most recently updated website
 * ```
 */
export function sortWebsitesByDate(websites: Website[]): Website[] {
  return [...websites].sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt);
    const dateB = new Date(b.updatedAt || b.createdAt);
    return dateB.getTime() - dateA.getTime();
  });
}

/**
 * Group websites by date category
 *
 * @param websites - Array of websites to group
 * @returns Array of groups with labels and websites
 *
 * @example
 * ```ts
 * const groups = groupWebsitesByDate(websites);
 * // [
 * //   { label: "Today", websites: [...] },
 * //   { label: "Yesterday", websites: [...] },
 * //   { label: "This Week", websites: [...] },
 * //   { label: "Earlier", websites: [...] }
 * // ]
 * ```
 */
export function groupWebsitesByDate(websites: Website[]): WebsiteGroup[] {
  const sorted = sortWebsitesByDate(websites);

  const groupMap = new Map<WebsiteGroupLabel, Website[]>();
  const groupOrder: WebsiteGroupLabel[] = ["Today", "Yesterday", "This Week", "This Month", "Earlier"];

  // Initialize groups
  groupOrder.forEach((label) => groupMap.set(label, []));

  // Assign websites to groups
  sorted.forEach((website) => {
    const date = new Date(website.updatedAt || website.createdAt);
    const group = getDateGroup(date);
    groupMap.get(group)?.push(website);
  });

  // Build result array (only non-empty groups)
  const result: WebsiteGroup[] = [];
  groupOrder.forEach((label) => {
    const websites = groupMap.get(label);
    if (websites && websites.length > 0) {
      result.push({ label, websites });
    }
  });

  return result;
}

/**
 * Normalize URL for comparison
 */
function normalizeUrlForComparison(url: string): string {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return `${parsed.hostname}${parsed.pathname}`.toLowerCase().replace(/\/$/, "");
  } catch {
    return url.toLowerCase();
  }
}

// =============================================================================
// MAIN HOOK
// =============================================================================

/**
 * Custom hook for managing websites
 *
 * Provides access to website list, active website, and CRUD operations.
 * Integrates with Zustand store for persistence.
 *
 * @returns Object containing websites data and management functions
 *
 * @example
 * ```tsx
 * function WebsiteList() {
 *   const {
 *     groupedWebsites,
 *     activeWebsite,
 *     selectWebsite,
 *     deleteWebsite
 *   } = useWebsites();
 *
 *   return (
 *     <div>
 *       {groupedWebsites.map(group => (
 *         <div key={group.label}>
 *           <h3>{group.label}</h3>
 *           {group.websites.map(website => (
 *             <button
 *               key={website.id}
 *               onClick={() => selectWebsite(website)}
 *               className={activeWebsite?.id === website.id ? "active" : ""}
 *             >
 *               {website.name}
 *             </button>
 *           ))}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useWebsites(): UseWebsitesReturn {
  // ==========================================================================
  // STORE ACCESS
  // ==========================================================================

  const websites = useAppStore((state) => state.websites);
  const activeWebsite = useAppStore((state) => state.activeWebsite);
  const storeAddWebsite = useAppStore((state) => state.addWebsite);
  const storeUpdateWebsite = useAppStore((state) => state.updateWebsite);
  const storeDeleteWebsite = useAppStore((state) => state.deleteWebsite);
  const storeSetWebsites = useAppStore((state) => state.setWebsites);
  const setActiveWebsite = useAppStore((state) => state.setActiveWebsite);

  // ==========================================================================
  // MEMOIZED VALUES
  // ==========================================================================

  /**
   * Websites sorted by date (newest first)
   */
  const sortedWebsites = useMemo(() => {
    return sortWebsitesByDate(websites);
  }, [websites]);

  /**
   * Websites grouped by date category
   */
  const groupedWebsites = useMemo(() => {
    return groupWebsitesByDate(websites);
  }, [websites]);

  /**
   * Website count
   */
  const count = useMemo(() => websites.length, [websites]);

  /**
   * Check if empty
   */
  const isEmpty = useMemo(() => websites.length === 0, [websites]);

  // ==========================================================================
  // ACTIONS
  // ==========================================================================

  /**
   * Select/set the active website
   *
   * @param website - Website to set as active, or null to clear
   */
  const selectWebsite = useCallback(
    (website: Website | null) => {
      setActiveWebsite(website);
    },
    [setActiveWebsite]
  );

  /**
   * Delete a website by ID
   *
   * @param id - ID of website to delete
   */
  const deleteWebsite = useCallback(
    (id: string) => {
      // If deleting active website, clear active
      if (activeWebsite?.id === id) {
        setActiveWebsite(null);
      }
      storeDeleteWebsite(id);
    },
    [activeWebsite, setActiveWebsite, storeDeleteWebsite]
  );

  /**
   * Add a new website to the list
   *
   * @param website - Website object to add
   */
  const addWebsite = useCallback(
    (website: Website) => {
      storeAddWebsite(website);
    },
    [storeAddWebsite]
  );

  /**
   * Update an existing website
   *
   * @param id - ID of website to update
   * @param updates - Partial website data to merge
   */
  const updateWebsite = useCallback(
    (id: string, updates: Partial<Website>) => {
      storeUpdateWebsite(id, updates);
    },
    [storeUpdateWebsite]
  );

  /**
   * Clear all websites from the store
   */
  const clearAll = useCallback(() => {
    setActiveWebsite(null);
    storeSetWebsites([]);
  }, [setActiveWebsite, storeSetWebsites]);

  /**
   * Get a website by ID
   *
   * @param id - ID of website to find
   * @returns Website if found, null otherwise
   */
  const getWebsite = useCallback(
    (id: string): Website | null => {
      return websites.find((w) => w.id === id) || null;
    },
    [websites]
  );

  /**
   * Check if a URL has already been analyzed
   *
   * @param url - URL to check
   * @returns true if website exists for this URL
   */
  const hasWebsite = useCallback(
    (url: string): boolean => {
      const normalized = normalizeUrlForComparison(url);
      return websites.some(
        (w) => normalizeUrlForComparison(w.url) === normalized
      );
    },
    [websites]
  );

  // ==========================================================================
  // RETURN
  // ==========================================================================

  return {
    websites,
    activeWebsite,
    sortedWebsites,
    groupedWebsites,
    selectWebsite,
    deleteWebsite,
    addWebsite,
    updateWebsite,
    clearAll,
    getWebsite,
    hasWebsite,
    count,
    isEmpty,
  };
}

// =============================================================================
// SELECTOR HOOKS
// =============================================================================

/**
 * Hook to get only the active website
 * Use for better performance when you only need the active website
 */
export function useActiveWebsite(): Website | null {
  return useAppStore((state) => state.activeWebsite);
}

/**
 * Hook to get website count
 */
export function useWebsiteCount(): number {
  return useAppStore((state) => state.websites.length);
}

/**
 * Hook to check if a specific website exists
 *
 * @param id - Website ID to check
 */
export function useWebsiteExists(id: string): boolean {
  return useAppStore((state) => state.websites.some((w) => w.id === id));
}

/**
 * Hook to get a specific website by ID
 *
 * @param id - Website ID to find
 */
export function useWebsiteById(id: string): Website | null {
  return useAppStore((state) => state.websites.find((w) => w.id === id) || null);
}

// =============================================================================
// UTILITY EXPORTS
// =============================================================================

export { sortWebsitesByDate as formatWebsiteList };
export { groupWebsitesByDate as groupByDate };
