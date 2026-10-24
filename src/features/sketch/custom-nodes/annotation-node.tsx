"use client";

import * as React from "react";
import { NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";

export interface AnnotationData {
  text: string;
  size?: "sm" | "md" | "lg";
  accent?: "terracotta" | "olive" | "muted";
}

export function AnnotationNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as AnnotationData;

  const sizeClasses =
    nodeData.size === "lg"
      ? "text-lg font-serif tracking-tight"
      : nodeData.size === "sm"
      ? "text-xs font-mono uppercase tracking-wider"
      : "text-sm font-medium";

  const colorClasses =
    nodeData.accent === "terracotta"
      ? "text-earth-terracotta"
      : nodeData.accent === "olive"
      ? "text-earth-olive"
      : "text-muted-foreground";

  return (
    <div
      className={cn(
        "px-2 py-1 select-none transition-all rounded",
        sizeClasses,
        colorClasses,
        selected && "outline-dashed outline-1 outline-earth-terracotta bg-background/40"
      )}
    >
      {nodeData.text || "Type annotation..."}
    </div>
  );
}
