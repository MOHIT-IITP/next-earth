"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  CheckSquare,
  FileText,
  Network,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EarthService } from "@/services/earth-service";
import { RelatedItemReference } from "@/services/types";
import { cn } from "@/lib/utils";

interface ProjectSearchDialogProps {
  projectId: string;
  projectName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectSearchDialog({
  projectId,
  projectName,
  open,
  onOpenChange,
}: ProjectSearchDialogProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<"all" | "task" | "note" | "diagram">("all");
  const [results, setResults] = React.useState<RelatedItemReference[]>([]);

  React.useEffect(() => {
    if (open) {
      const items = EarthService.searchProjectItems(projectId, query, filter);
      setResults(items);
    }
  }, [open, projectId, query, filter]);

  const handleSelect = (item: RelatedItemReference) => {
    onOpenChange(false);
    router.push(item.href);
  };

  const renderIcon = (type: "task" | "note" | "diagram") => {
    if (type === "task") return <CheckSquare className="h-4 w-4 text-earth-olive" />;
    if (type === "note") return <FileText className="h-4 w-4 text-earth-terracotta" />;
    return <Network className="h-4 w-4 text-earth-charcoal dark:text-earth-cream" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2 border-b">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-earth-terracotta shrink-0" />
            <DialogTitle className="text-sm font-medium font-serif">
              Search in {projectName}
            </DialogTitle>
          </div>
          <div className="pt-2">
            <Input
              placeholder="Search tasks, research notes, diagrams..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 text-xs"
              autoFocus
            />
          </div>
          <div className="flex gap-1.5 pt-2">
            {(["all", "task", "note", "diagram"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilter(t)}
                className={cn(
                  "px-2.5 py-0.5 rounded-full text-[11px] capitalize transition-colors",
                  filter === t
                    ? "bg-earth-terracotta text-white font-medium"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {t === "all" ? "All Types" : t}
              </button>
            ))}
          </div>
        </DialogHeader>

        <div className="max-h-[360px] overflow-y-auto p-3 space-y-1 text-xs">
          {results.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              No project items matching &ldquo;{query}&rdquo;
            </div>
          ) : (
            results.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-accent/80 transition-colors text-left group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                  <div className="p-1.5 rounded-md bg-muted/60 shrink-0">
                    {renderIcon(item.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground truncate group-hover:text-earth-terracotta">
                        {item.title}
                      </span>
                      <Badge variant="outline" className="text-[9px] uppercase px-1 py-0">
                        {item.type}
                      </Badge>
                    </div>
                    {item.subtitle && (
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <span>Open</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </button>
            ))
          )}
        </div>

        <div className="p-2.5 border-t bg-muted/20 text-[10px] text-muted-foreground flex justify-between items-center px-4">
          <span>{results.length} results in {projectName}</span>
          <kbd className="px-1.5 py-0.5 bg-muted rounded border text-[9px] font-mono">ESC to close</kbd>
        </div>
      </DialogContent>
    </Dialog>
  );
}
