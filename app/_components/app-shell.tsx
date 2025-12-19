import Link from "next/link";
import { appNav } from "@/_config/navigation";
import { NavLink } from "@/_components/nav-link";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <Link className="logo" href="/">
          website
        </Link>
        <div className="app-sidebar-links">
          {appNav.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} />
          ))}
        </div>
      </aside>
      <main className="app-main">{children}</main>
    </div>
  );
}
