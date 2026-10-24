import * as React from "react";
import Link from "next/link";
import { EarthLogo } from "@/components/brand/earth-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Compass, Sparkles } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-background">
      {/* Top Header */}
      <header className="w-full flex items-center justify-between p-6 sm:px-10">
        <Link
          href="/"
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md transition-opacity hover:opacity-85"
        >
          <EarthLogo size="md" />
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/design-system"
            className="text-xs text-muted-foreground hover:text-foreground hidden sm:inline-flex items-center gap-1 transition-colors px-2.5 py-1.5 rounded-md hover:bg-muted"
          >
            <Sparkles className="h-3.5 w-3.5 text-earth-terracotta" />
            Design System
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Centered Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-[440px] space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-foreground">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
              {subtitle}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card/90 p-6 sm:p-8 shadow-md backdrop-blur-xs">
            {children}
          </div>

          {/* Transparent phase indicator notice */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
            <Badge variant="muted" size="sm">Frontend Mock Mode</Badge>
            <span>Session updates local state dynamically</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full p-6 text-center text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between sm:px-10 gap-2 border-t border-border/40">
        <p>&copy; {new Date().getFullYear()} Earth Consortium &bull; Atmospheric Research</p>
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:underline">Home</Link>
          <Link href="/dashboard" className="hover:underline">Dashboard Preview</Link>
          <Link href="/design-system" className="hover:underline">Tokens</Link>
        </div>
      </footer>
    </div>
  );
}
