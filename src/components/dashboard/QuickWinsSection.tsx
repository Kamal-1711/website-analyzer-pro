"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Link2,
  FileText,
  Unlock,
  MapPin,
  Smartphone,
  Star,
  ArrowRight,
  Info,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatNumber } from "@/lib/utils";
import type { CrawlData } from "@/types";

// =============================================================================
// TYPES
// =============================================================================

interface QuickWinsSectionProps {
  crawlData: CrawlData;
}

interface QuickWin {
  id: string;
  icon: string;
  iconComponent: React.ReactNode;
  title: string;
  description: string;
  effort: string;
  impact: "High" | "Medium" | "Low";
  impactScore: number;
  count?: number;
  currentScore?: number;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getImpactStars(impact: "High" | "Medium" | "Low"): string {
  switch (impact) {
    case "High":
      return "⭐⭐⭐";
    case "Medium":
      return "⭐⭐";
    case "Low":
      return "⭐";
  }
}

function getImpactColor(impact: "High" | "Medium" | "Low"): string {
  switch (impact) {
    case "High":
      return "text-emerald-500";
    case "Medium":
      return "text-amber-500";
    case "Low":
      return "text-blue-500";
  }
}

function getIconColor(iconType: string): string {
  const colors: Record<string, string> = {
    link: "text-blue-500 bg-blue-500/10",
    title: "text-purple-500 bg-purple-500/10",
    orphan: "text-orange-500 bg-orange-500/10",
    depth: "text-indigo-500 bg-indigo-500/10",
    mobile: "text-green-500 bg-green-500/10",
  };
  return colors[iconType] || "text-violet-500 bg-violet-500/10";
}

function generateQuickWins(crawlData: CrawlData): QuickWin[] {
  const wins: QuickWin[] = [];

  // 1. Broken Links
  if (crawlData.brokenLinks > 0) {
    wins.push({
      id: "broken-links",
      icon: "🔗",
      iconComponent: <Link2 className="h-6 w-6" />,
      title: `Fix ${crawlData.brokenLinks} Broken Link${crawlData.brokenLinks > 1 ? "s" : ""}`,
      description: "Broken links hurt UX and SEO. Fix them to improve user experience and search rankings.",
      effort: "30 min - 1 hour",
      impact: "High",
      impactScore: 90,
      count: crawlData.brokenLinks,
    });
  }

  // 2. Missing Titles (calculate from pagesList)
  const pagesWithoutTitles = crawlData.pagesList.filter(
    (page) => !page.title || page.title.trim() === "" || page.title === "Untitled"
  ).length;
  const missingTitlePercentage = (pagesWithoutTitles / crawlData.totalPages) * 100;

  if (missingTitlePercentage > 10) {
    wins.push({
      id: "missing-titles",
      icon: "📝",
      iconComponent: <FileText className="h-6 w-6" />,
      title: `Add Missing Page Titles`,
      description: `${pagesWithoutTitles} pages need titles. Titles are critical for SEO and user understanding.`,
      effort: "1-2 hours",
      impact: "High",
      impactScore: 85,
      count: pagesWithoutTitles,
    });
  }

  // 3. Orphan Pages
  if (crawlData.orphanPages > 5) {
    wins.push({
      id: "orphan-pages",
      icon: "🔓",
      iconComponent: <Unlock className="h-6 w-6" />,
      title: `Link ${crawlData.orphanPages} Orphan Page${crawlData.orphanPages > 1 ? "s" : ""}`,
      description: "These pages can't be found by users. Link them from your main navigation or related pages.",
      effort: "1 hour",
      impact: "High",
      impactScore: 80,
      count: crawlData.orphanPages,
    });
  }

  // 4. Deep Pages (pages deeper than 4 clicks)
  const deepPages = crawlData.pagesList.filter((page) => page.depth > 4).length;
  const deepPagesPercentage = (deepPages / crawlData.totalPages) * 100;

  if (deepPagesPercentage > 20) {
    wins.push({
      id: "deep-pages",
      icon: "📍",
      iconComponent: <MapPin className="h-6 w-6" />,
      title: `Reduce Navigation Depth`,
      description: `${deepPages} pages are too deep (more than 4 clicks). Users struggle to find content that's buried.`,
      effort: "2-4 hours",
      impact: "Medium",
      impactScore: 65,
      count: deepPages,
    });
  }

  // 5. Low Mobile Score
  if (crawlData.mobileScore < 80) {
    wins.push({
      id: "mobile-score",
      icon: "📱",
      iconComponent: <Smartphone className="h-6 w-6" />,
      title: `Improve Mobile Experience`,
      description: `Current score: ${crawlData.mobileScore}/100. 50%+ of users browse on mobile devices.`,
      effort: "2-3 hours",
      impact: "High",
      impactScore: 88,
      currentScore: crawlData.mobileScore,
    });
  }

  // Sort by impact score (highest first)
  return wins.sort((a, b) => b.impactScore - a.impactScore);
}

// =============================================================================
// QUICK WIN CARD COMPONENT
// =============================================================================

interface QuickWinCardProps {
  win: QuickWin;
  index: number;
}

function QuickWinCard({ win, index }: QuickWinCardProps) {
  const iconType = win.id.split("-")[0];
  const iconColor = getIconColor(iconType);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group"
    >
      <Card className="h-full hover:shadow-lg transition-all duration-300 border-border">
        <CardContent className="p-6">
            <div className="flex items-start gap-3 sm:gap-4">
            {/* LEFT: Icon */}
            <div className={cn("w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center flex-shrink-0", iconColor)}>
              <div className="text-xl sm:text-2xl">{win.icon}</div>
            </div>

            {/* MIDDLE: Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-foreground mb-1">{win.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 leading-relaxed">{win.description}</p>

              <div className="flex items-center gap-4 flex-wrap">
                {/* Effort */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Effort:</span>
                  <Badge variant="outline" className="text-xs font-medium">
                    {win.effort}
                  </Badge>
                </div>

                {/* Impact */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Impact:</span>
                  <Badge
                    variant="outline"
                    className={cn("text-xs font-medium", getImpactColor(win.impact))}
                  >
                    {win.impact} {getImpactStars(win.impact)}
                  </Badge>
                </div>
              </div>
            </div>

            {/* RIGHT: Action Button */}
            <div className="flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="h-9 min-w-[44px] group-hover:bg-violet-500 group-hover:text-white group-hover:border-violet-500 transition-colors"
                onClick={() => {
                  // Dummy action for college project
                  console.log(`Implement: ${win.title}`);
                }}
              >
                <span className="hidden sm:inline">Implement</span>
                <ArrowRight className="h-4 w-4 sm:ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// =============================================================================
// SUMMARY COMPONENT
// =============================================================================

interface QuickWinsSummaryProps {
  totalWins: number;
  totalEffort: string;
}

function QuickWinsSummary({ totalWins, totalEffort }: QuickWinsSummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mt-6 p-6 rounded-xl bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-pink-500/10 border border-violet-500/20"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0">
          <Info className="h-5 w-5 text-violet-500" />
        </div>
        <div>
          <h4 className="text-lg font-bold text-foreground mb-1">📊 Total Potential Impact</h4>
          <p className="text-sm text-muted-foreground">If you implement all {totalWins} quick wins:</p>
        </div>
      </div>

      <div className="space-y-2 text-sm text-foreground/90 ml-12">
        <div className="flex items-center gap-2">
          <span className="text-violet-500">├─</span>
          <span>+25% organic traffic potential</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-violet-500">├─</span>
          <span>+20% user engagement</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-violet-500">├─</span>
          <span>-40% bounce rate</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-violet-500">└─</span>
          <span className="font-semibold">Timeline: {totalEffort} total</span>
        </div>
      </div>
    </motion.div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * QuickWinsSection - Shows actionable improvements users can implement quickly
 *
 * Features:
 * - Generates quick wins from crawl data
 * - Shows top 5 most impactful wins
 * - Displays effort, impact, and descriptions
 * - Includes summary of total potential impact
 *
 * @example
 * ```tsx
 * <QuickWinsSection crawlData={crawlData} />
 * ```
 */
export function QuickWinsSection({ crawlData }: QuickWinsSectionProps) {
  const allWins = useMemo(() => generateQuickWins(crawlData), [crawlData]);
  const displayedWins = allWins.slice(0, 5);
  const remainingCount = Math.max(0, allWins.length - 5);

  // Calculate total effort estimate
  const totalEffort = useMemo(() => {
    if (allWins.length === 0) return "0 hours";
    if (allWins.length <= 2) return "1-3 hours";
    if (allWins.length <= 4) return "3-6 hours";
    return "5-8 hours";
  }, [allWins.length]);

  if (allWins.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Star className="h-4 w-4 text-violet-500" />
            Quick Wins
          </CardTitle>
          <CardDescription>Easy improvements with high impact</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-emerald-500" />
            </div>
            <p className="text-lg font-semibold text-foreground mb-2">Great job! 🎉</p>
            <p className="text-sm text-muted-foreground">
              No quick wins available. Your website is already well optimized!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="h-4 w-4 text-violet-500" />
              Quick Wins
            </CardTitle>
            <CardDescription>Easy improvements with high impact</CardDescription>
          </div>
          {remainingCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              +{remainingCount} more
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedWins.map((win, index) => (
            <QuickWinCard key={win.id} win={win} index={index} />
          ))}
        </div>

        {/* Summary */}
        <QuickWinsSummary totalWins={allWins.length} totalEffort={totalEffort} />

        {/* Show more link */}
        {remainingCount > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 text-center"
          >
            <Button
              variant="ghost"
              size="sm"
              className="text-sm text-muted-foreground hover:text-foreground"
              onClick={() => {
                // Dummy action - could expand to show all wins
                console.log("Show all quick wins");
              }}
            >
              View {remainingCount} more quick win{remainingCount > 1 ? "s" : ""}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

