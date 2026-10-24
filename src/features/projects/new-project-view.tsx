"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Compass,
  Mountain,
  Trees,
  CloudRain,
  Sun,
  ArrowLeft,
  ArrowRight,
  FolderKanban,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { EarthService } from "@/services/earth-service";
import { ProjectStatus, ProjectAccent } from "@/services/types";
import { cn } from "@/lib/utils";

const ICONS = [
  { id: "compass", name: "Compass", icon: Compass },
  { id: "mountain", name: "Mountain", icon: Mountain },
  { id: "trees", name: "Forest", icon: Trees },
  { id: "cloud-rain", name: "Peatland/Rain", icon: CloudRain },
  { id: "sun", name: "Arid/Sun", icon: Sun },
];

export function NewProjectView() {
  const router = useRouter();

  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [icon, setIcon] = React.useState("compass");
  const [biome, setBiome] = React.useState("Montane Meadow");
  const [status, setStatus] = React.useState<ProjectStatus>("active");
  const [targetDate, setTargetDate] = React.useState("");
  const [accent, setAccent] = React.useState<ProjectAccent>("terracotta");

  const [errors, setErrors] = React.useState<{ name?: string; description?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const validate = () => {
    const errs: typeof errors = {};
    if (!name.trim()) {
      errs.name = "Project name is required.";
    } else if (name.trim().length < 3) {
      errs.name = "Project name must be at least 3 characters.";
    }

    if (!description.trim()) {
      errs.description = "Please provide an environmental description or scope.";
    } else if (description.trim().length < 10) {
      errs.description = "Description should be at least 10 characters long.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent duplicate submission

    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const created = EarthService.createProject({
        name: name.trim(),
        description: description.trim(),
        icon,
        biome,
        status,
        targetDate: targetDate || undefined,
        accent,
      });

      window.dispatchEvent(new Event("earth-data-updated"));

      toast.success("Project Successfully Initiated", {
        description: `"${created.name}" is now ready for field tracking.`,
      });

      router.push(`/projects/${created.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create project.";
      setErrors({ general: message });
      toast.error("Submission Blocked", { description: message });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb Back Link */}
      <Link
        href="/projects"
        className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
        Back to Territory Projects
      </Link>

      <div className="space-y-1">
        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-foreground">
          Initiate New Territory Project
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Establish an environmental campaign, survey transect, or biological observatory inventory.
        </p>
      </div>

      <Card className="p-6 sm:p-8">
        {errors.general && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3.5 text-xs text-destructive mb-6">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="new-project-name" required>
              Project Title
            </Label>
            <Input
              id="new-project-name"
              placeholder="e.g. Great Rift Valley Floral Phenology Survey"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              error={!!errors.name}
              autoFocus
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="new-project-desc" required>
              Scientific Scope &amp; Methodology
            </Label>
            <Textarea
              id="new-project-desc"
              placeholder="Detail the research objectives, target floral/faunal taxa, or hydrological indicators..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
              }}
              error={!!errors.description}
              rows={4}
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>

          {/* Icon Selector */}
          <div className="space-y-2">
            <Label>Project Emblem Icon</Label>
            <div className="grid grid-cols-5 gap-3">
              {ICONS.map((item) => {
                const IconComp = item.icon;
                const isSelected = icon === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setIcon(item.id)}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-xs",
                      isSelected
                        ? "border-earth-terracotta bg-earth-terracotta-light/40 text-earth-terracotta-dark dark:bg-earth-terracotta-light/20 dark:text-earth-terracotta ring-1 ring-earth-terracotta"
                        : "border-border bg-card/60 text-muted-foreground hover:border-earth-sand hover:text-foreground"
                    )}
                  >
                    <IconComp className="h-5 w-5 mb-1" />
                    <span className="text-[10px] truncate">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid Settings: Biome, Status, Target Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="new-project-biome">Biome</Label>
              <Select value={biome} onValueChange={setBiome}>
                <SelectTrigger id="new-project-biome">
                  <SelectValue placeholder="Biome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Montane Meadow">Montane Meadow</SelectItem>
                  <SelectItem value="Tropical Grassland">Tropical Grassland</SelectItem>
                  <SelectItem value="Coastal Sclerophyll">Coastal Sclerophyll</SelectItem>
                  <SelectItem value="Subpolar Mire">Subpolar Mire</SelectItem>
                  <SelectItem value="Temperate Deciduous">Temperate Deciduous</SelectItem>
                  <SelectItem value="Arid Steppe">Arid Steppe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="new-project-status">Initial Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as ProjectStatus)}
              >
                <SelectTrigger id="new-project-status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="new-project-date">Target Date (Optional)</Label>
              <Input
                id="new-project-date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>
          </div>

          {/* Color Accent */}
          <div className="space-y-1.5">
            <Label htmlFor="new-project-accent">Territorial Theme Accent</Label>
            <Select
              value={accent}
              onValueChange={(v) => setAccent(v as ProjectAccent)}
            >
              <SelectTrigger id="new-project-accent">
                <SelectValue placeholder="Accent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="terracotta">Terracotta (Warm Earth &amp; Horizon)</SelectItem>
                <SelectItem value="olive">Olive (Vegetative &amp; Foliage)</SelectItem>
                <SelectItem value="sand">Sand (Mineral &amp; Sediment)</SelectItem>
                <SelectItem value="charcoal">Charcoal (Alluvial &amp; Deep Soil)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/projects")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <span>Creating Project...</span>
              ) : (
                <>
                  <span>Initiate Project</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
