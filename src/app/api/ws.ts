/**
 * WebSocket configuration for real-time updates
 * 
 * Note: Next.js App Router doesn't natively support WebSocket routes.
 * For real-time features, consider using:
 * 1. Server-Sent Events (SSE) - works with App Router
 * 2. Polling with API routes
 * 3. External WebSocket server (Socket.io)
 * 4. Third-party services (Pusher, Ably, etc.)
 * 
 * This file provides a configuration for Socket.io client connection.
 */

export const WS_CONFIG = {
  // WebSocket server URL (update when you have a WebSocket server)
  url: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001",
  
  // Socket.io configuration
  socketOptions: {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  },
  
  // Event types for type safety
  events: {
    // Crawl events
    CRAWL_STARTED: "crawl:started",
    CRAWL_PROGRESS: "crawl:progress",
    CRAWL_COMPLETED: "crawl:completed",
    CRAWL_ERROR: "crawl:error",
    
    // Page events
    PAGE_DISCOVERED: "page:discovered",
    PAGE_ANALYZED: "page:analyzed",
    
    // Chat events
    CHAT_MESSAGE: "chat:message",
    CHAT_RESPONSE: "chat:response",
  },
} as const;

export type WSEventType = typeof WS_CONFIG.events[keyof typeof WS_CONFIG.events];

export interface WSMessage<T = unknown> {
  event: WSEventType;
  data: T;
  timestamp: string;
}

export interface CrawlProgressData {
  crawlId: string;
  progress: number;
  pagesScanned: number;
  currentUrl: string;
}

export interface PageAnalyzedData {
  crawlId: string;
  url: string;
  title: string;
  statusCode: number;
  loadTime: number;
}

