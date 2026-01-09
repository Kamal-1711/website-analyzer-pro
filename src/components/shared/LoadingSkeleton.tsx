"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const shimmerVariants = {
  initial: { x: "-100%" },
  animate: {
    x: "100%",
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: "linear" as const,
    },
  },
};

const pulseVariants = {
  initial: { opacity: 0.4 },
  animate: {
    opacity: [0.4, 0.7, 0.4],
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: "easeInOut" as const,
    },
  },
};

const fadeOutVariants = {
  initial: { opacity: 1 },
  exit: {
    opacity: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

// =============================================================================
// BASE SKELETON
// =============================================================================

interface SkeletonProps {
  className?: string;
  shimmer?: boolean;
  style?: React.CSSProperties;
}

/**
 * Base skeleton component with shimmer effect
 */
export function Skeleton({ className, shimmer = true, style }: SkeletonProps) {
  return (
    <div
      style={style}
      className={cn(
        "relative overflow-hidden rounded-md bg-muted/60",
        className
      )}
    >
      {shimmer && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          variants={shimmerVariants}
          initial="initial"
          animate="animate"
        />
      )}
    </div>
  );
}

/**
 * Pulsing skeleton variant
 */
export function PulseSkeleton({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn("rounded-md bg-muted/60", className)}
      variants={pulseVariants}
      initial="initial"
      animate="animate"
    />
  );
}

// =============================================================================
// CARD SKELETON
// =============================================================================

interface CardSkeletonProps {
  className?: string;
  showIcon?: boolean;
}

/**
 * Skeleton for summary/metric cards
 */
export function CardSkeleton({ className, showIcon = true }: CardSkeletonProps) {
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border/50 bg-card p-6",
        className
      )}
      variants={pulseVariants}
      initial="initial"
      animate="animate"
    >
      {/* Shimmer overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
        variants={shimmerVariants}
        initial="initial"
        animate="animate"
      />

      <div className="relative space-y-4">
        {/* Header with icon */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" shimmer={false} />
          {showIcon && <Skeleton className="h-8 w-8 rounded-lg" shimmer={false} />}
        </div>

        {/* Main value */}
        <Skeleton className="h-10 w-20" shimmer={false} />

        {/* Subtext */}
        <Skeleton className="h-3 w-32" shimmer={false} />
      </div>
    </motion.div>
  );
}

/**
 * Grid of card skeletons
 */
