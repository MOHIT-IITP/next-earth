"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sliders, Sun, Moon, Monitor, RotateCcw, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { cn } from "@/lib/utils";

export function PreferencesView() {
  const { theme, setTheme } = useTheme();

  const [emailAlerts, setEmailAlerts] = React.useState(true);
  const [offlineSync, setOfflineSync] = React.useState(true);
  const [compactDensity, setCompactDensity] = React.useState(false);
  const [defaultBiome, setDefaultBiome] = React.useState("Montane Meadow");

  const handleResetData = () => {
    EarthService.resetToMockData();
    window.dispatchEvent(new Event("earth-data-updated"));
    toast.success("Default Research Data Restored", {
      description: "Restored sample projects, tasks, notes, and activity.",
    });
  };

  const handleClearData = () => {
    EarthService.clearAllData();
    window.dispatchEvent(new Event("earth-data-updated"));
    toast.info("Observatory Storage Cleared", {
      description: "Empty state mode activated.",
    });
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div className="space-y-1 pb-4 border-b border-border/80">
        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-foreground">
          Observatory Preferences
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure interface aesthetics, ambient alerts, and local mock storage states.
        </p>
      </div>

      {/* Theme Selection */}
      <Card className="p-6 space-y-4">
        <div className="space-y-1">
          <h3 className="font-serif text-lg font-medium text-foreground">Theme &amp; Appearance</h3>
          <p className="text-xs text-muted-foreground">
            Earth adapts between warm ivory/cream in light mode and deep warm charcoal in dark mode.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2">
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-xl border transition-all text-xs",
              theme === "light"
                ? "border-earth-terracotta bg-earth-cream text-earth-charcoal ring-1 ring-earth-terracotta font-medium"
                : "border-border hover:border-earth-sand text-muted-foreground"
            )}
          >
            <Sun className="h-5 w-5 mb-1.5 text-earth-terracotta" />
            <span>Light (Warm Ivory)</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-xl border transition-all text-xs",
              theme === "dark"
                ? "border-earth-terracotta bg-muted text-foreground ring-1 ring-earth-terracotta font-medium"
                : "border-border hover:border-neutral-700 text-muted-foreground"
            )}
          >
            <Moon className="h-5 w-5 mb-1.5 text-earth-terracotta" />
            <span>Dark (Charcoal)</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme("system")}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-xl border transition-all text-xs",
              theme === "system"
                ? "border-earth-terracotta bg-earth-cream dark:bg-muted text-foreground ring-1 ring-earth-terracotta font-medium"
                : "border-border hover:border-earth-sand text-muted-foreground"
            )}
          >
            <Monitor className="h-5 w-5 mb-1.5 text-earth-olive" />
            <span>System Default</span>
          </button>
        </div>
      </Card>

      {/* Operational Toggles */}
      <Card className="p-6 space-y-5">
        <div className="space-y-1">
          <h3 className="font-serif text-lg font-medium text-foreground">Field Operations</h3>
          <p className="text-xs text-muted-foreground">Local telemetry and interface tuning.</p>
        </div>

        <div className="space-y-4 pt-1 divide-y divide-border/60">
          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5">
              <Label className="text-sm">Telemetry Notifications</Label>
              <p className="text-xs text-muted-foreground">Receive toast notifications when sensors or tasks update.</p>
            </div>
            <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="space-y-0.5">
              <Label className="text-sm">Offline Cache Synchronization</Label>
              <p className="text-xs text-muted-foreground">Maintain territory records in local browser storage for field offline use.</p>
            </div>
            <Switch checked={offlineSync} onCheckedChange={setOfflineSync} />
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="space-y-0.5">
              <Label className="text-sm">Compact Workspace Density</Label>
              <p className="text-xs text-muted-foreground">Reduce row padding across project lists and task feeds.</p>
            </div>
            <Switch checked={compactDensity} onCheckedChange={setCompactDensity} />
          </div>
        </div>
      </Card>

      {/* Mock Data Reset Utility */}
      <Card className="p-6 space-y-4 border-earth-terracotta/20 bg-earth-cream/20 dark:bg-card">
        <div className="space-y-1">
          <h3 className="font-serif text-lg font-medium text-foreground">Observatory Test Utilities</h3>
          <p className="text-xs text-muted-foreground">
            Convenient controls for verifying empty states, calculations, and sample territory datasets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={handleResetData}>
            <RotateCcw className="mr-2 h-4 w-4 text-earth-olive" />
            Restore Sample Biosphere Data
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive/10"
            onClick={handleClearData}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Storage (Test Empty States)
          </Button>
        </div>
      </Card>
    </div>
  );
}
