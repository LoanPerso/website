import Link from "next/link";
import { appNav } from "@/_config/navigation";
import { NavLink } from "@/_components/nav-link";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[240px,1fr]">
        <aside className="border-border bg-secondary/40 p-6 lg:border-r">
          <Link className="font-serif text-lg font-semibold tracking-tight" href="/">
            <span className="font-medium">Quick</span>fund
          </Link>
          <div className="mt-6 flex flex-col gap-3">
            {appNav.map((item) => (
              <NavLink key={item.href} href={item.href} label={item.label} />
            ))}
          </div>
        </aside>
        <main className="px-6 py-10 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
