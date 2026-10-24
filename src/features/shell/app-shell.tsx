"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { Breadcrumbs } from "./breadcrumbs";
import { SearchDialog } from "./search-dialog";
import { QuickCreateMenu } from "./quick-create-menu";
import { UserNav } from "./user-nav";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { EarthLogo } from "@/components/brand/earth-logo";
import { CreateProjectDialog } from "@/features/projects/create-project-dialog";
import { Button } from "@/components/ui/button";
import { Menu, Search } from "lucide-react";
import Link from "next/link";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [createProjectOpen, setCreateProjectOpen] = React.useState(false);

  // Global ⌘K keyboard shortcut listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Desktop Persistent Collapsible Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenCreateProject={() => setCreateProjectOpen(true)}
      />

      {/* Mobile Navigation Drawer */}
      <MobileNav
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenCreateProject={() => setCreateProjectOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border/80 bg-background/80 px-4 sm:px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button */}
            <Button
              variant="ghost"
              size="icon-sm"
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation drawer"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Mobile Brand Logo */}
            <div className="md:hidden">
              <Link href="/dashboard">
                <EarthLogo variant="mark" size="sm" />
              </Link>
            </div>

            {/* Breadcrumbs */}
            <Breadcrumbs className="hidden sm:flex" />
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Search Trigger */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden lg:flex items-center gap-2 rounded-lg border border-input bg-card/60 px-3 py-1.5 text-xs text-muted-foreground hover:border-earth-sand hover:text-foreground transition-colors"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search projects...</span>
              <kbd className="rounded border border-border bg-muted/60 px-1 py-0.25 font-mono text-[10px]">
                ⌘K
              </kbd>
            </button>

            {/* Quick Create Dropdown Menu */}
            <QuickCreateMenu onRefresh={() => window.dispatchEvent(new Event("earth-data-updated"))} />

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Mobile User Avatar */}
            <div className="md:hidden">
              <UserNav collapsed />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Dialogs */}
      <SearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onOpenCreateProject={() => setCreateProjectOpen(true)}
      />

      <CreateProjectDialog
        open={createProjectOpen}
        onOpenChange={setCreateProjectOpen}
      />
    </div>
  );
}
