"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  projects: "Projects",
  new: "New Project",
  board: "Kanban Board",
  notes: "Knowledge Base",
  sketch: "Sketch Canvas",
  settings: "Settings",
  profile: "Researcher Profile",
  preferences: "Preferences",
  "design-system": "Design System",
};

export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb navigation"
      className={cn("flex items-center text-xs text-muted-foreground", className)}
    >
      <ol className="flex items-center space-x-1.5 flex-wrap">
        <li>
          <Link
            href="/dashboard"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span className="sr-only">Dashboard</span>
          </Link>
        </li>

        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`;
          const isLast = index === segments.length - 1;
          const label = ROUTE_LABELS[segment] || segment.replace(/-/g, " ");

          return (
            <React.Fragment key={href}>
              <li className="flex items-center">
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 mx-0.5" />
              </li>
              <li>
                {isLast ? (
                  <span
                    aria-current="page"
                    className="font-medium text-foreground capitalize"
                  >
                    {label}
                  </span>
                ) : (
                  <Link
                    href={href}
                    className="hover:text-foreground transition-colors capitalize"
                  >
                    {label}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
