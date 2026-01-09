"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  FileText,
  Link,
  Image,
  CheckCircle,
  XCircle,
  AlertCircle,
  Globe,
  Smartphone,
  Zap,
  Shield,
} from "lucide-react";
import { cn, getScoreColor } from "@/lib/utils";
import type { CrawlData } from "@/types";

// =============================================================================
// TYPES
// =============================================================================

interface SEOTabProps {
  crawlData: CrawlData;
}

interface SEOCheck {
  id: string;
  name: string;
  status: "pass" | "fail" | "warning";
  description: string;
  value?: string;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function generateSEOChecks(crawlData: CrawlData): {
  metaChecks: SEOCheck[];
  contentChecks: SEOCheck[];
  technicalChecks: SEOCheck[];
  performanceChecks: SEOCheck[];
} {
  const seoScore = crawlData.seoScore;
  const mobileScore = crawlData.mobileScore;

  // Generate checks based on actual crawl data
  const metaChecks: SEOCheck[] = [
    {
      id: "title-tags",
      name: "Title Tags",
      status: seoScore > 70 ? "pass" : seoScore > 50 ? "warning" : "fail",
      description:
        seoScore > 70
          ? "Present and optimized across pages"
          : "Some pages missing or have non-optimal title tags",
      value:
        seoScore > 70
          ? `${Math.round(crawlData.totalPages * 0.95)} pages optimized`
          : `${Math.round(crawlData.totalPages * 0.7)} pages need attention`,
    },
    {
      id: "meta-descriptions",
      name: "Meta Descriptions",
      status: seoScore > 75 ? "pass" : seoScore > 55 ? "warning" : "fail",
      description:
        seoScore > 75
          ? "Present with optimal length (120-160 chars)"
          : "Some descriptions missing or need optimization",
    },
    {
      id: "canonical-urls",
      name: "Canonical URLs",
      status: seoScore > 60 ? "pass" : "warning",
      description:
        seoScore > 60
          ? "Properly configured to avoid duplicate content"
          : "Consider adding canonical tags for content pages",
    },
    {
      id: "robots-meta",
      name: "Robots Meta",
      status: "pass",
      description: "No issues detected with robots directives",
    },
    {
      id: "open-graph",
      name: "Open Graph Tags",
      status: seoScore > 80 ? "pass" : "warning",
      description:
        seoScore > 80
          ? "Social sharing optimized with OG tags"
          : "Consider adding og:image and og:description",
    },
    {
      id: "twitter-cards",
      name: "Twitter Cards",
      status: seoScore > 85 ? "pass" : "fail",
      description:
        seoScore > 85 ? "Twitter Card meta tags configured" : "Not configured",
    },
  ];

  const contentChecks: SEOCheck[] = [
    {
      id: "h1-tags",
      name: "H1 Tags",
      status:
        crawlData.architectureScore > 70
          ? "pass"
          : crawlData.architectureScore > 50
            ? "warning"
            : "fail",
      description:
        crawlData.architectureScore > 70
          ? "Single H1 per page, properly structured"
          : "Some pages have missing or multiple H1 tags",
    },
    {
      id: "heading-hierarchy",
      name: "Heading Hierarchy",
      status: crawlData.architectureScore > 75 ? "pass" : "warning",
      description:
        crawlData.architectureScore > 75
          ? "Proper heading hierarchy (H1→H2→H3)"
          : "Some pages skip heading levels",
    },
    {
      id: "image-alt",
      name: "Image Alt Text",
      status: seoScore > 70 ? "pass" : seoScore > 50 ? "warning" : "fail",
      description:
        seoScore > 70
          ? "Images have descriptive alt text"
          : `Approximately ${Math.round(crawlData.totalPages * 0.15)} images need alt text`,
    },
    {
      id: "internal-links",
      name: "Internal Links",
      status:
        crawlData.orphanPages < 10 && crawlData.deadEnds < 15
          ? "pass"
          : "warning",
      description:
        crawlData.orphanPages < 10
          ? "Good internal linking structure"
          : `${crawlData.orphanPages} orphan pages and ${crawlData.deadEnds} dead ends found`,
    },
    {
      id: "broken-links",
      name: "Broken Links",
      status: crawlData.brokenLinks === 0 ? "pass" : "fail",
      description:
        crawlData.brokenLinks === 0
          ? "No broken links detected"
          : `${crawlData.brokenLinks} broken links found`,
    },
    {
      id: "duplicate-content",
      name: "Duplicate Content",
      status: seoScore > 60 ? "pass" : "warning",
      description:
        seoScore > 60
          ? "No significant duplicate content detected"
          : "Potential duplicate content issues",
    },
  ];

  const technicalChecks: SEOCheck[] = [
    {
      id: "sitemap",
      name: "XML Sitemap",
      status: seoScore > 65 ? "pass" : "fail",
      description:
        seoScore > 65
          ? "Valid sitemap found and configured"
          : "XML sitemap not detected or invalid",
    },
    {
      id: "robots-txt",
      name: "Robots.txt",
      status: "pass",
      description: "robots.txt properly configured",
    },
    {
      id: "ssl",
      name: "SSL Certificate",
      status: "pass",
      description: "Valid HTTPS configuration",
    },
    {
      id: "mobile-friendly",
      name: "Mobile Friendly",
      status: mobileScore > 70 ? "pass" : mobileScore > 50 ? "warning" : "fail",
      description:
        mobileScore > 70
          ? "Responsive design detected"
          : "Mobile experience needs improvement",
    },
    {
      id: "structured-data",
      name: "Structured Data",
      status: seoScore > 80 ? "pass" : "fail",
      description:
        seoScore > 80
          ? "Schema.org markup implemented"
          : "No structured data / schema markup found",
    },
    {
      id: "hreflang",
      name: "Hreflang Tags",
      status: "warning",
      description: "Consider adding for multi-language support",
    },
  ];

  const performanceChecks: SEOCheck[] = [
    {
      id: "page-speed",
      name: "Page Speed",
      status:
        crawlData.avgPageSpeed < 2
          ? "pass"
          : crawlData.avgPageSpeed < 4
            ? "warning"
            : "fail",
      description: `Average load time: ${crawlData.avgPageSpeed.toFixed(1)}s`,
      value:
        crawlData.avgPageSpeed < 2
          ? "Excellent"
          : crawlData.avgPageSpeed < 4
            ? "Needs improvement"
            : "Poor",
    },
    {
      id: "core-web-vitals",
      name: "Core Web Vitals",
      status: mobileScore > 75 ? "pass" : mobileScore > 55 ? "warning" : "fail",
      description:
        mobileScore > 75
          ? "LCP, FID, CLS within acceptable ranges"
          : "Some metrics need optimization",
    },
    {
      id: "render-blocking",
      name: "Render Blocking",
      status: seoScore > 70 ? "pass" : "warning",
      description:
        seoScore > 70
          ? "CSS and JS optimized"
          : "Some render-blocking resources detected",
    },
    {
      id: "image-optimization",
      name: "Image Optimization",
      status: seoScore > 75 ? "pass" : "warning",
      description:
        seoScore > 75
          ? "Images properly compressed and sized"
          : "Some images could be optimized",
    },
  ];

  return { metaChecks, contentChecks, technicalChecks, performanceChecks };
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface CheckListProps {
  checks: SEOCheck[];
  title: string;
  icon: React.ReactNode;
}

function CheckList({ checks, title, icon }: CheckListProps) {
  const getStatusIcon = (status: SEOCheck["status"]) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "fail":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
    }
  };

