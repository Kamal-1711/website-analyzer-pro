import type { Config } from "tailwindcss";

/**
 * Tailwind CSS Configuration
 * 
 * This project uses Tailwind CSS v4 with CSS-based configuration.
 * Most styling is handled via CSS variables in globals.css.
 * This config file provides additional customization.
 */
const config: Config = {
  // Dark mode uses class strategy for manual toggle
  darkMode: "class",

  // Content paths for purging unused styles
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      // =======================================================================
      // CUSTOM COLORS
      // =======================================================================
      colors: {
        // Brand colors
        brand: {
          primary: "#000000",
          secondary: "#8B5CF6",
        },
        // Status colors
        success: {
          DEFAULT: "#10B981",
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
        },
        warning: {
          DEFAULT: "#F59E0B",
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
        },
        error: {
          DEFAULT: "#EF4444",
          50: "#FEF2F2",
          100: "#FEE2E2",
          200: "#FECACA",
          300: "#FCA5A5",
          400: "#F87171",
          500: "#EF4444",
          600: "#DC2626",
          700: "#B91C1C",
          800: "#991B1B",
          900: "#7F1D1D",
        },
        // Purple accent (matching secondary)
        violet: {
          DEFAULT: "#8B5CF6",
          50: "#F5F3FF",
          100: "#EDE9FE",
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#6D28D9",
          800: "#5B21B6",
          900: "#4C1D95",
        },
      },

      // =======================================================================
      // CUSTOM FONTS
      // =======================================================================
      fontFamily: {
        sans: ["Google Sans Flex", "var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },

      // =======================================================================
      // CUSTOM ANIMATIONS
      // =======================================================================
      keyframes: {
        // Fade in animation
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        // Fade out animation
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        // Slide up animation
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        // Slide down animation
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        // Slide in from left
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-10px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        // Slide in from right
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(10px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        // Scale up animation
        scaleUp: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        // Pulse glow effect
        pulseGlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        // Bounce animation
        bounceIn: {
          "0%": { opacity: "0", transform: "scale(0.3)" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        // Shake animation (for errors)
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-4px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(4px)" },
        },
        // Spin animation
        spin: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        // Progress bar animation
        progress: {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
        // Shimmer effect for loading
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },

      // Animation utilities
      animation: {
        fadeIn: "fadeIn 0.3s ease-out",
        fadeOut: "fadeOut 0.3s ease-out",
        slideUp: "slideUp 0.3s ease-out",
        slideDown: "slideDown 0.3s ease-out",
        slideInLeft: "slideInLeft 0.3s ease-out",
        slideInRight: "slideInRight 0.3s ease-out",
        scaleUp: "scaleUp 0.3s ease-out",
        pulse: "pulseGlow 2s ease-in-out infinite",
        bounce: "bounceIn 0.5s ease-out",
        shake: "shake 0.5s ease-in-out",
        spin: "spin 1s linear infinite",
        progress: "progress 2s ease-out",
        shimmer: "shimmer 2s infinite linear",
      },

      // =======================================================================
      // CUSTOM SPACING & SIZING
      // =======================================================================
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },

      // =======================================================================
      // CUSTOM BORDER RADIUS
      // =======================================================================
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },

      // =======================================================================
      // CUSTOM BOX SHADOWS
      // =======================================================================
      boxShadow: {
        glow: "0 0 20px rgba(139, 92, 246, 0.3)",
        "glow-lg": "0 0 40px rgba(139, 92, 246, 0.4)",
        "inner-glow": "inset 0 0 20px rgba(139, 92, 246, 0.2)",
      },

      // =======================================================================
      // CUSTOM BACKDROP BLUR
      // =======================================================================
      backdropBlur: {
        xs: "2px",
      },

      // =======================================================================
      // CUSTOM TRANSITIONS
      // =======================================================================
      transitionDuration: {
        "400": "400ms",
      },
    },
  },

  // No plugins needed for this project
  plugins: [],
};

export default config;

