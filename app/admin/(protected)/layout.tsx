import { AdminGuard } from "@/_components/admin/admin-guard";
import { AdminShell } from "@/_components/admin/admin-shell";

export default function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <AdminShell>{children}</AdminShell>
    </AdminGuard>
  );
}
