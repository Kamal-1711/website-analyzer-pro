import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// =============================================================================
// CLASSNAME UTILITIES
// =============================================================================

/**
 * Merges class names using clsx and tailwind-merge
 * Handles conditional classes and resolves Tailwind CSS conflicts
 *
 * @param inputs - Class values to merge (strings, objects, arrays)
 * @returns Merged className string with resolved conflicts
 *
 * @example
 * ```ts
 * cn("px-4 py-2", "px-6") // => "px-6 py-2"
 * cn("text-red-500", isActive && "text-blue-500")
 * cn(["base-class", "another"], { "conditional": true })
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// =============================================================================
// URL UTILITIES
// =============================================================================

/**
 * Extracts the domain name from a full URL
 *
 * @param url - Full URL string (e.g., "https://tsm.ac.in/path")
 * @returns Domain name without protocol or path (e.g., "tsm.ac.in")
 *
 * @example
 * ```ts
 * getWebsiteNameFromUrl("https://tsm.ac.in/path") // => "tsm.ac.in"
 * getWebsiteNameFromUrl("http://www.example.com") // => "www.example.com"
 * getWebsiteNameFromUrl("invalid-url") // => "invalid-url"
 * ```
 */
export function getWebsiteNameFromUrl(url: string): string {
  try {
    // Handle URLs without protocol
    const urlWithProtocol = url.startsWith("http") ? url : `https://${url}`;
    const urlObj = new URL(urlWithProtocol);
    return urlObj.hostname;
  } catch {
    // If URL parsing fails, try to extract domain manually
    const match = url.match(/(?:https?:\/\/)?([^\/\s]+)/);
    return match ? match[1] : url;
  }
}

/**
 * Normalizes a URL by ensuring it has a protocol
 *
 * @param url - URL string that may or may not have a protocol
 * @returns URL with https:// protocol
 *
 * @example
 * ```ts
 * normalizeUrl("example.com") // => "https://example.com"
 * normalizeUrl("http://example.com") // => "http://example.com"
 * ```
 */
