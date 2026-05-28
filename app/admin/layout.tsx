import type { Metadata } from "next";
import { AdminAuthProvider } from "@/_components/admin/auth-provider";
import { ToastProvider } from "@/_components/admin/toast";

export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <ToastProvider>{children}</ToastProvider>
    </AdminAuthProvider>
  );
}
