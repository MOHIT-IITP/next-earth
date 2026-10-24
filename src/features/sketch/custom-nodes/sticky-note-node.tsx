"use client";

import * as React from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { StickyNote as StickyNoteIcon, Pin } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StickyNoteData {
  label?: string;
  content: string;
  accent?: "terracotta" | "olive" | "sand" | "charcoal" | "yellow";
}

export function StickyNoteNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as StickyNoteData;

  const accentStyles =
    nodeData.accent === "terracotta"
      ? "bg-earth-terracotta/10 border-earth-terracotta/30 text-earth-charcoal dark:text-earth-cream"
      : nodeData.accent === "olive"
      ? "bg-earth-olive/10 border-earth-olive/30 text-earth-charcoal dark:text-earth-cream"
      : nodeData.accent === "charcoal"
      ? "bg-earth-charcoal/10 border-earth-charcoal/30 text-earth-charcoal dark:text-earth-cream"
      : "bg-amber-500/10 border-amber-500/30 text-earth-charcoal dark:text-earth-cream";

  return (
    <div
      className={cn(
        "relative flex flex-col gap-2 rounded-xl border-2 p-4 shadow-md transition-all duration-150 w-[240px] select-none backdrop-blur-sm",
        accentStyles,
        selected
          ? "ring-2 ring-earth-terracotta ring-offset-2 ring-offset-background shadow-lg scale-[1.02]"
          : "hover:border-earth-terracotta/50"
      )}
    >
      {/* Directional handles for connectors */}
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2.5 !w-2.5 !bg-amber-600 !border-2 !border-background"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2.5 !w-2.5 !bg-amber-600 !border-2 !border-background"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2.5 !w-2.5 !bg-amber-600 !border-2 !border-background"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!h-2.5 !w-2.5 !bg-amber-600 !border-2 !border-background"
      />

      <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-1.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-earth-charcoal dark:text-earth-cream">
          <StickyNoteIcon className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
          <span className="truncate">{nodeData.label || "Architecture Note"}</span>
        </div>
        <Pin className="h-3 w-3 text-muted-foreground rotate-45" />
      </div>

      <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap font-sans">
        {nodeData.content || "Click to add annotations or assumptions..."}
      </p>
    </div>
  );
}
