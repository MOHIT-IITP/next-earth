"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Settings,
  Sparkles,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  Compass,
} from "lucide-react";
import { EarthLogo } from "@/components/brand/earth-logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { UserNav } from "./user-nav";
import { useProjects } from "@/features/projects/projects-context";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenSearch: () => void;
  onOpenCreateProject: () => void;
}

export function Sidebar({
  collapsed,
  onToggleCollapse,
  onOpenSearch,
  onOpenCreateProject,
}: SidebarProps) {
  const pathname = usePathname();
  const { projects, activeProjectId, setActiveProjectId } = useProjects();

  const isNavActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-border bg-card/60 backdrop-blur-xs transition-all duration-300 ease-in-out shrink-0 select-none z-30 h-screen sticky top-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Brand & Collapse Header */}
      <div className="flex h-16 items-center justify-between px-3.5 border-b border-border/80">
        <Link
          href="/"
          className="flex items-center gap-2 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md p-1"
          title="Earth Observatory"
        >
          {collapsed ? (
            <EarthLogo variant="mark" size="md" />
          ) : (
            <EarthLogo variant="full" size="md" />
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggleCollapse}
          className="text-muted-foreground hover:text-foreground hidden sm:flex"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Quick Search Button */}
      <div className="p-3 border-b border-border/60">
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={onOpenSearch}
                className="w-full h-9"
                aria-label="Quick search (⌘K)"
              >
                <Search className="h-4 w-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Quick Search (⌘K)</TooltipContent>
          </Tooltip>
        ) : (
          <button
            type="button"
            onClick={onOpenSearch}
            className="flex w-full items-center justify-between rounded-lg border border-input bg-background/70 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-earth-sand hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Search territory...</span>
            </div>
            <kbd className="rounded border border-border bg-muted/60 px-1 py-0.25 font-mono text-[10px]">
              ⌘K
            </kbd>
          </button>
        )}
      </div>

      {/* Main Navigation Items */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-6">
        {/* Global Navigation */}
        <div className="space-y-1">
          {!collapsed && (
            <span className="px-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
              Global Overview
            </span>
          )}

          <nav className="space-y-1">
            {/* Dashboard Link */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/dashboard"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-all relative",
                    isNavActive("/dashboard")
                      ? "bg-earth-cream text-foreground font-semibold border-l-2 border-earth-terracotta shadow-2xs dark:bg-muted dark:text-foreground"
                      : "text-muted-foreground hover:bg-earth-cream/50 hover:text-foreground"
                  )}
                >
                  <LayoutDashboard className={cn("h-4 w-4 shrink-0 transition-colors", isNavActive("/dashboard") ? "text-earth-terracotta" : "text-muted-foreground")} />
                  {!collapsed && <span>Observatory</span>}
                  {isNavActive("/dashboard") && (
                    <span className="sr-only">(Active)</span>
                  )}
                </Link>
              </TooltipTrigger>
              {collapsed && <TooltipContent side="right">Observatory Dashboard</TooltipContent>}
            </Tooltip>

            {/* Profile Settings */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/settings/profile"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-all relative",
                    isNavActive("/settings/profile")
                      ? "bg-earth-cream text-foreground font-semibold border-l-2 border-earth-terracotta shadow-2xs dark:bg-muted dark:text-foreground"
                      : "text-muted-foreground hover:bg-earth-cream/50 hover:text-foreground"
                  )}
                >
                  <User className={cn("h-4 w-4 shrink-0 transition-colors", isNavActive("/settings/profile") ? "text-earth-terracotta" : "text-muted-foreground")} />
                  {!collapsed && <span>Researcher Profile</span>}
                </Link>
              </TooltipTrigger>
              {collapsed && <TooltipContent side="right">Researcher Profile</TooltipContent>}
            </Tooltip>

            {/* Preferences */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/settings/preferences"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-all relative",
                    isNavActive("/settings/preferences")
                      ? "bg-earth-cream text-foreground font-semibold border-l-2 border-earth-terracotta shadow-2xs dark:bg-muted dark:text-foreground"
                      : "text-muted-foreground hover:bg-earth-cream/50 hover:text-foreground"
                  )}
                >
                  <Settings className={cn("h-4 w-4 shrink-0 transition-colors", isNavActive("/settings/preferences") ? "text-earth-terracotta" : "text-muted-foreground")} />
                  {!collapsed && <span>Preferences</span>}
                </Link>
              </TooltipTrigger>
              {collapsed && <TooltipContent side="right">Observatory Preferences</TooltipContent>}
            </Tooltip>

            {/* Design System Reference */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/design-system"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-all relative",
                    isNavActive("/design-system")
                      ? "bg-earth-cream text-foreground font-semibold border-l-2 border-earth-olive shadow-2xs dark:bg-muted dark:text-foreground"
                      : "text-muted-foreground hover:bg-earth-cream/50 hover:text-foreground"
                  )}
                >
                  <Sparkles className={cn("h-4 w-4 shrink-0 transition-colors", isNavActive("/design-system") ? "text-earth-olive" : "text-muted-foreground")} />
                  {!collapsed && (
                    <div className="flex items-center justify-between flex-1">
                      <span>Design System</span>
                      <Badge variant="muted" size="sm" className="text-[9px] py-0">v1</Badge>
                    </div>
                  )}
                </Link>
              </TooltipTrigger>
              {collapsed && <TooltipContent side="right">Design System Primitives</TooltipContent>}
            </Tooltip>
          </nav>
        </div>

        {/* Project-specific Navigation (Cleanly separated from global navigation) */}
        <div className="space-y-1.5 pt-2 border-t border-border/60">
          <div className="flex items-center justify-between px-2">
            {!collapsed && (
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                Territory Projects
              </span>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onOpenCreateProject}
                  className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-earth-terracotta transition-colors"
                  aria-label="Create new project"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side={collapsed ? "right" : "top"}>
                New Project
              </TooltipContent>
            </Tooltip>
          </div>

          <nav className="space-y-0.5">
            {projects.map((project) => {
              const isProjectRoute = pathname.startsWith(`/projects/${project.id}`);
              const isActive = activeProjectId === project.id || isProjectRoute;
              return (
                <div key={project.id} className="space-y-0.5">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={`/projects/${project.id}`}
                        onClick={() => setActiveProjectId(project.id)}
                        className={cn(
                          "w-full flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors group",
                          isActive
                            ? "bg-earth-sand/50 text-foreground font-medium dark:bg-muted"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                      >
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full shrink-0",
                            project.accent === "terracotta" && "bg-earth-terracotta",
                            project.accent === "olive" && "bg-earth-olive",
                            project.accent === "sand" && "bg-earth-sand dark:bg-yellow-600",
                            project.accent === "charcoal" && "bg-earth-charcoal dark:bg-neutral-400"
                          )}
                        />
                        {!collapsed && (
                          <div className="flex items-center justify-between flex-1 min-w-0">
                            <span className="truncate">{project.name}</span>
                            <span className="text-[10px] opacity-70 ml-1">
                              {project.specimensCount}
                            </span>
                          </div>
                        )}
                      </Link>
                    </TooltipTrigger>
                    {collapsed && (
                      <TooltipContent side="right">
                        <p className="font-medium">{project.name}</p>
                        <p className="text-[10px] text-muted-foreground">{project.biome}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>

                  {/* Sub-module links when expanded and active */}
                  {!collapsed && isProjectRoute && (
                    <div className="ml-5 pl-2 border-l border-border/60 space-y-0.5 py-0.5 text-[11px]">
                      <Link
                        href={`/projects/${project.id}`}
                        className={cn(
                          "block px-2 py-0.5 rounded transition-colors",
                          pathname === `/projects/${project.id}`
                            ? "text-earth-terracotta font-medium"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        Overview
                      </Link>
                      <Link
                        href={`/projects/${project.id}/board`}
                        className={cn(
                          "block px-2 py-0.5 rounded transition-colors",
                          pathname === `/projects/${project.id}/board`
                            ? "text-earth-terracotta font-medium"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        Board
                      </Link>
                      <Link
                        href={`/projects/${project.id}/notes`}
                        className={cn(
                          "block px-2 py-0.5 rounded transition-colors",
                          pathname === `/projects/${project.id}/notes`
                            ? "text-earth-terracotta font-medium"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        Notes
                      </Link>
                      <Link
                        href={`/projects/${project.id}/sketch`}
                        className={cn(
                          "block px-2 py-0.5 rounded transition-colors",
                          pathname === `/projects/${project.id}/sketch`
                            ? "text-earth-terracotta font-medium"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        Sketch
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer: User Nav & Theme Switcher */}
      <div className="p-3 border-t border-border/80 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <UserNav collapsed={collapsed} />
          {!collapsed && <ThemeToggle />}
        </div>
      </div>
    </aside>
  );
}
