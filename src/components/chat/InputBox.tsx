"use client";

import { useState, useRef, useCallback, KeyboardEvent, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Globe, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { cn, isValidUrl, normalizeUrl } from "@/lib/utils";

// =============================================================================
// TYPES
// =============================================================================

interface InputBoxProps {
  /** Callback when URL is submitted */
  onSubmit: (url: string) => void;
  /** Whether analysis is in progress */
  isLoading?: boolean;
  /** Custom placeholder text */
  placeholder?: string;
  /** Disable the input */
  disabled?: boolean;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * InputBox - URL input component for the chat interface
 *
 * Features:
 * - Large, friendly input field
 * - Submit with Enter key or button click
 * - Loading state with animated button
 * - Input validation (non-empty, URL format hint)
 * - Polished ChatGPT-like design
 *
 * @example
 * ```tsx
 * <InputBox
 *   onSubmit={(url) => startCrawl(url)}
 *   isLoading={isCrawling}
 * />
 * ```
 */
export function InputBox({
  onSubmit,
  isLoading = false,
  placeholder = "Enter website URL...",
  disabled = false,
}: InputBoxProps) {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Trim and validate input
  const trimmedInput = input.trim();
  const isEmpty = trimmedInput.length === 0;
  
  // Validate URL format
  const normalizedUrl = !isEmpty ? normalizeUrl(trimmedInput) : "";
  const isValid = !isEmpty && isValidUrl(normalizedUrl);
  const canSubmit = isValid && !isLoading && !disabled;
  
  // Show error only after first submit attempt and when input has value
  const showError = hasAttemptedSubmit && !isEmpty && !isValid;

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault();
      setHasAttemptedSubmit(true);

      // Clear previous error
      setError(null);

      // Validate empty
      if (isEmpty) {
        setError("Please enter a website URL");
        return;
      }

      // Validate URL format
      if (!isValid) {
        setError("Please enter a valid URL (e.g., example.com)");
        return;
      }

      if (!canSubmit) return;

      onSubmit(normalizedUrl);
      setInput("");
      setHasAttemptedSubmit(false);
      setError(null);
    },
    [canSubmit, isEmpty, isValid, normalizedUrl, onSubmit]
  );
  
  /**
   * Clear error when input changes
   */
  const handleInputChange = useCallback((value: string) => {
    setInput(value);
    if (error) {
      setError(null);
    }
  }, [error]);

  /**
   * Handle Enter key press
   */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div className="w-full px-3 sm:px-4 pb-3 sm:pb-4 pt-2">
      {/* Main input container */}
      <form onSubmit={handleSubmit}>
        <BackgroundGradient
          containerClassName="max-w-3xl mx-auto"
          className={cn(
            "flex items-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl border bg-background/80 backdrop-blur-sm p-1.5 sm:p-2 transition-all duration-300",
            showError
              ? "border-red-500/50 shadow-lg shadow-red-500/10 ring-4 ring-red-500/10"
              : isFocused
              ? "border-violet-500/50 shadow-lg shadow-violet-500/10 ring-4 ring-violet-500/10"
              : "border-border hover:border-muted-foreground/30",
            isLoading && "opacity-80"
          )}
        >
          <motion.div
            className="flex items-center gap-2 w-full"
            animate={{
              scale: isFocused ? 1.01 : 1,
            }}
            transition={{ duration: 0.2 }}
          >
          {/* Globe icon */}
          <div className="flex-shrink-0 pl-1 sm:pl-2">
            <Globe
              className={cn(
                "h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-200",
                isFocused ? "text-violet-500" : "text-muted-foreground"
              )}
            />
          </div>

          {/* Input field */}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={isLoading || disabled}
            autoComplete="url"
            spellCheck={false}
            aria-invalid={showError}
            aria-describedby={showError ? "url-error" : undefined}
            className={cn(
              "flex-1 bg-transparent text-sm sm:text-base outline-none placeholder:text-muted-foreground/60",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "py-1.5 sm:py-2 px-1",
              showError && "text-red-500"
            )}
          />

          {/* Submit button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="submit"
              disabled={!canSubmit}
              size="lg"
              className={cn(
                "relative h-9 sm:h-11 min-w-[80px] sm:min-w-[120px] rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base",
                canSubmit
                  ? "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-purple-500/25"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2"
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analyzing...</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Analyze</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Button shine effect */}
              {canSubmit && !isLoading && (
                <motion.div
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: "-100%" }}
                  animate={{ x: "200%" }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 3,
                    ease: "linear",
                  }}
                />
              )}
            </Button>
          </motion.div>
          </motion.div>
        </BackgroundGradient>
      </form>

      {/* Error message */}
      <AnimatePresence>
        {(error || showError) && (
          <motion.div
            initial={{ opacity: 0, y: -5, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -5, height: 0 }}
            transition={{ duration: 0.2 }}
            id="url-error"
            role="alert"
            aria-live="polite"
            className="mt-2 flex items-center gap-1.5 text-sm text-red-500"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error || "Please enter a valid URL"}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Helper text */}
      <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground/60">
        <span className="flex items-center gap-1.5">
          <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
            Enter
          </kbd>
          <span>to analyze</span>
        </span>
        <span className="h-3 w-px bg-border" />
        <span>Supports any public website</span>
      </div>
    </div>
  );
}

// =============================================================================
// COMPACT VARIANT (for dashboard)
// =============================================================================

interface CompactInputBoxProps {
  onSubmit: (url: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

/**
 * Compact version of InputBox for use in dashboard sidebar
 */
export function CompactInputBox({
  onSubmit,
  isLoading = false,
  placeholder = "Enter URL...",
}: CompactInputBoxProps) {
  const [input, setInput] = useState("");
  const trimmedInput = input.trim();
  const canSubmit = trimmedInput.length > 0 && !isLoading;

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!canSubmit) return;
    onSubmit(trimmedInput);
    setInput("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="relative flex-1">
        <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder={placeholder}
          disabled={isLoading}
          className={cn(
            "w-full rounded-lg border border-border bg-background/50 py-2 pl-9 pr-3 text-sm outline-none",
            "focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20",
            "placeholder:text-muted-foreground/50",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        />
      </div>
      <Button
        type="submit"
        size="icon"
        disabled={!canSubmit}
        className={cn(
          "h-9 w-9 rounded-lg",
          canSubmit
            ? "bg-violet-600 hover:bg-violet-500"
            : "bg-muted text-muted-foreground"
        )}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ArrowUp className="h-4 w-4" />
        )}
      </Button>
    </form>
  );
}
