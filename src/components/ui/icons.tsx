import * as React from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const iconSizes = {
  xs: "h-3.5 w-3.5",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-8 w-8",
} as const;

export type IconSize = keyof typeof iconSizes;

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  icon: LucideIcon;
  size?: IconSize;
  className?: string;
}

export function Icon({
  icon: LucideIconComponent,
  size = "sm",
  className,
  ...props
}: IconProps) {
  return (
    <LucideIconComponent
      className={cn(iconSizes[size], "shrink-0", className)}
      aria-hidden="true"
      {...props}
    />
  );
}
