import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

type AnimationDirection = "up" | "down" | "left" | "right" | "none";

interface RevealOptions {
  delay?: number;
  duration?: number;
  y?: number;
  x?: number;
  scale?: number;
  opacity?: number;
  ease?: string;
  triggerOnce?: boolean;
  direction?: AnimationDirection;
  scrub?: boolean | number;
}

export function useReveal<T extends HTMLElement>(options: RevealOptions = {}) {
  const elementRef = useRef<T>(null);
  const {
    delay = 0,
    duration = 1.2,
    y = 30,
    x = 0,
    scale = 1,
    opacity = 0,
    ease = "power2.out",
    triggerOnce = true,
    direction = "up",
    scrub = false,
  } = options;

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      let fromVars: gsap.TweenVars = { opacity, scale, x, y };

      // Set initial state based on direction
      if (direction === "up") fromVars.y = y;
      if (direction === "down") fromVars.y = -y;
      if (direction === "left") fromVars.x = -y;
      if (direction === "right") fromVars.x = y;
      if (direction === "none") { fromVars.y = 0; fromVars.x = 0; }

      gsap.fromTo(el, 
        fromVars, 
        {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          duration,
          delay,
          ease,
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            end: "bottom 20%",
            scrub,
            toggleActions: triggerOnce ? "play none none none" : "play reverse play reverse",
          },
          // Performance optimization
          onStart: () => { el.style.willChange = "transform, opacity"; },
          onComplete: () => { el.style.willChange = "auto"; }
        }
      );
    });

    return () => ctx.revert();
  }, [delay, duration, y, x, scale, opacity, ease, triggerOnce, direction, scrub]);

  return elementRef;
}

export function useStaggerReveal<T extends HTMLElement>(options: RevealOptions & { stagger?: number } = {}) {
  const containerRef = useRef<T>(null);
  const {
    stagger = 0.1,
    delay = 0,
    duration = 1,
    y = 20,
    opacity = 0,
    ease = "power2.out",
    triggerOnce = true,
  } = options;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      const children = Array.from(container.children);
      if (children.length === 0) return;

      gsap.fromTo(children,
        { opacity, y },
        {
          opacity: 1,
          y: 0,
          duration,
          stagger,
          delay,
          ease,
          scrollTrigger: {
            trigger: container,
            start: "top 85%",
            toggleActions: triggerOnce ? "play none none none" : "play reverse play reverse",
          },
          onStart: () => { children.forEach(child => (child as HTMLElement).style.willChange = "transform, opacity"); },
          onComplete: () => { children.forEach(child => (child as HTMLElement).style.willChange = "auto"); }
        }
      );
    });

    return () => ctx.revert();
  }, [stagger, delay, duration, y, opacity, ease, triggerOnce]);

  return containerRef;
}

export function useParallax<T extends HTMLElement>(speed: number = 0.1, direction: "up" | "down" = "up") {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.to(el, {
        y: direction === "up" ? -100 * speed : 100 * speed,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.2, // Smoother scrub
        }
      });
    });

    return () => ctx.revert();
  }, [speed, direction]);

  return elementRef;
}

export function useMagnetic<T extends HTMLElement>(options: { strength?: number; duration?: number } = {}) {
  const elementRef = useRef<T>(null);
  const { strength = 0.3, duration = 0.8 } = options;

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const moveElement = (e: MouseEvent) => {
        const { clientX, clientY } = e;
        const { left, top, width, height } = el.getBoundingClientRect();
        const x = (clientX - (left + width / 2)) * strength;
        const y = (clientY - (top + height / 2)) * strength;

        gsap.to(el, {
          x,
          y,
          duration,
          ease: "power2.out"
        });
      };

      const resetElement = () => {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration,
          ease: "elastic.out(1, 0.5)"
        });
      };

      el.addEventListener("mousemove", moveElement);
      el.addEventListener("mouseleave", resetElement);
    });

    return () => ctx.revert();
  }, [strength, duration]);

  return elementRef;
}

export function useCardTilt<T extends HTMLElement>(options: { maxRotation?: number; scale?: number } = {}) {
  const cardRef = useRef<T>(null);
  const { maxRotation = 4, scale = 1.01 } = options;

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const ctx = gsap.context(() => {
      const onMouseMove = (e: MouseEvent) => {
        const { left, top, width, height } = card.getBoundingClientRect();
        const x = (e.clientX - (left + width / 2)) / (width / 2);
        const y = (e.clientY - (top + height / 2)) / (height / 2);

        gsap.to(card, {
          rotateY: x * maxRotation,
          rotateX: -y * maxRotation,
          scale,
          duration: 0.8,
          ease: "power2.out",
          transformPerspective: 1000,
        });
      };

      const onMouseLeave = () => {
        gsap.to(card, {
          rotateY: 0,
          rotateX: 0,
          scale: 1,
          duration: 0.8,
          ease: "power2.out",
        });
      };

      card.addEventListener("mousemove", onMouseMove);
      card.addEventListener("mouseleave", onMouseLeave);
    });

    return () => ctx.revert();
  }, [maxRotation, scale]);

  return cardRef;
}
