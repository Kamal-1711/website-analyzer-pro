/**
 * Website Crawler Module
 * 
 * This module provides utilities for crawling and analyzing websites.
 * In a production app, heavy crawling would be done server-side.
 */

export interface CrawlOptions {
  maxPages?: number;
  maxDepth?: number;
  followExternalLinks?: boolean;
  respectRobotsTxt?: boolean;
  timeout?: number;
  userAgent?: string;
}

export interface PageData {
  url: string;
  title: string;
  description: string;
  statusCode: number;
  loadTime: number;
  contentType: string;
  size: number;
  links: {
    internal: string[];
    external: string[];
  };
  images: {
    url: string;
    alt: string | null;
    size?: number;
  }[];
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
  meta: {
    title: string | null;
    description: string | null;
    keywords: string | null;
    robots: string | null;
    canonical: string | null;
    ogTitle: string | null;
    ogDescription: string | null;
    ogImage: string | null;
  };
}

export interface CrawlProgress {
  pagesScanned: number;
  totalPages: number;
  currentUrl: string;
  status: "running" | "paused" | "completed" | "error";
  errors: string[];
}

const DEFAULT_OPTIONS: CrawlOptions = {
  maxPages: 100,
  maxDepth: 5,
  followExternalLinks: false,
  respectRobotsTxt: true,
  timeout: 30000,
  userAgent: "WebsiteAnalyzerPro/1.0",
};

/**
 * Validates a URL string
 */
export function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Normalizes a URL for comparison
 */
export function normalizeUrl(urlString: string): string {
  try {
    const url = new URL(urlString);
    // Remove trailing slash, hash, and normalize
    let normalized = `${url.protocol}//${url.host}${url.pathname}`;
    if (normalized.endsWith("/")) {
      normalized = normalized.slice(0, -1);
    }
    return normalized.toLowerCase();
  } catch {
    return urlString.toLowerCase();
  }
}

/**
 * Checks if a URL is internal to the base domain
 */
export function isInternalUrl(url: string, baseUrl: string): boolean {
  try {
    const urlObj = new URL(url);
    const baseObj = new URL(baseUrl);
    return urlObj.hostname === baseObj.hostname;
  } catch {
    return false;
  }
}

/**
 * Extracts the domain from a URL
 */
export function getDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return "";
  }
}

/**
 * Creates a crawler instance
 * Note: Full crawling implementation would require server-side execution
 */
export function createCrawler(baseUrl: string, options: CrawlOptions = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const visited = new Set<string>();
  const queue: { url: string; depth: number }[] = [];
  const results: PageData[] = [];
  let isRunning = false;

  return {
    getConfig: () => config,
    getVisitedCount: () => visited.size,
    getResults: () => results,
    isRunning: () => isRunning,

    async start(): Promise<PageData[]> {
      if (!isValidUrl(baseUrl)) {
        throw new Error("Invalid base URL");
      }

      isRunning = true;
      queue.push({ url: normalizeUrl(baseUrl), depth: 0 });

      // In a real implementation, this would:
      // 1. Fetch each page
      // 2. Parse HTML to extract data
      // 3. Find links and add to queue
      // 4. Respect rate limits and robots.txt
      // 5. Handle errors gracefully

      console.log(`Starting crawl of ${baseUrl} with config:`, config);

      // Placeholder - actual crawling would be done server-side
      isRunning = false;
      return results;
    },

    stop() {
      isRunning = false;
    },

    reset() {
      visited.clear();
      queue.length = 0;
      results.length = 0;
      isRunning = false;
    },
  };
}

/**
 * Analyzes page performance (client-side metrics)
 */