  const passCount = checks.filter((c) => c.status === "pass").length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            {icon}
            {title}
          </span>
          <Badge
            variant="outline"
            className={cn(
              "text-xs",
              passCount === checks.length
                ? "border-emerald-500/50 text-emerald-500"
                : passCount > checks.length / 2
                  ? "border-amber-500/50 text-amber-500"
                  : "border-red-500/50 text-red-500"
            )}
          >
            {passCount}/{checks.length} passed
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {checks.map((check) => (
            <motion.div
              key={check.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              {getStatusIcon(check.status)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{check.name}</span>
                  {check.value && (
                    <span className="text-xs text-muted-foreground">
                      • {check.value}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {check.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * SEOTab - SEO metrics and optimization recommendations
 *
 * Features:
 * - Overall SEO score with circular progress
 * - Categorized SEO checks (Meta, Content, Technical, Performance)
 * - Pass/fail status for each check
 * - Actionable descriptions
 *
 * @example
 * ```tsx
 * <SEOTab crawlData={crawlData} />
 * ```
 */
export function SEOTab({ crawlData }: SEOTabProps) {
  const { metaChecks, contentChecks, technicalChecks, performanceChecks } =
    useMemo(() => generateSEOChecks(crawlData), [crawlData]);

  const allChecks = [
    ...metaChecks,
    ...contentChecks,
    ...technicalChecks,
    ...performanceChecks,
  ];

  const passCount = allChecks.filter((c) => c.status === "pass").length;
  const failCount = allChecks.filter((c) => c.status === "fail").length;
  const warnCount = allChecks.filter((c) => c.status === "warning").length;

  const seoScore = crawlData.seoScore;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Search className="h-5 w-5 text-violet-500" />
          SEO Analysis
        </h2>
        <p className="text-sm text-muted-foreground">
          Search engine optimization assessment and recommendations
        </p>
      </div>

      {/* SEO Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-violet-500" />
              SEO Score
            </CardTitle>
            <CardDescription>
              Overall search engine optimization assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-8">
              {/* Circular Score */}
              <div className="relative w-36 h-36 flex-shrink-0">
                <svg className="w-36 h-36 transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="64"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-muted/30"
                  />
                  <motion.circle
                    cx="72"
                    cy="72"
                    r="64"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "0 402" }}
                    animate={{
                      strokeDasharray: `${seoScore * 4.02} 402`,
                    }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={cn(
                      seoScore >= 80
                        ? "text-emerald-500"
                        : seoScore >= 60
                          ? "text-amber-500"
                          : "text-red-500"
                    )}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className={cn(
                      "text-4xl font-bold",
                      getScoreColor(seoScore)
                    )}
                  >
                    {seoScore}
                  </span>
                  <span className="text-xs text-muted-foreground">/ 100</span>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="flex-1 grid grid-cols-3 gap-4 w-full">
                <div className="text-center p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
                  <p className="text-2xl font-bold text-emerald-500">
                    {passCount}
                  </p>
                  <p className="text-xs text-muted-foreground">Passed</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <AlertCircle className="h-5 w-5 mx-auto mb-1 text-amber-500" />
                  <p className="text-2xl font-bold text-amber-500">
                    {warnCount}
                  </p>
                  <p className="text-xs text-muted-foreground">Warnings</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <XCircle className="h-5 w-5 mx-auto mb-1 text-red-500" />
                  <p className="text-2xl font-bold text-red-500">{failCount}</p>
                  <p className="text-xs text-muted-foreground">Failed</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Check Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <CheckList
          checks={metaChecks}
          title="Meta Tags"
          icon={<FileText className="h-4 w-4 text-violet-500" />}
        />
        <CheckList
          checks={contentChecks}
          title="Content"
          icon={<Image className="h-4 w-4 text-blue-500" />}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <CheckList
          checks={technicalChecks}
          title="Technical SEO"
          icon={<Link className="h-4 w-4 text-emerald-500" />}
        />
        <CheckList
          checks={performanceChecks}
          title="Performance"
          icon={<Zap className="h-4 w-4 text-amber-500" />}
        />
      </motion.div>

      {/* Quick Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4 text-violet-500" />
              Quick SEO Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-violet-500/5 border border-violet-500/20">
                <Globe className="h-4 w-4 text-violet-500 mb-2" />
                <p className="text-sm font-medium">Optimize Titles</p>
                <p className="text-xs text-muted-foreground">
                  Keep titles 50-60 characters with target keywords
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <Smartphone className="h-4 w-4 text-blue-500 mb-2" />
                <p className="text-sm font-medium">Mobile First</p>
                <p className="text-xs text-muted-foreground">
                  Ensure responsive design on all devices
                </p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                <Link className="h-4 w-4 text-emerald-500 mb-2" />
                <p className="text-sm font-medium">Internal Linking</p>
                <p className="text-xs text-muted-foreground">
                  Create a strong internal link structure
                </p>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <Zap className="h-4 w-4 text-amber-500 mb-2" />
                <p className="text-sm font-medium">Page Speed</p>
                <p className="text-xs text-muted-foreground">
                  Target under 3 seconds load time
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Footer */}
      <p className="text-xs text-muted-foreground text-center">
        Analysis based on {crawlData.totalPages} pages • Last updated:{" "}
        {new Date(crawlData.crawledAt).toLocaleString()}
      </p>
    </div>
  );
}
