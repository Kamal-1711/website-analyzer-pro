"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  tabContentVariants,
  smoothTransition,
  fadeIn,
} from "@/lib/animations";
import {
  ArrowLeft,
  Download,
  Share2,
  FileText,
  FileSpreadsheet,
  Image,
  LayoutDashboard,
  Network,
  BarChart3,
  ClipboardCheck,
  Search,
  GitBranch,
  ChevronDown,
  Loader2,
  AlertTriangle,
  ExternalLink,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChatHistory } from "@/components/chat/ChatHistory";
import { cn, getWebsiteNameFromUrl } from "@/lib/utils";
import { trackTabViewed, trackExportClicked, trackEvent, EVENTS } from "@/lib/analytics";
import { useAppStore } from "@/lib/store";
import type { CrawlData, DashboardTab, Website } from "@/types";
import {
  OverviewTabSkeleton,
  NetworkTabSkeleton,
  StatisticsTabSkeleton,
  AuditTabSkeleton,
  SEOTabSkeleton,
  MindMapTabSkeleton,
  Skeleton,
} from "@/components/shared/LoadingSkeleton";

// Lazy load tab components
import { OverviewTab } from "./OverviewTab";
import { NetworkTab } from "./NetworkTab";
import { StatisticsTab } from "./StatisticsTab";
import { AuditTab } from "./AuditTab";
import { SEOTab } from "./SEOTab";
import { MindMapTab } from "./MindMapTab";

// =============================================================================
// TYPES
// =============================================================================

interface DashboardLayoutProps {
  /** Crawl data for the website */
  crawlData: CrawlData | null;
  /** URL of the website being analyzed */
  websiteUrl: string;
  /** Whether data is loading */
  isLoading?: boolean;
  /** Error message if any */
  error?: string | null;
}

interface TabConfig {
  id: DashboardTab;
  label: string;
  icon: React.ElementType;
  description: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const TABS: TabConfig[] = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    description: "Website health summary",
  },
  {
    id: "network",
    label: "Network",
    icon: Network,
    description: "Link structure analysis",
  },
  {
    id: "statistics",
    label: "Statistics",
    icon: BarChart3,
    description: "Performance metrics",
  },
  {
    id: "audit",
    label: "Audit",
    icon: ClipboardCheck,
    description: "Issue detection",
  },
  {
    id: "seo",
    label: "SEO",
    icon: Search,
    description: "Search optimization",
  },
  {
    id: "mindmap",
    label: "Mind Map",
    icon: GitBranch,
    description: "Site structure visualization",
  },
];

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

// Use imported tabContentVariants from animations
const contentVariants = tabContentVariants;

// =============================================================================
// EXPORT DROPDOWN COMPONENT
// =============================================================================

interface ExportDropdownProps {
  websiteName: string;
}

function ExportDropdown({ websiteName }: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const exportOptions = [
    {
      label: "Audit Report (PDF)",
      icon: FileText,
      format: "pdf",
      action: () => {
        console.log("Exporting PDF...");
        trackExportClicked("pdf", websiteName);
        // TODO: Implement PDF export
        alert(`Exporting PDF report for ${websiteName}...`);
      },
    },
    {
      label: "Raw Data (CSV)",
      icon: FileSpreadsheet,
      format: "csv",
      action: () => {
        console.log("Exporting CSV...");
        trackExportClicked("csv", websiteName);
        // TODO: Implement CSV export
        alert(`Exporting CSV data for ${websiteName}...`);
      },
    },
    {
      label: "Visualization (PNG)",
      icon: Image,
      format: "png",
      action: () => {
        console.log("Exporting PNG...");
        trackExportClicked("png", websiteName);
        // TODO: Implement PNG export
        alert(`Exporting PNG visualization for ${websiteName}...`);
      },
    },
  ];

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Export</span>
        <ChevronDown
          className={cn(
            "h-3 w-3 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 z-50 w-56 rounded-lg border border-border bg-popover p-1 shadow-lg"
            >
              {exportOptions.map((option) => (
                <button
                  key={option.label}
                  onClick={() => {
                    option.action();
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <option.icon className="h-4 w-4 text-muted-foreground" />
                  {option.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// LOADING STATE COMPONENT
// =============================================================================

function LoadingState() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Loading indicator */}
        <motion.div
          className="flex items-center gap-3 mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
              <Loader2 className="h-5 w-5 text-violet-500 animate-spin" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Loading Dashboard</p>
            <p className="text-xs text-muted-foreground">Preparing your analysis data...</p>
          </div>
        </motion.div>

        {/* Tabs skeleton */}
        <div className="flex gap-2 pb-2 border-b border-border/50">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-md" />
          ))}
        </div>

        {/* Overview skeleton */}
        <OverviewTabSkeleton />
      </div>
    </div>
  );
}

// =============================================================================
// ERROR STATE COMPONENT
// =============================================================================

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="mt-6 text-lg font-medium text-foreground">
        Error Loading Data
      </h3>
      <p className="mt-2 text-sm text-muted-foreground text-center max-w-md">
        {message}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="mt-4">
          Try Again
        </Button>
      )}
    </div>
  );
}

// =============================================================================
// TAB CONTENT RENDERER
// =============================================================================

interface TabContentRendererProps {
  activeTab: DashboardTab;
  crawlData: CrawlData;
}

