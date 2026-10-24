import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { Container } from "@/components/ui/container";
import { EarthLogo } from "@/components/brand/earth-logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Sparkles,
  ArrowRight,
  Palette,
  Layers,
  Compass,
  CheckCircle2,
  FolderKanban,
  LayoutDashboard,
  Shield,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 sm:py-24 border-b border-border">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(197,83,49,0.08),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(197,83,49,0.15),rgba(0,0,0,0))] pointer-events-none" />

          <Container size="lg" className="relative space-y-8">
            <div className="inline-flex items-center gap-2">
              <Badge variant="terracotta" size="sm">Phase 3 Complete</Badge>
              <span className="text-xs text-muted-foreground">
                Projects System &bull; Global Dashboard &bull; Application Shell
              </span>
            </div>

            <div className="max-w-3xl space-y-4">
              <EarthLogo variant="mark" size="lg" className="mb-2" />
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-foreground leading-[1.08]">
                Grounding the digital world in organic warmth.
              </h1>
              <p className="font-sans text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl">
                Earth is an ecological observatory and research workspace. Built with warm ivory, cream, terracotta, olive, and charcoal aesthetics.
                Featuring a global dashboard, unified territory project tracking, and responsive navigation shell.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button asChild size="lg">
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Launch Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/projects">
                  <FolderKanban className="mr-2 h-4 w-4 text-earth-olive" />
                  Explore Projects
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <Link href="/design-system">
                  <Sparkles className="mr-2 h-4 w-4 text-earth-terracotta" />
                  Design System
                </Link>
              </Button>
            </div>
          </Container>
        </section>

        {/* Feature Highlights Grid */}
        <section className="py-16 sm:py-20">
          <Container size="lg" className="space-y-12">
            <div className="max-w-2xl space-y-2">
              <h2 className="font-serif text-3xl sm:text-4xl text-foreground">
                Observatory Architecture
              </h2>
              <p className="text-muted-foreground text-base">
                Explore the active frontend foundations, authentication screens, application shell, and project systems.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 space-y-3 border-earth-terracotta/30">
                <div className="h-10 w-10 rounded-lg bg-earth-terracotta/10 text-earth-terracotta flex items-center justify-center">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
                <h3 className="font-serif text-xl font-normal">Global Dashboard</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Real-time metrics derived mathematically from live project and task records. Completion rates, overdue task tracking, quick create actions, and activity feeds.
                </p>
                <div className="pt-2">
                  <Button asChild variant="link" className="p-0 text-earth-terracotta">
                    <Link href="/dashboard">Open Dashboard &rarr;</Link>
                  </Button>
                </div>
              </Card>

              <Card className="p-6 space-y-3 border-earth-olive/30">
                <div className="h-10 w-10 rounded-lg bg-earth-olive/10 text-earth-olive flex items-center justify-center">
                  <FolderKanban className="h-5 w-5" />
                </div>
                <h3 className="font-serif text-xl font-normal">Project Management</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  List and grid views, search, status filters, sorting, project creation with duplicate prevention, project switcher, editing, and archiving.
                </p>
                <div className="pt-2">
                  <Button asChild variant="link" className="p-0 text-earth-olive">
                    <Link href="/projects">Manage Projects &rarr;</Link>
                  </Button>
                </div>
              </Card>

              <Card className="p-6 space-y-3">
                <div className="h-10 w-10 rounded-lg bg-earth-charcoal/10 text-foreground flex items-center justify-center">
                  <Shield className="h-5 w-5" />
                </div>
                <h3 className="font-serif text-xl font-normal">Auth &amp; Global Shell</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Collapsible desktop sidebar, mobile navigation drawer, password visibility toggle, validated login, registration, password recovery, and user dropdown.
                </p>
                <div className="pt-2">
                  <Button asChild variant="link" className="p-0 text-foreground">
                    <Link href="/login">View Auth Flow &rarr;</Link>
                  </Button>
                </div>
              </Card>
            </div>

            {/* Quick Route Directory Matrix */}
            <Card className="p-6 sm:p-8 space-y-6">
              <h3 className="font-serif text-2xl font-normal">Explicit Application Route Directory</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { title: "/dashboard", desc: "Global metrics, recent tasks & activity", href: "/dashboard" },
                  { title: "/projects", desc: "All territory projects & search", href: "/projects" },
                  { title: "/projects/new", desc: "Project creation form with validation", href: "/projects/new" },
                  { title: "/projects/proj-01", desc: "Project detail overview & health", href: "/projects/proj-01" },
                  { title: "/projects/proj-01/board", desc: "Kanban board & drag-and-drop tasks", href: "/projects/proj-01/board" },
                  { title: "/projects/proj-01/notes", desc: "Knowledge base & rich-text notes", href: "/projects/proj-01/notes" },
                  { title: "/projects/proj-01/sketch", desc: "Interactive system design & topology canvas", href: "/projects/proj-01/sketch" },
                  { title: "/login", desc: "Sign in with validation & password toggle", href: "/login" },
                  { title: "/signup", desc: "Registration with password confirmation", href: "/signup" },
                  { title: "/forgot-password", desc: "Password recovery transmission screen", href: "/forgot-password" },
                  { title: "/settings/profile", desc: "Researcher profile & credentials", href: "/settings/profile" },
                  { title: "/settings/preferences", desc: "Theme & observatory test utilities", href: "/settings/preferences" },
                  { title: "/design-system", desc: "Interactive UI primitives showcase", href: "/design-system" },
                ].map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="p-3 rounded-lg border border-border/80 hover:border-earth-terracotta/40 hover:bg-muted/40 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <span className="font-mono text-xs font-medium text-earth-terracotta">
                        {item.title}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </Container>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        <Container size="lg">
          <p>&copy; {new Date().getFullYear()} Earth Project &bull; Environmental Observatory &amp; Research Workspace</p>
        </Container>
      </footer>
    </div>
  );
}
