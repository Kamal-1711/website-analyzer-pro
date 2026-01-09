"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  slideInFromBottom,
  staggerContainer,
  staggerItem,
  smoothTransition,
  springTransition,
  scaleInCenter,
} from "@/lib/animations";
import {
  Sparkles,
  Globe,
  Zap,
  TrendingUp,
  Shield,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  LayoutDashboard,
  Menu,
} from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { InputBox } from "./InputBox";
import { ChatHistory } from "./ChatHistory";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerDescription,
} from "@/components/ui/drawer";
import { MessageSkeleton } from "@/components/shared/LoadingSkeleton";
import { useToast } from "@/components/shared/Toast";
import { useAppStore } from "@/lib/store";
import {
  generateId,
  getWebsiteNameFromUrl,
  normalizeUrl,
  isValidUrl,
} from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  trackCrawlStarted,
  trackCrawlCompleted,
  trackCrawlFailed,
  trackWebsiteDeleted,
  EVENTS,
  trackEvent,
} from "@/lib/analytics";
import type { CrawlMessage, Website } from "@/types";

// =============================================================================
// EXAMPLE WEBSITES
// =============================================================================

const EXAMPLE_WEBSITES = [
  {
    url: "stripe.com",
    label: "Stripe",
    description: "Modern fintech design",
  },
  {
    url: "vercel.com",
    label: "Vercel",
    description: "Developer-focused UX",
  },
  {
    url: "linear.app",
    label: "Linear",
    description: "Clean SaaS interface",
  },
];

// =============================================================================
// WELCOME STATE COMPONENT
// =============================================================================

interface WelcomeStateProps {
  onSelectExample: (url: string) => void;
}

