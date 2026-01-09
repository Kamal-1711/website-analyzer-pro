"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Download,
  Clock,
  Zap,
  Target,
  FileText,
  ExternalLink,
} from "lucide-react";
import { cn, getScoreColor, getScoreLabel } from "@/lib/utils";
import type { CrawlData } from "@/types";

// =============================================================================
// TYPES
// =============================================================================

interface AuditTabProps {
  crawlData: CrawlData;
}

interface AuditIssue {
  id: string;
  severity: "critical" | "warning" | "info";
  category: string;
  title: string;
  description: string;
  affectedPages: number;
  effort: "low" | "medium" | "high";
  impact: "low" | "medium" | "high";
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  effort: string;
  impact: string;
  timeframe: "week" | "month" | "quarter";
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function generateIssuesFromCrawlData(crawlData: CrawlData): AuditIssue[] {
  const issues: AuditIssue[] = [];

  // Generate issues based on actual crawl data
  if (crawlData.orphanPages > 0) {
    issues.push({
      id: "orphan-pages",
      severity: crawlData.orphanPages > 10 ? "critical" : "warning",
      category: "Navigation",
      title: "Orphan Pages Detected",
      description:
        "Pages with no internal links pointing to them are hard for users and search engines to discover.",
      affectedPages: crawlData.orphanPages,
      effort: "medium",
      impact: "high",
    });
  }

  if (crawlData.deadEnds > 0) {
    issues.push({
      id: "dead-ends",
      severity: crawlData.deadEnds > 15 ? "critical" : "warning",
      category: "User Experience",
      title: "Dead End Pages",
      description:
        "Pages with no outbound internal links create navigation dead ends for users.",
      affectedPages: crawlData.deadEnds,
      effort: "low",
      impact: "medium",
    });
  }

  if (crawlData.brokenLinks > 0) {
    issues.push({
      id: "broken-links",
      severity: "critical",
      category: "Technical",
      title: "Broken Links Found",
      description:
        "Links leading to 404 pages harm user experience and SEO performance.",
      affectedPages: crawlData.brokenLinks,
      effort: "low",
      impact: "high",
    });
  }

  if (crawlData.maxDepth > 4) {
    issues.push({
      id: "deep-navigation",
      severity: "warning",
      category: "Architecture",
      title: "Deep Navigation Structure",
      description:
        "Some content requires too many clicks to reach, which may reduce discoverability.",
      affectedPages: crawlData.pagesList.filter((p) => p.depth > 4).length,
      effort: "high",
      impact: "medium",
    });
  }

  if (crawlData.avgDepth > 3.5) {
    issues.push({
      id: "avg-depth",
      severity: "info",
      category: "Architecture",
      title: "High Average Depth",
      description:
        "Average page depth is above recommended 2.5-3.0 range for optimal navigation.",
      affectedPages: Math.round(crawlData.totalPages * 0.4),
      effort: "high",
      impact: "medium",
    });
  }

  if (crawlData.seoScore < 70) {
    issues.push({
      id: "seo-score",
      severity: crawlData.seoScore < 50 ? "critical" : "warning",
      category: "SEO",
      title: "Low SEO Score",
      description:
        "Multiple SEO issues detected that may be affecting search engine visibility.",
      affectedPages: Math.round(crawlData.totalPages * 0.3),
      effort: "medium",
      impact: "high",
    });
  }

  if (crawlData.mobileScore < 80) {
    issues.push({
      id: "mobile-score",
      severity: crawlData.mobileScore < 60 ? "critical" : "warning",
      category: "Mobile",
      title: "Mobile Experience Issues",
      description:
        "Some pages may not provide an optimal experience on mobile devices.",
      affectedPages: Math.round(crawlData.totalPages * 0.2),
      effort: "medium",
      impact: "high",
    });
  }

  // Add info-level suggestions
  if (crawlData.architectureScore >= 80) {
    issues.push({
      id: "good-architecture",
      severity: "info",
      category: "Architecture",
      title: "Good Site Architecture",
      description:
        "Your site has a well-organized structure. Consider adding breadcrumbs for better navigation.",
      affectedPages: 0,
      effort: "low",
      impact: "low",
    });
  }

  return issues.sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

function generateRecommendations(issues: AuditIssue[]): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // This week recommendations
  const criticalIssues = issues.filter((i) => i.severity === "critical");
  criticalIssues.slice(0, 2).forEach((issue, index) => {
    recommendations.push({
      id: `week-${index}`,
      title: `Fix ${issue.title}`,
      description: issue.description,
      effort: issue.effort === "low" ? "2-3 hours" : "4-8 hours",
      impact: "High",
      timeframe: "week",
    });
  });

  // This month recommendations
  const warningIssues = issues.filter((i) => i.severity === "warning");
  warningIssues.slice(0, 2).forEach((issue, index) => {
    recommendations.push({
      id: `month-${index}`,
      title: `Address ${issue.title}`,
      description: issue.description,
      effort: issue.effort === "high" ? "8-16 hours" : "4-8 hours",
      impact: "Medium",
      timeframe: "month",
    });
  });

  // This quarter recommendations
  recommendations.push({
    id: "quarter-1",
    title: "Implement Breadcrumb Navigation",
    description:
      "Add breadcrumb navigation to improve user orientation and SEO.",
    effort: "4-6 hours",
    impact: "Medium",
    timeframe: "quarter",
  });

  recommendations.push({
    id: "quarter-2",
    title: "Create XML Sitemap",
    description:
      "Generate and submit an XML sitemap to search engines for better indexing.",
    effort: "2-3 hours",
    impact: "Medium",
    timeframe: "quarter",
  });

  return recommendations;
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface IssueSectionProps {
  title: string;
  issues: AuditIssue[];
  defaultExpanded?: boolean;
}

function IssueSection({ title, issues, defaultExpanded = true }: IssueSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (issues.length === 0) return null;

  const getSeverityIcon = (severity: AuditIssue["severity"]) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: AuditIssue["severity"]) => {
    switch (severity) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>;
      case "warning":
        return (
          <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">
            Warning
          </Badge>
        );
      case "info":
        return (
          <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">
            Info
          </Badge>
        );
    }
  };

