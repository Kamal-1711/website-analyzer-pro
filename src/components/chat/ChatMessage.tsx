"use client";

import { motion } from "framer-motion";
import {
  Globe,
  Bot,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import type { CrawlMessage, CrawlStatus } from "@/types";

// =============================================================================
// TYPES
// =============================================================================

interface ChatMessageProps {
  /** The message to display */
  message: CrawlMessage;
  /** Optional callback when website link is clicked */
  onWebsiteClick?: (websiteUrl: string) => void;
}

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const messageVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 500,
      damping: 30,
      mass: 0.8,
    },
  },
};

const progressVariants = {
  hidden: { width: 0 },
  visible: (progress: number) => ({
    width: `${progress}%`,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  }),
};

// =============================================================================
// STATUS ICON COMPONENT
// =============================================================================

function StatusIcon({ status }: { status?: CrawlStatus }) {
  switch (status) {
    case "pending":
      return <Clock className="h-4 w-4 text-amber-500" />;
    case "crawling":
      return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
    case "completed":
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    case "error":
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Bot className="h-4 w-4 text-muted-foreground" />;
  }
}

// =============================================================================
// PROGRESS BAR COMPONENT
// =============================================================================

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="mt-3 space-y-1.5">
      {/* Progress bar container */}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted/50">
        {/* Animated progress fill */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500"
          variants={progressVariants}
          initial="hidden"
          animate="visible"
          custom={progress}
        />
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{
            x: ["-100%", "200%"],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
      {/* Progress text */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Progress</span>
        <span className="font-medium text-foreground">{progress}%</span>
      </div>
    </div>
  );
}

// =============================================================================
// MESSAGE TIMESTAMP
// =============================================================================

function MessageTimestamp({ timestamp }: { timestamp: Date }) {
  const timeStr = new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <span className="text-[10px] text-muted-foreground/70 mt-1.5 block">
      {timeStr}
    </span>
  );
}

// =============================================================================
// USER MESSAGE
// =============================================================================

function UserMessage({
  message,
  onWebsiteClick,
}: {
  message: CrawlMessage;
  onWebsiteClick?: (url: string) => void;
}) {
  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      className="flex items-start gap-3 justify-end"
    >
      {/* Message content */}
      <div className="flex flex-col items-end max-w-[85%]">
        <div className="relative group">
          {/* Message bubble */}
          <div className="rounded-2xl rounded-tr-md px-4 py-3 bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-lg shadow-purple-500/20">
            <p className="text-sm font-medium break-all">{message.content}</p>

            {/* Website URL if present */}
            {message.websiteUrl && (
              <button
                onClick={() => onWebsiteClick?.(message.websiteUrl!)}
                className="mt-2 flex items-center gap-1.5 text-xs text-purple-200 hover:text-white transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                <span className="underline underline-offset-2">
                  View Analysis
                </span>
              </button>
            )}
          </div>

          {/* Decorative gradient glow */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-violet-600/20 to-purple-700/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
        </div>

        <MessageTimestamp timestamp={message.timestamp} />
      </div>

      {/* User avatar */}
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
        <Globe className="h-4 w-4 text-white" />
      </div>
    </motion.div>
  );
}

// =============================================================================
// SYSTEM MESSAGE
// =============================================================================

function SystemMessage({ message }: { message: CrawlMessage }) {
  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      className="flex items-start gap-3"
    >
      {/* Bot avatar */}
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center shadow-md border border-border/50">
        <Bot className="h-4 w-4 text-slate-600 dark:text-slate-300" />
      </div>

      {/* Message content */}
      <div className="flex flex-col items-start max-w-[85%]">
        <div className="rounded-2xl rounded-tl-md px-4 py-3 bg-muted/80 dark:bg-muted/50 backdrop-blur-sm border border-border/50 shadow-sm">
          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
            {message.content}
          </p>
        </div>

        <MessageTimestamp timestamp={message.timestamp} />
      </div>
    </motion.div>
  );
}

// =============================================================================
// STATUS MESSAGE
// =============================================================================

