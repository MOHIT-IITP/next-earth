"use client";

import * as React from "react";
import {
  Search,
  Plus,
  FileText,
  Tag,
  ArrowUpDown,
  MoreVertical,
  Copy,
  Trash2,
  Edit2,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Note } from "@/services/types";
import { cn } from "@/lib/utils";

interface NotesSidebarProps {
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (noteId: string) => void;
  onNewNote: () => void;
  onDuplicateNote: (noteId: string) => void;
  onDeleteNote: (noteId: string) => void;
  onRenameNote: (noteId: string, currentTitle: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedTag: string;
  onTagSelect: (tag: string) => void;
  sortBy: "updated" | "created" | "title";
  onSortChange: (sort: "updated" | "created" | "title") => void;
  allTags: string[];
}

export function NotesSidebar({
  notes,
  activeNoteId,
  onSelectNote,
  onNewNote,
  onDuplicateNote,
  onDeleteNote,
  onRenameNote,
  searchQuery,
  onSearchChange,
  selectedTag,
  onTagSelect,
  sortBy,
  onSortChange,
  allTags,
}: NotesSidebarProps) {
  return (
    <div className="flex flex-col h-full rounded-2xl border border-border bg-card/70 overflow-hidden shadow-2xs">
      {/* Sidebar Header: Title & New Note Button */}
      <div className="flex items-center justify-between p-4 border-b border-border/80">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-earth-terracotta" />
          <h3 className="font-serif text-lg font-normal text-foreground">
            Knowledge Base
          </h3>
          <Badge variant="muted" size="sm" className="font-mono text-[10px] px-1.5 py-0">
            {notes.length}
          </Badge>
        </div>

        <Button size="sm" onClick={onNewNote} className="h-8 gap-1 text-xs">
          <Plus className="h-3.5 w-3.5" />
          <span>New Note</span>
        </Button>
      </div>

      {/* Search Input & Sort Selector */}
      <div className="p-3 space-y-2 border-b border-border/60 bg-background/50">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search notes &amp; text..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-8 text-xs bg-background"
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-mono text-muted-foreground uppercase">
            Sort Order:
          </span>
          <Select
            value={sortBy}
            onValueChange={(v) => onSortChange(v as typeof sortBy)}
          >
            <SelectTrigger className="h-7 text-[11px] bg-background w-[140px]">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated">Recently Edited</SelectItem>
              <SelectItem value="created">Recently Created</SelectItem>
              <SelectItem value="title">Title (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tag Filter Pills */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1 max-h-20 overflow-y-auto">
            <button
              type="button"
              onClick={() => onTagSelect("all")}
              className={cn(
                "text-[10px] px-2 py-0.5 rounded-full transition-colors",
                selectedTag === "all"
                  ? "bg-earth-terracotta text-white font-medium"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onTagSelect(tag)}
                className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full transition-colors",
                  selectedTag === tag
                    ? "bg-earth-terracotta text-white font-medium"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 divide-y divide-transparent">
        {notes.length === 0 ? (
          <div className="py-12 px-4 text-center text-xs text-muted-foreground space-y-2">
            <p>No notes matching your search.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={onNewNote}
              className="text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Create New Note
            </Button>
          </div>
        ) : (
          notes.map((note) => {
            const isActive = note.id === activeNoteId;
            // Clean markdown tokens from excerpt
            const excerpt = note.content
              .replace(/^#+\s+/gm, "")
              .replace(/[*_~`]/g, "")
              .slice(0, 90);

            return (
              <div
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                className={cn(
                  "group relative flex flex-col p-3 rounded-xl border transition-all cursor-pointer text-left select-none",
                  isActive
                    ? "border-earth-terracotta bg-earth-terracotta-light/30 dark:bg-earth-terracotta-light/10 shadow-2xs"
                    : "border-border/60 bg-card/60 hover:border-earth-sand hover:bg-card"
                )}
              >
                {/* Note Header: Title & Actions dropdown */}
                <div className="flex items-start justify-between gap-1">
                  <h4
                    className={cn(
                      "font-serif text-sm font-medium line-clamp-1 flex-1",
                      isActive ? "text-earth-terracotta-dark dark:text-earth-terracotta" : "text-foreground"
                    )}
                  >
                    {note.title}
                  </h4>

                  <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground opacity-60 group-hover:opacity-100 transition-opacity"
                          aria-label="Note options"
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => onRenameNote(note.id, note.title)}>
                          <Edit2 className="mr-2 h-3.5 w-3.5" />
                          <span>Rename</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDuplicateNote(note.id)}>
                          <Copy className="mr-2 h-3.5 w-3.5" />
                          <span>Duplicate</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDeleteNote(note.id)}
                          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Excerpt */}
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                  {excerpt || "Empty document..."}
                </p>

                {/* Tags & Timestamp Footer */}
                <div className="flex items-center justify-between pt-2 mt-2 border-t border-border/40 text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-1 overflow-hidden truncate">
                    {note.tags.slice(0, 2).map((t) => (
                      <span key={t} className="truncate">
                        #{t}
                      </span>
                    ))}
                    {note.tags.length > 2 && <span>+{note.tags.length - 2}</span>}
                  </div>
                  <span className="shrink-0 font-mono">
                    {new Date(note.updatedAt).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
