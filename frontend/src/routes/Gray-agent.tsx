"use client";

import { useEffect, useRef } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";

const CSS = `
.gray-agent{display:block;cursor:pointer;overflow:visible}
.gray-agent .ga-bob{transform-origin:100px 100px}
.gray-agent.ga-active .ga-bob{animation:ga-breathe 3s ease-in-out infinite}
.gray-agent.ga-pop .ga-bob{animation:ga-pop .45s cubic-bezier(.3,.7,.4,1)}
.gray-agent .ga-face{transform-origin:100px 100px;transition:transform .12s ease-out}
.gray-agent .ga-eye{transform-box:fill-box;transform-origin:center;animation:ga-blink 4.8s infinite}
.gray-agent .ga-eye.ga-r{animation-delay:.02s}
@keyframes ga-breathe{0%,100%{transform:scale(1.015,.985)}50%{transform:scale(.985,1.015)}}
@keyframes ga-pop{0%{transform:scale(1)}30%{transform:scale(1.12,.88)}60%{transform:scale(.94,1.08)}100%{transform:scale(1)}}
@keyframes ga-blink{0%,93%,100%{transform:scaleY(1)}96%{transform:scaleY(.1)}}
@media (prefers-reduced-motion:reduce){.gray-agent .ga-bob,.gray-agent .ga-eye{animation:none}}
`;

interface GrayAgentProps {
  size?: number;
  color?: string;
  eyeColor?: string;
  onClick?: (e: ReactMouseEvent<SVGSVGElement>) => void;
  active?: boolean;
}

export default function GrayAgent({
  size = 120,
  color = "#777777",
  eyeColor = "#ffffff",
  onClick,
  active = false,
}: GrayAgentProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const faceRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const aim = (x: number, y: number) => {
      const svg = svgRef.current;
      const face = faceRef.current;
      if (!svg || !face) return;
      const r = svg.getBoundingClientRect();
      const dx = x - (r.left + r.width / 2);
      const dy = y - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(d / 260, 1);
      const ux = dx / d;
      const uy = dy / d;
      const tx = ux * k * 36;
      const ty = uy * k * 36;
      const rot = -ux * k * 22;
      const sx = 1 - 0.16 * Math.abs(ux) * k;
      face.style.transform = `translate(${tx}px,${ty}px) rotate(${rot}deg) scale(${sx},1)`;
    };
    const move = (e: PointerEvent) => aim(e.clientX, e.clientY);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerdown", move);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", move);
    };
  }, []);

  const handleClick = (e: ReactMouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (svg) {
      svg.classList.remove("ga-pop");
      void svg.getBoundingClientRect();
      svg.classList.add("ga-pop");
    }
    onClick?.(e);
  };

  return (
    <>
      <style>{CSS}</style>
      <svg
        ref={svgRef}
        className={`gray-agent${active ? " ga-active" : ""}`}
        width={size}
        height={size}
        viewBox="0 0 200 200"
        role="img"
        aria-label="Agent"
        onClick={handleClick}
      >
        <g className="ga-bob">
          <circle cx="100" cy="100" r="100" fill={color} />
          <g className="ga-face" ref={faceRef}>
            <rect className="ga-eye" x="57" y="78" width="26" height="44" rx="13" fill={eyeColor} transform="rotate(-10 70 100)" />
            <rect className="ga-eye ga-r" x="117" y="78" width="26" height="44" rx="13" fill={eyeColor} transform="rotate(-10 130 100)" />
          </g>
        </g>
      </svg>
    </>
  );
}
