"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  ReferenceLine,
  ReferenceArea,
} from "recharts";
import { 
  BarChart3, 
  PieChartIcon,
  Table2,
  CheckCircle2,
  AlertTriangle,
  Info,
  TrendingUp, 
  Layers,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn, formatNumber } from "@/lib/utils";
import type { CrawlData } from "@/types";

// =============================================================================
// TYPES
// =============================================================================

interface StatisticsTabProps {
  crawlData: CrawlData;
}

interface DepthData {
  depth: string;
  pages: number;
  fill: string;
}

interface SectionData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface MetricRow {
  metric: string;
  current: string | number;
  bestPractice: string;
  status: "good" | "warning" | "bad" | "info";
  description: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const SECTION_COLORS = [
  "#8b5cf6", // Violet
  "#3b82f6", // Blue
  "#22c55e", // Green
  "#eab308", // Yellow
  "#f97316", // Orange
  "#ef4444", // Red
  "#ec4899", // Pink
  "#06b6d4", // Cyan
];

const DEPTH_COLORS: Record<number, string> = {
  0: "#3b82f6",
  1: "#22c55e",
  2: "#84cc16",
  3: "#eab308",
  4: "#f97316",
  5: "#ef4444",
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getDepthColor(depth: number): string {
  return DEPTH_COLORS[Math.min(depth, 5)] || DEPTH_COLORS[5];
}

function getStatusIcon(status: MetricRow["status"]) {
  switch (status) {
    case "good":
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    case "bad":
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case "info":
      return <Info className="h-4 w-4 text-blue-500" />;
  }
}

function getStatusBg(status: MetricRow["status"]) {
  switch (status) {
    case "good":
      return "bg-emerald-500/10 border-emerald-500/20";
    case "warning":
      return "bg-amber-500/10 border-amber-500/20";
    case "bad":
      return "bg-red-500/10 border-red-500/20";
    case "info":
      return "bg-blue-500/10 border-blue-500/20";
  }
}

// =============================================================================
// CUSTOM TOOLTIP COMPONENTS
// =============================================================================

interface CustomBarTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: DepthData; value: number }>;
  label?: string;
}

function CustomBarTooltip({ active, payload, label }: CustomBarTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-popover border border-border rounded-lg shadow-xl p-3">
      <p className="font-semibold text-sm">
        {label === "0" ? "Homepage" : `Depth ${label}`}
      </p>
      <p className="text-lg font-bold text-violet-500">
        {formatNumber(payload[0].value)} pages
      </p>
    </div>
  );
}

interface CustomPieTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: SectionData; value: number; name: string }>;
}

function CustomPieTooltip({ active, payload }: CustomPieTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0];
  return (
    <div className="bg-popover border border-border rounded-lg shadow-xl p-3">
      <p className="font-semibold text-sm">{data.name}</p>
      <p className="text-lg font-bold" style={{ color: data.payload.color }}>
        {formatNumber(data.value)} pages
      </p>
    </div>
  );
}

// =============================================================================
// DEPTH DISTRIBUTION CHART
// =============================================================================

interface DepthChartProps {
  data: DepthData[];
  avgDepth: number;
}

