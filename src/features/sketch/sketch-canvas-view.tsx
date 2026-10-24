"use client";

import * as React from "react";
import Link from "next/link";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  OnConnect,
  useReactFlow,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import {
  Plus,
  Undo2,
  Redo2,
  Save,
  Maximize2,
  SidebarClose,
  SidebarOpen,
  Info,
  ChevronDown,
  Trash2,
  Copy,
  Layers,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  SlidersHorizontal,
  PenTool,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EarthService } from "@/services/earth-service";
import { Diagram, SerializedCanvas } from "@/services/types";
import { SAMPLE_STARTER_CANVAS } from "@/services/mock-data";
import { SystemNode } from "./custom-nodes/system-node";
import { StickyNoteNode } from "./custom-nodes/sticky-note-node";
import { AnnotationNode } from "./custom-nodes/annotation-node";
import { GroupBoundaryNode } from "./custom-nodes/group-boundary-node";
import { ShapeToolbar, ShapeItem } from "./shape-toolbar";
import { PropertiesPanel } from "./properties-panel";
import { DiagramInspector } from "./diagram-inspector";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const nodeTypes = {
  systemNode: SystemNode,
  stickyNote: StickyNoteNode,
  annotation: AnnotationNode,
  groupBoundary: GroupBoundaryNode,
};

interface SketchCanvasViewProps {
  projectId: string;
}

