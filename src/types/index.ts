/**
 * Website Analyzer Pro - TypeScript Type Definitions
 * 
 * This file contains all interfaces, types, and enums used throughout
 * the application. Import types using: `import type { Website } from "@/types"`
 * 
 * @author Website Analyzer Pro Team
 * @version 1.0.0
 */

// =============================================================================
// WEBSITE TYPES
// =============================================================================

/**
 * Represents the status of a website in the system
 */
export type WebsiteStatus = "completed" | "pending" | "failed";

/**
 * Main Website interface representing a website entity in the system
 * 
 * @example
 * ```ts
 * const website: Website = {
 *   id: "ws_123",
 *   url: "https://example.com",
 *   name: "Example Site",
 *   pageCount: 47,
 *   status: "completed",
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * };
 * ```
 */
export interface Website {
  /** Unique identifier for the website (e.g., "ws_abc123") */
  id: string;
  
  /** Full URL of the website including protocol */
  url: string;
  
  /** Display name for the website */
  name: string;
  
  /** Total number of pages discovered during crawl */
  pageCount: number;
  
  /** Current status of the website analysis */
  status: WebsiteStatus;
  
  /** Timestamp when the website was first added */
  createdAt: Date;
  
  /** Timestamp when the website was last updated */
  updatedAt: Date;
}

/**
 * Data required to create a new website entry
 */
export interface CreateWebsiteInput {
  url: string;
  name?: string;
}

/**
 * Data for updating an existing website
 */
export interface UpdateWebsiteInput {
  name?: string;
  status?: WebsiteStatus;
}

// =============================================================================
// CRAWL MESSAGE TYPES
// =============================================================================

/**
 * Types of messages that can appear in the crawl chat interface
 */
export type CrawlMessageType = "user" | "system" | "status";

/**
 * Status of an active crawl operation
 */
export type CrawlStatus = "pending" | "crawling" | "completed" | "error";

/**
 * Represents a message in the crawl chat interface
 * Used for both user queries and system responses during crawling
 * 
 * @example
 * ```ts
 * const message: CrawlMessage = {
 *   id: "msg_001",
 *   type: "status",
 *   content: "Crawling page 15 of 47...",
 *   timestamp: new Date(),
 *   websiteUrl: "https://example.com/about",
 *   crawlProgress: 32,
 *   status: "crawling"
 * };
 * ```
 */
export interface CrawlMessage {
  /** Unique identifier for the message */
  id: string;
  
  /** Type of message: user input, system response, or status update */
  type: CrawlMessageType;
  
  /** The actual message content */
  content: string;
  
  /** When the message was created */
  timestamp: Date;
  
  /** URL currently being processed (for status messages) */
  websiteUrl?: string;
  
  /** Crawl progress percentage (0-100) */
  crawlProgress?: number;
  
  /** Current crawl status */
  status?: CrawlStatus;
}

// =============================================================================
// PAGE TYPES
// =============================================================================

/**
 * HTTP status code categories for quick filtering
 */
export type StatusCodeCategory = "success" | "redirect" | "client-error" | "server-error";

/**
 * Represents a single page discovered during website crawl
 * 
 * @example
 * ```ts
 * const page: Page = {
 *   id: "pg_001",
 *   url: "/about",
 *   title: "About Us - Example Site",
 *   depth: 1,
 *   statusCode: 200,
 *   inboundLinks: 5,
 *   outboundLinks: 12
 * };
 * ```
 */
export interface Page {
  /** Unique identifier for the page */
  id: string;
  
  /** URL path of the page (relative or absolute) */
  url: string;
  
  /** Page title extracted from <title> tag */
  title: string;
  
  /** Depth level from homepage (0 = homepage, 1 = direct links, etc.) */
  depth: number;
  
  /** HTTP status code returned by the page */
  statusCode: number;
  
  /** Number of links pointing TO this page from other pages */
  inboundLinks: number;
  
  /** Number of links going FROM this page to other pages */
  outboundLinks: number;
}

/**
 * Extended page data with additional analysis metrics
 */
export interface PageWithMetrics extends Page {
  /** Page load time in milliseconds */
  loadTime?: number;
  
  /** Page size in bytes */
  size?: number;
  
  /** Content type (text/html, application/json, etc.) */
  contentType?: string;
  
  /** Meta description if present */
  metaDescription?: string;
  
  /** Whether the page is indexable by search engines */
  isIndexable?: boolean;
  
  /** Number of images on the page */
  imageCount?: number;
  
  /** Number of scripts loaded */
  scriptCount?: number;
  
  /** Number of stylesheets loaded */
  stylesheetCount?: number;
}

// =============================================================================
// CRAWL DATA TYPES
// =============================================================================

