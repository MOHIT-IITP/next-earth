"use client";

import * as React from "react";
import {
  Sparkles,
  ArrowRight,
  Layers,
  Palette,
  Type,
  Component,
  Bell,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Copy,
  Sliders,
  Inbox,
  User,
  ExternalLink,
  ChevronRight,
  Send,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/components/ui/toast";
import { Container, PageHeader } from "@/components/ui/container";
import { EarthLogo } from "@/components/brand/earth-logo";
import { Heading, Paragraph, Lead, Kbd, CodeBlock } from "@/components/ui/typography";

export function DesignSystemView() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedBiome, setSelectedBiome] = React.useState("mediterranean");
  const [inputValue, setInputValue] = React.useState("Atlas cedar");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    toast.success(`Copied ${label}`, {
      description: text,
    });
  };

  const handleSimulateSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setDialogOpen(false);
      toast.success("Specimen saved successfully", {
        description: `Saved "${inputValue}" to ${selectedBiome} archive.`,
      });
    }, 600);
  };

  return (
    <Container size="lg" className="py-10 space-y-16">
      {/* Page Header */}
      <PageHeader
        title="Earth Design System"
        description="Warm ivory, cream, terracotta, olive, and charcoal aesthetics designed for organic clarity, tactile warmth, and timeless typography."
        badge={
          <div className="flex items-center gap-2">
            <Badge variant="terracotta" size="sm">Phase 1</Badge>
            <Badge variant="olive" size="sm">Active Foundation</Badge>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(":root { --earth-terracotta: 14 62% 48%; }", "CSS Tokens")}
            >
              <Copy className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
              Copy Token Base
            </Button>
            <Button
              size="sm"
              onClick={() => toast.success("Design System Ready", { description: "All Phase 1 foundational primitives are loaded." })}
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Trigger Toast
            </Button>
          </div>
        }
      />

      {/* Section 1: Brand & Identity */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-earth-terracotta" />
          <Heading level={3}>1. Brand Identity & Marks</Heading>
        </div>
        <Paragraph className="text-muted-foreground">
          Rendered via pure inline SVG and Instrument Serif typography without external assets.
        </Paragraph>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="flex flex-col items-center justify-center p-8 text-center space-y-4">
            <EarthLogo variant="mark" size="lg" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Brand Mark</p>
              <p className="text-xs text-muted-foreground">Geometric concentric terrestrial orbit</p>
            </div>
          </Card>

          <Card className="flex flex-col items-center justify-center p-8 text-center space-y-4">
            <EarthLogo variant="wordmark" size="lg" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Wordmark</p>
              <p className="text-xs text-muted-foreground">Instrument Serif with meridian terracotta point</p>
            </div>
          </Card>

          <Card className="flex flex-col items-center justify-center p-8 text-center space-y-4 bg-earth-cream/40 dark:bg-card">
            <EarthLogo variant="full" size="lg" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Full Lockup</p>
              <p className="text-xs text-muted-foreground">Balanced responsive signature</p>
            </div>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Section 2: Color Palette */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-earth-olive" />
          <Heading level={3}>2. Earth Color Palette</Heading>
        </div>
        <Paragraph className="text-muted-foreground">
          Built on CSS HSL variables adapting smoothly across Light (warm ivory & cream dominant) and Dark (warm charcoal dominant) themes.
        </Paragraph>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Ivory */}
          <div
            className="group relative flex flex-col rounded-xl border border-border p-3 space-y-3 cursor-pointer transition hover:border-earth-terracotta/40"
            onClick={() => copyToClipboard("#FAF7F2", "Warm Ivory")}
          >
            <div className="h-16 w-full rounded-lg bg-earth-ivory border border-border/60 shadow-2xs flex items-end p-2">
              <span className="text-[10px] font-mono font-medium text-earth-charcoal opacity-70">#FAF7F2</span>
            </div>
            <div>
              <p className="text-sm font-medium">Warm Ivory</p>
              <p className="text-xs text-muted-foreground font-mono">--earth-ivory</p>
            </div>
          </div>

          {/* Cream */}
          <div
            className="group relative flex flex-col rounded-xl border border-border p-3 space-y-3 cursor-pointer transition hover:border-earth-terracotta/40"
            onClick={() => copyToClipboard("#F3EDE2", "Cream")}
          >
            <div className="h-16 w-full rounded-lg bg-earth-cream border border-border/60 shadow-2xs flex items-end p-2">
              <span className="text-[10px] font-mono font-medium text-earth-charcoal opacity-70">#F3EDE2</span>
            </div>
            <div>
              <p className="text-sm font-medium">Cream</p>
              <p className="text-xs text-muted-foreground font-mono">--earth-cream</p>
            </div>
          </div>

          {/* Terracotta */}
          <div
            className="group relative flex flex-col rounded-xl border border-border p-3 space-y-3 cursor-pointer transition hover:border-earth-terracotta/40"
            onClick={() => copyToClipboard("#C55331", "Terracotta")}
          >
            <div className="h-16 w-full rounded-lg bg-earth-terracotta shadow-2xs flex items-end p-2">
              <span className="text-[10px] font-mono font-medium text-white/90">#C55331</span>
            </div>
            <div>
              <p className="text-sm font-medium">Terracotta</p>
              <p className="text-xs text-muted-foreground font-mono">--earth-terracotta</p>
            </div>
          </div>

          {/* Olive */}
          <div
            className="group relative flex flex-col rounded-xl border border-border p-3 space-y-3 cursor-pointer transition hover:border-earth-olive/40"
            onClick={() => copyToClipboard("#556B42", "Olive")}
          >
            <div className="h-16 w-full rounded-lg bg-earth-olive shadow-2xs flex items-end p-2">
              <span className="text-[10px] font-mono font-medium text-white/90">#556B42</span>
            </div>
            <div>
              <p className="text-sm font-medium">Olive</p>
              <p className="text-xs text-muted-foreground font-mono">--earth-olive</p>
            </div>
          </div>

          {/* Charcoal */}
          <div
            className="group relative flex flex-col rounded-xl border border-border p-3 space-y-3 cursor-pointer transition hover:border-earth-terracotta/40"
            onClick={() => copyToClipboard("#23272E", "Charcoal")}
          >
            <div className="h-16 w-full rounded-lg bg-earth-charcoal shadow-2xs flex items-end p-2">
              <span className="text-[10px] font-mono font-medium text-white/90">#23272E</span>
            </div>
            <div>
              <p className="text-sm font-medium">Charcoal</p>
              <p className="text-xs text-muted-foreground font-mono">--earth-charcoal</p>
            </div>
          </div>

          {/* Muted Text / Sand */}
          <div
            className="group relative flex flex-col rounded-xl border border-border p-3 space-y-3 cursor-pointer transition hover:border-earth-terracotta/40"
            onClick={() => copyToClipboard("hsl(var(--muted-foreground))", "Muted Text")}
          >
            <div className="h-16 w-full rounded-lg bg-muted border border-border/80 shadow-2xs flex items-end p-2">
              <span className="text-[10px] font-mono font-medium text-muted-foreground">Tokens</span>
            </div>
            <div>
              <p className="text-sm font-medium">Borders & Muted</p>
              <p className="text-xs text-muted-foreground font-mono">--border / --muted</p>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Section 3: Typography */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Type className="h-5 w-5 text-earth-terracotta" />
          <Heading level={3}>3. Typography Scale</Heading>
        </div>
        <Paragraph className="text-muted-foreground">
          Instrument Serif provides literary, artisanal display resonance, paired with Instrument Sans for crisp functional legibility.
        </Paragraph>

        <Card className="p-6 sm:p-8 space-y-6">
          <div className="border-b border-border pb-4 space-y-1">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Display Heading 1 (Instrument Serif)</span>
            <Heading level={1}>Cultivate deep terrestrial balance.</Heading>
          </div>

          <div className="border-b border-border pb-4 space-y-1">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Display Heading 2 (Instrument Serif)</span>
            <Heading level={2}>Organic structures rooted in calm clarity.</Heading>
          </div>

          <div className="border-b border-border pb-4 space-y-1">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Display Heading 3 (Instrument Serif)</span>
            <Heading level={3}>Modular foundations built for endurance.</Heading>
          </div>

          <div className="border-b border-border pb-4 space-y-1">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Lead Body (Instrument Sans)</span>
            <Lead>
              Earth combines tactile warm surfaces with quiet utility, giving tools the presence of well-worn natural instruments.
            </Lead>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider block mb-1">Standard Body</span>
              <Paragraph className="text-sm">
                Every component is carefully engineered with high-contrast visible focus rings, reduced-motion fallbacks, and standard semantic landmarks.
              </Paragraph>
            </div>
            <div>
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider block mb-1">Monospace & Kbd</span>
              <div className="flex items-center gap-2 mt-1">
                <CodeBlock>npm run build</CodeBlock>
                <span className="text-xs text-muted-foreground">or press</span>
                <Kbd>⌘</Kbd>
                <Kbd>K</Kbd>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <Separator />

      {/* Section 4: Interactive Component System */}
      <section className="space-y-8">
        <div className="flex items-center gap-2">
          <Component className="h-5 w-5 text-earth-olive" />
          <Heading level={3}>4. Interactive Component Primitives</Heading>
        </div>

        {/* 4.1 Buttons */}
        <Card className="p-6 space-y-4">
          <div className="flex flex-col gap-1">
            <h4 className="font-serif text-lg font-medium">Button Primitives & Variants</h4>
            <p className="text-xs text-muted-foreground">Configured with accessible focus rings, active spring scaling, and keyboard accessibility.</p>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <Button variant="default">
              <Sparkles className="mr-2 h-4 w-4" />
              Primary (Terracotta)
            </Button>
            <Button variant="secondary">
              Secondary (Olive)
            </Button>
            <Button variant="subtle">
              Subtle (Cream)
            </Button>
            <Button variant="outline">
              Outline
            </Button>
            <Button variant="ghost">
              Ghost
            </Button>
            <Button variant="destructive">
              Destructive
            </Button>
            <Button variant="link">
              Link Style
            </Button>
          </div>

          <div className="flex flex-wrap gap-3 items-center pt-2 border-t border-border/60">
            <span className="text-xs text-muted-foreground font-mono mr-2">Sizes:</span>
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" variant="outline" aria-label="Add item">
              <Plus className="h-4 w-4" />
            </Button>
            <Button disabled>
              Disabled
            </Button>
          </div>
        </Card>

        {/* 4.2 Inputs & Textareas */}
        <Card className="p-6 space-y-4">
          <div className="flex flex-col gap-1">
            <h4 className="font-serif text-lg font-medium">Input, Textarea & Form Controls</h4>
            <p className="text-xs text-muted-foreground">Sensible placeholder contrast, terracotta focus ring, and explicit error states.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="standard-input" className="text-xs font-medium text-foreground">Standard Input</label>
              <Input id="standard-input" placeholder="e.g. Flora catalog identifier" defaultValue="FLO-4920" />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="error-input" className="text-xs font-medium text-destructive">Error State</label>
              <Input id="error-input" error defaultValue="invalid_format@domain" />
              <p className="text-[11px] text-destructive">Please provide a valid coordinate or domain.</p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="disabled-input" className="text-xs font-medium text-muted-foreground">Disabled Input</label>
              <Input id="disabled-input" disabled defaultValue="Archived system value" />
            </div>

            <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
              <label htmlFor="notes-textarea" className="text-xs font-medium text-foreground">Textarea</label>
              <Textarea id="notes-textarea" placeholder="Enter ecological survey notes, soil taxonomy observations, or terrain descriptors..." rows={3} />
            </div>
          </div>
        </Card>

        {/* 4.3 Select, Dropdown Menu & Dialog */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Select Component */}
          <Card className="p-6 space-y-4">
            <div className="space-y-1">
              <h4 className="font-serif text-lg font-medium">Select Dropdown</h4>
              <p className="text-xs text-muted-foreground">Accessible Radix Select primitive</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium">Bioregion Target</label>
              <Select value={selectedBiome} onValueChange={setSelectedBiome}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a bioregion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Temperate & Mediterranean</SelectLabel>
                    <SelectItem value="mediterranean">Mediterranean Basin</SelectItem>
                    <SelectItem value="alpine">Alpine High Meadows</SelectItem>
                    <SelectItem value="pacific-coast">Pacific Redwood Shelf</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Arid & Savanna</SelectLabel>
                    <SelectItem value="savanna">Serengeti Savannah</SelectItem>
                    <SelectItem value="desert">Sonoran Desert Oasis</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              Current selection: <span className="font-medium text-foreground capitalize">{selectedBiome}</span>
            </p>
          </Card>

          {/* Dropdown Menu Component */}
          <Card className="p-6 space-y-4">
            <div className="space-y-1">
              <h4 className="font-serif text-lg font-medium">Dropdown Menu</h4>
              <p className="text-xs text-muted-foreground">Keyboard navigable actions</p>
            </div>

            <div className="pt-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <span>Manage Archive</span>
                    <Sliders className="h-4 w-4 ml-2 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Archive Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => toast.info("New record initialized")}>
                      <Plus className="mr-2 h-4 w-4" />
                      <span>New Specimen</span>
                      <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast.info("Syncing archive...")}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      <span>Export Manifest</span>
                      <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                    onClick={() => toast.error("Purged local cache")}
                  >
                    Purge Cache
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-xs text-muted-foreground">
              Full ARIA attributes and focus management built-in.
            </p>
          </Card>

          {/* Dialog Modal Component */}
          <Card className="p-6 space-y-4">
            <div className="space-y-1">
              <h4 className="font-serif text-lg font-medium">Dialog Primitive</h4>
              <p className="text-xs text-muted-foreground">Modal overlay with backdrop blur</p>
            </div>

            <div className="pt-2">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <span>Open Specimen Modal</span>
                    <ChevronRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Register Specimen</DialogTitle>
                    <DialogDescription>
                      Add a new geological or botanical observation to your Earth repository.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium">Specimen Name</label>
                      <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="e.g. Pinus aristata"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium">Survey Region</label>
                      <Input readOnly value={selectedBiome} className="bg-muted/50" />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSimulateSubmit} disabled={isSubmitting}>
                      {isSubmitting ? "Saving..." : "Save Record"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <p className="text-xs text-muted-foreground">
              Focus trapped properly with <Kbd>Esc</Kbd> dismiss support.
            </p>
          </Card>
        </div>

        {/* 4.4 Badges, Tooltips & Avatars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Badges */}
          <Card className="p-6 space-y-4">
            <div className="space-y-1">
              <h4 className="font-serif text-lg font-medium">Badge Primitives</h4>
              <p className="text-xs text-muted-foreground">Contextual tags in Earth colorways</p>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant="terracotta">Terracotta</Badge>
              <Badge variant="olive">Olive</Badge>
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="muted">Muted</Badge>
              <Badge variant="destructive">Alert</Badge>
            </div>
          </Card>

          {/* Tooltips */}
          <Card className="p-6 space-y-4">
            <div className="space-y-1">
              <h4 className="font-serif text-lg font-medium">Accessible Tooltips</h4>
              <p className="text-xs text-muted-foreground">Keyboard and hover triggers</p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm">
                    Hover Me
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Earth design system tooltip</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label="Help">
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Accessible assistive description</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </Card>

          {/* Avatars */}
          <Card className="p-6 space-y-4">
            <div className="space-y-1">
              <h4 className="font-serif text-lg font-medium">Avatar & Fallbacks</h4>
              <p className="text-xs text-muted-foreground">Organic rounded fallbacks</p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Avatar>
                <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Botanist" />
                <AvatarFallback>EA</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback className="bg-earth-terracotta text-white font-medium">TC</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback className="bg-earth-olive text-white font-medium">OL</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>IV</AvatarFallback>
              </Avatar>
            </div>
          </Card>
        </div>

        {/* 4.5 Skeletons & Empty State */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Skeleton Loaders */}
          <Card className="p-6 space-y-4">
            <div className="space-y-1">
              <h4 className="font-serif text-lg font-medium">Skeleton States</h4>
              <p className="text-xs text-muted-foreground">Gentle pulsing shimmer matching warm sand palette</p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-16 w-full rounded-lg" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24 rounded-md" />
                <Skeleton className="h-8 w-20 rounded-md" />
              </div>
            </div>
          </Card>

          {/* Empty State */}
          <EmptyState
            icon={Inbox}
            title="No Field Samples Recorded"
            description="Your terrain archive is currently clear. Begin by indexing botanical or mineral specimens in your active territory."
            action={
              <Button
                size="sm"
                variant="subtle"
                onClick={() => toast.info("Create sample dialog would open here")}
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Record First Sample
              </Button>
            }
          />
        </div>

        {/* 4.6 Toasts Showcase */}
        <Card className="p-6 space-y-4">
          <div className="flex flex-col gap-1">
            <h4 className="font-serif text-lg font-medium">Toast Notification System (Sonner)</h4>
            <p className="text-xs text-muted-foreground">Configured with theme awareness, action triggers, and warm Earth aesthetic.</p>
          </div>

          <div className="flex flex-wrap gap-3 items-center pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                toast.success("Specimen cataloged", {
                  description: "Coordinates verified at 45.18° N, 9.21° E",
                })
              }
            >
              <CheckCircle2 className="mr-1.5 h-4 w-4 text-earth-olive" />
              Success Toast
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                toast.error("Telemetry connection lost", {
                  description: "Retrying satellite uplink in 5 seconds...",
                })
              }
            >
              <AlertCircle className="mr-1.5 h-4 w-4 text-destructive" />
              Error Toast
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                toast("Archive synchronized", {
                  description: "32 records updated from local cache.",
                  action: {
                    label: "Undo",
                    onClick: () => toast.info("Sync reverted"),
                  },
                })
              }
            >
              <Bell className="mr-1.5 h-4 w-4 text-earth-terracotta" />
              Action Toast
            </Button>
          </div>
        </Card>
      </section>

      {/* Footer verification summary */}
      <footer className="pt-8 pb-12 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <EarthLogo variant="mark" size="sm" />
          <span>Earth Frontend Foundation &bull; Phase 1 Verified</span>
        </div>
        <div>
          <span>Instrument Sans &amp; Instrument Serif</span>
        </div>
      </footer>
    </Container>
  );
}
