"use client";

import * as React from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  FileCode,
  Link as LinkIcon,
  Table as TableIcon,
  Minus,
  Eye,
  Edit3,
  Columns as SplitIcon,
  Save,
  Check,
  Clock,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RichEditorProps {
  initialContent: string;
  onSave: (content: string) => void;
  onSelectionChange?: (selectedText: string) => void;
  saveStatus: "saving" | "saved" | "unsaved" | "error";
  lastSavedAt?: Date | null;
}

export function RichEditor({
  initialContent,
  onSave,
  onSelectionChange,
  saveStatus,
  lastSavedAt,
}: RichEditorProps) {
  const [content, setContent] = React.useState(initialContent);
  const [viewMode, setViewMode] = React.useState<"edit" | "preview" | "split">("edit");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Synchronize when a new note is selected from sidebar
  React.useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  // Debounced Autosave (600ms after last typing)
  React.useEffect(() => {
    if (content === initialContent) return;
    const timer = setTimeout(() => {
      onSave(content);
    }, 600);
    return () => clearTimeout(timer);
  }, [content, initialContent, onSave]);

  // Track text selection for "Create task from selected note content"
  const handleSelect = () => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    if (start !== end) {
      const selected = content.slice(start, end);
      onSelectionChange?.(selected);
    } else {
      onSelectionChange?.("");
    }
  };

  // Helper to apply formatting to selected text
  const applyFormat = (prefix: string, suffix: string = "", placeholder: string = "text") => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.slice(start, end) || placeholder;

    const before = content.slice(0, start);
    const after = content.slice(end);

    const replacement = `${prefix}${selected}${suffix}`;
    const newContent = `${before}${replacement}${after}`;

    setContent(newContent);
    onSave(newContent);

    // Reposition cursor
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selected.length
      );
    }, 0);
  };

  const applyBlockFormat = (linePrefix: string) => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = content;

    // Find start of current line
    const lastNewline = text.lastIndexOf("\n", start - 1);
    const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;

    const before = text.slice(0, lineStart);
    const after = text.slice(lineStart);

    const newContent = `${before}${linePrefix} ${after}`;
    setContent(newContent);
    onSave(newContent);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + linePrefix.length + 1, end + linePrefix.length + 1);
    }, 0);
  };

  // Keyboard Shortcuts (⌘B, ⌘I, ⌘S)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.metaKey || e.ctrlKey) {
      if (e.key === "b") {
        e.preventDefault();
        applyFormat("**", "**", "bold text");
      } else if (e.key === "i") {
        e.preventDefault();
        applyFormat("*", "*", "italic text");
      } else if (e.key === "s") {
        e.preventDefault();
        onSave(content);
      }
    }
  };

  // Safe Simple Markdown Renderer (Zero external vulnerabilities)
  const renderFormattedPreview = (md: string) => {
    if (!md.trim()) {
      return (
        <div className="py-12 text-center text-sm text-muted-foreground italic">
          Note is currently blank. Type formatting on the left or switch to Edit mode.
        </div>
      );
    }

    const lines = md.split("\n");
    let inCodeBlock = false;
    let codeBuffer: string[] = [];

    const elements: React.ReactNode[] = [];

    lines.forEach((line, index) => {
      // Code blocks
      if (line.startsWith("```")) {
        if (inCodeBlock) {
          inCodeBlock = false;
          elements.push(
            <pre
              key={`code-${index}`}
              className="my-3 p-3.5 rounded-lg bg-earth-charcoal text-earth-ivory dark:bg-card border border-border font-mono text-xs overflow-x-auto leading-relaxed"
            >
              <code>{codeBuffer.join("\n")}</code>
            </pre>
          );
          codeBuffer = [];
        } else {
          inCodeBlock = true;
          codeBuffer = [];
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      // Headings
      if (line.startsWith("# ")) {
        elements.push(
          <h1 key={index} className="font-serif text-3xl font-normal text-foreground mt-6 mb-2 tracking-tight">
            {line.slice(2)}
          </h1>
        );
        return;
      }
      if (line.startsWith("## ")) {
        elements.push(
          <h2 key={index} className="font-serif text-2xl font-normal text-foreground mt-5 mb-2 tracking-tight">
            {line.slice(3)}
          </h2>
        );
        return;
      }
      if (line.startsWith("### ")) {
        elements.push(
          <h3 key={index} className="font-serif text-xl font-normal text-foreground mt-4 mb-1.5">
            {line.slice(4)}
          </h3>
        );
        return;
      }

      // Checklists
      if (line.startsWith("- [x] ") || line.startsWith("- [ ] ")) {
        const checked = line.startsWith("- [x] ");
        elements.push(
          <div key={index} className="flex items-center gap-2 my-1 text-sm text-foreground">
            <span
              className={cn(
                "h-4 w-4 rounded flex items-center justify-center text-[10px] border",
                checked
                  ? "bg-earth-olive border-earth-olive text-white"
                  : "border-input"
              )}
            >
              {checked && <Check className="h-3 w-3" />}
            </span>
            <span className={cn(checked && "line-through text-muted-foreground")}>
              {line.slice(6)}
            </span>
          </div>
        );
        return;
      }

      // Blockquotes
      if (line.startsWith("> ")) {
        elements.push(
          <blockquote
            key={index}
            className="my-3 pl-3.5 border-l-2 border-earth-terracotta italic text-sm text-muted-foreground"
          >
            {line.slice(2)}
          </blockquote>
        );
        return;
      }

      // Bullet Lists
      if (line.startsWith("* ") || line.startsWith("- ")) {
        elements.push(
          <li key={index} className="ml-5 list-disc text-sm text-foreground/90 my-0.5">
            {line.slice(2)}
          </li>
        );
        return;
      }

      // Numbered Lists
      if (/^\d+\.\s/.test(line)) {
        const text = line.replace(/^\d+\.\s/, "");
        elements.push(
          <li key={index} className="ml-5 list-decimal text-sm text-foreground/90 my-0.5">
            {text}
          </li>
        );
        return;
      }

      // Dividers
      if (line.trim() === "---" || line.trim() === "***") {
        elements.push(<hr key={index} className="my-4 border-border/80" />);
        return;
      }

      // Blank line
      if (!line.trim()) {
        elements.push(<div key={index} className="h-2" />);
        return;
      }

      // Standard Paragraph
      elements.push(
        <p key={index} className="text-sm leading-relaxed text-foreground/90 my-1">
          {line}
        </p>
      );
    });

    return <div className="space-y-1.5 max-w-3xl mx-auto leading-relaxed">{elements}</div>;
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-border bg-card overflow-hidden shadow-2xs">
      {/* Editor Toolbar Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 border-b border-border bg-card/90 backdrop-blur-xs">
        {/* Formatting Actions */}
        <div className="flex flex-wrap items-center gap-0.5">
          {/* Headings */}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => applyBlockFormat("#")}
            title="Heading 1 (#)"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <Heading1 className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => applyBlockFormat("##")}
            title="Heading 2 (##)"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <Heading2 className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => applyBlockFormat("###")}
            title="Heading 3 (###)"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <Heading3 className="h-3.5 w-3.5" />
          </Button>

          <div className="h-4 w-px bg-border mx-1" />

          {/* Inline styles */}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => applyFormat("**", "**", "bold text")}
            title="Bold (⌘B)"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <Bold className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => applyFormat("*", "*", "italic text")}
            title="Italic (⌘I)"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <Italic className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => applyFormat("~~", "~~", "strikethrough text")}
            title="Strikethrough"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <Strikethrough className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => applyFormat("`", "`", "code")}
            title="Inline Code"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <Code className="h-3.5 w-3.5" />
          </Button>

          <div className="h-4 w-px bg-border mx-1" />

          {/* Lists & blocks */}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => applyBlockFormat("*")}
            title="Bullet List"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <List className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => applyBlockFormat("1.")}
            title="Numbered List"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => applyBlockFormat("- [ ]")}
            title="Checklist Item"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <CheckSquare className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => applyBlockFormat(">")}
            title="Blockquote"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <Quote className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => applyFormat("```\n", "\n```", "code block")}
            title="Code Block"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <FileCode className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => applyFormat("[", "](https://earth.org)", "link title")}
            title="Insert Link"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <LinkIcon className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() =>
              setContent(
                (prev) =>
                  prev +
                  "\n\n| Observation Metric | Value | Baseline |\n| :--- | :--- | :--- |\n| Canopy Density | 78% | 65% |\n| Volumetric Soil H2O | 21.4% | 18.0% |\n\n"
              )
            }
            title="Insert Observation Table Template"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <TableIcon className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setContent((prev) => prev + "\n\n---\n\n")}
            title="Horizontal Divider"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Right Action Group: View mode switchers & Autosave status indicator */}
        <div className="flex items-center gap-3">
          {/* Autosave Status Indicator */}
          <div className="flex items-center gap-1.5 text-xs">
            {saveStatus === "saving" && (
              <span className="flex items-center gap-1 text-earth-terracotta font-medium animate-pulse">
                <Clock className="h-3 w-3" />
                <span>Saving...</span>
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="flex items-center gap-1 text-earth-olive font-medium">
                <Check className="h-3 w-3" />
                <span>Saved</span>
              </span>
            )}
            {saveStatus === "error" && (
              <button
                type="button"
                onClick={() => onSave(content)}
                className="flex items-center gap-1 text-destructive font-medium hover:underline text-[11px]"
                title="Failed to save. Click to retry."
              >
                <AlertCircle className="h-3 w-3" />
                <span>Save failed · Retry</span>
              </button>
            )}
            {saveStatus === "unsaved" && (
              <button
                type="button"
                onClick={() => onSave(content)}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground underline text-[11px]"
              >
                <Save className="h-3 w-3" />
                <span>Save</span>
              </button>
            )}
          </div>

          {/* Mode Switcher */}
          <div className="inline-flex rounded-lg border border-border bg-background p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("edit")}
              className={cn(
                "p-1 rounded-md transition-colors",
                viewMode === "edit"
                  ? "bg-earth-cream text-earth-charcoal dark:bg-muted dark:text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Edit View"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={cn(
                "p-1 rounded-md transition-colors",
                viewMode === "preview"
                  ? "bg-earth-cream text-earth-charcoal dark:bg-muted dark:text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Preview Formatted Output"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={cn(
                "hidden md:block p-1 rounded-md transition-colors",
                viewMode === "split"
                  ? "bg-earth-cream text-earth-charcoal dark:bg-muted dark:text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Split Edit & Preview View"
            >
              <SplitIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Editing / Preview Body */}
      <div className="flex-1 flex min-h-[460px] overflow-hidden">
        {/* Editor Pane */}
        {(viewMode === "edit" || viewMode === "split") && (
          <div
            className={cn(
              "flex-1 flex flex-col p-4 sm:p-6 bg-background/50 overflow-y-auto",
              viewMode === "split" && "border-r border-border"
            )}
          >
            <div className={cn("w-full flex-1 flex flex-col", viewMode === "edit" && "max-w-3xl mx-auto")}>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onSelect={handleSelect}
                onKeyDown={handleKeyDown}
                placeholder="Record field observations, protocol steps, botanical taxonomy..."
                className="flex-1 w-full bg-transparent resize-none border-none outline-none font-mono text-xs sm:text-sm text-foreground leading-relaxed placeholder:text-muted-foreground/50 focus:ring-0 min-h-[380px]"
                spellCheck={false}
              />
            </div>
          </div>
        )}

        {/* Formatted Preview Pane */}
        {(viewMode === "preview" || viewMode === "split") && (
          <div className="flex-1 p-6 sm:p-8 overflow-y-auto bg-card/60">
            <div className={cn("w-full", viewMode === "preview" && "max-w-3xl mx-auto")}>
              {renderFormattedPreview(content)}
            </div>
          </div>
        )}
      </div>

      {/* Editor Footer: Word Count, Char Count, Shortcuts Hint */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border/60 text-[11px] text-muted-foreground bg-muted/20 font-mono">
        <div className="flex items-center gap-3">
          <span>
            {content.trim() ? content.trim().split(/\s+/).length : 0} words
          </span>
          <span>&bull;</span>
          <span>{content.length} characters</span>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span>⌘B Bold</span>
          <span>&bull;</span>
          <span>⌘I Italic</span>
          <span>&bull;</span>
          <span>⌘S Save</span>
        </div>
      </div>
    </div>
  );
}
