import Link from "next/link";
import { EarthLogo } from "@/components/brand/earth-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, FolderKanban, Sparkles, User } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
        >
          <EarthLogo size="md" />
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <nav className="flex items-center gap-1 sm:gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">
                <LayoutDashboard className="mr-1.5 h-4 w-4 text-earth-terracotta" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/projects">
                <FolderKanban className="mr-1.5 h-4 w-4 text-earth-olive" />
                <span className="hidden sm:inline">Projects</span>
              </Link>
            </Button>
            <Button asChild variant="subtle" size="sm">
              <Link href="/design-system">
                <Sparkles className="mr-1.5 h-4 w-4 text-earth-terracotta" />
                <span className="hidden md:inline">Design System</span>
              </Link>
            </Button>
          </nav>
          <div className="h-5 w-px bg-border mx-1" />
          <Button asChild variant="outline" size="sm">
            <Link href="/login">
              <User className="mr-1.5 h-3.5 w-3.5" />
              Sign In
            </Link>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
