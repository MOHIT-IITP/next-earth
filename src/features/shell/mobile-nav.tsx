"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { EarthLogo } from "@/components/brand/earth-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { UserNav } from "./user-nav";
import {
  LayoutDashboard,
  FolderKanban,
  User,
  Settings,
  Sparkles,
  Plus,
  Search,
} from "lucide-react";
import { useProjects } from "@/features/projects/projects-context";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenSearch: () => void;
  onOpenCreateProject: () => void;
}

export function MobileNav({
  open,
  onOpenChange,
  onOpenSearch,
  onOpenCreateProject,
}: MobileNavProps) {
  const pathname = usePathname();
  const { projects, activeProjectId, setActiveProjectId } = useProjects();

  const isNavActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/projects") return pathname === "/projects" || pathname.startsWith("/projects/");
    return pathname.startsWith(href);
  };

  const handleLinkClick = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[300px] p-0 flex flex-col justify-between">
        <div>
          {/* Header */}
          <SheetHeader className="p-4 border-b border-border text-left">
            <SheetTitle className="sr-only">Earth Navigation</SheetTitle>
            <div className="flex items-center justify-between">
              <Link href="/" onClick={handleLinkClick}>
                <EarthLogo variant="full" size="md" />
              </Link>
              <ThemeToggle />
            </div>
          </SheetHeader>

          {/* Quick Search */}
          <div className="p-4 border-b border-border/60">
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onOpenSearch();
              }}
              className="flex w-full items-center justify-between rounded-lg border border-input bg-background/80 px-3 py-2 text-xs text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <span>Search observatory...</span>
              </div>
              <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border">
                ⌘K
              </span>
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-3 space-y-5 overflow-y-auto max-h-[calc(100vh-220px)]">
            <div className="space-y-1">
              <span className="px-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                Overview
              </span>
              <nav className="space-y-1">
                <Link
                  href="/dashboard"
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isNavActive("/dashboard")
                      ? "bg-earth-cream text-foreground font-semibold border-l-2 border-earth-terracotta dark:bg-muted"
                      : "text-muted-foreground hover:bg-earth-cream/50 hover:text-foreground"
                  )}
                >
                  <LayoutDashboard className={cn("h-4 w-4", isNavActive("/dashboard") ? "text-earth-terracotta" : "text-muted-foreground")} />
                  <span>Dashboard</span>
                </Link>

                <Link
                  href="/projects"
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isNavActive("/projects")
                      ? "bg-earth-cream text-foreground font-semibold border-l-2 border-earth-terracotta dark:bg-muted"
                      : "text-muted-foreground hover:bg-earth-cream/50 hover:text-foreground"
                  )}
                >
                  <FolderKanban className={cn("h-4 w-4", isNavActive("/projects") ? "text-earth-terracotta" : "text-muted-foreground")} />
                  <span>Projects</span>
                </Link>

                <Link
                  href="/settings/profile"
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isNavActive("/settings/profile")
                      ? "bg-earth-cream text-foreground font-semibold border-l-2 border-earth-terracotta dark:bg-muted"
                      : "text-muted-foreground hover:bg-earth-cream/50 hover:text-foreground"
                  )}
                >
                  <User className={cn("h-4 w-4", isNavActive("/settings/profile") ? "text-earth-terracotta" : "text-muted-foreground")} />
                  <span>Profile</span>
                </Link>

                <Link
                  href="/settings/preferences"
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isNavActive("/settings/preferences")
                      ? "bg-earth-terracotta text-white"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <Settings className="h-4 w-4" />
                  <span>Preferences</span>
                </Link>

                <Link
                  href="/design-system"
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isNavActive("/design-system")
                      ? "bg-earth-olive text-white"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <Sparkles className="h-4 w-4 text-earth-olive" />
                  <span>Design System</span>
                </Link>
              </nav>
            </div>

            {/* Projects list */}
            <div className="space-y-1.5 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                  Active Projects
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    onOpenCreateProject();
                  }}
                  className="text-earth-terracotta p-1 hover:bg-muted rounded"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-0.5">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    onClick={() => {
                      setActiveProjectId(project.id);
                      handleLinkClick();
                    }}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors",
                      activeProjectId === project.id
                        ? "bg-earth-sand/50 font-medium text-foreground dark:bg-muted"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="h-2 w-2 rounded-full bg-earth-terracotta shrink-0" />
                      <span className="truncate">{project.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-card/40">
          <UserNav />
        </div>
      </SheetContent>
    </Sheet>
  );
}
