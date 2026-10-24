import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-xs",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground shadow-xs",
        terracotta:
          "border-transparent bg-earth-terracotta-light text-earth-terracotta-dark dark:bg-earth-terracotta-light dark:text-earth-terracotta",
        olive:
          "border-transparent bg-earth-olive-light text-earth-olive-dark dark:bg-earth-olive-light dark:text-earth-olive",
        outline:
          "border-border text-foreground bg-background/50",
        muted:
          "border-transparent bg-muted text-muted-foreground",
        destructive:
          "border-transparent bg-destructive/15 text-destructive dark:text-destructive",
      },
      size: {
        default: "text-xs px-2.5 py-0.5",
        sm: "text-[10px] px-2 py-0.25 tracking-wide uppercase",
        lg: "text-sm px-3 py-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
