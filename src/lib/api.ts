import type { Website, CrawlResponse, CrawlStatus } from "@/types";

const API_BASE = "/api";

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || "An error occurred",
      response.status,
      data
    );
  }

  return data as T;
}

export const api = {
  // Website endpoints
  async getWebsites(): Promise<Website[]> {
    return fetchApi<Website[]>("/websites");
  },

  async getWebsite(id: string): Promise<Website> {
    return fetchApi<Website>(`/websites?id=${id}`);
  },

  async createWebsite(url: string, name?: string): Promise<Website> {
    return fetchApi<Website>("/websites", {
      method: "POST",
      body: JSON.stringify({ url, name }),
    });
  },

  async deleteWebsite(id: string): Promise<void> {
    await fetchApi(`/websites?id=${id}`, {
      method: "DELETE",
    });
  },

  // Crawl endpoints
  async startCrawl(url: string): Promise<CrawlResponse> {
    return fetchApi<CrawlResponse>("/crawl", {
      method: "POST",
      body: JSON.stringify({ url }),
    });
  },

  async getCrawlStatus(crawlId: string): Promise<CrawlStatus> {
    return fetchApi<CrawlStatus>(`/crawl?id=${crawlId}`);
  },

  async cancelCrawl(crawlId: string): Promise<void> {
    await fetchApi(`/crawl?id=${crawlId}`, {
      method: "DELETE",
    });
  },

  // Analysis endpoints (to be implemented)
  async getAnalysis(websiteId: string) {
    return fetchApi(`/analysis?websiteId=${websiteId}`);
  },

  async getSEOReport(websiteId: string) {
    return fetchApi(`/analysis/seo?websiteId=${websiteId}`);
  },

  async getPerformanceReport(websiteId: string) {
    return fetchApi(`/analysis/performance?websiteId=${websiteId}`);
  },

  async getAccessibilityReport(websiteId: string) {
    return fetchApi(`/analysis/accessibility?websiteId=${websiteId}`);
  },
};

export { ApiError };

