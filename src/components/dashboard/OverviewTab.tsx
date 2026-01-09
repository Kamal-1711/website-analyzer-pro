"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  cardVariants,
  cardHover,
  smoothTransition,
  springTransition,
} from "@/lib/animations";
import {
  BarChart3,
  Star,
  MapPin,
  Heart,
  FileWarning,
  LinkIcon,
  Smartphone,
  Search,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Zap,
  ArrowRight,
  Target,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatNumber, getScoreColor, getScoreLabel } from "@/lib/utils";
import type { CrawlData } from "@/types";
import { QuickWinsSection } from "./QuickWinsSection";

// =============================================================================
// TYPES
// =============================================================================

interface OverviewTabProps {
  crawlData: CrawlData;
}

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  status?: "success" | "warning" | "error" | "neutral";
  delay?: number;
}

interface MetricRowProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  status?: "success" | "warning" | "error";
}

interface IssueItemProps {
  title: string;
  count: number;
  severity: "critical" | "warning" | "info";
}


// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getHealthStatus(score: number): {
  label: string;
  status: "success" | "warning" | "error";
} {
  if (score >= 80) return { label: "Excellent", status: "success" };
  if (score >= 60) return { label: "Good", status: "warning" };
  if (score >= 40) return { label: "Fair", status: "warning" };
  return { label: "Poor", status: "error" };
}

function getArchitectureStatus(score: number): "success" | "warning" | "error" {
  if (score > 75) return "success";
  if (score > 60) return "warning";
  return "error";
}

function getDepthStatus(depth: number): "success" | "warning" | "error" {
  if (depth < 3.5) return "success";
  if (depth < 4) return "warning";
  return "error";
}

function getStatusColor(status: "success" | "warning" | "error" | "neutral") {
  switch (status) {
    case "success":
      return "text-emerald-500";
    case "warning":
      return "text-amber-500";
    case "error":
      return "text-red-500";
    default:
      return "text-muted-foreground";
  }
}

function getStatusBg(status: "success" | "warning" | "error" | "neutral") {
  switch (status) {
    case "success":
      return "bg-emerald-500/10";
    case "warning":
      return "bg-amber-500/10";
    case "error":
      return "bg-red-500/10";
    default:
      return "bg-muted";
  }
}

// =============================================================================
// SUMMARY CARD COMPONENT
// =============================================================================

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  status = "neutral",
  delay = 0,
}: SummaryCardProps) {

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ ...springTransition, delay }}
      whileHover={cardHover}
    >
      <Card className="relative overflow-hidden group transition-all duration-300">
        <CardContent className="pt-6">
          {/* Background gradient on hover */}
          <motion.div
            className={cn(
              "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
              getStatusBg(status)
            )}
            whileHover={{ opacity: 0.1 }}
          />

          <div className="relative flex items-start justify-between">
            <div>
              <motion.p
                className="text-sm text-muted-foreground font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: delay + 0.1 }}
              >
                {title}
              </motion.p>
              <motion.p
                className={cn(
                  "text-2xl sm:text-3xl font-bold mt-1 sm:mt-2",
                  status !== "neutral" && getStatusColor(status)
                )}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: delay + 0.2, ...springTransition }}
              >
                {value}
              </motion.p>
              <motion.p
                className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: delay + 0.3 }}
              >
                {subtitle}
              </motion.p>
            </div>
            <motion.div
              className={cn(
                "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                getStatusBg(status)
              )}
              initial={{ opacity: 0, scale: 0, rotate: -180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: delay + 0.4, ...springTransition }}
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6">{icon}</div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// =============================================================================
// METRIC ROW COMPONENT
// =============================================================================

function MetricRow({ label, value, icon, status }: MetricRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-2">
        {icon && (
          <span className={cn("text-muted-foreground", status && getStatusColor(status))}>
            {icon}
          </span>
        )}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span
        className={cn(
          "text-sm font-semibold",
          status && getStatusColor(status)
        )}
      >
        {value}
      </span>
    </div>
  );
}

// =============================================================================
// ISSUE ITEM COMPONENT
// =============================================================================