function StatusMessage({ message }: { message: CrawlMessage }) {
  const getStatusStyles = (status?: CrawlStatus) => {
    switch (status) {
      case "pending":
        return {
          bg: "bg-amber-50 dark:bg-amber-950/30",
          border: "border-amber-200 dark:border-amber-800/50",
          text: "text-amber-700 dark:text-amber-300",
        };
      case "crawling":
        return {
          bg: "bg-blue-50 dark:bg-blue-950/30",
          border: "border-blue-200 dark:border-blue-800/50",
          text: "text-blue-700 dark:text-blue-300",
        };
      case "completed":
        return {
          bg: "bg-emerald-50 dark:bg-emerald-950/30",
          border: "border-emerald-200 dark:border-emerald-800/50",
          text: "text-emerald-700 dark:text-emerald-300",
        };
      case "error":
        return {
          bg: "bg-red-50 dark:bg-red-950/30",
          border: "border-red-200 dark:border-red-800/50",
          text: "text-red-700 dark:text-red-300",
        };
      default:
        return {
          bg: "bg-muted/50",
          border: "border-border",
          text: "text-muted-foreground",
        };
    }
  };

  const styles = getStatusStyles(message.status);

  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      className="flex items-start gap-3"
    >
      {/* Status icon avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center shadow-sm border",
          styles.bg,
          styles.border
        )}
      >
        <StatusIcon status={message.status} />
      </div>

      {/* Message content */}
      <div className="flex flex-col items-start max-w-[85%] flex-1">
        <div
          className={cn(
            "w-full rounded-2xl rounded-tl-md px-4 py-3 border shadow-sm",
            styles.bg,
            styles.border
          )}
        >
          {/* Status header */}
          <div className="flex items-center gap-2 mb-1">
            <span
              className={cn(
                "text-xs font-semibold uppercase tracking-wider",
                styles.text
              )}
            >
              {message.status === "crawling" && "Crawling..."}
              {message.status === "pending" && "Pending"}
              {message.status === "completed" && "Completed"}
              {message.status === "error" && "Error"}
              {!message.status && "Status"}
            </span>
          </div>

          {/* Message content */}
          <p className="text-sm text-foreground">{message.content}</p>

          {/* Current URL being crawled */}
          {message.websiteUrl && message.status === "crawling" && (
            <p className="mt-2 text-xs text-muted-foreground truncate">
              <span className="opacity-60">Current:</span>{" "}
              <span className="font-mono">{message.websiteUrl}</span>
            </p>
          )}

          {/* Progress bar - show for crawling and completed states */}
          {typeof message.crawlProgress === "number" &&
            (message.status === "crawling" || message.status === "completed") && (
              <ProgressBar progress={message.crawlProgress} />
            )}
        </div>

        <MessageTimestamp timestamp={message.timestamp} />
      </div>
    </motion.div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * ChatMessage - Displays individual messages in the chat interface
 *
 * Renders different styles based on message type:
 * - USER: Right-aligned, purple gradient bubble
 * - SYSTEM: Left-aligned, neutral bubble with bot avatar
 * - STATUS: Left-aligned, colored based on status with progress bar
 *
 * @example
 * ```tsx
 * <ChatMessage
 *   message={{
 *     id: "1",
 *     type: "user",
 *     content: "https://example.com",
 *     timestamp: new Date()
 *   }}
 *   onWebsiteClick={(url) => console.log("Clicked:", url)}
 * />
 * ```
 */
export function ChatMessage({ message, onWebsiteClick }: ChatMessageProps) {
  const content = (() => {
    switch (message.type) {
      case "user":
        return <UserMessage message={message} onWebsiteClick={onWebsiteClick} />;
      case "system":
        return <SystemMessage message={message} />;
      case "status":
        return <StatusMessage message={message} />;
      default:
        return <SystemMessage message={message} />;
    }
  })();

  return (
    <div
      data-testid="chat-message"
      className={cn(
        "flex w-full",
        message.type === "user" ? "justify-end" : "justify-start"
      )}
    >
      {content}
    </div>
  );
}
