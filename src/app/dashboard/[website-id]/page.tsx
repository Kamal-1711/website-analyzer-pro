"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAppStore } from "@/lib/store";
import { generateMockCrawlData } from "@/lib/crawler";
import type { CrawlData } from "@/types";

// =============================================================================
// PAGE COMPONENT
// =============================================================================

/**
 * Dashboard Page - Displays crawl results for a specific website
 *
 * Features:
 * - Loads website from Zustand store
 * - Falls back to mock data for demo purposes
 * - Shows loading and error states
 * - DashboardLayout handles all tabs
 */
export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  
  // Decode the websiteId to handle URL-encoded characters consistently
  const rawWebsiteId = params["website-id"] as string;
  const websiteId = typeof rawWebsiteId === "string" ? decodeURIComponent(rawWebsiteId) : rawWebsiteId;

  // Get website from store
  const websites = useAppStore((state) => state.websites);
  const setActiveWebsite = useAppStore((state) => state.setActiveWebsite);

  // Local state - use stable initial values to avoid hydration mismatch
  const [crawlData, setCrawlData] = useState<CrawlData | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState<string>("Loading...");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load crawl data for the website
   */
  const loadCrawlData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Find website in store
      const website = websites.find((w) => w.id === websiteId);

      if (website) {
        // Set as active website
        setActiveWebsite(website);
        setWebsiteUrl(website.url);

        // Generate mock crawl data for this website
        // In production, this would fetch from API
        const data = generateMockCrawlData(website.url);
        data.websiteId = website.id;
        setCrawlData(data);
      } else if (websiteId === "demo-website") {
        // Demo mode - generate mock data for demo
        const demoUrl = "https://example.com";
        setWebsiteUrl(demoUrl);
        const data = generateMockCrawlData(demoUrl);
        setCrawlData(data);
      } else {
        // Website not found
        setError("Website not found. It may have been deleted.");
      }
    } catch (err) {
      console.error("Error loading crawl data:", err);
      setError("Failed to load crawl data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [websiteId, websites, setActiveWebsite]);

  // Load data on mount
  useEffect(() => {
    loadCrawlData();
  }, [loadCrawlData]);

  // Cleanup active website on unmount
  useEffect(() => {
    return () => {
      setActiveWebsite(null);
    };
  }, [setActiveWebsite]);

  // ==========================================================================
  // ERROR STATE
  // ==========================================================================

  if (error && !isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          {/* Error Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-red-500" />
          </div>

          {/* Error Message */}
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Oops! Something went wrong
          </h1>
          <p className="text-muted-foreground mb-8">{error}</p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => loadCrawlData()}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <Link href="/">
              <Button className="gap-2 bg-violet-600 hover:bg-violet-700">
                <Home className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ==========================================================================
  // LOADING STATE (handled by DashboardLayout)
  // ==========================================================================

  // ==========================================================================
  // MAIN DASHBOARD
  // ==========================================================================

  return (
    <DashboardLayout
      crawlData={crawlData}
      websiteUrl={websiteUrl}
      isLoading={isLoading}
      error={error}
    />
  );
}