/**
 * Complete crawl data for a website including all metrics and pages
 * This is the main data structure returned after a crawl completes
 * 
 * @example
 * ```ts
 * const crawlData: CrawlData = {
 *   id: "crawl_001",
 *   websiteId: "ws_123",
 *   url: "https://example.com",
 *   totalPages: 47,
 *   avgDepth: 2.3,
 *   maxDepth: 5,
 *   architectureScore: 85,
 *   orphanPages: 2,
 *   deadEnds: 5,
 *   brokenLinks: 3,
 *   avgPageSpeed: 1.2,
 *   mobileScore: 92,
 *   seoScore: 78,
 *   pagesList: [...],
 *   crawledAt: new Date()
 * };
 * ```
 */
export interface CrawlData {
  /** Unique identifier for this crawl session */
  id: string;
  
  /** Reference to the parent website */
  websiteId: string;
  
  /** Base URL that was crawled */
  url: string;
  
  /** Total number of pages discovered */
  totalPages: number;
  
  /** Average depth of all pages (clicks from homepage) */
  avgDepth: number;
  
  /** Maximum depth reached during crawl */
  maxDepth: number;
  
  /** Overall site architecture score (0-100) */
  architectureScore: number;
  
  /** Number of orphan pages (no inbound links) */
  orphanPages: number;
  
  /** Number of dead-end pages (no outbound links) */
  deadEnds: number;
  
  /** Number of broken links (404s, 500s, etc.) */
  brokenLinks: number;
  
  /** Average page load speed in seconds */
  avgPageSpeed: number;
  
  /** Mobile-friendliness score (0-100) */
  mobileScore: number;
  
  /** SEO optimization score (0-100) */
  seoScore: number;
  
  /** List of all discovered pages */
  pagesList: Page[];
  
  /** Timestamp when the crawl was completed */
  crawledAt: Date;
}

/**
 * Summary statistics from a crawl (for overview displays)
 */
export interface CrawlSummary {
  totalPages: number;
  healthyPages: number;
  warningPages: number;
  errorPages: number;
  avgLoadTime: number;
  overallScore: number;
}

// =============================================================================
// DASHBOARD TYPES
// =============================================================================

/**
 * Available tabs in the website dashboard
 */
export type DashboardTab = "overview" | "network" | "statistics" | "audit" | "seo" | "mindmap";

/**
 * Configuration for a dashboard tab
 */
export interface DashboardTabConfig {
  id: DashboardTab;
  label: string;
  icon: string;
  description: string;
}

/**
 * All dashboard tab configurations
 */
export const DASHBOARD_TABS: DashboardTabConfig[] = [
  { id: "overview", label: "Overview", icon: "LayoutDashboard", description: "Website health summary" },
  { id: "network", label: "Network", icon: "Network", description: "Link structure analysis" },
  { id: "statistics", label: "Statistics", icon: "BarChart3", description: "Performance metrics" },
  { id: "audit", label: "Audit", icon: "ClipboardCheck", description: "Issue detection" },
  { id: "seo", label: "SEO", icon: "Search", description: "Search optimization" },
  { id: "mindmap", label: "Mind Map", icon: "GitBranch", description: "Site structure visualization" },
] as const;

// =============================================================================
// ISSUE & AUDIT TYPES
// =============================================================================

/**
 * Severity levels for detected issues
 */
export type IssueSeverity = "critical" | "warning" | "info";

/**
 * Categories of issues that can be detected
 */
export type IssueCategory = 
  | "performance" 
  | "seo" 
  | "accessibility" 
  | "security" 
  | "best-practices"
  | "content";

/**
 * Represents an issue detected during website analysis
 */
export interface Issue {
  /** Unique identifier for the issue */
  id: string;
  
  /** Severity level of the issue */
  severity: IssueSeverity;
  
  /** Category the issue belongs to */
  category: IssueCategory;
  
  /** Short title describing the issue */
  title: string;
  
  /** Detailed description of the issue */
  description: string;
  
  /** Suggested fix or recommendation */
  recommendation?: string;
  
  /** URLs affected by this issue */
  affectedUrls: string[];
  
  /** Number of occurrences */
  count: number;
}

/**
 * Audit results grouped by category
 */
export interface AuditResults {
  performance: Issue[];
  seo: Issue[];
  accessibility: Issue[];
  security: Issue[];
  bestPractices: Issue[];
}

// =============================================================================
// SEO TYPES
// =============================================================================

/**
 * SEO check result status
 */
export type SEOCheckStatus = "pass" | "fail" | "warning";

/**
 * Individual SEO check result
 */
export interface SEOCheck {
  /** Name of the check */
  name: string;
  
  /** Check result status */
  status: SEOCheckStatus;
  
  /** Description of what was checked */
  description: string;
  
  /** Current value (if applicable) */
  value?: string;
  
  /** Recommended value (if applicable) */
  recommendedValue?: string;
}

