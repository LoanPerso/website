"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/_lib/utils";

type NavLinkProps = {
  href: string;
  label: string;
};

export function NavLink({ href, label }: NavLinkProps) {
  const pathname = usePathname();
  const isActive =
    pathname === href ||
    (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <Link
      className={cn(
        "text-sm font-medium text-muted-foreground transition hover:text-foreground",
        isActive && "text-foreground"
      )}
      href={href}
    >
      {label}
    </Link>
  );
}
