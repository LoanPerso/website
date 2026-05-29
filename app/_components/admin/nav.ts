import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CreditCard,
  FileSignature,
  Inbox,
  LayoutDashboard,
  ListChecks,
  Mail,
  Package,
  Settings,
  Upload,
  Users,
  Wallet,
} from "lucide-react";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface AdminNavGroup {
  label?: string;
  items: AdminNavItem[];
}

// Sidebar grouped by business domain (workflow order: lead → client → financing → catalogue → system).
export const adminNavGroups: AdminNavGroup[] = [
  {
    items: [{ href: "/admin/dashboard", label: "Tableau de bord", icon: LayoutDashboard }],
  },
  {
    label: "CRM",
    items: [
      { href: "/admin/applications", label: "Demandes", icon: Inbox },
      { href: "/admin/clients", label: "Clients", icon: Users },
      { href: "/admin/tasks", label: "Tâches", icon: ListChecks },
    ],
  },
  {
    label: "Communication",
    items: [{ href: "/admin/mail", label: "Messagerie", icon: Mail }],
  },
  {
    label: "Financement",
    items: [
      { href: "/admin/loans", label: "Crédits", icon: CreditCard },
      { href: "/admin/contracts", label: "Contrats", icon: FileSignature },
      { href: "/admin/payments", label: "Paiements", icon: Wallet },
      { href: "/admin/overdue", label: "Impayés", icon: AlertTriangle },
    ],
  },
  {
    label: "Catalogue",
    items: [{ href: "/admin/products", label: "Produits", icon: Package }],
  },
  {
    label: "Système",
    items: [
      { href: "/admin/import", label: "Import", icon: Upload },
      { href: "/admin/settings", label: "Paramètres", icon: Settings },
    ],
  },
];

// Flat list (kept for any consumer that needs every destination).
export const adminNav: AdminNavItem[] = adminNavGroups.flatMap((g) => g.items);
