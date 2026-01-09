/**
 * Utility Functions Tests
 *
 * Tests for lib/utils.ts helper functions
 */

import {
  getWebsiteNameFromUrl,
  formatDate,
  generateId,
  isValidUrl,
  normalizeUrl,
  formatNumber,
  formatBytes,
  formatDuration,
  formatPercentage,
  truncate,
  capitalize,
  cn,
} from "@/lib/utils";

// =============================================================================
// getWebsiteNameFromUrl Tests
// =============================================================================

describe("getWebsiteNameFromUrl", () => {
  it("should extract domain from full URL with https", () => {
    expect(getWebsiteNameFromUrl("https://example.com")).toBe("example.com");
  });

  it("should extract domain from URL with http", () => {
    expect(getWebsiteNameFromUrl("http://example.com")).toBe("example.com");
  });

  it("should extract domain from URL with path", () => {
    expect(getWebsiteNameFromUrl("https://example.com/path/to/page")).toBe(
      "example.com"
    );
  });

  it("should extract domain from URL with subdomain", () => {
    expect(getWebsiteNameFromUrl("https://www.example.com")).toBe(
      "www.example.com"
    );
  });

  it("should extract hostname without port", () => {
    // URL.hostname doesn't include port
    expect(getWebsiteNameFromUrl("https://localhost:3000")).toBe("localhost");
  });

  it("should handle URL without protocol", () => {
    expect(getWebsiteNameFromUrl("example.com")).toBe("example.com");
  });

  it("should return empty string for empty input", () => {
    expect(getWebsiteNameFromUrl("")).toBe("");
  });

  it("should try to extract domain from invalid URL", () => {
    // Falls back to regex extraction
    expect(getWebsiteNameFromUrl("not-a-url")).toBe("not-a-url");
  });
});

// =============================================================================
// formatDate Tests
// =============================================================================

describe("formatDate", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-12-31T12:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should format today's date as 'Today HH:MM AM/PM'", () => {
    const today = new Date("2024-12-31T10:30:00Z");
    const result = formatDate(today);
    expect(result).toMatch(/Today/i);
  });

  it("should format yesterday's date as 'Yesterday'", () => {
    const yesterday = new Date("2024-12-30T10:30:00Z");
    const result = formatDate(yesterday);
    expect(result).toMatch(/Yesterday/i);
  });

  it("should format older dates with month and day", () => {
    const oldDate = new Date("2024-01-15T10:30:00Z");
    const result = formatDate(oldDate);
    expect(result).toMatch(/Jan 15/i);
  });

  it("should handle string date input", () => {
    const result = formatDate("2024-12-31T10:30:00Z");
    expect(result).toBeTruthy();
  });
});

// =============================================================================
// generateId Tests
// =============================================================================

describe("generateId", () => {
  it("should generate a non-empty string", () => {
    const id = generateId();
    expect(id).toBeTruthy();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });

  it("should generate unique IDs", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(generateId());
    }
    expect(ids.size).toBe(100);
  });

  it("should support optional prefix", () => {
    const id = generateId("test");
    expect(id).toMatch(/^test_/);
  });

  it("should generate IDs without prefix by default", () => {
    const id = generateId();
    expect(id).not.toContain("_");
  });
});

// =============================================================================
// isValidUrl Tests
// =============================================================================

describe("isValidUrl", () => {
  it("should return true for valid https URL", () => {
    expect(isValidUrl("https://example.com")).toBe(true);
  });

  it("should return true for valid http URL", () => {
    expect(isValidUrl("http://example.com")).toBe(true);
  });

  it("should return true for URL with path", () => {
    expect(isValidUrl("https://example.com/path")).toBe(true);
  });

  it("should return true for URL with query params", () => {
    expect(isValidUrl("https://example.com?foo=bar")).toBe(true);
  });

  it("should return false for empty string", () => {
    expect(isValidUrl("")).toBe(false);
  });

  // Note: isValidUrl adds https:// to URLs without protocol, so these become valid
  it("should return true for domain-like strings (auto-adds https://)", () => {
    expect(isValidUrl("example.com")).toBe(true);
  });

  it("should return true for simple strings (URL constructor accepts them)", () => {
    // "not-a-url" becomes "https://not-a-url" which is technically parseable
    expect(isValidUrl("not-a-url")).toBe(true);
  });
});

// =============================================================================
// normalizeUrl Tests
// =============================================================================

describe("normalizeUrl", () => {
  it("should add https to URL without protocol", () => {
    expect(normalizeUrl("example.com")).toBe("https://example.com");
  });

  it("should keep https URL as is", () => {
    expect(normalizeUrl("https://example.com")).toBe("https://example.com");
  });

  it("should keep http URL as is", () => {
    expect(normalizeUrl("http://example.com")).toBe("http://example.com");
  });

  it("should keep trailing slash (does not remove it)", () => {
    const result = normalizeUrl("https://example.com/");
    expect(result).toBe("https://example.com/");
  });
});

