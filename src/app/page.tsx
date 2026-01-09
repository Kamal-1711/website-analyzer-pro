import { Metadata } from "next";
import { ChatInterface } from "@/components/chat/ChatInterface";

// =============================================================================
// METADATA
// =============================================================================

export const metadata: Metadata = {
  title: "Website Analyzer Pro",
  description: "Analyze any website's structure in seconds",
};

// =============================================================================
// PAGE COMPONENT
// =============================================================================

/**
 * HomePage - Main landing page
 *
 * Simple wrapper around ChatInterface which handles:
 * - Sidebar with analysis history
 * - Chat area with URL input
 * - Dashboard rendering after analysis
 */
export default function HomePage() {
  return (
    <main className="h-screen flex flex-col">
      <ChatInterface />
    </main>
  );
}
