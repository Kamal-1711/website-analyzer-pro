"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { WS_CONFIG, type WSEventType, type CrawlProgressData, type PageAnalyzedData } from "@/app/api/ws";

interface UseRealtimeOptions {
  onCrawlProgress?: (data: CrawlProgressData) => void;
  onPageAnalyzed?: (data: PageAnalyzedData) => void;
  onError?: (error: Error) => void;
  autoConnect?: boolean;
}

export function useRealtime(options: UseRealtimeOptions = {}) {
  const {
    onCrawlProgress,
    onPageAnalyzed,
    onError,
    autoConnect = false,
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }

    try {
      socketRef.current = io(WS_CONFIG.url, WS_CONFIG.socketOptions);

      socketRef.current.on("connect", () => {
        setIsConnected(true);
        setConnectionError(null);
        console.log("WebSocket connected");
      });

      socketRef.current.on("disconnect", () => {
        setIsConnected(false);
        console.log("WebSocket disconnected");
      });

      socketRef.current.on("connect_error", (error) => {
        setConnectionError(error.message);
        onError?.(error);
        console.error("WebSocket connection error:", error);
      });

      // Listen for crawl progress
      socketRef.current.on(WS_CONFIG.events.CRAWL_PROGRESS, (data: CrawlProgressData) => {
        onCrawlProgress?.(data);
      });

      // Listen for page analyzed
      socketRef.current.on(WS_CONFIG.events.PAGE_ANALYZED, (data: PageAnalyzedData) => {
        onPageAnalyzed?.(data);
      });

    } catch (error) {
      const err = error instanceof Error ? error : new Error("Failed to connect");
      setConnectionError(err.message);
      onError?.(err);
    }
  }, [onCrawlProgress, onPageAnalyzed, onError]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const emit = useCallback((event: WSEventType, data: unknown) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn("WebSocket not connected. Cannot emit:", event);
    }
  }, []);

  const subscribe = useCallback((event: WSEventType, callback: (data: unknown) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
      return () => {
        socketRef.current?.off(event, callback);
      };
    }
    return () => {};
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    isConnected,
    connectionError,
    connect,
    disconnect,
    emit,
    subscribe,
  };
}

