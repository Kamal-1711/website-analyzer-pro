"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCw,
  Trash2,
  BarChart3,
  Activity,
  Clock,
  FileText,
  MousePointer,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getAnalytics,
  getEvents,
  clearAnalytics,
  type AnalyticsStats,
  type AnalyticsEvent,
} from "@/lib/analytics";

// =============================================================================
// STAT CARD COMPONENT
// =============================================================================

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
}

function StatCard({ title, value, icon, subtitle }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================================================
// EVENT LOG COMPONENT
// =============================================================================

interface EventLogProps {
  events: AnalyticsEvent[];
}

function EventLog({ events }: EventLogProps) {
  const getEventColor = (name: string) => {
    if (name.includes("completed")) return "text-emerald-500";
    if (name.includes("failed") || name.includes("error")) return "text-red-500";
    if (name.includes("started")) return "text-blue-500";
    if (name.includes("deleted")) return "text-amber-500";
    return "text-muted-foreground";
  };

  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto">
      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No events recorded yet
        </p>
      ) : (
        events.map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border/50"
          >
            <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-current" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`font-medium ${getEventColor(event.name)}`}>
                  {event.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>
              {event.data && Object.keys(event.data).length > 0 && (
                <pre className="mt-1 text-xs text-muted-foreground font-mono overflow-x-auto">
                  {JSON.stringify(event.data, null, 2)}
                </pre>
              )}
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function AnalyticsDebugPage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const loadData = () => {
    setIsLoading(true);
    try {
      const analyticsStats = getAnalytics();
      const allEvents = getEvents();
      setStats(analyticsStats);
      setEvents([...allEvents].reverse()); // Most recent first
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
    loadData();
  }, []);

  const handleClear = () => {
    if (confirm("Are you sure you want to clear all analytics data?")) {
      clearAnalytics();
      loadData();
    }
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Only show in development (checked client-side to avoid hydration issues)
  const isDev = process.env.NODE_ENV === "development";
  if (!isDev) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Development Only</h1>
            <p className="text-muted-foreground mb-4">
              This page is only available in development mode.
            </p>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Analytics Debug
              </h1>
              <p className="text-sm text-muted-foreground">
                Development-only analytics dashboard
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadData} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              variant="destructive"
              onClick={handleClear}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Crawls"
                value={stats?.totalCrawls || 0}
                icon={<BarChart3 className="h-4 w-4" />}
                subtitle={`${stats?.completedCrawls || 0} completed, ${stats?.failedCrawls || 0} failed`}
              />
              <StatCard
                title="Pages Analyzed"
                value={stats?.totalPagesAnalyzed?.toLocaleString() || 0}
                icon={<FileText className="h-4 w-4" />}
                subtitle={`Avg ${stats?.averagePagesPerCrawl || 0} per crawl`}
              />
              <StatCard
                title="Total Events"
                value={stats?.totalEvents || 0}
                icon={<Activity className="h-4 w-4" />}
                subtitle={stats?.firstEventDate 
                  ? `Since ${new Date(stats.firstEventDate).toLocaleDateString()}`
                  : "No events yet"}
              />
              <StatCard
                title="Last Crawl"
                value={stats?.lastCrawlDate 
                  ? new Date(stats.lastCrawlDate).toLocaleDateString()
                  : "Never"}
                icon={<Clock className="h-4 w-4" />}
                subtitle={stats?.lastCrawlDate 
                  ? new Date(stats.lastCrawlDate).toLocaleTimeString()
                  : undefined}
              />
            </div>

            {/* Two Column Layout */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Tab Views */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MousePointer className="h-5 w-5" />
                    Tab Views
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats?.tabViews && Object.keys(stats.tabViews).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(stats.tabViews)
                        .sort(([, a], [, b]) => b - a)
                        .map(([tab, count]) => (
                          <div
                            key={tab}
                            className="flex items-center justify-between"
                          >
                            <span className="capitalize">{tab}</span>
                            <span className="font-mono text-muted-foreground">
                              {count}
                            </span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No tab views recorded
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Exports */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Exports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats?.exports && Object.keys(stats.exports).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(stats.exports)
                        .sort(([, a], [, b]) => b - a)
                        .map(([format, count]) => (
                          <div
                            key={format}
                            className="flex items-center justify-between"
                          >
                            <span className="uppercase">{format}</span>
                            <span className="font-mono text-muted-foreground">
                              {count}
                            </span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No exports recorded
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Event Log */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Event Log
                  <span className="text-sm font-normal text-muted-foreground">
                    ({events.length} events)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EventLog events={events} />
              </CardContent>
            </Card>

            {/* Console Access Note */}
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  <strong>Tip:</strong> You can also access analytics from the browser console:
                </p>
                <pre className="mt-2 p-3 bg-background rounded-lg text-xs font-mono overflow-x-auto">
{`// Get stats
window.analytics.getStats()

// Get all events  
window.analytics.getEvents()

// Print summary
window.analytics.debug()

// Clear all data
window.analytics.clear()`}
                </pre>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

