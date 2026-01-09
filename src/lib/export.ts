/**
 * Export Utilities
 *
 * Functions to export crawl data and reports in various formats.
 * Supports CSV, JSON, and PDF exports.
 */

import type { CrawlData, Page } from "@/types";

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Trigger a file download in the browser
 *
 * @param content - File content as string or Blob
 * @param filename - Name of the file to download
 * @param mimeType - MIME type of the file
 */
function downloadFile(
  content: string | Blob,
  filename: string,
  mimeType: string
): void {
  const blob =
    content instanceof Blob ? content : new Blob([content], { type: mimeType });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Escape a value for CSV (handle commas, quotes, newlines)
 *
 * @param value - Value to escape
 * @returns Escaped string safe for CSV
 */
function escapeCSV(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  // If contains comma, quote, or newline, wrap in quotes
  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    // Escape quotes by doubling them
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Format date for display in exports
 *
 * @param date - Date to format
 * @returns Formatted date string
 */
function formatExportDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Get status text from HTTP code
 *
 * @param code - HTTP status code
 * @returns Human-readable status
 */
function getStatusText(code: number): string {
  if (code >= 200 && code < 300) return "OK";
  if (code >= 300 && code < 400) return "Redirect";
  if (code === 404) return "Not Found";
  if (code >= 400 && code < 500) return "Client Error";
  if (code >= 500) return "Server Error";
  return "Unknown";
}

/**
 * Get score grade from number
 *
 * @param score - Score (0-100)
 * @returns Letter grade
 */
function getGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

/**
 * Generate a safe filename
 *
 * @param name - Original name
 * @param extension - File extension (without dot)
 * @returns Safe filename
 */
function sanitizeFilename(name: string, extension: string): string {
  // Remove protocol and special chars
  const safeName = name
    .replace(/https?:\/\//g, "")
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .replace(/_+/g, "_")
    .substring(0, 50);

  const timestamp = new Date().toISOString().split("T")[0];
  return `${safeName}_${timestamp}.${extension}`;
}

// =============================================================================
// CSV EXPORT
// =============================================================================

/**
 * Export pages data as CSV file
 *
 * Creates a CSV file with columns:
 * URL, Title, Depth, Status Code, Status, Inbound Links, Outbound Links
 *
 * @param pages - Array of pages to export
 * @param filename - Optional custom filename (defaults to pages_export.csv)
 *
 * @example
 * ```ts
 * exportAsCSV(crawlData.pagesList, "my-website-pages");
 * ```
 */
export function exportAsCSV(pages: Page[], filename?: string): void {
  // Define columns
  const headers = [
    "URL",
    "Title",
    "Depth",
    "Status Code",
    "Status",
    "Inbound Links",
    "Outbound Links",
  ];

  // Build CSV content
  const rows: string[] = [];

  // Header row
  rows.push(headers.join(","));

  // Data rows
  pages.forEach((page) => {
    const row = [
      escapeCSV(page.url),
      escapeCSV(page.title),
      escapeCSV(page.depth),
      escapeCSV(page.statusCode),
      escapeCSV(getStatusText(page.statusCode)),
      escapeCSV(page.inboundLinks),
      escapeCSV(page.outboundLinks),
    ];
    rows.push(row.join(","));
  });

  const csvContent = rows.join("\n");
  const finalFilename = filename
    ? sanitizeFilename(filename, "csv")
    : `pages_export_${new Date().toISOString().split("T")[0]}.csv`;

  downloadFile(csvContent, finalFilename, "text/csv;charset=utf-8");
}

/**
 * Export full crawl data as CSV (summary + pages)
 *
 * @param crawlData - Complete crawl data
 * @param filename - Optional custom filename
 */
export function exportFullCSV(crawlData: CrawlData, filename?: string): void {
  const rows: string[] = [];

  // Summary section
  rows.push("=== WEBSITE ANALYSIS REPORT ===");
  rows.push("");
  rows.push(`Website URL,${escapeCSV(crawlData.url)}`);
  rows.push(`Analysis Date,${escapeCSV(formatExportDate(crawlData.crawledAt))}`);
  rows.push(`Total Pages,${crawlData.totalPages}`);
  rows.push("");

  // Metrics section
  rows.push("=== METRICS ===");
  rows.push("");
  rows.push(`Architecture Score,${crawlData.architectureScore}/100,${getGrade(crawlData.architectureScore)}`);
  rows.push(`SEO Score,${crawlData.seoScore}/100,${getGrade(crawlData.seoScore)}`);
  rows.push(`Mobile Score,${crawlData.mobileScore}/100,${getGrade(crawlData.mobileScore)}`);
  rows.push(`Average Depth,${crawlData.avgDepth.toFixed(1)}`);
  rows.push(`Max Depth,${crawlData.maxDepth}`);
  rows.push(`Average Page Speed,${crawlData.avgPageSpeed.toFixed(2)}s`);
  rows.push("");

  // Issues section
  rows.push("=== ISSUES ===");
  rows.push("");
  rows.push(`Orphan Pages,${crawlData.orphanPages}`);
  rows.push(`Dead End Pages,${crawlData.deadEnds}`);
  rows.push(`Broken Links,${crawlData.brokenLinks}`);
  rows.push("");

  // Pages section
  rows.push("=== PAGES ===");
  rows.push("");
  rows.push("URL,Title,Depth,Status Code,Status,Inbound Links,Outbound Links");

  crawlData.pagesList.forEach((page) => {
    const row = [
      escapeCSV(page.url),
      escapeCSV(page.title),
      escapeCSV(page.depth),
      escapeCSV(page.statusCode),
      escapeCSV(getStatusText(page.statusCode)),
      escapeCSV(page.inboundLinks),
      escapeCSV(page.outboundLinks),
    ];
    rows.push(row.join(","));
  });

  const csvContent = rows.join("\n");
  const finalFilename = filename
    ? sanitizeFilename(filename, "csv")
    : sanitizeFilename(crawlData.url, "csv");

  downloadFile(csvContent, finalFilename, "text/csv;charset=utf-8");
}

// =============================================================================
// JSON EXPORT
// =============================================================================

/**
 * Export crawl data as JSON file
 *
 * Creates a pretty-formatted JSON file with all crawl data.
 *
 * @param crawlData - Complete crawl data to export
 * @param filename - Optional custom filename (defaults to based on URL)
 *
 * @example
 * ```ts
 * exportAsJSON(crawlData, "example-com-analysis");
 * ```
 */
export function exportAsJSON(crawlData: CrawlData, filename?: string): void {
  // Create export object with metadata
  const exportData = {
    exportedAt: new Date().toISOString(),
    exportVersion: "1.0",
    websiteAnalysis: {
      id: crawlData.id,
      websiteId: crawlData.websiteId,
      url: crawlData.url,
      crawledAt: crawlData.crawledAt,
      summary: {
        totalPages: crawlData.totalPages,
        averageDepth: crawlData.avgDepth,
        maxDepth: crawlData.maxDepth,
      },
      scores: {
        architecture: {
          score: crawlData.architectureScore,
          grade: getGrade(crawlData.architectureScore),
        },
        seo: {
          score: crawlData.seoScore,
          grade: getGrade(crawlData.seoScore),
        },
        mobile: {
          score: crawlData.mobileScore,
          grade: getGrade(crawlData.mobileScore),
        },
      },
      performance: {
        averagePageSpeed: crawlData.avgPageSpeed,
      },
      issues: {
        orphanPages: crawlData.orphanPages,
        deadEnds: crawlData.deadEnds,
        brokenLinks: crawlData.brokenLinks,
      },
      pages: crawlData.pagesList.map((page) => ({
        ...page,
        statusText: getStatusText(page.statusCode),
      })),
    },
  };

  const jsonContent = JSON.stringify(exportData, null, 2);
  const finalFilename = filename
    ? sanitizeFilename(filename, "json")
    : sanitizeFilename(crawlData.url, "json");

  downloadFile(jsonContent, finalFilename, "application/json");
}

// =============================================================================
// PDF EXPORT (Simple Text-Based)
// =============================================================================

/**
 * Export crawl data as PDF file
 *
 * Creates a simple text-based PDF report with all metrics.
 * Note: For a full featured PDF with charts, consider using jspdf + chart libraries.
 *
 * @param crawlData - Complete crawl data to export
 * @param filename - Optional custom filename
 *
 * @example
 * ```ts
 * await exportAsPDF(crawlData, "website-audit-report");
 * ```
 */
export async function exportAsPDF(
  crawlData: CrawlData,
  filename?: string
): Promise<void> {
  // Dynamic import jspdf (if available)
  try {
    // @ts-expect-error - jspdf is an optional dependency
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    let y = 20; // Current Y position
    const lineHeight = 7;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    // Helper to add text with word wrap
    const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      const lines = doc.splitTextToSize(text, contentWidth);
      lines.forEach((line: string) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, margin, y);
        y += lineHeight;
      });
    };

    // Helper to add section header
    const addSection = (title: string) => {
      y += 5;
      doc.setDrawColor(139, 92, 246); // Violet color
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;
      addText(title, 14, true);
      y += 3;
    };

    // Title
    doc.setTextColor(0, 0, 0);
    addText("WEBSITE ANALYSIS REPORT", 20, true);
    y += 5;

    // Website info
    addText(`Website: ${crawlData.url}`, 12);
    addText(`Analysis Date: ${formatExportDate(crawlData.crawledAt)}`, 10);
    addText(`Total Pages Analyzed: ${crawlData.totalPages}`, 10);

    // Scores Section
    addSection("SCORES");
    addText(`Architecture Score: ${crawlData.architectureScore}/100 (Grade: ${getGrade(crawlData.architectureScore)})`);
    addText(`SEO Score: ${crawlData.seoScore}/100 (Grade: ${getGrade(crawlData.seoScore)})`);
    addText(`Mobile Score: ${crawlData.mobileScore}/100 (Grade: ${getGrade(crawlData.mobileScore)})`);

    // Metrics Section
    addSection("SITE METRICS");
    addText(`Average Page Depth: ${crawlData.avgDepth.toFixed(1)} clicks from homepage`);
    addText(`Maximum Depth: ${crawlData.maxDepth} levels`);
    addText(`Average Page Speed: ${crawlData.avgPageSpeed.toFixed(2)} seconds`);

    // Issues Section
    addSection("ISSUES DETECTED");
    addText(`Orphan Pages: ${crawlData.orphanPages} (pages with no inbound links)`);
    addText(`Dead End Pages: ${crawlData.deadEnds} (pages with no outbound links)`);
    addText(`Broken Links: ${crawlData.brokenLinks} (404 or error responses)`);

    // Recommendations Section
    addSection("RECOMMENDATIONS");
    if (crawlData.orphanPages > 0) {
      addText(`• Add internal links to ${crawlData.orphanPages} orphan pages`);
    }
    if (crawlData.deadEnds > 0) {
      addText(`• Add navigation or related links to ${crawlData.deadEnds} dead-end pages`);
    }
    if (crawlData.brokenLinks > 0) {
      addText(`• Fix or remove ${crawlData.brokenLinks} broken links`);
    }
    if (crawlData.avgDepth > 3.5) {
      addText(`• Consider restructuring to reduce average depth (current: ${crawlData.avgDepth.toFixed(1)})`);
    }
    if (crawlData.seoScore < 70) {
      addText(`• Improve SEO: add meta tags, optimize titles, check headings`);
    }
    if (crawlData.mobileScore < 80) {
      addText(`• Improve mobile experience: check responsive design`);
    }

    // Page Summary Section (first 20 pages)
    addSection("PAGE SUMMARY (First 20 Pages)");
    const topPages = crawlData.pagesList.slice(0, 20);
    topPages.forEach((page, index) => {
      const status = getStatusText(page.statusCode);
      addText(`${index + 1}. ${page.title || "Untitled"} (Depth: ${page.depth}, ${status})`);
    });

    if (crawlData.pagesList.length > 20) {
      addText(`... and ${crawlData.pagesList.length - 20} more pages`);
    }

    // Footer
    y = 280;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text("Generated by Website Analyzer Pro", margin, y);
    doc.text(new Date().toISOString(), pageWidth - margin - 50, y);

    // Save
    const finalFilename = filename
      ? sanitizeFilename(filename, "pdf")
      : sanitizeFilename(crawlData.url + "-report", "pdf");

    doc.save(finalFilename);
  } catch (error) {
    // jspdf not available - fall back to text file
    console.warn("jsPDF not available, falling back to text export:", error);
    exportAsText(crawlData, filename);
  }
}