function IssueItem({ title, count, severity }: IssueItemProps) {
  const config = {
    critical: {
      icon: AlertCircle,
      color: "text-red-500",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
    },
    warning: {
      icon: AlertTriangle,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    info: {
      icon: CheckCircle2,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
  }[severity];

  const Icon = config.icon;

  return (
    <motion.div
      whileHover={{ x: 4 }}
      className={cn(
        "flex items-center justify-between p-3 rounded-lg border",
        config.bg,
        config.border
      )}
    >
      <div className="flex items-center gap-3">
        <Icon className={cn("h-4 w-4", config.color)} />
        <span className="text-sm font-medium">{title}</span>
      </div>
      <Badge
        variant="secondary"
        className={cn(
          "font-semibold",
          severity === "critical" && "bg-red-500 text-white",
          severity === "warning" && "bg-amber-500 text-white",
          severity === "info" && "bg-blue-500 text-white"
        )}
      >
        {count}
      </Badge>
    </motion.div>
  );
}


// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * OverviewTab - Main dashboard overview with key metrics
 *
 * Features:
 * - 4 summary cards (Total Pages, Architecture Score, Avg Depth, Health Status)
 * - Key Metrics sidebar
 * - Site Structure visualization
 * - Top Issues and Quick Wins
 *
 * @example
 * ```tsx
 * <OverviewTab crawlData={crawlData} />
 * ```
 */
export function OverviewTab({ crawlData }: OverviewTabProps) {
  const healthStatus = getHealthStatus(crawlData.architectureScore);
  const archStatus = getArchitectureStatus(crawlData.architectureScore);
  const depthStatus = getDepthStatus(crawlData.avgDepth);

  // Calculate issues from crawl data
  const issues = useMemo(
    () => [
      {
        title: "Orphan Pages",
        count: crawlData.orphanPages,
        severity: crawlData.orphanPages > 20 ? "critical" : crawlData.orphanPages > 5 ? "warning" : "info",
      },
      {
        title: "Dead End Pages",
        count: crawlData.deadEnds,
        severity: crawlData.deadEnds > 30 ? "critical" : crawlData.deadEnds > 10 ? "warning" : "info",
      },
      {
        title: "Broken Links",
        count: crawlData.brokenLinks,
        severity: crawlData.brokenLinks > 10 ? "critical" : crawlData.brokenLinks > 3 ? "warning" : "info",
      },
    ],
    [crawlData]
  );


  return (
    <div className="space-y-6">
      {/* Section A: Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <SummaryCard
          title="Total Pages"
          value={formatNumber(crawlData.totalPages)}
          subtitle="Pages analyzed"
          icon={<BarChart3 className="h-6 w-6 text-violet-500" />}
          status="neutral"
          delay={0}
        />
        <SummaryCard
          title="Architecture Score"
          value={`${crawlData.architectureScore}/100`}
          subtitle="Information Architecture"
          icon={<Star className="h-6 w-6 text-amber-500" />}
          status={archStatus}
          delay={0.1}
        />
        <SummaryCard
          title="Average Depth"
          value={crawlData.avgDepth.toFixed(1)}
          subtitle="Clicks to reach content"
          icon={<MapPin className="h-6 w-6 text-blue-500" />}
          status={depthStatus}
          delay={0.2}
        />
        <SummaryCard
          title="Health Status"
          value={healthStatus.label}
          subtitle="Website health"
          icon={<Heart className="h-6 w-6 text-rose-500" />}
          status={healthStatus.status}
          delay={0.3}
        />
      </div>

      {/* Section B: 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Column: Key Metrics */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-3 order-2 lg:order-1"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-violet-500" />
                Key Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <MetricRow
                  label="Orphan Pages"
                  value={crawlData.orphanPages}
                  icon={<FileWarning className="h-4 w-4" />}
                  status={crawlData.orphanPages > 10 ? "error" : crawlData.orphanPages > 5 ? "warning" : "success"}
                />
                <MetricRow
                  label="Dead Ends"
                  value={crawlData.deadEnds}
                  icon={<LinkIcon className="h-4 w-4" />}
                  status={crawlData.deadEnds > 20 ? "error" : crawlData.deadEnds > 10 ? "warning" : "success"}
                />
                <MetricRow
                  label="Broken Links"
                  value={crawlData.brokenLinks}
                  icon={<AlertCircle className="h-4 w-4" />}
                  status={crawlData.brokenLinks > 5 ? "error" : crawlData.brokenLinks > 0 ? "warning" : "success"}
                />
                <MetricRow
                  label="Mobile Score"
                  value={`${crawlData.mobileScore}/100`}
                  icon={<Smartphone className="h-4 w-4" />}
                  status={crawlData.mobileScore >= 80 ? "success" : crawlData.mobileScore >= 60 ? "warning" : "error"}
                />
                <MetricRow
                  label="SEO Score"
                  value={`${crawlData.seoScore}/100`}
                  icon={<Search className="h-4 w-4" />}
                  status={crawlData.seoScore >= 80 ? "success" : crawlData.seoScore >= 60 ? "warning" : "error"}
                />
                <MetricRow
                  label="Avg Page Speed"
                  value={`${crawlData.avgPageSpeed.toFixed(1)}s`}
                  icon={<Zap className="h-4 w-4" />}
                  status={crawlData.avgPageSpeed < 2 ? "success" : crawlData.avgPageSpeed < 3 ? "warning" : "error"}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column: Issues & Quick Wins */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-9 space-y-4 sm:space-y-6 order-1 lg:order-2"
        >
          {/* Top Issues */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Top Issues Found
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {issues.map((issue, i) => (
                <IssueItem
                  key={i}
                  title={issue.title}
                  count={issue.count}
                  severity={issue.severity as "critical" | "warning" | "info"}
                />
              ))}
            </CardContent>
          </Card>

          {/* Quick Wins */}
          <QuickWinsSection crawlData={crawlData} />
        </motion.div>
      </div>
    </div>
  );
}
