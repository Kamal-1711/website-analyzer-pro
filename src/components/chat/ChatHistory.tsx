"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Globe,
  Trash2,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ChevronDown,
  Search,
  Sparkles,
  X,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, getWebsiteNameFromUrl, formatNumber } from "@/lib/utils";
import type { Website, WebsiteStatus } from "@/types";

// =============================================================================
// TYPES
// =============================================================================

interface ChatHistoryProps {
  /** List of all websites */
  websites: Website[];
  /** Currently active website */
  activeWebsite: Website | null;
  /** Callback when a website is selected */
  onSelectWebsite: (website: Website) => void;
  /** Callback when a website is deleted */
  onDeleteWebsite: (id: string) => void;
  /** Callback for new crawl button */
  onNewCrawl?: () => void;
  /** Whether sidebar is open */
  isOpen?: boolean;
  /** Callback to toggle sidebar */
  onToggle?: () => void;
}

interface DateGroup {
  label: string;
  websites: Website[];
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Groups websites by date periods (Today, Yesterday, This Week, Earlier)
 */
function groupWebsitesByDate(websites: Website[]): DateGroup[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const groups: Record<string, Website[]> = {
    Today: [],
    Yesterday: [],
    "This Week": [],
    Earlier: [],
  };

  // Sort websites by createdAt (newest first)
  const sortedWebsites = [...websites].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  sortedWebsites.forEach((website) => {
    const websiteDate = new Date(website.createdAt);
    const websiteDateOnly = new Date(
      websiteDate.getFullYear(),
      websiteDate.getMonth(),
      websiteDate.getDate()
    );

    if (websiteDateOnly.getTime() === today.getTime()) {
      groups.Today.push(website);
    } else if (websiteDateOnly.getTime() === yesterday.getTime()) {
      groups.Yesterday.push(website);
    } else if (websiteDateOnly.getTime() > weekAgo.getTime()) {
      groups["This Week"].push(website);
    } else {
      groups.Earlier.push(website);
    }
  });

  // Return only non-empty groups
  return Object.entries(groups)
    .filter(([, sites]) => sites.length > 0)
    .map(([label, sites]) => ({ label, websites: sites }));
}

/**
 * Format time for display
 */
function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// =============================================================================
// STATUS BADGE COMPONENT
// =============================================================================

function StatusBadge({ status }: { status: WebsiteStatus }) {
  const config = {
    completed: {
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    pending: {
      icon: Loader2,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      animate: true,
    },
    failed: {
      icon: AlertCircle,
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
  }[status];

  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center",
        config.bg
      )}
    >
      <Icon
        className={cn(
          "h-3 w-3",
          config.color,
          config.animate && "animate-spin"
        )}
      />
    </div>
  );
}

// =============================================================================
// WEBSITE ITEM COMPONENT
// =============================================================================