export function CardSkeletonGrid({
  count = 4,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

// =============================================================================
// CHART SKELETON
// =============================================================================

interface ChartSkeletonProps {
  className?: string;
  height?: number;
  type?: "bar" | "pie" | "line" | "area";
}

/**
 * Skeleton for chart components
 */
export function ChartSkeleton({
  className,
  height = 300,
  type = "bar",
}: ChartSkeletonProps) {
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border/50 bg-card p-6",
        className
      )}
      variants={pulseVariants}
      initial="initial"
      animate="animate"
      style={{ height }}
    >
      {/* Shimmer overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
        variants={shimmerVariants}
        initial="initial"
        animate="animate"
      />

      <div className="relative h-full flex flex-col">
        {/* Chart title */}
        <Skeleton className="h-5 w-32 mb-4" shimmer={false} />

        {/* Chart area */}
        <div className="flex-1 flex items-end gap-2 pb-4">
          {type === "bar" && (
            <>
              {[40, 65, 35, 80, 55, 70, 45, 90, 60, 75].map((h, i) => (
                <Skeleton
                  key={i}
                  className="flex-1 rounded-t-sm"
                  style={{ height: `${h}%` }}
                  shimmer={false}
                />
              ))}
            </>
          )}

          {type === "pie" && (
            <div className="flex-1 flex items-center justify-center">
              <Skeleton className="w-40 h-40 rounded-full" shimmer={false} />
            </div>
          )}

          {type === "line" && (
            <div className="flex-1 relative">
              <svg
                className="w-full h-full"
                viewBox="0 0 400 200"
                preserveAspectRatio="none"
              >
                <path
                  d="M 0 150 Q 50 100, 100 120 T 200 80 T 300 100 T 400 60"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-muted/40"
                />
              </svg>
            </div>
          )}

          {type === "area" && (
            <div className="flex-1 relative">
              <Skeleton
                className="absolute bottom-0 left-0 right-0 rounded-t-xl"
                style={{
                  height: "70%",
                  clipPath:
                    "polygon(0 60%, 25% 40%, 50% 55%, 75% 30%, 100% 45%, 100% 100%, 0 100%)",
                }}
                shimmer={false}
              />
            </div>
          )}
        </div>

        {/* X-axis labels */}
        <div className="flex justify-between gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-8" shimmer={false} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// =============================================================================
// MESSAGE SKELETON
// =============================================================================

interface MessageSkeletonProps {
  className?: string;
  showProgress?: boolean;
  progress?: number;
}

/**
 * Skeleton for chat messages during loading/crawling
 */
export function MessageSkeleton({
  className,
  showProgress = true,
  progress = 0,
}: MessageSkeletonProps) {
  return (
    <motion.div
      className={cn("flex items-start gap-3", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Avatar skeleton */}
      <motion.div
        className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center"
        variants={pulseVariants}
        initial="initial"
        animate="animate"
      >
        <motion.div
          className="w-4 h-4 rounded-full bg-blue-500/40"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 1,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* Message content */}
      <div className="flex-1 max-w-[85%]">
        <motion.div
          className="rounded-2xl rounded-tl-md px-4 py-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50"
          variants={pulseVariants}
          initial="initial"
          animate="animate"
        >
          {/* Status header */}
          <div className="flex items-center gap-2 mb-2">
            <motion.div
              className="w-2 h-2 rounded-full bg-blue-500"
              animate={{
                opacity: [1, 0.4, 1],
              }}
              transition={{
                repeat: Infinity,
                duration: 1,
                ease: "easeInOut",
              }}
            />
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Analyzing...
            </span>
          </div>

          {/* Loading text */}
          <div className="space-y-2">
            <p className="text-sm text-foreground">
              Crawling website structure...
            </p>

            {/* Animated dots */}
            <div className="flex items-center gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-blue-500"
                  animate={{
                    y: [0, -4, 0],
                    opacity: [0.4, 1, 0.4],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.6,
                    delay: i * 0.15,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Progress bar */}
          {showProgress && (
            <div className="mt-3 space-y-1.5">
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-blue-200/50 dark:bg-blue-900/50">
                {/* Animated progress */}
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  variants={shimmerVariants}
                  initial="initial"
                  animate="animate"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {progress}%
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

// =============================================================================
// TABLE SKELETON
// =============================================================================

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

/**
 * Skeleton for data tables
 */
export function TableSkeleton({
  rows = 5,
  columns = 4,
  className,
}: TableSkeletonProps) {
  return (
    <motion.div
      className={cn(
        "overflow-hidden rounded-xl border border-border/50 bg-card",
        className
      )}
      variants={pulseVariants}
      initial="initial"
      animate="animate"
    >
      {/* Header */}
      <div className="flex gap-4 p-4 border-b border-border/50 bg-muted/30">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-4 flex-1"
            style={{ maxWidth: i === 0 ? "30%" : "20%" }}
            shimmer={false}
          />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex gap-4 p-4 border-b border-border/30 last:border-b-0"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              className="h-4 flex-1"
              style={{ maxWidth: colIndex === 0 ? "30%" : "20%" }}
              shimmer={false}
            />
          ))}
        </div>
      ))}
    </motion.div>
  );
}

// =============================================================================
// TEXT SKELETON
// =============================================================================

interface TextSkeletonProps {
  lines?: number;
  className?: string;
  lastLineWidth?: string;
}

/**
 * Skeleton for text content
 */
export function TextSkeleton({
  lines = 3,
  className,
  lastLineWidth = "60%",
}: TextSkeletonProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{
            width: i === lines - 1 ? lastLineWidth : "100%",
          }}
        />
      ))}
    </div>
  );
}

// =============================================================================
// DASHBOARD SKELETON
// =============================================================================