  const getEffortBadge = (effort: AuditIssue["effort"]) => {
    const colors = {
      low: "bg-emerald-500/20 text-emerald-500",
      medium: "bg-amber-500/20 text-amber-500",
      high: "bg-red-500/20 text-red-500",
    };
    return (
      <Badge variant="outline" className={cn("text-[10px]", colors[effort])}>
        {effort.charAt(0).toUpperCase() + effort.slice(1)} Effort
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader
        className="cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            {title}
            <Badge variant="secondary">{issues.length}</Badge>
          </CardTitle>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="pt-0">
              <div className="space-y-3">
                {issues.map((issue) => (
                  <motion.div
                    key={issue.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/30 transition-colors"
                  >
                    {getSeverityIcon(issue.severity)}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="font-medium">{issue.title}</h4>
                        {getSeverityBadge(issue.severity)}
                        <Badge variant="outline" className="text-[10px]">
                          {issue.category}
                        </Badge>
                        {getEffortBadge(issue.effort)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {issue.description}
                      </p>
                      {issue.affectedPages > 0 && (
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          Affects {issue.affectedPages} page
                          {issue.affectedPages !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" className="flex-shrink-0">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * AuditTab - Professional audit findings and recommendations
 *
 * Features:
 * - Executive summary with score and grade
 * - Expandable issue sections by severity
 * - Actionable recommendations by timeframe
 * - Color-coded priority indicators
 *
 * @example
 * ```tsx
 * <AuditTab crawlData={crawlData} />
 * ```
 */
export function AuditTab({ crawlData }: AuditTabProps) {
  const issues = useMemo(
    () => generateIssuesFromCrawlData(crawlData),
    [crawlData]
  );

  const recommendations = useMemo(
    () => generateRecommendations(issues),
    [issues]
  );

  const criticalIssues = issues.filter((i) => i.severity === "critical");
  const warningIssues = issues.filter((i) => i.severity === "warning");
  const infoIssues = issues.filter((i) => i.severity === "info");

  const score = crawlData.architectureScore;
  const grade =
    score >= 90
      ? "A"
      : score >= 80
        ? "B"
        : score >= 70
          ? "C"
          : score >= 60
            ? "D"
            : "F";

  const weekRecs = recommendations.filter((r) => r.timeframe === "week");
  const monthRecs = recommendations.filter((r) => r.timeframe === "month");
  const quarterRecs = recommendations.filter((r) => r.timeframe === "quarter");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Shield className="h-5 w-5 text-violet-500" />
            Website Audit Report
          </h2>
          <p className="text-sm text-muted-foreground">
            Comprehensive analysis of your website&apos;s health
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Re-run Audit
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Executive Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-5 gap-4"
      >
        {/* Score Card */}
        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div
                  className={cn(
                    "w-24 h-24 rounded-full flex items-center justify-center",
                    score >= 80
                      ? "bg-emerald-500/20"
                      : score >= 60
                        ? "bg-amber-500/20"
                        : "bg-red-500/20"
                  )}
                >
                  <span
                    className={cn(
                      "text-3xl font-bold",
                      getScoreColor(score)
                    )}
                  >
                    {score}
                  </span>
                </div>
                <div
                  className={cn(
                    "absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center font-bold",
                    score >= 80
                      ? "bg-emerald-500 text-white"
                      : score >= 60
                        ? "bg-amber-500 text-white"
                        : "bg-red-500 text-white"
                  )}
                >
                  {grade}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Overall Score</h3>
                <p className={cn("text-sm", getScoreColor(score))}>
                  {getScoreLabel(score)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on {crawlData.totalPages} pages analyzed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Issue Summary Cards */}
        <Card className={criticalIssues.length > 0 ? "border-red-500/30" : ""}>
          <CardContent className="pt-6 text-center">
            <AlertTriangle
              className={cn(
                "h-6 w-6 mx-auto mb-2",
                criticalIssues.length > 0 ? "text-red-500" : "text-muted-foreground"
              )}
            />
            <p className="text-2xl font-bold text-red-500">
              {criticalIssues.length}
            </p>
            <p className="text-xs text-muted-foreground">Critical Issues</p>
          </CardContent>
        </Card>

        <Card className={warningIssues.length > 0 ? "border-amber-500/30" : ""}>
          <CardContent className="pt-6 text-center">
            <AlertTriangle
              className={cn(
                "h-6 w-6 mx-auto mb-2",
                warningIssues.length > 0 ? "text-amber-500" : "text-muted-foreground"
              )}
            />
            <p className="text-2xl font-bold text-amber-500">
              {warningIssues.length}
            </p>
            <p className="text-xs text-muted-foreground">Warnings</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/30">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-6 w-6 mx-auto mb-2 text-emerald-500" />
            <p className="text-2xl font-bold text-emerald-500">
              {Math.max(0, 20 - criticalIssues.length - warningIssues.length)}
            </p>
            <p className="text-xs text-muted-foreground">Passed Checks</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Issue Sections */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <IssueSection
          title="🔴 Critical Issues"
          issues={criticalIssues}
          defaultExpanded
        />
        <IssueSection
          title="🟡 Warnings"
          issues={warningIssues}
          defaultExpanded={criticalIssues.length === 0}
        />
        <IssueSection
          title="ℹ️ Suggestions"
          issues={infoIssues}
          defaultExpanded={false}
        />
      </motion.div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-violet-500" />
              Action Plan
            </CardTitle>
            <CardDescription>
              Prioritized recommendations for improving your website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* This Week */}
              {weekRecs.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-medium mb-3">
                    <Clock className="h-4 w-4 text-red-500" />
                    Fix This Week
                  </h4>
                  <div className="space-y-2 pl-6">
                    {weekRecs.map((rec) => (
                      <div
                        key={rec.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/20"
                      >
                        <Zap className="h-4 w-4 text-red-500 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{rec.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {rec.effort} • {rec.impact} Impact
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* This Month */}
              {monthRecs.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-medium mb-3">
                    <Clock className="h-4 w-4 text-amber-500" />
                    Fix This Month
                  </h4>
                  <div className="space-y-2 pl-6">
                    {monthRecs.map((rec) => (
                      <div
                        key={rec.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20"
                      >
                        <Zap className="h-4 w-4 text-amber-500 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{rec.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {rec.effort} • {rec.impact} Impact
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* This Quarter */}
              {quarterRecs.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-medium mb-3">
                    <Clock className="h-4 w-4 text-blue-500" />
                    Plan This Quarter
                  </h4>
                  <div className="space-y-2 pl-6">
                    {quarterRecs.map((rec) => (
                      <div
                        key={rec.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20"
                      >
                        <Zap className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{rec.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {rec.effort} • {rec.impact} Impact
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Footer */}
      <p className="text-xs text-muted-foreground text-center">
        Last audit: {new Date(crawlData.crawledAt).toLocaleString()}
      </p>
    </div>
  );
}
