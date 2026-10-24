"use client";

import * as React from "react";
import { Search, Filter, X, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskPriority, TaskType, KanbanColumn } from "@/services/types";

export interface BoardFilters {
  search: string;
  columnId: string;
  priority: string;
  type: string;
  label: string;
  sortBy: "order" | "priority" | "dueDate" | "title";
}

interface BoardFilterBarProps {
  filters: BoardFilters;
  columns: KanbanColumn[];
  allLabels: string[];
  onFiltersChange: (newFilters: BoardFilters) => void;
  onClearFilters: () => void;
}

export function BoardFilterBar({
  filters,
  columns,
  allLabels,
  onFiltersChange,
  onClearFilters,
}: BoardFilterBarProps) {
  const hasActiveFilters =
    Boolean(filters.search) ||
    filters.columnId !== "all" ||
    filters.priority !== "all" ||
    filters.type !== "all" ||
    filters.label !== "all" ||
    filters.sortBy !== "order";

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-card/70 border border-border p-3 rounded-xl shadow-2xs">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search board tasks, titles, labels..."
          value={filters.search}
          onChange={(e) =>
            onFiltersChange({ ...filters, search: e.target.value })
          }
          className="pl-9 h-8 text-xs bg-background/80"
        />
      </div>

      {/* Filter Selectors */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status / Column Filter */}
        <Select
          value={filters.columnId}
          onValueChange={(val) =>
            onFiltersChange({ ...filters, columnId: val })
          }
        >
          <SelectTrigger className="h-8 text-xs w-[120px] bg-background">
            <SelectValue placeholder="Column" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Columns</SelectItem>
            {columns.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select
          value={filters.priority}
          onValueChange={(val) =>
            onFiltersChange({ ...filters, priority: val })
          }
        >
          <SelectTrigger className="h-8 text-xs w-[110px] bg-background">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        {/* Type Filter */}
        <Select
          value={filters.type}
          onValueChange={(val) => onFiltersChange({ ...filters, type: val })}
        >
          <SelectTrigger className="h-8 text-xs w-[110px] bg-background">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="research">Research</SelectItem>
            <SelectItem value="feature">Feature</SelectItem>
            <SelectItem value="enhancement">Enhancement</SelectItem>
            <SelectItem value="bug">Bug</SelectItem>
            <SelectItem value="chore">Chore</SelectItem>
          </SelectContent>
        </Select>

        {/* Label Filter */}
        {allLabels.length > 0 && (
          <Select
            value={filters.label}
            onValueChange={(val) =>
              onFiltersChange({ ...filters, label: val })
            }
          >
            <SelectTrigger className="h-8 text-xs w-[110px] bg-background">
              <SelectValue placeholder="Label" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Labels</SelectItem>
              {allLabels.map((lbl) => (
                <SelectItem key={lbl} value={lbl}>
                  #{lbl}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Sort Selector */}
        <Select
          value={filters.sortBy}
          onValueChange={(val) =>
            onFiltersChange({ ...filters, sortBy: val as BoardFilters["sortBy"] })
          }
        >
          <SelectTrigger className="h-8 text-xs w-[130px] bg-background gap-1">
            <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="order">Custom Order</SelectItem>
            <SelectItem value="priority">Priority (Urgent first)</SelectItem>
            <SelectItem value="dueDate">Due Date</SelectItem>
            <SelectItem value="title">Title (A-Z)</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
