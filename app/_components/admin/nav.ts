import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowDownUp,
  BarChart3,
  Boxes,
  Contact,
  CreditCard,
  FileSignature,
  Filter,
  Inbox,
  Layers,
  LayoutDashboard,
  ListChecks,
  Mail,
  Package,
  PieChart,
  Settings,
  ShieldAlert,
  Siren,
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
    label: "Statistiques",
    items: [
      { href: "/admin/stats/portfolio", label: "Portfolio", icon: PieChart },
      { href: "/admin/stats/risk", label: "Risque & scoring", icon: ShieldAlert },
      { href: "/admin/stats/collections", label: "Recouvrement", icon: Siren },
      { href: "/admin/stats/cashflow", label: "Cashflow", icon: ArrowDownUp },
      { href: "/admin/stats/vintages", label: "Cohortes", icon: Layers },
      { href: "/admin/stats/products", label: "Produits", icon: Boxes },
      { href: "/admin/stats/clients", label: "Clients", icon: Contact },
      { href: "/admin/stats/funnel", label: "Origination", icon: Filter },
    ],
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
      { href: "/admin/finance", label: "Finances (P&L)", icon: BarChart3 },
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
