import React from "react";

interface FramerRevealProps {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right" | "none";
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
  staggerChildren?: number;
  once?: boolean;
}

export function FramerReveal({
  children,
  className = "",
}: FramerRevealProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export const FramerStaggerItem = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};
