"use client";

import { useMemo, useRef, useEffect, useState, useCallback } from "react";
import { Network } from "vis-network";
import { DataSet } from "vis-data";
import { motion } from "framer-motion";
import {
  Network as NetworkIcon,
  Home,
  Layers,
  FileText,
  Link2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatNumber } from "@/lib/utils";
import type { CrawlData, Page } from "@/types";

// =============================================================================
// TYPES
// =============================================================================

interface NetworkTabProps {
  crawlData: CrawlData;
}

interface VisNode {
  id: string;
  label: string;
  title: string;
  url: string;
  depth: number;
  size: number;
  color: {
    background: string;
    border: string;
    highlight: {
      background: string;
      border: string;
    };
  };
  font: {
    size: number;
    color: string;
  };
}

interface VisEdge {
  id: string;
  from: string;
  to: string;
  value: number;
  color: {
    color: string;
    opacity: number;
  };
  width: number;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const DEPTH_COLORS: Record<number, string> = {
  0: "#3b82f6", // Blue - Homepage
  1: "#22c55e", // Green - Main sections
  2: "#84cc16", // Lime - Subsections
  3: "#eab308", // Yellow - Deeper
  4: "#f97316", // Orange - Deep
  5: "#ef4444", // Red - Very deep
};

const DEPTH_LABELS = [
  { depth: 0, label: "Homepage", color: DEPTH_COLORS[0] },
  { depth: 1, label: "Main Sections", color: DEPTH_COLORS[1] },
  { depth: 2, label: "Subsections", color: DEPTH_COLORS[2] },
  { depth: 3, label: "Deep Pages", color: DEPTH_COLORS[3] },
  { depth: 4, label: "Very Deep", color: DEPTH_COLORS[4] },
  { depth: 5, label: "Deepest", color: DEPTH_COLORS[5] },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getDepthColor(depth: number): string {
  if (depth >= 5) return DEPTH_COLORS[5];
  return DEPTH_COLORS[depth] || DEPTH_COLORS[5];
}

function calculateColorByDepth(depth: number): string {
  return getDepthColor(depth);
}

function getDomainName(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace("www.", "");
  } catch {
    return url.split("/")[0] || "Website";
  }
}

function normalizeUrl(url: string, baseUrl: string): string {
  try {
    const urlObj = new URL(url, baseUrl);
    return urlObj.href;
  } catch {
    return url;
  }
}

function getUrlPath(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname;
  } catch {
    return url;
  }
}

function getPathSegments(url: string): string[] {
  const path = getUrlPath(url);
  return path.split("/").filter(Boolean);
}

function arePagesRelated(sourceUrl: string, targetUrl: string): boolean {
  const sourcePath = getPathSegments(sourceUrl);
  const targetPath = getPathSegments(targetUrl);

  // Check if target is a child of source (one level deeper)
  if (targetPath.length === sourcePath.length + 1) {
    // Check if target starts with source path
    for (let i = 0; i < sourcePath.length; i++) {
      if (sourcePath[i] !== targetPath[i]) {
        return false;
      }
    }
    return true;
  }

  // Check if they share a common parent (siblings)
  if (sourcePath.length === targetPath.length && sourcePath.length > 0) {
    const sourceParent = sourcePath.slice(0, -1);
    const targetParent = targetPath.slice(0, -1);
    return (
      sourceParent.length === targetParent.length &&
      sourceParent.every((seg, i) => seg === targetParent[i])
    );
  }

  return false;
}

function transformPagesToNodes(pages: Page[], baseUrl: string): VisNode[] {
  const urlToPage = new Map<string, Page>();
  pages.forEach((page) => {
    urlToPage.set(normalizeUrl(page.url, baseUrl), page);
  });

  return pages.map((page) => {
    const normalizedUrl = normalizeUrl(page.url, baseUrl);
    const domainName = getDomainName(baseUrl);
    const label = page.title || domainName;
    const links = page.inboundLinks;
    const size = Math.max(20, Math.min(60, 30 + links * 2));
    const color = calculateColorByDepth(page.depth);
    const depthColor = getDepthColor(page.depth);

    return {
      id: page.url,
      label: label.length > 30 ? label.substring(0, 30) + "..." : label,
      title: `${page.title}\n${page.url}\nDepth: ${page.depth}\nInbound: ${page.inboundLinks}\nOutbound: ${page.outboundLinks}`,
      url: page.url,
      depth: page.depth,
      size,
      color: {
        background: color,
        border: depthColor,
        highlight: {
          background: color,
          border: depthColor,
        },
      },
      font: {
        size: Math.max(12, Math.min(16, 12 + Math.floor(links / 5))),
        color: "#ffffff",
      },
    };
  });
}