// =============================================================================
// formatNumber Tests
// =============================================================================

describe("formatNumber", () => {
  it("should format small numbers with locale string", () => {
    expect(formatNumber(123)).toBe("123");
  });

  it("should format thousands with commas", () => {
    expect(formatNumber(1500)).toBe("1,500");
  });

  it("should format millions with commas", () => {
    expect(formatNumber(1500000)).toBe("1,500,000");
  });

  it("should format billions with commas", () => {
    expect(formatNumber(1500000000)).toBe("1,500,000,000");
  });

  it("should handle zero", () => {
    expect(formatNumber(0)).toBe("0");
  });
});

// =============================================================================
// formatBytes Tests
// =============================================================================

describe("formatBytes", () => {
  it("should format bytes", () => {
    expect(formatBytes(500)).toBe("500 Bytes");
  });

  it("should format kilobytes", () => {
    expect(formatBytes(1024)).toBe("1 KB");
  });

  it("should format megabytes", () => {
    expect(formatBytes(1048576)).toBe("1 MB");
  });

  it("should format gigabytes", () => {
    expect(formatBytes(1073741824)).toBe("1 GB");
  });

  it("should handle zero", () => {
    expect(formatBytes(0)).toBe("0 Bytes");
  });
});

// =============================================================================
// formatDuration Tests
// =============================================================================

describe("formatDuration", () => {
  it("should format milliseconds", () => {
    expect(formatDuration(500)).toBe("500ms");
  });

  it("should format seconds with decimal", () => {
    expect(formatDuration(2500)).toBe("2.5s");
  });

  it("should format minutes and seconds", () => {
    // 90000ms = 90s = 1m 30s
    expect(formatDuration(90000)).toBe("1m 30s");
  });

  it("should handle zero", () => {
    expect(formatDuration(0)).toBe("0ms");
  });

  it("should format exact minutes without seconds", () => {
    expect(formatDuration(60000)).toBe("1m");
  });
});

// =============================================================================
// formatPercentage Tests
// =============================================================================

describe("formatPercentage", () => {
  it("should format percentage value (0-100 scale)", () => {
    // formatPercentage expects value as percentage, not decimal
    expect(formatPercentage(50)).toBe("50%");
  });

  it("should format decimal value with isDecimal flag", () => {
    // With isDecimal=true, it multiplies by 100
    expect(formatPercentage(0.333, true)).toBe("33%");
  });

  it("should handle zero", () => {
    expect(formatPercentage(0)).toBe("0%");
  });

  it("should handle 100%", () => {
    expect(formatPercentage(100)).toBe("100%");
  });

  it("should round to nearest integer", () => {
    expect(formatPercentage(33.7)).toBe("34%");
  });
});

// =============================================================================
// truncate Tests
// =============================================================================

describe("truncate", () => {
  it("should not truncate short strings", () => {
    expect(truncate("Hello", 10)).toBe("Hello");
  });

  it("should truncate long strings with ellipsis", () => {
    expect(truncate("Hello World!", 8)).toBe("Hello...");
  });

  it("should handle empty string", () => {
    expect(truncate("", 10)).toBe("");
  });

  it("should handle exact length", () => {
    expect(truncate("Hello", 5)).toBe("Hello");
  });
});

// =============================================================================
// capitalize Tests
// =============================================================================

describe("capitalize", () => {
  it("should capitalize first letter", () => {
    expect(capitalize("hello")).toBe("Hello");
  });

  it("should handle already capitalized", () => {
    expect(capitalize("Hello")).toBe("Hello");
  });

  it("should handle empty string", () => {
    expect(capitalize("")).toBe("");
  });

  it("should handle single character", () => {
    expect(capitalize("h")).toBe("H");
  });
});

// =============================================================================
// cn (className merge) Tests
// =============================================================================

describe("cn", () => {
  it("should merge class names", () => {
    const result = cn("class1", "class2");
    expect(result).toContain("class1");
    expect(result).toContain("class2");
  });

  it("should handle conditional classes", () => {
    const result = cn("base", false && "hidden", true && "visible");
    expect(result).toContain("base");
    expect(result).toContain("visible");
    expect(result).not.toContain("hidden");
  });

  it("should merge Tailwind classes correctly", () => {
    const result = cn("px-4 py-2", "px-6");
    // tailwind-merge should keep only px-6
    expect(result).toContain("px-6");
    expect(result).not.toContain("px-4");
  });

  it("should handle undefined and null", () => {
    const result = cn("base", undefined, null, "end");
    expect(result).toBe("base end");
  });
});
