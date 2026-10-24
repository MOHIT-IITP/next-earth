import * as React from "react";
import { cn } from "@/lib/utils";

interface EarthLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "full" | "mark" | "wordmark";
  size?: "sm" | "md" | "lg";
}

export function EarthMark({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      {/* Outer subtle orbital ring */}
      <circle
        cx="16"
        cy="16"
        r="14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.25"
        strokeDasharray="2 2"
      />
      {/* Organic olive terrestrial arc */}
      <path
        d="M 6 16 A 10 10 0 1 0 26 16"
        stroke="hsl(var(--earth-olive))"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Terracotta core/horizon arc */}
      <path
        d="M 8.5 16 C 8.5 11.5 12 8 16 8 C 20 8 23.5 11.5 23.5 16 C 23.5 19 21 21 16 21"
        stroke="hsl(var(--earth-terracotta))"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Core Seed / Meridian dot */}
      <circle cx="16" cy="16" r="3.2" fill="hsl(var(--earth-terracotta))" />
      <circle cx="16" cy="16" r="1.5" fill="hsl(var(--earth-ivory))" />
    </svg>
  );
}

export function EarthWordmark({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeStyles = {
    sm: "text-lg tracking-tight",
    md: "text-2xl tracking-normal",
    lg: "text-3xl tracking-wide",
  };

  return (
    <span
      className={cn(
        "font-serif font-normal text-foreground select-none inline-flex items-baseline",
        sizeStyles[size],
        className
      )}
    >
      <span>Earth</span>
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-earth-terracotta ml-1 -translate-y-1 align-baseline" />
    </span>
  );
}

export function EarthLogo({
  variant = "full",
  size = "md",
  className,
  ...props
}: EarthLogoProps) {
  const markSizes = {
    sm: 22,
    md: 30,
    lg: 40,
  };

  return (
    <div
      className={cn("inline-flex items-center gap-2.5", className)}
      role="banner"
      aria-label="Earth"
      {...props}
    >
      {(variant === "full" || variant === "mark") && (
        <EarthMark size={markSizes[size]} />
      )}
      {(variant === "full" || variant === "wordmark") && (
        <EarthWordmark size={size} />
      )}
    </div>
  );
}
