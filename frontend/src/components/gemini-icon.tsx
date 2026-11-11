import geminiIcon from "../../assets/gemini.png";

interface GeminiIconProps {
  className?: string;
  size?: number;
  alt?: string;
}

export function GeminiIcon({ className, size, alt = "Gemini" }: GeminiIconProps) {
  return (
    <img
      src={geminiIcon}
      alt={alt}
      aria-hidden={alt === "" ? true : undefined}
      width={size}
      height={size}
      className={className}
    />
  );
}
