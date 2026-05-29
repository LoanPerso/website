"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/_components/theme-provider";

export function ThemeToggle() {
  const { resolved, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={resolved === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
      title={resolved === "dark" ? "Mode clair" : "Mode sombre"}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
    >
      {resolved === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