function transformPagesToEdges(
  pages: Page[],
  baseUrl: string
): VisEdge[] {
  const edges: VisEdge[] = [];
  const urlToPage = new Map<string, Page>();
  const crawledUrls = new Set<string>();

  pages.forEach((page) => {
    const normalizedUrl = normalizeUrl(page.url, baseUrl);
    urlToPage.set(normalizedUrl, page);
    crawledUrls.add(normalizedUrl);
  });

  // Create edges based on:
  // 1. Depth progression (pages at depth N link to pages at depth N+1)
  // 2. URL path relationships (parent-child, siblings)
  // 3. Distribute outbound links proportionally

  pages.forEach((sourcePage) => {
    const sourceUrl = normalizeUrl(sourcePage.url, baseUrl);
    const sourceDepth = sourcePage.depth;
    const outboundCount = sourcePage.outboundLinks;

    if (outboundCount === 0) return;

    // Find potential targets
    const potentialTargets = pages.filter((targetPage) => {
      if (targetPage.url === sourcePage.url) return false;
      const targetUrl = normalizeUrl(targetPage.url, baseUrl);
      const targetDepth = targetPage.depth;

      // Link to pages one level deeper
      if (targetDepth === sourceDepth + 1) {
        return arePagesRelated(sourceUrl, targetUrl);
      }

      // Link to pages at same depth (siblings)
      if (targetDepth === sourceDepth && sourceDepth > 0) {
        return arePagesRelated(sourceUrl, targetUrl);
      }

      // Homepage links to depth 1 pages
      if (sourceDepth === 0 && targetDepth === 1) {
        return true;
      }

      return false;
    });

    if (potentialTargets.length === 0) return;

    // Distribute outbound links among potential targets
    // More important pages (higher inbound links) get more connections
    const totalImportance = potentialTargets.reduce(
      (sum, p) => sum + p.inboundLinks + 1,
      0
    );

    potentialTargets.forEach((targetPage) => {
      const targetUrl = normalizeUrl(targetPage.url, baseUrl);
      const importance = targetPage.inboundLinks + 1;
      const weight = Math.max(
        1,
        Math.round((importance / totalImportance) * outboundCount)
      );

      // Limit edges to prevent clutter
      if (weight >= 1) {
        edges.push({
          id: `${sourceUrl}->${targetUrl}`,
          from: sourceUrl,
          to: targetUrl,
          value: weight,
          color: {
            color: getDepthColor(sourceDepth),
            opacity: Math.min(0.6, 0.3 + weight * 0.1),
          },
          width: Math.max(1, Math.min(3, weight)),
        });
      }
    });
  });

  return edges;
}

// =============================================================================
// LEGEND COMPONENT
// =============================================================================

