import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/shared/Providers";
import "./globals.css";

/**
 * Google Sans Flex - Primary font for UI text
 * Using Inter as fallback since Google Sans Flex requires custom loading
 * The font will be loaded via CSS from Google Fonts
 */
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

/**
 * Application metadata for SEO and social sharing
 */
export const metadata: Metadata = {
  title: {
    default: "Website Analyzer Pro",
    template: "%s | Website Analyzer Pro",
  },
  description:
    "Analyze website architecture, SEO performance, and discover optimization opportunities with AI-powered insights.",
  keywords: [
    "website analyzer",
    "SEO audit",
    "site crawler",
    "website optimization",
    "performance analysis",
    "link checker",
  ],
  authors: [{ name: "Website Analyzer Pro Team" }],
  creator: "Website Analyzer Pro",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Website Analyzer Pro",
    description:
      "Analyze website architecture, SEO performance, and discover optimization opportunities.",
    siteName: "Website Analyzer Pro",
  },
  twitter: {
    card: "summary_large_image",
    title: "Website Analyzer Pro",
    description:
      "Analyze website architecture, SEO performance, and discover optimization opportunities.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * Viewport configuration for responsive design
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

/**
 * RootLayout - Main application wrapper
 *
 * This layout wraps the entire application and provides:
 * - Font loading and CSS custom properties
 * - Dark/light mode support via class strategy
 * - Global styles and Tailwind CSS
 * - Metadata configuration
 *
 * Note: Navigation and sidebar components are handled at the page level
 * to allow different layouts for different routes (e.g., landing vs dashboard)
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable}`}
      // Suppress hydration warning for theme class changes
      suppressHydrationWarning
    >
      <body 
        className="min-h-screen bg-background font-sans text-foreground antialiased"
        suppressHydrationWarning
      >
        <Providers>
          {/* 
            Main content wrapper
            - Flex column layout for sticky footer support
            - Min height ensures footer stays at bottom
          */}
          <div className="relative flex min-h-screen flex-col">
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
