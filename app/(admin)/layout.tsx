import { AppShell } from "@/_components/app-shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client area",
  robots: { index: false, follow: false },
};

type AppLayoutProps = {
  children: React.ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  return <AppShell>{children}</AppShell>;
}
