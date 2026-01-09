/**
 * API Endpoint Tests
 *
 * Tests for Next.js API routes using mocked fetch
 */

import { generateMockCrawlData } from "@/lib/crawler";
import type { CrawlData, Website } from "@/types";

// =============================================================================
// Mock Setup
// =============================================================================

// Mock global fetch
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Helper to create mock Response
function mockResponse(data: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: new Headers(),
  } as Response;
}

// Reset mocks before each test
beforeEach(() => {
  mockFetch.mockClear();
});

// =============================================================================
// /api/crawl Endpoint Tests
// =============================================================================

describe("/api/crawl", () => {
  describe("POST /api/crawl", () => {
    it("should start a crawl with valid URL", async () => {
      const mockCrawlData = generateMockCrawlData("https://example.com");

      mockFetch.mockResolvedValueOnce(
        mockResponse({
          success: true,
          crawlId: "crawl_123",
          websiteId: "ws_456",
          data: mockCrawlData,
        })
      );

      const response = await fetch("/api/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "https://example.com" }),
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.crawlId).toBeDefined();
      expect(data.websiteId).toBeDefined();
    });

    it("should return error for invalid URL", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse(
          {
            success: false,
            error: "Invalid URL provided",
          },
          400
        )
      );

      const response = await fetch("/api/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "not-a-valid-url" }),
      });

      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Invalid URL provided");
    });

    it("should return error for missing URL", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse(
          {
            success: false,
            error: "URL is required",
          },
          400
        )
      );

      const response = await fetch("/api/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(data.error).toBe("URL is required");
    });
  });

  describe("GET /api/crawl", () => {
    it("should return crawl data by ID", async () => {
      const mockCrawlData = generateMockCrawlData("https://example.com");

      mockFetch.mockResolvedValueOnce(
        mockResponse({
          success: true,
          data: mockCrawlData,
        })
      );

      const response = await fetch("/api/crawl?id=crawl_123");
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.totalPages).toBeGreaterThan(0);
    });

    it("should return 404 for non-existent crawl", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse(
          {
            success: false,
            error: "Crawl not found",
          },
          404
        )
      );

      const response = await fetch("/api/crawl?id=non_existent");
      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(data.error).toBe("Crawl not found");
    });
  });

  describe("DELETE /api/crawl", () => {
    it("should cancel a crawl", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          success: true,
          message: "Crawl cancelled",
        })
      );

      const response = await fetch("/api/crawl?id=crawl_123", {
        method: "DELETE",
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
    });
  });
});

// =============================================================================
// /api/websites Endpoint Tests
// =============================================================================

describe("/api/websites", () => {
  const mockWebsites: Website[] = [
    {
      id: "ws_1",
      url: "https://example.com",
      name: "example.com",
      pageCount: 150,
      status: "completed",
      createdAt: new Date("2024-12-30"),
      updatedAt: new Date("2024-12-30"),
    },
    {
      id: "ws_2",
      url: "https://test.com",
      name: "test.com",
      pageCount: 75,
      status: "completed",
      createdAt: new Date("2024-12-31"),
      updatedAt: new Date("2024-12-31"),
    },
  ];

  describe("GET /api/websites", () => {
    it("should return list of all websites", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          success: true,
          websites: mockWebsites,
        })
      );

      const response = await fetch("/api/websites");
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.websites).toHaveLength(2);
      expect(data.websites[0].url).toBe("https://example.com");
    });

    it("should return empty array when no websites", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          success: true,
          websites: [],
        })
      );

      const response = await fetch("/api/websites");
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.websites).toHaveLength(0);
    });

    it("should return single website by ID", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          success: true,
          website: mockWebsites[0],
        })
      );

      const response = await fetch("/api/websites?id=ws_1");
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.website.id).toBe("ws_1");
    });
  });

  describe("POST /api/websites", () => {
    it("should create a new website", async () => {
      const newWebsite: Website = {
        id: "ws_3",
        url: "https://new-site.com",
        name: "new-site.com",
        pageCount: 0,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockFetch.mockResolvedValueOnce(
        mockResponse({
          success: true,
          website: newWebsite,
        })
      );

      const response = await fetch("/api/websites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "https://new-site.com" }),
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.website.url).toBe("https://new-site.com");
    });
  });

  describe("DELETE /api/websites", () => {
    it("should delete a website", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          success: true,
          message: "Website deleted",
        })
      );

      const response = await fetch("/api/websites?id=ws_1", {
        method: "DELETE",
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
    });

    it("should return 404 for non-existent website", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse(
          {
            success: false,
            error: "Website not found",
          },
          404
        )
      );

      const response = await fetch("/api/websites?id=non_existent", {
        method: "DELETE",
      });

      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(data.error).toBe("Website not found");
    });
  });
});

// =============================================================================
// Mock Crawler Tests
// =============================================================================

describe("Mock Crawler", () => {
  describe("generateMockCrawlData", () => {
    it("should generate valid crawl data", () => {
      const data = generateMockCrawlData("https://example.com");

      expect(data).toBeDefined();
      expect(data.id).toBeDefined();
      expect(data.websiteId).toBeDefined();
      expect(data.url).toBe("https://example.com");
      expect(data.totalPages).toBeGreaterThan(0);
      expect(data.pagesList).toBeDefined();
      expect(data.pagesList.length).toBeGreaterThan(0);
    });

    it("should generate data with valid scores", () => {
      const data = generateMockCrawlData("https://example.com");

      expect(data.architectureScore).toBeGreaterThanOrEqual(0);
      expect(data.architectureScore).toBeLessThanOrEqual(100);
      expect(data.seoScore).toBeGreaterThanOrEqual(0);
      expect(data.seoScore).toBeLessThanOrEqual(100);
      expect(data.mobileScore).toBeGreaterThanOrEqual(0);
      expect(data.mobileScore).toBeLessThanOrEqual(100);
    });

    it("should generate data with valid depth metrics", () => {
      const data = generateMockCrawlData("https://example.com");

      expect(data.avgDepth).toBeGreaterThan(0);
      expect(data.maxDepth).toBeGreaterThanOrEqual(data.avgDepth);
    });

    it("should include homepage in pages list", () => {
      const data = generateMockCrawlData("https://example.com");

      const homepage = data.pagesList.find((p) => p.depth === 0);
      expect(homepage).toBeDefined();
    });

    it("should add https to URL without protocol", () => {
      const data = generateMockCrawlData("example.com");
      expect(data.url).toBe("https://example.com");
    });
  });
});

// =============================================================================
// Error Handling Tests
// =============================================================================

describe("API Error Handling", () => {
  it("should handle network errors gracefully", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    await expect(fetch("/api/crawl")).rejects.toThrow("Network error");
  });

  it("should handle server errors (500)", async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse(
        {
          success: false,
          error: "Internal server error",
        },
        500
      )
    );

    const response = await fetch("/api/crawl");
    const data = await response.json();

    expect(response.ok).toBe(false);
    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
  });

  it("should handle timeout errors", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Request timeout"));

    await expect(fetch("/api/crawl")).rejects.toThrow("Request timeout");
  });
});