function DepthDistributionChart({ data, avgDepth }: DepthChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        
        {/* Optimal zone shading (depth 0-3) */}
        <ReferenceArea
          x1="0"
          x2="3"
          fill="#22c55e"
          fillOpacity={0.1}
          stroke="#22c55e"
          strokeOpacity={0.3}
        />
        
        <XAxis
          dataKey="depth"
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          tickLine={{ stroke: "hsl(var(--border))" }}
          axisLine={{ stroke: "hsl(var(--border))" }}
        />
        <YAxis
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          tickLine={{ stroke: "hsl(var(--border))" }}
          axisLine={{ stroke: "hsl(var(--border))" }}
          tickFormatter={(value) => formatNumber(value)}
        />
        <Tooltip content={<CustomBarTooltip />} />
        
        {/* Average depth reference line */}
        <ReferenceLine
          x={avgDepth.toFixed(0)}
          stroke="#8b5cf6"
          strokeDasharray="5 5"
          strokeWidth={2}
          label={{
            value: `Avg: ${avgDepth.toFixed(1)}`,
            position: "top",
            fill: "#8b5cf6",
            fontSize: 12,
          }}
        />
        
        <Bar
          dataKey="pages"
          radius={[4, 4, 0, 0]}
          animationDuration={1000}
          animationBegin={300}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// =============================================================================
// CONTENT DISTRIBUTION CHART
// =============================================================================

interface ContentChartProps {
  data: SectionData[];
}

function ContentDistributionChart({ data }: ContentChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          animationDuration={1000}
          animationBegin={500}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomPieTooltip />} />
        <Legend
          layout="horizontal"
          verticalAlign="bottom"
          align="center"
          iconType="circle"
          iconSize={10}
          formatter={(value) => (
            <span className="text-xs text-muted-foreground">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// =============================================================================
// METRICS TABLE
// =============================================================================

interface MetricsTableProps {
  metrics: MetricRow[];
}

function MetricsTable({ metrics }: MetricsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
              Metric
            </th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
              Current
            </th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
              Best Practice
            </th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((metric, index) => (
            <motion.tr
              key={metric.metric}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "border-b border-border last:border-0 transition-colors hover:bg-muted/50",
                getStatusBg(metric.status)
              )}
            >
              <td className="py-4 px-4">
                <div>
                  <p className="font-medium text-sm">{metric.metric}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {metric.description}
                  </p>
                </div>
              </td>
              <td className="py-4 px-4 text-center">
                <span className="font-bold text-foreground">{metric.current}</span>
              </td>
              <td className="py-4 px-4 text-center">
                <span className="text-sm text-muted-foreground">
                  {metric.bestPractice}
                </span>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center justify-center gap-2">
                  {getStatusIcon(metric.status)}
                  <span
                    className={cn(
                      "text-xs font-medium capitalize",
                      metric.status === "good" && "text-emerald-500",
                      metric.status === "warning" && "text-amber-500",
                      metric.status === "bad" && "text-red-500",
                      metric.status === "info" && "text-blue-500"
                    )}
                  >
                    {metric.status === "good"
                      ? "Good"
                      : metric.status === "warning"
                      ? "Warning"
                      : metric.status === "bad"
                      ? "Needs Work"
                      : "Info"}
                  </span>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * StatisticsTab - Detailed statistics and charts
 *
 * Features:
 * - Depth distribution bar chart
 * - Content distribution pie chart
 * - Metrics comparison table
 *
 * @example
 * ```tsx
 * <StatisticsTab crawlData={crawlData} />
 * ```
 */
export function StatisticsTab({ crawlData }: StatisticsTabProps) {
  // Calculate depth distribution data
  const depthData = useMemo((): DepthData[] => {
    const depthCounts: Record<number, number> = {};

    crawlData.pagesList.forEach((page) => {
      const depth = Math.min(page.depth, 5);
      depthCounts[depth] = (depthCounts[depth] || 0) + 1;
    });

    // Ensure all depths 0-5 are represented
    return [0, 1, 2, 3, 4, 5].map((depth) => ({
      depth: depth === 5 ? "5+" : depth.toString(),
      pages: depthCounts[depth] || 0,
      fill: getDepthColor(depth),
    }));
  }, [crawlData.pagesList]);

  // Calculate content distribution (simulate sections from page URLs)
  const sectionData = useMemo((): SectionData[] => {
    const sections: Record<string, number> = {};

    crawlData.pagesList.forEach((page) => {
      try {
        const url = new URL(page.url);
        const pathParts = url.pathname.split("/").filter(Boolean);
        const section = pathParts[0] || "Home";
        const sectionName = section.charAt(0).toUpperCase() + section.slice(1);
        sections[sectionName] = (sections[sectionName] || 0) + 1;
      } catch {
        sections["Other"] = (sections["Other"] || 0) + 1;
      }
    });

    return Object.entries(sections)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name, value], index) => ({
        name,
        value,
        color: SECTION_COLORS[index % SECTION_COLORS.length],
      }));
  }, [crawlData.pagesList]);

  // Calculate metrics for comparison table
  const metrics = useMemo((): MetricRow[] => {
    const orphanPercentage = (crawlData.orphanPages / crawlData.totalPages) * 100;
    const deadEndPercentage = (crawlData.deadEnds / crawlData.totalPages) * 100;
    const avgLinksPerPage =
      crawlData.pagesList.reduce((sum, p) => sum + p.outboundLinks, 0) /
      crawlData.pagesList.length;

    return [
      {
        metric: "Average Depth",
        current: crawlData.avgDepth.toFixed(1),
        bestPractice: "2.5 - 3.5",
        status:
          crawlData.avgDepth >= 2.5 && crawlData.avgDepth <= 3.5
            ? "good"
            : crawlData.avgDepth < 4
            ? "warning"
            : "bad",
        description: "Average clicks to reach content",
      },
      {
        metric: "Maximum Depth",
        current: crawlData.maxDepth,
        bestPractice: "≤ 4",
        status:
          crawlData.maxDepth <= 4
            ? "good"
            : crawlData.maxDepth <= 5
            ? "warning"
            : "bad",
        description: "Deepest page level",
      },
      {
        metric: "Total Pages",
        current: formatNumber(crawlData.totalPages),
        bestPractice: "Varies",
        status: "info",
        description: "Number of pages discovered",
      },
      {
        metric: "Link Density",
        current: avgLinksPerPage.toFixed(1),
        bestPractice: "3 - 5",
        status:
          avgLinksPerPage >= 3 && avgLinksPerPage <= 5
            ? "good"
            : avgLinksPerPage >= 2 && avgLinksPerPage <= 7
            ? "warning"
            : "bad",
        description: "Average outbound links per page",
      },
      {
        metric: "Orphan Pages %",
        current: `${orphanPercentage.toFixed(1)}%`,
        bestPractice: "< 2%",
        status:
          orphanPercentage < 2
            ? "good"
            : orphanPercentage < 5
            ? "warning"
            : "bad",
        description: "Pages with no inbound links",
      },
      {
        metric: "Dead Ends %",
        current: `${deadEndPercentage.toFixed(1)}%`,
        bestPractice: "< 10%",
        status:
          deadEndPercentage < 10
            ? "good"
            : deadEndPercentage < 15
            ? "warning"
            : "bad",
        description: "Pages with no outbound links",
      },
      {
        metric: "Architecture Score",
        current: `${crawlData.architectureScore}/100`,
        bestPractice: "≥ 80",
        status:
          crawlData.architectureScore >= 80
            ? "good"
            : crawlData.architectureScore >= 60
            ? "warning"
            : "bad",
        description: "Overall site structure quality",
      },
      {
        metric: "Broken Links",
        current: crawlData.brokenLinks,
        bestPractice: "0",
        status:
          crawlData.brokenLinks === 0
            ? "good"
            : crawlData.brokenLinks <= 5
            ? "warning"
            : "bad",
        description: "Number of 404/500 errors",
      },
    ];
  }, [crawlData]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const goodCount = metrics.filter((m) => m.status === "good").length;
    const warningCount = metrics.filter((m) => m.status === "warning").length;
    const badCount = metrics.filter((m) => m.status === "bad").length;

    return { goodCount, warningCount, badCount };
  }, [metrics]);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card className="bg-emerald-500/10 border-emerald-500/20">
            <CardContent className="pt-6 text-center">
              <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500 mb-2" />
              <p className="text-3xl font-bold text-emerald-500">
                {summaryStats.goodCount}
              </p>
              <p className="text-sm text-muted-foreground">Metrics Good</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-amber-500/10 border-amber-500/20">
            <CardContent className="pt-6 text-center">
              <AlertTriangle className="h-8 w-8 mx-auto text-amber-500 mb-2" />
              <p className="text-3xl font-bold text-amber-500">
                {summaryStats.warningCount}
              </p>
              <p className="text-sm text-muted-foreground">Need Attention</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-red-500/10 border-red-500/20">
            <CardContent className="pt-6 text-center">
              <AlertTriangle className="h-8 w-8 mx-auto text-red-500 mb-2" />
              <p className="text-3xl font-bold text-red-500">
                {summaryStats.badCount}
              </p>
              <p className="text-sm text-muted-foreground">Need Work</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Depth Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-violet-500" />
                Depth Distribution
          </CardTitle>
          <CardDescription>
                Number of pages at each depth level. Green zone shows optimal range.
          </CardDescription>
        </CardHeader>
        <CardContent>
              <DepthDistributionChart
                data={depthData}
                avgDepth={crawlData.avgDepth}
              />
              <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/30" />
                  <span>Optimal Zone (0-3)</span>
            </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0 border-t-2 border-dashed border-violet-500" />
                  <span>Average Depth</span>
            </div>
          </div>
        </CardContent>
      </Card>
        </motion.div>

        {/* Content Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-violet-500" />
                Content Distribution
          </CardTitle>
          <CardDescription>
                Pages grouped by main section or category
          </CardDescription>
        </CardHeader>
        <CardContent>
              <ContentDistributionChart data={sectionData} />
        </CardContent>
      </Card>
        </motion.div>
      </div>

      {/* Metrics Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
              <Table2 className="h-5 w-5 text-violet-500" />
              Metrics Comparison
          </CardTitle>
          <CardDescription>
              Compare your metrics against industry best practices
          </CardDescription>
        </CardHeader>
        <CardContent>
            <MetricsTable metrics={metrics} />
        </CardContent>
      </Card>
      </motion.div>

      {/* Additional Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-violet-500" />
              Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-sm">Site Depth</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {crawlData.avgDepth <= 3
                    ? "Your site has a good shallow structure, making content easy to find."
                    : crawlData.avgDepth <= 4
                    ? "Consider flattening your site structure for better user experience."
                    : "Your site is too deep. Users may struggle to find content."}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  <span className="font-medium text-sm">Architecture</span>
          </div>
                <p className="text-xs text-muted-foreground">
                  {crawlData.architectureScore >= 80
                    ? "Excellent site architecture! Your internal linking is well-structured."
                    : crawlData.architectureScore >= 60
                    ? "Good architecture with room for improvement in internal linking."
                    : "Focus on improving internal links and reducing orphan pages."}
                </p>
              </div>
            </div>
        </CardContent>
      </Card>
      </motion.div>
    </div>
  );
}