export function getPerformanceMetrics(): {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number | null;
} {
  if (typeof window === "undefined") {
    return { loadTime: 0, domContentLoaded: 0, firstContentfulPaint: null };
  }

  const timing = performance.timing;
  const loadTime = timing.loadEventEnd - timing.navigationStart;
  const domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;

  // Get FCP from Performance Observer
  let fcp: number | null = null;
  const paintEntries = performance.getEntriesByType("paint");
  const fcpEntry = paintEntries.find(
    (entry) => entry.name === "first-contentful-paint"
  );
  if (fcpEntry) {
    fcp = fcpEntry.startTime;
  }

  return {
    loadTime,
    domContentLoaded,
    firstContentfulPaint: fcp,
  };
}

// =============================================================================
// MOCK CRAWLER FOR UI TESTING
// =============================================================================

import type { CrawlData, Page, WebSocketMessage } from "@/types";

/**
 * Common page paths used for generating realistic mock data
 */
const COMMON_PATHS = [
  "",
  "about",
  "about/team",
  "about/careers",
  "about/company",
  "contact",
  "contact/support",
  "products",
  "products/features",
  "products/pricing",
  "products/enterprise",
  "services",
  "services/consulting",
  "services/development",
  "blog",
  "blog/news",
  "blog/tutorials",
  "blog/updates",
  "docs",
  "docs/getting-started",
  "docs/api",
  "docs/guides",
  "docs/faq",
  "resources",
  "resources/downloads",
  "resources/templates",
  "login",
  "signup",
  "dashboard",
  "settings",
  "privacy",
  "terms",
  "sitemap",
  "404",
];

/**
 * Common page titles for mock data
 */
const PAGE_TITLE_TEMPLATES = [
  "Home",
  "About Us",
  "Meet the Team",
  "Careers",
  "Our Company",
  "Contact",
  "Support",
  "Products",
  "Features",
  "Pricing",
  "Enterprise",
  "Services",
  "Consulting",
  "Development",
  "Blog",
  "News",
  "Tutorials",
  "Updates",
  "Documentation",
  "Getting Started",
  "API Reference",
  "Guides",
  "FAQ",
  "Resources",
  "Downloads",
  "Templates",
  "Login",
  "Sign Up",
  "Dashboard",
  "Settings",
  "Privacy Policy",
  "Terms of Service",
  "Sitemap",
  "Page Not Found",
];

/**
 * Generates a random number between min and max (inclusive)
 */
function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a random float between min and max with specified decimals
 */
function randomFloat(min: number, max: number, decimals: number = 2): number {
  const value = Math.random() * (max - min) + min;
  return parseFloat(value.toFixed(decimals));
}

/**
 * Generates a unique ID
 */