/**
 * Full dashboard loading skeleton
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-60" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="flex gap-2 border-b border-border pb-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-md" />
        ))}
      </div>

      {/* Cards grid */}
      <CardSkeletonGrid count={4} />

      {/* Content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4">
          <Skeleton className="h-5 w-24" />
          <TableSkeleton rows={4} columns={2} />
        </div>
        <ChartSkeleton type="bar" height={300} />
        <div className="space-y-4">
          <Skeleton className="h-5 w-32" />
          <TextSkeleton lines={5} />
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// OVERVIEW TAB SKELETON
// =============================================================================

/**
 * Skeleton specifically for Overview tab
 */
export function OverviewTabSkeleton() {
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Summary cards */}
      <CardSkeletonGrid count={4} />

      {/* Three column layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Key Metrics */}
        <div className="space-y-4">
          <Skeleton className="h-5 w-24" />
          <motion.div
            className="rounded-xl border border-border/50 bg-card p-4 space-y-3"
            variants={pulseVariants}
            initial="initial"
            animate="animate"
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <Skeleton className="h-4 w-24" shimmer={false} />
                <Skeleton className="h-4 w-12" shimmer={false} />
              </div>
            ))}
          </motion.div>
        </div>

        {/* Site Structure */}
        <ChartSkeleton type="area" height={280} />

        {/* Top Issues */}
        <div className="space-y-4">
          <Skeleton className="h-5 w-32" />
          <motion.div
            className="rounded-xl border border-border/50 bg-card p-4 space-y-3"
            variants={pulseVariants}
            initial="initial"
            animate="animate"
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-6 w-6 rounded-full" shimmer={false} />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-full" shimmer={false} />
                  <Skeleton className="h-3 w-20" shimmer={false} />
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// =============================================================================
// LOADING WRAPPER
// =============================================================================

interface LoadingWrapperProps {
  isLoading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
  minDuration?: number;
}

/**
 * Wrapper that shows skeleton while loading with minimum duration
 * Prevents flashing for fast loads
 */
