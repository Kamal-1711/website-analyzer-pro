"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitBranch,
  ChevronRight,
  ChevronDown,
  Home,
  Folder,
  FileText,
  ExternalLink,
  Search,
  Layers,
  BarChart3,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatNumber, getWebsiteNameFromUrl } from "@/lib/utils";
import type { CrawlData, Page } from "@/types";

// =============================================================================
// TYPES
// =============================================================================

interface MindMapTabProps {
  crawlData: CrawlData;
}

interface TreeNode {
  name: string;
  path: string;
  fullUrl: string;
  depth: number;
  children: TreeNode[];
  pageData?: Page;
  isExpanded?: boolean;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function buildTreeFromPages(pages: Page[], baseUrl: string): TreeNode {
  const root: TreeNode = {
    name: getWebsiteNameFromUrl(baseUrl),
    path: "/",
    fullUrl: baseUrl,
    depth: 0,
    children: [],
  };

  // Find homepage
  const homepage = pages.find((p) => p.depth === 0);
  if (homepage) {
    root.pageData = homepage;
  }

  // Group pages by path segments
  const pathMap = new Map<string, TreeNode>();
  pathMap.set("/", root);

  // Sort pages by depth then URL
  const sortedPages = [...pages]
    .filter((p) => p.depth > 0)
    .sort((a, b) => a.depth - b.depth || a.url.localeCompare(b.url));

  sortedPages.forEach((page) => {
    try {
      const url = new URL(page.url);
      const pathParts = url.pathname.split("/").filter(Boolean);

      if (pathParts.length === 0) return;

      let currentPath = "";
      let currentParent = root;

      pathParts.forEach((part, index) => {
        currentPath += "/" + part;
        const isLast = index === pathParts.length - 1;

        let existingNode = pathMap.get(currentPath);

        if (!existingNode) {
          existingNode = {
            name: part.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            path: currentPath,
            fullUrl: `${url.origin}${currentPath}`,
            depth: index + 1,
            children: [],
            pageData: isLast ? page : undefined,
          };
          pathMap.set(currentPath, existingNode);
          currentParent.children.push(existingNode);
        } else if (isLast && !existingNode.pageData) {
          existingNode.pageData = page;
        }

        currentParent = existingNode;
      });
    } catch {
      // Skip invalid URLs
    }
  });

  return root;
}

function getDepthColor(depth: number): string {
  const colors = [
    "text-violet-500", // depth 0
    "text-blue-500",   // depth 1
    "text-emerald-500", // depth 2
    "text-amber-500",  // depth 3
    "text-orange-500", // depth 4
    "text-red-500",    // depth 5+
  ];
  return colors[Math.min(depth, colors.length - 1)];
}

function getDepthBg(depth: number): string {
  const colors = [
    "bg-violet-500/10", // depth 0
    "bg-blue-500/10",   // depth 1
    "bg-emerald-500/10", // depth 2
    "bg-amber-500/10",  // depth 3
    "bg-orange-500/10", // depth 4
    "bg-red-500/10",    // depth 5+
  ];
  return colors[Math.min(depth, colors.length - 1)];
}

// =============================================================================
// TREE NODE COMPONENT
// =============================================================================

interface TreeNodeItemProps {
  node: TreeNode;
  level: number;
  defaultExpanded?: boolean;
}

function TreeNodeItem({ node, level, defaultExpanded = false }: TreeNodeItemProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded || level < 2);
  const hasChildren = node.children.length > 0;
  const depthColor = getDepthColor(node.depth);
  const depthBg = getDepthBg(node.depth);

  const Icon = node.depth === 0 ? Home : hasChildren ? Folder : FileText;

