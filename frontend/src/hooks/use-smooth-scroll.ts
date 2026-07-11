import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export function useSmoothScroll() {
  useEffect(() => {
    // GSAP context for proper cleanup
    const ctx = gsap.context(() => {
      const lenis = new Lenis({
        duration: 1, // Reduced duration for faster response
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1.1, // Slightly increased for punchier scroll
        touchMultiplier: 2,
        infinite: false,
        lerp: 0.08, // Added lerp for high-end smoothness (90fps feel)
      });

      // Sync Lenis with GSAP ScrollTrigger
      lenis.on("scroll", ScrollTrigger.update);

      // GSAP Ticker for performance
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });

      // Optimize for high-end feel
      gsap.ticker.lagSmoothing(0);

      // Store lenis globally
      (window as any).lenis = lenis;
    });

    return () => {
      ctx.revert();
      const lenis = (window as any).lenis;
      if (lenis) {
        lenis.destroy();
        delete (window as any).lenis;
      }
    };
  }, []);
}
