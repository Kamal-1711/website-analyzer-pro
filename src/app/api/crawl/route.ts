import { NextRequest, NextResponse } from "next/server";
import { simulateCrawl, generateMockCrawlData } from "@/lib/crawler";
import type { CrawlResponse, CrawlData, Website } from "@/types";

// =============================================================================
// IN-MEMORY STORAGE (Replace with database in production)
// =============================================================================

/**
 * In-memory store for crawl data
 * In production, this would be stored in a database
 */
const crawlStore = new Map<string, CrawlData>();
const websiteStore = new Map<string, Website>();

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Validates if a string is a valid URL
 */
function isValidUrl(urlString: string): boolean {
  try {
    // Add protocol if missing
    const urlToTest = urlString.startsWith("http")
      ? urlString
      : `https://${urlString}`;
    const url = new URL(urlToTest);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Normalizes a URL by ensuring it has a protocol
 */
function normalizeUrl(url: string): string {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`;
  }
  return url;
}

/**
 * Extracts domain name from URL
 */
function getDomainName(url: string): string {
  try {
    const urlObj = new URL(normalizeUrl(url));
    return urlObj.hostname;
  } catch {
    return url;
  }
}

/**
 * Generates a unique ID
 */
function generateId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}${random}`;
}

// =============================================================================
// POST /api/crawl - Start a new crawl
// =============================================================================

/**
 * POST /api/crawl
 * 
 * Starts a new website crawl operation.
 * 
 * Request body:
 * ```json
 * { "url": "https://example.com" }
 * ```
 * 
 * Response:
 * ```json
 * {
 *   "success": true,
 *   "crawlId": "crawl_abc123",
 *   "websiteId": "ws_xyz789",
 *   "totalPages": 1245,
 *   "message": "Crawl completed successfully"
 * }
 * ```
 */
export async function POST(request: NextRequest): Promise<NextResponse<CrawlResponse>> {
  try {
    // Parse request body
    const body = await request.json();
    const { url } = body;

    // Validate URL is provided
    if (!url || typeof url !== "string") {
      return NextResponse.json(
        {
          success: false,
          crawlId: "",
          websiteId: "",
          error: "URL is required",
        },
        { status: 400 }
      );
    }

    // Trim whitespace
    const trimmedUrl = url.trim();

    // Validate URL format
    if (!isValidUrl(trimmedUrl)) {
      return NextResponse.json(
        {
          success: false,
          crawlId: "",
          websiteId: "",
          error: "Invalid URL format. Please provide a valid website URL.",
        },
        { status: 400 }
      );
    }

    // Normalize the URL
    const normalizedUrl = normalizeUrl(trimmedUrl);
    const domainName = getDomainName(normalizedUrl);

    console.log(`[Crawl API] Starting crawl for: ${normalizedUrl}`);

    // Generate IDs
    const crawlId = generateId("crawl");
    const websiteId = generateId("ws");

    // Call mock crawler (replace with real crawler in production)
    // Using a shorter delay for API response, real progress would come via WebSocket
    const crawlData = await simulateCrawl(normalizedUrl, {
      delay: 500, // Reduced delay for API response
      minPages: 100,
      maxPages: 2000,
    });

    // Override IDs with our generated ones
    crawlData.id = crawlId;
    crawlData.websiteId = websiteId;

    // Create website object
    const website: Website = {
      id: websiteId,
      url: normalizedUrl,
      name: domainName,
      pageCount: crawlData.totalPages,
      status: "completed",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store in memory (replace with database in production)
    crawlStore.set(crawlId, crawlData);
    websiteStore.set(websiteId, website);

    console.log(`[Crawl API] Crawl completed: ${crawlId}, found ${crawlData.totalPages} pages`);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        crawlId,
        websiteId,
        totalPages: crawlData.totalPages,
        message: `Successfully crawled ${domainName}. Found ${crawlData.totalPages} pages.`,
      } as CrawlResponse & { totalPages: number },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Crawl API] Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";

    return NextResponse.json(
      {
        success: false,
        crawlId: "",
        websiteId: "",
        error: `Failed to start crawl: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// GET /api/crawl - Get crawl status or data
// =============================================================================

/**
 * GET /api/crawl?id=crawl_abc123
 * 
 * Retrieves the status or data of a crawl operation.
 * 
 * Query params:
 * - id: The crawl ID to look up
 * 
 * Response:
 * ```json
 * {
 *   "success": true,
 *   "data": { ... crawl data ... }
 * }
 * ```
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const crawlId = searchParams.get("id");
    const websiteId = searchParams.get("websiteId");

    // If crawlId is provided, return crawl data
    if (crawlId) {
      const crawlData = crawlStore.get(crawlId);

      if (!crawlData) {
        return NextResponse.json(
          {
            success: false,
            error: "Crawl not found",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: crawlData,
      });
    }

    // If websiteId is provided, find crawl data for that website
    if (websiteId) {
      const crawlData = Array.from(crawlStore.values()).find(
        (c) => c.websiteId === websiteId
      );

      if (!crawlData) {
        // Generate mock data if not found (for testing)
        const website = websiteStore.get(websiteId);
        if (website) {
          const mockData = generateMockCrawlData(website.url);
          mockData.websiteId = websiteId;
          return NextResponse.json({
            success: true,
            data: mockData,
          });
        }

        return NextResponse.json(
          {
            success: false,
            error: "No crawl data found for this website",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: crawlData,
      });
    }

    // If no ID provided, return error
    return NextResponse.json(
      {
        success: false,
        error: "Crawl ID or Website ID is required",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("[Crawl API] GET Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve crawl data",
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// DELETE /api/crawl - Cancel a crawl
// =============================================================================

/**
 * DELETE /api/crawl?id=crawl_abc123
 * 
 * Cancels an in-progress crawl operation.
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const crawlId = searchParams.get("id");

    if (!crawlId) {
      return NextResponse.json(
        {
          success: false,
          error: "Crawl ID is required",
        },
        { status: 400 }
      );
    }

    // Check if crawl exists
    const crawlData = crawlStore.get(crawlId);
    if (!crawlData) {
      return NextResponse.json(
        {
          success: false,
          error: "Crawl not found",
        },
        { status: 404 }
      );
    }

    // Remove from store
    crawlStore.delete(crawlId);

    console.log(`[Crawl API] Crawl cancelled: ${crawlId}`);

    return NextResponse.json({
      success: true,
      message: "Crawl cancelled successfully",
    });
  } catch (error) {
    console.error("[Crawl API] DELETE Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to cancel crawl",
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// EXPORTS FOR TESTING
// =============================================================================

/**
 * Export stores for testing purposes
 * In production, these would be database queries
 */
export const __testHelpers = {
  getCrawlStore: () => crawlStore,
  getWebsiteStore: () => websiteStore,
  clearStores: () => {
    crawlStore.clear();
    websiteStore.clear();
  },
};
