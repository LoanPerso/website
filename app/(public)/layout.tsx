import { SiteFooter } from "@/_components/site-footer";
import { SiteHeader } from "@/_components/site-header";

type MarketingLayoutProps = {
  children: React.ReactNode;
};

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="marketing-layout">
      <SiteHeader />
      <main className="marketing-main">{children}</main>
      <SiteFooter />
    </div>
  );
}
