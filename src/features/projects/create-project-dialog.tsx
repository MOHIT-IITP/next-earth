"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { useProjects, Project } from "./projects-context";
import { Sparkles } from "lucide-react";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProjectDialog({
  open,
  onOpenChange,
}: CreateProjectDialogProps) {
  const { createProject } = useProjects();
  const [name, setName] = React.useState("");
  const [biome, setBiome] = React.useState("Tropical Grassland");
  const [description, setDescription] = React.useState("");
  const [accent, setAccent] = React.useState<Project["accent"]>("terracotta");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please provide a name for this environmental project.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const created = createProject({
        name: name.trim(),
        biome,
        description: description.trim() || "Ecological field survey archive.",
        accent,
      });

      setIsSubmitting(false);
      setName("");
      setDescription("");
      setError(null);
      onOpenChange(false);

      toast.success("Project Initiated", {
        description: `"${created.name}" is now active in your territory inventory.`,
      });
    }, 400);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-earth-terracotta" />
              <span>Initiate New Project</span>
            </DialogTitle>
            <DialogDescription>
              Establish a new ecological territory, research expedition, or biome inventory.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="project-name" required>
                Project Title
              </Label>
              <Input
                id="project-name"
                placeholder="e.g. Great Rift Valley Floral Survey"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                error={!!error}
                autoFocus
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="biome-select">Biome Classification</Label>
                <Select value={biome} onValueChange={setBiome}>
                  <SelectTrigger id="biome-select">
                    <SelectValue placeholder="Select Biome" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tropical Grassland">Tropical Grassland</SelectItem>
                    <SelectItem value="Montane Meadow">Montane Meadow</SelectItem>
                    <SelectItem value="Coastal Sclerophyll">Coastal Sclerophyll</SelectItem>
                    <SelectItem value="Subpolar Mire">Subpolar Mire</SelectItem>
                    <SelectItem value="Temperate Deciduous">Temperate Deciduous</SelectItem>
                    <SelectItem value="Arid Steppe">Arid Steppe</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="accent-select">Territorial Colorway</Label>
                <Select
                  value={accent}
                  onValueChange={(v) => setAccent(v as Project["accent"])}
                >
                  <SelectTrigger id="accent-select">
                    <SelectValue placeholder="Select Accent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="terracotta">Terracotta (Warm Earth)</SelectItem>
                    <SelectItem value="olive">Olive (Vegetative)</SelectItem>
                    <SelectItem value="sand">Sand (Mineral)</SelectItem>
                    <SelectItem value="charcoal">Charcoal (Alluvial)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="project-description">Scope &amp; Objectives</Label>
              <Textarea
                id="project-description"
                placeholder="Brief summary of research protocol, sampling frequency, or conservation goals..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
