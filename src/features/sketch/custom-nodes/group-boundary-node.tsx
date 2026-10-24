"use client";

import * as React from "react";
import { NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { Box } from "lucide-react";

export interface GroupBoundaryData {
  label: string;
  sublabel?: string;
  variant?: "dashed" | "solid";
  accent?: "terracotta" | "olive" | "sand" | "charcoal";
}

export function GroupBoundaryNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as GroupBoundaryData;

  const accentBorder =
    nodeData.accent === "terracotta"
      ? "border-earth-terracotta/40 bg-earth-terracotta/[0.03]"
      : nodeData.accent === "olive"
      ? "border-earth-olive/40 bg-earth-olive/[0.03]"
      : "border-border/60 bg-muted/20";

  return (
    <div
      className={cn(
        "min-w-[320px] min-h-[220px] rounded-2xl p-4 transition-all duration-150 pointer-events-none",
        nodeData.variant === "solid" ? "border-2 border-solid" : "border-2 border-dashed",
        accentBorder,
        selected && "border-earth-terracotta ring-2 ring-earth-terracotta/20"
      )}
    >
      <div className="flex items-center gap-2 pointer-events-auto select-none">
        <Box className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
          {nodeData.label || "Boundary Zone"}
        </span>
        {nodeData.sublabel && (
          <span className="text-[11px] text-muted-foreground/70">({nodeData.sublabel})</span>
        )}
      </div>
    </div>
  );
}