/**
 * Export as plain text file (fallback for PDF)
 *
 * @param crawlData - Complete crawl data
 * @param filename - Optional filename
 */
export function exportAsText(crawlData: CrawlData, filename?: string): void {
  const lines: string[] = [];

  lines.push("═".repeat(60));
  lines.push("           WEBSITE ANALYSIS REPORT");
  lines.push("═".repeat(60));
  lines.push("");
  lines.push(`Website:        ${crawlData.url}`);
  lines.push(`Analysis Date:  ${formatExportDate(crawlData.crawledAt)}`);
  lines.push(`Total Pages:    ${crawlData.totalPages}`);
  lines.push("");
  lines.push("─".repeat(60));
  lines.push("SCORES");
  lines.push("─".repeat(60));
  lines.push(`Architecture:   ${crawlData.architectureScore}/100 (${getGrade(crawlData.architectureScore)})`);
  lines.push(`SEO:            ${crawlData.seoScore}/100 (${getGrade(crawlData.seoScore)})`);
  lines.push(`Mobile:         ${crawlData.mobileScore}/100 (${getGrade(crawlData.mobileScore)})`);
  lines.push("");
  lines.push("─".repeat(60));
  lines.push("METRICS");
  lines.push("─".repeat(60));
  lines.push(`Avg Depth:      ${crawlData.avgDepth.toFixed(1)} clicks`);
  lines.push(`Max Depth:      ${crawlData.maxDepth} levels`);
  lines.push(`Avg Speed:      ${crawlData.avgPageSpeed.toFixed(2)}s`);
  lines.push("");
  lines.push("─".repeat(60));
  lines.push("ISSUES");
  lines.push("─".repeat(60));
  lines.push(`Orphan Pages:   ${crawlData.orphanPages}`);
  lines.push(`Dead Ends:      ${crawlData.deadEnds}`);
  lines.push(`Broken Links:   ${crawlData.brokenLinks}`);
  lines.push("");
  lines.push("─".repeat(60));
  lines.push("PAGES");
  lines.push("─".repeat(60));

  crawlData.pagesList.slice(0, 50).forEach((page, i) => {
    lines.push(`${(i + 1).toString().padStart(3)}. ${page.title || "Untitled"}`);
    lines.push(`     URL: ${page.url}`);
    lines.push(`     Depth: ${page.depth} | Status: ${page.statusCode} | Links: ${page.inboundLinks}↓ ${page.outboundLinks}↑`);
  });

  if (crawlData.pagesList.length > 50) {
    lines.push("");
    lines.push(`... and ${crawlData.pagesList.length - 50} more pages`);
  }

  lines.push("");
  lines.push("═".repeat(60));
  lines.push("Generated by Website Analyzer Pro");
  lines.push(new Date().toISOString());
  lines.push("═".repeat(60));

  const textContent = lines.join("\n");
  const finalFilename = filename
    ? sanitizeFilename(filename, "txt")
    : sanitizeFilename(crawlData.url + "-report", "txt");

  downloadFile(textContent, finalFilename, "text/plain;charset=utf-8");
}

// =============================================================================
// UTILITY EXPORTS
// =============================================================================

/**
 * Export options for UI display
 */
export const EXPORT_OPTIONS = [
  {
    id: "csv",
    label: "CSV (Pages Data)",
    description: "Spreadsheet-compatible page list",
    icon: "FileSpreadsheet",
    action: exportAsCSV,
  },
  {
    id: "csv-full",
    label: "CSV (Full Report)",
    description: "Complete analysis with all metrics",
    icon: "FileSpreadsheet",
    action: exportFullCSV,
  },
  {
    id: "json",
    label: "JSON (Raw Data)",
    description: "Machine-readable format",
    icon: "FileJson",
    action: exportAsJSON,
  },
  {
    id: "pdf",
    label: "PDF (Audit Report)",
    description: "Printable report document",
    icon: "FileText",
    action: exportAsPDF,
  },
  {
    id: "txt",
    label: "Text (Plain Report)",
    description: "Simple text format",
    icon: "File",
    action: exportAsText,
  },
] as const;

/**
 * Export type union
 */
export type ExportType = (typeof EXPORT_OPTIONS)[number]["id"];