function generateMockId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}${random}`;
}

/**
 * Generates a realistic page title based on path
 */
function generatePageTitle(path: string, siteName: string): string {
  if (!path || path === "/") {
    return `${siteName} - Home`;
  }
  
  const pathParts = path.split("/").filter(Boolean);
  const lastPart = pathParts[pathParts.length - 1];
  const titleCase = lastPart
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  
  return `${titleCase} | ${siteName}`;
}

/**
 * Generates mock page data
 */
function generateMockPages(
  baseUrl: string,
  count: number,
  maxDepth: number
): Page[] {
  const pages: Page[] = [];
  const usedPaths = new Set<string>();
  
  // Extract site name from URL
  let siteName = "Website";
  try {
    const url = new URL(baseUrl);
    siteName = url.hostname.split(".")[0];
    siteName = siteName.charAt(0).toUpperCase() + siteName.slice(1);
  } catch {
    // Use default
  }

  // Always include homepage
  pages.push({
    id: generateMockId("pg"),
    url: baseUrl,
    title: `${siteName} - Home`,
    depth: 0,
    statusCode: 200,
    inboundLinks: randomBetween(10, 50),
    outboundLinks: randomBetween(15, 40),
  });
  usedPaths.add("");

  // Generate remaining pages
  for (let i = 1; i < count; i++) {
    // Pick a random path or generate a new one
    let path: string;
    if (i < COMMON_PATHS.length && !usedPaths.has(COMMON_PATHS[i])) {
      path = COMMON_PATHS[i];
    } else {
      // Generate a random path with blog posts, products, etc.
      const categories = ["blog", "products", "docs", "help", "resources"];
      const category = categories[randomBetween(0, categories.length - 1)];
      const slug = `${category}/item-${randomBetween(1, 500)}`;
      path = slug;
    }

    if (usedPaths.has(path)) {
      path = `page-${i}`;
    }
    usedPaths.add(path);

    const depth = Math.min(path.split("/").length, maxDepth);
    const statusCode = Math.random() > 0.95 ? (Math.random() > 0.5 ? 404 : 500) : 200;

    pages.push({
      id: generateMockId("pg"),
      url: `${baseUrl}/${path}`,
      title: generatePageTitle(path, siteName),
      depth,
      statusCode,
      inboundLinks: randomBetween(0, 30),
      outboundLinks: randomBetween(0, 25),
    });
  }

  return pages;
}

/**
 * Simulates a delay (for realistic crawl timing)
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Simulates crawling a website and returns mock CrawlData
 * 
 * This is for UI testing without a real backend.
 * It generates realistic-looking data with appropriate delays.
 * 
 * @param url - The URL to "crawl"
 * @param options - Optional configuration
 * @returns Promise<CrawlData> - Simulated crawl results
 * 
 * @example
 * ```ts
 * const data = await simulateCrawl("https://example.com");
 * console.log(data.totalPages); // Random 500-2000
 * console.log(data.seoScore);   // Random 60-95
 * ```
 */
export async function simulateCrawl(
  url: string,
  options: {
    /** Artificial delay in ms (default: 1000) */
    delay?: number;
    /** Minimum pages to generate (default: 500) */
    minPages?: number;
    /** Maximum pages to generate (default: 2000) */
    maxPages?: number;
  } = {}
): Promise<CrawlData> {
  const {
    delay: delayMs = 1000,
    minPages = 500,
    maxPages = 2000,
  } = options;

  // Simulate network/processing delay
  await delay(delayMs);

  // Normalize URL
  let normalizedUrl = url;
  if (!url.startsWith("http")) {
    normalizedUrl = `https://${url}`;
  }

  // Generate random but realistic values
  const totalPages = randomBetween(minPages, maxPages);
  const maxDepth = randomBetween(3, 6);
  const avgDepth = randomFloat(1.5, maxDepth - 1, 1);
  
  // Scores tend to cluster in certain ranges
  const architectureScore = randomBetween(60, 95);
  const seoScore = randomBetween(55, 92);
  const mobileScore = randomBetween(65, 98);
  
  // Issues are usually a small percentage of total pages
  const orphanPages = randomBetween(0, Math.floor(totalPages * 0.03));
  const deadEnds = randomBetween(0, Math.floor(totalPages * 0.05));
  const brokenLinks = randomBetween(0, 15);
  
  // Performance metrics
  const avgPageSpeed = randomFloat(0.8, 3.5, 2);

  // Generate page list
  const pagesList = generateMockPages(normalizedUrl, Math.min(totalPages, 100), maxDepth);

  const crawlData: CrawlData = {
    id: generateMockId("crawl"),
    websiteId: generateMockId("ws"),
    url: normalizedUrl,
    totalPages,
    avgDepth,
    maxDepth,
    architectureScore,
    orphanPages,
    deadEnds,
    brokenLinks,
    avgPageSpeed,
    mobileScore,
    seoScore,
    pagesList,
    crawledAt: new Date(),
  };

  return crawlData;
}

/**
 * Simulates crawl progress with callbacks
 * 
 * This function simulates a crawl with real-time progress updates.
 * Useful for testing progress UI components.
 * 
 * @param url - The URL to "crawl"
 * @param onProgress - Callback for progress updates
 * @param onComplete - Callback when crawl completes
 * @param onError - Callback for errors
 * 
 * @example
 * ```ts
 * await simulateCrawlWithProgress(
 *   "https://example.com",
 *   (progress) => console.log(`Progress: ${progress.progress}%`),
 *   (data) => console.log(`Done! Found ${data.totalPages} pages`),
 *   (error) => console.error(error)
 * );
 * ```
 */
