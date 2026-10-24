"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon-sm"
        className={className}
        aria-label="Toggle theme placeholder"
        disabled
      >
        <span className="h-4 w-4" />
      </Button>
    );
  }

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const getLabel = () => {
    if (theme === "light") return "Theme: Light (click for Dark)";
    if (theme === "dark") return "Theme: Dark (click for System)";
    return "Theme: System (click for Light)";
  };

  return (
    <Button
      variant="outline"
      size="icon-sm"
      className={className}
      onClick={cycleTheme}
      title={getLabel()}
      aria-label={getLabel()}
    >
      {theme === "dark" ? (
        <Moon className="h-4 w-4 text-earth-terracotta transition-transform" />
      ) : theme === "light" ? (
        <Sun className="h-4 w-4 text-earth-terracotta transition-transform" />
      ) : (
        <Monitor className="h-4 w-4 text-earth-olive transition-transform" />
      )}
    </Button>
  );
}