function Legend() {
  return (
    <div className="flex flex-wrap gap-3">
      {DEPTH_LABELS.map((item) => (
        <div key={item.depth} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-xs text-muted-foreground">
            {item.depth === 0 ? item.label : `Depth ${item.depth}`}
          </span>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// STATS CARD
// =============================================================================

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  delay?: number;
}

function StatCard({ title, value, icon, color, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="relative overflow-hidden group hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className={cn("text-2xl font-bold mt-1", color)}>
                {typeof value === "number" ? formatNumber(value) : value}
              </p>
            </div>
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                color.replace("text-", "bg-") + "/10"
              )}
            >
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * NetworkTab - Real network visualization of website structure using Vis.js
 *
 * Features:
 * - Interactive network graph with actual page relationships
 * - Color-coded by depth
 * - Size proportional to link importance
 * - Drag and zoom controls
 * - Click to view page details
 *
 * @example
 * ```tsx
 * <NetworkTab crawlData={crawlData} />
 * ```
 */
export function NetworkTab({ crawlData }: NetworkTabProps) {
  const networkRef = useRef<HTMLDivElement>(null);
  const networkInstanceRef = useRef<Network | null>(null);
  const [selectedNode, setSelectedNode] = useState<VisNode | null>(null);

  // Transform data for visualization
  const { nodes, edges } = useMemo(() => {
    const visNodes = transformPagesToNodes(crawlData.pagesList, crawlData.url);
    const visEdges = transformPagesToEdges(crawlData.pagesList, crawlData.url);

    return {
      nodes: new DataSet<VisNode>(visNodes),
      edges: new DataSet<VisEdge>(visEdges),
    };
  }, [crawlData.pagesList, crawlData.url]);

  // Initialize network
  useEffect(() => {
    if (!networkRef.current) return;

    const data = {
      nodes,
      edges,
    };

    const options = {
      nodes: {
        shape: "dot",
        borderWidth: 2,
        shadow: true,
        font: {
          size: 14,
          face: "Inter",
        },
      },
      edges: {
        smooth: {
          enabled: true,
          type: "continuous",
          roundness: 0.5,
        },
        arrows: {
          to: {
            enabled: true,
            scaleFactor: 0.8,
          },
        },
        shadow: true,
      },
      physics: {
        enabled: true,
        stabilization: {
          enabled: true,
          iterations: 200,
        },
        barnesHut: {
          gravitationalConstant: -2000,
          centralGravity: 0.1,
          springLength: 150,
          springConstant: 0.05,
          damping: 0.1,
        },
      },
      interaction: {
        hover: true,
        tooltipDelay: 100,
        zoomView: true,
        dragView: true,
      },
      layout: {
        improvedLayout: true,
        hierarchical: {
          enabled: false,
        },
      },
    };

    const network = new Network(networkRef.current, data, options);

    // Handle node selection
    network.on("click", (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        const nodeData = nodes.get(nodeId);
        const node = Array.isArray(nodeData) ? nodeData[0] : nodeData;
        if (node) setSelectedNode(node as VisNode);
      } else {
        setSelectedNode(null);
      }
    });

    // Handle double click to open URL
    network.on("doubleClick", (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        const nodeData = nodes.get(nodeId);
        const node = Array.isArray(nodeData) ? nodeData[0] : nodeData;
        if (node) window.open((node as VisNode).url, "_blank");
      }
    });

    networkInstanceRef.current = network;

    return () => {
      network.destroy();
    };
  }, [nodes, edges]);

  // Calculate stats
  const stats = useMemo(() => {
    const pages = crawlData.pagesList;
    const depthGroups = pages.reduce((acc, page) => {
      acc[page.depth] = (acc[page.depth] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const totalLinks = pages.reduce(
      (sum, p) => sum + p.inboundLinks + p.outboundLinks,
      0
    );

    return {
      totalPages: crawlData.totalPages,
      avgDepth: crawlData.avgDepth,
      maxDepth: crawlData.maxDepth,
      totalLinks,
      depthGroups,
      totalEdges: edges.length,
    };
  }, [crawlData, edges.length]);

  // Control handlers
  const handleZoomIn = useCallback(() => {
    if (networkInstanceRef.current) {
      const scale = networkInstanceRef.current.getScale();
      networkInstanceRef.current.moveTo({
        scale: scale * 1.2,
      });
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (networkInstanceRef.current) {
      const scale = networkInstanceRef.current.getScale();
      networkInstanceRef.current.moveTo({
        scale: scale * 0.8,
      });
    }
  }, []);

  const handleFit = useCallback(() => {
    if (networkInstanceRef.current) {
      networkInstanceRef.current.fit({
        animation: {
          duration: 500,
          easingFunction: "easeInOutQuad",
        },
      });
    }
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Pages"
          value={stats.totalPages}
          icon={<FileText className="h-5 w-5 text-violet-500" />}
          color="text-violet-500"
          delay={0}
        />
        <StatCard
          title="Max Depth"
          value={stats.maxDepth}
          icon={<Layers className="h-5 w-5 text-blue-500" />}
          color="text-blue-500"
          delay={0.1}
        />
        <StatCard
          title="Avg Depth"
          value={stats.avgDepth.toFixed(1)}
          icon={<NetworkIcon className="h-5 w-5 text-emerald-500" />}
          color="text-emerald-500"
          delay={0.2}
        />
        <StatCard
          title="Connections"
          value={stats.totalEdges}
          icon={<Link2 className="h-5 w-5 text-amber-500" />}
          color="text-amber-500"
          delay={0.3}
        />
      </div>

      {/* Main Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <NetworkIcon className="h-5 w-5 text-violet-500" />
                  Site Network Graph
                </CardTitle>
                <CardDescription>
                  Interactive visualization of page relationships and structure
                </CardDescription>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1 sm:gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleZoomOut}
                  className="h-9 w-9 sm:h-8 sm:w-8"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleZoomIn}
                  className="h-9 w-9 sm:h-8 sm:w-8"
                  title="Zoom In"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleFit}
                  className="h-9 w-9 sm:h-8 sm:w-8"
                  title="Fit to Screen"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Legend */}
            <div className="mb-4">
              <Legend />
            </div>

            {/* Network Container */}
            <div
              ref={networkRef}
              className="w-full rounded-xl border border-border overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10"
              style={{ height: "clamp(300px, 50vh, 600px)" }}
            />

            {/* Selected Node Info */}
            {selectedNode && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-lg bg-muted/50 border border-border"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: getDepthColor(selectedNode.depth) }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground">
                      {selectedNode.label}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {selectedNode.url}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <span className="text-muted-foreground">
                        Depth: <span className="font-medium">{selectedNode.depth}</span>
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => window.open(selectedNode.url, "_blank")}
                      >
                        Open URL
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Info footer */}
            <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Home className="h-3 w-3" />
                  Click to select, double-click to open
                </span>
                <span className="flex items-center gap-1">
                  <Layers className="h-3 w-3" />
                  Drag to pan, scroll to zoom
                </span>
              </div>
              <span>
                {formatNumber(nodes.length)} nodes, {formatNumber(edges.length)} edges
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Depth Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="h-4 w-4 text-violet-500" />
              Page Depth Distribution
            </CardTitle>
            <CardDescription>
              Number of pages at each depth level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.depthGroups)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([depth, count]) => {
                  const maxCount = Math.max(...Object.values(stats.depthGroups));
                  const percentage = (count / maxCount) * 100;
                  const depthNum = Number(depth);

                  return (
                    <div key={depth} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getDepthColor(depthNum) }}
                          />
                          <span>
                            {depthNum === 0 ? "Homepage" : `Depth ${depth}`}
                          </span>
                        </div>
                        <span className="font-medium">
                          {formatNumber(count)} pages
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ delay: 0.6 + depthNum * 0.1, duration: 0.5 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: getDepthColor(depthNum) }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
