import { Variants } from "framer-motion";

/**
 * Reusable animation variants for consistent animations throughout the app
 */

// =============================================================================
// FADE ANIMATIONS
// =============================================================================

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
};

// =============================================================================
// SCALE ANIMATIONS
// =============================================================================

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
};

export const scaleInCenter: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

export const scaleOnHover = {
  scale: 1.05,
  transition: { duration: 0.2, ease: "easeOut" },
};

export const scaleOnTap = {
  scale: 0.98,
  transition: { duration: 0.1 },
};

// =============================================================================
// SLIDE ANIMATIONS
// =============================================================================

export const slideInFromBottom: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export const slideInFromTop: Variants = {
  hidden: { opacity: 0, y: -30 },
  visible: { opacity: 1, y: 0 },
};

export const slideInFromLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0 },
};

export const slideInFromRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0 },
};

// =============================================================================
// STAGGER ANIMATIONS
// =============================================================================

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// =============================================================================
// TRANSITION PRESETS
// =============================================================================

export const smoothTransition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1] as [number, number, number, number], // ease-in-out cubic bezier
};

export const fastTransition = {
  duration: 0.2,
  ease: "easeOut" as const,
};

export const slowTransition = {
  duration: 0.5,
  ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
};

export const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 25,
};

export const bouncySpring = {
  type: "spring" as const,
  stiffness: 400,
  damping: 17,
};

// =============================================================================
// CARD ANIMATIONS
// =============================================================================

export const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springTransition,
  },
};

export const cardHover = {
  y: -4,
  transition: fastTransition,
};

// =============================================================================
// BUTTON ANIMATIONS
// =============================================================================

export const buttonHover = {
  scale: 1.05,
  boxShadow: "0 10px 25px -5px rgba(139, 92, 246, 0.3)",
  transition: fastTransition,
};

export const buttonTap = {
  scale: 0.98,
  transition: { duration: 0.1 },
};

// =============================================================================
// PROGRESS BAR ANIMATION
// =============================================================================

export const progressBarVariants: Variants = {
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
// CHART ANIMATIONS
// =============================================================================

export const barChartVariants: Variants = {
  hidden: { height: 0, opacity: 0 },
  visible: (height: number) => ({
    height,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

export const pieSliceVariants: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// =============================================================================
// TAB ANIMATIONS
// =============================================================================

export const tabContentVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: smoothTransition,
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: fastTransition,
  },
};

// =============================================================================
// PAGE TRANSITIONS
// =============================================================================

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: smoothTransition,
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: fastTransition,
  },
};

// =============================================================================
// NUMBER COUNTING ANIMATION
// =============================================================================
// Note: useCountUp hook will be implemented in components that need it

