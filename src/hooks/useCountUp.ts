import { useState, useEffect } from "react";

/**
 * Custom hook for animating numbers counting up
 * @param end - The target number to count to
 * @param duration - Animation duration in seconds (default: 1.5)
 * @param start - Starting number (default: 0)
 * @returns The current count value
 */
export function useCountUp(
  end: number,
  duration: number = 1.5,
  start: number = 0
): number {
  const [count, setCount] = useState(start);

  useEffect(() => {
    if (end === start) {
      setCount(end);
      return;
    }

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = (currentTime - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out quart function for smooth deceleration
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(start + (end - start) * easeOutQuart);

      setCount(currentCount);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end); // Ensure we end exactly at the target
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, start]);

  return count;
}

