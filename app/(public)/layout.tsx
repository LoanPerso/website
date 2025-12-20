import { SiteFooter } from "@/_components/site-footer";
import { SiteHeader } from "@/_components/site-header";
import SmoothScroll from "@/_components/smooth-scroll";

type MarketingLayoutProps = {
  children: React.ReactNode;
};

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <SmoothScroll>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </SmoothScroll>
  );
}
