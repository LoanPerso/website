import Link from "next/link";
import { marketingNav } from "@/_config/navigation";
import { NavLink } from "@/_components/nav-link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="logo" href="/">
          website
        </Link>
        <nav className="nav">
          {marketingNav.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>
      </div>
    </header>
  );
}
