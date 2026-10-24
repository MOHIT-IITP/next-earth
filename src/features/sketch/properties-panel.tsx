"use client";

import * as React from "react";
import { Node, Edge } from "@xyflow/react";
import {
  X,
  Trash2,
  CheckSquare,
  Layers,
  Palette,
  Sparkles,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SystemNodeType } from "./custom-nodes/system-node";
import { cn } from "@/lib/utils";

interface PropertiesPanelProps {
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  onUpdateNodeData: (id: string, newData: Record<string, any>) => void;
  onUpdateEdgeData: (id: string, newProps: Partial<Edge>) => void;
  onDeleteNode: (id: string) => void;
  onDeleteEdge: (id: string) => void;
  onCreateTaskFromNode?: (node: Node) => void;
  onClose: () => void;
  className?: string;
}

export function PropertiesPanel({
  selectedNode,
  selectedEdge,
  onUpdateNodeData,
  onUpdateEdgeData,
  onDeleteNode,
  onDeleteEdge,
  onCreateTaskFromNode,
  onClose,
  className,
}: PropertiesPanelProps) {
  if (!selectedNode && !selectedEdge) return null;

  return (
    <div
      className={cn(
        "flex flex-col bg-card/95 backdrop-blur-md border border-border/80 rounded-xl shadow-xs w-72 max-h-[calc(100vh-200px)] overflow-hidden",
        className
      )}
    >
      <div className="flex items-center justify-between p-3 border-b bg-muted/20">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-earth-terracotta" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            {selectedNode ? "Element Inspector" : "Connection Inspector"}
          </span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="p-3.5 overflow-y-auto space-y-4 text-xs">
        {selectedNode && (
          <>
            {/* System Node Editor */}
            {selectedNode.type === "systemNode" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Node Title
                  </label>
                  <Input
                    value={(selectedNode.data as any)?.label || ""}
                    onChange={(e) =>
                      onUpdateNodeData(selectedNode.id, { label: e.target.value })
                    }
                    className="h-8 text-xs"
                    placeholder="Component Title"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Subtitle / Tech Stack
                  </label>
                  <Input
                    value={(selectedNode.data as any)?.sublabel || ""}
                    onChange={(e) =>
                      onUpdateNodeData(selectedNode.id, { sublabel: e.target.value })
                    }
                    className="h-8 text-xs"
                    placeholder="e.g. Postgres Shard / Kafka"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Node Category
                  </label>
                  <Select
                    value={(selectedNode.data as any)?.nodeType || "backend_service"}
                    onValueChange={(val: SystemNodeType) =>
                      onUpdateNodeData(selectedNode.id, { nodeType: val })
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Client / Frontend</SelectItem>
                      <SelectItem value="load_balancer">Load Balancer</SelectItem>
                      <SelectItem value="api_gateway">API Gateway</SelectItem>
                      <SelectItem value="backend_service">Backend Service</SelectItem>
                      <SelectItem value="database">Database</SelectItem>
                      <SelectItem value="cache">In-Memory Cache</SelectItem>
                      <SelectItem value="message_queue">Message Queue</SelectItem>
                      <SelectItem value="external_service">External Service</SelectItem>
                      <SelectItem value="cloud_service">Cloud Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Runtime Status
                  </label>
                  <Select
                    value={(selectedNode.data as any)?.status || "active"}
                    onValueChange={(val) =>
                      onUpdateNodeData(selectedNode.id, { status: val })
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active (Online)</SelectItem>
                      <SelectItem value="standby">Standby (Warm)</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Accent Palette
                  </label>
                  <div className="flex gap-2">
                    {[
                      { id: "terracotta", color: "bg-earth-terracotta" },
                      { id: "olive", color: "bg-earth-olive" },
                      { id: "charcoal", color: "bg-earth-charcoal" },
                      { id: "sand", color: "bg-stone-300 dark:bg-stone-600" },
                    ].map((acc) => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() =>
                          onUpdateNodeData(selectedNode.id, { accent: acc.id })
                        }
                        className={cn(
                          "h-6 w-6 rounded-full border-2 transition-transform",
                          acc.color,
                          (selectedNode.data as any)?.accent === acc.id
                            ? "border-foreground scale-110 shadow-sm"
                            : "border-transparent opacity-70 hover:opacity-100"
                        )}
                        title={acc.id}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Implementation Notes
                  </label>
                  <Textarea
                    value={(selectedNode.data as any)?.notes || ""}
                    onChange={(e) =>
                      onUpdateNodeData(selectedNode.id, { notes: e.target.value })
                    }
                    className="min-h-[64px] text-xs resize-none"
                    placeholder="SLA requirements, protocols, replication factors..."
                  />
                </div>
              </>
            )}

            {/* Sticky Note Editor */}
            {selectedNode.type === "stickyNote" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Note Header
                  </label>
                  <Input
                    value={(selectedNode.data as any)?.label || ""}
                    onChange={(e) =>
                      onUpdateNodeData(selectedNode.id, { label: e.target.value })
                    }
                    className="h-8 text-xs"
                    placeholder="Architecture Observation"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Note Body
                  </label>
                  <Textarea
                    value={(selectedNode.data as any)?.content || ""}
                    onChange={(e) =>
                      onUpdateNodeData(selectedNode.id, { content: e.target.value })
                    }
                    className="min-h-[90px] text-xs"
                    placeholder="Details, decisions, assumptions..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Sticky Theme
                  </label>
                  <div className="flex gap-2">
                    {[
                      { id: "sand", label: "Amber", color: "bg-amber-400" },
                      { id: "terracotta", label: "Terracotta", color: "bg-earth-terracotta" },
                      { id: "olive", label: "Olive", color: "bg-earth-olive" },
                      { id: "charcoal", label: "Charcoal", color: "bg-earth-charcoal" },
                    ].map((acc) => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() =>
                          onUpdateNodeData(selectedNode.id, { accent: acc.id })
                        }
                        className={cn(
                          "h-6 w-6 rounded-full border-2 transition-transform",
                          acc.color,
                          (selectedNode.data as any)?.accent === acc.id
                            ? "border-foreground scale-110 shadow-sm"
                            : "border-transparent opacity-70 hover:opacity-100"
                        )}
                        title={acc.label}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Annotation Editor */}
            {selectedNode.type === "annotation" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Annotation Text
                  </label>
                  <Input
                    value={(selectedNode.data as any)?.text || ""}
                    onChange={(e) =>
                      onUpdateNodeData(selectedNode.id, { text: e.target.value })
                    }
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Font Scale
                  </label>
                  <Select
                    value={(selectedNode.data as any)?.size || "md"}
                    onValueChange={(val) =>
                      onUpdateNodeData(selectedNode.id, { size: val })
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sm">Small Mono</SelectItem>
                      <SelectItem value="md">Medium Sans</SelectItem>
                      <SelectItem value="lg">Large Serif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Boundary Zone Editor */}
            {selectedNode.type === "groupBoundary" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Zone Name
                  </label>
                  <Input
                    value={(selectedNode.data as any)?.label || ""}
                    onChange={(e) =>
                      onUpdateNodeData(selectedNode.id, { label: e.target.value })
                    }
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Sublabel / Tag
                  </label>
                  <Input
                    value={(selectedNode.data as any)?.sublabel || ""}
                    onChange={(e) =>
                      onUpdateNodeData(selectedNode.id, { sublabel: e.target.value })
                    }
                    className="h-8 text-xs"
                  />
                </div>
              </>
            )}

            {/* Quick Actions */}
            <div className="pt-2 border-t space-y-2">
              {onCreateTaskFromNode && selectedNode.type === "systemNode" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCreateTaskFromNode(selectedNode)}
                  className="w-full justify-start text-xs h-8 text-earth-olive hover:text-earth-olive hover:bg-earth-olive/10"
                >
                  <CheckSquare className="h-3.5 w-3.5 mr-2" />
                  Create Implementation Task
                </Button>
              )}

              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDeleteNode(selectedNode.id)}
                className="w-full justify-start text-xs h-8"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Delete Element
              </Button>
            </div>
          </>
        )}

        {/* Selected Edge Editor */}
        {selectedEdge && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-muted-foreground">
                Connector Label
              </label>
              <Input
                value={(selectedEdge.label as string) || ""}
                onChange={(e) =>
                  onUpdateEdgeData(selectedEdge.id, { label: e.target.value })
                }
                className="h-8 text-xs"
                placeholder="e.g. gRPC / TLS 1.3 / Async Event"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-muted-foreground">
                Animated Pulse Flow
              </span>
              <input
                type="checkbox"
                checked={Boolean(selectedEdge.animated)}
                onChange={(e) =>
                  onUpdateEdgeData(selectedEdge.id, {
                    animated: e.target.checked,
                  })
                }
                className="rounded border-input text-earth-terracotta focus:ring-earth-terracotta"
              />
            </div>

            <div className="pt-2 border-t">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDeleteEdge(selectedEdge.id)}
                className="w-full justify-start text-xs h-8"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Delete Connection
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