export function LoadingWrapper({
  isLoading,
  skeleton,
  children,
  minDuration = 500,
}: LoadingWrapperProps) {
  const [showSkeleton, setShowSkeleton] = React.useState(isLoading);
  const loadStartRef = React.useRef<number>(Date.now());

  React.useEffect(() => {
    if (isLoading) {
      loadStartRef.current = Date.now();
      setShowSkeleton(true);
    } else {
      const elapsed = Date.now() - loadStartRef.current;
      const remaining = Math.max(0, minDuration - elapsed);

      if (remaining > 0) {
        const timer = setTimeout(() => setShowSkeleton(false), remaining);
        return () => clearTimeout(timer);
      } else {
        setShowSkeleton(false);
      }
    }
  }, [isLoading, minDuration]);

  return (
    <AnimatePresence mode="wait">
      {showSkeleton ? (
        <motion.div
          key="skeleton"
          variants={fadeOutVariants}
          initial="initial"
          exit="exit"
        >
          {skeleton}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Need to import React for useEffect and useRef
import React from "react";

// =============================================================================
// NETWORK TAB SKELETON
// =============================================================================

/**
 * Skeleton for Network visualization tab
 */
export function NetworkTabSkeleton() {
  return (
    <motion.div
      className="space-y-6 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </div>

      {/* Network graph area */}
      <motion.div
        className="relative overflow-hidden rounded-xl border border-border/50 bg-card"
        style={{ height: 500 }}
        variants={pulseVariants}
        initial="initial"
        animate="animate"
      >
        {/* Shimmer */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
          variants={shimmerVariants}
          initial="initial"
          animate="animate"
        />

        {/* Fake nodes */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-80 h-80">
            {/* Center node */}
            <Skeleton className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full" shimmer={false} />
            
            {/* Surrounding nodes */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
              const radius = 120;
              const x = Math.cos((angle * Math.PI) / 180) * radius;
              const y = Math.sin((angle * Math.PI) / 180) * radius;
              return (
                <Skeleton
                  key={i}
                  className="absolute w-8 h-8 rounded-full"
                  style={{
                    left: `calc(50% + ${x}px - 16px)`,
                    top: `calc(50% + ${y}px - 16px)`,
                  }}
                  shimmer={false}
                />
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Legend */}
      <div className="flex gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="w-3 h-3 rounded-full" shimmer={false} />
            <Skeleton className="h-3 w-16" shimmer={false} />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// =============================================================================
// STATISTICS TAB SKELETON
// =============================================================================

/**
 * Skeleton for Statistics tab
 */
export function StatisticsTabSkeleton() {
  return (
    <motion.div
      className="space-y-6 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Depth distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartSkeleton type="bar" height={300} />
        <ChartSkeleton type="pie" height={300} />
      </div>

      {/* Metrics table */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-40" />
        <TableSkeleton rows={6} columns={4} />
      </div>
    </motion.div>
  );
}

// =============================================================================
// AUDIT TAB SKELETON
// =============================================================================

/**
 * Skeleton for Audit tab
 */
export function AuditTabSkeleton() {
  return (
    <motion.div
      className="space-y-6 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Executive summary */}
      <motion.div
        className="rounded-xl border border-border/50 bg-card p-6 space-y-4"
        variants={pulseVariants}
        initial="initial"
        animate="animate"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" shimmer={false} />
            <Skeleton className="h-4 w-32" shimmer={false} />
          </div>
          <div className="text-right space-y-2">
            <Skeleton className="h-12 w-20 ml-auto" shimmer={false} />
            <Skeleton className="h-4 w-16 ml-auto" shimmer={false} />
          </div>
        </div>
        <div className="pt-4 border-t border-border/50 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-2 w-2 rounded-full" shimmer={false} />
              <Skeleton className="h-4 flex-1" shimmer={false} />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Issues sections */}
      {Array.from({ length: 2 }).map((_, sectionIndex) => (
        <motion.div
          key={sectionIndex}
          className="rounded-xl border border-border/50 bg-card overflow-hidden"
          variants={pulseVariants}
          initial="initial"
          animate="animate"
        >
          <div className="p-4 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-6 rounded" shimmer={false} />
              <Skeleton className="h-5 w-32" shimmer={false} />
            </div>
            <Skeleton className="h-4 w-4" shimmer={false} />
          </div>
          <div className="p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-5 w-5 rounded-full flex-shrink-0" shimmer={false} />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-full" shimmer={false} />
                  <Skeleton className="h-3 w-3/4" shimmer={false} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

// =============================================================================
// SEO TAB SKELETON
// =============================================================================

/**
 * Skeleton for SEO tab
 */
export function SEOTabSkeleton() {
  return (
    <motion.div
      className="space-y-6 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* SEO Score card */}
      <motion.div
        className="rounded-xl border border-border/50 bg-card p-6"
        variants={pulseVariants}
        initial="initial"
        animate="animate"
      >
        <div className="flex items-center gap-6">
          <Skeleton className="w-32 h-32 rounded-full" shimmer={false} />
          <div className="space-y-3 flex-1">
            <Skeleton className="h-6 w-32" shimmer={false} />
            <Skeleton className="h-4 w-48" shimmer={false} />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" shimmer={false} />
              <Skeleton className="h-6 w-20 rounded-full" shimmer={false} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* SEO sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={i}
            className="rounded-xl border border-border/50 bg-card p-4 space-y-4"
            variants={pulseVariants}
            initial="initial"
            animate="animate"
          >
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" shimmer={false} />
              <Skeleton className="h-5 w-32" shimmer={false} />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-40" shimmer={false} />
                  <Skeleton className="h-4 w-12" shimmer={false} />
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// =============================================================================
// MIND MAP TAB SKELETON
// =============================================================================

/**
 * Skeleton for Mind Map tab
 */
export function MindMapTabSkeleton() {
  return (
    <motion.div
      className="space-y-6 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-64 rounded-md" />
      </div>

      {/* Tree skeleton */}
      <motion.div
        className="rounded-xl border border-border/50 bg-card p-6 space-y-3"
        variants={pulseVariants}
        initial="initial"
        animate="animate"
      >
        {/* Root level */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" shimmer={false} />
          <Skeleton className="h-5 w-40" shimmer={false} />
        </div>
        
        {/* Level 1 */}
        <div className="pl-6 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" shimmer={false} />
                <Skeleton className="h-4 w-32" shimmer={false} />
                <Skeleton className="h-4 w-8 rounded-full" shimmer={false} />
              </div>
              
              {/* Level 2 (only for first 2) */}
              {i < 2 && (
                <div className="pl-6 space-y-1">
                  {Array.from({ length: 2 }).map((_, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <Skeleton className="h-3 w-3" shimmer={false} />
                      <Skeleton className="h-3 w-28" shimmer={false} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={i}
            className="rounded-xl border border-border/50 bg-card p-4"
            variants={pulseVariants}
            initial="initial"
            animate="animate"
          >
            <Skeleton className="h-4 w-24 mb-2" shimmer={false} />
            <Skeleton className="h-8 w-16" shimmer={false} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

