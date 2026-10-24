"use client";

import * as React from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import {
  Laptop,
  Shield,
  Server,
  Database,
  Zap,
  Layers,
  Globe,
  Network,
  Cloud,
  Cpu,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type SystemNodeType =
  | "client"
  | "api_gateway"
  | "backend_service"
  | "database"
  | "cache"
  | "message_queue"
  | "external_service"
  | "load_balancer"
  | "cloud_service";

export interface SystemNodeData {
  label: string;
  sublabel?: string;
  nodeType: SystemNodeType;
  status?: "active" | "standby" | "maintenance";
  accent?: "terracotta" | "olive" | "sand" | "charcoal";
  notes?: string;
}

const TYPE_CONFIG: Record<
  SystemNodeType,
  { label: string; icon: React.ElementType }
> = {
  client: { label: "Client / Frontend", icon: Laptop },
  api_gateway: { label: "API Gateway", icon: Shield },
  backend_service: { label: "Backend Service", icon: Server },
  database: { label: "Database", icon: Database },
  cache: { label: "In-Memory Cache", icon: Zap },
  message_queue: { label: "Message Queue", icon: Layers },
  external_service: { label: "External Service", icon: Globe },
  load_balancer: { label: "Load Balancer", icon: Network },
  cloud_service: { label: "Cloud Service", icon: Cloud },
};

export function SystemNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as SystemNodeData;
  const config = TYPE_CONFIG[nodeData.nodeType] || TYPE_CONFIG.backend_service;
  const Icon = config.icon;

  const accentBorder =
    nodeData.accent === "terracotta"
      ? "border-earth-terracotta/80 shadow-earth-terracotta/10"
      : nodeData.accent === "olive"
      ? "border-earth-olive/80 shadow-earth-olive/10"
      : nodeData.accent === "charcoal"
      ? "border-earth-charcoal/80"
      : "border-border";

  return (
    <div
      className={cn(
        "relative flex items-center gap-3 rounded-xl border-2 bg-card p-3.5 shadow-sm transition-all duration-150 min-w-[210px] max-w-[280px]",
        accentBorder,
        selected
          ? "ring-2 ring-earth-terracotta ring-offset-2 ring-offset-background shadow-md scale-[1.02]"
          : "hover:border-earth-terracotta/60"
      )}
    >
      {/* 4 Multi-directional Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2.5 !w-2.5 !bg-earth-terracotta !border-2 !border-background"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2.5 !w-2.5 !bg-earth-terracotta !border-2 !border-background"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2.5 !w-2.5 !bg-earth-olive !border-2 !border-background"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!h-2.5 !w-2.5 !bg-earth-olive !border-2 !border-background"
      />

      {/* Emblem Icon */}
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg shadow-2xs",
          nodeData.accent === "terracotta"
            ? "bg-earth-terracotta-light text-earth-terracotta-dark dark:bg-earth-terracotta-light/20 dark:text-earth-terracotta"
            : nodeData.accent === "olive"
            ? "bg-earth-olive-light text-earth-olive-dark dark:bg-earth-olive-light/20 dark:text-earth-olive"
            : "bg-earth-cream text-earth-charcoal dark:bg-muted dark:text-foreground"
        )}
      >
        <Icon className="h-5 w-5" />
      </div>

      {/* Node Text Metadata */}
      <div className="flex-1 min-w-0 space-y-0.5">
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block truncate">
          {config.label}
        </span>
        <h4 className="font-serif text-sm font-medium text-foreground leading-snug truncate">
          {nodeData.label || "Service Node"}
        </h4>
        {nodeData.sublabel && (
          <p className="text-[11px] text-muted-foreground truncate leading-none">
            {nodeData.sublabel}
          </p>
        )}
      </div>

      {/* Note indicator dot if node has annotations */}
      {nodeData.notes && (
        <span
          className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-earth-terracotta text-white"
          title={nodeData.notes}
        >
          <FileText className="h-2 w-2" />
        </span>
      )}
    </div>
  );
}