/**
 * Complete SEO analysis report
 */
export interface SEOReport {
  /** Overall SEO score (0-100) */
  score: number;
  
  /** Meta tag checks */
  metaChecks: SEOCheck[];
  
  /** Content-related checks */
  contentChecks: SEOCheck[];
  
  /** Technical SEO checks */
  technicalChecks: SEOCheck[];
  
  /** List of SEO issues found */
  issues: Issue[];
}

// =============================================================================
// NETWORK & LINK TYPES
// =============================================================================

/**
 * Type of link (internal vs external)
 */
export type LinkType = "internal" | "external";

/**
 * Link health status
 */
export type LinkStatus = "ok" | "broken" | "redirect" | "timeout";

/**
 * Represents a link between pages
 */
export interface Link {
  /** Source page URL */
  sourceUrl: string;
  
  /** Target page URL */
  targetUrl: string;
  
  /** Link text/anchor text */
  anchorText?: string;
  
  /** Type of link */
  type: LinkType;
  
  /** Health status of the link */
  status: LinkStatus;
  
  /** HTTP status code when following the link */
  statusCode?: number;
}

/**
 * Network graph node for visualization
 */
export interface NetworkNode {
  id: string;
  label: string;
  url: string;
  depth: number;
  pageRank?: number;
}

/**
 * Network graph edge for visualization
 */
export interface NetworkEdge {
  source: string;
  target: string;
  weight?: number;
}

/**
 * Complete network graph data
 */
export interface NetworkGraph {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

// =============================================================================
// CHAT & AI TYPES
// =============================================================================

/**
 * Role of a chat message sender
 */
export type ChatRole = "user" | "assistant" | "system";

/**
 * A message in the AI chat interface
 */
export interface ChatMessage {
  /** Unique message identifier */
  id: string;
  
  /** Who sent the message */
  role: ChatRole;
  
  /** Message content (may include markdown) */
  content: string;
  
  /** When the message was sent */
  timestamp: Date;
  
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * A saved chat conversation
 */
export interface ChatConversation {
  /** Conversation identifier */
  id: string;
  
  /** Conversation title (auto-generated or user-defined) */
  title: string;
  
  /** Preview text (first message snippet) */
  preview: string;
  
  /** Related website ID (if any) */
  websiteId?: string;
  
  /** All messages in the conversation */
  messages: ChatMessage[];
  
  /** When the conversation was created */
  createdAt: Date;
  
  /** When the conversation was last updated */
  updatedAt: Date;
}

// =============================================================================
// API TYPES
// =============================================================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  /** Whether the request was successful */
  success: boolean;
  
  /** Response data (if successful) */
  data?: T;
  
  /** Error message (if failed) */
  error?: string;
  
  /** Additional error details */
  details?: Record<string, unknown>;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  /** Array of items */
  data: T[];
  
  /** Total number of items */
  total: number;
  
  /** Current page number (1-indexed) */
  page: number;
  
  /** Items per page */
  pageSize: number;
  
  /** Whether there are more pages */
  hasMore: boolean;
}

/**
 * API error with details
 */
export interface ApiError {
  /** Error code */
  code: string;
  
  /** Human-readable message */
  message: string;
  
  /** HTTP status code */
  status: number;
  
  /** Additional error context */
  details?: Record<string, unknown>;
}

// =============================================================================
// API REQUEST/RESPONSE TYPES
// =============================================================================

/**
 * Request body for starting a new crawl
 * 
 * @example
 * ```ts
 * const request: CrawlRequest = {
 *   url: "https://example.com"
 * };
 * ```
 */
export interface CrawlRequest {
  /** The URL of the website to crawl */
  url: string;
}

/**
 * Response from starting a crawl operation
 * 
 * @example
 * ```ts
 * // Success response
 * const response: CrawlResponse = {
 *   success: true,
 *   crawlId: "crawl_abc123",
 *   websiteId: "ws_xyz789",
 *   message: "Crawl started successfully"
 * };
 * 
 * // Error response
 * const errorResponse: CrawlResponse = {
 *   success: false,
 *   crawlId: "",
 *   websiteId: "",
 *   error: "Invalid URL provided"
 * };
 * ```
 */
export interface CrawlResponse {
  /** Whether the crawl was started successfully */
  success: boolean;
  
  /** Unique identifier for the crawl operation */
  crawlId: string;
  
  /** Unique identifier for the website being crawled */
  websiteId: string;
  
  /** Optional success message */
  message?: string;
  
  /** Error message if the request failed */
  error?: string;
}

/**
 * Response containing list of websites
 * 
 * @example
 * ```ts
 * const response: WebsitesResponse = {
 *   success: true,
 *   websites: [
 *     { id: "ws_1", url: "https://example.com", ... },
 *     { id: "ws_2", url: "https://another.com", ... }
 *   ]
 * };
 * ```
 */
export interface WebsitesResponse {
  /** Whether the request was successful */
  success: boolean;
  