export async function simulateCrawlWithProgress(
  url: string,
  onProgress: (message: WebSocketMessage) => void,
  onComplete: (data: CrawlData) => void,
  onError?: (error: Error) => void
): Promise<void> {
  const crawlId = generateMockId("crawl");
  const totalPages = randomBetween(500, 2000);
  let pagesCrawled = 0;

  // Normalize URL
  let normalizedUrl = url;
  if (!url.startsWith("http")) {
    normalizedUrl = `https://${url}`;
  }

  try {
    // Send start message
    onProgress({
      type: "crawl_started",
      crawlId,
      progress: 0,
      pagesCrawled: 0,
      totalPages,
      currentUrl: normalizedUrl,
      timestamp: new Date(),
    });

    // Simulate progress over time
    const progressSteps = randomBetween(8, 15);
    const progressIncrement = 100 / progressSteps;

    for (let i = 1; i <= progressSteps; i++) {
      await delay(randomBetween(300, 800));

      const progress = Math.min(Math.round(i * progressIncrement), 99);
      pagesCrawled = Math.floor((progress / 100) * totalPages);

      // Generate a current URL being crawled
      const currentPath = COMMON_PATHS[randomBetween(0, COMMON_PATHS.length - 1)];
      const currentUrl = `${normalizedUrl}/${currentPath}`;

      onProgress({
        type: "crawl_progress",
        crawlId,
        progress,
        pagesCrawled,
        totalPages,
        currentUrl,
        timestamp: new Date(),
      });
    }

    // Final delay before completion
    await delay(500);

    // Generate final crawl data
    const crawlData = await simulateCrawl(url, { delay: 0, minPages: totalPages, maxPages: totalPages });
    crawlData.id = crawlId;

    // Send completion message
    onProgress({
      type: "crawl_completed",
      crawlId,
      progress: 100,
      pagesCrawled: totalPages,
      totalPages,
      websiteId: crawlData.websiteId,
      timestamp: new Date(),
    });

    onComplete(crawlData);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Crawl failed";
    
    onProgress({
      type: "crawl_error",
      crawlId,
      error: errorMessage,
      timestamp: new Date(),
    });

    if (onError) {
      onError(error instanceof Error ? error : new Error(errorMessage));
    }
  }
}

/**
 * Generates mock CrawlData instantly (no delay)
 * 
 * Use this when you need data immediately without simulating a real crawl.
 * 
 * @param url - The URL for the mock data
 * @returns CrawlData - Instant mock crawl results
 */
export function generateMockCrawlData(url: string): CrawlData {
  let normalizedUrl = url;
  if (!url.startsWith("http")) {
    normalizedUrl = `https://${url}`;
  }

  const totalPages = randomBetween(500, 2000);
  const maxDepth = randomBetween(3, 6);

  return {
    id: generateMockId("crawl"),
    websiteId: generateMockId("ws"),
    url: normalizedUrl,
    totalPages,
    avgDepth: randomFloat(1.5, maxDepth - 1, 1),
    maxDepth,
    architectureScore: randomBetween(60, 95),
    orphanPages: randomBetween(0, Math.floor(totalPages * 0.03)),
    deadEnds: randomBetween(0, Math.floor(totalPages * 0.05)),
    brokenLinks: randomBetween(0, 15),
    avgPageSpeed: randomFloat(0.8, 3.5, 2),
    mobileScore: randomBetween(65, 98),
    seoScore: randomBetween(55, 92),
    pagesList: generateMockPages(normalizedUrl, Math.min(totalPages, 100), maxDepth),
    crawledAt: new Date(),
  };
}