function CanvasInner({
  projectId,
  currentDiagram,
  diagrams,
  onSelectDiagram,
  onRefreshDiagrams,
}: {
  projectId: string;
  currentDiagram: Diagram;
  diagrams: Diagram[];
  onSelectDiagram: (id: string) => void;
  onRefreshDiagrams: () => void;
}) {
  const { fitView, zoomIn, zoomOut, getViewport, setViewport } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState(
    (currentDiagram.canvasData?.nodes as Node[]) || []
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    (currentDiagram.canvasData?.edges as Edge[]) || []
  );

  const [saveStatus, setSaveStatus] = React.useState<"saved" | "saving" | "unsaved">("saved");
  const [title, setTitle] = React.useState(currentDiagram.title);
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);

  // Panels visibility
  const [showToolbar, setShowToolbar] = React.useState(true);
  const [showInspector, setShowInspector] = React.useState(false);

  // Selection states
  const [selectedNode, setSelectedNode] = React.useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = React.useState<Edge | null>(null);

  // History for undo/redo
  const historyRef = React.useRef<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const historyIndexRef = React.useRef<number>(-1);
  const isUndoRedoRef = React.useRef<boolean>(false);

  // Push history snapshot
  const pushHistory = React.useCallback(
    (newNodes: Node[], newEdges: Edge[]) => {
      if (isUndoRedoRef.current) return;
      const nextIndex = historyIndexRef.current + 1;
      const newHistory = historyRef.current.slice(0, nextIndex);
      newHistory.push({ nodes: newNodes, edges: newEdges });
      historyRef.current = newHistory;
      historyIndexRef.current = newHistory.length - 1;
    },
    []
  );

  // Initialize history with initial data
  React.useEffect(() => {
    historyRef.current = [
      {
        nodes: (currentDiagram.canvasData?.nodes as Node[]) || [],
        edges: (currentDiagram.canvasData?.edges as Edge[]) || [],
      },
    ];
    historyIndexRef.current = 0;
  }, [currentDiagram.id, currentDiagram.canvasData]);

  // When switching diagram, reset local state
  React.useEffect(() => {
    setNodes((currentDiagram.canvasData?.nodes as Node[]) || []);
    setEdges((currentDiagram.canvasData?.edges as Edge[]) || []);
    setTitle(currentDiagram.title);
    setSelectedNode(null);
    setSelectedEdge(null);
    setSaveStatus("saved");

    if (currentDiagram.canvasData?.viewport) {
      setViewport(currentDiagram.canvasData.viewport);
    } else {
      setTimeout(() => fitView({ padding: 0.2 }), 50);
    }
  }, [
    currentDiagram.id,
    currentDiagram.canvasData,
    currentDiagram.title,
    setNodes,
    setEdges,
    setViewport,
    fitView,
  ]);

  // Handle Save
  const handleSave = React.useCallback(
    (manual = false) => {
      setSaveStatus("saving");
      const serialized: SerializedCanvas = {
        nodes,
        edges,
        viewport: getViewport(),
      };

      EarthService.saveDiagramCanvas(currentDiagram.id, serialized);
      EarthService.updateDiagram(currentDiagram.id, {
        title,
        nodeCount: nodes.length,
        edgeCount: edges.length,
      });

      setSaveStatus("saved");
      if (manual) {
        toast.success("Canvas saved successfully");
      }
      onRefreshDiagrams();
    },
    [currentDiagram.id, nodes, edges, getViewport, title, onRefreshDiagrams]
  );

  // Debounced auto-save when nodes or edges change
  const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  const trackChange = React.useCallback(() => {
    setSaveStatus("unsaved");
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      handleSave(false);
    }, 1500);
  }, [handleSave]);

  // On Connect
  const onConnect: OnConnect = React.useCallback(
    (params: Connection) => {
      setEdges((eds) => {
        const next = addEdge(
          {
            ...params,
            animated: true,
            style: { strokeWidth: 2, stroke: "#c45b3d" },
          },
          eds
        );
        pushHistory(nodes, next);
        trackChange();
        return next;
      });
    },
    [nodes, setEdges, pushHistory, trackChange]
  );

  // Undo / Redo
  const handleUndo = React.useCallback(() => {
    if (historyIndexRef.current > 0) {
      isUndoRedoRef.current = true;
      historyIndexRef.current -= 1;
      const snapshot = historyRef.current[historyIndexRef.current];
      setNodes(snapshot.nodes);
      setEdges(snapshot.edges);
      trackChange();
      setTimeout(() => {
        isUndoRedoRef.current = false;
      }, 50);
    }
  }, [setNodes, setEdges, trackChange]);

  const handleRedo = React.useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      isUndoRedoRef.current = true;
      historyIndexRef.current += 1;
      const snapshot = historyRef.current[historyIndexRef.current];
      setNodes(snapshot.nodes);
      setEdges(snapshot.edges);
      trackChange();
      setTimeout(() => {
        isUndoRedoRef.current = false;
      }, 50);
    }
  }, [setNodes, setEdges, trackChange]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        (e.target as HTMLElement).tagName === "INPUT" ||
        (e.target as HTMLElement).tagName === "TEXTAREA"
      ) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedo();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSave(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleUndo, handleRedo, handleSave]);

  // Add Shape to Canvas
  const handleAddShape = (shape: ShapeItem) => {
    const vp = getViewport();
    // Center of screen mapped to canvas coordinates
    const posX = -vp.x / vp.zoom + (window.innerWidth / 2.5) / vp.zoom;
    const posY = -vp.y / vp.zoom + (window.innerHeight / 3) / vp.zoom;

    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: shape.nodeType,
      position: { x: Math.round(posX), y: Math.round(posY) },
      data: { ...shape.defaultData },
    };

    const nextNodes = [...nodes, newNode];
    setNodes(nextNodes);
    pushHistory(nextNodes, edges);
    trackChange();
    setSelectedNode(newNode);
    toast.success(`Added ${shape.label} to canvas`);
  };

  // Node selection and modification
  const handleNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  };

  const handleEdgeClick = (_: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  };

  const handlePaneClick = () => {
    setSelectedNode(null);
    setSelectedEdge(null);
  };

  const handleUpdateNodeData = (id: string, newData: Record<string, any>) => {
    setNodes((nds) => {
      const next = nds.map((n) => {
        if (n.id === id) {
          const updated = {
            ...n,
            data: { ...n.data, ...newData },
          };
          if (selectedNode?.id === id) {
            setSelectedNode(updated);
          }
          return updated;
        }
        return n;
      });
      trackChange();
      return next;
    });
  };

  const handleUpdateEdgeData = (id: string, newProps: Partial<Edge>) => {
    setEdges((eds) => {
      const next = eds.map((e) => {
        if (e.id === id) {
          const updated = { ...e, ...newProps };
          if (selectedEdge?.id === id) {
            setSelectedEdge(updated);
          }
          return updated;
        }
        return e;
      });
      trackChange();
      return next;
    });
  };

  const handleDeleteNode = (id: string) => {
    const nextNodes = nodes.filter((n) => n.id !== id);
    const nextEdges = edges.filter((e) => e.source !== id && e.target !== id);
    setNodes(nextNodes);
    setEdges(nextEdges);
    pushHistory(nextNodes, nextEdges);
    setSelectedNode(null);
    trackChange();
    toast.info("Element deleted");
  };

  const handleDeleteEdge = (id: string) => {
    const nextEdges = edges.filter((e) => e.id !== id);
    setEdges(nextEdges);
    pushHistory(nodes, nextEdges);
    setSelectedEdge(null);
    trackChange();
    toast.info("Connection deleted");
  };

  const handleLoadStarter = () => {
    setNodes(SAMPLE_STARTER_CANVAS.nodes as Node[]);
    setEdges(SAMPLE_STARTER_CANVAS.edges as Edge[]);
    pushHistory(
      SAMPLE_STARTER_CANVAS.nodes as Node[],
      SAMPLE_STARTER_CANVAS.edges as Edge[]
    );
    trackChange();
    setTimeout(() => fitView({ padding: 0.15 }), 100);
    toast.success("Loaded starter telemetry architecture");
  };

  const handleDuplicate = () => {
    const dup = EarthService.duplicateDiagram(currentDiagram.id);
    if (dup) {
      toast.success("Diagram duplicated");
      onRefreshDiagrams();
      onSelectDiagram(dup.id);
    }
  };

  const handleDeleteDiagram = () => {
    if (diagrams.length <= 1) {
      toast.error("Cannot delete the only diagram in this project.");
      return;
    }
    EarthService.deleteDiagram(currentDiagram.id);
    toast.success("Diagram deleted");
    onRefreshDiagrams();
    const remaining = diagrams.filter((d) => d.id !== currentDiagram.id);
    if (remaining.length > 0) {
      onSelectDiagram(remaining[0].id);
    }
  };

  return (
    <div className="relative flex-1 h-full w-full overflow-hidden bg-background">
      {/* Top Application Bar for Sketch Canvas */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        {/* Left: Diagram Switcher & Title */}
        <div className="flex items-center gap-2 bg-card/90 backdrop-blur-md border border-border/80 rounded-xl px-3 py-1.5 shadow-xs pointer-events-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 text-xs font-serif font-medium gap-1 px-2">
                <PenTool className="h-3.5 w-3.5 text-earth-terracotta" />
                <span className="max-w-[180px] truncate">{title}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Project Diagrams ({diagrams.length})
              </div>
              {diagrams.map((diag) => (
                <DropdownMenuItem
                  key={diag.id}
                  onClick={() => onSelectDiagram(diag.id)}
                  className={cn(
                    "text-xs flex items-center justify-between cursor-pointer",
                    diag.id === currentDiagram.id && "bg-accent font-medium text-earth-terracotta"
                  )}
                >
                  <span className="truncate">{diag.title}</span>
                  <Badge variant="outline" className="text-[10px] scale-90">
                    {diag.nodeCount || 0} nodes
                  </Badge>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDuplicate} className="text-xs cursor-pointer">
                <Copy className="h-3.5 w-3.5 mr-2" /> Duplicate Canvas
              </DropdownMenuItem>
              {diagrams.length > 1 && (
                <DropdownMenuItem
                  onClick={handleDeleteDiagram}
                  className="text-xs text-destructive cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Canvas
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Inline Title Editor */}
          {isEditingTitle ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => {
                setIsEditingTitle(false);
                EarthService.updateDiagram(currentDiagram.id, { title });
                onRefreshDiagrams();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setIsEditingTitle(false);
                  EarthService.updateDiagram(currentDiagram.id, { title });
                  onRefreshDiagrams();
                }
              }}
              className="h-7 text-xs w-44"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="text-[11px] text-muted-foreground hover:text-foreground px-1 py-0.5 rounded transition-colors"
              title="Click to rename canvas"
            >
              Rename
            </button>
          )}

          <div className="h-4 w-px bg-border mx-1" />

          {/* Save Status Indicator */}
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground px-1">
            {saveStatus === "saving" && (
              <>
                <RefreshCw className="h-3 w-3 animate-spin text-earth-terracotta" />
                <span>Saving...</span>
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <CheckCircle2 className="h-3 w-3 text-earth-olive" />
                <span className="text-muted-foreground/80">Saved</span>
              </>
            )}
            {saveStatus === "unsaved" && (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-amber-600 dark:text-amber-400">Unsaved</span>
              </>
            )}
          </div>
        </div>

        {/* Right: Canvas Actions & Panel Toggles */}
        <div className="flex items-center gap-2 bg-card/90 backdrop-blur-md border border-border/80 rounded-xl px-2 py-1 shadow-xs pointer-events-auto">
          {nodes.length === 0 && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs text-earth-olive border-earth-olive/30 hover:bg-earth-olive/10"
              onClick={handleLoadStarter}
            >
              <Sparkles className="h-3 w-3 mr-1" /> Load Starter
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleUndo}
            disabled={historyIndexRef.current <= 0}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleRedo}
            disabled={historyIndexRef.current >= historyRef.current.length - 1}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </Button>

          <div className="h-4 w-px bg-border" />

          <Button
            variant={showToolbar ? "default" : "ghost"}
            size="sm"
            className={cn(
              "h-7 text-xs gap-1",
              showToolbar ? "bg-earth-terracotta hover:bg-earth-terracotta/90 text-white" : ""
            )}
            onClick={() => setShowToolbar(!showToolbar)}
          >
            <Layers className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Shapes</span>
          </Button>

          <Button
            variant={showInspector ? "default" : "ghost"}
            size="sm"
            className={cn(
              "h-7 text-xs gap-1",
              showInspector ? "bg-earth-olive hover:bg-earth-olive/90 text-white" : ""
            )}
            onClick={() => setShowInspector(!showInspector)}
          >
            <Info className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Details</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => handleSave(true)}
            title="Save diagram"
          >
            <Save className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Save</span>
          </Button>
        </div>
      </div>

      {/* Floating Shape Palette */}
      {showToolbar && (
        <div className="absolute left-4 top-16 z-20 transition-all duration-200">
          <ShapeToolbar onAddShape={handleAddShape} />
        </div>
      )}

      {/* Floating Properties Panel for Selected Node/Edge */}
      {(selectedNode || selectedEdge) && (
        <div className="absolute right-4 top-16 z-20 transition-all duration-200">
          <PropertiesPanel
            selectedNode={selectedNode}
            selectedEdge={selectedEdge}
            onUpdateNodeData={handleUpdateNodeData}
            onUpdateEdgeData={handleUpdateEdgeData}
            onDeleteNode={handleDeleteNode}
            onDeleteEdge={handleDeleteEdge}
            onCreateTaskFromNode={(node) => {
              const nodeData = node.data as any;
              const task = EarthService.createTask({
                projectId,
                columnId: "col-backlog",
                title: `Implement: ${nodeData.label || "Architecture Component"}`,
                description: `Component Type: ${nodeData.nodeType || "service"}\n${nodeData.sublabel || ""}\n${nodeData.notes || ""}`,
                type: "feature",
                priority: "medium",
                linkedDiagramIds: [currentDiagram.id],
                labels: ["Architecture", nodeData.nodeType || "component"],
              });
              EarthService.attachTaskToDiagram(currentDiagram.id, task.id);
              toast.success(`Created task "${task.title}"`);
              onRefreshDiagrams();
            }}
            onClose={() => {
              setSelectedNode(null);
              setSelectedEdge(null);
            }}
          />
        </div>
      )}

      {/* Floating Diagram Inspector / Context Panel */}
      {showInspector && !selectedNode && !selectedEdge && (
        <div className="absolute right-4 top-16 z-20 transition-all duration-200">
          <DiagramInspector
            projectId={projectId}
            diagram={currentDiagram}
            onUpdateMetadata={(updates) => {
              EarthService.updateDiagram(currentDiagram.id, updates);
              if (updates.title) setTitle(updates.title);
              onRefreshDiagrams();
            }}
            onClose={() => setShowInspector(false)}
          />
        </div>
      )}

      {/* The React Flow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={(changes) => {
          onNodesChange(changes);
          trackChange();
        }}
        onEdgesChange={(changes) => {
          onEdgesChange(changes);
          trackChange();
        }}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onPaneClick={handlePaneClick}
        fitView
        snapToGrid
        snapGrid={[16, 16]}
        defaultEdgeOptions={{
          animated: true,
          style: { strokeWidth: 2, stroke: "#c45b3d" },
        }}
        className="h-full w-full touch-none"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1.2} color="#8c7e73" />
        <Controls
          className="!bg-card/90 !border !rounded-xl !shadow-md !overflow-hidden !bottom-4 !left-4"
          showInteractive={false}
        />
        <MiniMap
          className="!bg-card/90 !border !rounded-xl !shadow-md !overflow-hidden !bottom-4 !right-4 !w-44 !h-28"
          nodeColor={(n) => {
            if (n.type === "stickyNote") return "#d97706";
            if (n.type === "groupBoundary") return "#738b6d";
            return "#c45b3d";
          }}
          maskColor="rgba(240, 237, 232, 0.6)"
        />
      </ReactFlow>
    </div>
  );
}

export function SketchCanvasView({ projectId }: SketchCanvasViewProps) {
  const [diagrams, setDiagrams] = React.useState<Diagram[]>([]);
  const [selectedDiagramId, setSelectedDiagramId] = React.useState<string | null>(null);
  const [isNewDialogOpen, setIsNewDialogOpen] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState("");
  const [newDesc, setNewDesc] = React.useState("");

  const project = EarthService.getProjectById(projectId);

  const loadDiagrams = React.useCallback(() => {
    const list = EarthService.getDiagrams(projectId);
    setDiagrams(list);
    if (list.length > 0 && !selectedDiagramId) {
      setSelectedDiagramId(list[0].id);
    }
  }, [projectId, selectedDiagramId]);

  React.useEffect(() => {
    loadDiagrams();
  }, [loadDiagrams]);

  const currentDiagram = diagrams.find((d) => d.id === selectedDiagramId) || diagrams[0];

  const handleCreateNewDiagram = (useTemplate = false) => {
    if (!newTitle.trim()) return;
    const created = EarthService.createDiagram({
      projectId,
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      type: "architecture",
      canvasData: useTemplate ? SAMPLE_STARTER_CANVAS : { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } },
      nodeCount: useTemplate ? SAMPLE_STARTER_CANVAS.nodes.length : 0,
      edgeCount: useTemplate ? SAMPLE_STARTER_CANVAS.edges.length : 0,
    });

    setNewTitle("");
    setNewDesc("");
    setIsNewDialogOpen(false);
    loadDiagrams();
    setSelectedDiagramId(created.id);
    toast.success("Created new sketch canvas");
  };

  return (
    <div className="flex-1 flex flex-col space-y-3">
      {!currentDiagram ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-card/40 rounded-xl border min-h-[500px]">
          <div className="h-16 w-16 rounded-2xl bg-earth-terracotta/10 text-earth-terracotta flex items-center justify-center mb-4">
            <PenTool className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-serif font-semibold text-foreground mb-2">
            No Diagrams in this Project Yet
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
            Create a visual architecture canvas for distributed system design, data pipelines, and infrastructure modeling.
          </p>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => {
                setNewTitle("System Architecture Diagram");
                handleCreateNewDiagram(false);
              }}
              className="bg-earth-terracotta hover:bg-earth-terracotta/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" /> Blank Canvas
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setNewTitle("Telemetry & Ingestion Architecture");
                handleCreateNewDiagram(true);
              }}
            >
              <Sparkles className="h-4 w-4 mr-2 text-earth-terracotta" /> Starter Template
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col h-[calc(100vh-190px)] w-full overflow-hidden rounded-xl border shadow-xs relative">
          <ReactFlowProvider>
            <CanvasInner
              projectId={projectId}
              currentDiagram={currentDiagram}
              diagrams={diagrams}
              onSelectDiagram={setSelectedDiagramId}
              onRefreshDiagrams={loadDiagrams}
            />
          </ReactFlowProvider>
        </div>
      )}

      {/* Dialog for New Canvas */}
      <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-base font-serif">Create New Diagram</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <label className="font-medium text-muted-foreground">Diagram Title</label>
              <Input
                placeholder="e.g. Ingestion Pipeline & Event Bus"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-muted-foreground">Description (Optional)</label>
              <Input
                placeholder="Scope, subsystem boundary, or RFC reference"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsNewDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCreateNewDiagram(true)}
              disabled={!newTitle.trim()}
            >
              With Starter Template
            </Button>
            <Button
              size="sm"
              className="bg-earth-terracotta hover:bg-earth-terracotta/90 text-white"
              onClick={() => handleCreateNewDiagram(false)}
              disabled={!newTitle.trim()}
            >
              Create Blank
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
