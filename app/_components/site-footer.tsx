export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="container flex flex-col gap-2 py-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <span>Website</span>
        <span>Next.js, Tailwind, Supabase, Firebase, Radix, shadcn</span>
      </div>
    </footer>
  );
}
