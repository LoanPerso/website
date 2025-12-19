import Link from "next/link";

import { marketingNav } from "@/_config/navigation";
import { NavLink } from "@/_components/nav-link";
import { Button } from "@/_components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="container flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between gap-6">
          <Link
            className="font-display text-lg font-semibold tracking-tight"
            href="/"
          >
            website
          </Link>
          <div className="hidden items-center gap-3 md:flex">
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              studio stack
            </span>
            <span className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">
              public
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
          <nav className="flex flex-wrap items-center gap-4">
            {marketingNav.map((item) => (
              <NavLink key={item.href} href={item.href} label={item.label} />
            ))}
          </nav>
          <Button asChild size="sm">
            <Link href="/dashboard">Espace admin</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