function WelcomeState({ onSelectExample }: WelcomeStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center flex-1 px-6 py-12 text-center"
    >
      {/* Logo/Icon */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="relative mb-8"
      >
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-purple-500/30">
          <Sparkles className="h-10 w-10 text-white" />
        </div>
        {/* Decorative rings */}
        <div className="absolute -inset-4 rounded-[2rem] border border-violet-500/20 animate-pulse" />
        <div className="absolute -inset-8 rounded-[2.5rem] border border-violet-500/10" />
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-bold text-foreground mb-3"
      >
        Website Analyzer Pro
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-muted-foreground max-w-md mb-8"
      >
        Enter any website URL to get comprehensive insights on architecture,
        SEO, performance, and more.
      </motion.p>

      {/* Features grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-3 gap-4 mb-10 max-w-lg"
      >
        {[
          { icon: Globe, label: "Full Site Crawl" },
          { icon: TrendingUp, label: "SEO Analysis" },
          { icon: Zap, label: "Performance" },
        ].map(({ icon: Icon, label }, index) => (
          <motion.div
            key={label}
            variants={staggerItem}
            whileHover={{ scale: 1.05, y: -4 }}
            transition={smoothTransition}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 border border-border hover:border-violet-500/30 transition-colors"
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Icon className="h-5 w-5 text-violet-500" />
            </motion.div>
            <span className="text-xs text-muted-foreground">{label}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Example websites */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-md"
      >
        <p className="text-sm text-muted-foreground mb-3">Try an example:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {EXAMPLE_WEBSITES.map((example) => (
            <motion.button
              key={example.url}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectExample(example.url)}
              className="group flex items-center gap-2 px-4 py-2 rounded-full bg-muted hover:bg-muted-foreground/10 border border-border hover:border-violet-500/30 transition-all duration-200"
            >
              <Globe className="h-3.5 w-3.5 text-muted-foreground group-hover:text-violet-500 transition-colors" />
              <span className="text-sm font-medium">{example.label}</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// =============================================================================
// ERROR MESSAGE COMPONENT
// =============================================================================

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50"
    >
      <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-red-700 dark:text-red-300">{message}</p>
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="mt-2 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
          >
            <RefreshCw className="h-3 w-3 mr-1.5" />
            Try Again
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// =============================================================================
// HEADER COMPONENT
// =============================================================================

interface ChatHeaderProps {
  onToggleSidebar?: () => void;
}

interface ChatHeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

function ChatHeader({ onToggleSidebar, isSidebarOpen = true }: ChatHeaderProps) {
  return (
    <div className="flex-shrink-0 flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {onToggleSidebar && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="lg:hidden h-9 w-9 flex-shrink-0"
            title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">
            Website Analyzer Pro
          </h1>
          <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
            AI-powered website analysis
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] sm:text-xs font-medium hidden sm:inline">Ready</span>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * ChatInterface - Main chat interface for website analysis
 *
 * Features:
 * - Two-column layout with sidebar and main chat area
 * - URL submission and crawl progress tracking
 * - Real-time progress updates
 * - Welcome state with example websites
 * - Error handling with retry
 * - Smooth animations throughout
 *
 * @example
 * ```tsx
 * <ChatInterface />
 * ```
 */
export function ChatInterface() {
  const router = useRouter();
  const toast = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [lastCompletedWebsite, setLastCompletedWebsite] = useState<Website | null>(null);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Zustand store
  const {
    websites,
    messages,
    activeWebsite,
    isCrawling,
    crawlProgress,
    addMessage,
    updateMessage,
    clearMessages,
    addWebsite,
    deleteWebsite,
    setActiveWebsite,
    setCrawling,
    setProgress,
  } = useAppStore();

  // Auto-scroll to bottom when new messages arrive or crawl completes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, lastCompletedWebsite]);

  /**
   * Handle URL submission
   */
  const handleSubmit = useCallback(
    async (url: string) => {
      setError(null);

      // Normalize and validate URL
      const normalizedUrl = normalizeUrl(url);
      if (!isValidUrl(normalizedUrl)) {
        setError("Please enter a valid website URL");
        return;
      }

      const websiteName = getWebsiteNameFromUrl(normalizedUrl);

      // Add user message
      const userMessage: CrawlMessage = {
        id: generateId("msg"),
        type: "user",
        content: normalizedUrl,
        timestamp: new Date(),
        websiteUrl: normalizedUrl,
      };
      addMessage(userMessage);

      // Start crawling
      setCrawling(true);
      setLastCompletedWebsite(null); // Clear previous completed website
      
      // Track crawl started
      trackCrawlStarted(normalizedUrl);
      
      // Show loading toast
      const loadingToastId = toast.loading("Analyzing website...", `Starting analysis of ${websiteName}`);

      // Create a single crawling status message (no pending state)
      const crawlMessageId = generateId("msg");
      const crawlingMessage: CrawlMessage = {
        id: crawlMessageId,
        type: "status",
        content: `Analyzing ${websiteName}... Discovering pages and analyzing content.`,
        timestamp: new Date(),
        websiteUrl: normalizedUrl,
        crawlProgress: 5,
        status: "crawling",
      };
      addMessage(crawlingMessage);

      try {
        // Simulate crawl progress (replace with actual API call)
        let progress = 5;

        // Simulate progress updates - UPDATE the existing message instead of adding new ones
        const progressInterval = setInterval(() => {
          progress += Math.random() * 15 + 5;
          if (progress > 95) progress = 95;

          const roundedProgress = Math.round(progress);
          setProgress(roundedProgress);

          // Update the existing crawling message
          updateMessage(crawlMessageId, {
            crawlProgress: roundedProgress,
            timestamp: new Date(),
          });
        }, 1500);

        // Simulate API call - replace with actual implementation
        await new Promise((resolve) => setTimeout(resolve, 5000));

        // Clear interval and complete
        clearInterval(progressInterval);
        setProgress(100);

        // Create website entry
        const newWebsite: Website = {
          id: generateId("ws"),
          url: normalizedUrl,
          name: websiteName,
          pageCount: Math.floor(Math.random() * 500) + 50,
          status: "completed",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        addWebsite(newWebsite);
        setActiveWebsite(newWebsite);
        setLastCompletedWebsite(newWebsite);
        
        // Track crawl completed
        trackCrawlCompleted(normalizedUrl, newWebsite.pageCount);
        
        // Update toast to success
        toast.removeToast(loadingToastId);
        toast.success(
          `Website analyzed! ✅`,
          `Found ${newWebsite.pageCount} pages on ${websiteName}`
        );

        // Update the existing crawling message to show completion with progress bar at 100%
        updateMessage(crawlMessageId, {
          content: `✨ Analysis complete! Found ${newWebsite.pageCount} pages on ${websiteName}.`,
          crawlProgress: 100,
          status: "completed",
          timestamp: new Date(),
        });

        // Add system message with next steps
        const nextStepsMessage: CrawlMessage = {
          id: generateId("msg"),
          type: "system",
          content: `Great news! I've finished analyzing ${websiteName}. Here's what I found:\n\n📊 **${newWebsite.pageCount} pages** discovered\n🔗 Site architecture mapped\n🔍 SEO analysis complete\n⚡ Performance metrics collected\n\nReady to explore the results?`,
          timestamp: new Date(),
          websiteUrl: newWebsite.id,
        };
        addMessage(nextStepsMessage);

        setCrawling(false);

        // Optional: Auto-navigate to dashboard after a delay
        // setTimeout(() => router.push(`/dashboard/${newWebsite.id}`), 2000);
      } catch (err) {
        setCrawling(false);
        setProgress(0);

        const errorMsg =
          err instanceof Error ? err.message : "Failed to analyze website";
        setError(errorMsg);
        
        // Track crawl failed
        trackCrawlFailed(normalizedUrl, errorMsg);
        
        // Update toast to error
        toast.removeToast(loadingToastId);
        toast.error(
          "Failed to analyze",
          errorMsg || "Please try again later"
        );

        // Update the existing crawling message to show error
        updateMessage(crawlMessageId, {
          content: `❌ Failed to analyze ${websiteName}. ${errorMsg}`,
          status: "error",
          crawlProgress: 0,
          timestamp: new Date(),
        });
      }
    },
    [
      addMessage,
      updateMessage,
      addWebsite,
      setActiveWebsite,
      setCrawling,
      setProgress,
      toast,
    ]
  );

  /**
   * Handle example website selection
   */
  const handleSelectExample = useCallback((url: string) => {
    setInputValue(url);
    handleSubmit(url);
  }, [handleSubmit]);

  /**
   * Handle website selection from sidebar
   */
  const handleSelectWebsite = useCallback(
    (website: Website) => {
      setLastCompletedWebsite(null);
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
      // Find website before deleting to get name for tracking
      const website = websites.find((w) => w.id === id);
      
      // Track deletion
      trackWebsiteDeleted(id, website?.name);
      
      deleteWebsite(id);
      if (activeWebsite?.id === id) {
        setActiveWebsite(null);
      }
    },
    [deleteWebsite, activeWebsite, setActiveWebsite, websites]
  );

  /**
   * Handle new crawl button
   */
  const handleNewCrawl = useCallback(() => {
    clearMessages();
    setActiveWebsite(null);
    setLastCompletedWebsite(null);
    setError(null);
  }, [clearMessages, setActiveWebsite]);

  /**
   * Navigate to dashboard
   */
  const handleWebsiteClick = useCallback(
    (websiteId: string) => {
      router.push(`/dashboard/${websiteId}`);
    },
    [router]
  );

  // Check if we should show welcome state
  const showWelcome = messages.length === 0 && !isCrawling;

  const toggleDesktopSidebar = useCallback(() => {
    setIsDesktopSidebarOpen((prev) => !prev);
  }, []);

  const toggleMobileDrawer = useCallback(() => {
    setIsMobileDrawerOpen((prev) => !prev);
  }, []);

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden lg:block">
        <ChatHistory
          websites={websites}
          activeWebsite={activeWebsite}
          onSelectWebsite={handleSelectWebsite}
          onDeleteWebsite={handleDeleteWebsite}
          onNewCrawl={handleNewCrawl}
          isOpen={isDesktopSidebarOpen}
          onToggle={toggleDesktopSidebar}
        />
      </div>

      {/* Mobile Drawer - only renders on mobile */}
      <Drawer open={isMobileDrawerOpen} onOpenChange={setIsMobileDrawerOpen}>
        <DrawerContent 
          className="h-[85vh] w-[280px] max-w-[85vw]"
          data-vaul-drawer-direction="left"
        >
          <DrawerHeader className="sr-only">
            <DrawerTitle>Website History</DrawerTitle>
            <DrawerDescription>Browse and manage your analyzed websites</DrawerDescription>
          </DrawerHeader>
          <div className="h-full overflow-hidden">
            <ChatHistory
              websites={websites}
              activeWebsite={activeWebsite}
              onSelectWebsite={(website) => {
                handleSelectWebsite(website);
                setIsMobileDrawerOpen(false);
              }}
              onDeleteWebsite={handleDeleteWebsite}
              onNewCrawl={() => {
                handleNewCrawl();
                setIsMobileDrawerOpen(false);
              }}
              isOpen={true}
              onToggle={() => setIsMobileDrawerOpen(false)}
            />
          </div>
        </DrawerContent>
      </Drawer>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <ChatHeader onToggleSidebar={toggleMobileDrawer} isSidebarOpen={isMobileDrawerOpen} />

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          {showWelcome ? (
            <WelcomeState onSelectExample={handleSelectExample} />
          ) : (
            <motion.div
              className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence mode="popLayout">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    variants={slideInFromBottom}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{
                      ...smoothTransition,
                      delay: index * 0.05,
                    }}
                  >
                    <ChatMessage
                      message={message}
                      onWebsiteClick={handleWebsiteClick}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Error display */}
              {error && (
                <ErrorMessage
                  message={error}
                  onRetry={() => {
                    setError(null);
                    // Optionally retry the last URL
                  }}
                />
              )}

              {/* View Dashboard Button - shown after successful crawl */}
              {lastCompletedWebsite && !isCrawling && (
                <motion.div
                  variants={scaleInCenter}
                  initial="hidden"
                  animate="visible"
                  transition={springTransition}
                  className="flex justify-center py-6"
                >
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={smoothTransition}
                  >
                    <Button
                      onClick={() => {
                        router.push(`/dashboard/${lastCompletedWebsite.id}`);
                        setLastCompletedWebsite(null);
                      }}
                      size="lg"
                      className="gap-2 sm:gap-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-xl shadow-purple-500/30 px-4 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-semibold"
                    >
                      <LayoutDashboard className="h-5 w-5 sm:h-6 sm:w-6" />
                      <span className="hidden sm:inline">View Dashboard</span>
                      <span className="sm:hidden">Dashboard</span>
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </motion.div>
                </motion.div>
              )}

              {/* Scroll anchor */}
            <div ref={messagesEndRef} />
            </motion.div>
          )}
          </div>

        {/* Input area */}
        <div className="flex-shrink-0 border-t border-border bg-background/80 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
            <InputBox
              onSubmit={handleSubmit}
              isLoading={isCrawling}
              disabled={isCrawling}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
