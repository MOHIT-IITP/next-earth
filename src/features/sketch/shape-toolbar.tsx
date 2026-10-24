"use client";

import * as React from "react";
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
  StickyNote,
  Type,
  Box,
  Search,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SystemNodeType } from "./custom-nodes/system-node";
import { cn } from "@/lib/utils";

export interface ShapeItem {
  id: string;
  label: string;
  sublabel: string;
  category: "compute" | "data" | "network" | "annotation";
  icon: React.ElementType;
  defaultData: Record<string, any>;
  nodeType: "systemNode" | "stickyNote" | "annotation" | "groupBoundary";
}

export const SHAPE_CATALOG: ShapeItem[] = [
  // Network / Gateway
  {
    id: "client",
    label: "Client / Frontend",
    sublabel: "Web, Mobile, Edge UI",
    category: "compute",
    icon: Laptop,
    nodeType: "systemNode",
    defaultData: {
      label: "Client App",
      sublabel: "Next.js / Web Application",
      nodeType: "client" as SystemNodeType,
      accent: "sand",
      status: "active",
    },
  },
  {
    id: "load_balancer",
    label: "Load Balancer",
    sublabel: "Traffic distributor / reverse proxy",
    category: "network",
    icon: Network,
    nodeType: "systemNode",
    defaultData: {
      label: "Edge Load Balancer",
      sublabel: "High Availability Ingress",
      nodeType: "load_balancer" as SystemNodeType,
      accent: "terracotta",
      status: "active",
    },
  },
  {
    id: "api_gateway",
    label: "API Gateway",
    sublabel: "Auth, rate limiting, routing",
    category: "network",
    icon: Shield,
    nodeType: "systemNode",
    defaultData: {
      label: "API Gateway",
      sublabel: "JWT Auth & Route Proxy",
      nodeType: "api_gateway" as SystemNodeType,
      accent: "olive",
      status: "active",
    },
  },
  // Compute / Services
  {
    id: "backend_service",
    label: "Backend Service",
    sublabel: "Microservice / API worker",
    category: "compute",
    icon: Server,
    nodeType: "systemNode",
    defaultData: {
      label: "Core API Service",
      sublabel: "Node / Python Microservice",
      nodeType: "backend_service" as SystemNodeType,
      accent: "terracotta",
      status: "active",
    },
  },
  {
    id: "external_service",
    label: "External Service",
    sublabel: "3rd party API or SaaS",
    category: "network",
    icon: Globe,
    nodeType: "systemNode",
    defaultData: {
      label: "External Provider",
      sublabel: "REST / Webhook Integration",
      nodeType: "external_service" as SystemNodeType,
      accent: "sand",
      status: "active",
    },
  },
  {
    id: "cloud_service",
    label: "Cloud Service",
    sublabel: "Blob storage / Serverless lambda",
    category: "compute",
    icon: Cloud,
    nodeType: "systemNode",
    defaultData: {
      label: "Cloud Object Storage",
      sublabel: "S3 / Blob Bucket",
      nodeType: "cloud_service" as SystemNodeType,
      accent: "charcoal",
      status: "active",
    },
  },
  // Data & Streaming
  {
    id: "database",
    label: "Database",
    sublabel: "PostgreSQL, Mongo, Cockroach",
    category: "data",
    icon: Database,
    nodeType: "systemNode",
    defaultData: {
      label: "Relational Database",
      sublabel: "PostgreSQL Primary Cluster",
      nodeType: "database" as SystemNodeType,
      accent: "charcoal",
      status: "active",
    },
  },
  {
    id: "cache",
    label: "In-Memory Cache",
    sublabel: "Redis, Memcached key-value store",
    category: "data",
    icon: Zap,
    nodeType: "systemNode",
    defaultData: {
      label: "Distributed Cache",
      sublabel: "Redis Cluster / TTL Store",
      nodeType: "cache" as SystemNodeType,
      accent: "olive",
      status: "active",
    },
  },
  {
    id: "message_queue",
    label: "Message Queue",
    sublabel: "Kafka, RabbitMQ, SQS",
    category: "data",
    icon: Layers,
    nodeType: "systemNode",
    defaultData: {
      label: "Event Queue",
      sublabel: "Kafka Topic / Event Buffer",
      nodeType: "message_queue" as SystemNodeType,
      accent: "terracotta",
      status: "active",
    },
  },
  // Annotations & Notes
  {
    id: "sticky_note",
    label: "Sticky Note",
    sublabel: "Design note & architectural remarks",
    category: "annotation",
    icon: StickyNote,
    nodeType: "stickyNote",
    defaultData: {
      label: "Architecture Note",
      content: "Explain consensus protocol, latency constraints, or caching rules...",
      accent: "sand",
    },
  },
  {
    id: "annotation",
    label: "Text Annotation",
    sublabel: "Floating text label or header",
    category: "annotation",
    icon: Type,
    nodeType: "annotation",
    defaultData: {
      text: "VPC Ingress Subnet",
      size: "md",
      accent: "terracotta",
    },
  },
  {
    id: "boundary",
    label: "Boundary Zone",
    sublabel: "Security perimeter or VPC boundary",
    category: "annotation",
    icon: Box,
    nodeType: "groupBoundary",
    defaultData: {
      label: "Secure VPC Boundary",
      sublabel: "us-west-2 region",
      variant: "dashed",
      accent: "olive",
    },
  },
];

interface ShapeToolbarProps {
  onAddShape: (shape: ShapeItem) => void;
  className?: string;
}

export function ShapeToolbar({ onAddShape, className }: ShapeToolbarProps) {
  const [search, setSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");

  const filteredShapes = React.useMemo(() => {
    return SHAPE_CATALOG.filter((shape) => {
      const matchesSearch =
        shape.label.toLowerCase().includes(search.toLowerCase()) ||
        shape.sublabel.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || shape.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  return (
    <div
      className={cn(
        "flex flex-col bg-card/95 backdrop-blur-md border border-border/80 rounded-xl shadow-xs overflow-hidden w-64 max-h-[calc(100vh-200px)]",
        className
      )}
    >
      <div className="p-3 border-b space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Shape Palette
          </span>
          <span className="text-[10px] text-muted-foreground">Click to add</span>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search blocks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs bg-background/50"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1 text-[11px]">
          {["all", "compute", "data", "network", "annotation"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-2 py-0.5 rounded-full capitalize whitespace-nowrap transition-colors",
                selectedCategory === cat
                  ? "bg-earth-terracotta text-white font-medium"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="p-2 overflow-y-auto space-y-1 flex-1">
        {filteredShapes.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted-foreground">
            No shapes match your query.
          </div>
        ) : (
          filteredShapes.map((shape) => {
            const Icon = shape.icon;
            return (
              <button
                key={shape.id}
                onClick={() => onAddShape(shape)}
                className="w-full flex items-center gap-2.5 p-2 rounded-lg text-left text-xs transition-colors hover:bg-accent/80 group"
              >
                <div className="h-7 w-7 rounded-md bg-muted/60 flex items-center justify-center shrink-0 text-muted-foreground group-hover:text-foreground group-hover:bg-earth-terracotta/10 transition-colors">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate group-hover:text-earth-terracotta">
                    {shape.label}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    {shape.sublabel}
                  </div>
                </div>
                <Plus className="h-3.5 w-3.5 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