  return (
    <div className="select-none">
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: level * 0.02 }}
        className={cn(
          "flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer transition-colors",
          "hover:bg-muted/50 group"
        )}
        style={{ marginLeft: level * 20 }}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
      >
        {/* Expand/Collapse Icon */}
        {hasChildren ? (
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="w-4 h-4 flex items-center justify-center"
          >
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
          </motion.div>
        ) : (
          <div className="w-4 h-4" />
        )}

        {/* Icon */}
        <div className={cn("w-6 h-6 rounded flex items-center justify-center", depthBg)}>
          <Icon className={cn("h-3.5 w-3.5", depthColor)} />
        </div>

        {/* Name */}
        <span className={cn("text-sm font-medium", depthColor)}>
          {node.name}
        </span>

        {/* Children count */}
        {hasChildren && (
          <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
            {node.children.length}
          </Badge>
        )}

        {/* Status indicator */}
        {node.pageData && node.pageData.statusCode !== 200 && (
          <AlertTriangle className="h-3 w-3 text-amber-500" />
        )}

        {/* External link on hover */}
        <a
          href={node.fullUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
        >
          <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-foreground" />
        </a>
      </motion.div>

      {/* Children */}
      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* Vertical line */}
            <div
              className="relative"
              style={{ marginLeft: level * 20 + 7 }}
            >
              <div className="absolute left-0 top-0 bottom-0 w-px bg-border" />
              <div className="pl-4">
                {node.children.map((child) => (
                  <TreeNodeItem
                    key={child.path}
                    node={child}
                    level={level + 1}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * MindMapTab - Hierarchical tree view of website structure
 *
 * Features:
 * - Interactive expandable tree
 * - Color-coded by depth
 * - Page count badges
 * - Statistics summary
 *
 * @example
 * ```tsx
 * <MindMapTab crawlData={crawlData} />
 * ```
 */
export function MindMapTab({ crawlData }: MindMapTabProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Build tree structure from pages
  const treeData = useMemo(
    () => buildTreeFromPages(crawlData.pagesList, crawlData.url),
    [crawlData.pagesList, crawlData.url]
  );

  // Calculate stats
  const stats = useMemo(() => {
    const depthCounts: Record<number, number> = {};
    crawlData.pagesList.forEach((page) => {
      depthCounts[page.depth] = (depthCounts[page.depth] || 0) + 1;
    });

    // Count unique sections (depth 1 pages)
    const sections = new Set<string>();
    crawlData.pagesList.forEach((page) => {
      try {
        const url = new URL(page.url);
        const firstPart = url.pathname.split("/").filter(Boolean)[0];
        if (firstPart) sections.add(firstPart);
      } catch {
        // Skip
      }
    });

    return {
      totalPages: crawlData.totalPages,
      maxDepth: crawlData.maxDepth,
      sections: sections.size,
      orphanPages: crawlData.orphanPages,
      depthCounts,
    };
  }, [crawlData]);

  // Filter tree based on search (simple filter)
  const filteredPages = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase();
    return crawlData.pagesList.filter(
      (p) =>
        p.url.toLowerCase().includes(query) ||
        p.title.toLowerCase().includes(query)
    );
  }, [crawlData.pagesList, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-violet-500" />
            Site Hierarchy
          </h2>
          <p className="text-sm text-muted-foreground">
            Tree view of your website structure
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm bg-muted rounded-lg border border-border focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none w-64"
          />
        </div>
      </div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Card>
          <CardContent className="pt-6 text-center">
            <BarChart3 className="h-6 w-6 mx-auto text-violet-500 mb-2" />
            <p className="text-2xl font-bold">{formatNumber(stats.totalPages)}</p>
            <p className="text-xs text-muted-foreground">Total Pages</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Layers className="h-6 w-6 mx-auto text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{stats.maxDepth}</p>
            <p className="text-xs text-muted-foreground">Max Depth</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Folder className="h-6 w-6 mx-auto text-emerald-500 mb-2" />
            <p className="text-2xl font-bold">{stats.sections}</p>
            <p className="text-xs text-muted-foreground">Sections</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-6 w-6 mx-auto text-amber-500 mb-2" />
            <p className="text-2xl font-bold">{stats.orphanPages}</p>
            <p className="text-xs text-muted-foreground">Orphan Pages</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Tree View */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <GitBranch className="h-4 w-4 text-violet-500" />
              Page Tree
            </CardTitle>
            <CardDescription>
              Click on folders to expand/collapse. Click external link to visit page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search Results */}
            {filteredPages ? (
              <div className="space-y-1 max-h-[500px] overflow-y-auto">
                <p className="text-sm text-muted-foreground mb-3">
                  Found {filteredPages.length} pages matching &quot;{searchQuery}&quot;
                </p>
                {filteredPages.slice(0, 50).map((page) => (
                  <motion.a
                    key={page.id}
                    href={page.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <FileText className={cn("h-4 w-4", getDepthColor(page.depth))} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{page.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{page.url}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      Depth {page.depth}
                    </Badge>
                  </motion.a>
                ))}
                {filteredPages.length > 50 && (
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    + {filteredPages.length - 50} more results
                  </p>
                )}
              </div>
            ) : (
              /* Tree View */
              <div className="max-h-[500px] overflow-y-auto pr-2">
                <TreeNodeItem node={treeData} level={0} defaultExpanded />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Depth Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="h-4 w-4 text-violet-500" />
              Depth Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-32">
              {Object.entries(stats.depthCounts)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([depth, count]) => {
                  const maxCount = Math.max(...Object.values(stats.depthCounts));
                  const heightPercent = (count / maxCount) * 100;
                  const depthNum = Number(depth);

                  return (
                    <div key={depth} className="flex-1 flex flex-col items-center">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPercent}%` }}
                        transition={{ delay: depthNum * 0.1, duration: 0.5 }}
                        className={cn(
                          "w-full rounded-t-lg",
                          getDepthBg(depthNum).replace("/10", "/30")
                        )}
                        style={{ minHeight: count > 0 ? "8px" : "0" }}
                      />
                      <div className="mt-2 text-center">
                        <p className={cn("text-xs font-bold", getDepthColor(depthNum))}>
                          {count}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {depthNum === 0 ? "Home" : `D${depth}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center justify-center gap-4">
            {[
              { depth: 0, label: "Homepage" },
              { depth: 1, label: "Main Sections" },
              { depth: 2, label: "Subsections" },
              { depth: 3, label: "Deep Pages" },
              { depth: 4, label: "Very Deep" },
              { depth: 5, label: "Deepest" },
            ].map((item) => (
              <div key={item.depth} className="flex items-center gap-2">
                <div className={cn("w-3 h-3 rounded", getDepthBg(item.depth).replace("/10", "/50"))} />
                <span className={cn("text-xs", getDepthColor(item.depth))}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