function TabContentRenderer({ activeTab, crawlData }: TabContentRendererProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        variants={contentVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="h-full"
      >
        {activeTab === "overview" && <OverviewTab crawlData={crawlData} />}
        {activeTab === "network" && <NetworkTab crawlData={crawlData} />}
        {activeTab === "statistics" && <StatisticsTab crawlData={crawlData} />}
        {activeTab === "audit" && <AuditTab crawlData={crawlData} />}
        {activeTab === "seo" && <SEOTab crawlData={crawlData} />}
        {activeTab === "mindmap" && <MindMapTab crawlData={crawlData} />}
      </motion.div>
    </AnimatePresence>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * DashboardLayout - Main dashboard wrapper with tabs
 *
 * Features:
 * - Header with website info and actions
 * - 6-tab navigation (Overview, Network, Statistics, Audit, SEO, Mind Map)
 * - Smooth tab transitions with Framer Motion
 * - Export dropdown with PDF, CSV, PNG options
 * - Loading and error states
 *
 * @example
 * ```tsx
 * <DashboardLayout
 *   crawlData={crawlData}
 *   websiteUrl="https://example.com"
 *   isLoading={false}
 * />
 * ```
 */
export function DashboardLayout({
  crawlData,
  websiteUrl,
  isLoading = false,
  error = null,
}: DashboardLayoutProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Get websites and active website from store
  const websites = useAppStore((state) => state.websites);
  const activeWebsite = useAppStore((state) => state.activeWebsite);
  const setActiveWebsite = useAppStore((state) => state.setActiveWebsite);
  const deleteWebsite = useAppStore((state) => state.deleteWebsite);

  const websiteName = getWebsiteNameFromUrl(websiteUrl);

  /**
   * Handle back button click
   */
  const handleBack = useCallback(() => {
    router.push("/");
  }, [router]);

  /**
   * Handle share button click
   */
  const handleShare = useCallback(() => {
    // Track share click
    trackEvent(EVENTS.SHARE_CLICKED, { websiteName });
    // Copy URL to clipboard
    navigator.clipboard.writeText(window.location.href);
    alert("Dashboard URL copied to clipboard!");
  }, [websiteName]);

  /**
   * Handle tab change
   */
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as DashboardTab);
    // Track tab view
    trackTabViewed(value);
  }, []);

  /**
   * Handle website selection from sidebar
   */
  const handleSelectWebsite = useCallback(
    (website: Website) => {
      setActiveWebsite(website);
      router.push(`/dashboard/${website.id}`);
    },
    [setActiveWebsite, router]
  );

  /**
   * Handle website deletion
   */
  const handleDeleteWebsite = useCallback(
    (id: string) => {
      deleteWebsite(id);
      if (activeWebsite?.id === id) {
        setActiveWebsite(null);
        router.push("/");
      }
    },
    [deleteWebsite, activeWebsite, setActiveWebsite, router]
  );

  /**
   * Handle new crawl button
   */
  const handleNewCrawl = useCallback(() => {
    setActiveWebsite(null);
    router.push("/");
  }, [setActiveWebsite, router]);

  /**
   * Toggle sidebar
   */
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Toggleable on desktop */}
      <div className="hidden lg:block">
        <ChatHistory
          websites={websites}
          activeWebsite={activeWebsite}
          onSelectWebsite={handleSelectWebsite}
          onDeleteWebsite={handleDeleteWebsite}
          onNewCrawl={handleNewCrawl}
          isOpen={isSidebarOpen}
          onToggle={toggleSidebar}
        />
      </div>

      {/* Main dashboard content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3">
            {/* Left section: Back button + Website info */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-9 w-9"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 flex-shrink-0">
                  <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">
                    {websiteName}
                  </h1>
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground hover:text-violet-500 transition-colors"
                  >
                    <span className="truncate max-w-[120px] sm:max-w-[200px] md:max-w-[250px] lg:max-w-[300px]">
                      {websiteUrl}
                    </span>
                    <ExternalLink className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                  </a>
                </div>
              </div>
            </div>

            {/* Right section: Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="gap-1.5 sm:gap-2 h-9 sm:h-auto"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
              </Button>

              <ExportDropdown websiteName={websiteName} />
            </div>
          </div>
        </header>

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={() => router.refresh()} />
        ) : !crawlData ? (
          <ErrorState message="No data available for this website." />
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Tab navigation */}
            <div className="flex-shrink-0 border-b border-border">
              <div className="overflow-x-auto scrollbar-hide">
                <TabsList className="h-12 bg-transparent p-0 gap-0 min-w-max inline-flex">
                  {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className={cn(
                          "relative h-12 px-3 sm:px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-violet-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                          "hover:bg-muted/50 transition-colors min-w-[44px] sm:min-w-auto",
                          "flex-shrink-0"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4 sm:mr-2",
                            isActive
                              ? "text-violet-500"
                              : "text-muted-foreground"
                          )}
                        />
                        <span
                          className={cn(
                            "hidden md:inline",
                            isActive
                              ? "text-foreground font-medium"
                              : "text-muted-foreground"
                          )}
                        >
                          {tab.label}
                        </span>

                      {/* Active indicator animation */}
                      {isActive && (
                        <motion.div
                          layoutId="activeTabIndicator"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500"
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                        />
                      )}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              </div>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-auto">
              {TABS.map((tab) => (
                <TabsContent
                  key={tab.id}
                  value={tab.id}
                  className="h-full m-0 p-3 sm:p-4 md:p-6"
                >
                  <TabContentRenderer
                    activeTab={tab.id}
                    crawlData={crawlData}
                  />
                </TabsContent>
              ))}
            </div>
          </Tabs>
        )}
        </div>
      </div>
    </div>
  );
}