  /** Array of website objects */
  websites: Website[];
  
  /** Error message if the request failed */
  error?: string;
}

/**
 * Response containing dashboard/crawl data for a specific website
 * 
 * @example
 * ```ts
 * const response: DashboardDataResponse = {
 *   success: true,
 *   data: {
 *     id: "crawl_123",
 *     websiteId: "ws_456",
 *     totalPages: 150,
 *     seoScore: 85,
 *     ...
 *   }
 * };
 * ```
 */
export interface DashboardDataResponse {
  /** Whether the request was successful */
  success: boolean;
  
  /** Complete crawl data for the website */
  data: CrawlData;
  
  /** Error message if the request failed */
  error?: string;
}

// =============================================================================
// WEBSOCKET TYPES
// =============================================================================

/**
 * Types of WebSocket messages for real-time updates
 */
export type WebSocketMessageType = 
  | "crawl_progress" 
  | "crawl_completed" 
  | "crawl_error"
  | "crawl_started"
  | "connection_established";

/**
 * WebSocket message for real-time crawl updates
 * 
 * Sent from server to client during crawl operations to provide
 * real-time progress updates, completion notifications, and error alerts.
 * 
 * @example
 * ```ts
 * // Progress update
 * const progressMessage: WebSocketMessage = {
 *   type: "crawl_progress",
 *   crawlId: "crawl_abc123",
 *   progress: 45,
 *   pagesCrawled: 67,
 *   totalPages: 150,
 *   currentUrl: "https://example.com/about"
 * };
 * 
 * // Completion message
 * const completedMessage: WebSocketMessage = {
 *   type: "crawl_completed",
 *   crawlId: "crawl_abc123",
 *   pagesCrawled: 150,
 *   totalPages: 150,
 *   websiteId: "ws_xyz789"
 * };
 * 
 * // Error message
 * const errorMessage: WebSocketMessage = {
 *   type: "crawl_error",
 *   crawlId: "crawl_abc123",
 *   error: "Connection timeout"
 * };
 * ```
 */
export interface WebSocketMessage {
  /** Type of the WebSocket message */
  type: WebSocketMessageType;
  
  /** Crawl operation identifier */
  crawlId?: string;
  
  /** Current progress percentage (0-100) */
  progress?: number;
  
  /** Number of pages crawled so far */
  pagesCrawled?: number;
  
  /** Total estimated pages to crawl */
  totalPages?: number;
  
  /** Current URL being crawled */
  currentUrl?: string;
  
  /** Website ID (sent on completion) */
  websiteId?: string;
  
  /** Error message (for error type messages) */
  error?: string;
  
  /** Timestamp of the message */
  timestamp?: Date;
}

/**
 * WebSocket connection state
 */
export type WebSocketState = "connecting" | "connected" | "disconnected" | "error";

/**
 * WebSocket event handlers interface
 */
export interface WebSocketHandlers {
  /** Called when connection is established */
  onConnect?: () => void;
  
  /** Called when connection is lost */
  onDisconnect?: () => void;
  
  /** Called when a message is received */
  onMessage?: (message: WebSocketMessage) => void;
  
  /** Called when an error occurs */
  onError?: (error: Error) => void;
}

// =============================================================================
// STORE TYPES (ZUSTAND)
// =============================================================================

/**
 * Website store state
 */
export interface WebsiteStoreState {
  websites: Website[];
  selectedWebsiteId: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Website store actions
 */
export interface WebsiteStoreActions {
  setWebsites: (websites: Website[]) => void;
  addWebsite: (website: Website) => void;
  updateWebsite: (id: string, data: Partial<Website>) => void;
  removeWebsite: (id: string) => void;
  selectWebsite: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

/**
 * Complete website store type
 */
export type WebsiteStore = WebsiteStoreState & WebsiteStoreActions;

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Make all properties in T optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Extract the resolved type from a Promise
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/**
 * Make specific properties required
 */
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/**
 * Omit properties from a type
 */
export type StrictOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Issue severity order for sorting (higher = more severe)
 */
export const SEVERITY_ORDER: Record<IssueSeverity, number> = {
  critical: 3,
  warning: 2,
  info: 1,
} as const;

/**
 * HTTP status code ranges
 */
export const STATUS_CODE_RANGES = {
  success: { min: 200, max: 299 },
  redirect: { min: 300, max: 399 },
  clientError: { min: 400, max: 499 },
  serverError: { min: 500, max: 599 },
} as const;

/**
 * Default pagination settings
 */
export const DEFAULT_PAGINATION = {
  page: 1,
  pageSize: 20,
} as const;