export function normalizeUrl(url: string): string {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`;
  }
  return url;
}

// =============================================================================
// DATE UTILITIES
// =============================================================================

/**
 * Formats a date into a human-readable string
 * Returns contextual formats like "Today 2:30 PM", "Yesterday", or "Dec 25"
 *
 * @param date - Date object or timestamp to format
 * @returns Formatted date string
 *
 * @example
 * ```ts
 * formatDate(new Date()) // => "Today 2:30 PM"
 * formatDate(yesterdayDate) // => "Yesterday"
 * formatDate(olderDate) // => "Dec 25"
 * formatDate(lastYearDate) // => "Dec 25, 2023"
 * ```
 */
export function formatDate(date: Date | string | number): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();

  // Get dates without time for comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const inputDate = new Date(
    dateObj.getFullYear(),
    dateObj.getMonth(),
    dateObj.getDate()
  );

  // Format time as "2:30 PM"
  const timeStr = dateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // Check if today
  if (inputDate.getTime() === today.getTime()) {
    return `Today ${timeStr}`;
  }

  // Check if yesterday
  if (inputDate.getTime() === yesterday.getTime()) {
    return `Yesterday ${timeStr}`;
  }

  // Check if same year
  if (dateObj.getFullYear() === now.getFullYear()) {
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  // Different year - include year
  return dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Formats a date as a relative time string (e.g., "2 hours ago")
 *
 * @param date - Date to format
 * @returns Relative time string
 *
 * @example
 * ```ts
 * formatRelativeTime(new Date(Date.now() - 60000)) // => "1 minute ago"
 * formatRelativeTime(new Date(Date.now() - 3600000)) // => "1 hour ago"
 * ```
 */
export function formatRelativeTime(date: Date | string | number): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return "Just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  }

  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }

  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  }

  return formatDate(dateObj);
}

// =============================================================================
// ID GENERATION
// =============================================================================

/**
 * Generates a unique identifier string
 * Uses a combination of timestamp and random characters for uniqueness
 *
 * @param prefix - Optional prefix for the ID (e.g., "msg", "ws", "crawl")
 * @returns Unique ID string
 *
 * @example
 * ```ts
 * generateId() // => "k7x9m2p4q1"
 * generateId("msg") // => "msg_k7x9m2p4q1"
 * generateId("ws") // => "ws_a3b5c7d9e1"
 * ```
 */
export function generateId(prefix?: string): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  const id = `${timestamp}${randomPart}`;
  return prefix ? `${prefix}_${id}` : id;
}

// =============================================================================
// FORMATTING UTILITIES
// =============================================================================

/**
 * Formats crawl progress as a readable string with thousands separators
 *
 * @param current - Current number of pages crawled
 * @param total - Total number of pages to crawl
 * @returns Formatted progress string
 *
 * @example
 * ```ts
 * formatCrawlProgress(245, 1245) // => "245 / 1,245 pages"
 * formatCrawlProgress(1, 1) // => "1 / 1 page"
 * formatCrawlProgress(0, 100) // => "0 / 100 pages"
 * ```
 */
export function formatCrawlProgress(current: number, total: number): string {
  const formattedCurrent = current.toLocaleString("en-US");
  const formattedTotal = total.toLocaleString("en-US");
  const pageLabel = total === 1 ? "page" : "pages";
  return `${formattedCurrent} / ${formattedTotal} ${pageLabel}`;
}

/**
 * Formats a number with thousands separators
 *
 * @param num - Number to format
 * @returns Formatted number string
 *
 * @example
 * ```ts
 * formatNumber(1234567) // => "1,234,567"
 * ```
 */
export function formatNumber(num: number): string {
  return num.toLocaleString("en-US");
}

/**
 * Formats bytes into human-readable size
 *
 * @param bytes - Number of bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted size string
 *
 * @example
 * ```ts
 * formatBytes(1024) // => "1 KB"
 * formatBytes(1234567) // => "1.18 MB"
 * ```
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Formats milliseconds into human-readable duration
 *
 * @param ms - Duration in milliseconds
 * @returns Formatted duration string
 *
 * @example
 * ```ts
 * formatDuration(1500) // => "1.5s"
 * formatDuration(65000) // => "1m 5s"
 * formatDuration(3665000) // => "1h 1m"
 * ```
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }

  if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  }

  return `${(ms / 1000).toFixed(1)}s`;
}

/**
 * Formats a percentage value
 *
 * @param value - Decimal value (0-1) or percentage (0-100)
 * @param isDecimal - Whether the input is a decimal (default: false)
 * @returns Formatted percentage string
 *
 * @example
 * ```ts
 * formatPercentage(85) // => "85%"
 * formatPercentage(0.85, true) // => "85%"
 * ```
 */
export function formatPercentage(
  value: number,
  isDecimal: boolean = false
): string {
  const percentage = isDecimal ? value * 100 : value;
  return `${Math.round(percentage)}%`;
}

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

/**
 * Validates if a string is a valid URL
 *
 * @param url - String to validate
 * @returns True if valid URL, false otherwise
 *
 * @example
 * ```ts
 * isValidUrl("https://example.com") // => true
 * isValidUrl("not a url") // => false
 * ```
 */
export function isValidUrl(url: string): boolean {
  try {
    const urlWithProtocol = url.startsWith("http") ? url : `https://${url}`;
    new URL(urlWithProtocol);
    return true;
  } catch {
    return false;
  }
}

// =============================================================================
// STRING UTILITIES
// =============================================================================

/**
 * Truncates a string to a maximum length with ellipsis
 *
 * @param str - String to truncate
 * @param maxLength - Maximum length including ellipsis
 * @returns Truncated string
 *
 * @example
 * ```ts
 * truncate("Hello World", 8) // => "Hello..."
 * truncate("Hi", 10) // => "Hi"
 * ```
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
}

/**
 * Capitalizes the first letter of a string
 *
 * @param str - String to capitalize
 * @returns Capitalized string
 *
 * @example
 * ```ts
 * capitalize("hello") // => "Hello"
 * ```
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts a string to title case
 *
 * @param str - String to convert
 * @returns Title-cased string
 *
 * @example
 * ```ts
 * toTitleCase("hello world") // => "Hello World"
 * ```
 */
export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => capitalize(word))
    .join(" ");
}

// =============================================================================
// SCORE UTILITIES
// =============================================================================

/**
 * Returns a color class based on a score value
 *
 * @param score - Score from 0-100
 * @returns Tailwind color class
 *
 * @example
 * ```ts
 * getScoreColor(90) // => "text-green-500"
 * getScoreColor(70) // => "text-yellow-500"
 * getScoreColor(40) // => "text-red-500"
 * ```
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-yellow-500";
  return "text-red-500";
}

/**
 * Returns a background color class based on a score value
 *
 * @param score - Score from 0-100
 * @returns Tailwind background color class
 */
export function getScoreBgColor(score: number): string {
  if (score >= 80) return "bg-green-500/10";
  if (score >= 60) return "bg-yellow-500/10";
  return "bg-red-500/10";
}

/**
 * Returns a label based on a score value
 *
 * @param score - Score from 0-100
 * @returns Score label
 */
export function getScoreLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Good";
  if (score >= 60) return "Fair";
  if (score >= 40) return "Poor";
  return "Critical";
}
