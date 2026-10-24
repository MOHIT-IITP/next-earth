"use client";

import * as React from "react";
import {
  Activity,
  FolderKanban,
  CheckSquare,
  FileText,
  Network,
  Link as LinkIcon,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { EarthService } from "@/services/earth-service";
import { ActivityItem } from "@/services/types";
import { cn } from "@/lib/utils";

interface ProjectActivityDialogProps {
  projectId: string;
  projectName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectActivityDialog({
  projectId,
  projectName,
  open,
  onOpenChange,
}: ProjectActivityDialogProps) {
  const [activities, setActivities] = React.useState<ActivityItem[]>([]);

  React.useEffect(() => {
    if (open) {
      const items = EarthService.getProjectActivities(projectId, 30);
      setActivities(items);
    }
  }, [open, projectId]);

  const renderIcon = (type: string) => {
    switch (type) {
      case "project":
        return <FolderKanban className="h-3.5 w-3.5 text-earth-olive" />;
      case "task":
        return <CheckSquare className="h-3.5 w-3.5 text-earth-olive" />;
      case "note":
        return <FileText className="h-3.5 w-3.5 text-earth-terracotta" />;
      case "diagram":
        return <Network className="h-3.5 w-3.5 text-earth-terracotta" />;
      case "link":
        return <LinkIcon className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />;
      default:
        return <Activity className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b bg-muted/20">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-earth-olive" />
            <DialogTitle className="text-sm font-medium font-serif">
              Project Activity Feed
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Auditable timeline of task updates, knowledge revisions, diagrams, and relationship changes in {projectName}.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[400px] overflow-y-auto p-4 space-y-4">
          {activities.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground italic">
              No logged activities recorded for this territory yet.
            </div>
          ) : (
            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-border">
              {activities.map((act) => (
                <div key={act.id} className="relative group text-xs">
                  <div className="absolute -left-6 top-0.5 h-4 w-4 rounded-full bg-background border flex items-center justify-center">
                    {renderIcon(act.iconType)}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-medium text-foreground">{act.user}</span>
                      <span className="text-muted-foreground">{act.action}</span>
                      <span className="font-semibold text-foreground truncate max-w-[200px]">
                        {act.target}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-2.5 w-2.5" />
                      <span>{act.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
