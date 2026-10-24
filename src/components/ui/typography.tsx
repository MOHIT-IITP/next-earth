import * as React from "react";
import { cn } from "@/lib/utils";

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  font?: "serif" | "sans";
}

export function Heading({
  level = 1,
  font = "serif",
  className,
  children,
  ...props
}: HeadingProps) {
  const Component = `h${level}` as React.ElementType;

  const fontClass = font === "serif" ? "font-serif" : "font-sans font-semibold";

  const sizeClasses: Record<number, string> = {
    1: "text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1]",
    2: "text-3xl sm:text-4xl tracking-tight leading-[1.15]",
    3: "text-2xl sm:text-3xl tracking-snug leading-snug",
    4: "text-xl sm:text-2xl leading-snug",
    5: "text-lg font-medium leading-normal",
    6: "text-base font-medium leading-normal",
  };

  return (
    <Component
      className={cn(fontClass, sizeClasses[level], "text-foreground", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export function Lead({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-lg sm:text-xl text-muted-foreground leading-relaxed font-sans font-normal",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export function Paragraph({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-base leading-relaxed text-foreground/90", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function TextMuted({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-muted-foreground leading-normal", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function Kbd({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center rounded border border-border bg-muted/60 px-1.5 py-0.5 text-[11px] font-mono text-muted-foreground shadow-2xs",
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}

export function CodeBlock({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <code
      className={cn(
        "relative rounded bg-muted/70 px-[0.35rem] py-[0.15rem] font-mono text-xs text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </code>
  );
}
