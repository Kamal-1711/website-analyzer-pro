import { NextRequest, NextResponse } from "next/server";
import type { Website, WebsitesResponse } from "@/types";

// =============================================================================
// IN-MEMORY STORAGE (Replace with database in production)
// =============================================================================

/**
 * In-memory store for websites
 * In production, this would be stored in a database
 */
const websiteStore = new Map<string, Website>();

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Generates a unique ID
 */
function generateId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}${random}`;
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

// =============================================================================
// GET /api/websites - List all websites
// =============================================================================

/**
 * GET /api/websites
 * 
 * Returns a list of all analyzed websites.
 * 
 * Query params (optional):
 * - id: Get a specific website by ID
 * 
 * Response:
 * ```json
 * {
 *   "success": true,
 *   "websites": [
 *     { "id": "ws_123", "url": "https://example.com", ... },
 *     { "id": "ws_456", "url": "https://another.com", ... }
 *   ]
 * }
 * ```
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<WebsitesResponse | { success: boolean; website: Website } | { success: boolean; error: string }>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    // If ID is provided, return single website
    if (id) {
      const website = websiteStore.get(id);

      if (!website) {
        return NextResponse.json(
          {
            success: false,
            error: "Website not found",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        website,
      });
    }

    // Return all websites sorted by createdAt (newest first)
    const allWebsites = Array.from(websiteStore.values()).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      websites: allWebsites,
    });
  } catch (error) {
    console.error("[Websites API] GET Error:", error);

    return NextResponse.json(
      {
        success: false,
        websites: [],
        error: "Failed to fetch websites",
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// POST /api/websites - Create a new website
// =============================================================================

/**
 * POST /api/websites
 * 
 * Creates a new website entry.
 * 
 * Request body:
 * ```json
 * { "url": "https://example.com", "name": "Example Site" }
 * ```
 * 
 * Response:
 * ```json
 * {
 *   "success": true,
 *   "website": { "id": "ws_123", "url": "https://example.com", ... }
 * }
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, name } = body;

    // Validate URL
    if (!url || typeof url !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "URL is required",
        },
        { status: 400 }
      );
    }

    const normalizedUrl = normalizeUrl(url.trim());
    const domainName = getDomainName(normalizedUrl);

    // Check if website already exists
    const existingWebsite = Array.from(websiteStore.values()).find(
      (w) => w.url === normalizedUrl
    );

    if (existingWebsite) {
      return NextResponse.json({
        success: true,
        website: existingWebsite,
        message: "Website already exists",
      });
    }

    // Create new website
    const website: Website = {
      id: generateId("ws"),
      url: normalizedUrl,
      name: name || domainName,
      pageCount: 0,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    websiteStore.set(website.id, website);

    console.log(`[Websites API] Created website: ${website.id} - ${website.url}`);

    return NextResponse.json(
      {
        success: true,
        website,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Websites API] POST Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create website",
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// PUT /api/websites - Update a website
// =============================================================================

/**
 * PUT /api/websites?id=ws_123
 * 
 * Updates an existing website.
 * 
 * Request body:
 * ```json
 * { "name": "New Name", "status": "completed", "pageCount": 150 }
 * ```
 */
export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Website ID is required",
        },
        { status: 400 }
      );
    }

    const website = websiteStore.get(id);

    if (!website) {
      return NextResponse.json(
        {
          success: false,
          error: "Website not found",
        },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, status, pageCount } = body;

    // Update fields
    const updatedWebsite: Website = {
      ...website,
      name: name ?? website.name,
      status: status ?? website.status,
      pageCount: pageCount ?? website.pageCount,
      updatedAt: new Date(),
    };

    websiteStore.set(id, updatedWebsite);

    console.log(`[Websites API] Updated website: ${id}`);

    return NextResponse.json({
      success: true,
      website: updatedWebsite,
    });
  } catch (error) {
    console.error("[Websites API] PUT Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update website",
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// DELETE /api/websites - Delete a website
// =============================================================================

/**
 * DELETE /api/websites?id=ws_123
 * 
 * Deletes a website by ID.
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Website ID is required",
        },
        { status: 400 }
      );
    }

    if (!websiteStore.has(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Website not found",
        },
        { status: 404 }
      );
    }

    websiteStore.delete(id);

    console.log(`[Websites API] Deleted website: ${id}`);

    return NextResponse.json({
      success: true,
      message: "Website deleted successfully",
    });
  } catch (error) {
    console.error("[Websites API] DELETE Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete website",
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// EXPORTS FOR TESTING & SHARING
// =============================================================================

/**
 * Export store for use by other API routes (e.g., /api/crawl)
 * In production, this would be database queries
 */
export const websitesStore = {
  get: (id: string) => websiteStore.get(id),
  set: (id: string, website: Website) => websiteStore.set(id, website),
  delete: (id: string) => websiteStore.delete(id),
  getAll: () => Array.from(websiteStore.values()),
  has: (id: string) => websiteStore.has(id),
  clear: () => websiteStore.clear(),
};