interface WebsiteItemProps {
  website: Website;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function WebsiteItem({
  website,
  isActive,
  onSelect,
  onDelete,
}: WebsiteItemProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (showDeleteConfirm) {
        onDelete();
        setShowDeleteConfirm(false);
      } else {
        setShowDeleteConfirm(true);
        setTimeout(() => setShowDeleteConfirm(false), 3000);
      }
    },
    [showDeleteConfirm, onDelete]
  );

  const websiteName = getWebsiteNameFromUrl(website.url);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20, height: 0 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowDeleteConfirm(false);
      }}
      onClick={() => onSelect()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "group relative flex items-start gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200",
        isActive
          ? "bg-violet-500/10 border border-violet-500/20"
          : "hover:bg-muted/80 border border-transparent"
      )}
    >
      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-violet-500 rounded-r-full"
        />
      )}

      {/* Website icon */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
          isActive
            ? "bg-violet-500/20 text-violet-500"
            : "bg-muted text-muted-foreground group-hover:bg-muted-foreground/10"
        )}
      >
        <Globe className="h-4 w-4" />
      </div>

      {/* Website info */}
      <div className="flex-1 min-w-0 pr-6">
        <h4
          className={cn(
            "text-sm font-medium truncate transition-colors",
            isActive ? "text-violet-600 dark:text-violet-400" : "text-foreground"
          )}
        >
          {website.name || websiteName}
        </h4>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">
            {formatNumber(website.pageCount)} pages
          </span>
          <span className="text-muted-foreground/40">•</span>
          <span className="text-xs text-muted-foreground">
            {formatTime(website.createdAt)}
          </span>
        </div>
      </div>

      {/* Status badge / Delete button */}
      <div 
        className="absolute right-3 top-1/2 -translate-y-1/2"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          {isHovered && !showDeleteConfirm ? (
            <motion.button
              key="delete"
              type="button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleDelete}
              className="p-1.5 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </motion.button>
          ) : showDeleteConfirm ? (
            <motion.button
              key="confirm"
              type="button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleDelete}
              className="px-2 py-1 rounded-md bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors"
            >
              Delete?
            </motion.button>
          ) : (
            <motion.div
              key="status"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <StatusBadge status={website.status} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// =============================================================================
// DATE GROUP COMPONENT
// =============================================================================

interface DateGroupSectionProps {
  group: DateGroup;
  activeWebsite: Website | null;
  onSelectWebsite: (website: Website) => void;
  onDeleteWebsite: (id: string) => void;
}

function DateGroupSection({
  group,
  activeWebsite,
  onSelectWebsite,
  onDeleteWebsite,
}: DateGroupSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="mb-4">
      {/* Group header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center gap-2 w-full px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
      >
        <motion.div
          animate={{ rotate: isCollapsed ? -90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-3 w-3" />
        </motion.div>
        <span>{group.label}</span>
        <span className="ml-auto text-muted-foreground/60 normal-case font-normal">
          {group.websites.length}
        </span>
      </button>

      {/* Group items */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-1 mt-1"
          >
            <AnimatePresence>
              {group.websites.map((website) => (
                <WebsiteItem
                  key={website.id}
                  website={website}
                  isActive={activeWebsite?.id === website.id}
                  onSelect={() => onSelectWebsite(website)}
                  onDelete={() => onDeleteWebsite(website.id)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// EMPTY STATE COMPONENT
// =============================================================================

function EmptyState({ onNewCrawl }: { onNewCrawl?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center px-4 py-12 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center mb-4">
        <Sparkles className="h-8 w-8 text-violet-500" />
      </div>
      <h3 className="text-sm font-medium text-foreground mb-1">
        No analyses yet
      </h3>
      <p className="text-xs text-muted-foreground mb-4 max-w-[180px]">
        Start by analyzing a website to see it appear here
      </p>
      {onNewCrawl && (
        <Button
          onClick={onNewCrawl}
          size="sm"
          className="bg-violet-600 hover:bg-violet-500"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          New Analysis
        </Button>
      )}
    </motion.div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * ChatHistory - Sidebar showing previously analyzed websites
 *
 * Features:
 * - Grouped by date (Today, Yesterday, This Week, Earlier)
 * - Active website highlighting
 * - Hover to reveal delete button
 * - Delete confirmation
 * - Collapsible sections
 * - Empty state
 * - Smooth animations
 *
 * @example
 * ```tsx
 * <ChatHistory
 *   websites={websites}
 *   activeWebsite={activeWebsite}
 *   onSelectWebsite={(website) => setActiveWebsite(website)}
 *   onDeleteWebsite={(id) => deleteWebsite(id)}
 *   onNewCrawl={() => router.push("/")}
 * />
 * ```
 */
export function ChatHistory({
  websites,
  activeWebsite,
  onSelectWebsite,
  onDeleteWebsite,
  onNewCrawl,
  isOpen = true,
  onToggle,
}: ChatHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter websites based on search
  const filteredWebsites = useMemo(() => {
    if (!searchQuery.trim()) return websites;
    const query = searchQuery.toLowerCase();
    return websites.filter(
      (w) =>
        w.name.toLowerCase().includes(query) ||
        w.url.toLowerCase().includes(query)
    );
  }, [websites, searchQuery]);

  // Group websites by date
  const dateGroups = useMemo(
    () => groupWebsitesByDate(filteredWebsites),
    [filteredWebsites]
  );

  return (
    <>
      {/* Floating toggle button - shown when sidebar is closed (desktop only) */}
      {!isOpen && onToggle && (
        <div className="hidden lg:flex fixed left-0 top-1/2 -translate-y-1/2 z-50">
          <Button
            onClick={onToggle}
            variant="default"
            size="icon"
            className="rounded-r-full rounded-l-none shadow-lg bg-violet-600 hover:bg-violet-500"
            title="Open sidebar"
          >
            <ChevronDown className="h-4 w-4 rotate-90" />
          </Button>
        </div>
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col h-full bg-muted/30 border-r border-border",
          "hidden lg:flex",
          "overflow-hidden transition-all duration-300",
          isOpen ? "w-[260px]" : "w-0"
        )}
        style={{
          minWidth: isOpen ? "260px" : "0",
          maxWidth: isOpen ? "260px" : "0",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
      >
        {/* Header with New Crawl button and Close button */}
        <div className="flex-shrink-0 p-3 border-b border-border flex items-center gap-2">
          <Button
            onClick={onNewCrawl}
            className="flex-1 justify-start gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-purple-500/20"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Analysis</span>
          </Button>
          {onToggle && (
            <Button
              onClick={onToggle}
              variant="ghost"
              size="icon"
              className="flex-shrink-0"
              title="Collapse sidebar"
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  isOpen ? "rotate-90" : "-rotate-90"
                )}
              />
            </Button>
          )}
        </div>

        {/* Search input */}
        {websites.length > 5 && (
          <div className="flex-shrink-0 px-3 py-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search websites..."
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-background rounded-md border border-border focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 outline-none placeholder:text-muted-foreground/50"
              />
            </div>
          </div>
        )}

        {/* Website list */}
        <div className="flex-1 overflow-y-auto py-2 px-2">
          {filteredWebsites.length === 0 ? (
            <EmptyState onNewCrawl={onNewCrawl} />
          ) : (
            <AnimatePresence mode="popLayout">
              {dateGroups.map((group) => (
                <DateGroupSection
                  key={group.label}
                  group={group}
                  activeWebsite={activeWebsite}
                  onSelectWebsite={onSelectWebsite}
                  onDeleteWebsite={onDeleteWebsite}
                />
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Footer stats */}
        {websites.length > 0 && (
          <div className="flex-shrink-0 px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              {websites.length} website{websites.length !== 1 ? "s" : ""} analyzed
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
